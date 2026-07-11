// Copyright StickmanImpact Project.

#include "GA_HydroSkill.h"
#include "GameFramework/Character.h"
#include "TimerManager.h"

namespace
{
	constexpr float AquaVortexCastTime = 0.5f;
}

UGA_HydroSkill::UGA_HydroSkill()
{
	SkillData.SkillType = EStickmanSkillType::ElementalSkill;
	SkillData.Element = EStickmanElement::Hydro;
	SkillData.SkillName = TEXT("Aqua Vortex");
	SkillData.Cooldown = 7.f;
	SkillData.EnergyCost = 0.f;
	DamageMultiplier = 1.2f; // 120% ATK
}

void UGA_HydroSkill::OnAbilityActivated()
{
	PlayCastAudioVisuals();
	PlayMontageThenEnd(MontageToPlay, AquaVortexCastTime);

	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().SetTimer(DamageApplyTimerHandle, this, &UGA_HydroSkill::ApplyVortex,
			AquaVortexCastTime * 0.5f, false);
	}
}

void UGA_HydroSkill::ApplyVortex()
{
	AActor* Avatar = GetAvatarActorFromActorInfo();
	if (!Avatar)
	{
		return;
	}

	const FVector VortexCenter = Avatar->GetActorLocation();

	TArray<AActor*> HitActors;
	// HalfAngle = 180: a vortex pulls from every direction, not just in front.
	ApplyRadialElementalDamage(VortexCenter, Avatar->GetActorForwardVector(), VortexRadius, 180.f,
		DamageMultiplier, HydroStatusEffectClass, HitActors);

	for (AActor* HitActor : HitActors)
	{
		if (ACharacter* HitCharacter = Cast<ACharacter>(HitActor))
		{
			const FVector PullDir = (VortexCenter - HitCharacter->GetActorLocation()).GetSafeNormal();
			HitCharacter->LaunchCharacter(PullDir * PullSpeed, true, false);
		}
	}
}
