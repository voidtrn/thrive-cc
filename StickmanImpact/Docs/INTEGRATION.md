# Final Integration — How the Systems Fit Together

StickmanImpact is ~70 systems. This doc is the map of how they interlock, the accessibility
checklist, the performance budget, and the final test rail. It's the answer to "does this
work as ONE game, not N features?"

## The two integration hubs

Almost everything routes through one of two central points, which is *why* the systems
compose instead of colliding:

### 1. The damage funnel — `UStickmanGameplayAbility::ApplyDamageToTarget`

Every hit, from any source, flows through one function. In order, a hit is:
environment redirect (torch / foliage / **destructible**) → player-defense resolve
(**perfect dodge / parry**, difficulty scale, **awakening gauge** gain) → juggle gate →
combo meter → **skill mastery** → **counter/riposte** → **weapon-swap bonus** →
**style multiplier** → **awakening stat bonus** → **PvP balance scale** → shield guard →
elemental resistance / **boss weak-point** → reaction → **time-stop accumulation** → crit →
health apply → damage numbers → juice / hit feedback.

New combat systems didn't fork the pipeline — they inserted one multiply or one early-return
at the funnel. That's the "combat + everything" integration.

### 2. Per-actor `CustomTimeDilation`

Witch time (perfect dodge), **Chrono** (slow/stop), and boss speed mechanics all use the
same primitive — actors slow/freeze individually while the global clock and the player stay
real-time. No system fights another over `SetGlobalTimeDilation` because the player always
compensates with `CustomTimeDilation`.

## Mandatory integrations (spec checklist)

- **Combat + movement — no state locks**: skills activate via GAS regardless of movement
  state; air attacks route to the plunge tag, wall-run/grapple/mount keep the ability
  system live. `UAerialMovementComponent` dive-bomb fires the plunge ability; nothing
  disables the ASC on a movement state.
- **Elemental + environment**: the reaction manager + terrain zones + **destructibles** all
  take `EStickmanElement`; radial damage overlaps WorldDynamic so torches, foliage, and
  destructibles all react. Burn spreads (foliage + destructible fire propagation); freeze
  water = a Frozen terrain-zone actor.
- **Story + reputation + morality**: `UConsequenceTrackerSubsystem` (choices) feeds
  `UFactionSubsystem` (6-faction rep/territory) and `UEndingSubsystem` (score); `UMoralitySubsystem`
  quadrant gates dialogue/equipment. All read by content, not hardcoded branches.
- **Housing + social**: the guild hall is a shared realm layout (`URealmSubsystem` flagged
  shared); friend visits + trading-in-person ride the co-op host/guest session.
- **Roguelike + progression**: run rewards grant through `UCollectibleManager` like the rest;
  boons are `FBoonDef` rows that can double as rare open-world drops.
- **Photo + replay**: the replay world is a normal re-simulated world, so `UPhotoModeSubsystem`'s
  free camera works during playback unchanged.
- **Mods + everything**: the data-driven design (archetype/boon/skin/quest/event rows) *is*
  the mod API; `UModManagerSubsystem` mounts paks, no per-system mod hook needed.

## Accessibility checklist

| Requirement | Where |
|---|---|
| Colorblind modes (3) | `SetColorblindMode` → `r.ColorCorrect.Deficiency*` |
| Controller remapping | Enhanced Input user settings |
| Difficulty (Story/Normal/Hard/Expert) | `SetDifficultyPreset` → damage scale in the funnel |
| Subtitles + speaker/size/bg | subtitle settings + `UAudioSubtitleSubsystem` |
| Audio cues for visual info | `UAudioSubtitleSubsystem` (gated on the toggle) |
| Hold/toggle for repeated inputs | `AreActionsToggle` setting |
| Motion-sickness reduction | `IsReduceMotionEnabled` (kills motion blur + velocity FOV/tilt) |
| Screen-shake intensity 0-100% | `GetScreenShakeScale` (funnel-wired) |
| Screen-reader for UI | UMG accessible-text on widgets (asset-side; the read points exist) |

## Performance budget

- Target 60 FPS = 16.6ms CPU / 16.6ms GPU. `UPerformanceManager` auto-steps scalability on
  sustained drops; `UPlatformPresetLibrary` configures GPU-time-driven dynamic resolution
  (TSR) for the console-Performance/Steam-Deck presets.
- Memory 4GB target: soft object references throughout (`TSoftObjectPtr` for meshes/skins/
  maps), streaming-level rooms, debris budget (`UDestructionManagerSubsystem` cap 60),
  attack-token-limited active AI, LOD component. `Stickman.ShowMemory` overlays the live cost.
- Storage 40GB: content budget, not code — the packaging doc tracks it.

## Final test rail (dev console `test.*`)

`test.skills` (activate every granted ability), `test.reactions` (drive every element pair
on a dummy), `test.quests` (quest-catalog live check + editor Data Validation pointer),
`test.maps` (verify `TestMapNames` soft refs resolve), `test.save` (write → CRC-read →
rewrite integrity), `test.bench` (FPS benchmark), `test.combat` (wave clear timer). These
are the "TestAllSkills / TestAllReactions / TestAllQuests / TestLoadAllMaps / TestSaveLoad /
TestPerformance" acceptance commands.

## The standing honesty note

None of this has compiled against a real UE 5.4 engine in-session (no toolchain) — a
first-compile pass in the editor is packaging checklist item #1, and GAS/engine API drift
between point releases is expected to need minor fixes. Save-format persistence for the many
new subsystems is one deferred versioned bump of `UStickmanSaveManager`'s binary format
(each subsystem already exposes Export/Import). Online-backed features (guild membership,
trading exchange, PvP matchmaking, mod workshop, community galleries) need the backend
service scoped across the co-op/guild/trading/PvP/modding docs — the local models are
backend-mirror-ready.
