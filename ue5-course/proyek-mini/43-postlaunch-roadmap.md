# Bagian 43 — Post-Launch Roadmap · *super polish (perencanaan)*

Bukan tutorial teknis — **rencana konten setelah rilis**. Baca ini SEBELUM
bikin semuanya, biar tidak over-scope.

## ⚠️ Realita scope (baca dulu, penting)

Semua di Bagian 38-43 = **wishlist**, bukan checklist wajib. Godaan terbesar
solo dev: bikin SEMUA sebelum rilis → tidak pernah selesai.

**Aturan:**
1. **Rilis v1 minimal dulu**: 1 region, 3 karakter, 5 musuh, 1 boss, sistem
   inti. Itu SUDAH game utuh (Bagian 7-26).
2. Fitur "super polish" 38-42 = tambahkan yang **paling terlihat** (foot IK,
   photo mode, difficulty, audio spatial), sisanya post-launch.
3. Konten besar di bawah = **hanya kalau v1 dapat traksi**. Jangan bangun
   region 4 sebelum ada pemain region 1.

## Roadmap Konten (kalau berhasil)

### New Region Pack
Setelah region 1 solid:
- Region 2: Gunung es (Cryo theme) — musuh baru, mekanik es
- Region 3: Gurun (Pyro/Geo) — heat mechanic, sandstorm
- Region 4: Kepulauan (Hydro/Anemo) — sailing, underwater

Tiap region: 500m-1km², 10-20 jam gameplay. **Reuse semua sistem** — cuma
konten baru (mesh, quest, musuh via data). Ini kekuatan arsitektur yang rapi:
region baru = konten, bukan kode baru.

### Endgame Content
- **Spiral Abyss style**: tower 12 floor, makin susah, reset 2 minggu,
  hadiah primogem/material. Reuse `ADomainChallenge` (wave) + scaling.
- **World Boss weekly**: boss besar butuh strategi, weekly reset, drop
  ascension langka. Reuse boss system ([Bagian 22](22-boss-fight.md)).
- **Roguelike mode**: dungeon random + pilih buff tiap floor. Reuse buff
  ([Bagian 28](28-cooking-shop.md)) + domain + prosedural room.

### Karakter Baru
Per 2-3 bulan 1 karakter (kalau live-service). Tiap karakter = data + 1 set
skill/burst BP + anim. Constellation & banner sudah ada
([PHASE5](../../aether-realm-ue5/Docs/PHASE5_SETUP.md), [PHASE10](../../aether-realm-ue5/Docs/PHASE10_PROGRESSION.md)).

## Urutan eksekusi yang disarankan

```
1. v1: Bagian 7-26 (game inti, 1 region)          ← SELESAIKAN & RILIS
2. Patch stabilitas (feedback pemain nyata)
3. Polish terlihat: foot IK, photo mode, difficulty, audio spatial (38-42 pilihan)
4. Region 2 + endgame (kalau ada traksi)
5. Live-service (karakter/event) — kalau komunitas tumbuh
```

## Checklist "siap rilis v1" (yang benar-benar penting)

- [ ] Game inti bisa dimainkan start→finish tanpa soft-lock
- [ ] Save/load solid
- [ ] 60fps di target (Modul 13)
- [ ] Controller + settings + difficulty
- [ ] Subtitle + accessibility dasar
- [ ] Store page + trailer + demo ([PHASE8](../../aether-realm-ue5/Docs/PHASE8_RELEASE.md))
- [ ] Build Shipping jalan standalone

## 🎓 TRACK PROYEK-MINI: BAGIAN 7-43 — SELESAI TOTAL

Dari rapikan karakter VRoid sampai action RPG open world lengkap fitur +
super polish + roadmap. **37 bagian, blueprint utuh game komersial.**

Pesan terakhir: **kamu tidak akan bikin semua ini.** Dan itu normal. Ambil
inti (7-26), rilis, dengar pemain, kembangkan yang mereka mau. Game yang
dirilis > game sempurna yang tidak pernah selesai.

Selamat jadi game developer. 🎮 Sekarang: buka editor, mulai Bagian 07.
