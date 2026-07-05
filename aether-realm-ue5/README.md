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
