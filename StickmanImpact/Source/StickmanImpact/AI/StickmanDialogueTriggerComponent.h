// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "StickmanInteractable.h"
#include "StickmanDialogueTriggerComponent.generated.h"

class UDialogueSequence;

/** Drop on any actor (usually an AStickmanNPC) to make "interact" start a dialogue sequence. */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UStickmanDialogueTriggerComponent : public UActorComponent, public IStickmanInteractable
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	TObjectPtr<UDialogueSequence> DialogueToPlay;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	FText InteractionPrompt;

	virtual void Interact_Implementation(AActor* Instigator) override;
	virtual FText GetInteractionPrompt_Implementation() const override { return InteractionPrompt; }
};
