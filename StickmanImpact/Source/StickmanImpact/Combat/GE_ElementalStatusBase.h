// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameplayEffect.h"
#include "GE_ElementalStatusBase.generated.h"

/**
 * Shared shape for elemental damage-over-time statuses (Pyro burning, Dendro rot, ...):
 * periodic tick applying a SetByCaller amount to the meta Damage attribute, for a fixed
 * duration. The applying ability sets the per-tick magnitude via
 * StickmanGameplayTags::SetByCaller_Damage right before calling ApplyGameplayEffectSpecToTarget.
 */
UCLASS(Abstract)
class STICKMANIMPACT_API UGE_ElementalStatusBase : public UGameplayEffect
{
	GENERATED_BODY()

public:
	UGE_ElementalStatusBase();
};
