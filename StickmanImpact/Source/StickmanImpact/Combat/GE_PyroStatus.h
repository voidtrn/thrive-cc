// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GE_ElementalStatusBase.h"
#include "GE_PyroStatus.generated.h"

/**
 * Burning: 8 second DoT, 1 tick/sec, 10% of the caster's Attack per tick (set by the
 * applying ability via SetByCaller — see UStickmanGameplayAbility::ApplyDamageToTarget).
 * Visual "burning" indicator is spawned by the applying ability alongside this effect
 * (see GA_PyroSlash / GA_PyroSkill) rather than via a GameplayCue, to keep this scaffold
 * self-contained without requiring a GameplayCue notify actor to be authored in-editor.
 */
UCLASS()
class STICKMANIMPACT_API UGE_PyroStatus : public UGE_ElementalStatusBase
{
	GENERATED_BODY()

public:
	UGE_PyroStatus();
};
