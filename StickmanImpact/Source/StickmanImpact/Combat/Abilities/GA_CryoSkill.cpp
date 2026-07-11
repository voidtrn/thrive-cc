// Copyright StickmanImpact Project.

#include "GA_CryoSkill.h"
#include "GameFramework/Character.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "TimerManager.h"

namespace
{
	constexpr float FrostWaveCastTime = 0.5f;
}

UGA_CryoSkill::UGA_CryoSkill()
{
	SkillData.SkillType = EStickmanSkillType::ElementalSkill;
	SkillData.Element = EStickmanElement::Cryo;
	SkillData.SkillName = TEXT("Frost Wave");
	SkillData.Cooldown = 8.f;
	SkillData.EnergyCost = 0.f;
	DamageMultiplier = 1.4f; // 140% ATK
}

void UGA_CryoSkill::OnAbilityActivated()
{
	PlayCastAudioVisuals();
	PlayMontageThenEnd(MontageToPlay, FrostWaveCastTime);

	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().SetTimer(DamageApplyTimerHandle, this, &UGA_CryoSkill::ApplyFrostWave,
			FrostWaveCastTime * 0.5f, false);
	}
}

void UGA_CryoSkill::ApplyFrostWave()
{
	AActor* Avatar = GetAvatarActorFromActorInfo();
	if (!Avatar)
	{
		return;
	}

	TArray<AActor*> HitActors;
	ApplyRadialElementalDamage(Avatar->GetActorLocation(), Avatar->GetActorForwardVector(), PathLength,
		PathHalfAngleDegrees, DamageMultiplier, CryoStatusEffectClass, HitActors);

	for (AActor* HitActor : HitActors)
	{
		ApplySlowToActor(HitActor);
	}
}

void UGA_CryoSkill::ApplySlowToActor(AActor* TargetActor) const
{
	ACharacter* TargetCharacter = Cast<ACharacter>(TargetActor);
	UCharacterMovementComponent* Movement = TargetCharacter ? TargetCharacter->GetCharacterMovement() : nullptr;
	if (!Movement)
	{
		return;
	}

	const float OriginalSpeed = Movement->MaxWalkSpeed;
	Movement->MaxWalkSpeed = OriginalSpeed * SlowSpeedFraction;

	TWeakObjectPtr<UCharacterMovementComponent> WeakMovement(Movement);
	FTimerHandle RestoreHandle;
	FTimerDelegate RestoreDelegate = FTimerDelegate::CreateLambda([WeakMovement, OriginalSpeed]()
	{
		if (WeakMovement.IsValid())
		{
			WeakMovement->MaxWalkSpeed = OriginalSpeed;
		}
	});
	TargetActor->GetWorldTimerManager().SetTimer(RestoreHandle, RestoreDelegate, SlowDuration, false);
}
