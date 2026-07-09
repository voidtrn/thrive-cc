# Data Tables — Leveling Economy (isi CODE_REVIEW rekomendasi #6)

Tiga DataTable biaya leveling sudah terisi sebagai JSON siap-import di
`Content/Data/`. Angka dihasilkan `Scripts/generate_leveling_data.py` —
**ubah balance di script, jangan edit JSON manual**, lalu jalankan ulang
dan Reimport di editor.

| File | Row Struct | Rows | Dipakai oleh |
|---|---|---|---|
| `DT_CharacterAscension.json` | `FAscensionCostRow` | 18 (3 char × 6 phase) | `ULevelingComponent::AscendCharacter` |
| `DT_WeaponAscension.json` | `FAscensionCostRow` | 24 (4 weapon × 6 phase) | `AscendWeapon` |
| `DT_TalentCost.json` | `FTalentCostRow` | 81 (3 char × 3 talent × lv 2-10) | `LevelUpTalent` |

## Import di editor

1. Content Browser → `Content/Data` → kanan-klik → **Miscellaneous > Data Table**
   → pilih Row Struct (`AscensionCostRow` / `TalentCostRow`), beri nama persis:
   `DT_CharacterAscension`, `DT_WeaponAscension`, `DT_TalentCost`.
2. Buka DataTable → toolbar **Reimport** → pilih JSON-nya (atau drag-drop JSON
   ke Content Browser; UE auto-deteksi format array-of-objects dengan field `Name`).
3. Assign ketiganya ke `LevelingComponent` di BP_PlayerController:
   `CharacterAscensionTable` / `WeaponAscensionTable` / `TalentCostTable`.
4. `Polearm_Storm` (senjata Shiden, 4★) belum ada di contoh DT_Weapons
   PHASE10 — tambahkan row-nya: BaseATK 44, ATK/Lvl 8, SubStat EnergyRecharge.

## Konvensi row key (dibaca kode — jangan diubah)

- Ascension: `<Id>_<Phase>` — `Char_Kagari_0` = ascension pertama (20→40),
  `Sword_Iron_5` = terakhir (80→90).
- Talent: `<CharId>_<Talent>_<TargetLevel>` — `Char_Yukine_ElementalBurst_10`.
  Nama talent persis: `NormalAttack` / `ElementalSkill` / `ElementalBurst`.

## Katalog material (ItemId)

Inventory pakai FName bebas (`UOpenWorldGameInstance::AddItem`) — ini daftar
kanonis yang dipakai tabel. Sumber drop = rencana desain, wiring di editor.

| ItemId | Apa | Sumber rencana |
|---|---|---|
| `Mat_PyroGem` / `Mat_CryoGem` / `Mat_ElectroGem` | Gem elemen (ascension char) | Boss elemen, statue reward |
| `Mat_Flameherb` | Specialty Kagari | Foliage node region vulkanik |
| `Mat_Frostbloom` | Specialty Yukine | Node area salju |
| `Mat_Stormfruit` | Specialty Shiden | Node dataran tinggi |
| `Mat_BossCore` | Material boss dunia | World boss (weekly reset) |
| `Mat_SlimeGel` | Drop musuh common | Semua slime/mob kecil |
| `Mat_SlimeCore` | Drop musuh rare | Mob elite / slime besar |
| `Mat_TalentBook_Ember` / `_Frost` / `_Storm` | Buku talent per elemen | Domain talent (rotasi hari) |
| `Mat_WeeklyRelic` | Material weekly boss | Weekly boss, talent 8+ |
| `Mat_WeaponOre` | Ore ascension senjata | Mining node, shop |
| `Mat_WeaponCrystal` | Ore rare (phase 4+) | Domain senjata |
| `Item_HeroWit` | EXP karakter (20k) | Sudah dipakai kode (`LevelingComponent`) |
| `Item_MysticOre` | EXP senjata (10k) | Sudah dipakai kode |

## Kurva biaya (ringkas)

- **Char ascension**: mora 20k→120k; gem 1→20; specialty 3→60; drop common
  phase 0-2 lalu rare 3-5; boss core mulai phase 1 (2→14).
- **Weapon ascension**: skala rarity — mora `(rarity-2)×5k×(phase+1)`
  (3★ max 30k, 5★ max 90k); ore `(phase+1)×(rarity-1)`; crystal phase 3+.
- **Talent**: mora 5k→100k; buku 2→16; drop common lv2-6, rare lv7-10;
  weekly relic lv8/9/10 (1/1/2). Total 1 talent 1→10 ≈ 355k mora — mahal
  disengaja, endgame sink.

## Test cepat (cheat manager)

```
GiveItem Mat_PyroGem 20 | GiveItem Mat_Flameherb 60 | GiveItem Mat_SlimeGel 30
AddMora 500000
LevelUpChar 20  →  AscendChar    → cek material berkurang, cap naik ke 40
LevelTalent 1   → (index 0/1/2 = Normal/Skill/Burst) cek ELevelingResult di log
```
