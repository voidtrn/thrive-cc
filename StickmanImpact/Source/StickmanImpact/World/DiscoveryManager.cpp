// Copyright StickmanImpact Project.

#include "DiscoveryManager.h"
#include "Quest/QuestManager.h"
#include "Quest/QuestDataAsset.h"

void UDiscoveryManager::RegisterSecret(const FString& DiscoveryID, FName Area)
{
	AreaSecretIDs.FindOrAdd(Area).Add(DiscoveryID);
}

bool UDiscoveryManager::RecordDiscovery(const FDiscoveryJournalEntry& Entry)
{
	if (Entry.DiscoveryID.IsEmpty() || DiscoveredIDs.Contains(Entry.DiscoveryID))
	{
		return false;
	}

	DiscoveredIDs.Add(Entry.DiscoveryID);
	Journal.Add(Entry);
	OnDiscoveryMade.Broadcast(Entry);
	return true;
}

float UDiscoveryManager::GetAreaDiscoveryPercent(FName Area) const
{
	const TSet<FString>* Secrets = AreaSecretIDs.Find(Area);
	if (!Secrets || Secrets->Num() == 0)
	{
		return 0.f;
	}

	int32 Found = 0;
	for (const FString& ID : *Secrets)
	{
		if (DiscoveredIDs.Contains(ID))
		{
			++Found;
		}
	}
	return static_cast<float>(Found) / static_cast<float>(Secrets->Num());
}

int32 UDiscoveryManager::GetSecretsRemaining(FName Area) const
{
	const TSet<FString>* Secrets = AreaSecretIDs.Find(Area);
	if (!Secrets)
	{
		return 0;
	}

	int32 Remaining = 0;
	for (const FString& ID : *Secrets)
	{
		if (!DiscoveredIDs.Contains(ID))
		{
			++Remaining;
		}
	}
	return Remaining;
}

void UDiscoveryManager::RecordClue(const FString& ClueID, FName ClueSetID, int32 SetSize, UQuestDataAsset* UnlockedQuest)
{
	if (ClueID.IsEmpty() || CollectedClueIDs.Contains(ClueID))
	{
		return;
	}

	CollectedClueIDs.Add(ClueID);
	const int32 Count = ++ClueSetCounts.FindOrAdd(ClueSetID);
	OnClueCollected.Broadcast(ClueSetID, Count);

	if (Count >= SetSize && !CompletedClueSets.Contains(ClueSetID))
	{
		CompletedClueSets.Add(ClueSetID);
		if (UnlockedQuest)
		{
			if (UQuestManager* QuestManager = GetGameInstance()->GetSubsystem<UQuestManager>())
			{
				QuestManager->AcceptQuest(UnlockedQuest);
			}
		}
		OnClueSetCompleted.Broadcast(ClueSetID);
	}
}

int32 UDiscoveryManager::GetCluesCollectedInSet(FName ClueSetID) const
{
	const int32* Count = ClueSetCounts.Find(ClueSetID);
	return Count ? *Count : 0;
}

void UDiscoveryManager::ExportSaveState(TArray<FDiscoveryJournalEntry>& OutJournal, TArray<FString>& OutClueIDs) const
{
	OutJournal = Journal;
	OutClueIDs = CollectedClueIDs.Array();
}

void UDiscoveryManager::ImportSaveState(const TArray<FDiscoveryJournalEntry>& InJournal, const TArray<FString>& InClueIDs)
{
	Journal = InJournal;
	DiscoveredIDs.Empty();
	for (const FDiscoveryJournalEntry& Entry : Journal)
	{
		DiscoveredIDs.Add(Entry.DiscoveryID);
	}

	CollectedClueIDs = TSet<FString>(InClueIDs);
	// Clue-set counts rebuild as clues re-register; completed sets stay completed only if
	// their quest was accepted before the save — quest state is saved separately, so a set
	// completing "again" is harmless (AcceptQuest rejects active/completed quests).
	ClueSetCounts.Empty();
	CompletedClueSets.Empty();
}
