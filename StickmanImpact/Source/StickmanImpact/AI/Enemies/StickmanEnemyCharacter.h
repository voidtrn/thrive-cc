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

	// --- Hit reaction polish (called by UStickmanGameplayAbility::ApplyDamageToTarget) -----

	// Accumulated damage inside StaggerWindow above this = stagger (flinch montage + brief stop).
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Hit Reaction")
	float StaggerDamageThreshold = 120.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Hit Reaction")
	float StaggerWindow = 2.f;

	// Interruptible flinch — play as an upper-body-slot montage so locomotion blends under it.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Hit Reaction")
	TObjectPtr<UAnimMontage> FlinchMontage;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Hit Reaction")
	TObjectPtr<UAnimMontage> StaggerMontage;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Hit Reaction")
	float KnockbackForce = 350.f;

	// "Seeing stars" loop while stunned/staggered.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Hit Reaction")
	TObjectPtr<class UNiagaraSystem> StunnedStarsVFX;

	// >= 3 variants per spec; SoundCue random node inside each also works.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Hit Reaction")
	TArray<TObjectPtr<USoundBase>> PainSounds;

	UFUNCTION(BlueprintCallable, Category = "Hit Reaction")
	void ReceiveHitFeedback(const FVector& HitDirection, float Damage, bool bKilled);

	UFUNCTION(BlueprintPure, Category = "Hit Reaction")
	bool IsStaggered() const { return bIsStaggered; }

protected:
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Abilities", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UStickmanAbilitySystemComponent> AbilitySystemComponent;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Abilities", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UStickmanAttributeSet> AttributeSet;

	EEnemyCombatState CurrentCombatState = EEnemyCombatState::Patrol;

	// Hit-reaction runtime state.
	float StaggerAccumulatedDamage = 0.f;
	float LastHitTime = -999.f;
	bool bIsStaggered = false;
	FTimerHandle StaggerRecoverTimerHandle;

	void ActivateRagdoll(const FVector& ForceDirection, float Damage);
};
