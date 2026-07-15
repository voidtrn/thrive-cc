// Copyright StickmanImpact Project.

#include "AnimNotify_AttackHitCheck.h"
#include "Abilities/GA_NormalAttack.h"
#include "Components/SkeletalMeshComponent.h"

void UAnimNotify_AttackHitCheck::Notify(USkeletalMeshComponent* MeshComp, UAnimSequenceBase* Animation,
	const FAnimNotifyEventReference& EventReference)
{
	Super::Notify(MeshComp, Animation, EventReference);

	if (MeshComp)
	{
		if (UGA_NormalAttack* Ability = UGA_NormalAttack::GetActiveInstance(MeshComp->GetOwner()))
		{
			Ability->HandleAttackHitCheckNotify();
		}
	}
}
