// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Animation/AnimNotifies/AnimNotify.h"
#include "AnimNotify_AttackHitCheck.generated.h"

/** Place on the impact frame of each normal-attack montage segment — triggers the damage check. */
UCLASS()
class STICKMANIMPACT_API UAnimNotify_AttackHitCheck : public UAnimNotify
{
	GENERATED_BODY()

public:
	virtual void Notify(USkeletalMeshComponent* MeshComp, UAnimSequenceBase* Animation,
		const FAnimNotifyEventReference& EventReference) override;

#if WITH_EDITOR
	virtual FString GetNotifyName_Implementation() const override { return TEXT("AttackHitCheck"); }
#endif
};
