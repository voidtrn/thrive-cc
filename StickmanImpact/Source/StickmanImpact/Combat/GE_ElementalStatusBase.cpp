// Copyright StickmanImpact Project.

#include "GE_ElementalStatusBase.h"
#include "Character/StickmanGameplayTags.h"
#include "StickmanAttributeSet.h"

UGE_ElementalStatusBase::UGE_ElementalStatusBase()
{
	DurationPolicy = EGameplayEffectDurationType::HasDuration;
	DurationMagnitude = FGameplayEffectModifierMagnitude(FScalableFloat(8.f));
	Period = FScalableFloat(1.f);
	bExecutePeriodicEffectOnApplication = true;

	FSetByCallerFloat DamageMagnitude;
	DamageMagnitude.DataTag = StickmanGameplayTags::SetByCaller_Damage;

	FGameplayModifierInfo DamageModifier;
	DamageModifier.Attribute = UStickmanAttributeSet::GetDamageAttribute();
	DamageModifier.ModifierOp = EGameplayModOp::Additive;
	// Positive magnitude: UStickmanAttributeSet::PostGameplayEffectExecute treats the meta
	// Damage attribute as "amount to subtract from Health" (see Damage meta attribute convention).
	DamageModifier.ModifierMagnitude = FGameplayEffectModifierMagnitude(DamageMagnitude);
	Modifiers.Add(DamageModifier);
}
