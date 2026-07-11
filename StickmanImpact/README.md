# StickmanImpact

Stickman open-world action RPG foundation, UE5.4+, C++ first.

## Source layout

```
Source/StickmanImpact/
  Character/     AStickmanCharacter, FStickmanStats, movement gameplay tags
  SkillSystem/   EStickmanElement/EStickmanSkillType enums, FSkillData, UStickmanSkillDataAsset
  Combat/        (empty — hit detection / damage / GameplayEffects go here next)
  UI/            AStickmanHUD, UStickmanInputDebugWidget
  World/         (empty — interactables, streaming volumes)
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

## Notes

- Normal Attack / Skill1 / Skill2 / Interact currently just print on-screen debug messages — real GAS `UGameplayAbility` wiring plugs in via `FSkillData::AbilityClass` once the Combat module lands.
- Gameplay tags are declared natively (`UE_DEFINE_GAMEPLAY_TAG`), no `Config/Tags/*.ini` needed.
