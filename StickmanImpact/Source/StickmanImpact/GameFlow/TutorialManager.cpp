// Copyright StickmanImpact Project.

#include "TutorialManager.h"
#include "Engine/DataTable.h"
#include "Misc/ConfigCacheIni.h"

namespace
{
	const TCHAR* TutorialSection = TEXT("/Script/StickmanImpact.StickmanTutorials");
	const TCHAR* SeenKey = TEXT("SeenTags");
}

void UTutorialManager::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);

	// Seen tags persist in the user settings ini (comma-joined) — survives save-slot wipes,
	// matching "never repeat" being per-install rather than per-playthrough.
	FString Joined;
	if (GConfig->GetString(TutorialSection, SeenKey, Joined, GGameUserSettingsIni))
	{
		TArray<FString> Tags;
		Joined.ParseIntoArray(Tags, TEXT(","));
		SeenTutorialTags = TSet<FString>(Tags);
	}
}

void UTutorialManager::PersistSeenTags() const
{
	GConfig->SetString(TutorialSection, SeenKey, *FString::Join(SeenTutorialTags, TEXT(",")), GGameUserSettingsIni);
	GConfig->Flush(false, GGameUserSettingsIni);
}

bool UTutorialManager::TriggerTutorial(FGameplayTag Tag)
{
	if (!Tag.IsValid() || !TutorialTable)
	{
		return false;
	}

	// Rows keyed by tag name for O(1) lookup: name the DataTable row exactly the tag string.
	const FTutorialEntry* Entry = TutorialTable->FindRow<FTutorialEntry>(FName(*Tag.ToString()), TEXT("TriggerTutorial"));
	if (!Entry)
	{
		return false;
	}

	if (Entry->bOneTime && SeenTutorialTags.Contains(Tag.ToString()))
	{
		return false;
	}

	if (Entry->bOneTime)
	{
		SeenTutorialTags.Add(Tag.ToString());
		PersistSeenTags();
	}

	OnTutorialTriggered.Broadcast(*Entry);
	return true;
}

void UTutorialManager::ResetAllTutorials()
{
	SeenTutorialTags.Reset();
	PersistSeenTags();
}
