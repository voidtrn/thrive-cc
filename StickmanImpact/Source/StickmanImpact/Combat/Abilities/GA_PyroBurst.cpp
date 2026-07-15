// Copyright StickmanImpact Project.

#include "GA_PyroBurst.h"
#include "GameFramework/Character.h"
#include "TimerManager.h"

UGA_PyroBurst::UGA_PyroBurst()
{
	SkillData.Element = EStickmanElement::Pyro;
	SkillData.SkillName = TEXT("Phoenix Dive");
	BurstRadius = 700.f;
}

void UGA_PyroBurst::OnAbilityActivated()
{
	// Deliberately does not call Super::OnAbilityActivated(): the base burst damages
	// immediately on cast, but Phoenix Dive's damage lands on impact, after the dive.
	PlayCastAudioVisuals();
	PlayFullScreenBurstEffect();
	PlayMontageThenEnd(MontageToPlay, CastDuration);

	if (ACharacter* AvatarCharacter = Cast<ACharacter>(GetAvatarActorFromActorInfo()))
	{
		AvatarCharacter->LaunchCharacter(FVector(0.f, 0.f, LaunchUpwardVelocity), false, true);
	}

	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().SetTimer(SlamTimerHandle, this, &UGA_PyroBurst::SlamDown, DiveImpactDelay, false);
	}
}

void UGA_PyroBurst::SlamDown()
{
	AActor* Avatar = GetAvatarActorFromActorInfo();
	if (!Avatar)
	{
		return;
	}

	TArray<AActor*> HitActors;
	ApplyRadialElementalDamage(Avatar->GetActorLocation(), Avatar->GetActorForwardVector(),
		BurstRadius * ExplosionRadiusMultiplier, 180.f, DamageMultiplier, BurstStatusEffectClass, HitActors);

	if (HitActors.Num() > 0)
	{
		PlayImpactCameraShake(BurstCameraShakeClass);
	}
}
