# Bagian 30 — Dungeon Multi-Room + Rating · *lanjutan*

Beda dari [Bagian 27](27-domain-dungeon.md) (arena 1-ruang wave): ini
dungeon **beberapa ruangan** berantai + timer + rating bintang. Level konten
Genshin domain sungguhan.

## 30A. Level Dungeon

`L_Domain_ForestCave` (Empty Level):
- Interior gua/dungeon, gelap, cahaya dari torch/kristal
- Layout berantai:

```
[Entrance] → [Room 1: 3-5 musuh] → [Lorong] → [Room 2: Elite]
→ [Lorong] → [Boss Room] → [Treasure Room]
```

- NavMesh tutup semua ruangan (Bagian 15 — wajib)
- **Pintu antar-ruang**: `BP_DungeonDoor` (mesh + collision block) —
  tertutup sampai ruangan sebelumnya clear

## 30B. Entrance & Requirement

`BP_DomainEntrance` di dunia utama:
- Mesh portal + glow VFX + Widget (nama + level requirement)
- Variables: `DomainLevel` (Soft Object Ref level), `ARRequirement` (int),
  `DomainType` (Name: Artifact/Material/Weapon/Talent)

```
[Interact]
   [Branch: AR player >= ARRequirement?]
     False → UI "Belum memenuhi syarat (butuh AR {n})"
     True  → UI party setup → konfirmasi → [Open Level DomainLevel]
```

> `Open Level` pakai **Soft Object Reference** + `Get Clean Level Name`.
> Loading screen: tampilkan `W_LoadingScreen` sebelum Open Level.

## 30C. Room Manager

`BP_DungeonManager` (Actor di level dungeon):

Variables: `Rooms` (Array of `S_Room{DoorToOpen, EnemySpawns}`),
`CurrentRoom` (int), `StartTime` (float), `TargetTime` (float 180).

```
[BeginPlay]
   Set StartTime = waktu sekarang
   [AktifkanRuang(0)]

[AktifkanRuang] (Index)
   [Spawn musuh ruang ini] (bind mati → CekRuangClear)
   [Update UI]

[CekRuangClear]  (tiap musuh mati)
   [Branch: semua musuh ruang ini mati?]
     True:
       [Buka DungeonDoor ruang ini] (animasi + suara)
       [Branch: masih ada ruang?]
         True  → tunggu player masuk ruang berikut (trigger) → AktifkanRuang(+1)
         False → [SelesaiDungeon]
```

Ruang terakhir = **Boss** ([Bagian 22](22-boss-fight.md) — multi-phase).

## 30D. Timer & Rating

```
[SelesaiDungeon]
   ClearTime = waktu sekarang - StartTime
   Rating:
     ClearTime <= TargetTime      → ★★★
     ClearTime <= TargetTime × 2  → ★★
     else                          → ★
   [Simpan BestTime kalau lebih cepat] (GameInstance/save)
   [SpawnTreasure(DomainType)]
   [Tampilkan W_DomainResult]
```

`SpawnTreasure` per tipe:
- Artifact domain → artifact acak dari set tertentu ([Bagian 24](24-weapon-artifact.md))
- Material/Weapon/Talent → item ascension/talent book ke inventory

## 30E. Result Screen

`W_DomainResult`:
```
┌──────────────────────────┐
│   DOMAIN CLEAR!          │
│   Waktu: 02:45           │
│   Rating: ★★★            │
│   Hadiah:                │
│   - Brave's Flower ×1    │
│   - Mora ×5000           │
│   - Adventure EXP ×100   │
│        [Lanjut]          │
└──────────────────────────┘
```
[Lanjut] → portal keluar → `Open Level` balik ke dunia utama, spawn di depan
entrance.

## ✅ CHECKPOINT

- [ ] Portal cek AR → masuk dungeon (loading screen)
- [ ] Ruang clear → pintu buka → lanjut; boss di ruang akhir
- [ ] Timer jalan, rating ★ sesuai waktu, best time tersimpan
- [ ] Hadiah sesuai DomainType, result screen muncul
- [ ] Keluar → balik dunia utama di depan portal

> Versi arena sederhana (1 ruang wave): `ADomainChallenge` C++
> ([Bagian 27](27-domain-dungeon.md) / Phase 11). Multi-room ini
> perluasannya.

➡️ [Bagian 31 — Co-op Multiplayer](31-coop-multiplayer.md)
