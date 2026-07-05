# SECTION G — Production Tools, Naming, & Final Checklist

## G1. Tool Stack (rekomendasi solo dev, prioritas gratis)

| Kebutuhan | Pilihan utama | Alternatif |
|---|---|---|
| 3D modeling | **Blender** | — |
| Karakter anime | **VRoid Studio** | Character Creator 4 (paid) |
| Texturing | Blender built-in | Substance Painter (paid, worth it kalau budget) |
| Sculpt | Blender sculpt | ZBrush |
| Animasi | **Mixamo** + Blender | Cascadeur (physics-assist) |
| VFX | **Niagara** (built-in) | EmberGen untuk flipbook api (paid) |
| Audio | **MetaSounds** + Reaper ($60) | Wwise/FMOD (free indie), Audacity |
| SFX library | Freesound (attribution!), ZapSplat | Soundly sub, Boom (premium) |
| Musik | Komposer freelance (r/gameDevClassifieds, Fiverr) | Buat sendiri (Reaper/FL), AI (Suno/Udio — **cek lisensi komersial dulu**) |
| VO | Casting Call Club, Fiverr | ElevenLabs (AI — cek lisensi + disclosure Steam) |
| PM | **Notion** (docs+task) | Trello, HacknPlan (gamedev-specific) |
| VCS | **Git + Git LFS** (uasset = LFS) | Perforce free <5 user (lebih baik untuk binary besar kalau tim) |

Git LFS setup (`.gitattributes` di project root):
```
*.uasset filter=lfs diff=lfs merge=lfs -text
*.umap filter=lfs diff=lfs merge=lfs -text
*.fbx filter=lfs diff=lfs merge=lfs -text
*.png filter=lfs diff=lfs merge=lfs -text
*.wav filter=lfs diff=lfs merge=lfs -text
```

## G2. Naming Conventions (WAJIB konsisten dari hari 1)

| Tipe | Pola | Contoh |
|---|---|---|
| Texture | `T_<Asset>_<Part>_<Map>` | `T_Kagari_Body_BaseColor`, `T_Kagari_Body_MRAO`, `T_Env_TreeOak_Bark_BaseColor`, `T_UI_Icon_Sword_IronSword` |
| Static mesh | `SM_<Category>_<Name>` | `SM_Env_TreeOak`, `SM_Prop_Chest_Common` |
| Skeletal mesh | `SK_<Name>` | `SK_Kagari`, `SK_Enemy_Hilichurl` |
| Animation | `A_<Char>_<Category>_<Name>` | `A_Kagari_Locomotion_WalkF`, `A_Enemy_Hilichurl_Death01` |
| Montage | `AM_<Char>_<Name>` | `AM_Kagari_Skill` |
| Blend space | `BS_<Char>_<Name>` | `BS_Shared_Locomotion` |
| Material | `M_` master / `MI_` instance / `MF_` function / `MPC_` collection | `M_Character_Anime`, `MI_Kagari_Body`, `MF_CelShading` |
| Niagara | `NS_<Category>_<Name>` | `NS_Pyro_SkillImpact`, `NS_Env_Rain`, `NS_UI_WishStar` |
| Sound | `SFX_/MUS_/VO_/AMB_` | `SFX_Combat_Sword_Swing_01`, `MUS_Meadow_Day`, `VO_Kagari_Skill_01`, `AMB_Forest_Night` |
| Blueprint | `BP_<Name>` | `BP_Kagari`, `BP_Enemy_Hilichurl`, `BP_Chest_Common` |
| Widget | `WBP_<Name>` | `WBP_MainHUD`, `WBP_CharacterScreen` |
| Data | `DT_` table / `DA_`/`QA_`/`BA_` asset | `DT_EnemyStats`, `DA_InputConfig`, `QA_Archon_01` |
| Render target / Physics | `RT_` / `PM_` / `PHYS_` | `RT_Minimap`, `PM_Grass` |
| Level | `L_` / `LI_` instance | `L_OpenWorld`, `LI_Dungeon_01` |

Angka variasi selalu 2 digit: `_01`, `_02`.

## SECTION H — Final Polish Checklist (pre-release)

**Game feel:**
- [ ] Combat: hit stop ✅C++ + shake + impact VFX + sound sync dalam 1-2 frame
- [ ] Movement responsif — input lag < 100ms, akselerasi smooth, no jank
- [ ] Camera: no clipping (probe ✅), smooth follow, FOV nyaman

**Konten:**
- [ ] UI: semua tombol berfungsi, navigasi gamepad, feedback jelas (tween ✅)
- [ ] Audio: tidak ada aksi tanpa suara, mixing balance (music -6dB di bawah SFX), no clipping
- [ ] VFX: tidak ada event tanpa efek; `stat particles` dalam budget
- [ ] Animasi: **zero T-pose**, transisi mulus, no foot sliding (cek speed BS = speed movement)
- [ ] Environment: no floating object, no hole terrain, LOD pop minimal
- [ ] Lighting: no blown highlight / pitch black — exposure min-max ketat

**Sistem:**
- [ ] Quest: tidak ada trigger putus / soft-lock (test semua urutan aneh)
- [ ] Save/load: mid-quest, mid-combat, semua state balik benar; no corrupt
- [ ] Performance: 60fps stabil di GTX 1660 — profiling ritual Phase 9
- [ ] Controller: full support + button prompt sesuai (KB/M ↔ gamepad auto-swap)
- [ ] Steam: overlay ✓, achievements trigger ✓, cloud sync ✓ (checklist Phase 8)
- [ ] Localization: **zero hardcoded text** — semua FText + String Table
  (`Content/Data/ST_UI`, `ST_Dialogue`); Localization Dashboard gather → translate

## Prioritas eksekusi (sesuai final instructions)

1. **Combat feel dulu**: hit stop ✅ + `AVFXManager` ✅ (bind NS reaction) +
   `UFootstepComponent` ✅ + impact sounds → game langsung terasa enak
2. **Character pipeline**: 1 karakter (Kagari) VRoid→UE5 sampai jalan
   in-game dengan cel-shading — validasi pipeline sebelum bikin 2 lagi
3. Sisanya ikuti timeline Phase 9
