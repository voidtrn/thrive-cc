# Aether Realm — Mini Open World Action RPG (UE 5.4)

Genshin-inspired, skala indie/solo dev. Third-person, anime cel-shaded,
elemental combat, 1 region ±1km², World Partition streaming.

**Target:** Steam PC, 60fps @ RTX 2060/GTX 1660. Prototype 3-4 bulan solo.

## Status

| Phase | Isi | Status |
|---|---|---|
| **1. Foundation** | Project structure, World Partition, framework classes, Enhanced Input | ✅ kode selesai — lihat [Docs/PHASE1_SETUP.md](Docs/PHASE1_SETUP.md) untuk langkah editor |
| **2. Character & Rendering** | CharacterBase + stats + GAS hook, custom movement (sprint/glide), lock-on, camera system, AnimInstance; cel-shading recipes | ✅ kode selesai — lihat [Docs/PHASE2_SETUP.md](Docs/PHASE2_SETUP.md) |
| **3. Combat System** | Combo/charged/plunge/dodge, abilities E+Q, elemental reactions (full matrix), enemy AI, damage numbers | ✅ kode selesai — lihat [Docs/PHASE3_SETUP.md](Docs/PHASE3_SETUP.md) |
| **4. Open World Systems** | Climbing/glide/swim + stamina penuh, waypoint, statue, day/night, weather, chest, oculi, save system | ✅ kode selesai — lihat [Docs/PHASE4_SETUP.md](Docs/PHASE4_SETUP.md) |
| **5. Gacha / Wish** | Banner (4 tipe), pity + 50/50 + epitomized path, currency (primogems/fates/starglitter/stardust) | ✅ kode selesai — lihat [Docs/PHASE5_SETUP.md](Docs/PHASE5_SETUP.md) |
| **6. Quest & Dialogue** | Quest engine (4 tipe + daily commission + AR), dialogue tree (choices, conditions, actions) | ✅ kode selesai — lihat [Docs/PHASE6_SETUP.md](Docs/PHASE6_SETUP.md) |
| **7. UI/Menu System** | HUD data binding, party swap system, minimap capture, inventory/artifact types, map pins, wish history, resonance | ✅ kode selesai — lihat [Docs/PHASE7_SETUP.md](Docs/PHASE7_SETUP.md) |
| **8. Steam & Release** | OSS Steam, achievements, rich presence, co-op replication, build + SteamPipe scripts | ✅ kode selesai — lihat [Docs/PHASE8_RELEASE.md](Docs/PHASE8_RELEASE.md) |
| **9. Production** | Timeline 14 bulan, optimization budgets, scope rules | 📋 [Docs/PHASE9_PRODUCTION.md](Docs/PHASE9_PRODUCTION.md) |
| **10. Progression** | Weapon/artifact stat aggregation, talent, constellation | ✅ kode selesai — lihat [Docs/PHASE10_PROGRESSION.md](Docs/PHASE10_PROGRESSION.md) |
| **11. Content Systems** | Buff, consumable/cooking, shop/merchant, domain arena | ✅ kode selesai — lihat [Docs/PHASE11_CONTENT_SYSTEMS.md](Docs/PHASE11_CONTENT_SYSTEMS.md) |
| **12. Meta Progression** | World Level (AR → enemy scaling), Resin (gate reward, regen offline), Expedition (idle dispatch) | ✅ kode selesai — data di [Docs/DATA_TABLES.md](Docs/DATA_TABLES.md) |
| **13. Achievement, Reputation, Refinement** | Achievement stat-driven (8 hook C++ + klaim primogem), reputasi region (kurva EXP + reward), weapon refinement (konsumsi duplikat, pasif skala R1-R5) | ✅ kode selesai — data di [Docs/DATA_TABLES.md](Docs/DATA_TABLES.md) |
| **14. Yang Bikin Menarik** | Game Director pacing ala L4D2 (intensity + fase + ambush window), Story Act 1 "Bara yang Tersisa" (bible + 6 quest spec + 3 dialogue tree + lore journal), easter eggs (7 rahasia + secret achievement) | ✅ — [Docs/STORY_ACT1.md](Docs/STORY_ACT1.md) · [Docs/EASTER_EGGS.md](Docs/EASTER_EGGS.md) |
| **Data** | 17 DataTable JSON siap-import (280 row): items+lore, weapons, characters, sets, enemies, resep, shop, expedition, achievement, reputasi, banner, 3 dialogue tree, leveling economy | ✅ digenerate `Scripts/generate_*.py` |
| **Art A. Karakter** | Pipeline VRoid→Blender→UE5, spec 3 karakter (Kagari/Yukine/Shiden), enemy specs | 📋 [Docs/ART_A_CHARACTERS.md](Docs/ART_A_CHARACTERS.md) |
| **Art B. VFX** | Niagara specs 7 elemen + environment + combat polish (hit stop ✅ C++) | 📋 [Docs/ART_B_VFX.md](Docs/ART_B_VFX.md) |
| **Art C. Audio** | Footstep system ✅ C++, music manager ✅ C++, SFX/musik/VO specs | 📋 [Docs/ART_C_AUDIO.md](Docs/ART_C_AUDIO.md) |
| **Art D. Environment** | Style guide, palette, landscape blending, foliage, lighting & post | 📋 [Docs/ART_D_ENVIRONMENT.md](Docs/ART_D_ENVIRONMENT.md) |
| **Art E. Animasi** | Sumber + retarget pipeline, anim list lengkap, polish (motion warping ✅) | 📋 [Docs/ART_E_ANIMATION.md](Docs/ART_E_ANIMATION.md) |
| **Art F. UI Art** | Style guide, UI tween framework ✅ C++, character screen 3D | 📋 [Docs/ART_F_UI.md](Docs/ART_F_UI.md) |
| **Art G+H. Workflow** | Tool stack, naming conventions, final polish checklist | 📋 [Docs/ART_G_WORKFLOW.md](Docs/ART_G_WORKFLOW.md) |

## Struktur

```
MyGame.uproject
Config/              DefaultEngine/Game/Input.ini
Content/             (uasset dibuat di editor — struktur folder sudah disiapkan)
Source/MyGame/
  Public|Private/
    System/          GameMode, GameState, PlayerController (IMC switching),
                     PlayerState (party, replicated), GameInstance (persistence),
                     InputConfig data asset, SaveGame
    Character/       (Phase 2)
    Combat/          (Phase 2)
    UI/              (Phase 4)
    World/           (Phase 3)
    Network/         (co-op, arsitektur sudah replication-ready dari Phase 1)
Docs/PHASE1_SETUP.md langkah setup di Unreal Editor
```

## Arsitektur multiplayer-ready

- `AOpenWorldGameState`: world time & weather **replicated**
- `AOpenWorldPlayerState`: party & active character **replicated**, swap via **Server RPC**
- Logic validasi selalu server-side; single-player = listen server implisit
