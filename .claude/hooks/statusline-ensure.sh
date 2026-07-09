#!/usr/bin/env sh
# statusline-ensure — SessionStart hook. Idempotent.
# /root/.claude (config global) bersifat ephemeral di sandbox cloud: hilang
# tiap container baru. Script ini merge konfigurasi statusLine (badge
# [CAVEMAN]) ke settings global TIAP sesi mulai, dari repo — pola sama
# dengan rtk-ensure.sh. Tidak menimpa statusLine yang sudah di-set user.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BADGE_SCRIPT="$SCRIPT_DIR/caveman-statusline.sh"
SETTINGS_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
SETTINGS="$SETTINGS_DIR/settings.json"

[ -x "$BADGE_SCRIPT" ] || [ -f "$BADGE_SCRIPT" ] || exit 0
mkdir -p "$SETTINGS_DIR"

BADGE_SCRIPT="$BADGE_SCRIPT" SETTINGS="$SETTINGS" python3 - <<'EOF' 2>/dev/null || true
import json, os

settings_path = os.environ["SETTINGS"]
badge = os.environ["BADGE_SCRIPT"]

data = {}
if os.path.exists(settings_path):
    try:
        with open(settings_path) as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError):
        data = {}

# Jangan timpa statusLine milik user — hanya isi kalau belum ada.
if "statusLine" not in data:
    data["statusLine"] = {
        "type": "command",
        "command": f'bash "{badge}"',
    }
    with open(settings_path, "w") as f:
        json.dump(data, f, indent=2)
        f.write("\n")
EOF

exit 0
