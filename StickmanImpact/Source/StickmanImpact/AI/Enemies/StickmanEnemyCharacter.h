// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "AbilitySystemInterface.h"
#include "AI/StickmanAITypes.h"
#include "Character/StickmanStatTypes.h"
#include "Combat/StickmanReactionTypes.h"
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

	// Combat personality: applied over the archetype's base tuning in BeginPlay — each type
	// has a distinct rhythm the player can learn (see ApplyPersonality for the exact deltas).
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Combat")
	EEnemyPersonality Personality = EEnemyPersonality::Aggressive;

	// Attack tell length passed to the telegraph component (per-personality adjusted).
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Combat")
	float AttackTellDuration = 0.8f;

	// Leader: buffs nearby allies' Attack while alive (group AI "leader enemy").
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Combat")
	bool bIsLeader = false;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Combat")
	float LeaderBuffRadius = 1200.f;

	// Berserker: montage/attack play-rate multiplier read by BT/abilities.
	UFUNCTION(BlueprintPure, Category = "Combat")
	float GetAttackSpeedMultiplier() const;

	// --- Elemental resistance / immunity ---------------------------------------
	// Elites: one element at 0.5 (50% reduced). Bosses: their own element at 0 (immune).
	// Values are damage multipliers (1 = normal, 0 = immune, 2 = weakness).
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Resistance")
	TMap<EStickmanElement, float> ElementDamageMultipliers;

	// Reactions this enemy takes bonus/reduced damage from (e.g. 2.0 = "takes 200% from
	// Overload"); unlisted reactions = 1.0.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Resistance")
	TMap<EStickmanReactionType, float> ReactionDamageMultipliers;

	UFUNCTION(BlueprintPure, Category = "Resistance")
	float GetElementDamageMultiplier(EStickmanElement Element) const;

	UFUNCTION(BlueprintPure, Category = "Resistance")
	float GetReactionDamageMultiplier(EStickmanReactionType Reaction) const;

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

	// --- Juggle system --------------------------------------------------------

	// 0 = feather (full launch), 1 = unliftable. Heavies resist launch velocity by this much.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Juggle", meta = (ClampMin = "0", ClampMax = "1"))
	float JuggleWeight = 0.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Juggle")
	int32 MaxJuggleHits = 3;

	// After this many air hits, the enemy may tech (flip out) instead of eating the rest.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Juggle")
	int32 AirTechAfterHits = 2;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Juggle")
	float AirTechChance = 0.4f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Juggle")
	TObjectPtr<UAnimMontage> AirRecoveryMontage;

	UFUNCTION(BlueprintCallable, Category = "Juggle")
	void LaunchIntoAir(float KnockupVelocity);

	// Called per air hit; returns false when the enemy teched/juggle-capped (hit whiffs into
	// their recovery invulnerability instead).
	UFUNCTION(BlueprintCallable, Category = "Juggle")
	bool RegisterJuggleHit();

	UFUNCTION(BlueprintPure, Category = "Juggle")
	bool IsJuggled() const;

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

	// Juggle runtime state.
	int32 JuggleHitCount = 0;
	bool bAirRecovering = false;

	void ActivateRagdoll(const FVector& ForceDirection, float Damage);

public:
	virtual void Landed(const FHitResult& Hit) override;
	// Needed by IsJuggled()'s inline body.
	// (GetCharacterMovement is public on ACharacter — nothing extra required.)
};
