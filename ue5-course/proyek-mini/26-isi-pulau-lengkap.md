# Bagian 26 — Isi Pulau Lengkap (Merangkai Jadi Game)

Sistem sudah lengkap (Bagian 7-25). Sekarang **isi konten**: 1 pulau utuh
dengan 5 quest, 3 jenis musuh, 1 boss, collectible, alur main. Ini beda skill:
bukan bikin fitur, tapi **desain pengalaman**.

## Prinsip desain konten (baca dulu)

1. **Loop inti dulu**: eksplorasi → tantangan → hadiah → lebih kuat →
   eksplorasi lebih jauh. Tiap konten harus memberi makan loop ini.
2. **Ajari lewat bermain**, jangan lewat teks. Musuh pertama = lemah, di
   tempat aman. Glide pertama = jurang kecil yang jelas.
3. **Landmark = navigasi**. Menara/pohon raksasa terlihat dari jauh →
   pemain punya tujuan tanpa buka map.
4. **Kepadatan**: ada sesuatu menarik tiap ±30 detik jalan (chest, oculus,
   musuh, pemandangan). Kosong = bosan.

## 26A. Layout Pulau (peta kertas dulu!)

Gambar di kertas sebelum di editor. Contoh 1km²:

```
        [Puncak Salju + BOSS]  ← endgame area, butuh glide/climb
              │
        [Jembatan Rusak] ←── glide challenge
              │
   [Hutan]───[Desa NPC]───[Danau + Kuil]
      │       (hub quest)      │
   [Camp     [Statue/          [Oculi
    Musuh]    Waypoint]         tersembunyi]
      │
   [Pantai Start] ← spawn pemain, area aman & tutorial
```

Zona & fungsinya:
| Zona | Isi | Ngajarin |
|---|---|---|
| Pantai (start) | 2 slime lemah, 1 chest | combat dasar |
| Hutan | camp hilichurl, oculi | eksplorasi + fight kelompok |
| Desa | NPC quest, statue, waypoint | hub, teleport, quest |
| Danau/Kuil | puzzle chest, oculi air | glide/renang |
| Jembatan | jurang | glide challenge |
| Puncak | BOSS + luxurious chest | endgame |

## 26B. 3 Jenis Musuh (variasi = napas)

Reuse `BP_Enemy` (Bagian 15), variasikan lewat data + sedikit logic:

1. **Slime** (pantai/danau) — HP 30, lemah, gerak lambat bounce. Elemen:
   material beda (merah Pyro / biru Hydro). Ngajarin combat aman.
2. **Hilichurl** (hutan/camp) — HP 60, patroli kelompok 3-4, 1 serangan.
   Ngajarin lock-on & pilih target.
3. **Hilichurl Shield** (camp/jembatan) — HP 100, bawa perisai (kebal dari
   depan, harus diserang dari belakang / skill). Ngajarin positioning.

> 3 musuh cukup untuk 1 region. Variasi dari **penempatan & kombinasi**,
> bukan cuma jumlah jenis. 2 slime + 1 shield = encounter beda dari 4 hilichurl.

## 26C. 5 Quest (alur bertahap)

| # | Quest | Tipe | Ngajarin | Reward |
|---|---|---|---|---|
| 1 | "Selamat Datang" | Main | jalan ke desa, bicara NPC | senjata pertama |
| 2 | "Ladang Diserang" | Main | bunuh 3 hilichurl (Bagian 17) | gold + artifact |
| 3 | "Harta Tersembunyi" | Side | temukan 3 chest (pakai glide) | primogem |
| 4 | "10 Oculi" | Side | kumpul collectible | upgrade stamina |
| 5 | "Sang Ronin" | Main | kalahkan BOSS (Bagian 22) | 5★ senjata + banyak primogem |

Rantai: Quest 1 → buka 2 → 2 selesai buka 5 (boss). 3 & 4 opsional (side)
tapi hadiahnya bikin boss lebih gampang → **reward eksplorasi = power**.

Bikin: tiap quest = `QuestDataAsset` (Bagian 17), taruh NPC giver di desa,
marker (Bagian 18) nunjukin lokasi.

## 26D. Checklist Perakitan (urutan kerja di editor)

1. **Landscape** (Modul 09): sculpt layout 26A, paint material, lighting sore
2. **Landmark**: pohon raksasa di desa, menara di puncak — visible dari start
3. **NavMesh** (Bagian 15): tutup seluruh area yang bisa dijalani
4. **Waypoint + Statue** di desa (Bagian... project `AWaypoint`; versi mini:
   trigger teleport sederhana)
5. **Sebar musuh**: 26B, per zona, kepadatan naik ke puncak
6. **Sebar collectible**: 20 oculi (Bagian 12), 8 chest (Bagian 11) — 3 butuh glide
7. **NPC + 5 quest** (26C, Bagian 17/25)
8. **Boss** di puncak (Bagian 22) + gerbang (baru buka setelah Quest 2)
9. **Audio**: ambience per zona (Modul 12), musik combat
10. **Playtest jalur pemula**: dari spawn, bisakah orang baru paham tanpa
    dikasih tahu? Perbaiki yang bikin bingung.

## 26E. Tuning Balance

- Musuh awal: pemain menang tanpa mikir (bangun percaya diri)
- Camp hutan: butuh sedikit strategi (kelompok)
- Boss: butuh SEMUA skill (dodge telegraph, swap karakter, skill) + gear
  dari side quest. Kalau boss mustahil tanpa side quest → itu desain bagus
  (mendorong eksplorasi), asal ada petunjuk.
- Angka awal: player ATK 100, skill 200. Slime HP 30, hilichurl 60,
  shield 100, boss 3000. Sesuaikan sampai terasa pas saat playtest.

## 26F. Definition of Done (1 region)

- [ ] Pemain baru bisa main dari spawn → boss tanpa bingung arah
- [ ] 5 quest jalan tanpa soft-lock, reward masuk
- [ ] 3 musuh + boss balanced (menang tapi tidak gratis)
- [ ] 20 oculi + 8 chest, sebagian butuh glide/climb
- [ ] Waypoint teleport + save jalan
- [ ] Ambience + musik per zona
- [ ] 60 fps di area terpadat (Modul 13 profiling)
- [ ] Bisa di-package jadi .exe (Modul 13) & dimainkan orang lain

## 🏆 TAMAT — Kamu punya game

Dari nol (Modul 01) sampai **1 region action RPG playable lengkap**:
karakter, combat, elemen, boss, quest, dialog, inventory, gear, party,
minimap, save, polish — dirakit jadi pengalaman utuh.

Ini bukan lagi "belajar UE" — ini **membuat game**. Sisanya = mengulang
pola ini untuk region 2, karakter baru, konten lebih banyak.

Langkah nyata berikutnya:
1. **Rilis kecil**: potong jadi demo 15 menit → upload itch.io → dapat
   feedback nyata. Menyelesaikan & merilis > menyempurnakan selamanya.
2. **Naik ke C++**: [Modul 14](../14-capstone-aether-realm.md) — semua yang
   kamu bikin di track ini ADA versi produksinya di `aether-realm-ue5`.
   Bandingkan, pelajari kerapiannya, lanjutkan dari situ.
3. **Scope disiplin** ([PHASE9](../../aether-realm-ue5/Docs/PHASE9_PRODUCTION.md)):
   1 region, 3 karakter, 5 musuh — SELESAIKAN dulu sebelum menambah.

Selamat. Kamu sudah jadi game developer. 🎮
