#!/usr/bin/env python3
"""Map github.event.schedule cron expression → task name."""
from __future__ import annotations
import os
import sys

SCHEDULE_TO_TASK: dict[str, str] = {
    "0 6 * * *":     "content-engine",   # daily 06:00 UTC (08:00 Swiss CEST)
    "0 18 * * 0":    "weekly-summary",   # Sunday 18:00 UTC
    "*/15 * * * *":  "session-reaper",
}


def main() -> int:
    event = os.environ.get("EVENT_NAME", "")
    if event == "workflow_dispatch":
        task = os.environ.get("INPUT_TASK", "").strip()
    elif event == "schedule":
        cron = os.environ.get("SCHEDULE", "").strip()
        task = SCHEDULE_TO_TASK.get(cron, "")
    else:
        print(f"ERROR: unsupported event {event!r}", file=sys.stderr)
        return 1

    if not task:
        print(f"ERROR: could not resolve task from event={event!r} schedule={os.environ.get('SCHEDULE')!r}", file=sys.stderr)
        return 1

    print(f"resolved task: {task}")
    out_path = os.environ.get("GITHUB_OUTPUT")
    if out_path:
        with open(out_path, "a") as f:
            f.write(f"task={task}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
