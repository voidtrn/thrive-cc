#include "System/AchievementSubsystem.h"
#include "System/OpenWorldGameInstance.h"
#include "Engine/DataTable.h"
#include "Engine/Engine.h"
#include "Engine/World.h"
#include "MyGame.h"

UOpenWorldGameInstance* UAchievementSubsystem::GetOWGameInstance() const
{
	return Cast<UOpenWorldGameInstance>(GetGameInstance());
}

void UAchievementSubsystem::ReportStat(FName StatKey, int32 Delta)
{
	UOpenWorldGameInstance* GI = GetOWGameInstance();
	if (!GI || StatKey.IsNone() || Delta <= 0)
	{
		return;
	}

	int32& Value = GI->LifetimeStats.FindOrAdd(StatKey);
	Value += Delta;
	OnStatReported.Broadcast(StatKey, Value);
}

void UAchievementSubsystem::Report(const UObject* WorldContext, FName StatKey, int32 Delta)
{
	const UWorld* World = GEngine
		? GEngine->GetWorldFromContextObject(WorldContext, EGetWorldErrorMode::ReturnNull)
		: nullptr;
	if (!World)
	{
		return;
	}
	if (UGameInstance* GI = World->GetGameInstance())
	{
		if (UAchievementSubsystem* Achievements = GI->GetSubsystem<UAchievementSubsystem>())
		{
			Achievements->ReportStat(StatKey, Delta);
		}
	}
}

int32 UAchievementSubsystem::GetStat(FName StatKey) const
{
	const UOpenWorldGameInstance* GI = GetOWGameInstance();
	if (!GI)
	{
		return 0;
	}
	const int32* Value = GI->LifetimeStats.Find(StatKey);
	return Value ? *Value : 0;
}

bool UAchievementSubsystem::IsUnlocked(const UDataTable* AchievementTable, FName RowName) const
{
	if (!AchievementTable)
	{
		return false;
	}
	const FAchievementRow* Row = AchievementTable->FindRow<FAchievementRow>(RowName, TEXT("Achievement"));
	return Row && GetStat(Row->StatKey) >= Row->TargetCount;
}

bool UAchievementSubsystem::IsClaimed(FName RowName) const
{
	const UOpenWorldGameInstance* GI = GetOWGameInstance();
	return GI && GI->ClaimedAchievements.Contains(RowName);
}

EClaimResult UAchievementSubsystem::ClaimAchievement(const UDataTable* AchievementTable, FName RowName)
{
	UOpenWorldGameInstance* GI = GetOWGameInstance();
	if (!GI || !AchievementTable)
	{
		return EClaimResult::InvalidData;
	}

	const FAchievementRow* Row = AchievementTable->FindRow<FAchievementRow>(RowName, TEXT("AchievementClaim"));
	if (!Row)
	{
		return EClaimResult::InvalidData;
	}
	if (GI->ClaimedAchievements.Contains(RowName))
	{
		return EClaimResult::AlreadyClaimed;
	}
	if (GetStat(Row->StatKey) < Row->TargetCount)
	{
		return EClaimResult::NotUnlocked;
	}

	GI->ClaimedAchievements.Add(RowName);
	GI->Primogems += Row->PrimogemReward;

	UE_LOG(LogAetherRealm, Log, TEXT("Achievement '%s' claimed: +%d primogems"),
		*RowName.ToString(), Row->PrimogemReward);

	OnAchievementClaimed.Broadcast(RowName);
	GI->AutoSave();
	return EClaimResult::Success;
}

int32 UAchievementSubsystem::CountClaimable(const UDataTable* AchievementTable) const
{
	const UOpenWorldGameInstance* GI = GetOWGameInstance();
	if (!GI || !AchievementTable)
	{
		return 0;
	}

	int32 Count = 0;
	AchievementTable->ForeachRow<FAchievementRow>(TEXT("AchievementBadge"),
		[&](const FName& RowName, const FAchievementRow& Row)
		{
			if (!GI->ClaimedAchievements.Contains(RowName) && GetStat(Row.StatKey) >= Row.TargetCount)
			{
				Count++;
			}
		});
	return Count;
}
