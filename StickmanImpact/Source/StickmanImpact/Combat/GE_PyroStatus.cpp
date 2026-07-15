// Copyright StickmanImpact Project.

#include "GE_PyroStatus.h"

UGE_PyroStatus::UGE_PyroStatus()
{
	DurationMagnitude = FGameplayEffectModifierMagnitude(FScalableFloat(8.f));
	Period = FScalableFloat(1.f);
}
