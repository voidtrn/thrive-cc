// Copyright StickmanImpact Project.

#include "StickmanEnemyCharacter.h"
#include "Combat/StickmanAbilitySystemComponent.h"
#include "Combat/StickmanAttributeSet.h"
#include "Audio/StickmanAudioManager.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Components/CapsuleComponent.h"
#include "NiagaraFunctionLibrary.h"
#include "TimerManager.h"

AStickmanEnemyCharacter::AStickmanEnemyCharacter()
{
	AbilitySystemComponent = CreateDefaultSubobject<UStickmanAbilitySystemComponent>(TEXT("AbilitySystemComponent"));
	AbilitySystemComponent->SetIsReplicated(true);
	AbilitySystemComponent->SetReplicationMode(EGameplayEffectReplicationMode::Minimal);

	AttributeSet = CreateDefaultSubobject<UStickmanAttributeSet>(TEXT("AttributeSet"));
}

void AStickmanEnemyCharacter::BeginPlay()
{
	Super::BeginPlay();

	PatrolOrigin = GetActorLocation();

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

float AStickmanEnemyCharacter::GetHealthPercent() const
{
	if (!AttributeSet || AttributeSet->GetMaxHealth() <= 0.f)
	{
		return 1.f;
	}
	return AttributeSet->GetHealth() / AttributeSet->GetMaxHealth();
}
