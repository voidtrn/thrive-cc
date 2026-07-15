// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameplayTagContainer.h"
#include "StickmanQuestTypes.generated.h"

class UDialogueSequence;
class ULevelSequence;
class UGameplayAbility;

UENUM(BlueprintType)
enum class EObjectiveType : uint8
{
	Kill,
	Collect,
	TalkTo,
	ReachLocation,
	InteractWith,
	TriggerCutscene,
	Wait
};

UENUM(BlueprintType)
enum class EQuestType : uint8
{
	Main,
	Side,
	Daily,
	Event,
	Character
};

/** One trackable objective within a quest stage. TargetActor/CurrentCount are runtime state — see UQuestManager's per-quest runtime copy. */
USTRUCT(BlueprintType)
struct FQuestObjective
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Objective")
	FText ObjectiveDescription;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Objective")
	EObjectiveType ObjectiveType = EObjectiveType::Kill;

	// Optional: bind to a specific actor at runtime (e.g. a unique quest-giver NPC).
	UPROPERTY(BlueprintReadWrite, Category = "Objective")
	TObjectPtr<AActor> TargetActor;

	// For Collect/Kill objectives with a quantity (e.g. an item ID or an enemy archetype tag name).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Objective")
	FName TargetIdentifier;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Objective")
	int32 RequiredCount = 1;

	UPROPERTY(BlueprintReadWrite, Category = "Objective")
	int32 CurrentCount = 0;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Objective")
	FVector TargetLocation = FVector::ZeroVector;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Objective")
	bool bOptional = false;

	bool IsComplete() const { return CurrentCount >= RequiredCount; }
};

/** EXP/currency/items/abilities/story-unlock granted on stage or quest completion. */
USTRUCT(BlueprintType)
struct FRewardData
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Reward")
	int32 EXP = 0;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Reward")
	int32 Currency = 0;

	// ItemID -> quantity. No inventory subsystem exists yet, so UQuestManager currently just
	// logs these — wire up to a real inventory system before shipping.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Reward")
	TMap<FName, int32> ItemRewards;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Reward")
	TArray<TSoftClassPtr<UGameplayAbility>> NewAbilities;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Reward")
	FGameplayTag StoryUnlockFlag;
};

/** One leg of a quest: its objectives, optional bookend dialogue/cutscene, and its own reward. */
USTRUCT(BlueprintType)
struct FQuestStage
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Quest")
	FText StageName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Quest")
	TArray<FQuestObjective> Objectives;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Quest")
	FText StageCompletionDialogue;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Quest")
	TObjectPtr<UDialogueSequence> StageStartDialogue;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Quest")
	TSoftObjectPtr<ULevelSequence> StageCutscene;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Quest")
	FRewardData StageReward;

	bool IsComplete() const
	{
		for (const FQuestObjective& Objective : Objectives)
		{
			if (!Objective.bOptional && !Objective.IsComplete())
			{
				return false;
			}
		}
		return true;
	}
};
