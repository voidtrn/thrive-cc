// Copyright StickmanImpact Project.

#include "GA_PyroSkill.h"

namespace
{
	constexpr float FlameSurgeCastTime = 0.6f;
}

UGA_PyroSkill::UGA_PyroSkill()
{
	SkillData.SkillType = EStickmanSkillType::ElementalSkill;
	SkillData.Element = EStickmanElement::Pyro;
	SkillData.SkillName = TEXT("Flame Surge");
	SkillData.Cooldown = 6.f;
	SkillData.EnergyCost = 0.f;
	DamageMultiplier = 1.8f; // 180% ATK
}

void UGA_PyroSkill::OnAbilityActivated()
{
	PlayCastAudioVisuals();
	PlayMontageThenEnd(MontageToPlay, FlameSurgeCastTime);

	AActor* Avatar = GetAvatarActorFromActorInfo();
	if (!Avatar)
	{
		return;
	}

	TArray<AActor*> HitActors;
	ApplyRadialElementalDamage(Avatar->GetActorLocation(), Avatar->GetActorForwardVector(), ConeRange,
		ConeHalfAngleDegrees, DamageMultiplier, PyroStatusEffectClass, HitActors);

	if (HitActors.Num() > 0)
	{
		PlayImpactCameraShake(HitCameraShakeClass);
	}
}
