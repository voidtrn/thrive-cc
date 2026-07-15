// Copyright StickmanImpact Project.

#include "AnimNotify_Footstep.h"
#include "StickmanFootstepComponent.h"
#include "Components/SkeletalMeshComponent.h"

void UAnimNotify_Footstep::Notify(USkeletalMeshComponent* MeshComp, UAnimSequenceBase* Animation,
	const FAnimNotifyEventReference& EventReference)
{
	Super::Notify(MeshComp, Animation, EventReference);

	const AActor* Owner = MeshComp ? MeshComp->GetOwner() : nullptr;
	if (UStickmanFootstepComponent* Footsteps = Owner ? Owner->FindComponentByClass<UStickmanFootstepComponent>() : nullptr)
	{
		Footsteps->PlayFootstep();
	}
}
