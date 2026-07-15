// Copyright StickmanImpact Project.

#include "GA_PyroSlash.h"
#include "TimerManager.h"
#include "GameFramework/Actor.h"

UGA_PyroSlash::UGA_PyroSlash()
{
	SkillData.SkillType = EStickmanSkillType::ElementalSkill;
	SkillData.Element = EStickmanElement::Pyro;
	SkillData.SkillName = TEXT("Pyro Slash");
	SkillData.Cooldown = 6.f;
	SkillData.EnergyCost = 0.f;
	DamageMultiplier = 1.5f; // 150% ATK
}

void UGA_PyroSlash::OnAbilityActivated()
{
	PlayCastAudioVisuals();
	PlayMontageThenEnd(MontageToPlay, SpinMontageDuration);

	// The slash lands partway through the spin, not on the very first frame.
	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().SetTimer(DamageApplyTimerHandle, this, &UGA_PyroSlash::ApplySlashDamage,
			SpinMontageDuration * 0.5f, false);
	}
}

void UGA_PyroSlash::ApplySlashDamage()
{
	AActor* Avatar = GetAvatarActorFromActorInfo();
	if (!Avatar)
	{
		return;
	}

	TArray<AActor*> HitActors;
	ApplyRadialElementalDamage(Avatar->GetActorLocation(), Avatar->GetActorForwardVector(), AoERadius,
		AoEArcDegrees * 0.5f, DamageMultiplier, PyroStatusEffectClass, HitActors);

	if (HitActors.Num() > 0)
	{
		PlayImpactCameraShake(HitCameraShakeClass);
	}
}
