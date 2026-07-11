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

## Notes

- Gameplay tags are declared natively (`UE_DEFINE_GAMEPLAY_TAG`), no `Config/Tags/*.ini` needed
  for the ones already in `StickmanGameplayTags.h`; add more there for per-skill `SkillTag`s.
- This has not been compiled against an actual UE 5.4 engine checkout in this session (no engine
  toolchain available) — do a first compile pass in the Editor and expect to fix minor API
  mismatches (GAS internals shift slightly between engine point releases).
