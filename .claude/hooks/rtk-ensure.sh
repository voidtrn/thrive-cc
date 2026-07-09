#!/usr/bin/env sh
# rtk-ensure — SessionStart hook. Idempotent.
# Sandbox cloud bersifat ephemeral: binary rtk hilang tiap container restart,
# hanya repo yang persist. Script ini symlink binary rtk yang di-vendor ke repo
# (.claude/bin/rtk-linux-x64) ke lokasi yang diharapkan PreToolUse hook, lalu
# trust project filters — supaya rtk auto-rewrite selalu aktif tanpa reinstall.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
VENDORED="$REPO_ROOT/.claude/bin/rtk-linux-x64"
TARGET=/root/.local/bin/rtk

# 1) Symlink binary vendored kalau target belum ada / rusak.
if [ ! -x "$TARGET" ] && [ -x "$VENDORED" ]; then
  mkdir -p /root/.local/bin
  ln -sf "$VENDORED" "$TARGET"
fi

# 2) Fallback: kalau vendored tak jalan di image ini, coba cargo bin.
if [ ! -x "$TARGET" ] && [ -x "$HOME/.cargo/bin/rr-rtk" ]; then
  mkdir -p /root/.local/bin
  ln -sf "$HOME/.cargo/bin/rr-rtk" "$TARGET"
fi

# 3) Trust project filters (aman — template default). Silent.
if [ -x "$TARGET" ]; then
  (cd "$REPO_ROOT" && "$TARGET" trust >/dev/null 2>&1) || true
fi

exit 0
