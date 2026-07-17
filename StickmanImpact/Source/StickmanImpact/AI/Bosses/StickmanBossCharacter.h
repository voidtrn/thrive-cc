// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "StickmanBossTypes.h"
#include "StickmanBossCharacter.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnBossPhaseChanged, int32, PhaseIndex, const FString&, PhaseName);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnBossStaggerChanged, float, Current, float, Max);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnBossStaggered);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnBossTaunt, const FText&, Line);

/**
 * Multi-phase boss on top of AStickmanEnemyCharacter. Souls-like + Genshin hybrid:
 *
 * - **Phases**: `Phases` (FBossPhase, authored HP-descending). Crossing a threshold makes the
 *   boss invulnerable, plays the transition montage/VFX/SFX, grants that phase's abilities,
 *   swaps its available attack patterns, and applies the aggression multiplier. Final phase =
 *   desperation (author it fast + few patterns). `OnBossPhaseChanged` drives the arena/camera.
 * - **Attack rotation**: `PickNextPattern()` draws from the current phase's `AvailablePatterns`
 *   with no repeats until the set is exhausted (BT task calls it). Adaptive: biases away from
 *   the pattern the player has been dodging most (fed by the telegraph/defense hooks).
 * - **Stagger bar**: `AddStagger` (heavy hits + reactions fill it); full = downed for
 *   `StaggerDownDuration` (a big damage window), then it empties. Separate from the base
 *   flinch-stagger — this is the visible boss poise bar.
 * - **Weak points**: `WeakPoints` rotate (`ActiveWeakPointIndex` cycles on a timer); hitting the
 *   active bone applies its multiplier, and enough damage "breaks" it (permanent bonus). A
 *   weak point can gate behind an elemental shield that must be broken with `ShieldElement`.
 * - **AI director**: tracks player deaths to this boss (`NotifyPlayerDied`) — 3+ deaths eases
 *   incoming damage (mercy); a flawless/fast player gets `bAddedMechanicsForSkilledPlayer`
 *   turned on (author extra pattern availability behind it). Reacts to the player's favorite
 *   element (via UAdaptiveDifficultySubsystem) by resisting it a touch.
 * - **Variant** (`EBossVariant`) + `RewardTable` drive UBossEncounterSubsystem on death
 *   (first-clear vs farm, kill-count titles, speed/no-hit bonuses).
 *
 * Example authoring (Pyro Sovereign "Ignis Rex"): Phase1 75% sword combos; Phase2 50% adds
 * Pyro AoE + summons embers; Phase3 25% desperation flight + arena-wide firestorm ultimate.
 */
UCLASS()
class STICKMANIMPACT_API AStickmanBossCharacter : public AStickmanEnemyCharacter
{
	GENERATED_BODY()

public:
	AStickmanBossCharacter();

	virtual void BeginPlay() override;

	// --- Config ---------------------------------------------------------------------------

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss")
	FString BossID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss")
	FText DisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss")
	EBossVariant Variant = EBossVariant::Story;

	// Authored high-to-low by HPThreshold. Index 0 is the opening phase (threshold ~1.0).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss")
	TArray<FBossPhase> Phases;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss")
	TArray<FBossWeakPoint> WeakPoints;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss|Stagger")
	float MaxStagger = 1000.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss|Stagger")
	float StaggerDownDuration = 5.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss|Stagger")
	float StaggerDecayPerSecond = 40.f;

	// Seconds between weak-point rotations.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss|WeakPoint")
	float WeakPointRotateInterval = 12.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss|Reward")
	FRewardData FirstClearReward;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss|Reward")
	FRewardData FarmReward;

	// --- Runtime API (BT tasks / damage funnel call these) --------------------------------

	// Weighted, no-repeat pick from the current phase's patterns. Biased by adaptive data.
	UFUNCTION(BlueprintCallable, Category = "Boss")
	EBossAttackPattern PickNextPattern();

	// Fill the poise bar (heavy hits, reactions). Triggers the down state at full.
	UFUNCTION(BlueprintCallable, Category = "Boss")
	void AddStagger(float Amount);

	UFUNCTION(BlueprintPure, Category = "Boss")
	bool IsDownedByStagger() const { return bStaggerDowned; }

	UFUNCTION(BlueprintPure, Category = "Boss")
	bool IsPhaseTransitioning() const { return bPhaseTransitioning; }

	// Damage-funnel hook: multiplier for a hit landing on BoneName with Element, accounting for
	// the active/broken weak point and the elemental shield gate. 0 = fully blocked by shield.
	UFUNCTION(BlueprintCallable, Category = "Boss")
	float GetIncomingDamageMultiplier(FName BoneName, EStickmanElement Element);

	UFUNCTION(BlueprintPure, Category = "Boss")
	int32 GetCurrentPhaseIndex() const { return CurrentPhaseIndex; }

	// AI director: called by the death/respawn flow when the player wipes to this boss.
	UFUNCTION(BlueprintCallable, Category = "Boss")
	void NotifyPlayerDied();

	// --- Delegates ------------------------------------------------------------------------

	UPROPERTY(BlueprintAssignable, Category = "Boss")
	FOnBossPhaseChanged OnBossPhaseChanged;

	UPROPERTY(BlueprintAssignable, Category = "Boss")
	FOnBossStaggerChanged OnBossStaggerChanged;

	UPROPERTY(BlueprintAssignable, Category = "Boss")
	FOnBossStaggered OnBossStaggered;

	UPROPERTY(BlueprintAssignable, Category = "Boss")
	FOnBossTaunt OnBossTaunt;

	// Per-phase spectacle (arena change, dramatic camera) — C++ owns the mechanical transition,
	// BP realizes the set-piece.
	UFUNCTION(BlueprintImplementableEvent, Category = "Boss")
	void OnPhaseTransitionBegin(int32 NewPhaseIndex);

protected:
	UFUNCTION()
	void HandleHealthChanged(float NewHealth, float MaxHealth);

	void EnterPhase(int32 PhaseIndex);
	void FinishPhaseTransition();
	void RotateWeakPoint();
	void TickStaggerDecay();
	void RecoverFromStaggerDown();
	void GrantAbilities(const TArray<TSubclassOf<UGameplayAbility>>& Abilities);
	void HandleDeathRewards();

private:
	int32 CurrentPhaseIndex = -1;
	bool bPhaseTransitioning = false;

	float CurrentStagger = 0.f;
	bool bStaggerDowned = false;

	int32 ActiveWeakPointIndex = 0;
	TSet<int32> BrokenWeakPoints;
	TMap<int32, float> WeakPointDamageTaken;
	bool bElementalShieldActive = true;

	// Adaptive.
	int32 PlayerDeathCount = 0;
	bool bMercyActive = false;
	bool bAddedMechanicsForSkilledPlayer = false;

	// Pattern rotation (no repeats until the pool empties).
	TArray<EBossAttackPattern> UnusedPatternsThisCycle;

	FTimerHandle PhaseTransitionTimerHandle;
	FTimerHandle WeakPointRotateTimerHandle;
	FTimerHandle StaggerDecayTimerHandle;
	FTimerHandle StaggerRecoverTimerHandle;
	bool bDeathRewardsGranted = false;
};
