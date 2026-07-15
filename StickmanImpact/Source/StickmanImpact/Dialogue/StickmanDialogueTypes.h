// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameplayTagContainer.h"
#include "StickmanDialogueTypes.generated.h"

class UTexture2D;
class USoundBase;
class UDialogueSequence;

UENUM(BlueprintType)
enum class EDialogueCameraAngle : uint8
{
	Default,
	CloseUpSpeaker,
	CloseUpListener,
	WideShot,
	OverShoulder
};

/** One line of dialogue. RequiredFlags gate whether it shows at all; SetFlagsAfter fire once it's been shown. */
USTRUCT(BlueprintType)
struct FDialogueLine
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	FText SpeakerName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	FText DialogueText;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	TObjectPtr<UTexture2D> SpeakerPortrait;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	TObjectPtr<USoundBase> VoiceLine;

	// 0 = auto-calculate from DialogueText length (see UDialogueManager::CalculateDisplayTime).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	float DisplayTime = 0.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	TArray<FGameplayTag> RequiredFlags;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	TArray<FGameplayTag> SetFlagsAfter;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	EDialogueCameraAngle CameraAngle = EDialogueCameraAngle::Default;
};

/** A branching option shown after a sequence's last line. */
USTRUCT(BlueprintType)
struct FDialogueChoice
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	FText ChoiceText;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	TObjectPtr<UDialogueSequence> NextSequence;

	// Only offered if this tag is already set (empty tag = always available).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	FGameplayTag RequiredFlag;
};
