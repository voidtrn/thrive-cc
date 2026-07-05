# PHASE 8 — Steam Integration & Release

C++ selesai: `USteamIntegrationSubsystem` (achievements, rich presence),
OSS Steam config, co-op replication (chest/oculus/character), build scripts.

---

## 8A. Steamworks

Sudah di repo:
- `MyGame.uproject`: plugin OnlineSubsystem + OnlineSubsystemSteam enabled
- `DefaultEngine.ini`: DefaultPlatformService=Steam, SteamDevAppId=480
  (Spacewar untuk testing — **ganti App ID production sebelum rilis**),
  SteamNetDriver dengan IpNetDriver fallback

### Fitur

| Fitur | Cara pakai |
|---|---|
| **Auth** | Otomatis via OSS — `GetPlayerSteamName()` untuk display |
| **Cloud Save** | Tanpa kode. Steamworks App Admin → Cloud: quota 1 MB/user, root `Saved/SaveGames`, enable auto-cloud. Alternatif `steam_autocloud.vdf` di install dir |
| **Achievements** | Definisikan ID di Steamworks (ACH_FIRST_WISH dst) + icon 256x256 PNG. Unlock: `SteamSubsystem->UnlockAchievement("ACH_FIRST_WISH")`. Hook contoh: `OnChestOpened` → ACH_FIRST_CHEST, `OnWishCompleted` → ACH_FIRST_WISH, `OnQuestCompleted(archon)` → ACH_STORY_1 |
| **Rich Presence** | `SetRichPresence("Exploring Starfell Valley")` — panggil saat ganti region/aktivitas (masuk domain, buka wish screen) |
| **Overlay** | Default aktif (Shift+Tab), no code |

Achievement awal yang disarankan (10-15): first wish, first 5★, 10 chest,
semua waypoint, AR 10, kill 100 enemy, reaction pertama tiap jenis (pilih 4),
selesai archon quest 1, stamina max, party penuh 4 karakter.

## 8B. Co-op Architecture — sudah siap

| Item | Status |
|---|---|
| Character/enemy replicate + movement | ✅ `bReplicates` + `SetReplicateMovement` di CharacterBase; HP/Energy `DOREPLIFETIME` |
| Chest server-authoritative | ✅ `TryOpen` client → `Server_TryOpen` RPC; state replicated; `Multicast_PlayOpenEffect` untuk VFX; loot server-only |
| Oculus server-authoritative | ✅ overlap diproses server saja, destroy replikasi otomatis |
| World state (weather/time) | ✅ replicated di GameState (Phase 1) |
| Party swap sync | ✅ `ServerSetActiveCharacter` RPC di PlayerState (Phase 1/7) |
| Damage server-validated | Pipeline `DealDamage` jalan di server; validasi range/cooldown/LOS tambahan = pre-release co-op |
| Movement prediction | Built-in `CharacterMovementComponent` (client prediction + server reconciliation gratis dari engine); custom climb mode perlu `FSavedMove` extension saat co-op diaktifkan penuh |
| Guest quest progress | By design tidak synced — guest baca progress sendiri (host world, guest journal) |

Join/host: `OpenLevel(listen)` + `ExecuteConsoleCommand("open steam.<id>")` /
sessions API (CreateSession/FindSessions/JoinSession via OSS) — implement saat
co-op jadi target aktif. Drop-in/out didukung arsitektur (PostLogin spawn).

## 8C. Build & Release

### Build

```
Scripts\BuildSteam.bat "C:\Program Files\Epic Games\UE_5.4"
```
Output: `Build/Steam/Windows/` — Shipping, cooked, pak+iostore, compressed.

### SteamPipe

1. Steamworks → buat depot (ID = AppID+1 konvensi).
2. Edit `Scripts/steampipe/app_build.vdf`: AppID + DepotID production.
3. `set STEAMWORKS_SDK=C:\steamworks_sdk` lalu
   `Scripts\UploadSteam.bat <steam_login>`.
4. Steamworks → Builds: set build live ke branch `default` (public) atau
   `beta` (testing, bisa password).
5. Launch options: executable `MyGame.exe`, OS Windows 64-bit.

### Store Page Checklist

- [ ] Capsule: Header 460x215, Small 231x87, Main 616x353, Vertical 374x448
- [ ] Screenshots min 5 @1920x1080 (combat, glide, wish, dialog, vista)
- [ ] Trailer 1-2 menit gameplay
- [ ] Deskripsi short + detailed (BBCode)
- [ ] Tags: Open World, Action RPG, Anime, Singleplayer, Fantasy
- [ ] System requirements (min: GTX 1660 / rec: RTX 2060 — sesuai target 60fps)
- [ ] Pricing (lihat 8D)
- [ ] IARC questionnaire (age rating)
- [ ] Review build untuk Valve (± 1-5 hari kerja)

## 8D. Monetization

**Rekomendasi solo dev: PREMIUM.** Gacha F2P butuh live-ops konstan
(banner baru terus, server IAP, balancing ekonomi) — tidak realistis solo.

| Model | Isi |
|---|---|
| **Premium (rekomendasi)** | $19.99; wish system tetap ada tapi currency full dari gameplay (no IAP); cosmetic DLC $4.99; soundtrack DLC |
| F2P + IAP | Primogem packs via Steam Microtransaction API (perlu backend server untuk callback!), Battle Pass $9.99, Welkin-like $4.99/bulan; scope besar |

IAP teknis: ISteamMicroTxn perlu **web server** untuk transaction callback —
bukan client-only. Kalau tetap F2P, pakai Steam Inventory Service (lebih
sederhana, definisi item JSON di Steamworks).

## Checklist Phase 8

- [ ] Boot game → Steam overlay hidup, nama Steam muncul
- [ ] Achievement unlock muncul (test Spacewar dulu)
- [ ] Rich presence keliatan di friend list
- [ ] Save naik ke Cloud (cek Steam → Storage)
- [ ] BuildSteam.bat sukses, exe Shipping jalan standalone
- [ ] Upload SteamPipe → build muncul di Steamworks
- [ ] 2 PC test: host + join (Spacewar), chest/enemy state sinkron
