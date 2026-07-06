#include "System/QuestManager.h"
#include "System/OpenWorldGameInstance.h"
#include "TimerManager.h"
#include "MyGame.h"

UOpenWorldGameInstance* UQuestManager::GetOWGameInstance() const
{
	return Cast<UOpenWorldGameInstance>(GetGameInstance());
}

void UQuestManager::RegisterQuests(const TArray<UQuestDataAsset*>& Quests)
{
	for (UQuestDataAsset* Quest : Quests)
	{
		if (Quest && !Quest->QuestID.IsNone())
		{
			RegisteredQuests.Add(Quest->QuestID, Quest);
		}
	}
	TryAutoStartQuests();

	// Resume timer Wait untuk quest aktif hasil load save
	if (const UOpenWorldGameInstance* GI = GetOWGameInstance())
	{
		for (const auto& Pair : GI->ActiveQuestStates)
		{
			if (TObjectPtr<UQuestDataAsset>* Quest = RegisteredQuests.Find(Pair.Key))
			{
				StartWaitTimerIfNeeded(*Quest);
			}
		}
	}
}

bool UQuestManager::CanStartQuest(FName QuestID) const
{
	const UOpenWorldGameInstance* GI = GetOWGameInstance();
	const TObjectPtr<UQuestDataAsset>* QuestPtr = RegisteredQuests.Find(QuestID);
	if (!GI || !QuestPtr || IsQuestActive(QuestID) || IsQuestCompleted(QuestID))
	{
		return false;
	}

	const UQuestDataAsset* Quest = *QuestPtr;
	if (GI->AdventureRank < Quest->ARRequirement)
	{
		return false;
	}
	for (const FName& Prereq : Quest->Prerequisites)
	{
		if (!GI->CompletedQuests.Contains(Prereq))
		{
			return false;
		}
	}
	return true;
}

bool UQuestManager::IsQuestActive(FName QuestID) const
{
	const UOpenWorldGameInstance* GI = GetOWGameInstance();
	return GI && GI->ActiveQuestStates.Contains(QuestID);
}

bool UQuestManager::IsQuestCompleted(FName QuestID) const
{
	const UOpenWorldGameInstance* GI = GetOWGameInstance();
	return GI && GI->CompletedQuests.Contains(QuestID);
}

bool UQuestManager::StartQuest(FName QuestID)
{
	if (!CanStartQuest(QuestID))
	{
		return false;
	}

	UOpenWorldGameInstance* GI = GetOWGameInstance();
	GI->ActiveQuestStates.Add(QuestID, FActiveQuestState());

	UQuestDataAsset* Quest = RegisteredQuests[QuestID];
	OnQuestStarted.Broadcast(Quest);
	StartWaitTimerIfNeeded(Quest);

	UE_LOG(LogAetherRealm, Log, TEXT("Quest started: %s"), *QuestID.ToString());
	return true;
}

void UQuestManager::ReportObjective(EObjectiveType Type, FName TargetID, int32 Count)
{
	UOpenWorldGameInstance* GI = GetOWGameInstance();
	if (!GI)
	{
		return;
	}

	// Iterate copy of keys — AdvanceStep bisa mengubah map
	TArray<FName> ActiveIds;
	GI->ActiveQuestStates.GetKeys(ActiveIds);

	for (const FName& QuestID : ActiveIds)
	{
		TObjectPtr<UQuestDataAsset>* QuestPtr = RegisteredQuests.Find(QuestID);
		FActiveQuestState* State = GI->ActiveQuestStates.Find(QuestID);
		if (!QuestPtr || !State || !(*QuestPtr)->QuestSteps.IsValidIndex(State->CurrentStepIndex))
		{
			continue;
		}

		UQuestDataAsset* Quest = *QuestPtr;
		const FQuestStep& Step = Quest->QuestSteps[State->CurrentStepIndex];

		if (Step.ObjectiveType != Type)
		{
			continue;
		}
		if (!Step.TargetID.IsNone() && Step.TargetID != TargetID)
		{
			continue;
		}

		State->CurrentCount += Count;
		OnObjectiveProgress.Broadcast(Quest, Step);

		if (State->CurrentCount >= Step.RequiredCount)
		{
			AdvanceStep(Quest, *State);
		}
	}
}

void UQuestManager::AdvanceStep(UQuestDataAsset* Quest, FActiveQuestState& State)
{
	State.CurrentStepIndex++;
	State.CurrentCount = 0;

	if (State.CurrentStepIndex >= Quest->QuestSteps.Num())
	{
		CompleteQuest(Quest);
		return;
	}

	OnQuestStepAdvanced.Broadcast(Quest, State.CurrentStepIndex);
	StartWaitTimerIfNeeded(Quest);
}

void UQuestManager::StartWaitTimerIfNeeded(UQuestDataAsset* Quest)
{
	const UOpenWorldGameInstance* GI = GetOWGameInstance();
	const FActiveQuestState* State = GI ? GI->ActiveQuestStates.Find(Quest->QuestID) : nullptr;
	if (!State || !Quest->QuestSteps.IsValidIndex(State->CurrentStepIndex))
	{
		return;
	}

	const FQuestStep& Step = Quest->QuestSteps[State->CurrentStepIndex];
	if (Step.ObjectiveType != EObjectiveType::Wait)
	{
		return;
	}

	FTimerHandle Handle;
	GetGameInstance()->GetTimerManager().SetTimer(Handle,
		[this, QuestID = Quest->QuestID, StepID = Step.StepID]()
		{
			ReportObjective(EObjectiveType::Wait, StepID, 1);
		}, Step.WaitSeconds, false);
}

void UQuestManager::CompleteQuest(UQuestDataAsset* Quest)
{
	UOpenWorldGameInstance* GI = GetOWGameInstance();
	GI->ActiveQuestStates.Remove(Quest->QuestID);
	GI->CompletedQuests.Add(Quest->QuestID);

	GrantRewards(Quest->Rewards);
	OnQuestCompleted.Broadcast(Quest);

	// Auto-save tiap selesai quest (spec 4D)
	GI->AutoSave();

	// Quest baru mungkin terbuka
	TryAutoStartQuests();

	UE_LOG(LogAetherRealm, Log, TEXT("Quest completed: %s"), *Quest->QuestID.ToString());
}

void UQuestManager::GrantRewards(const FQuestRewards& Rewards)
{
	UOpenWorldGameInstance* GI = GetOWGameInstance();
	GI->Primogems += Rewards.Primogems;
	GI->Mora += Rewards.Mora;

	for (const auto& Item : Rewards.Items)
	{
		GI->InventoryItems.FindOrAdd(Item.Key) += Item.Value;
	}

	// AR exp + level up (threshold sederhana: 1000 * rank berikutnya)
	GI->ARExperience += Rewards.ARExp;
	while (GI->ARExperience >= GI->AdventureRank * 1000)
	{
		GI->ARExperience -= GI->AdventureRank * 1000;
		GI->AdventureRank++;
		UE_LOG(LogAetherRealm, Log, TEXT("Adventure Rank up: %d"), GI->AdventureRank);
	}
}

void UQuestManager::TryAutoStartQuests()
{
	for (const auto& Pair : RegisteredQuests)
	{
		if (Pair.Value->bAutoStart && CanStartQuest(Pair.Key))
		{
			StartQuest(Pair.Key);
		}
	}
}

TArray<UQuestDataAsset*> UQuestManager::GetActiveQuests() const
{
	TArray<UQuestDataAsset*> Result;
	if (const UOpenWorldGameInstance* GI = GetOWGameInstance())
	{
		for (const auto& Pair : GI->ActiveQuestStates)
		{
			if (const TObjectPtr<UQuestDataAsset>* Quest = RegisteredQuests.Find(Pair.Key))
			{
				Result.Add(*Quest);
			}
		}
	}
	return Result;
}

FActiveQuestState UQuestManager::GetQuestState(FName QuestID) const
{
	if (const UOpenWorldGameInstance* GI = GetOWGameInstance())
	{
		if (const FActiveQuestState* State = GI->ActiveQuestStates.Find(QuestID))
		{
			return *State;
		}
	}
	return FActiveQuestState();
}

bool UQuestManager::GetCurrentStep(FName QuestID, FQuestStep& OutStep) const
{
	const TObjectPtr<UQuestDataAsset>* QuestPtr = RegisteredQuests.Find(QuestID);
	if (!QuestPtr)
	{
		return false;
	}

	const FActiveQuestState State = GetQuestState(QuestID);
	if (!(*QuestPtr)->QuestSteps.IsValidIndex(State.CurrentStepIndex) || !IsQuestActive(QuestID))
	{
		return false;
	}

	OutStep = (*QuestPtr)->QuestSteps[State.CurrentStepIndex];
	return true;
}

TArray<UQuestDataAsset*> UQuestManager::GetTodayCommissions()
{
	TArray<UQuestDataAsset*> Result;
	UOpenWorldGameInstance* GI = GetOWGameInstance();
	if (!GI)
	{
		return Result;
	}

	const FString Today = FDateTime::UtcNow().ToString(TEXT("%Y-%m-%d"));

	// Ganti hari → roll ulang 4 commission dari pool
	if (GI->DailyCommissionDate != Today)
	{
		GI->DailyCommissionDate = Today;
		GI->DailyCommissionQuests.Reset();

		TArray<FName> Pool;
		for (const auto& Pair : RegisteredQuests)
		{
			if (Pair.Value->QuestType == EQuestType::DailyCommission)
			{
				Pool.Add(Pair.Key);
			}
		}

		for (int32 i = 0; i < DailyCommissionCount && Pool.Num() > 0; ++i)
		{
			const int32 Index = FMath::RandRange(0, Pool.Num() - 1);
			GI->DailyCommissionQuests.Add(Pool[Index]);
			Pool.RemoveAt(Index);

			// Commission kemarin yang belum selesai di-drop, yang baru bisa dimulai
			GI->CompletedQuests.Remove(GI->DailyCommissionQuests.Last()); // reset repeatable
		}
	}

	for (const FName& QuestID : GI->DailyCommissionQuests)
	{
		if (TObjectPtr<UQuestDataAsset>* Quest = RegisteredQuests.Find(QuestID))
		{
			Result.Add(*Quest);
		}
	}
	return Result;
}
