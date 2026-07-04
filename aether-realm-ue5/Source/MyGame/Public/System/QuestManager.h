#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "System/QuestTypes.h"
#include "QuestManager.generated.h"

class UOpenWorldGameInstance;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnQuestStarted, UQuestDataAsset*, Quest);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnQuestStepAdvanced, UQuestDataAsset*, Quest, int32, NewStepIndex);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnQuestCompleted, UQuestDataAsset*, Quest);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnObjectiveProgress, UQuestDataAsset*, Quest, const FQuestStep&, Step);

/**
 * Quest engine. State (active steps, completed, daily) di GameInstance → ikut save.
 *
 * Alur objective: gameplay memanggil ReportObjective(Type, TargetID) —
 * enemy death → KillEnemy, pickup → CollectItem, dialogue action → TalkToNPC,
 * interact → InteractObject, trigger volume → GoToLocation, domain clear →
 * CompleteDomain. Wait pakai timer internal.
 */
UCLASS()
class MYGAME_API UQuestManager : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	/** Register quest assets (panggil dari BP_GameMode BeginPlay dengan array semua quest). */
	UFUNCTION(BlueprintCallable, Category = "Quest")
	void RegisterQuests(const TArray<UQuestDataAsset*>& Quests);

	/** Mulai quest. Cek prerequisites + AR. */
	UFUNCTION(BlueprintCallable, Category = "Quest")
	bool StartQuest(FName QuestID);

	UFUNCTION(BlueprintPure, Category = "Quest")
	bool CanStartQuest(FName QuestID) const;

	UFUNCTION(BlueprintPure, Category = "Quest")
	bool IsQuestActive(FName QuestID) const;

	UFUNCTION(BlueprintPure, Category = "Quest")
	bool IsQuestCompleted(FName QuestID) const;

	/** Lapor progress objective dari gameplay. */
	UFUNCTION(BlueprintCallable, Category = "Quest")
	void ReportObjective(EObjectiveType Type, FName TargetID, int32 Count = 1);

	/** Quest aktif + step sekarang (Journal UI). */
	UFUNCTION(BlueprintCallable, Category = "Quest")
	TArray<UQuestDataAsset*> GetActiveQuests() const;

	UFUNCTION(BlueprintPure, Category = "Quest")
	FActiveQuestState GetQuestState(FName QuestID) const;

	/** Step aktif quest (marker map: Step.TargetLocation). */
	UFUNCTION(BlueprintPure, Category = "Quest")
	bool GetCurrentStep(FName QuestID, FQuestStep& OutStep) const;

	// ---------- Daily Commission ----------
	/** Roll 4 commission hari ini (idempotent — reset otomatis ganti hari). */
	UFUNCTION(BlueprintCallable, Category = "Quest|Daily")
	TArray<UQuestDataAsset*> GetTodayCommissions();

	UPROPERTY(BlueprintAssignable, Category = "Quest")
	FOnQuestStarted OnQuestStarted;

	UPROPERTY(BlueprintAssignable, Category = "Quest")
	FOnQuestStepAdvanced OnQuestStepAdvanced;

	UPROPERTY(BlueprintAssignable, Category = "Quest")
	FOnQuestCompleted OnQuestCompleted;

	UPROPERTY(BlueprintAssignable, Category = "Quest")
	FOnObjectiveProgress OnObjectiveProgress;

	static constexpr int32 DailyCommissionCount = 4;

protected:
	UPROPERTY()
	TMap<FName, TObjectPtr<UQuestDataAsset>> RegisteredQuests;

	void AdvanceStep(UQuestDataAsset* Quest, FActiveQuestState& State);
	void CompleteQuest(UQuestDataAsset* Quest);
	void GrantRewards(const FQuestRewards& Rewards);
	void TryAutoStartQuests();
	void StartWaitTimerIfNeeded(UQuestDataAsset* Quest);

	UOpenWorldGameInstance* GetOWGameInstance() const;
};
