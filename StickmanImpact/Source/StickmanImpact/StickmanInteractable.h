// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "UObject/Interface.h"
#include "StickmanInteractable.generated.h"

UINTERFACE(BlueprintType)
class STICKMANIMPACT_API UStickmanInteractable : public UInterface
{
	GENERATED_BODY()
};

/**
 * Implemented by anything the player can "F to interact" with — NPCs (via
 * UStickmanDialogueTriggerComponent), chests, resource nodes, puzzle elements, waypoints.
 * Can be implemented directly on an Actor or on one of its Components (the interact trace
 * checks both — see AStickmanCharacter::OnInteract).
 */
class STICKMANIMPACT_API IStickmanInteractable
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintNativeEvent, Category = "Interaction")
	void Interact(AActor* Instigator);

	UFUNCTION(BlueprintNativeEvent, Category = "Interaction")
	FText GetInteractionPrompt() const;
};
