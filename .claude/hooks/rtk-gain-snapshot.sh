#!/usr/bin/env sh
# rtk-gain-snapshot — Stop hook. Best-effort, silent, never blocks.
#
# rtk's savings stats live in /root/.local/share/rtk/history.db — outside the
# repo, so they evaporate every container restart in this ephemeral sandbox.
# This hook appends one JSON line per session-end to a repo-committed log, so
# token-savings data compounds across sessions/contributors instead of
# resetting. Read by the token-savings dashboard artifact (regenerate on
# request: "update token savings dashboard").

REPO_ROOT="/home/user/thrive-cc"
LOG="$REPO_ROOT/.rtk/savings-log.jsonl"
RTK=/root/.local/bin/rtk

[ -x "$RTK" ] || exit 0
cd "$REPO_ROOT" 2>/dev/null || exit 0

SNAPSHOT="$("$RTK" gain -f json -p 2>/dev/null)"
[ -z "$SNAPSHOT" ] && exit 0

TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
printf '{"ts":"%s",%s\n' "$TS" "$(printf '%s' "$SNAPSHOT" | tr -d '\n' | sed 's/^{//')" >> "$LOG" 2>/dev/null

exit 0
