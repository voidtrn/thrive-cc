# Aether Realm — Mini Open World Action RPG (UE 5.4)

Genshin-inspired, skala indie/solo dev. Third-person, anime cel-shaded,
elemental combat, 1 region ±1km², World Partition streaming.

**Target:** Steam PC, 60fps @ RTX 2060/GTX 1660. Prototype 3-4 bulan solo.

## Status

| Phase | Isi | Status |
|---|---|---|
| **1. Foundation** | Project structure, World Partition, framework classes, Enhanced Input | ✅ kode selesai — lihat [Docs/PHASE1_SETUP.md](Docs/PHASE1_SETUP.md) untuk langkah editor |
| 2. Character & Combat | Movement, glide/swim, combat, elemental system | ⏳ |
| 3. World & Progression | Waypoints, collectibles, enemies, dungeon | ⏳ |
| 4. UI & Polish | HUD, menus, wish system, cel-shading pass | ⏳ |

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
