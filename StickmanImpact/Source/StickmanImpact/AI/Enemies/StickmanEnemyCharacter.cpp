// Copyright StickmanImpact Project.

#include "StickmanEnemyCharacter.h"
#include "Combat/StickmanAbilitySystemComponent.h"
#include "Combat/StickmanAttributeSet.h"
#include "Audio/StickmanAudioManager.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Components/CapsuleComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SkeletalMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Engine/SkeletalMesh.h"
#include "Animation/AnimSequence.h"
#include "UObject/ConstructorHelpers.h"
#include "NiagaraFunctionLibrary.h"
#include "EngineUtils.h"
#include "TimerManager.h"

AStickmanEnemyCharacter::AStickmanEnemyCharacter()
{
	AbilitySystemComponent = CreateDefaultSubobject<UStickmanAbilitySystemComponent>(TEXT("AbilitySystemComponent"));
	AbilitySystemComponent->SetIsReplicated(true);
	AbilitySystemComponent->SetReplicationMode(EGameplayEffectReplicationMode::Minimal);

	AttributeSet = CreateDefaultSubobject<UStickmanAttributeSet>(TEXT("AttributeSet"));

	// DEV placeholder (revert before ship): a cone stand-in so enemies are visible with no mesh
	// authored. Cone shape distinguishes them from the player's cube. Delete once real content exists.
	UStaticMeshComponent* DevPlaceholder = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("DevPlaceholderMesh"));
	DevPlaceholder->SetupAttachment(RootComponent);
	DevPlaceholder->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	DevPlaceholder->SetRelativeScale3D(FVector(0.6f, 0.6f, 1.7f));
	static ConstructorHelpers::FObjectFinder<UStaticMesh> DevCone(TEXT("/Engine/BasicShapes/Cone.Cone"));
	if (DevCone.Succeeded())
	{
		DevPlaceholder->SetStaticMesh(DevCone.Object);
	}
	// Humanoid mesh + idle are loaded at runtime in BeginPlay (plugin content mounts later).
	DevPlaceholderComp = DevPlaceholder;
}

void AStickmanEnemyCharacter::BeginPlay()
{
	Super::BeginPlay();

	// DEV: runtime-load humanoid mesh (plugin content mounted by now), hide the cone, play idle.
	const TCHAR* Base = TEXT("/NetworkPredictionExtras/Animation/Characters/UE4_Guy");
	if (USkeletalMesh* Manny = LoadObject<USkeletalMesh>(nullptr, *FString::Printf(TEXT("%s/Mesh/SK_Mannequin.SK_Mannequin"), Base)))
	{
		GetMesh()->SetSkeletalMesh(Manny);
		GetMesh()->SetRelativeLocationAndRotation(FVector(0.f, 0.f, -88.f), FRotator(0.f, -90.f, 0.f));
		if (DevPlaceholderComp)
		{
			DevPlaceholderComp->SetVisibility(false);
		}
	}
	DevIdleAnim = LoadObject<UAnimSequence>(nullptr, *FString::Printf(TEXT("%s/Animations/ThirdPersonIdle.ThirdPersonIdle"), Base));
	if (DevIdleAnim && GetMesh() && GetMesh()->GetSkeletalMeshAsset())
	{
		GetMesh()->PlayAnimation(DevIdleAnim, /*bLooping=*/true);
	}

	PatrolOrigin = GetActorLocation();

	// Personality deltas over the archetype base — each type gets a distinct, learnable rhythm.
	switch (Personality)
	{
		case EEnemyPersonality::Aggressive:
			OptimalCombatDistance *= 0.7f;
			AttackTellDuration *= 0.85f;
			Stats.MaxHealth *= 0.8f;
			break;
		case EEnemyPersonality::Defensive:
			AttackTellDuration *= 1.3f;
			StaggerDamageThreshold *= 1.6f;
			DodgeChance += 0.15f;
			break;
		case EEnemyPersonality::Tactical:
			OptimalCombatDistance *= 1.4f;
			DodgeChance += 0.1f;
			break;
		case EEnemyPersonality::Cowardly:
			RetreatHealthPercent = FMath::Max(RetreatHealthPercent, 0.5f);
			OptimalCombatDistance *= 1.2f;
			break;
		case EEnemyPersonality::Berserker:
			// Speed scaling lives in GetAttackSpeedMultiplier(); nothing static to change.
			break;
	}

	// Leader aura: periodic Attack buff to allies in radius while this enemy lives.
	if (bIsLeader)
	{
		FTimerHandle LeaderBuffHandle;
		GetWorldTimerManager().SetTimer(LeaderBuffHandle, FTimerDelegate::CreateWeakLambda(this, [this]()
		{
			for (TActorIterator<AStickmanEnemyCharacter> It(GetWorld()); It; ++It)
			{
				if (*It != this && !It->bIsLeader
					&& FVector::Dist(It->GetActorLocation(), GetActorLocation()) <= LeaderBuffRadius)
				{
					if (UStickmanAttributeSet* AllyAttributes = const_cast<UStickmanAttributeSet*>(
							It->GetAbilitySystemComponent()->GetSet<UStickmanAttributeSet>()))
					{
						AllyAttributes->SetAttack(It->Stats.Attack * 1.15f);
					}
				}
			}
		}), 2.f, true);
	}

	if (AbilitySystemComponent)
	{
		AbilitySystemComponent->InitAbilityActorInfo(this, this);
		if (AttributeSet)
		{
			AttributeSet->InitHealth(Stats.MaxHealth);
			AttributeSet->InitMaxHealth(Stats.MaxHealth);
			AttributeSet->InitStamina(Stats.MaxStamina);
			AttributeSet->InitMaxStamina(Stats.MaxStamina);
			AttributeSet->InitAttack(Stats.Attack);
			AttributeSet->InitDefense(Stats.Defense);
			AttributeSet->InitElementalMastery(Stats.ElementalMastery);
			AttributeSet->InitEnergyRecharge(Stats.EnergyRecharge);
		}
		AbilitySystemComponent->GrantDefaultAbilities(DefaultAbilities);
	}
}

UAbilitySystemComponent* AStickmanEnemyCharacter::GetAbilitySystemComponent() const
{
	return AbilitySystemComponent;
}

FGameplayTag AStickmanEnemyCharacter::SelectWeightedAttack() const
{
	if (WeightedAttacks.Num() == 0)
	{
		return FGameplayTag();
	}

	float TotalWeight = 0.f;
	for (const FStickmanWeightedAttack& Attack : WeightedAttacks)
	{
		TotalWeight += FMath::Max(Attack.Weight, 0.f);
	}
	if (TotalWeight <= 0.f)
	{
		return WeightedAttacks[0].SkillTag;
	}

	float Roll = FMath::FRandRange(0.f, TotalWeight);
	for (const FStickmanWeightedAttack& Attack : WeightedAttacks)
	{
		Roll -= FMath::Max(Attack.Weight, 0.f);
		if (Roll <= 0.f)
		{
			return Attack.SkillTag;
		}
	}
	return WeightedAttacks.Last().SkillTag;
}

void AStickmanEnemyCharacter::ReceiveHitFeedback(const FVector& HitDirection, float Damage, bool bKilled)
{
	if (bKilled)
	{
		ActivateRagdoll(HitDirection, Damage);
		return;
	}

	// Pain sound: random variant, throttled implicitly by concurrency.
	if (PainSounds.Num() > 0)
	{
		if (UStickmanAudioManager* Audio = GetGameInstance()->GetSubsystem<UStickmanAudioManager>())
		{
			USoundBase* Pain = PainSounds[FMath::RandRange(0, PainSounds.Num() - 1)];
			Audio->PlaySFX(Pain, GetActorLocation(), 1.f, FMath::FRandRange(0.9f, 1.1f));
		}
	}

	// Directional knockback along the incoming hit.
	FVector Knock = HitDirection;
	Knock.Z = 0.f;
	LaunchCharacter(Knock.GetSafeNormal() * KnockbackForce, false, false);

	// Stagger accumulation: window-decayed damage total crosses the threshold = full stagger;
	// below it, a light interruptible flinch.
	const float Now = GetWorld()->GetTimeSeconds();
	if (Now - LastHitTime > StaggerWindow)
	{
		StaggerAccumulatedDamage = 0.f;
	}
	LastHitTime = Now;
	StaggerAccumulatedDamage += Damage;

	UAnimInstance* AnimInstance = GetMesh() ? GetMesh()->GetAnimInstance() : nullptr;
	if (!bIsStaggered && StaggerAccumulatedDamage >= StaggerDamageThreshold)
	{
		bIsStaggered = true;
		StaggerAccumulatedDamage = 0.f;
		SetCombatState(EEnemyCombatState::Staggered);
		if (StaggerMontage && AnimInstance)
		{
			AnimInstance->Montage_Play(StaggerMontage);
		}
		if (StunnedStarsVFX)
		{
			UNiagaraFunctionLibrary::SpawnSystemAttached(StunnedStarsVFX, GetMesh(), TEXT("head"),
				FVector(0.f, 0.f, 30.f), FRotator::ZeroRotator, EAttachLocation::KeepRelativeOffset, true);
		}
		GetWorldTimerManager().SetTimer(StaggerRecoverTimerHandle, FTimerDelegate::CreateWeakLambda(this, [this]()
		{
			bIsStaggered = false;
			SetCombatState(EEnemyCombatState::Combat);
		}), 1.5f, false);
	}
	else if (FlinchMontage && AnimInstance && !AnimInstance->Montage_IsPlaying(StaggerMontage))
	{
		// Flinch blends over whatever's playing and is itself interruptible by the next hit.
		AnimInstance->Montage_Play(FlinchMontage);
	}
}

void AStickmanEnemyCharacter::ForceStagger(float Duration)
{
	if (bIsStaggered)
	{
		return;
	}

	bIsStaggered = true;
	StaggerAccumulatedDamage = 0.f;
	SetCombatState(EEnemyCombatState::Staggered);

	if (UAnimInstance* AnimInstance = GetMesh() ? GetMesh()->GetAnimInstance() : nullptr)
	{
		if (StaggerMontage)
		{
			AnimInstance->Montage_Play(StaggerMontage);
		}
	}
	if (StunnedStarsVFX)
	{
		UNiagaraFunctionLibrary::SpawnSystemAttached(StunnedStarsVFX, GetMesh(), TEXT("head"),
			FVector(0.f, 0.f, 30.f), FRotator::ZeroRotator, EAttachLocation::KeepRelativeOffset, true);
	}

	GetWorldTimerManager().SetTimer(StaggerRecoverTimerHandle, FTimerDelegate::CreateWeakLambda(this, [this]()
	{
		bIsStaggered = false;
		SetCombatState(EEnemyCombatState::Combat);
	}), FMath::Max(Duration, 0.1f), false);
}

void AStickmanEnemyCharacter::ActivateRagdoll(const FVector& ForceDirection, float Damage)
{
	GetCharacterMovement()->DisableMovement();
	GetCapsuleComponent()->SetCollisionEnabled(ECollisionEnabled::NoCollision);

	if (USkeletalMeshComponent* MeshComponent = GetMesh())
	{
		MeshComponent->SetCollisionProfileName(TEXT("Ragdoll"));
		MeshComponent->SetSimulatePhysics(true);
		// Killing-blow force along the final hit's direction, scaled by damage.
		MeshComponent->AddImpulse(ForceDirection.GetSafeNormal() * FMath::Clamp(Damage, 100.f, 600.f) * 100.f,
			NAME_None, true);
	}

	SetLifeSpan(6.f); // Corpse cleanup; AEnemySpawner's OnDestroyed respawn hook still fires.
}

void AStickmanEnemyCharacter::LaunchIntoAir(float KnockupVelocity)
{
	// Heavies resist: weight scales the launch down; a 1.0-weight enemy doesn't lift at all.
	const float EffectiveVelocity = KnockupVelocity * (1.f - JuggleWeight);
	if (EffectiveVelocity < 100.f)
	{
		return;
	}
	JuggleHitCount = 0;
	bAirRecovering = false;
	LaunchCharacter(FVector(0.f, 0.f, EffectiveVelocity), false, true);
}

bool AStickmanEnemyCharacter::RegisterJuggleHit()
{
	if (bAirRecovering)
	{
		return false; // Teched — recovery frames are hit-immune.
	}

	++JuggleHitCount;

	// Air tech: past the tech threshold the enemy may flip out and land safely.
	if (JuggleHitCount > AirTechAfterHits && FMath::FRand() < AirTechChance)
	{
		bAirRecovering = true;
		if (AirRecoveryMontage && GetMesh() && GetMesh()->GetAnimInstance())
		{
			GetMesh()->GetAnimInstance()->Montage_Play(AirRecoveryMontage);
		}
		GetCharacterMovement()->Velocity = FVector(0.f, 0.f, 300.f); // Small pop out of the combo.
		return false;
	}

	if (JuggleHitCount > MaxJuggleHits)
	{
		bAirRecovering = true; // Hard cap: recovery regardless of tech roll.
		return false;
	}

	// Each juggle hit re-floats the enemy slightly, keeping the combo airborne.
	GetCharacterMovement()->Velocity = FVector(GetVelocity().X * 0.5f, GetVelocity().Y * 0.5f, 250.f * (1.f - JuggleWeight));
	return true;
}

bool AStickmanEnemyCharacter::IsJuggled() const
{
	return JuggleHitCount > 0 && GetCharacterMovement()->IsFalling();
}

void AStickmanEnemyCharacter::Landed(const FHitResult& Hit)
{
	Super::Landed(Hit);
	JuggleHitCount = 0;
	bAirRecovering = false;
}

float AStickmanEnemyCharacter::GetElementDamageMultiplier(EStickmanElement Element) const
{
	const float* Multiplier = ElementDamageMultipliers.Find(Element);
	return Multiplier ? *Multiplier : 1.f;
}

float AStickmanEnemyCharacter::GetReactionDamageMultiplier(EStickmanReactionType Reaction) const
{
	const float* Multiplier = ReactionDamageMultipliers.Find(Reaction);
	return Multiplier ? *Multiplier : 1.f;
}

float AStickmanEnemyCharacter::GetAttackSpeedMultiplier() const
{
	if (Personality != EEnemyPersonality::Berserker)
	{
		return 1.f;
	}
	// Berserker: up to +60% attack speed as HP approaches zero.
	return 1.f + (1.f - GetHealthPercent()) * 0.6f;
}

float AStickmanEnemyCharacter::GetHealthPercent() const
{
	if (!AttributeSet || AttributeSet->GetMaxHealth() <= 0.f)
	{
		return 1.f;
	}
	return AttributeSet->GetHealth() / AttributeSet->GetMaxHealth();
}
