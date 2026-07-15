// Copyright StickmanImpact Project.

#include "GA_BowAimedShot.h"
#include "Abilities/Tasks/AbilityTask_WaitInputRelease.h"
#include "TimerManager.h"

UGA_BowAimedShot::UGA_BowAimedShot()
{
	SkillData.SkillType = EStickmanSkillType::NormalAttack;
	SkillData.SkillName = TEXT("Aimed Shot");
}

void UGA_BowAimedShot::OnAbilityActivated()
{
	bIsCharging = true;
	ChargeStartTime = GetWorld()->GetTimeSeconds();

	if (UAbilityTask_WaitInputRelease* WaitRelease = UAbilityTask_WaitInputRelease::WaitInputRelease(this))
	{
		WaitRelease->OnRelease.AddDynamic(this, &UGA_BowAimedShot::FireShot);
		WaitRelease->ReadyForActivation();
	}

	// Auto-fire at full charge if they just hold it down instead of tapping release.
	FTimerDelegate AutoFireDelegate = FTimerDelegate::CreateUObject(this, &UGA_BowAimedShot::FireShot, ChargeTime);
	GetWorld()->GetTimerManager().SetTimer(AutoFireTimerHandle, AutoFireDelegate, ChargeTime, false);
}

float UGA_BowAimedShot::GetChargePercent() const
{
	if (!bIsCharging || !GetWorld())
	{
		return 0.f;
	}
	return FMath::Clamp((GetWorld()->GetTimeSeconds() - ChargeStartTime) / ChargeTime, 0.f, 1.f);
}

void UGA_BowAimedShot::FireShot(float TimeHeld)
{
	if (!bIsCharging)
	{
		return; // Already fired (e.g. auto-fire beat the release event to it).
	}
	bIsCharging = false;

	AActor* Avatar = GetAvatarActorFromActorInfo();
	if (Avatar)
	{
		const float ChargePercent = GetChargePercent();
		const float DamageMult = FMath::Lerp(MinDamageMultiplier, DamageMultiplier, ChargePercent);

		TArray<AActor*> HitActors;
		ApplyRadialElementalDamage(Avatar->GetActorLocation() + Avatar->GetActorForwardVector() * (ShotRange * 0.5f),
			Avatar->GetActorForwardVector(), ShotRange * 0.5f, 5.f, DamageMult, nullptr, HitActors);
	}

	K2_EndAbility();
}

void UGA_BowAimedShot::OnAbilityEnded(bool bWasCancelled)
{
	bIsCharging = false;
	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().ClearTimer(AutoFireTimerHandle);
	}
}
