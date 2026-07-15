// Copyright StickmanImpact Project.

#include "AchievementManager.h"
#include "Combat/CombatFeedbackSubsystem.h"
#include "Combat/ElementalReactionManager.h"
#include "Quest/QuestManager.h"
#include "Quest/QuestDataAsset.h"
#include "World/CollectibleManager.h"
#include "World/WaypointManager.h"
#include "Engine/DataTable.h"
#include "Misc/ConfigCacheIni.h"
#include "TimerManager.h"

namespace
{
	const TCHAR* AchievementSection = TEXT("/Script/StickmanImpact.StickmanAchievements");
}

void UAchievementManager::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);

	// Restore persisted state.
	FString UnlockedJoined;
	if (GConfig->GetString(AchievementSection, TEXT("Unlocked"), UnlockedJoined, GGameUserSettingsIni))
	{
		TArray<FString> IDs;
		UnlockedJoined.ParseIntoArray(IDs, TEXT(","));
		UnlockedIDs = TSet<FString>(IDs);
	}
	FString ProgressJoined;
	if (GConfig->GetString(AchievementSection, TEXT("Progress"), ProgressJoined, GGameUserSettingsIni))
	{
		TArray<FString> Pairs;
		ProgressJoined.ParseIntoArray(Pairs, TEXT(","));
		for (const FString& Pair : Pairs)
		{
			FString Key, Value;
			if (Pair.Split(TEXT("="), &Key, &Value))
			{
				ProgressCounts.Add(Key, FCString::Atoi(*Value));
			}
		}
	}

	// Defer delegate wiring one tick (subsystem init order isn't guaranteed).
	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().SetTimerForNextTick([this]()
		{
			UGameInstance* GameInstance = GetGameInstance();
			if (UCombatFeedbackSubsystem* Combat = GameInstance->GetSubsystem<UCombatFeedbackSubsystem>())
			{
				Combat->OnKillConfirmed.AddDynamic(this, &UAchievementManager::HandleKillConfirmed);
			}
			if (UQuestManager* Quests = GameInstance->GetSubsystem<UQuestManager>())
			{
				Quests->OnQuestCompleted.AddDynamic(this, &UAchievementManager::HandleQuestCompleted);
			}
			if (UCollectibleManager* Collectibles = GameInstance->GetSubsystem<UCollectibleManager>())
			{
				Collectibles->OnCollectibleCollected.AddDynamic(this, &UAchievementManager::HandleCollectibleCollected);
			}
			if (UElementalReactionManager* Reactions = GameInstance->GetSubsystem<UElementalReactionManager>())
			{
				Reactions->OnReactionTriggered.AddDynamic(this, &UAchievementManager::HandleReactionTriggered);
			}
			if (UWaypointManager* Waypoints = GameInstance->GetSubsystem<UWaypointManager>())
			{
				Waypoints->OnWaypointUnlocked.AddDynamic(this, &UAchievementManager::HandleWaypointUnlocked);
			}
		});
	}
}

void UAchievementManager::PersistState() const
{
	GConfig->SetString(AchievementSection, TEXT("Unlocked"), *FString::Join(UnlockedIDs, TEXT(",")), GGameUserSettingsIni);

	TArray<FString> Pairs;
	for (const auto& Pair : ProgressCounts)
	{
		Pairs.Add(FString::Printf(TEXT("%s=%d"), *Pair.Key, Pair.Value));
	}
	GConfig->SetString(AchievementSection, TEXT("Progress"), *FString::Join(Pairs, TEXT(",")), GGameUserSettingsIni);
	GConfig->Flush(false, GGameUserSettingsIni);
}

void UAchievementManager::AdvanceTrigger(EAchievementTrigger TriggerType, const FString& TargetID, int32 Amount)
{
	if (!AchievementTable)
	{
		return;
	}

	AchievementTable->ForeachRow<FAchievementEntry>(TEXT("AdvanceTrigger"),
		[this, TriggerType, &TargetID, Amount](const FName&, const FAchievementEntry& Entry)
	{
		if (Entry.TriggerType != TriggerType || UnlockedIDs.Contains(Entry.AchievementID.ToString()))
		{
			return;
		}
		// Entries naming a specific target only advance on a matching event.
		if (!Entry.TargetID.IsEmpty() && Entry.TargetID != TargetID)
		{
			return;
		}

		int32& Count = ProgressCounts.FindOrAdd(Entry.AchievementID.ToString());
		Count += Amount;
		OnAchievementProgress.Broadcast(Entry.AchievementID,
			FMath::Clamp(static_cast<float>(Count) / FMath::Max(Entry.RequiredCount, 1), 0.f, 1.f));

		if (Count >= Entry.RequiredCount)
		{
			UnlockInternal(Entry);
		}
	});

	PersistState();
}

void UAchievementManager::UnlockInternal(const FAchievementEntry& Entry)
{
	UnlockedIDs.Add(Entry.AchievementID.ToString());
	UE_LOG(LogTemp, Display, TEXT("[Achievements] Unlocked: %s"), *Entry.Title.ToString());
	OnAchievementUnlocked.Broadcast(Entry);
	// Platform upload (Steam/GOG/console): IOnlineAchievements::WriteAchievements here —
	// see Docs/PACKAGING.md, needs the platform's OnlineSubsystem plugin configured.
}

int32 UAchievementManager::GetProgress(FName AchievementID) const
{
	const int32* Count = ProgressCounts.Find(AchievementID.ToString());
	return Count ? *Count : 0;
}

TArray<FAchievementEntry> UAchievementManager::GetAllAchievements() const
{
	TArray<FAchievementEntry> Result;
	if (AchievementTable)
	{
		AchievementTable->ForeachRow<FAchievementEntry>(TEXT("GetAll"),
			[&Result](const FName&, const FAchievementEntry& Entry) { Result.Add(Entry); });
	}
	return Result;
}

void UAchievementManager::HandleKillConfirmed(AActor* Target)
{
	AdvanceTrigger(EAchievementTrigger::KillCount, FString(), 1);
}

void UAchievementManager::HandleQuestCompleted(UQuestDataAsset* Quest)
{
	AdvanceTrigger(EAchievementTrigger::QuestCompleted, Quest ? Quest->QuestID : FString(), 1);
}

void UAchievementManager::HandleCollectibleCollected(FString ItemID, FName Region)
{
	AdvanceTrigger(EAchievementTrigger::CollectCount, ItemID, 1);
}

void UAchievementManager::HandleReactionTriggered(AActor* Target, EStickmanReactionType Reaction, float Damage,
	FVector Location)
{
	AdvanceTrigger(EAchievementTrigger::ReactionTriggered, UEnum::GetValueAsString(Reaction), 1);
}

void UAchievementManager::HandleWaypointUnlocked(AWaypointActor* Waypoint)
{
	AdvanceTrigger(EAchievementTrigger::WaypointsUnlocked, FString(), 1);
}
