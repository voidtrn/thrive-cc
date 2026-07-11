// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Animation/AnimNotifies/AnimNotify.h"
#include "AnimNotify_AttackEnd.generated.h"

/** Place on the last frame of the final normal-attack montage segment — resets the combo state. */
UCLASS()
class STICKMANIMPACT_API UAnimNotify_AttackEnd : public UAnimNotify
{
	GENERATED_BODY()

public:
	virtual void Notify(USkeletalMeshComponent* MeshComp, UAnimSequenceBase* Animation,
		const FAnimNotifyEventReference& EventReference) override;

#if WITH_EDITOR
	virtual FString GetNotifyName_Implementation() const override { return TEXT("AttackEnd"); }
#endif
};
