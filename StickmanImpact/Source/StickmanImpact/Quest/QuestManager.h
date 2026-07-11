// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "StickmanQuestTypes.h"
#include "QuestManager.generated.h"

class UQuestDataAsset;

/** Runtime progress for one accepted quest — a mutable copy of its DataAsset's stages, so progress never touches the shared asset. */
USTRUCT()
struct FActiveQuestRuntime
{
	GENERATED_BODY()

	UPROPERTY()
	TObjectPtr<UQuestDataAsset> QuestAsset;

	UPROPERTY()
	TArray<FQuestStage> RuntimeStages;

	int32 CurrentStageIndex = 0;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnQuestAccepted, UQuestDataAsset*, Quest);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnQuestAbandoned, UQuestDataAsset*, Quest);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnQuestCompleted, UQuestDataAsset*, Quest);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnQuestUpdated, UQuestDataAsset*, Quest, int32, StageIndex);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams(FOnObjectiveUpdated, UQuestDataAsset*, Quest, int32, StageIndex, int32, ObjectiveIndex);

/**
 * Owns every accepted/completed quest's runtime progress. Gameplay code reports progress
 * through the generic ReportProgress() (kills, collection, reaching a location, talking to an
 * NPC, interacting, cutscenes watched) rather than each objective type needing its own
 * plumbing back to whatever system produced the event.
 */
UCLASS()
class STICKMANIMPACT_API UQuestManager : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Quest")
	bool AcceptQuest(UQuestDataAsset* Quest);

	UFUNCTION(BlueprintCallable, Category = "Quest")
	void AbandonQuest(const FString& QuestID);

	// Report gameplay progress against every active quest's current-stage objectives that
	// match ObjectiveType (and, where relevant, TargetIdentifier/TargetActor/TargetLocation).
	UFUNCTION(BlueprintCallable, Category = "Quest")
	void ReportProgress(EObjectiveType ObjectiveType, FName TargetIdentifier, AActor* RelevantActor,
		FVector Location, int32 Count = 1);

	UFUNCTION(BlueprintPure, Category = "Quest")
	bool IsQuestActive(const FString& QuestID) const { return ActiveQuests.Contains(QuestID); }

	UFUNCTION(BlueprintPure, Category = "Quest")
	bool IsQuestCompleted(const FString& QuestID) const { return CompletedQuestIDs.Contains(QuestID); }

	UFUNCTION(BlueprintPure, Category = "Quest")
	TArray<UQuestDataAsset*> GetActiveQuests() const;

	UFUNCTION(BlueprintPure, Category = "Quest")
	FQuestStage GetCurrentStage(const FString& QuestID) const;

	UFUNCTION(BlueprintCallable, Category = "Quest")
	void SetTrackedQuest(const FString& QuestID) { TrackedQuestID = QuestID; }

	UFUNCTION(BlueprintPure, Category = "Quest")
	FString GetTrackedQuestID() const { return TrackedQuestID; }

	UPROPERTY(BlueprintAssignable, Category = "Quest")
	FOnQuestAccepted OnQuestAccepted;
	UPROPERTY(BlueprintAssignable, Category = "Quest")
	FOnQuestAbandoned OnQuestAbandoned;
	UPROPERTY(BlueprintAssignable, Category = "Quest")
	FOnQuestCompleted OnQuestCompleted;
	UPROPERTY(BlueprintAssignable, Category = "Quest")
	FOnQuestUpdated OnQuestUpdated;
	UPROPERTY(BlueprintAssignable, Category = "Quest")
	FOnObjectiveUpdated OnObjectiveUpdated;

private:
	void AdvanceStageIfComplete(FActiveQuestRuntime& Runtime);
	void CompleteQuest(FActiveQuestRuntime& Runtime);
	void GrantReward(const FRewardData& Reward) const;

	UPROPERTY()
	TMap<FString, FActiveQuestRuntime> ActiveQuests;

	TSet<FString> CompletedQuestIDs;

	FString TrackedQuestID;
};
