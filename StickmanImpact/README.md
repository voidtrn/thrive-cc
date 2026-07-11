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

## Notes

- Gameplay tags are declared natively (`UE_DEFINE_GAMEPLAY_TAG`), no `Config/Tags/*.ini` needed
  for the ones already in `StickmanGameplayTags.h`; add more there for per-skill `SkillTag`s.
- This has not been compiled against an actual UE 5.4 engine checkout in this session (no engine
  toolchain available) — do a first compile pass in the Editor and expect to fix minor API
  mismatches (GAS internals shift slightly between engine point releases).
