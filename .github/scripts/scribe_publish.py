#!/usr/bin/env python3
"""Drain Supabase publisher_queue → files in repo → commit + push.

OpenHermit-allow-list aware. Refuses any file_path not under one of:
  - src/content/blog/
  - src/data/blog-metadata.ts
  - public/
  - docs/

Idempotent: rows are only marked published after a successful git push.
"""
from __future__ import annotations
import json
import os
import subprocess
import sys
import urllib.parse
import urllib.request
from pathlib import Path

SB_URL = os.environ["SUPABASE_URL"].rstrip("/")
SB_KEY = os.environ["SUPABASE_SERVICE_ROLE"]
REPO_ROOT = Path(__file__).resolve().parents[2]

HEADERS = {
    "apikey": SB_KEY,
    "Authorization": f"Bearer {SB_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

ALLOWED_PATH_PREFIXES = (
    "src/content/blog/",
    "public/",
    "PUBLISH-LOG.md",
)


def http(method: str, path: str, body=None) -> tuple[int, bytes]:
    req = urllib.request.Request(
        f"{SB_URL}{path}",
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers=HEADERS,
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def fetch_pending(limit: int = 50) -> list[dict]:
    # Shared digitalawards Supabase: filter by project so loaded.ch only
    # picks up its own rows.
    project = os.environ.get("SCRIBE_PROJECT", "relofinder")
    qs = urllib.parse.urlencode({
        "select": "*",
        "published_at": "is.null",
        "project": f"eq.{project}",
        "order": "created_at.asc",
        "limit": str(limit),
    })
    code, body = http("GET", f"/rest/v1/publisher_queue?{qs}")
    if code != 200:
        print(f"fetch_pending: HTTP {code} {body!r}", file=sys.stderr)
        sys.exit(1)
    return json.loads(body)


def safe_path(p: str) -> Path:
    target = (REPO_ROOT / p).resolve()
    if REPO_ROOT not in target.parents and target != REPO_ROOT:
        raise ValueError(f"refused unsafe path: {p}")
    return target


def path_allowed(p: str) -> bool:
    return any(p == prefix or p.startswith(prefix) for prefix in ALLOWED_PATH_PREFIXES)



# -----------------------------------------------------------------------------
# Frontmatter pre-validation (added 2026-05-13) — catches the universal failure
# patterns BEFORE the row reaches Vercel. Brand-agnostic: only checks structural
# bugs (malformed YAML, date-typed fields that aren't dates, empty enums). The
# Astro Zod schema still catches brand-specific bugs at build time; this just
# stops the most common ones from getting that far.
# -----------------------------------------------------------------------------
import re as _re

DATE_FIELDS = ("pubDate", "publishedAt", "publishDate", "date", "updatedDate",
               "updatedAt", "lastModified", "scoredAt")
ENUM_FIELDS = ("category", "contentType", "kind", "actor", "language", "lang", "locale")


def _parse_frontmatter(text):
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 4)
    if end < 0:
        return None
    fm_text = text[4:end].lstrip("\n")
    out = {}
    current_key = None
    for raw in fm_text.splitlines():
        line = raw.rstrip()
        if not line or line.startswith("#"):
            continue
        if line.startswith((" ", "\t")):
            if current_key and isinstance(out.get(current_key), list):
                item = line.lstrip()
                if item.startswith("- "):
                    out[current_key].append(item[2:].strip().strip("\"\'"))
            continue
        if ":" not in line:
            continue
        key, _, val = line.partition(":")
        key = key.strip(); val = val.strip()
        current_key = key
        if val in ("", ">-", ">", "|", "|-"):
            out[key] = []
            continue
        if val.startswith("["):
            inner = val.strip("[]").strip()
            out[key] = [x.strip().strip("\"\'") for x in inner.split(",") if x.strip()]
        else:
            out[key] = val.strip("\"\'")
    return out


def validate_frontmatter(fp, content):
    """Return None if valid; else an error string. Only validates .md/.mdx."""
    if not (fp.endswith(".md") or fp.endswith(".mdx")):
        return None
    fm = _parse_frontmatter(content)
    if fm is None:
        return "no frontmatter found (expected YAML between '---' markers)"
    errs = []
    # Date-typed fields must be parseable date strings, not dict/list/empty
    for k in DATE_FIELDS:
        if k in fm:
            v = fm[k]
            if not isinstance(v, str) or not _re.match(r"^\d{4}-\d{2}-\d{2}", v):
                errs.append(f"field {k!r} must be YYYY-MM-DD date string (got {type(v).__name__}: {v!r})")
    # Enum-typed fields must be present, non-empty strings (Astro Zod enums reject empty/None)
    for k in ENUM_FIELDS:
        if k in fm:
            v = fm[k]
            if not isinstance(v, str) or v.strip() == "":
                errs.append(f"field {k!r} must be a non-empty string (got {type(v).__name__}: {v!r})")
    return "; ".join(errs) if errs else None

def write_one(row: dict) -> tuple[bool, str | None]:
    fp = row["file_path"]
    if not path_allowed(fp):
        return False, f"path not in allow-list: {fp}"
    # Pre-validate frontmatter before write — keeps schema bugs out of Vercel
    if not row.get("append") and (row.get("metadata") or {}).get("encoding") != "base64":
        verr = validate_frontmatter(fp, row.get("content", ""))
        if verr:
            return False, f"frontmatter validation failed: {verr}"
    try:
        target = safe_path(fp)
    except ValueError as e:
        return False, str(e)
    target.parent.mkdir(parents=True, exist_ok=True)
    content = row["content"]
    if row.get("append"):
        prev = target.read_text() if target.exists() else ""
        sep = "" if prev.endswith("\n") or prev == "" else "\n"
        target.write_text(prev + sep + content)
    else:
        target.write_text(content)
    return True, None


def git(*args: str, check: bool = True) -> subprocess.CompletedProcess:
    return subprocess.run(["git", "-C", str(REPO_ROOT), *args], check=check, capture_output=True, text=True)


def mark_results(updates: list[dict]) -> None:
    for upd in updates:
        row_id = upd.pop("id")
        qs = urllib.parse.urlencode({"id": f"eq.{row_id}"})
        http("PATCH", f"/rest/v1/publisher_queue?{qs}", upd)


def build_commit_message(rows: list[dict]) -> str:
    parts = []
    for r in rows:
        m = r.get("commit_message")
        if m:
            parts.append(m)
        else:
            parts.append(f"{r['kind']}: {r['file_path']}")
    if len(parts) == 1:
        return parts[0]
    return f"scribe: {len(rows)} updates\n\n" + "\n".join(f"- {p}" for p in parts)


def main() -> int:
    rows = fetch_pending()
    if not rows:
        print("queue empty")
        return 0

    written: list[dict] = []
    errors: list[dict] = []
    for r in rows:
        ok, err = write_one(r)
        if ok:
            written.append(r)
        else:
            errors.append({"id": r["id"], "error": err, "attempts": r.get("attempts", 0) + 1})

    if errors:
        mark_results(errors)
        print(f"recorded {len(errors)} error(s)")

    if not written:
        print("no writes")
        return 0

    git("add", "-A")
    diff = git("diff", "--cached", "--name-only").stdout.strip()
    if not diff:
        sha = git("rev-parse", "HEAD").stdout.strip()
        mark_results([{"id": r["id"], "published_at": "now()", "commit_sha": sha, "error": None} for r in written])
        print(f"no diff, marked {len(written)} as published @ {sha}")
        return 0

    msg = build_commit_message(written)
    git("commit", "-m", msg)
    git("push", "origin", "HEAD:main")
    sha = git("rev-parse", "HEAD").stdout.strip()

    mark_results([{"id": r["id"], "published_at": "now()", "commit_sha": sha, "error": None} for r in written])
    print(f"pushed {len(written)} files @ {sha}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
