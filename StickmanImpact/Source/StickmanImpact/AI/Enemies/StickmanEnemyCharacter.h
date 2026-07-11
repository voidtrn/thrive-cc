// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "AbilitySystemInterface.h"
#include "AI/StickmanAITypes.h"
#include "Character/StickmanStatTypes.h"
#include "StickmanEnemyCharacter.generated.h"

class UStickmanAbilitySystemComponent;
class UStickmanAttributeSet;
class UGameplayAbility;

/**
 * Base for every AI-controlled enemy. Owns the same GAS plumbing as the player
 * (UStickmanAbilitySystemComponent + UStickmanAttributeSet) so enemies can use the same
 * elemental abilities/reactions, plus the tuning BT_StickmanEnemy's shared C++ tasks read to
 * drive combat: WeightedAttacks (random weighted selection), OptimalCombatDistance (kept via
 * BTTask_ApproachTarget), and RetreatHealthPercent (BTDecorator_HealthBelowThreshold). One
 * BehaviorTree asset can drive all 5 enemy archetypes by just retuning these per-subclass.
 */
UCLASS()
class STICKMANIMPACT_API AStickmanEnemyCharacter : public ACharacter, public IAbilitySystemInterface
{
	GENERATED_BODY()

public:
	AStickmanEnemyCharacter();

	virtual void BeginPlay() override;
	virtual UAbilitySystemComponent* GetAbilitySystemComponent() const override;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Abilities")
	TArray<TSubclassOf<UGameplayAbility>> DefaultAbilities;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Combat")
	TArray<FStickmanWeightedAttack> WeightedAttacks;

	// Distance BTTask_ApproachTarget tries to hold from TargetActor.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Combat")
	float OptimalCombatDistance = 200.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Combat")
	float RetreatHealthPercent = 0.2f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Combat")
	float DodgeChance = 0.25f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Combat")
	float DodgeDistance = 300.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "AI")
	FStickmanStats Stats;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "AI")
	float PatrolRadius = 1000.f;

	UPROPERTY(BlueprintReadOnly, Category = "AI")
	FVector PatrolOrigin = FVector::ZeroVector;

	// Set by AEnemySpawner when it spawns this pawn, so its AIController can report combat
	// entry back for the camp-wide alert system. Null if not spawned by a spawner.
	UPROPERTY(BlueprintReadWrite, Category = "AI")
	TObjectPtr<AActor> SpawningSpawner;

	UFUNCTION(BlueprintPure, Category = "Combat")
	FGameplayTag SelectWeightedAttack() const;

	UFUNCTION(BlueprintPure, Category = "Combat")
	float GetHealthPercent() const;

	UFUNCTION(BlueprintCallable, Category = "Combat")
	void SetCombatState(EEnemyCombatState NewState) { CurrentCombatState = NewState; }

	UFUNCTION(BlueprintPure, Category = "Combat")
	EEnemyCombatState GetCombatState() const { return CurrentCombatState; }

protected:
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Abilities", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UStickmanAbilitySystemComponent> AbilitySystemComponent;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Abilities", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UStickmanAttributeSet> AttributeSet;

	EEnemyCombatState CurrentCombatState = EEnemyCombatState::Patrol;
};
