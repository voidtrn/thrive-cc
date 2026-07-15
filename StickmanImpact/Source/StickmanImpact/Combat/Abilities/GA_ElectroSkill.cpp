// Copyright StickmanImpact Project.

#include "GA_ElectroSkill.h"
#include "TimerManager.h"

namespace
{
	constexpr float LightningStrikeCastTime = 0.4f;
}

UGA_ElectroSkill::UGA_ElectroSkill()
{
	SkillData.SkillType = EStickmanSkillType::ElementalSkill;
	SkillData.Element = EStickmanElement::Electro;
	SkillData.SkillName = TEXT("Lightning Strike");
	SkillData.Cooldown = 5.f;
	SkillData.EnergyCost = 0.f;
	DamageMultiplier = 1.6f; // 160% ATK
}

void UGA_ElectroSkill::OnAbilityActivated()
{
	PlayCastAudioVisuals();
	PlayMontageThenEnd(MontageToPlay, LightningStrikeCastTime);

	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().SetTimer(StrikeTimerHandle, this, &UGA_ElectroSkill::TeleportAndStrike,
			LightningStrikeCastTime * 0.3f, false);
	}
}

void UGA_ElectroSkill::TeleportAndStrike()
{
	AActor* Avatar = GetAvatarActorFromActorInfo();
	if (!Avatar)
	{
		return;
	}

	const FVector TeleportTarget = Avatar->GetActorLocation() + Avatar->GetActorForwardVector() * TeleportDistance;
	Avatar->SetActorLocation(TeleportTarget, true);

	TArray<AActor*> HitActors;
	ApplyRadialElementalDamage(Avatar->GetActorLocation(), Avatar->GetActorForwardVector(), StrikeRadius, 180.f,
		DamageMultiplier, ElectroStatusEffectClass, HitActors);

	if (HitActors.Num() > 0)
	{
		PlayImpactCameraShake(HitCameraShakeClass);
	}
}
