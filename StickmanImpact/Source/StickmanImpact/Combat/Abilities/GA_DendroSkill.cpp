// Copyright StickmanImpact Project.

#include "GA_DendroSkill.h"
#include "TimerManager.h"

UGA_DendroSkill::UGA_DendroSkill()
{
	SkillData.SkillType = EStickmanSkillType::ElementalSkill;
	SkillData.Element = EStickmanElement::Dendro;
	SkillData.SkillName = TEXT("Thorn Field");
	SkillData.Cooldown = 8.f;
	SkillData.EnergyCost = 0.f;
	DamageMultiplier = 0.9f; // 90% ATK per tick
}

void UGA_DendroSkill::OnAbilityActivated()
{
	PlayCastAudioVisuals();

	AActor* Avatar = GetAvatarActorFromActorInfo();
	if (!Avatar)
	{
		K2_EndAbility();
		return;
	}

	FieldOrigin = Avatar->GetActorLocation();
	ElapsedFieldTime = 0.f;

	// First tick lands immediately, then once every TickInterval seconds until FieldDuration.
	TickField();
	GetWorld()->GetTimerManager().SetTimer(FieldTickTimerHandle, this, &UGA_DendroSkill::TickField,
		TickInterval, true);
}

void UGA_DendroSkill::TickField()
{
	TArray<AActor*> HitActors;
	ApplyRadialElementalDamage(FieldOrigin, FVector::ForwardVector, FieldRadius, 180.f, DamageMultiplier,
		DendroStatusEffectClass, HitActors);

	ElapsedFieldTime += TickInterval;
	if (ElapsedFieldTime >= FieldDuration)
	{
		K2_EndAbility();
	}
}

void UGA_DendroSkill::OnAbilityEnded(bool bWasCancelled)
{
	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().ClearTimer(FieldTickTimerHandle);
	}
}
