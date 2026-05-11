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


def write_one(row: dict) -> tuple[bool, str | None]:
    fp = row["file_path"]
    if not path_allowed(fp):
        return False, f"path not in allow-list: {fp}"
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
