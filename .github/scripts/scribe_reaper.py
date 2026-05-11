#!/usr/bin/env python3
"""Poll Managed Agents sessions and update Supabase managed_agents_usage.

Pure HTTP (no Claude inference). For every dispatched row in
managed_agents_usage without ended_at:
  - GET /v1/sessions/{id} for current status
  - If status is idle/terminated/failed, mark ended, compute cost
  - If still running but row > 30 min old, mark as stalled
"""
from __future__ import annotations
import json
import os
import sys
import time
import urllib.parse
import urllib.request

ANTHROPIC = "https://api.anthropic.com"
BETA_HEADER = "managed-agents-2026-04-01"
STALLED_AFTER_MIN = 30
SESSION_HOUR_USD = 0.08
USD_TO_CHF = 0.88


def anthropic_headers() -> dict[str, str]:
    return {
        "x-api-key": os.environ["ANTHROPIC_API_KEY"],
        "anthropic-version": "2023-06-01",
        "anthropic-beta": BETA_HEADER,
    }


def supabase_headers() -> dict[str, str]:
    key = os.environ["SUPABASE_SERVICE_ROLE"]
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


def http(url: str, *, method: str = "GET", body=None, headers: dict[str, str]) -> tuple[int, bytes]:
    req = urllib.request.Request(
        url,
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers=headers,
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def fetch_open_rows() -> list[dict]:
    sb_url = os.environ["SUPABASE_URL"].rstrip("/")
    qs = urllib.parse.urlencode({
        "select": "*",
        "ended_at": "is.null",
        "order": "started_at.asc",
        "limit": "100",
    })
    status, raw = http(f"{sb_url}/rest/v1/managed_agents_usage?{qs}", headers=supabase_headers())
    if status != 200:
        print(f"fetch_open_rows: HTTP {status} {raw!r}", file=sys.stderr)
        return []
    return json.loads(raw)


def fetch_session(session_id: str) -> dict | None:
    status, raw = http(f"{ANTHROPIC}/v1/sessions/{session_id}", headers=anthropic_headers())
    if status != 200:
        return None
    return json.loads(raw)


def patch_row(row_id: str, fields: dict) -> None:
    sb_url = os.environ["SUPABASE_URL"].rstrip("/")
    qs = urllib.parse.urlencode({"id": f"eq.{row_id}"})
    http(f"{sb_url}/rest/v1/managed_agents_usage?{qs}", method="PATCH", body=fields, headers=supabase_headers())


def parse_iso(s: str) -> float:
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    from datetime import datetime
    return datetime.fromisoformat(s).timestamp()


def cost_for_session(session: dict) -> tuple[float, float]:
    try:
        started = parse_iso(session["created_at"])
        ended = parse_iso(session.get("updated_at") or session["created_at"])
        duration = max(0.0, ended - started)
        return duration, (duration / 3600.0 * SESSION_HOUR_USD) * USD_TO_CHF
    except Exception as e:
        print(f"cost: {e}", file=sys.stderr)
        return 0.0, 0.0


def main() -> int:
    open_rows = fetch_open_rows()
    if not open_rows:
        print("no open sessions")
        return 0

    now = time.time()
    closed = 0
    stalled = 0

    for row in open_rows:
        session = fetch_session(row["session_id"])
        if session is None:
            continue
        status = session.get("status")
        if status in ("idle", "terminated", "failed"):
            duration, cost_chf = cost_for_session(session)
            patch_row(row["id"], {
                "ended_at": session.get("updated_at"),
                "duration_sec": duration,
                "status": status,
                "cost_chf": round(cost_chf, 4),
                "final_event": session,
            })
            closed += 1
        else:
            age_min = (now - parse_iso(row["started_at"])) / 60.0
            if age_min > STALLED_AFTER_MIN:
                patch_row(row["id"], {"status": "stalled"})
                stalled += 1

    print(f"reaped {closed} completed, {stalled} stalled, total open: {len(open_rows)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
