# PHASE 10 — Progression: Weapon, Artifact, Talent, Constellation

C++ selesai: `UCharacterProgressionComponent` (agregasi stat),
`WeaponTypes.h` (FWeaponDefRow, FWeaponInstance, FTalentLevels),
integrasi save (OwnedWeapons, CharacterTalents, CharacterConstellations).
Artifact type sudah ada dari Phase 7 (`UI/InventoryTypes.h`).

---

## Model stat (Genshin-like)

```
HP  = BaseHP  × (1 + HP%)  + flatHP
ATK = (BaseCharATK + WeaponBaseATK) × (1 + ATK%) + flatATK
DEF = BaseDEF × (1 + DEF%) + flatDEF
EM  = Σ flat EM
CritRate = 5%  + Σ crit rate      CritDMG = 50% + Σ crit dmg
EnergyRecharge = 100% + Σ ER
```

Base karakter naik per level (`StatPerLevelFactor` — lvl 90 ≈ 8× base).

## Setup editor

### 1. Weapon DataTable

`Content/Data/DT_Weapons` — Row Struct **WeaponDefRow**. Contoh:

| RowName | Type | Rarity | BaseATK Lv1 | ATK/Lvl | SubStat | SubBase |
|---|---|---|---|---|---|---|
| Sword_Iron | Sword | 3 | 40 | 7 | CritRate | 0.06 |
| Claymore_Flame | Claymore | 5 | 48 | 9 | ATKPercent | 0.10 |
| Catalyst_Frost | Catalyst | 4 | 44 | 8 | EnergyRecharge | 0.10 |

### 2. Pasang komponen

`BP_PlayerCharacter` → Add Component → **CharacterProgressionComponent**:
- `WeaponTable` = DT_Weapons
- `BaseHPLevel1 / BaseATKLevel1 / BaseDEFLevel1` sesuai karakter
  (bisa beda per karakter — set di BP child masing-masing)

### 3. Equip & recalc

Saat ganti senjata/artifact/level:
```
Set EquippedWeapon / EquippedArtifacts / Talents
→ ProgressionComponent → Recalculate()   ← tulis ulang stat ke CharacterBase
```
`Recalculate` dipanggil otomatis di BeginPlay. Panggil manual tiap perubahan
gear di menu Character (Phase 7 UI).

### 4. Talent

`Talents` (FTalentLevels: NormalAttack/ElementalSkill/ElementalBurst 1-10).
Ability BP: kalikan damage dengan `GetTalentMultiplier(Talents.ElementalSkill)`
saat `DealDamage` — skill lvl 6 = 1.5× base. Simpan per karakter di
`GameInstance->CharacterTalents` (key = CharacterID), muat saat spawn.

### 5. Constellation

`SetConstellation(0-6)` per karakter (dari duplikat wish — hook `OnWishCompleted`
kalau item = karakter yang sudah dimiliki → +1 constellation). Gameplay baca
`GetConstellation() >= 1` (C1), `>= 2` (C2), dst untuk unlock efek
(BP: cek di ability OnActivate — mis. C2 skill +1 charge, C6 burst +damage).

## Alur wish → constellation (opsional wiring)

Bind `UWishSystem::OnWishCompleted`:
```
For Each result:
  Branch: ItemId sudah di OwnedWishItems (duplikat) DAN item = karakter?
    True → CharacterConstellations[ItemId] += 1 (clamp 6)
           → kalau karakter aktif, ProgressionComp->SetConstellation(baru)
```

## Persistence

Otomatis ikut save: `OwnedWeapons`, `OwnedArtifacts` (Phase 7),
`CharacterTalents`, `CharacterConstellations`. Muat di `LoadFromSlot`.

## Checklist Phase 10

- [ ] DT_Weapons berisi 3+ senjata, equip mengubah ATK karakter
- [ ] 5 artifact ter-equip → HP/Crit/dst berubah sesuai main+substat
- [x] Set bonus 2/4-piece — sudah C++ (`ApplySetBonuses`). Buat
  `DT_ArtifactSets` (Row **ArtifactSetRow**: TwoPieceBonus, FourPieceStatBonus,
  FourPieceEffectId), assign ke `ArtifactSetTable`. 4-piece effect ID dibaca
  gameplay via `GetActiveSetEffects()`
- [ ] Talent lvl naik → damage skill naik
- [ ] Constellation dari duplikat karakter, efek C1-C6 aktif
- [ ] Semua persist setelah save/load
