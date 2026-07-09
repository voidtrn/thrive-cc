# Data Tables — Semua Data Konten Siap-Import

Seluruh layer data game terisi sebagai JSON siap-import di `Content/Data/`.
Dua generator (`Scripts/generate_leveling_data.py` + `generate_content_data.py`)
adalah sumber angka — **ubah balance di script, jangan edit JSON manual**,
jalankan ulang, Reimport di editor. Cross-reference antar tabel (material di
biaya ada di DT_Items, pool banner ada di roster, dst) divalidasi generator.

## Leveling economy (`generate_leveling_data.py`)

| File | Row Struct | Rows | Dipakai oleh |
|---|---|---|---|
| `DT_CharacterAscension.json` | `FAscensionCostRow` | 18 (3 char × 6 phase) | `ULevelingComponent::AscendCharacter` |
| `DT_WeaponAscension.json` | `FAscensionCostRow` | 36 (6 weapon × 6 phase) | `AscendWeapon` |
| `DT_TalentCost.json` | `FTalentCostRow` | 81 (3 char × 3 talent × lv 2-10) | `LevelUpTalent` |

## Konten (`generate_content_data.py`)

| File | Row Struct | Rows | Dipakai oleh |
|---|---|---|---|
| `DT_Items.json` | `FItemDefRow` | 27 | Inventory UI (Phase 7) |
| `DT_Weapons.json` | `FWeaponDefRow` | 6 | `UCharacterProgressionComponent::WeaponTable` |
| `DT_Characters.json` | `FCharacterDefRow` | 3 | Party/registry (`CharacterClass` assign di editor) |
| `DT_ArtifactSets.json` | `FArtifactSetRow` | 5 | `ApplySetBonuses` + `UArtifactSetEffectComponent` |
| `DT_EnemyStats.json` | `FEnemyStatsRow` | 10 | `AEnemyBase::StatsRowName` |
| `DT_Consumables.json` | `FConsumableDefRow` | 5 | `UConsumableComponent` (cooking + efek) |
| `DT_Shop_General.json` | `FShopItemRow` | 10 | `UShopComponent::ShopTable` (BP_NPC_Merchant) |
| `DT_Expeditions.json` | `FExpeditionRow` | 7 | `UExpeditionSubsystem` (UI oper table ke API) |
| `DT_Achievements.json` | `FAchievementRow` | 20 | `UAchievementSubsystem` (unlock derived dari LifetimeStats) |
| `DT_ReputationRewards.json` | `FReputationRewardRow` | 9 | `UReputationSubsystem::ClaimReward` (key `<Region>_<Level>`) |
| `DT_Banners.json` | `FBannerData` | 4 | `UWishSystem::Pull` (UI banner picker) |

Catatan desain konten:
- **Roster**: Kagari 5★ (limited banner `Banner_Limited_Kagari`), Yukine 4★
  (guaranteed Beginner pull-10), Shiden 4★ (pool + featured limited).
- **Senjata baru**: `Sword_Flameforged` (4★, `Passive_SkillDMG`) dan
  `Bow_Gale` (4★) menambah variasi pool 4★ wish; PassiveId dibaca gameplay
  BP untuk efek refinement.
- **Set artifact**: `Set_NoblesseOblige` / `Set_CrimsonWitch` /
  `Set_Instructor` — `FourPieceEffectId` HARUS persis nama yang dibaca
  `UArtifactSetEffectComponent` (`NoblesseOblige`/`CrimsonWitch`/`Instructor`).
  `Set_Gladiator` & `Set_Maiden` stat-only.
- **Enemy**: tier T1 (lv ~5, region start) & T2 elite (lv 20, drop
  `Mat_SlimeCore`), slime immune elemen sendiri (RES 1.0), 1 world boss
  (`Boss_StormColossus`, drop gem+core+relic, artifact 100%).
- **Banner limited**: window 21 hari (2026.07.01 → 07.22) — format FDateTime
  JSON: `yyyy.mm.dd-hh.mm.ss`. Standard/Beginner tanpa tanggal = selalu aktif.

## Import di editor

1. Content Browser → `Content/Data` → kanan-klik → **Miscellaneous > Data Table**
   → pilih Row Struct sesuai tabel di atas, beri nama persis sama dengan
   nama file (tanpa .json).
2. Buka DataTable → toolbar **Reimport** → pilih JSON-nya (atau drag-drop JSON
   ke Content Browser; UE auto-deteksi format array-of-objects dengan field `Name`).
3. Assign:
   - `LevelingComponent` (BP_PlayerController): `CharacterAscensionTable` /
     `WeaponAscensionTable` / `TalentCostTable`
   - `CharacterProgressionComponent` (BP_PlayerCharacter): `WeaponTable` =
     DT_Weapons, `ArtifactSetTable` = DT_ArtifactSets
   - `ConsumableComponent`: DT_Consumables · `ShopComponent` (BP_NPC_Merchant):
     DT_Shop_General · `AEnemyBase` BP child: `StatsRowName` = row DT_EnemyStats
   - UI wish (Phase 5): baca row DT_Banners
4. Asset refs sengaja kosong di JSON (Icon/Mesh/Portrait/CharacterClass).
   ⚠️ **Reimport me-rebuild seluruh row** — kolom yang diisi manual di editor
   ikut ke-reset. Setelah art/BP ada, tulis path asset-nya BALIK ke script
   (soft ref = string path, mis. `"/Game/UI/Icons/T_Kagari.T_Kagari"`) supaya
   reimport aman selamanya.

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
