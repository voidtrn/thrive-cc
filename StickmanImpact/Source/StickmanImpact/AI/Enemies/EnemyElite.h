// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "StickmanEnemyCharacter.h"
#include "EnemyElite.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnElitePhaseChanged, int32, NewPhaseIndex);

/**
 * Elite/Boss: health-percent phase thresholds (e.g. [0.66, 0.33] = 3 phases). Each phase can
 * grant a different WeightedAttacks table via PhaseAttackOverrides — override
 * OnPhaseChanged (Blueprint-implementable) for phase-transition VFX/invulnerability windows/
 * arena changes ("special mechanics").
 */
UCLASS()
class STICKMANIMPACT_API AEnemyElite : public AStickmanEnemyCharacter
{
	GENERATED_BODY()

public:
	AEnemyElite();

	virtual void BeginPlay() override;

	// Health percent (0-1) at which each phase transition happens, in descending order,
	// e.g. {0.66f, 0.33f} for a 3-phase fight.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Boss")
	TArray<float> PhaseHealthThresholds;

	// Index-aligned with PhaseHealthThresholds + 1 (phase 0 = base WeightedAttacks). Empty
	// entries fall back to the base WeightedAttacks table.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Boss")
	TArray<FStickmanWeightedAttack> PhaseAttackOverrides;

	UPROPERTY(BlueprintAssignable, Category = "Boss")
	FOnElitePhaseChanged OnPhaseChanged;

	UFUNCTION(BlueprintPure, Category = "Boss")
	int32 GetCurrentPhase() const { return CurrentPhaseIndex; }

	// Call every time the boss takes damage (e.g. from UStickmanGameplayAbility::ApplyDamageToTarget
	// or a dedicated tick) to check for a phase transition.
	UFUNCTION(BlueprintCallable, Category = "Boss")
	void CheckPhaseTransition();

private:
	UFUNCTION()
	void HandleHealthChanged(float NewHealth, float MaxHealth);

	int32 CurrentPhaseIndex = 0;
};
