// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Engine/DataAsset.h"
#include "StickmanDialogueTypes.h"
#include "DialogueSequence.generated.h"

class ULevelSequence;

/** One conversation: an ordered list of lines, optionally followed by branching choices. */
UCLASS(BlueprintType)
class STICKMANIMPACT_API UDialogueSequence : public UPrimaryDataAsset
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	FString SequenceID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	TArray<FDialogueLine> Lines;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	bool bCanSkip = true;

	// Important story beats can't be skipped even if bCanSkip is true elsewhere in the project.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	bool bImportantStory = false;

	// Soft: a Level Sequence is a heavy asset, only load it if this dialogue actually plays.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	TSoftObjectPtr<ULevelSequence> CutsceneToPlay;

	// Up to 4 branches, offered after the last line. Empty = linear dialogue, just ends.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue", meta = (TitleProperty = "ChoiceText"))
	TArray<FDialogueChoice> Choices;
};
