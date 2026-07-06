# Bagian 31 — Co-op Multiplayer · *lanjutan (advanced)*

> **Jujur: ini bagian TERSULIT & paling rawan bug.** Multiplayer di UE =
> topik besar sendiri. Kalau kamu masih pemula, **jangan mulai dari sini** —
> selesaikan single-player dulu, rilis, baru co-op. Bagian ini peta jalannya,
> bukan resep instan.

## Fondasi yang harus sudah benar dulu

Co-op = single-player yang **replication-ready sejak awal**. Kalau sistemmu
pakai variabel lokal & logic di client, co-op akan penuh bug. Prinsip:
- **Server authoritative**: damage, loot, state → dihitung server
- Client cuma kirim intent (input), tampilkan hasil
- Variabel penting = `Replicated`

Project produksi `aether-realm-ue5` sudah dibangun replication-ready
(character/enemy/chest `bReplicates`, HP `DOREPLIFETIME`, swap via Server RPC).
`Docs/PHASE8_RELEASE.md` = status arsitektur co-op. Pelajari itu.

## 31A. Steam Subsystem

`Edit → Plugins → Online Subsystem Steam` → Enable → restart.

`DefaultEngine.ini`:
```ini
[OnlineSubsystem]
DefaultPlatformService=Steam
[OnlineSubsystemSteam]
bEnabled=true
SteamDevAppId=480    ; Spacewar untuk test; ganti App ID production nanti
```

## 31B. Session (Host & Join)

`US_CoopManager` (Game Instance Subsystem):

```
[CreateSession] (bLAN, MaxPlayers=4)
   [Create Session] (Online Subsystem node)
   Set IsHost = true
   [Server Travel ke level dengan ?listen]   ← jadi listen server

[FindSessions]
   [Find Sessions] → filter tidak penuh → return list

[JoinSession] (SessionResult)
   [Join Session] → dapat connect string → [Client Travel]

[LeaveSession]
   [Destroy Session] → balik ke menu
```

> Node "Create/Find/Join Session" ada di plugin **Online Subsystem** (atau
> pakai plugin **Advanced Sessions** gratis — jauh lebih gampang di Blueprint,
> sangat direkomendasikan untuk pemula).

## 31C. UI Co-op

`W_CoopMenu`: toggle "Allow Join", list world tersedia (nama/AR/slot/ping) +
tombol Join per baris, Refresh, Close. Populate dari `FindSessions`.

## 31D. Replikasi — yang WAJIB sync

| Data | Cara |
|---|---|
| Posisi/rotasi player | `Set Replicate Movement ✓` (otomatis) |
| Anim state | Replicated variable (Speed, dll) → ABP baca |
| Enemy HP & state | `UPROPERTY(Replicated)` HP; state server-auth |
| Chest opened | Replicated bool + `Server_OpenChest` RPC + `Multicast_Effect` |
| Item drop | Server spawn (replikasi otomatis) |
| Quest progress | **Host only** — guest tidak advance quest host |
| Dialogue | Host trigger, guest lihat (multicast) |

Pattern RPC (di BP: kanan-atas node → Replication):
```
Server_OpenChest (Run on Server, Reliable) → validasi → buka
Multicast_ChestEffect (Multicast, Reliable) → VFX di semua client
```

## 31E. Aturan Co-op

```
[OnPlayerJoin] (NewPlayer)  — di GameMode (server only)
   [Scale enemy HP × 1.5 per extra player]   ← co-op lebih susah
   [Notif "PlayerX bergabung"]
   [Spawn NewPlayer dekat host]

[OnPlayerLeave]
   [Scale enemy HP balik]
   [Notif "PlayerX keluar"]
```

Aturan (sesuai desain Genshin):
- Guest bantu combat & eksplor
- Guest **tidak** buka chest host / advance quest host
- Oculi & loot guest = **instanced** (masing-masing dapat sendiri)
- Enemy HP scaling +50% per player tambahan

## 31F. Komunikasi

Pilihan gampang → **Emote/Sticker** (bukan text chat):
- Hold `G` → wheel selector → pilih (Wave/Thumbs Up/Point/Sad/Excited)
- `Multicast` spawn icon emote di atas kepala 2s

Text chat: `W_ChatBox` (input + history) → replicate via `Server_SendChat`
→ `Multicast_ReceiveChat` → append ke Game State chat log.

## ✅ CHECKPOINT (butuh 2 PC / 2 instance)

- [ ] PIE: Number of Players 2, Net Mode Listen Server → 2 karakter jalan
- [ ] Enemy HP sinkron di kedua layar
- [ ] Chest server-authoritative (guest buka → sinkron)
- [ ] Emote muncul di layar player lain
- [ ] Join/leave scaling enemy HP jalan

> **Realistis**: co-op penuh = 1-2 bulan kerja sendiri. Untuk demo/rilis
> pertama, single-player cukup. Aktifkan co-op saat game inti sudah solid.

➡️ [Bagian 32 — Battle Pass](32-battle-pass.md)
