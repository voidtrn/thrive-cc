# 🎯 Track Proyek Mini — "Genshin-ku" Pertama (100% Blueprint)

Track praktik: bangun mini open world ala Genshin **tanpa C++**, langkah
demi langkah. Cocok dikerjakan setelah (atau bareng) Modul 01-08 course utama.

## Prasyarat

- Project **Third Person template (Blueprint)** — modul 01 course utama
- Karakter VRoid sudah di-import (pakai plugin **VRM4U** gratis, atau
  export FBX via Blender — lihat `aether-realm-ue5/Docs/ART_A_CHARACTERS.md`)
- Bagian 1-6 track ini = sama dengan Modul 01-06 course utama
  (install, editor, BP dasar, karakter & input) — tidak diulang

## Daftar Bagian

| # | Bagian | Hasil |
|---|---|---|
| [07](07-rapikan-karakter-anime.md) | Rapikan Karakter Anime | Rambut & rok bergerak, animasi, posisi pas |
| [08](08-sprint.md) | Input Sprint | Shift = lari |
| [09](09-stamina.md) | Sistem Stamina | Bar stamina, drain saat sprint |
| [10](10-gliding.md) | Gliding | Terbang ala Genshin! |
| [11](11-chest-interaksi.md) | Interaksi Chest | Tekan F buka harta |
| [12](12-oculi-collectible.md) | Oculi Collectible | Kumpulkan orb + counter |

Tiap bagian selesai = **Play test dulu** sebelum lanjut. Rusak di bagian N,
jangan lanjut ke N+1.

## Hubungan dengan project besar

Semua yang kamu bikin di sini versi "mainan"-nya. Versi produksi (C++,
lengkap) ada di `aether-realm-ue5/` — modul 14 course utama mengajakmu
membedahnya. Contoh: stamina bagian 09 → `CharacterBase::TickStamina`,
gliding bagian 10 → `UOpenWorldMovementComponent::StartGliding`.
