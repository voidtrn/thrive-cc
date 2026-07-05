# 🎮 Unreal Engine 5 — Zero to Super Hero

Course lengkap dari nol (belum pernah buka UE) sampai bisa mengerjakan
project open world action RPG (`aether-realm-ue5` di repo ini).

## Cara pakai course ini

1. **Urut.** Tiap modul bergantung pada modul sebelumnya.
2. **Praktik > baca.** Tiap modul ada bagian `🔨 PRAKTIK` — kerjakan di editor,
   jangan cuma dibaca. Ada `✅ CHECKPOINT` untuk cek pemahaman.
3. **Tentang "gambar"**: course ini pakai **diagram ASCII** (layout editor,
   node graph) + **path klik presisi** (`Edit → Project Settings → Input`).
   Untuk screenshot asli, tiap modul ada link ke dokumentasi resmi Epic
   (dev.epicgames.com) yang bergambar. Kombinasi keduanya cukup untuk
   mengikuti tanpa nebak.
4. Estimasi: 1 modul = 1-3 jam praktik. Total ±6-10 minggu santai.

## Peta Course

| # | Modul | Skill yang didapat |
|---|---|---|
| [01](01-instalasi-dan-tur-editor.md) | Instalasi & Tur Editor | Install, buka project, kenal semua panel |
| [02](02-navigasi-level-actor.md) | Level, Actor, Viewport | Gerak di viewport, taruh & atur objek |
| [03](03-blueprint-dasar.md) | Blueprint Dasar | Logika visual: event, variabel, branch |
| [04](04-blueprint-lanjutan.md) | Blueprint Lanjutan | Komunikasi antar BP, cast, interface, dispatcher |
| [05](05-material-dan-mesh.md) | Mesh & Material | Import model, bikin material, cel-shading intro |
| [06](06-karakter-dan-input.md) | Karakter & Input | Character BP, Enhanced Input, kamera |
| [07](07-animasi.md) | Animasi | Skeleton, Blend Space, Anim BP, Montage |
| [08](08-gameplay-collision-ui.md) | Gameplay: Collision, Damage, UI | Trace, overlap, HP bar UMG |
| [09](09-world-building.md) | World Building | Landscape, foliage, lighting, World Partition |
| [10](10-cpp-dasar.md) | C++ untuk Pemula BP | Setup, class pertama, BP ↔ C++ |
| [11](11-arsitektur-game.md) | Arsitektur Game | GameMode dkk, Subsystem, DataTable, SaveGame |
| [12](12-audio-vfx.md) | Audio & VFX | Niagara dasar, MetaSounds dasar |
| [13](13-optimasi-packaging.md) | Optimasi & Packaging | Profiling, LOD, build .exe |
| [14](14-capstone-aether-realm.md) | 🏆 Capstone | Menjelajah & memodifikasi project aether-realm-ue5 |

### 🎯 Track Praktik: [Proyek Mini "Genshin-ku"](proyek-mini/README.md)

Bangun mini open world 100% Blueprint — kerjakan bareng modul 01-08:

| Bagian | Hasil |
|---|---|
| [07 Rapikan Karakter Anime](proyek-mini/07-rapikan-karakter-anime.md) | Physics rambut/rok VRoid, Mixamo, posisi mesh |
| [08 Sprint](proyek-mini/08-sprint.md) | Shift = lari |
| [09 Stamina](proyek-mini/09-stamina.md) | Drain/regen + bar HUD |
| [10 Gliding](proyek-mini/10-gliding.md) | Terbang ala Genshin |
| [11 Chest](proyek-mini/11-chest-interaksi.md) | Interaksi tekan F |
| [12 Oculi](proyek-mini/12-oculi-collectible.md) | Collectible + counter + reward |
| [13 Combat](proyek-mini/13-combat-serangan.md) | Combo 3-hit dengan buffer |
| [14 Damage](proyek-mini/14-damage-system.md) | Interface + floating numbers |
| [15 Enemy](proyek-mini/15-enemy-sederhana.md) | AI state machine + NavMesh |
| [16 Skill](proyek-mini/16-skill-element.md) | Pyro slash AOE + cooldown |
| [17 Quest](proyek-mini/17-quest-system.md) | Quest system + NPC giver |
| [18 Marker](proyek-mini/18-objective-marker.md) | Penunjuk quest + jarak |
| [19 Party Swap](proyek-mini/19-party-swap.md) | Ganti karakter 1-4 |
| [20 Minimap](proyek-mini/20-minimap.md) | Minimap bulat + marker |
| [21 Polish](proyek-mini/21-polish-qol.md) | Hit stop, shake, save, settings |
| [22 Boss Fight](proyek-mini/22-boss-fight.md) | Multi-phase + telegraph |
| [23 Inventory](proyek-mini/23-inventory-ui.md) | Grid + detail + filter |
| [24 Weapon/Artifact](proyek-mini/24-weapon-artifact.md) | Stat system |
| [25 Dialog Bercabang](proyek-mini/25-dialog-bercabang.md) | Branching + typewriter |
| [26 Isi Pulau](proyek-mini/26-isi-pulau-lengkap.md) | 🏆 Rakit jadi game utuh |

## Prasyarat

- PC: GTX 1060/RX 580 ke atas, RAM 16GB, SSD 150GB kosong
- Tidak perlu bisa coding — C++ baru masuk modul 10, itu pun pelan
- Bahasa Inggris pasif (istilah editor bahasa Inggris)

## Sumber pendamping (gratis, bergambar/video)

- Dokumentasi resmi: https://dev.epicgames.com/documentation/en-us/unreal-engine
- Epic official learning: https://dev.epicgames.com/community/learning
- YouTube pemula bagus: "Unreal Sensei UE5 Beginner Tutorial" (5 jam, visual)

> Aturan emas: kalau bingung 15 menit, cari istilahnya di dokumentasi resmi
> atau YouTube, lalu balik ke course. Jangan lompat modul.
