#!/usr/bin/env python3
"""relofinder.ch scribe dispatcher."""
from __future__ import annotations
import json, os, sys, time, urllib.parse, urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
TASKS_DIR = REPO_ROOT / ".github" / "scribe-tasks"

AGENT_ID = "agent_012sALhaWrUxqma6GXtEVAFW"
ENV_ID   = "env_01VLVbs2WFmrf6nfgMQ3o2i4"
AGENT_NAME = "relofinder-scribe"
PROJECT    = "relofinder"
ANTHROPIC = "https://api.anthropic.com"
BETA_HEADER = "managed-agents-2026-04-01"

def anthropic_headers():
    return {"x-api-key": os.environ["ANTHROPIC_API_KEY"], "anthropic-version": "2023-06-01",
            "anthropic-beta": BETA_HEADER, "Content-Type": "application/json"}

def supabase_headers():
    key = os.environ["SUPABASE_SERVICE_ROLE"]
    return {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}

def http(url, *, method="POST", body=None, headers):
    req = urllib.request.Request(url, method=method,
                                 data=json.dumps(body).encode() if body is not None else None,
                                 headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()

def main(argv):
    if len(argv) < 2:
        print("usage: scribe_dispatch.py <task>", file=sys.stderr); return 1
    task = argv[1]
    tf = TASKS_DIR / f"{task}.md"
    if not tf.exists():
        print(f"ERROR: task file not found: {tf}", file=sys.stderr); return 2
    instructions = tf.read_text()
    body = {"agent": AGENT_ID, "environment_id": ENV_ID, "title": f"{PROJECT} {task} (cron)"}
    status, raw = http(f"{ANTHROPIC}/v1/sessions", body=body, headers=anthropic_headers())
    if status != 200:
        print(f"ERROR: /v1/sessions {status}: {raw!r}", file=sys.stderr); return 3
    sid = json.loads(raw)["id"]
    print(f"session={sid}")
    http(f"{ANTHROPIC}/v1/sessions/{sid}/events",
         body={"events": [{"type": "user.message", "content": [{"type": "text", "text": instructions}]}]},
         headers=anthropic_headers())
    sb_url = os.environ["SUPABASE_URL"].rstrip("/")
    http(f"{sb_url}/rest/v1/managed_agents_usage",
         body={"session_id": sid, "agent_id": AGENT_ID, "agent_name": AGENT_NAME,
               "task": task, "status": "dispatched", "project": PROJECT},
         headers=supabase_headers())
    print(f"dispatched at {time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}")
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv))
