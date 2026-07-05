# Bagian 24 — Weapon & Artifact (Stat System)

Senjata & artifact yang mengubah stat karakter. Ini "RPG" di action RPG:
grinding gear untuk jadi lebih kuat.

## Konsep stat akhir (versi mini)

```
ATK akhir = (BaseATK karakter + BaseATK senjata) × (1 + ATK%) + ATK flat
HP akhir  = BaseHP × (1 + HP%) + HP flat
Crit Rate = 5% + Σ dari artifact
Crit DMG  = 50% + Σ dari artifact
```

Sumber: **senjata** (1 base ATK + 1 substat) + **5 artifact**
(tiap-tiap: 1 main stat + beberapa substat).

## 24A. Data

1. **Structure** `S_WeaponData`: `WeaponID` (Name), `DisplayName` (Text),
   `BaseATK` (Float), `SubStatType` (Enum), `SubStatValue` (Float),
   `Icon`, `Rarity`.
2. **Enum** `EStatType`: `ATKFlat`, `ATKPercent`, `HPFlat`, `HPPercent`,
   `CritRate`, `CritDMG`, `EnergyRecharge`, `ElementalMastery`.
3. **Structure** `S_ArtifactData`: `Slot` (Enum: Flower/Plume/Sands/Goblet/
   Circlet), `MainStat` (EStatType), `MainValue` (Float), `SubStats`
   (Array of struct `S_StatRoll{StatType, Value}`), `Rarity`, `Level`.
4. Di karakter: `EquippedWeapon` (S_WeaponData), `EquippedArtifacts`
   (Array 5 slot of S_ArtifactData), plus base stats `BaseATK`, `BaseHP`,
   `BaseDEF`.

## 24B. Function Hitung Stat

`RecalculateStats` (di karakter — panggil tiap equip berubah):

```
[RecalculateStats]
   // 1. Kumpulkan flat & percent dari semua sumber
   [Reset: FlatATK=0, PercentATK=0, FlatHP=0, ... CritR=0.05, CritD=0.5]

   // 2. Senjata
   WeaponBaseATK = EquippedWeapon.BaseATK
   [TambahStat] (EquippedWeapon.SubStatType, SubStatValue)

   // 3. Artifact (loop 5)
   [For Each EquippedArtifacts]
      [TambahStat] (MainStat, MainValue)
      [For Each SubStats] → [TambahStat] (StatType, Value)

   // 4. Gabung
   Set ATK = (BaseATK + WeaponBaseATK) × (1 + PercentATK) + FlatATK
   Set MaxHP = BaseHP × (1 + PercentHP) + FlatHP
   Set CritRate, CritDMG = akumulasi
```

`TambahStat` (Input: StatType, Value) — **Switch on EStatType** → tambah ke
variabel akumulator yang sesuai. Persis pola `AccumulateStat` di project C++.

> Kenapa pisah flat vs percent lalu gabung di akhir? Karena percent ATK
> mengalikan (BaseATK+WeaponATK), bukan ATK flat dari artifact. Urutan
> operasi salah = angka ngawur. Ini kesalahan umum sistem stat.

## 24C. Equip dari Inventory

Di `W_ItemDetail` (Bagian 23), tombol "Equip" untuk senjata:

```
[OnClicked Equip]
   [Set EquippedWeapon = data senjata ini]
   [RecalculateStats]
   [Update Character Screen UI]
   [Set Skeletal Mesh senjata di socket "WeaponSocket"]  ← visual (Bagian 13D)
```

Artifact: drag ke slot atau klik slot artifact di Character Screen →
pilih dari list → set `EquippedArtifacts[SlotIndex]` → RecalculateStats.

## 24D. Character Screen

`W_CharacterScreen` (buka dari menu / C):

```
┌─────────────────────────────────┐
│ [Nama]  Lv.XX                   │
│  ┌─────────┐   HP    : 12,345   │
│  │ 3D/foto │   ATK   : 1,234    │
│  │ karakter│   DEF   :   567    │
│  └─────────┘   Crit  : 55%/120% │
│  [Senjata]  [Fl][Pl][Sa][Go][Ci]│
└─────────────────────────────────┘
```

- Panel stat: bind ke variabel karakter (update tiap RecalculateStats)
- Slot senjata + 5 slot artifact: Image + klik → panel pilih gear
- 3D preview: Scene Capture (Bagian 20 pola sama, kamera ke karakter di
  stage terpisah) — atau foto statis dulu

## 24E. Upgrade (Level Up Gear)

Sederhana: tombol "+" di detail artifact →

```
[UpgradeArtifact]
   [Branch: punya cukup material/gold?]
     True:
       [Level += 1]
       [MainValue × 1.1]  (atau tabel per level)
       [tiap 4 level: tambah/naikkan 1 substat]
       [kurangi gold]
       [RecalculateStats]
```

## ✅ CHECKPOINT

- [ ] Equip senjata → ATK karakter naik, mesh senjata muncul
- [ ] 5 artifact → HP/Crit/dst berubah sesuai main+substat
- [ ] Urutan flat vs percent benar (test: ATK% harus mengali base+weapon)
- [ ] Character screen menampilkan stat akurat, update saat ganti gear
- [ ] Upgrade artifact menaikkan stat

> Versi produksi lengkap (refinement, ascension, set bonus, constellation):
> `aether-realm-ue5` `UCharacterProgressionComponent` +
> `Docs/PHASE10_PROGRESSION.md`. Rumus & pola AccumulateStat identik.

➡️ [Bagian 25 — Dialog Bercabang](25-dialog-bercabang.md)
