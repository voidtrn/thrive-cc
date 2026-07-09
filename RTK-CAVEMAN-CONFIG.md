# RTK & Caveman Mode — Config Guide (Token Optimization)

Panduan lengkap cara kerja dan cara konfigurasi **RTK (Rust Token Killer)** dan **Caveman Mode** di repo `thrive-cc`, plus daftar kapabilitas Claude Code lain yang bisa dipakai untuk hemat token / menambah kemampuan sesi.

Semua konfigurasi di sini **sudah aktif** di repo ini — dokumen ini menjelaskan cara kerjanya dan cara replikasi ke repo lain.

---

## 1. RTK (Rust Token Killer)

RTK adalah CLI wrapper yang memfilter output command (git, build, test, dst) supaya hanya bagian relevan yang masuk context — hemat 60-90% token per command. Detail command lengkap ada di `CLAUDE.md` (root). Bagian ini fokus ke **bagaimana RTK dikonfigurasi otomatis di repo ini**.

### 1.1 Komponen di repo

| File | Fungsi |
|---|---|
| `.claude/bin/rtk-linux-x64` | Binary RTK di-vendor langsung ke repo (bukan install global) |
| `.claude/hooks/rtk-ensure.sh` | Hook `SessionStart` — symlink binary vendored ke `/root/.local/bin/rtk` tiap sesi baru |
| `.rtk/filters.toml` | Filter kustom project-local (override filter built-in / user-global) |
| `.claude/settings.json` | Wiring hook (`SessionStart`, `PreToolUse`) |

### 1.2 Kenapa di-vendor ke repo, bukan install biasa

Environment ini **ephemeral** — container di-reclaim tiap sesi berakhir / idle, hanya isi git repo yang persist. Kalau RTK di-install biasa (`cargo install` / global bin), hilang tiap restart container. Solusinya: binary RTK di-commit ke `.claude/bin/rtk-linux-x64`, lalu `rtk-ensure.sh` symlink ulang tiap `SessionStart` — jadi RTK selalu tersedia tanpa reinstall.

### 1.3 Alur aktivasi otomatis

```
SessionStart
 └─ rtk-ensure.sh
     1. symlink .claude/bin/rtk-linux-x64 → /root/.local/bin/rtk (kalau target belum ada)
     2. fallback: pakai ~/.cargo/bin/rr-rtk kalau vendored binary gak jalan di image ini
     3. rtk trust  (trust project filters di .rtk/filters.toml, silent)

PreToolUse (matcher: Bash)
 └─ /root/.local/bin/rtk hook claude
     → tiap command Bash otomatis di-rewrite lewat rtk kalau ada filter cocok
```

Karena wiring-nya lewat `PreToolUse` hook, **kamu gak perlu ketik `rtk` manual** — tapi CLAUDE.md tetap instruksikan pakai prefix `rtk` eksplisit (termasuk di command chain `&&`) supaya konsisten dan filter aktif walau hook tidak jalan (mis. permission mode berbeda).

### 1.4 Custom filter (`.rtk/filters.toml`)

```toml
schema_version = 1

[filters.my-tool]
description = "Compact my-tool output"
match_command = "^my-tool\\s+build"
strip_ansi = true
strip_lines_matching = ["^\\s*$", "^Downloading", "^Installing"]
max_lines = 30
on_empty = "my-tool: ok"
```

File ini di-commit ke repo — override filter user-global / built-in. Belum ada filter kustom aktif di repo ini (masih contoh default), tambahkan section `[filters.<nama>]` kalau ada tool project-specific yang outputnya berisik.

### 1.5 Command penting

```bash
rtk gain              # lihat statistik token savings sesi ini
rtk gain --history     # riwayat command + savings
rtk discover           # audit sesi lama, cari command yang harusnya pakai rtk tapi tidak
rtk proxy <cmd>        # jalankan command TANPA filter (debug)
rtk init               # tambah instruksi RTK ke CLAUDE.md (repo baru)
```

Command reference lengkap per kategori (git, build, test, gh, docker, dst) → lihat `CLAUDE.md` bagian "RTK Commands by Workflow".

---

## 2. Caveman Mode

Mode komunikasi ultra-compressed — hemat ~75% token respons dengan gaya "caveman" (buang artikel, filler, basa-basi) tapi substansi teknis tetap lengkap dan akurat.

### 2.1 Komponen di repo

| File | Fungsi |
|---|---|
| `.claude/hooks/caveman-activate.js` | Hook `SessionStart` — resolve mode default, tulis flag file, emit ruleset ke context |
| `.claude/hooks/caveman-config.js` | Resolver config (urutan prioritas mode default) |
| `.claude/hooks/caveman-mode-tracker.js` | Hook `UserPromptSubmit` — inject reminder mode aktif tiap prompt (anti-drift) |
| `.claude/hooks/caveman-stats.js` | Hitung token savings, render suffix statusline |
| `.claude/hooks/caveman-statusline.sh` | Script statusline — render badge `[CAVEMAN]` / `[CAVEMAN:ULTRA]` dll |
| `.claude/commands/caveman.md` | Skill/command utama `/caveman` — full ruleset & intensity levels |
| `.claude/commands/caveman-commit.md` | `/caveman-commit` — commit message ultra-ringkas |
| `.claude/commands/caveman-review.md` | `/caveman-review` — komentar PR 1 baris per finding |
| `.claude/commands/caveman-help.md` | `/caveman-help` — quick reference card |
| `.claude/commands/cavecrew.md` | Panduan delegasi ke subagent bergaya caveman |
| `CLAUDE.md` (root) | Instruksi persisten: "Respond terse like smart caveman" — ini yang bikin mode aktif tiap sesi di repo ini |

### 2.2 Alur aktivasi otomatis

```
SessionStart → caveman-activate.js
 1. resolve mode default (lihat 2.3)
 2. tulis flag file $CLAUDE_CONFIG_DIR/.caveman-active (dibaca statusline)
 3. emit full ruleset (dari SKILL.md) sebagai hidden SessionStart context
 4. kalau statusline belum di-wire → emit nudge setup

UserPromptSubmit → caveman-mode-tracker.js
 → inject reminder singkat "CAVEMAN MODE ACTIVE (full)..." tiap prompt,
   supaya mode gak luntur walau context di-compress / percakapan panjang
```

### 2.3 Urutan resolusi mode default

Ditentukan oleh `caveman-config.js`, prioritas tertinggi → terendah:

1. **Env var** `CAVEMAN_DEFAULT_MODE` (mis. `export CAVEMAN_DEFAULT_MODE=ultra`)
2. **Config repo-local** (checked-in, jadi default per-project untuk semua kontributor):
   - `.caveman/config.json` atau `.caveman.json` di root repo (di-walk dari cwd ke atas)
   - Repo ini **belum punya file ini** → fallback ke config user
3. **Config user** — `~/.config/caveman/config.json` (atau `$XDG_CONFIG_HOME/caveman/config.json`)
4. **Default:** `full`

Mode valid: `off | lite | full | ultra | wenyan-lite | wenyan-full | wenyan-ultra | commit | review | compress`

**Untuk pin default mode di repo ini** (opsional, supaya semua kontributor/sesi dapat mode sama tanpa tergantung config user masing-masing), commit file:

```json
// .caveman/config.json
{ "defaultMode": "full" }
```

### 2.4 Command / skill yang tersedia

| Command | Fungsi |
|---|---|
| `/caveman [lite\|full\|ultra\|wenyan-lite\|wenyan-full\|wenyan-ultra]` | Ganti intensity level |
| `/caveman-commit` | Generate commit message ringkas (Conventional Commits, subject ≤50 char) |
| `/caveman-review` | Review PR/diff, output 1 baris per finding |
| `/caveman-help` | Tampilkan reference card mode & command |
| `/cavecrew` | Panduan kapan delegasi ke subagent `cavecrew-investigator` / `cavecrew-builder` / `cavecrew-reviewer` — output subagent ini dikompres caveman-style, jadi tool-result yang masuk main context ~60% lebih kecil |
| `"stop caveman"` / `"normal mode"` | Matikan mode (persist sampai diubah lagi / sesi berakhir) |

### 2.5 Statusline badge (belum di-setup)

Statusline `[CAVEMAN]` / `[CAVEMAN:ULTRA]` butuh entry di **user-level** `settings.json` (bukan project — beda scope karena statusline itu setting client/terminal, bukan repo):

```json
// /root/.claude/settings.json (atau ~/.claude/settings.json)
{
  "statusLine": {
    "type": "command",
    "command": "bash \"/home/user/thrive-cc/.claude/hooks/caveman-statusline.sh\""
  }
}
```

> Catatan: karena environment ini ephemeral (container reset), setting user-level ini **tidak persist** lintas sesi cloud kecuali di-provision ulang tiap kali (mis. lewat setup script environment). Kalau mau permanen, taruh script setup ini di environment setup script Claude Code on the web, bukan cuma jalanin manual.

### 2.6 Boundary penting

- Code, commit message final, dan isi PR **selalu ditulis normal** (bukan caveman) — caveman cuma gaya komunikasi chat.
- Auto-clarity: mode caveman otomatis nonaktif sementara untuk warning keamanan, konfirmasi aksi irreversible, atau kalau kompresi bikin ambigu — lalu resume lagi setelah bagian kritikal selesai.

---

## 3. Cara Replikasi Setup Ini ke Repo Lain / Sesi Lain

Karena environment cloud ephemeral, hanya file yang **di-commit ke git repo** yang persist. Checklist untuk clone setup ini ke repo baru:

1. Copy folder `.claude/` (bin, commands, hooks, settings.json) ke repo baru.
2. Copy `.rtk/filters.toml` (atau jalankan `rtk init` di repo baru untuk generate ulang).
3. Copy/adaptasi `CLAUDE.md` — minimal bagian "RTK Commands" + instruksi caveman.
4. Commit semua — termasuk binary `.claude/bin/rtk-linux-x64` (perlu di-vendor karena install global hilang tiap restart container).
5. (Opsional) tambah `.caveman/config.json` kalau mau pin default mode per-repo.
6. Sesi baru di repo tsb otomatis jalanin `rtk-ensure.sh` + `caveman-activate.js` lewat `SessionStart` hook — tidak perlu setup manual lagi.

---

## 4. Kapabilitas Lain Claude Code (Skills, Subagent, Persona, dll)

Selain RTK + Caveman, ada beberapa mekanisme Claude Code yang bisa dipakai buat hemat token, custom behavior, atau nambah kapabilitas sesi:

### 4.1 Skills (`Skill` tool / `SKILL.md`)

Skill = instruksi terstruktur yang di-load on-demand saat trigger cocok (nama, kata kunci di prompt, atau `/nama-skill`). Skill aktif sekarang di sesi ini:

| Skill | Fungsi |
|---|---|
| `caveman`, `cavecrew`, `caveman-commit`, `caveman-review`, `caveman-help` | Sudah dijelaskan di atas |
| `session-start-hook` | Bikin/develop `SessionStart` hook untuk Claude Code on the web |
| `dataviz` | Panduan bikin chart/grafik/dashboard konsisten |
| `artifact-design` | Panduan desain untuk Artifacts |
| `update-config` | Config harness lewat `settings.json` (hooks, permission, env var) |
| `keybindings-help` | Custom keybinding `~/.claude/keybindings.json` |
| `verify` | Verifikasi perubahan code jalan end-to-end (bukan cuma test/typecheck) |
| `code-review` / `simplify` | Review diff untuk bug / simplifikasi / efisiensi |
| `fewer-permission-prompts` | Scan transcript, auto-tambah allowlist Bash/MCP command aman ke `settings.json` |
| `loop` | Jalanin prompt/slash-command berulang tiap interval (mis. polling status) |
| `claude-api` | Referensi Claude API / Anthropic SDK (model id, pricing, caching, tool use) |
| `run` | Launch & screenshot app buat verifikasi perubahan UI |
| `init` | Generate `CLAUDE.md` baru buat repo yang belum ada |
| `review` / `security-review` | Review PR GitHub / security review diff |

Bikin skill kustom: buat file `SKILL.md` (frontmatter `name` + `description` berisi trigger phrase) di `.claude/commands/` atau lokasi skill plugin — otomatis kedaftar dan bisa dipanggil `/nama-skill` atau auto-trigger dari kata kunci di prompt. Contoh persis: `caveman.md` di atas.

### 4.2 Subagent (`Agent` tool) — "perspective" / delegasi

Subagent = instance Claude terpisah dengan tool-access & context sendiri, dipanggil buat task spesifik supaya main context gak penuh. Tersedia di sesi ini:

| Agent | Kapan dipakai |
|---|---|
| `Explore` | Cari lokasi code cepat (read-only) |
| `general-purpose` | Task multi-step / riset kompleks |
| `Plan` | Rancang implementation plan (arsitektur, trade-off) |
| `claude-code-guide` | Jawab pertanyaan soal Claude Code / SDK / API |
| `statusline-setup` | Setup statusline |
| `claude` | Catch-all default |
| `cavecrew-investigator` / `cavecrew-builder` / `cavecrew-reviewer` | Versi caveman-compressed dari Explore/edit/review — output lebih kecil masuk main context (lihat `/cavecrew`) |

Subagent kustom bisa didefinisikan di `.claude/agents/*.md` (frontmatter atur tools, model, reasoning effort) — belum ada di repo ini, bisa ditambah kalau perlu "karakter" agent khusus (mis. agent auditor security-only, agent yang selalu jawab dalam bahasa tertentu, dst).

### 4.3 Hooks (`settings.json`)

Event yang bisa di-intercept: `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `Stop`, dll. Repo ini pakai 3 (lihat §1-2). Bisa ditambah misal: `PostToolUse` buat auto-lint tiap edit file, atau `Stop` buat notifikasi.

### 4.4 CLAUDE.md — persona & instruksi persisten

`CLAUDE.md` (project) dan `~/.claude/CLAUDE.md` (global) adalah cara utama nge-set "karakter"/persona persisten — caveman mode di repo ini contoh konkretnya (instruksi persona ditulis di CLAUDE.md, dipertegas ulang lewat hook). Bisa dipakai juga buat: coding convention, arsitektur project, larangan/izin tool tertentu, dst.

### 4.5 MCP servers

Sesi ini connect ke:
- **`Claude_Code_Remote`** — kelola environment cloud, trigger/routine terjadwal (cron), watch PR activity (`subscribe_pr_activity`), kirim pesan terjadwal (`send_later`).
- **`github`** — full GitHub API (PR, issue, review, branch, dst) tanpa perlu `gh` CLI.

Bisa nambah MCP server lain (`ListConnectors` / `SuggestConnectors`) buat integrasi tool eksternal.

### 4.6 Lain-lain

- **Routines / scheduled triggers** — jadwalin task berulang (cron) atau one-shot lewat `create_trigger` / `send_later`, misal auto-check PR tiap jam.
- **Plugins & marketplace** — `SearchPlugins` / `SuggestPluginInstall` buat cari skill/agent siap-pakai dari komunitas (caveman & cavecrew sendiri kemungkinan besar dari plugin marketplace).
- **Artifacts** — render HTML/Markdown jadi halaman web privat (dipakai buat laporan visual, dashboard, dst).
- **Worktree isolation** (`EnterWorktree`/`ExitWorktree`) — kerja di git worktree terpisah biar gak ganggu branch aktif.
- **Statusline & keybindings** — kustomisasi UI terminal (lihat §2.5).

---

## 5. Ringkasan Cepat

- **RTK** = hemat token di *tool output* (command execution) → selalu prefix `rtk`.
- **Caveman** = hemat token di *respons Claude* → otomatis aktif tiap sesi lewat hook + CLAUDE.md, level diatur via `/caveman <level>` atau config.
- **Cavecrew** = hemat token di *hasil subagent* → delegasi task ke `cavecrew-*` agent kalau outputnya bakal panjang.
- Semua konfigurasi ini **harus di-commit ke repo** (bukan cuma diketik manual) supaya persist di environment cloud yang ephemeral.
