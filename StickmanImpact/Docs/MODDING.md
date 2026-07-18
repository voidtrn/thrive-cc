# Modding — .smod Format & Community Plan

## Format

A **.smod** is a cooked UE pak file (renamed), shipped with a `<name>.mod.json` manifest
beside it in `<Project>/Mods/`:

```json
{
  "id": "phoenix-skin-pack",
  "name": "Phoenix Skin Pack",
  "author": "someone",
  "version": "1.2.0",
  "type": "skin",
  "mountRoots": ["/Game/Mods/PhoenixSkins"],
  "requires": []
}
```

`UModManagerSubsystem` scans, orders, conflict-checks (overlapping `mountRoots`), and
mounts enabled mods through the pak platform file — later mounts override earlier assets,
so the load order IS the override order. `AreModsActive()` flags the session; ranked/online
paths must refuse modded state (checked at the PvP/leaderboard entry points).

## Mod types → what they actually are

| Type | Content |
|---|---|
| skin | `FSkinDef` DataTable rows + meshes/VFX assets |
| map | streaming levels + `FRoomPiece` rows (roguelike domains are moddable by construction) |
| ui | widget blueprints overriding the UMG classes |
| gameplay | DataTable rows: `FEnemyArchetype`, `FBoonDef`, `FWorldEventEntry`, quests, dialogue |
| total-conversion | all of the above + a custom GameMode BP |

**The data-driven design is the mod API.** Everything a mod needs to add enemies
(archetype rows through `UEnemyFactory`), quests (`UQuestDataAsset`), dialogue
(`UDialogueSequence`), events, boons, skins — is already a DataTable/DataAsset the systems
load at runtime. Blueprint scripting rides the same BlueprintCallable surface every
subsystem publishes.

## Safety model

- A cooked pak carries **assets + Blueprint bytecode only** — no native code ships in a
  .smod. That's the sandbox: mods can call what BP can call, nothing else.
- Modded sessions never touch ranked/online (`AreModsActive` gate).
- Signature verification, malicious-mod reporting, and auto-updates are backend/platform
  services (Steam Workshop handles distribution + updates when on Steam) — out of local
  scope, listed for the backend block alongside guild/trading/PvP services.

## SIMK (StickmanImpact Mod Kit) — the plan

A stripped UE project template containing: the game's public headers + DataTable row types,
sample mods with source (one per type above), the cook-and-package script that emits
`.smod` + manifest, and this doc. Distribution of SIMK = a separate repo/release artifact —
editor tooling, not game code.

## In-game browser / creator rewards

Mod browser UI lists `GetMods()` with enable toggles + load-order drag (the manager is the
backend of that screen). Featured mods, ratings, download counts, and creator rewards are
the online service again — the local manager reads whatever the service syncs into `Mods/`.
