// Copyright StickmanImpact Project.

#include "TitleManager.h"
#include "GameFlow/AchievementManager.h"

void UTitleManager::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);

	Collection.InitializeDependency<UAchievementManager>();
	if (UAchievementManager* Achievements = GetGameInstance()->GetSubsystem<UAchievementManager>())
	{
		Achievements->OnAchievementUnlocked.AddDynamic(this, &UTitleManager::HandleAchievementUnlocked);
		KnownAchievementCount = Achievements->GetUnlockedCount();
	}
}

void UTitleManager::SetTitleTable(UDataTable* Table)
{
	TitleTable = Table;
	// Catch up on unlocks earned before the table was assigned.
	EvaluateUnlocks(NAME_None, KnownAchievementCount);
}

void UTitleManager::HandleAchievementUnlocked(FAchievementEntry Entry)
{
	++KnownAchievementCount;
	EvaluateUnlocks(Entry.AchievementID, KnownAchievementCount);
}

void UTitleManager::EvaluateUnlocks(FName JustUnlockedAchievement, int32 TotalUnlockedCount)
{
	if (!TitleTable)
	{
		return;
	}

	const UAchievementManager* Achievements = GetGameInstance()->GetSubsystem<UAchievementManager>();

	TitleTable->ForeachRow<FTitleDefinition>(TEXT("TitleManager"),
		[&](const FName& RowName, const FTitleDefinition& Title)
	{
		if (UnlockedTitleIDs.Contains(Title.TitleID))
		{
			return;
		}

		bool bUnlock = false;
		if (!Title.RequiredAchievementID.IsNone())
		{
			bUnlock = Title.RequiredAchievementID == JustUnlockedAchievement ||
				(Achievements && Achievements->IsUnlocked(Title.RequiredAchievementID));
		}
		else if (Title.RequiredAchievementCount > 0)
		{
			bUnlock = TotalUnlockedCount >= Title.RequiredAchievementCount;
		}

		if (bUnlock)
		{
			UnlockedTitleIDs.Add(Title.TitleID);
			OnTitleUnlocked.Broadcast(Title.TitleID);
		}
	});
}

bool UTitleManager::EquipTitle(FName TitleID)
{
	if (!TitleID.IsNone() && !UnlockedTitleIDs.Contains(TitleID))
	{
		return false;
	}

	EquippedTitleID = TitleID;

	FText DisplayName = FText::GetEmpty();
	if (TitleTable && !TitleID.IsNone())
	{
		TitleTable->ForeachRow<FTitleDefinition>(TEXT("TitleManager"),
			[&](const FName& RowName, const FTitleDefinition& Title)
		{
			if (Title.TitleID == TitleID)
			{
				DisplayName = Title.DisplayName;
			}
		});
	}

	OnTitleEquipped.Broadcast(TitleID, DisplayName);
	return true;
}

void UTitleManager::ExportSaveState(TArray<FName>& OutUnlocked, FName& OutEquipped) const
{
	OutUnlocked = UnlockedTitleIDs.Array();
	OutEquipped = EquippedTitleID;
}

void UTitleManager::ImportSaveState(const TArray<FName>& InUnlocked, FName InEquipped)
{
	UnlockedTitleIDs = TSet<FName>(InUnlocked);
	EquippedTitleID = InEquipped;
}
