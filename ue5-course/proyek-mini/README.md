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
| [13](13-combat-serangan.md) | Combat: Combo 3-Hit | Klik = serang, buffer combo |
| [14](14-damage-system.md) | Damage System | Interface + floating numbers |
| [15](15-enemy-sederhana.md) | Enemy AI | Patroli-kejar-serang-mati (state machine) |
| [16](16-skill-element.md) | Skill Element (E) | Pyro slash AOE + cooldown HUD |
| [17](17-quest-system.md) | Quest System | Data Asset + manager + NPC giver |
| [18](18-objective-marker.md) | Objective Marker | Penunjuk lokasi + jarak |
| [19](19-party-swap.md) | Party Swap | Ganti karakter 1-4 + state per karakter |
| [20](20-minimap.md) | Minimap | Scene capture bulat berputar + marker |
| [21](21-polish-qol.md) | Polish & QoL | Hit stop, shake, vignette, auto-save, settings |
| [22](22-boss-fight.md) | Boss Fight | Multi-phase, telegraph, health gate |
| [23](23-inventory-ui.md) | Inventory UI | Grid, detail, sortir, filter |
| [24](24-weapon-artifact.md) | Weapon & Artifact | Stat system, equip, upgrade |
| [25](25-dialog-bercabang.md) | Dialog Bercabang | Branching + typewriter + kondisi |
| [26](26-isi-pulau-lengkap.md) | 🏆 Isi Pulau Lengkap | 5 quest + 3 enemy + boss = game utuh |
| [27](27-domain-dungeon.md) | Domain/Dungeon *(opsional)* | Arena gelombang + timer + reward |
| [28](28-cooking-shop.md) | Cooking & Shop *(opsional)* | Buff, masak, ekonomi merchant |
| [29](29-elemental-reaction.md) | Elemental Reaction *(lanjutan)* | 16 reaksi, ICD, gauge, VFX/SFX |
| [30](30-dungeon-multiroom.md) | Dungeon Multi-Room *(lanjutan)* | Ruang berantai + timer + rating ★ |
| [31](31-coop-multiplayer.md) | Co-op Multiplayer *(advanced)* | Session, replikasi, aturan co-op |
| [32](32-battle-pass.md) | Battle Pass *(lanjutan)* | Level BP, misi daily/weekly, reward |
| [33](33-polish-juice.md) | Polish & Juice *(lanjutan)* | Loading, glow, screen fx, particle, sound |
| [34](34-cutscene.md) | Cutscene *(lanjutan)* | Level Sequencer, trigger, skip, dialog |
| [35](35-controller-support.md) | Controller Support *(lanjutan)* | Gamepad, navigasi UI, button prompt |
| [36](36-localization.md) | Localization *(lanjutan)* | String Table + Dashboard, multi-bahasa |
| [37](37-steam-deck.md) | Steam Deck *(lanjutan)* | Scalability, UI scaling, input handheld |

Tiap bagian selesai = **Play test dulu** sebelum lanjut. Rusak di bagian N,
jangan lanjut ke N+1.

## Hubungan dengan project besar

Semua yang kamu bikin di sini versi "mainan"-nya. Versi produksi (C++,
lengkap) ada di `aether-realm-ue5/` — modul 14 course utama mengajakmu
membedahnya. Contoh: stamina bagian 09 → `CharacterBase::TickStamina`,
gliding bagian 10 → `UOpenWorldMovementComponent::StartGliding`.
