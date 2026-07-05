# Bagian 27 — Domain / Dungeon (Arena Gelombang) · *opsional lanjutan*

> Track inti tamat di Bagian 26. Bagian 27-28 = konten tambahan setelah
> kamu nyaman. Domain = ruang tantangan: gelombang musuh + batas waktu →
> hadiah. Loop endgame Genshin.

## 27A. Level Interior

1. Level baru `L_Domain` (interior — arena tertutup, bukan open world).
   Bisa juga sub-area di pulau yang dipagari.
2. Lantai + dinding + pencahayaan dramatis (Modul 09). NavMesh tutup arena
   (Bagian 15 — wajib buat AI).
3. **Portal masuk** di pulau: `BP_DomainPortal` (mesh bercahaya + trigger).
   Interact → `Open Level "L_Domain"` (atau Level Instance kalau mau seamless).

## 27B. Domain Manager

`BP_DomainManager` (Actor di L_Domain):

Variables:
| Nama | Type |
|---|---|
| `Waves` | Array of `S_Wave` (struct: `Enemies` = Map EnemyClass→Count) |
| `CurrentWave` | Integer (-1) |
| `TimeLimit` | Float (180) |
| `TimeRemaining` | Float |
| `AliveEnemies` | Array of Actor (BP_Enemy) |
| `State` | Enum `EDomainState` {Idle, Active, Cleared, Failed} |

Logic:

```
[StartDomain]
   Set TimeRemaining = TimeLimit, State = Active
   [SpawnWave(0)]

[SpawnWave] (Index)
   Set CurrentWave = Index, clear AliveEnemies
   [For Each Enemies di Waves[Index]]
      [For i = 0 to Count]
         [Spawn BP_Enemy] di titik acak dalam arena
         [Bind ke event mati enemy → CekWaveClear]
         [Add ke AliveEnemies]
   [Update UI "Wave {Index+1}/{total}"]

[Event Tick] (kalau State == Active)
   TimeRemaining -= Delta
   [Branch: TimeRemaining <= 0] → State = Failed, hapus musuh sisa

[CekWaveClear]  (dipanggil tiap enemy mati)
   [Remove musuh mati dari AliveEnemies]
   [Branch: AliveEnemies kosong?]
     True:
       [Branch: masih ada wave berikutnya?]
         True  → [Delay 2s] → SpawnWave(CurrentWave+1)
         False → State = Cleared → [BeriHadiah]
```

> "Bind ke event mati enemy": di BP_Enemy tambah **Event Dispatcher**
> `OnDied` (Bagian 04), Call saat mati. Domain manager Bind ke tiap enemy
> yang di-spawn. (Versi C++ pakai delegate `OnDied` yang sudah ada.)

## 27C. Hadiah & Kegagalan

```
[BeriHadiah]  (State Cleared)
   [Spawn BP_Chest_Luxurious] di tengah arena (Bagian 11)
   [UI: layar "DOMAIN CLEARED" + waktu tersisa]
   [Grant artifact/weapon] (Bagian 24) ke inventory
   [Portal keluar aktif]

[Gagal]  (State Failed)
   [UI: "WAKTU HABIS" + tombol Coba Lagi / Keluar]
```

## 27D. Domain HUD

`W_DomainHUD`:
```
┌────────────────────────────┐
│   ⏱ 02:34      Wave 2/3    │
└────────────────────────────┘
```
- Timer (bind TimeRemaining → format MM:SS: Floor/60 & mod 60)
- Wave counter (bind CurrentWave+1 / total)
- State Cleared/Failed → panel besar

## ✅ CHECKPOINT

- [ ] Portal → masuk domain → wave spawn
- [ ] Clear semua musuh wave → wave berikut (jeda 2s)
- [ ] Semua wave clear → hadiah; waktu habis → gagal
- [ ] Timer + wave counter akurat di HUD

> Versi produksi: `ADomainChallenge` (C++, next-tick clear check, state
> delegate) — `aether-realm-ue5/Docs/PHASE11_CONTENT_SYSTEMS.md`.

➡️ [Bagian 28 — Cooking & Shop](28-cooking-shop.md)
