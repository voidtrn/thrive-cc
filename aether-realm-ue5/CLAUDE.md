# Aether Realm — Project Instructions

Genshin-inspired mini open-world action RPG, UE 5.4, solo/indie scale. C++-first (`Source/MyGame`), Blueprint wires it up per `Docs/PHASE*_SETUP.md`. Read `Docs/BUILD_NOTES.md` and `Docs/CODE_REVIEW.md` before touching gameplay code — they hold the real state of the codebase (known limitations, fixed bugs, what's audited vs not).

## Ground truth

- **Never compiled in UE** — this repo's environment has no Unreal Editor. Code is written to UE 5.4 API + manually audited, not built. First real compile will surface small errors (missing include, signature drift). Don't claim "this compiles" — say "matches UE 5.4 API, unverified by compiler."
- Module deps: `MyGame.Build.cs`. Plugins: `.uproject` (EnhancedInput, Niagara, Water, GameplayAbilities, ModelingTools, OnlineSubsystem+Steam, MotionWarping).
- Multiplayer-ready by design: `AOpenWorldGameState`/`AOpenWorldPlayerState` replicate world/party state; validation is always server-side. Treat this as a hard constraint, not a suggestion — new gameplay writes to replicated state need `HasAuthority()` / Server RPC, not client-side mutation.

## Conventions (violating these has bitten this project before — see BUILD_NOTES.md)

- Every `AddDynamic`/`AddUniqueDynamic` handler is `UFUNCTION()`. Miss it → silent no-op, no compile error.
- Any file with `DOREPLIFETIME*` includes `Net/UnrealNetwork.h`.
- `.generated.h` is the last include in every header, always.
- Instanced `UObject`s (abilities/effects created via `NewObject` on a UObject, not an Actor/Component) that Tick or use timers must override `GetWorld()` through the outer chain — `AbilityBase` cooldowns silently no-op'd on this once.
- Stat recalculation must not stomp buffs/shields applied after base-stat compute (`ReapplyActiveBuffs` pattern).
- Damage/RES formula changes get a case in `Source/MyGame/Private/Tests/DamageCalculatorTest.cpp` — these are pure-math tests, runnable without playing the game (Session Frontend → Automation → filter `AetherRealm`).

## Before proposing "new gap to fix"

`Docs/CODE_REVIEW.md` tracks gap status (P1/P2/P3, all closed as of last pass). Check it first — don't rediscover a closed gap. New findings go through the same doc's "ANTISIPASI" section format (concrete failure mode, not vague "could be improved").

## Review workflow

For C++ changes under `Source/`, use the `ue5-reviewer` subagent (`.claude/agents/ue5-reviewer.md`) — it's scoped to this project's specific failure modes (see checklist above) instead of generic C++ review. Cheaper and more targeted than a general code-review pass.

## Tone

This subfolder inherits repo-root `CLAUDE.md` (RTK + caveman mode). No project-specific override — stay terse, technical substance intact.
