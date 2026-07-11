// Copyright StickmanImpact Project.

#include "GA_ElementalBurst_Base.h"
#include "Kismet/GameplayStatics.h"
#include "TimerManager.h"

UGA_ElementalBurst_Base::UGA_ElementalBurst_Base()
{
	SkillData.SkillType = EStickmanSkillType::ElementalBurst;
	SkillData.Cooldown = 20.f;
	SkillData.EnergyCost = 60.f;
	DamageMultiplier = 3.f; // 300% ATK
}

void UGA_ElementalBurst_Base::OnAbilityActivated()
{
	PlayCastAudioVisuals();
	PlayFullScreenBurstEffect();
	PlayMontageThenEnd(MontageToPlay, CastDuration);
	ApplyBurstDamage();
}

void UGA_ElementalBurst_Base::PlayFullScreenBurstEffect() const
{
	UWorld* World = GetWorld();
	if (!World)
	{
		return;
	}

	UGameplayStatics::SetGlobalTimeDilation(World, SlowMoTimeDilation);

	FTimerHandle RestoreDilationHandle;
	FTimerDelegate RestoreDelegate = FTimerDelegate::CreateWeakLambda(World, [World]()
	{
		UGameplayStatics::SetGlobalTimeDilation(World, 1.f);
	});
	// Real-world seconds: scale the wait by the dilation itself so the hitstop always feels
	// like SlowMoDuration regardless of how extreme SlowMoTimeDilation is.
	World->GetTimerManager().SetTimer(RestoreDilationHandle, RestoreDelegate,
		SlowMoDuration * SlowMoTimeDilation, false);

	PlayImpactCameraShake(BurstCameraShakeClass);
}

void UGA_ElementalBurst_Base::ApplyBurstDamage() const
{
	AActor* Avatar = GetAvatarActorFromActorInfo();
	if (!Avatar)
	{
		return;
	}

	TArray<AActor*> HitActors;
	ApplyRadialElementalDamage(Avatar->GetActorLocation(), Avatar->GetActorForwardVector(), BurstRadius, 180.f,
		DamageMultiplier, BurstStatusEffectClass, HitActors);
}
