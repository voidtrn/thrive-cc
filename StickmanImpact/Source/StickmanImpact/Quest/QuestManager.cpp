// Copyright StickmanImpact Project.

#include "QuestManager.h"
#include "QuestDataAsset.h"
#include "Dialogue/DialogueManager.h"
#include "AbilitySystemBlueprintLibrary.h"
#include "AbilitySystemComponent.h"
#include "Kismet/GameplayStatics.h"

bool UQuestManager::AcceptQuest(UQuestDataAsset* Quest)
{
	if (!Quest || Quest->QuestID.IsEmpty() || ActiveQuests.Contains(Quest->QuestID) || Quest->Stages.Num() == 0)
	{
		return false;
	}

	FActiveQuestRuntime Runtime;
	Runtime.QuestAsset = Quest;
	Runtime.RuntimeStages = Quest->Stages; // Deep-ish copy of the USTRUCT array — progress never touches the asset.
	Runtime.CurrentStageIndex = 0;
	ActiveQuests.Add(Quest->QuestID, Runtime);

	if (Quest->QuestStartFlag.IsValid())
	{
		if (UDialogueManager* DialogueManager = GetGameInstance()->GetSubsystem<UDialogueManager>())
		{
			DialogueManager->SetStoryFlag(Quest->QuestStartFlag);
		}
	}

	if (TrackedQuestID.IsEmpty() && Quest->bTrackable)
	{
		TrackedQuestID = Quest->QuestID;
	}

	OnQuestAccepted.Broadcast(Quest);
	OnQuestUpdated.Broadcast(Quest, 0);
	return true;
}

void UQuestManager::AbandonQuest(const FString& QuestID)
{
	if (FActiveQuestRuntime* Runtime = ActiveQuests.Find(QuestID))
	{
		UQuestDataAsset* Quest = Runtime->QuestAsset;
		ActiveQuests.Remove(QuestID);
		if (TrackedQuestID == QuestID)
		{
			TrackedQuestID.Empty();
		}
		OnQuestAbandoned.Broadcast(Quest);
	}
}

void UQuestManager::ReportProgress(EObjectiveType ObjectiveType, FName TargetIdentifier, AActor* RelevantActor,
	FVector Location, int32 Count)
{
	for (auto& Pair : ActiveQuests)
	{
		FActiveQuestRuntime& Runtime = Pair.Value;
		if (!Runtime.RuntimeStages.IsValidIndex(Runtime.CurrentStageIndex))
		{
			continue;
		}

		FQuestStage& Stage = Runtime.RuntimeStages[Runtime.CurrentStageIndex];
		bool bAnyObjectiveChanged = false;

		for (int32 ObjectiveIndex = 0; ObjectiveIndex < Stage.Objectives.Num(); ++ObjectiveIndex)
		{
			FQuestObjective& Objective = Stage.Objectives[ObjectiveIndex];
			if (Objective.ObjectiveType != ObjectiveType || Objective.IsComplete())
			{
				continue;
			}

			// Match specificity: if the objective names a target actor/identifier/location,
			// the report has to match it; unset fields on the objective mean "any" match.
			if (Objective.TargetActor && Objective.TargetActor != RelevantActor)
			{
				continue;
			}
			if (!Objective.TargetIdentifier.IsNone() && Objective.TargetIdentifier != TargetIdentifier)
			{
				continue;
			}
			if (ObjectiveType == EObjectiveType::ReachLocation
				&& FVector::DistSquared(Objective.TargetLocation, Location) > FMath::Square(300.f))
			{
				continue;
			}

			Objective.CurrentCount = FMath::Min(Objective.CurrentCount + Count, Objective.RequiredCount);
			bAnyObjectiveChanged = true;
			OnObjectiveUpdated.Broadcast(Runtime.QuestAsset, Runtime.CurrentStageIndex, ObjectiveIndex);
		}

		if (bAnyObjectiveChanged)
		{
			OnQuestUpdated.Broadcast(Runtime.QuestAsset, Runtime.CurrentStageIndex);
			AdvanceStageIfComplete(Runtime);
		}
	}
}

void UQuestManager::AdvanceStageIfComplete(FActiveQuestRuntime& Runtime)
{
	if (!Runtime.RuntimeStages.IsValidIndex(Runtime.CurrentStageIndex)
		|| !Runtime.RuntimeStages[Runtime.CurrentStageIndex].IsComplete())
	{
		return;
	}

	GrantReward(Runtime.RuntimeStages[Runtime.CurrentStageIndex].StageReward);

	if (Runtime.CurrentStageIndex + 1 < Runtime.RuntimeStages.Num())
	{
		++Runtime.CurrentStageIndex;
		OnQuestUpdated.Broadcast(Runtime.QuestAsset, Runtime.CurrentStageIndex);
	}
	else
	{
		CompleteQuest(Runtime);
	}
}

void UQuestManager::CompleteQuest(FActiveQuestRuntime& Runtime)
{
	UQuestDataAsset* Quest = Runtime.QuestAsset;
	if (!Quest)
	{
		return;
	}

	GrantReward(Quest->QuestCompletionReward);

	if (Quest->QuestCompleteFlag.IsValid())
	{
		if (UDialogueManager* DialogueManager = GetGameInstance()->GetSubsystem<UDialogueManager>())
		{
			DialogueManager->SetStoryFlag(Quest->QuestCompleteFlag);
		}
	}

	const FString QuestID = Quest->QuestID;
	CompletedQuestIDs.Add(QuestID);
	ActiveQuests.Remove(QuestID);
	if (TrackedQuestID == QuestID)
	{
		TrackedQuestID.Empty();
	}

	OnQuestCompleted.Broadcast(Quest);
}

void UQuestManager::GrantReward(const FRewardData& Reward) const
{
	UE_LOG(LogTemp, Log, TEXT("[QuestManager] Granting reward: %d EXP, %d Currency, %d item type(s)"),
		Reward.EXP, Reward.Currency, Reward.ItemRewards.Num());
	// No inventory/currency subsystem exists yet — EXP/Currency/Items are logged only.
	// Wire this up to a real economy system before shipping.

	if (Reward.StoryUnlockFlag.IsValid())
	{
		if (UDialogueManager* DialogueManager = GetGameInstance()->GetSubsystem<UDialogueManager>())
		{
			DialogueManager->SetStoryFlag(Reward.StoryUnlockFlag);
		}
	}

	if (Reward.NewAbilities.Num() == 0)
	{
		return;
	}

	APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0);
	UAbilitySystemComponent* ASC = PlayerPawn ? UAbilitySystemBlueprintLibrary::GetAbilitySystemComponent(PlayerPawn) : nullptr;
	if (!ASC)
	{
		return;
	}

	for (const TSoftClassPtr<UGameplayAbility>& SoftAbilityClass : Reward.NewAbilities)
	{
		if (UClass* AbilityClass = SoftAbilityClass.LoadSynchronous())
		{
			ASC->GiveAbility(FGameplayAbilitySpec(AbilityClass, 1, INDEX_NONE, ASC->GetOwner()));
		}
	}
}

TArray<UQuestDataAsset*> UQuestManager::GetActiveQuests() const
{
	TArray<UQuestDataAsset*> Result;
	Result.Reserve(ActiveQuests.Num());
	for (const auto& Pair : ActiveQuests)
	{
		if (Pair.Value.QuestAsset)
		{
			Result.Add(Pair.Value.QuestAsset);
		}
	}
	return Result;
}

FQuestStage UQuestManager::GetCurrentStage(const FString& QuestID) const
{
	if (const FActiveQuestRuntime* Runtime = ActiveQuests.Find(QuestID))
	{
		if (Runtime->RuntimeStages.IsValidIndex(Runtime->CurrentStageIndex))
		{
			return Runtime->RuntimeStages[Runtime->CurrentStageIndex];
		}
	}
	return FQuestStage();
}
