// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Engine/DataAsset.h"
#include "StickmanReactionTypes.h"
#include "StickmanReactionEffectsDataAsset.generated.h"

/** Designer-authored VFX/SFX/camera-shake table, one entry per EStickmanReactionType. */
UCLASS(BlueprintType)
class STICKMANIMPACT_API UStickmanReactionEffectsDataAsset : public UPrimaryDataAsset
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Reactions")
	TMap<EStickmanReactionType, FReactionEffectData> ReactionEffects;
};
