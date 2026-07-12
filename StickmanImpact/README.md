# StickmanImpact

Stickman open-world action RPG foundation, UE5.4+, C++ first.

## Source layout

```
Source/StickmanImpact/
  Character/     AStickmanCharacter, FStickmanStats, movement gameplay tags
  SkillSystem/   EStickmanElement/EStickmanSkillType enums, FSkillData, UStickmanSkillDataAsset
  Combat/        GAS: AttributeSet, AbilitySystemComponent, base GameplayAbility, AnimNotifies,
                 GameplayEffects, and Combat/Abilities/ (GA_NormalAttack, 7 elemental
                 GA_*Skill classes, GA_ElementalBurst_Base + GA_PyroBurst)
  UI/            AStickmanHUD, UStickmanInputDebugWidget
  World/         AStickmanGeoWall (temporary blocking wall spawned by GA_GeoSkill)
  Party/         FStickmanCharacterData (DataTable row), UPartyManager
  Data/          (empty — item/enemy/quest DataTables)
  SaveSystem/    (empty — USaveGame subclasses)
  Audio/         (empty — MetaSound managers)
  StickmanGameMode / StickmanPlayerController / StickmanGameInstance
```

## First-time editor setup

1. Right-click `StickmanImpact.uproject` → **Generate Visual Studio project files**, then open and build (or `File > Open Project` in the Editor, which triggers a compile prompt).
2. **Enhanced Input assets** — these are content assets and can't be generated as text files, create them in the Content Browser under `Content/Input/`:
   - `IA_Move`, `IA_Look` — Value Type: Axis2D
   - `IA_Jump`, `IA_Sprint`, `IA_Dash`, `IA_NormalAttack`, `IA_Skill1`, `IA_Skill2`, `IA_Interact`, `IA_Inventory`, `IA_Map`, `IA_Pause` — Value Type: Digital (bool)
   - `IMC_Default` (Input Mapping Context) with bindings:

     | Action | Keyboard/Mouse | Gamepad |
     |---|---|---|
     | Move | WASD | Left Stick |
     | Look | Mouse XY | Right Stick |
     | Jump | Space | Face Bottom |
     | Sprint (hold) | Left Shift | Left Shoulder |
     | Dash | Left Alt | Face Left |
     | NormalAttack | Left Mouse | Right Trigger |
     | Skill1 (Elemental Skill) | E | Left Trigger |
     | Skill2 (Elemental Burst) | Q | Right Shoulder |
     | Interact | F | Face Right |
     | Inventory | Tab | Special Left |
     | Map | M | Special Right |
     | Pause | Escape | Face Top |

3. Assign `IMC_Default` and each `IA_*` to the matching `UPROPERTY` slot on `BP_StickmanCharacter` (subclass of `AStickmanCharacter`) — Move/Look/Jump/Sprint/Dash/NormalAttack/Skill1/Skill2/Interact live on the character; Inventory/Map/Pause live on `BP_StickmanPlayerController`.
4. Set `BP_StickmanGameMode`'s Default Pawn / Player Controller / HUD to the BP subclasses, and set it as the project's default GameMode (already pointed at the C++ class in `Config/DefaultEngine.ini`, override per-map if needed).
5. For the input-debug widget: create `WBP_InputDebug` as a subclass of `UStickmanInputDebugWidget`, optionally add TextBlocks named to match `MoveValueText` / `LookValueText` / `StaminaValueText` / `MovementStateText` and bind them, then assign `WBP_InputDebug` to `AStickmanPlayerController::InputDebugWidgetClass`.
6. Assign a skeletal mesh + anim blueprint on `GetMesh()` in `BP_StickmanCharacter` (the C++ constructor only sets capsule size/mesh offset for stickman proportions).

## Movement/stamina/dash tuning

All exposed as `EditAnywhere` on `AStickmanCharacter`: `WalkSpeed=400`, `SprintSpeed=700`, `DashDistance=600`, `DashCooldown=1.5s`, `DashDuration=0.2s`, stamina drain/regen rates, camera lag/FOV/zoom range. Movement state is mirrored to native gameplay tags (`State.Movement.Idle|Walking|Sprinting|Dashing|Jumping|Falling`) via `StickmanGameplayTags.h`.

## GameplayAbilitySystem (GAS)

`AStickmanCharacter` implements `IAbilitySystemInterface` and owns a `UStickmanAbilitySystemComponent` +
`UStickmanAttributeSet` (Health/MaxHealth/Stamina/MaxStamina/Attack/Defense/ElementalMastery/
EnergyRecharge/CurrentEnergy/MaxEnergy, plus meta `Damage`/`Healing` attributes used internally
by `PostGameplayEffectExecute`). Note: `AttributeSet::Stamina` mirrors GAS-facing resource state;
the character's own `CurrentStamina` (movement task) still drives sprint/dash directly and isn't
yet unified with it — fine for now, worth reconciling once a real stamina-costing ability exists.

Every skill derives from `UStickmanGameplayAbility` (`Source/StickmanImpact/Combat/StickmanGameplayAbility.h`),
which is fully data-driven off one `FSkillData SkillData` struct per ability — no hand-authored
Cooldown/Cost GameplayEffect assets required:

- **Cooldown**: `SkillData.SkillTag` itself is applied as a loose ASC tag for `SkillData.Cooldown`
  seconds (`CommitCooldown`/`CheckCooldown`) — so every skill's `FSkillData.SkillTag` must be a
  unique, registered `FGameplayTag` (add project skill tags under `Config/Tags/` or a native
  tags file alongside `StickmanGameplayTags.h`).
- **Cost**: `SkillData.EnergyCost` is deducted straight from `UStickmanAttributeSet::CurrentEnergy`
  (`CommitCost`/`CheckCost`).
- **Damage**: `ApplyRadialElementalDamage()` overlaps a sphere/cone and hits everyone found for
  `CasterAttack * DamageMultiplier`, applied as the meta `Damage` attribute on the target's own
  `UStickmanAttributeSet`. `ApplyDamageToTarget()` additionally applies an optional
  `TSubclassOf<UGameplayEffect> StatusEffectClass` (a `UGE_ElementalStatusBase` subclass, e.g.
  `UGE_PyroStatus`) as a real, timed GameplayEffect for sustained DoT — the applying ability sets
  the per-tick amount via `SetByCaller(StickmanGameplayTags::SetByCaller_Damage)`.

### Skills implemented

| Ability | Type | Element | Cooldown | Notes |
|---|---|---|---|---|
| `UGA_NormalAttack` | Normal Attack | Pyro (infused) | — | 5-hit combo chain via `FNormalAttackChain`; combo continuation is buffered through `UStickmanAbilitySystemComponent::QueueComboInput`/`ConsumeQueuedComboInput`, driven by `AN_ComboCheck`/`AN_AttackHitCheck`/`AN_AttackEnd` AnimNotifies |
| `UGA_PyroSlash` | Elemental Skill | Pyro | 6s | 400u/180° spin slash, 150% ATK |
| `UGA_PyroSkill` ("Flame Surge") | Elemental Skill | Pyro | 6s | forward cone, 180% ATK |
| `UGA_CryoSkill` ("Frost Wave") | Elemental Skill | Cryo | 8s | narrow forward path, 140% ATK, 40% slow for 3s |
| `UGA_HydroSkill` ("Aqua Vortex") | Elemental Skill | Hydro | 7s | 360° pull-to-center, 120% ATK |
| `UGA_ElectroSkill` ("Lightning Strike") | Elemental Skill | Electro | 5s | blink forward then AoE, 160% ATK |
| `UGA_AnemoSkill` ("Wind Blade") | Elemental Skill | Anemo | 6s | stepped sphere-sweep projectile that drags hit actors along, 130% ATK |
| `UGA_GeoSkill` ("Stone Wall") | Elemental Skill | Geo | 10s | shockwave (100% ATK) + spawns `AStickmanGeoWall` |
| `UGA_DendroSkill` ("Thorn Field") | Elemental Skill | Dendro | 8s | persistent ticking field, 90% ATK/sec for 6s |
| `UGA_ElementalBurst_Base` | Elemental Burst | — (abstract) | 20s | 300% ATK, 60 Energy, full-screen slow-mo + camera shake |
| `UGA_PyroBurst` ("Phoenix Dive") | Elemental Burst | Pyro | 20s | launches up, delayed larger-radius slam explosion |

### Wiring abilities onto the character

1. Assign `DefaultAbilities` on `BP_StickmanCharacter` (or the C++ default object) to the ability
   classes above — they're granted to the ASC in `BeginPlay`.
2. Set `NormalAttackSkillTag` / `Skill1SkillTag` / `Skill2SkillTag` on the character to the same
   `FGameplayTag` values used in each granted ability's `SkillData.SkillTag` — `OnNormalAttack()`
   routes through `ActivateOrQueueComboSkill()` (combo-aware), `OnSkill1()`/`OnSkill2()` through
   plain `ActivateSkillByTag()`.
3. Per-ability content to assign in the ability Blueprint defaults: `MontageToPlay` (or the
   combo's `NormalAttackCombo.AttackMontages`), `*StatusEffectClass` (assign `GE_PyroStatus` /
   author more `UGE_ElementalStatusBase` subclasses for the other elements), `*CameraShakeClass`,
   and `SkillData.CastVFX` / `SkillData.CastSound` (Niagara system + sound cue, author in Content).
4. `UGA_NormalAttack`'s combo montages need three AnimNotifies placed on them: `AN_AttackHitCheck`
   on the impact frame, `AN_ComboCheck` near the end of the combo window, `AN_AttackEnd` on the
   last frame of the final hit.
5. `UGA_GeoSkill::WallClass` needs a Blueprint subclass of `AStickmanGeoWall` with a rock
   `StaticMesh` assigned to `WallMesh`.

Elemental reactions (Vaporize, Melt, Crystallize, ...) are not implemented — `GA_GeoSkill`'s
header notes where Crystallize would hook in once a reaction resolver exists.

## Elemental gauge / damage number UI

- `UEnemyElementalDisplayComponent` (a `UWidgetComponent` subclass) — add to any enemy Blueprint,
  set its `WidgetClass` to a WBP subclass of `UStickmanElementalGaugeWidget`. It polls
  `UElementalReactionManager::GetActiveElements()` every `PollInterval` seconds to update
  element icon/bar visibility+color, and listens for `OnReactionTriggered` on that same actor
  to show a "MELT"/"VAPORIZE"/... popup (author a `ReactionPopupAnim` Widget Animation in the
  WBP for the scale-up-then-fade flourish — auto-bound and auto-played, no C++ needed).
- `UStickmanDamageNumberManager` (GameInstanceSubsystem) pools `UWidgetComponent` + WBP-subclass-
  of-`UStickmanDamageNumberWidget` pairs, attaching one to whichever actor was just hit; rise/fade
  is driven natively in `NativeTick`, no Widget Animation required. Wired into
  `UStickmanGameplayAbility::ApplyDamageToTarget` (normal hits) and
  `UEnemyElementalDisplayComponent` (reaction damage) automatically — set
  `DamageNumberWidgetClass` on the subsystem (via a Blueprint subclass, since subsystem CDOs
  aren't Content-Browser assets) to enable it.
- Colors are centralized in `UStickmanDamageNumberStatics` (`Combat/StickmanReactionTypes.h` +
  `UI/StickmanDamageNumberTypes.h`): Physical=white, Pyro=red, Hydro/Cryo=blue, Electro=purple,
  Critical=gold, Reaction=orange (bigger text); element gauge icons use Pyro=red, Cryo=cyan,
  Hydro=blue, Electro=purple, Anemo=teal, Geo=yellow, Dendro=green per the design spec.

## Cutscene system

`UCutsceneManager` (GameInstanceSubsystem) wraps `ULevelSequencePlayer`: `PlayCutscene()` /
`SkipCutscene()` (no-op unless `bSkippable`) / `PauseCutscene()` / `ResumeCutscene()` /
`SetPlaybackSpeed()`, broadcasts `OnLetterboxToggled(bool)` for a HUD-level letterbox widget,
and polls a `TArray<FSubtitleEntry>` (`SetSubtitleTrack()`) against the player's own clock every
0.1s to drive `USubtitleWidget` via `OnSubtitleChanged`. `PlaySound`/`SpawnVFX`/`ShowSubtitle`
are meant to be called from a Sequencer **Event Track** (Call Function on a reference to the
subsystem, or via a Blueprint function library wrapper) so a cutscene can trigger gameplay-side
effects mid-playback. `ACutsceneTriggerVolume` plays a cutscene on player overlap, gated by
`RequiredStoryFlags` (checked against `UDialogueManager`'s story flags) and `bOneShot` (tracked
via `CutsceneManager->HasWatchedCutscene(CutsceneID)`); `RequiredPartyMembers` is a hook that
always passes today since there's no party-roster system yet. `AStickmanCutsceneActor` is a
non-playable SkeletalMesh actor with `Idle/Walk/Run/Attack/Cast/Hit/Die` montage slots,
`Neutral/Happy/Sad/Angry/Surprised` emotion morph targets (author `Emotion_Happy` etc. as morph
targets on the mesh), a `GetLookAtTargetLocation()` getter for the AnimBP's Look-At node to read
(no C++ bone manipulation — that belongs in the AnimGraph), and a crude jittered-morph-target
lip sync (`Mouth_Open`) with no real phoneme analysis.

### Example: "OpeningScene" setup

1. Create a Level Sequence asset `LS_OpeningScene` in `Content/Cutscenes/`.
2. Add a **Camera Cut Track** with 3 shots: (a) wide establishing shot of the field, (b) a
   push-in close-up as the player character (a `BP_StickmanCharacter` placed in the level,
   `IdleMontage` playing, lying down/waking-up pose) sits up, (c) an over-the-shoulder shot
   framing the guide character (an `AStickmanCutsceneActor` instance) approaching.
3. Add both actors as **Possessable** tracks; keyframe their Transform tracks for the guide's
   walk-in, and add an **Animation Track** on each referencing the relevant montage
   (`WalkMontage` for the guide's approach, then `IdleMontage` once they stop).
4. Add an **Event Track** with two Call-Function keys: one at the moment the guide starts
   talking (`UCutsceneManager::ShowSubtitle`, or better, author the lines via
   `SetSubtitleTrack()` before playback — see step 6), one under the guide's footsteps
   (`UCutsceneManager::PlaySound` with a footstep cue) for a concrete "Events during cutscene"
   example.
5. Set the Camera Cuts track's cameras to 3 `CineCameraActor`s placed for each of the 3 shots.
6. In the trigger Blueprint (`BP_OpeningSceneTrigger`, a child of `ACutsceneTriggerVolume`)
   placed at the level's spawn point: set `CutsceneToPlay = LS_OpeningScene`, `CutsceneID =
   "OpeningScene"`, `bOneShot = true`. On `BeginPlay`, call
   `CutsceneManager->SetSubtitleTrack()` with entries like `{"...where am I?", 0.0, 2.5}`,
   `{"You're finally awake.", 3.0, 5.5}` before the player can reach the trigger (or call it
   immediately before `PlayCutscene` if driving the trigger via C++/Blueprint instead of relying
   on `ACutsceneTriggerVolume`'s automatic overlap call).
7. Add `WBP_Subtitle` (child of `USubtitleWidget`) and `WBP_Letterbox` (two black `Border`
   widgets pinned top/bottom, shown/hidden via `OnLetterboxToggled`) to the persistent HUD.

## Quest/mission system

`UQuestDataAsset` authors `FQuestStage`s (each with `FQuestObjective`s, optional start dialogue/
cutscene, and a `FRewardData`). `UQuestManager` (GameInstanceSubsystem) copies a quest's stages
into a runtime-only `FActiveQuestRuntime` on `AcceptQuest()` so progress never mutates the shared
asset. Gameplay code reports progress through one generic entry point —
`ReportProgress(EObjectiveType, TargetIdentifier, RelevantActor, Location, Count)` — instead of
each objective type needing its own callback wiring; e.g. an enemy's death handler calls
`ReportProgress(EObjectiveType::Kill, EnemyArchetypeTag, DeadEnemy, DeadEnemy->GetActorLocation())`
and every active quest's current-stage Kill objectives matching that identifier/actor advance.
Rewards auto-grant on stage/quest completion via `GrantReward()`; EXP/Currency/Items are
logged only (no inventory/economy subsystem exists yet — wire that up before shipping), story
unlock flags and ability grants (`TSoftClassPtr<UGameplayAbility>`, loaded synchronously and
given to the player's ASC) already work. `UQuestTrackerWidget` shows the tracked quest
(`SetTrackedQuest`/`GetTrackedQuestID`) with up to 5 objective rows (checkbox + progress count +
distance for `ReachLocation`), refreshing distance every `DistanceRefreshInterval` seconds and
immediately on any `OnQuestUpdated`/`OnObjectiveUpdated` event; author a `QuestUpdateSlideIn`
Widget Animation for the slide-in flourish. A reward-preview (pre-accept) or reward-collection
screen is just more UMG reading `FRewardData`/listening to `OnQuestCompleted` — no extra C++
needed beyond what's here.

## NPC AI system

### Town NPCs

`AStickmanNPC` owns `UStickmanScheduleComponent` (time-of-day routine — `Idle/Walk/Work/Eat/
Sleep`, keyed by 24-hour `FNPCScheduleEntry` ranges; pulls the clock from `ADayNightManager`
once that exists, `DebugOverrideHour` lets you test it standalone today) and
`UStickmanDialogueTriggerComponent` (implements `IStickmanInteractable`, starts a
`UDialogueSequence` on interact). `IStickmanInteractable` (`StickmanInteractable.h`, module
root) is the shared "F to interact" contract — implement it on an Actor directly or on one of
its Components; `AStickmanCharacter::OnInteract()` sphere-sweeps `InteractRange` and calls
whichever it finds. NPCs greet the player on approach (`GreetRadius`) and flee if any
`AStickmanEnemyCharacter` within `FleeFromCombatRadius` is in `EEnemyCombatState::Combat`.

### Enemy AI

`AStickmanEnemyCharacter` is the shared base for all 5 archetypes below — it owns the same GAS
plumbing as the player (`UStickmanAbilitySystemComponent`/`UStickmanAttributeSet`, so enemies
use the same abilities/reactions) plus the tuning the shared BT nodes read: `WeightedAttacks`,
`OptimalCombatDistance`, `RetreatHealthPercent`, `DodgeChance`. **One `BT_StickmanEnemy` asset
can drive all 5 archetypes** since the C++ tasks read tuning from the possessed pawn rather than
hardcoding it in the graph — duplicate the BT only if an archetype needs genuinely different
branching (a boss's phase-based mechanics, say).

Build `BT_StickmanEnemy` in the editor as:

```
Selector (root)
├─ Sequence "Retreat"          [Decorator: BTDecorator_HealthBelowThreshold]
│   └─ BTTask_MoveToSafeLocation
├─ Sequence "Combat"           [Decorator: BTDecorator_LineOfSightToTarget]
│   ├─ BTTask_ApproachTarget
│   ├─ BTTask_TryDodge          (fails silently if the roll misses — see task comment)
│   └─ BTTask_SelectWeightedAttack
└─ Sequence "Patrol"
    ├─ BTTask_FindRandomPatrolPoint
    ├─ BTTask_MoveTo             (built-in, target = TargetLocation)
    └─ BTTask_Wait               (built-in)
```

Blackboard `BB_StickmanEnemy` keys (names in `StickmanBlackboardKeys`, `AI/StickmanAITypes.h`):
`TargetActor` (Object), `TargetLocation` (Vector), `CurrentState` (Enum → `EEnemyCombatState`),
`AlertLevel` (Float). `AStickmanAIController` populates `TargetActor`/`CurrentState`/`AlertLevel`
automatically from an `AIPerceptionComponent` (sight) it owns — assign your `BehaviorTree` on
the controller (or its Blueprint subclass) and possess the enemy with it.

**EQS**: cover points / flanking positions use the engine's built-in nodes, not custom C++ —
`EnvQueryGenerator_OnCircle` around `TargetActor` (radius = `OptimalCombatDistance`), filtered
by `EnvQueryTest_Trace` (line-of-sight to target — "cover" = points that FAIL this test) and/or
`EnvQueryTest_Dot` (flanking = points off the target's forward axis). Run the query from a
custom BT task if/when an archetype needs it; none of the 5 base archetypes require it yet.

### The 5 enemy archetypes (`AI/Enemies/`)

| Class | Role | Notable tuning |
|---|---|---|
| `AEnemyMeleeGrunt` | Rush down, basic combo | Short `OptimalCombatDistance`, fast, barely retreats |
| `AEnemyRangedArcher` | Keeps distance, charged shot | Long `OptimalCombatDistance`, `ChargeTime` read by its own charged-shot ability |
| `AEnemyShieldGuard` | Blocks frontal hits, slow/tanky | `GetIncomingDamageMultiplier()` — wired into `UStickmanGameplayAbility::ApplyDamageToTarget`, 80% reduction inside `BlockArcHalfAngleDegrees` of its forward vector |
| `AEnemyMage` | Elemental caster | High `ElementalMastery`, `WeightedAttacks` should favor teleport-style skills (e.g. `GA_ElectroSkill`) |
| `AEnemyElite` | Boss, multi-phase | `PhaseHealthThresholds` + `PhaseAttackOverrides`, auto-detects transitions off `OnHealthChanged`, `OnPhaseChanged` for phase-transition VFX/mechanics |

### Wildlife

`AStickmanWildlife` is deliberately *not* BT-driven — a full AI stack is overkill for "flee when
the player gets close" — it's a plain `Tick` state machine (Grazing ⇄ Fleeing), with
`HerdTag`/`HerdAlertRadius` so one spooked animal alerts its herd, a `GrazeMontage` on a timer,
and `OnDefeated()` spawning `ResourceDropClass` before self-destroying.

### Spawning

`AEnemySpawner` (place in world) spawns up to `MaxActiveEnemies` from a weighted `SpawnPool`
within `SpawnRadius`, scaling `FStickmanStats` by `BaseEnemyLevel`/`StatGrowthPerLevel` via
`SpawnActorDeferred`, and respawns `RespawnTime` seconds after each death.
`AEnemyCamp` groups several spawners: when one spawner's enemy enters combat
(`AStickmanAIController` calls back through `AStickmanEnemyCharacter::SpawningSpawner`), every
other member spawner's *currently alive* enemies get their Blackboard `TargetActor`/
`CurrentState` set to investigate — a lightweight "the whole camp comes running" alert.

## Open world infrastructure

### World Partition / landscape / streaming (editor setup, no C++)

World Partition, landscape layers, and streaming distances are engine/editor configuration,
not code:

1. **World Partition**: new level → tick "Enable World Partition" in the New Level dialog (or
   existing level → `Tools > Convert Level to World Partition`). For a 4km×4km+ map, also
   enable **Data Layers** (split content you want to load conditionally — e.g. interiors) and
   **HLOD** (`Window > World Partition > HLOD Outliner`, build HLODs after laying out the level)
   so distant geography renders as merged low-poly proxies instead of full detail.
2. **Landscape layers**: create one Landscape with a Layer Info Object per material
   (`LI_Grassland`, `LI_Forest`, `LI_Desert`, `LI_Snow`, `LI_Urban`), paint with the Landscape
   sculpt/paint tools, blend via a landscape material's layer-blend node.
3. **Streaming distance**: World Partition streams by **runtime grid cell** (`Project Settings >
   World Partition`, or per-Data-Layer loading range) rather than a single "streaming distance"
   knob — tune cell size + loading range there. For a AAA-style seamless world, avoid loading
   screens entirely (World Partition streams in the background); reserve a loading screen only
   for a hard cut between genuinely disconnected regions (e.g. a instanced dungeon), driven by
   `UGameplayStatics::OpenLevel` + a simple `UUserWidget` shown just before the level change.

### Stickman character LOD

- **LOD0** (full mesh, <30m) and **LOD1** (simplified/reduced bones, 30-80m) are ordinary
  `SkeletalMesh` LOD levels — set them up in the Skeletal Mesh Editor's LOD panel (auto-generate
  or import custom reduced meshes), the engine switches between them by screen size
  automatically, no C++ involved.
- **LOD2** (billboard, 80-200m) / **LOD3** (culled, 200m+) aren't something `SkeletalMesh` LODs
  can do on their own (a flat sprite isn't a mesh LOD), so `UStickmanLODComponent` handles those:
  add it to any background stickman, assign `BillboardFlipbookMaterial` (a material sampling a
  baked animation-flipbook atlas), tune `LOD2StartDistance`/`LOD3StartDistance`. At LOD3 it hides
  everything and disables the owning actor's tick (the LOD component itself keeps ticking at a
  cheap `CheckInterval` so it can un-cull later).

### Crowd

`AStickmanCrowdManager`: author `SpawnPoints` (with an `AreaType` FName each) and
`DensityPerAreaType` (0-1 chance per refresh pass — sparse for a back alley, dense for a market).
Pools/reuses `AStickmanNPC` instances (hidden + tick-disabled + collision-disabled while
pooled) instead of spawning fresh ones, activating within `ActivationDistance` of the player and
returning to the pool beyond `DeactivationDistance`, capped at `MaxActiveNPCs` (default 50).
`ColorVariants` (material swap) and `SizeVariantRange` (uniform actor scale) give a crowd
visual variety without needing dozens of unique NPC Blueprints.

### Foliage

- **Grass reacting to movement**: `UStickmanFoliageInteractionComponent` on the player writes
  its world position into a `UMaterialParameterCollection` vector every tick; the grass
  material reads that MPC vector and pushes vertices away via World Position Offset based on
  distance — a pure material-side effect, no per-blade gameplay code.
- **Tree LOD billboards at distance / density culling**: both are Foliage-tool settings per
  `FoliageType` asset (`Cull Distance` min/max, and the LOD Billboard section on the source
  Static Mesh) — no custom code needed.
- **Interactive foliage (burn/cut/freeze)**: the Foliage tool's procedural instances don't
  support per-instance reactions without a custom instance-tracking system, so
  `AStickmanInteractiveFoliage` is a standalone placeable actor instead — call
  `OnBurned()`/`OnFrozen()` (material swap) or `OnCut()` (VFX + destroy) from combat code
  (e.g. `UStickmanGameplayAbility::ApplyDamageToTarget` checking `Cast<AStickmanInteractiveFoliage>(TargetActor)`
  and the hit's element/type) wherever it's placed as a deliberate "cut this bush" set piece.

### Day/Night cycle

`ADayNightManager` (place one per level, reference the level's existing `ADirectionalLight`/
`ASkyLight`/`AExponentialHeightFog`/`APostProcessVolume`): rotates the sun, lerps sky light
intensity/fog color/post-process exposure across a `DayLengthMinutes`-long cycle (default 24
real minutes), and exposes `GetTimeOfDay()` (`Dawn/Day/Dusk/Night`) plus `OnTimeOfDayChanged`/
`OnHourChanged` delegates. `UStickmanScheduleComponent` and `AEnemySpawner` (via
`NightSpawnPool`) both look this actor up automatically (`UGameplayStatics::GetActorOfClass`)
and fall back gracefully if none exists in the level. Street lights: bind a Blueprint's own
light component visibility to `OnTimeOfDayChanged` (`NewTimeOfDay == Night`) — no dedicated
C++ class needed for something that simple.

### Weather

`UWeatherManager` (GameInstanceSubsystem): `SetWeather()` crossfades over `TransitionDuration`
(default 30s), spawning `WeatherVFX[NewWeather]` attached to the player and lerping a
`WeatherMPC` "WetSurface"/"WeatherBlend" scalar (wet-surface shaders read "WetSurface").
During Rain/Storm it periodically calls `UElementalReactionManager::ApplyElement(Player, Hydro,
...)` (spec: "Rain: Hydro applied to all characters periodically"); during Storm it also rolls
random nearby "lightning strikes" applying Electro if the player's within
`StormLightningRadius` of the roll ("Storm: Electro hazard zones"). `GetMoveSpeedMultiplier()`
is exposed (Rain -5%, Storm -10%, Snow -8%) but not force-wired into `AStickmanCharacter`'s
movement — that's one line in its Tick once you're ready, left as a hook rather than touching
already-working movement code this late.

## Exploration mechanics

All added directly to `AStickmanCharacter` (climb/glide/swim are movement states as tightly
coupled to the existing stamina/camera/movement-tag code as sprint/dash already were — a
bolted-on component would've just meant more back-and-forth into the character anyway).

- **Climbing**: auto-starts when airborne and facing (within `WallCheckDistance`) a wall whose
  Actor has the `ClimbableTag` Actor Tag (Actor Tags, not a physical material, since it's a
  single checkbox-equivalent in the editor rather than a whole physical-material asset per
  climbable surface). Moves via `MOVE_Flying` at `ClimbSpeed`, drains `ClimbStaminaDrainRate`/sec,
  stops automatically on running out of stamina or losing the wall trace. `JumpOffWall()`
  (bound to the Jump input while climbing) launches backward+up; `SlideDownWall()` is exposed
  BlueprintCallable but not bound to an input by default — wire it to whichever button fits
  your control scheme (e.g. Crouch-while-climbing). Ledge-grab-and-pull-up is an animation
  concern (a montage root-motion transition into standing once `TraceForClimbableWall` stops
  finding a wall above the character) — not modeled as separate C++ state.
- **Gliding**: deploys on a 3rd Jump press while airborne (`Jump()` now checks
  `CurrentJumpCount >= MaxJumpCount && IsFalling()`). Forward Move input (Y axis) pitches the
  glide — push forward to dive (faster, more descent), pull back to flatten out — drains
  `GlideStaminaDrainRate`/sec, ends on landing (plays `LandingRollMontage`) or running out of
  stamina. `GliderVFXVariants`/`SelectedGliderVariant` are exposed for unlockable elemental
  glider trails; actually attaching/switching the trail Niagara component is a couple of lines
  in a Blueprint `OnRep`/`BeginPlay` reading `SelectedGliderVariant`. Wind currents (upward
  boost, free) aren't modeled yet — add a trigger volume that calls
  `GetCharacterMovement()->Velocity.Z += Boost` while overlapping.
- **Swimming**: rides `UCharacterMovementComponent`'s built-in swimming mode — place a
  `APhysicsVolume` (or Blueprint subclass) over the water with `bWaterVolume = true` and it
  auto-detects and switches movement mode, no custom detection code needed.
  `AStickmanCharacter` layers a 60s breath meter (`MaxBreath`/`CurrentBreath`,
  `GetBreathPercent()`), stamina drain, and drowning damage (once breath hits 0 while diving)
  on top of that. `ToggleDive()` (bound to `DiveAction`, only reachable while already swimming)
  flips `UCharacterMovementComponent::Buoyancy` between `DiveBuoyancy` (sinks) and
  `SurfaceBuoyancy` (floats) — river current effects are a `APhysicsVolume::TerminalVelocity`/
  custom force volume, not separate code here. Water surface shader interaction is a material
  concern (Distance Field / depth-fade foam), not C++.
- **Teleport waypoints**: `AWaypointActor` (implements `IStickmanInteractable`) unlocks on first
  overlap (`ActivationRadius`) via `UWaypointManager` (tracks unlocked IDs — build the map UI's
  waypoint list off `GetUnlockedWaypoints()`). Interacting with an already-unlocked waypoint (or
  selecting one on the map) calls `TeleportTo()`; beyond `LoadingScreenDistanceThreshold` it
  fires `OnTeleportRequested` instead of teleporting immediately so a loading-screen widget can
  cover the screen first and call `FinishTeleport()` once ready — under the threshold it
  teleports immediately (no loading screen for a "seamless" nearby jump).
- **Collectibles**: `AStickmanCollectible` (Oculi-style — bobs/rotates, auto-collects on touch,
  no interact prompt), `AStickmanChest` (`EChestRarity` Common/Rare/Luxurious, opens on interact,
  grants a `FRewardData` once), `AResourceNode` (ore/plant, gather on interact, hides + respawns
  after `RespawnTime`), and two puzzle pieces: `AStickmanPressurePlate` (`OnActivated`/
  `OnDeactivated` delegates while something's standing on it — a door Blueprint binds to both)
  and `AStickmanTorch` (`TryAffectWithElement()` — lights on Pyro, extinguishes on Hydro/Cryo;
  wired automatically from `UStickmanGameplayAbility::ApplyDamageToTarget`, which now early-outs
  to `Torch->TryAffectWithElement()` before touching health/ASC when the hit target is a torch).
  `UCollectibleManager` (GameInstanceSubsystem) tracks collected IDs and per-`Region` progress
  (`RegisterRegionTotal`/`GetRegionProgress`) for a regional-completion readout. Highlight-on-
  look-at for any of these is a post-process/custom-depth outline concern, not gameplay code.

## Party system

`FStickmanCharacterData` (DataTable row, `Content/Data/DT_Characters`) is one playable
character's static design: element/weapon type, base stats, `UStickmanSkillDataAsset` (reused
from the SkillSystem module — same asset type the single-character prototype used), ascension
breakpoints, 6-level constellation data, story text. `UPartyManager` (GameInstanceSubsystem)
holds up to 4 `FPartyMemberState` (a DataTable row + runtime level/EXP/ascension/equipped-IDs)
and reconfigures **one** `AStickmanCharacter` pawn in place on switch
(`AStickmanCharacter::ApplyCharacterData` — mesh, stats, re-granted abilities from
`SkillData.ElementalSkill`/`ElementalBurst`/`PassiveSkills`, `Skill1SkillTag`/`Skill2SkillTag`
set from the new kit's `FSkillData::SkillTag`) rather than spawning/possessing a separate actor
per character. `SwitchToIndex()` is gated by `SwitchCooldownDuration` (2s default), broadcasts
`OnPartySwitched` (bind here for "on-switch passive" reactions — no separate passive-trigger
system needed, just listen to this delegate), and optionally auto-activates the incoming
character's Burst if `bAutoBurstOnSwitchUnlocked` is set. Switching mid-air/mid-combat needs no
special handling — it's just a data/ability swap on the same physics body, so whatever movement
state (climbing/gliding/dashing/...) it was already in continues uninterrupted.

**Elemental Resonance** (`GetActiveResonanceBonuses()`, recalculated on any roster change):
2 Pyro +25% ATK, 2 Cryo +15% CRIT Rate, 2 Hydro +20% Healing, 2 Electro +25% Energy Recharge,
2 Anemo +10% Move Speed, 2 Geo +15% Shield Strength, 2 Dendro +80 Elemental Mastery, or (a full
4-member party with 4 different elements) +15% all Elemental DMG. These are computed values
exposed to read — actually *applying* the ATK/CritRate/etc. bonuses to `UStickmanAttributeSet`
is a couple of `ApplyModToAttribute` calls in whatever damage-calc path reads them next
(`UStickmanGameplayAbility::ApplyRadialElementalDamage` doesn't consume them yet).

**Leveling/ascension**: `GrantEXP()` levels a member up (quadratic EXP curve, cap
`MaxCharacterLevel = 90`) and reapplies stats if they're the active member; `TryAscend()`
checks `FCharacterAscension::RequiredCharacterLevel` (20/40/50/60/70/80 — author these per
character in the DataTable) and applies `StatBonus`, logging (not consuming — no inventory
system yet) `RequiredMaterials`.

**Weapon types** (`EWeaponType`, moved into `SkillSystem/StickmanSkillTypes.h` since both Party
and Combat need it): hit-count/speed differences (Sword 5-hit, Claymore 4-hit, Polearm 6-hit)
are expressed entirely as data on each character's `FNormalAttackChain` — no per-weapon-type
C++ branching needed for that part. `GA_NormalAttack::WeaponType` (set from
`ApplyCharacterData`) drives the two behaviors that *do* need code: Claymore hits deal a flat
`ClaymoreShieldBreakBonus` (a real "vs. shielded targets only" check needs a generic shield/
absorb system that doesn't exist yet); Catalyst normal attacks are elemental
(`SkillData.Element` set to the character's element) instead of physical. `GA_BowAimedShot`
demonstrates the charged-shot/aimed-mode half of Bow (hold to charge via
`UAbilityTask_WaitInputRelease`, damage scales `MinDamageMultiplier` → full `DamageMultiplier`
by hold duration) — grant it alongside `GA_NormalAttack` on Bow characters. Homing projectiles
for Catalyst and true long-range hitscan for Bow (currently just a big `HitCheckRadius`) are
noted as follow-up work rather than built now.

## Equipment / artifact system

`FArtifactData` (one instance, slot `Flower/Plume/Sands/Goblet/Circlet`, a single `MainStat`
roll, up to 4 `SubStats`, `Level` 0-20, `Rarity` 1-5, `SetName`) and `FWeaponData` (ATK/sub-stat/
refinement/level/ascension/passive) both use `FArtifactSubStat { EArtifactStat Stat; float
Value; }` rather than the spec's `TArray<TPair<EArtifactStat, float>>` — `TPair` isn't
UPROPERTY/UHT-reflectable, so it can't appear in a `TArray` that Blueprint/DataTable needs to
see; `FArtifactSubStat` is the direct substitute. Likewise `FArtifactData::MainStat` is a single
`FArtifactSubStat`, not a `TMap<EArtifactStat, float>` — a map for exactly one entry added
nothing.

`UEquipmentManager` (`ActorComponent`, one per `AStickmanCharacter`, already wired up and applied
to the AttributeSet in `BeginPlay`/`ApplyCharacterData`): one weapon slot + a
`TMap<EArtifactSlot, FArtifactData>` for the 5 artifact slots. `GetTotalStats()` sums weapon +
artifact main/sub-stats into `FEquipmentStatTotals` (everything `UStickmanAttributeSet` doesn't
already track natively: CRIT Rate/DMG, DMG%, Healing Bonus, plus flat/% HP/ATK/DEF and EM/ER),
folding in any 2pc/4pc `FArtifactSetBonus` rows (looked up by `SetName` from
`ArtifactSetBonusTable`, a DataTable using `FArtifactSetBonus` as its row struct) whose piece-
count threshold is met. Conditional 4pc bonuses (reaction DMG, crit vs. a status, ...) are
exposed as a `FGameplayTag` + magnitude rather than auto-applied — combat code that can actually
evaluate the condition checks for the tag. `PreviewArtifactSwap()` computes totals as if one
artifact were swapped, without equipping it, for a comparison UI.
`SaveEquipmentPreset`/`GetEquipmentPreset` store weapon/artifact **IDs** per slot — resolving an
ID back into full `FWeaponData`/`FArtifactData` needs an inventory system (not built yet).

### 10 example artifact sets (author as DataTable rows, `RowName` = `SetName`)

| Set | 2pc | 4pc |
|---|---|---|
| Crimson Witch of Flames | +15% Pyro DMG | +40% DMG for Overload/Burning/Vaporize/Melt reactions (conditional tag) |
| Blizzard Strayer | +15% Cryo DMG | +40% CRIT Rate against Frozen/Superconduct-afflicted enemies (conditional tag) |
| Heart of Depth | +15% Hydro DMG | After using an Elemental Skill, +30% ATK and Hydro DMG for 15s (conditional tag) |
| Thundersoother | +35% DMG against Electro-afflicted enemies (conditional tag) | +45% DMG against Electro-afflicted enemies (conditional tag, stacks with 2pc) |
| Crystallize | +80 Elemental Mastery (flat stat) | Gaining a Crystallize shield grants nearby party +35% DMG for that element for 10s (conditional tag) |
| Viridescent Venerer | +15% Anemo DMG | Swirl reactions shred enemy elemental RES by 40% for 10s (conditional tag) |
| Archaic Petra | +15% Geo DMG | Crystallize shield's element grants +35% that element's DMG (conditional tag) |
| Wanderer's Troupe | +80 Elemental Mastery (flat stat) | +35% charged-attack DMG (Bow) (conditional tag) |
| Gladiator's Finale | +18% ATK (flat/percent stat) | +35% Normal Attack DMG if a Sword/Claymore/Polearm is wielded (conditional tag) |
| Noblesse Oblige | +20% Elemental Burst DMG (conditional tag) | Using an Elemental Burst grants the whole party +20% ATK for 12s (conditional tag) |

## Main HUD

`UHUDWidget` aggregates everything below — every sub-widget reference is `BindWidgetOptional`,
so a WBP only needs to include the pieces its layout actually uses:

- **Vitals**: `HealthBar` (color-lerps to `LowHealthColor` under `LowHealthThreshold`),
  `StaminaBar`, `EnergyBar` (use a radial-fill material/Fill Type on the bound `UProgressBar`
  for the "circular" look — that's a WBP styling choice, not C++), all driven by
  `UStickmanAttributeSet`'s existing `OnHealthChanged`/`OnStaminaChanged`/`OnEnergyChanged`.
- **Party**: up to 4 portrait+health-bar pairs, refreshed from `UPartyManager::GetPartyMembers()`
  on `OnPartySwitched` (burst-ready icons: bind `PartyBurstReadyIconN` and drive its visibility
  from each member's ability cooldown state in a WBP graph, or extend `RefreshPartyList()`).
- **Skills**: 3 `USkillCooldownWidget` (radial cooldown fill + text + ready-glow + a
  `ShakeAnim` Widget Animation auto-played on a failed `TryCast()`) — their `SkillTag` is set
  automatically from the player's `NormalAttackSkillTag`/`Skill1SkillTag`/`Skill2SkillTag` on
  construct and on every party switch. Cooldown data comes from
  `UStickmanGameplayAbility::GetCooldownTimeRemaining()` (new) polled via
  `UStickmanAbilitySystemComponent::FindGrantedAbilityForSkillTag()` (new).
- **Minimap** (`UMinimapWidget` + `UMinimapCaptureComponent`, add the component to the player):
  north-up orthographic top-down `SceneCaptureComponent2D` render target, a player-icon
  rotation, pooled dynamic markers (quest/waypoint/enemy/NPC/resource, gathered from the
  systems already built — `UQuestManager`, `UWaypointManager`, `TActorIterator` over
  `AStickmanEnemyCharacter`/`AStickmanNPC`/`AResourceNode`), zoom levels (`CycleZoom()`), and a
  fog-of-war reveal render target accumulated via `UKismetRenderingLibrary::
  DrawMaterialToRenderTarget` every tick. **Two materials must be authored in-editor**:
  - `FogRevealMaterial`: unlit, params `RevealCenter` (vector, world-space UV 0-1) and
    `RevealRadius` (scalar) — draws a soft white circle at `RevealCenter`, transparent/black
    elsewhere, drawn additively onto a never-cleared RT so revealed areas accumulate.
  - `CompositeMaterial`: params `MapCapture`/`FogReveal` (textures), `PlayerWorldUV` (vector),
    `OrthoWidthUVFraction` (scalar) — per output pixel at local capture UV `L`, sample
    `FogReveal` at `PlayerWorldUV + (L - 0.5) * OrthoWidthUVFraction` (maps the player-centered
    local view into the fixed-world-space fog texture) and blend `MapCapture` toward black
    where that sample is dark.
- **Quest tracker**: embeds the existing `UQuestTrackerWidget` as-is.
- **Buffs/debuffs**: reuses the existing `UStickmanElementalGaugeWidget` (built for enemies) for
  the *player's own* active elemental auras — same data (`UElementalReactionManager::
  GetActiveElements`), same widget class, zero new code needed.
- **Combat feedback**: `UCombatFeedbackSubsystem` (GameInstanceSubsystem) decouples "a hit
  landed / a kill happened / the combo count changed" from the HUD — `UStickmanGameplayAbility::
  ApplyDamageToTarget` now rolls CRIT off the attacker's `UEquipmentManager` totals (defaults
  5%/50% if it doesn't have one) and calls `NotifyHitLanded`/`NotifyKillConfirmed`;
  `GA_NormalAttack` calls `NotifyComboCountChanged`. `UHUDWidget` flashes `HitMarkerImage` /
  `KillConfirmImage` for their configured durations, updates `ComboCounterText`, and shows
  `ReactionPopupText` off the same `UElementalReactionManager::OnReactionTriggered` the enemy
  gauge widget already listens to (damage-type icon next to damage numbers: already color-coded
  via `UStickmanDamageNumberStatics`, an icon is an extra `UImage` in `UStickmanDamageNumberWidget`
  keyed the same way).
- **Interaction prompt**: `ShowInteractionPrompt()`/`HideInteractionPrompt()` are ready to call,
  but nothing calls them continuously yet — `AStickmanCharacter::OnInteract()` only traces
  on the button press. Driving the prompt off a continuous per-tick trace (so it appears
  *before* pressing) is a small follow-up, not yet wired.
- **Ping / time of day**: `PingText` refreshes every second from `APlayerState::
  GetPingInMilliseconds()`; `TimeOfDayIcon` swaps texture (`TimeOfDayIcons` map) off
  `ADayNightManager::GetTimeOfDay()`/`OnTimeOfDayChanged` if one exists in the level.

## Menu screens

All screens live in `UI/Menus/` and are opened through `UMenuNavigationManager`
(GameInstanceSubsystem, stack-based): `PushMenu(WBP class)` opens on top (first push pauses the
game + frees the cursor), `PopMenu()` backs out (last pop unpauses), `PopToRoot()` closes
everything. Bind Pause/Escape to `PopMenu` once and every screen gets "back" for free —
`AStickmanPlayerController`'s existing Inventory/Map/Pause handlers should call
`PushMenu(WBP_Inventory/WBP_Map/WBP_Pause)` instead of their current debug prints (left as-is
so Blueprint subclasses choose their own WBP classes).

- **Character screen** (`UCharacterScreenWidget` + `ACharacterPreviewStage`): rotatable 3D
  preview via an off-screen stage actor (separate scene root so the capture doesn't spin with
  the mesh; spawned at Z=-100000, `ShowOnlyList` so only the preview mesh renders), full
  computed-stat panel (base × equipment totals, same math as `UEquipmentManager::
  ApplyTotalsToAttributeSet`), weapon+5 artifact slot icons, skill/burst showcase, constellation
  opacity states, level/EXP bar, 4 party tabs. **Equip entry points are click-based**
  (`EquipWeaponOnSelected`/`EquipArtifactOnSelected`); drag-drop is a WBP-side
  `OnDragDetected`/`OnDrop` override that ends up calling the same functions — UMG drag-drop
  visuals can't be authored from C++.
- **Inventory** (`UInventoryScreenWidget` + `UInventorySlotWidget` + **new
  `UInventoryManager`** in `Data/`): grid with pooled slots, 5 category tabs, 4 sort modes
  (cycle), selection-driven detail panel (hover = forward `OnMouseEnter` → `SelectItem` in the
  WBP; selection also serves gamepad), destroy-with-confirmation (quest items exempt), count
  badges, rarity border colors, "new" highlight cleared on first view. `UInventoryManager` also
  closes the old "rewards log-only" gap: quest `ItemRewards` now deposit as real items (+EXP now
  routes to the active party member), `AResourceNode` gathers deposit, and
  `UPartyManager::TryAscend` now *actually consumes* `RequiredMaterials` (fails without them).
  Currency still has no wallet — logged only.
- **Map screen** (`UMapScreenWidget`): pre-authored map texture (an open-world full map is a
  painted image, not a live capture) with zoom/pan, region labels + exploration % (from
  `UCollectibleManager::GetRegionProgress`), waypoint markers + teleport button
  (`UWaypointManager::TeleportTo`, closes menus after), tracked-quest markers, underground
  layers via `MapLayers` texture swap. Marker click-to-select needs the WBP to wrap markers in
  buttons (plain `UImage`s from C++) calling `SelectWaypoint`.
- **Quest journal** (`UQuestJournalWidget`): active list (tracked quest starred), completed
  archive (IDs only — completion drops the asset reference; keep a QuestID→asset DataTable if
  archived detail views are needed), objective checklist detail, reward preview from
  `FRewardData`, Track button (the HUD tracker + map markers already follow the tracked quest —
  that *is* "navigate to objective" here), Abandon (Main quests exempt).
- **Settings** (`USettingsScreenWidget`): graphics → `UGameUserSettings`
  (resolution/quality/FPS cap/VSync, engine-persisted); audio sliders → `UStickmanAudioManager`;
  the rest (sensitivity/language/auto-save interval/subtitles/colorblind mode/screen shake) →
  a custom `GConfig` section in `GameUserSettings.ini`, with static read points
  (`IsScreenShakeEnabled()` etc.) other systems consult. Colorblind modes apply engine
  `r.ColorCorrect.Deficiency*` CVars. **Key rebinding is not hardcoded**: Enhanced Input user
  settings are already enabled (`DefaultEngine.ini`); build rebind rows in the WBP against
  `UEnhancedInputUserSettings` — too asset-coupled for a generic C++ screen.
- **Gacha** (`UGachaScreenWidget`): banner pool DataTable (`FGachaPoolEntry` rows), Genshin-like
  pity (hard 5★ at 90, soft ramp from 75, 4★ every 10th), reveal queue the WBP steps through
  (`OnWishRevealed` per item → play rarity-colored reveal animation → `AdvanceRevealQueue`),
  results deposited into `UInventoryManager`. **Pulls are free** — no currency/wallet system
  exists to charge; pulled "characters" deposit as inventory tokens until an owned-characters
  roster feeding `UPartyManager` exists.

## Audio system

`UStickmanAudioManager` (GameInstanceSubsystem):

- **Categories/volumes**: Master/BGM/SFX/Voice/UI are engine `USoundClass` assets (author in
  `Content/Audio/Classes/` with Master as parent of the rest) mapped via `CategorySoundClasses`,
  plus one `USoundMix` in `VolumeControlMix`. `SetCategoryVolume()` pushes a mix-class override
  — every sound already routed to that class follows. The settings screen's volume sliders call
  this directly.
- **Concurrency**: assign a `USoundConcurrency` asset (Max Count = 10, resolution rule
  "Stop Farthest Then Oldest") to `DefaultSFXConcurrency`; `PlaySFX()` applies it to every
  spawned component.
- **Occlusion**: `PlaySFX()` line-traces listener→source and enables a lowpass
  (`OccludedLowpassFrequency`, default 800Hz) on the component when blocked. Single-trace,
  spawn-time only — good enough for one-shots; looping ambient sounds wanting live occlusion
  need the trace re-run on a timer (not built).
- **BGM**: `SetCurrentRegion()` crossfades (`CrossfadeDuration` 2s) between per-region tracks;
  `SetCombatIntensity(x, bBoss)` swaps to `CombatBGM`/`BossBGM` on entering combat and back to
  the region track on leaving (call from AI/spawner aggro code); boss **phase** transitions:
  bind `AEnemyElite::OnPhaseChanged` → `CrossfadeTo(PhaseTrack)`. `PlayNextInPlaylist()`
  shuffles the freeform `Playlist`. True *layered* intensity blending (combat layer riding
  under exploration at partial intensity) needs a MetaSound with an Intensity float input —
  the manager does a discrete crossfade; see MetaSound notes below.
- **Footsteps**: `UStickmanFootstepComponent` + `UAnimNotify_Footstep` (place on foot-plant
  frames). Traces down with `bReturnPhysicalMaterial`, maps `EPhysicalSurface` → sound.
  Setup: Project Settings → Physics → Physical Surface, define `Grass/Stone/Wood/Water/Sand/
  Snow/Metal` as SurfaceType1-7; author one `PhysicalMaterial` per surface with its
  SurfaceType set; assign to ground materials/landscape layers; fill the component's
  `FootstepSounds` map.
- **Voice**: `UStickmanVoiceComponent` — per-language `FVoiceLineSet` maps
  (`SkillCast/BurstCast/HitReaction/Death/ChestOpen/WeatherComment/IdleChatter/StoryDialogue`),
  static `SetVoiceLanguage()` switches every component at once, idle chatter self-schedules on
  a random interval, weather comments fire off `UWeatherManager::OnWeatherChanged`. Combat
  categories: call `PlayVoiceLine(SkillCast)` from ability activation (one line in
  `OnAbilityActivated`) — not force-wired to keep abilities audio-agnostic. Story dialogue
  normally plays through `FDialogueLine::VoiceLine` instead. Subtitles toggle: cutscene/dialogue
  widgets read `USettingsScreenWidget::AreSubtitlesEnabled()`.

### MetaSound setup (assets, author in-editor)

1. Per-element cast/impact sounds: one MetaSound Source per element (`MS_Cast_Pyro`, ...) with
   float inputs `Pitch` and `Velocity` — inside, a Wave Player (or synth) with pitch-shift node
   driven by `Pitch`, gain by `Velocity`. Combat code passes them via
   `UAudioComponent::SetFloatParameter(TEXT("Pitch"), ...)` on the component `PlaySFX` returns.
2. Layered BGM: a MetaSound with two Wave Players (exploration + combat layers) and an
   `Intensity` float crossfading their gains — assign as `CombatBGM` and drive `Intensity`
   through `SetFloatParameter` for continuous blending.
3. Reverb per environment: standard `AAudioVolume`s with reverb settings placed over
   caves/interiors — engine-level, no code.
4. Debug visualization: `au.Debug.Sounds 1` / `au.Debug.SoundWaves 1` console vars, plus
   MetaSound Editor's built-in analyzer graphs — no custom tooling built.

## VFX system

`UVFXManager` (`VFX/`, ActorComponent — add to `BP_StickmanCharacter` alongside
`UStickmanCharacterVFXComponent`): every spawn goes through one path applying, in order,
**cull** (beyond `CullDistance` or behind the camera past a 500u keep-alive radius — cheap
dot-product test, no render query), **LOD** (past `LODDistance`, the spawned component's
`SpawnRateScale` float User parameter is scaled by `LODSpawnRateScale`), **quality** (global
`SetVFXQuality` maps Low/Medium/High/Ultra onto both `SpawnRateScale` — 0.4/0.7/1/1 — and the
engine's `fx.Niagara.QualityLevel` CVar; wire to the settings screen's quality preset), and
**pooling** (finished components deactivate back into a `MaxPoolSize` pool via
`OnSystemFinished` instead of destroy/respawn). **Authoring contract**: give Niagara systems a
float User parameter named `SpawnRateScale` multiplying their spawn-rate modules — systems
without it still play, just don't scale.

`UStickmanCharacterVFXComponent` drives character state VFX off the existing movement tag:
dash trail / sprint wind / glide wind-lines / swim splash as state loops, landing impact as a
one-shot on the airborne→grounded transition, plus `SetElement()` (call on party switch)
tinting an elemental aura loop + weapon trail via an `ElementColor` linear-color User parameter.

### Niagara authoring guide (assets, in-editor — naming convention `NS_<Category>_<Name>`)

**Per-element templates** (`Content/VFX/Elements/`): one cast + one impact system per element,
all exposing `SpawnRateScale` + `ElementColor`. Suggested recipes (all start from the engine's
Fountain/Omnidirectional Burst templates):
- Pyro: sprite embers (up-drift + curl noise), a heat-distortion material sprite, dark smoke
  ribbon. | Cryo: mesh ice-shard burst, ground frost decal sprite, drifting snowflake sprites.
- Hydro: splash sprite sheet burst, rising bubble sprites, expanding ripple decal.
- Electro: beam-renderer arcs with jitter, spark burst, one-frame white flash sprite.
- Anemo: ribbon wind-lines orbiting a vortex velocity field, leaf mesh particles.
- Geo: rock mesh chunk burst (gravity + collision), dust cloud, crystal growth mesh scale-up.
- Dendro: vine ribbon growth, leaf/petal sprites, thorn mesh spikes scaling from ground.

Wire into gameplay by assigning them to what already consumes Niagara assets:
`FSkillData::CastVFX` (per-skill cast), `UStickmanReactionEffectsDataAsset` (per-reaction),
`UWeatherManager::WeatherVFX` (rain/snow/storm), waypoint/chest/collectible actors' VFX slots.

**Environment** (`Content/VFX/Env/`): weather particles already route through
`UWeatherManager`; ambient fireflies/dust/leaves are placed `NiagaraActor`s (no code);
water-surface interaction + grass ripple are material effects (the grass MPC pipeline from
the foliage system section); waypoint glow / chest sparkle assign to those actors' existing
`UnlockVFX`/`CollectVFX` properties.

**UI VFX** (`Content/VFX/UI/`): button hover glow, level-up burst, item-obtain shine, quest-
complete celebration are **UMG-side** — Widget Animations + material-based `UImage` brushes
(UI can't render world Niagara directly; UI-space particle materials or animated flipbook
brushes are the standard approach). Hook points already exist: `OnMemberLeveledUp`
(PartyManager), `OnItemChanged` (InventoryManager), `OnQuestCompleted` (QuestManager),
`OnWishRevealed` (Gacha).

## Save/load system

`USaveManager` (GameInstanceSubsystem) + `UStickmanSaveGame` (`SaveSystem/`). 4 slots: slot 0 =
auto-save, 1-3 manual (call `SaveToSlot` from the waypoint interact UI for "manual save at
waypoints"). Auto-save triggers: quest progress (`OnQuestUpdated`), waypoint unlock (the "area
transition" proxy — one seamless world, no hard level transitions to hook), and the interval
from the settings screen's auto-save setting.

**What's saved**: player transform, full party state (`FPartyMemberState` covers level/stats/
equipment IDs), inventory, active-quest runtime (asset resolved back via `FSoftObjectPath`;
current-stage objective counts only — earlier stages are complete by definition), completed
quest IDs, tracked quest, story flags, played dialogue/watched cutscene IDs, unlocked waypoints
(re-resolved to world actors by ID on load), collected item IDs, world-time hour, and fog-of-war
as periodically-sampled player positions (`VisitedFogPoints` — the reveal render target itself
isn't serializable; the minimap re-stamps these on load. Approximation, honest limitation).
**Settings deliberately excluded** — they persist globally via `GameUserSettings.ini` already;
per-slot settings would be wrong.

**File format**: `[magic][version][CRC32][zlib-compressed, XOR-obfuscated payload]` written via
raw file IO. The XOR pass is tamper-**deterrence**, not security — single-player saves can't be
truly protected without server authority, so it's labeled honestly. CRC32 catches corruption;
every write backs up the previous file to `.bak`; load falls back file → `.bak` → auto-save
slot. Versioning: header int, migrations hook in `ReadSlotFile` (none at v1).
**Cloud saves**: files live in the standard `Saved/SaveGames/` dir — Steam Auto-Cloud/GOG
Galaxy sync it by path config, no code; consoles swap the file IO for their `ISaveGameSystem`
(see `Docs/PACKAGING.md`).

**Load**: `LoadFromSlotAsync` does file IO + decompress on a background task, applies UObjects
on the game thread. `ULoadingScreenWidget` shows rotating tips + a progress bar (animates to
~90% on a timer, snaps to 100% on `OnLoadCompleted` — no granular progress exists for a single
background read; standard fake-smooth bar, labeled as such).

## Performance

`UPerformanceManager` (GameInstanceSubsystem + `FTickableGameObject`): exponential-smoothed FPS
tracking, and **dynamic quality** — below `TargetFPS` (default 30) for `DowngradeGraceSeconds`
drops one overall scalability level (+ VFX quality with it), recovers after sustained 1.25×
headroom, never auto-drops more than `MaxAutoStepsDown` below the user's chosen setting.
Budgets (CPU/GPU 33ms = the 30 FPS floor) are what `TargetFPS` enforces indirectly; per-category
profiling deliberately points at the engine's real tools (`stat unit/game/gpu/Niagara`, Unreal
Insights) instead of reimplementing profilers.

Console commands: `Stickman.ShowFPS`, `Stickman.ShowMemory`, `Stickman.ProfileCombat`
(combat snapshot: enemy counts + which stat commands to run), `Stickman.ToggleLOD` (force all
`UStickmanLODComponent`s to max detail / back to auto).

### Optimization settings (editor/config, not code — where each lives)

- **Distance culling per type**: Cull Distance Volumes (place one over the map, per-size cull
  distances), plus each Foliage Type's own cull range; `UStickmanLODComponent` already culls
  background stickmen at LOD3.
- **Frustum culling**: automatic; verify with `freezerendering` + fly the camera.
- **Occlusion**: hardware occlusion queries are on by default; `r.VisualizeOccludedPrimitives 1`
  to verify. **Precomputed Visibility Volumes** only help small/indoor spaces — for a 4km World
  Partition map rely on HLOD + streaming instead (already documented in the open-world section).
- **Memory**: texture streaming is on by default (`r.Streaming.PoolSize` per platform in
  `DefaultDeviceProfiles.ini`); audio uses Stream Caching (project settings); GC scheduling:
  `gc.TimeBetweenPurgingPendingKillObjects` + trigger `ForceGarbageCollection` on menu-open/
  teleport (natural hitching points). Pool sizes already exist where they matter
  (`UVFXManager::MaxPoolSize`, damage numbers, crowd NPCs).
- **Draw calls**: shared master materials + Material Instances per variant (the crowd's
  `ColorVariants` already assume this); ISM/HISM for repeated static meshes (foliage tool does
  this automatically); skeletal LODs per the character-LOD section; particle budget =
  `fx.Niagara.QualityLevel` via `UVFXManager::SetVFXQuality`, already driven by dynamic quality.

## Game flow / tutorials / achievements / cheats

`UStickmanGameFlow` (GameInstanceSubsystem, `GameFlow/`): state machine
`Splash→TitleScreen→Loading→Playing` with `Paused/Cutscene/Dialogue` as Playing-adjacent states.
Cutscene/Dialogue enter/exit **automatically** off `UCutsceneManager`/`UDialogueManager`
delegates — nothing else reports them. Transitions validate against a legal-move table (illegal
requests log + refuse). Fades: `OnFadeRequested` for a HUD fade widget, with
`APlayerCameraManager::StartCameraFade` as the built-in fallback. `StartGame(slot)` runs
TitleScreen→Loading→(async load)→Playing; new game (`INDEX_NONE`) runs first-time setup
(grants `InitialCharacterRow` from the config-pointed character DataTable). Crash recovery: a
`session.lock` sentinel written on init/cleared on clean shutdown — still present on next
launch means unclean exit, `DidLastSessionCrash()` tells the title screen to offer the
auto-save. Engine-level crash *handling* is external (Crash Reporter, see PACKAGING.md).

`UTutorialManager`: gameplay code calls `TriggerTutorial(Tag)` at teachable moments; entries
live in a DataTable (`FTutorialEntry`, **row name = the tag string** for O(1) lookup), one-time
entries persist as seen in the user config (per-install, survives save wipes). Popup display =
a WBP bound to `OnTutorialTriggered`. Practice domain = level content (a Data Layer with
non-respawning dummy spawners + a waypoint), no dedicated code.

`UAchievementManager`: `FAchievementEntry` DataTable rows advanced entirely off delegates other
systems already broadcast (kills/quests/collectibles/reactions/waypoints — zero new
instrumentation in gameplay code). `OnAchievementUnlocked` for the popup,
`GetAllAchievements()`+`GetProgress()` for the tracking UI, state persists in user config.
Platform upload (Steam/GOG/console `IOnlineAchievements`) hooks in `UnlockInternal`.

`UStickmanCheatManager` (set as `CheatClass` on `AStickmanPlayerController`; **auto-stripped
from Shipping builds** — that's UCheatManager's builtin behavior, no extra work):
`AddItem <ID> <Count>`, `SetLevel <N>`, `UnlockAllSkills` (clears every skill cooldown tag),
`Teleport <WaypointID>`, `CompleteQuest <QuestID>` (pumps ReportProgress through every stage),
`GodMode`, `InfiniteStamina` — the last two are static flags consumed by
`ApplyDamageToTarget`/`UElementalReactionManager::ApplyDirectDamage` and
`AStickmanCharacter::ConsumeStamina`.

## Notes

- Gameplay tags are declared natively (`UE_DEFINE_GAMEPLAY_TAG`), no `Config/Tags/*.ini` needed
  for the ones already in `StickmanGameplayTags.h`; add more there for per-skill `SkillTag`s.
- This has not been compiled against an actual UE 5.4 engine checkout in this session (no engine
  toolchain available) — do a first compile pass in the Editor and expect to fix minor API
  mismatches (GAS internals shift slightly between engine point releases).
