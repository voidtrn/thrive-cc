// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Engine/DataAsset.h"
#include "StickmanQuestTypes.h"
#include "QuestDataAsset.generated.h"

UCLASS(BlueprintType)
class STICKMANIMPACT_API UQuestDataAsset : public UPrimaryDataAsset
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Quest")
	FString QuestID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Quest")
	FText QuestName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Quest")
	FText QuestDescription;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Quest")
	EQuestType QuestType = EQuestType::Side;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Quest")
	int32 RecommendedLevel = 1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Quest")
	TArray<FQuestStage> Stages;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Quest")
	FGameplayTag QuestStartFlag;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Quest")
	FGameplayTag QuestCompleteFlag;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Quest")
	FRewardData QuestCompletionReward;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Quest")
	bool bTrackable = true;
};
