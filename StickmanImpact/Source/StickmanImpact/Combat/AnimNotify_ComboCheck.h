// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Animation/AnimNotifies/AnimNotify.h"
#include "AnimNotify_ComboCheck.generated.h"

/**
 * Place near the end of each normal-attack montage segment, inside the combo window.
 * Checks whether the player buffered another attack input; if so, chains to the next hit.
 */
UCLASS()
class STICKMANIMPACT_API UAnimNotify_ComboCheck : public UAnimNotify
{
	GENERATED_BODY()

public:
	virtual void Notify(USkeletalMeshComponent* MeshComp, UAnimSequenceBase* Animation,
		const FAnimNotifyEventReference& EventReference) override;

#if WITH_EDITOR
	virtual FString GetNotifyName_Implementation() const override { return TEXT("ComboCheck"); }
#endif
};
