// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "StickmanInteractable.h"
#include "ClueActor.generated.h"

class UStaticMeshComponent;
class UQuestDataAsset;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnClueRead, const FText&, ClueTitle, const FText&, ClueText);

/**
 * A collectible clue (footprint cast, torn note, elemental residue sample). "F to
 * investigate" — shows its lore text (OnClueRead for the UI), records itself with
 * UDiscoveryManager, and when all ClueSetSize clues of its ClueSetID are collected, the
 * hidden quest unlocks. Designed "a-ha" moment = the quest popping the instant the last
 * clue clicks into place.
 *
 * Detective mode highlights clue actors via custom depth (see UDetectiveModeComponent);
 * bDetectiveModeOnly starts the clue invisible so only a pulse reveals it.
 */
UCLASS()
class STICKMANIMPACT_API AClueActor : public AActor, public IStickmanInteractable
{
	GENERATED_BODY()

public:
	AClueActor();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Clue")
	FString ClueID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Clue")
	FName ClueSetID = NAME_None;

	// How many clues this set needs before its quest unlocks. Keep consistent across the set.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Clue")
	int32 ClueSetSize = 3;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Clue")
	FText ClueTitle;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Clue", meta = (MultiLine = "true"))
	FText ClueText;

	// Accepted via UQuestManager when the set completes. Same asset on every clue in the set.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Clue")
	TObjectPtr<UQuestDataAsset> UnlockedQuest;

	// Invisible until a detective-mode pulse reveals it.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Clue")
	bool bDetectiveModeOnly = false;

	UPROPERTY(BlueprintAssignable, Category = "Clue")
	FOnClueRead OnClueRead;

	// Called by UDetectiveModeComponent when a pulse reaches this clue.
	void RevealByDetectiveMode();

	virtual void Interact_Implementation(AActor* Instigator) override;
	virtual FText GetInteractionPrompt_Implementation() const override;

protected:
	virtual void BeginPlay() override;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Clue", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UStaticMeshComponent> ClueMesh;
};
