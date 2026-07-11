// Copyright StickmanImpact Project.

#include "GA_AnemoSkill.h"
#include "GameFramework/Character.h"
#include "TimerManager.h"

UGA_AnemoSkill::UGA_AnemoSkill()
{
	SkillData.SkillType = EStickmanSkillType::ElementalSkill;
	SkillData.Element = EStickmanElement::Anemo;
	SkillData.SkillName = TEXT("Wind Blade");
	SkillData.Cooldown = 6.f;
	SkillData.EnergyCost = 0.f;
	DamageMultiplier = 1.3f; // 130% ATK
}

void UGA_AnemoSkill::OnAbilityActivated()
{
	PlayCastAudioVisuals();

	AActor* Avatar = GetAvatarActorFromActorInfo();
	if (!Avatar)
	{
		K2_EndAbility();
		return;
	}

	ProjectileOrigin = Avatar->GetActorLocation();
	ProjectileForward = Avatar->GetActorForwardVector();
	CurrentStep = 0;
	HitActorsThisCast.Reset();

	const float StepInterval = TravelDuration / FMath::Max(TravelSteps, 1);
	GetWorld()->GetTimerManager().SetTimer(ProjectileStepTimerHandle, this,
		&UGA_AnemoSkill::AdvanceProjectileStep, StepInterval, true);
}

void UGA_AnemoSkill::AdvanceProjectileStep()
{
	++CurrentStep;
	const float Alpha = static_cast<float>(CurrentStep) / FMath::Max(TravelSteps, 1);
	const FVector StepLocation = ProjectileOrigin + ProjectileForward * (ProjectileRange * Alpha);
	const FVector NextStepLocation = ProjectileOrigin + ProjectileForward * (ProjectileRange * FMath::Min(Alpha + 1.f / TravelSteps, 1.f));

	// Skip actors already damaged on an earlier step of this same cast — the projectile only
	// hits each target once as it passes through.
	TArray<AActor*> AlreadyHitActors;
	AlreadyHitActors.Reserve(HitActorsThisCast.Num());
	for (const TWeakObjectPtr<AActor>& WeakActor : HitActorsThisCast)
	{
		if (AActor* ResolvedActor = WeakActor.Get())
		{
			AlreadyHitActors.Add(ResolvedActor);
		}
	}

	TArray<AActor*> HitActors;
	ApplyRadialElementalDamage(StepLocation, ProjectileForward, ProjectileRadius, 180.f, DamageMultiplier,
		AnemoStatusEffectClass, HitActors, &AlreadyHitActors);

	for (AActor* HitActor : HitActors)
	{
		HitActorsThisCast.Add(HitActor);

		if (ACharacter* HitCharacter = Cast<ACharacter>(HitActor))
		{
			const FVector DragDir = (NextStepLocation - HitCharacter->GetActorLocation()).GetSafeNormal();
			HitCharacter->LaunchCharacter(DragDir * PullAlongSpeed, true, false);
		}
	}

	if (CurrentStep >= TravelSteps)
	{
		K2_EndAbility();
	}
}

void UGA_AnemoSkill::OnAbilityEnded(bool bWasCancelled)
{
	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().ClearTimer(ProjectileStepTimerHandle);
	}
}
