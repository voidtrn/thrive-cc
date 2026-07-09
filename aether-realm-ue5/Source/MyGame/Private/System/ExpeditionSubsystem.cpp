#include "System/ExpeditionSubsystem.h"
#include "System/AchievementSubsystem.h"
#include "System/OpenWorldGameInstance.h"
#include "Engine/DataTable.h"
#include "MyGame.h"

UOpenWorldGameInstance* UExpeditionSubsystem::GetOWGameInstance() const
{
	return Cast<UOpenWorldGameInstance>(GetGameInstance());
}

FActiveExpedition* UExpeditionSubsystem::FindActive(FName ExpeditionId) const
{
	UOpenWorldGameInstance* GI = GetOWGameInstance();
	return GI ? GI->ActiveExpeditions.FindByPredicate(
		[&](const FActiveExpedition& E) { return E.ExpeditionId == ExpeditionId; }) : nullptr;
}

bool UExpeditionSubsystem::IsCompleteAt(const FDateTime& StartTime, int32 DurationHours, const FDateTime& Now)
{
	// Clock mundur: belum selesai (jangan kasih hadiah gratis).
	if (Now <= StartTime)
	{
		return false;
	}
	return (Now - StartTime).GetTotalHours() >= static_cast<double>(DurationHours);
}

EExpeditionResult UExpeditionSubsystem::StartExpedition(
	const UDataTable* ExpeditionTable, FName ExpeditionId, FName CharacterId)
{
	UOpenWorldGameInstance* GI = GetOWGameInstance();
	if (!GI || !ExpeditionTable || ExpeditionId.IsNone() || CharacterId.IsNone())
	{
		return EExpeditionResult::InvalidData;
	}

	const FExpeditionRow* Row = ExpeditionTable->FindRow<FExpeditionRow>(ExpeditionId, TEXT("Expedition"));
	if (!Row)
	{
		return EExpeditionResult::InvalidData;
	}
	if (GI->AdventureRank < Row->ARRequirement)
	{
		return EExpeditionResult::ARTooLow;
	}
	if (GI->ActiveExpeditions.Num() >= MaxConcurrentExpeditions)
	{
		return EExpeditionResult::SlotsFull;
	}
	if (FindActive(ExpeditionId))
	{
		return EExpeditionResult::ExpeditionRunning;
	}
	if (GI->ActiveExpeditions.ContainsByPredicate(
		[&](const FActiveExpedition& E) { return E.CharacterId == CharacterId; }))
	{
		return EExpeditionResult::CharacterBusy;
	}

	FActiveExpedition Active;
	Active.ExpeditionId = ExpeditionId;
	Active.CharacterId = CharacterId;
	Active.StartTime = FDateTime::UtcNow();
	Active.DurationHours = Row->DurationHours;
	GI->ActiveExpeditions.Add(Active);

	OnExpeditionsChanged.Broadcast(GI->ActiveExpeditions);
	GI->AutoSave();
	return EExpeditionResult::Success;
}

EExpeditionResult UExpeditionSubsystem::ClaimExpedition(const UDataTable* ExpeditionTable, FName ExpeditionId)
{
	UOpenWorldGameInstance* GI = GetOWGameInstance();
	if (!GI || !ExpeditionTable)
	{
		return EExpeditionResult::InvalidData;
	}

	const FActiveExpedition* Active = FindActive(ExpeditionId);
	if (!Active)
	{
		return EExpeditionResult::NotFound;
	}
	if (!IsCompleteAt(Active->StartTime, Active->DurationHours, FDateTime::UtcNow()))
	{
		return EExpeditionResult::NotComplete;
	}

	const FExpeditionRow* Row = ExpeditionTable->FindRow<FExpeditionRow>(ExpeditionId, TEXT("ExpeditionClaim"));
	if (!Row)
	{
		return EExpeditionResult::InvalidData;
	}

	GI->Mora += Row->MoraReward;
	for (const FMaterialCost& Reward : Row->ItemRewards)
	{
		GI->AddItem(Reward.ItemId, Reward.Count);
	}

	GI->ActiveExpeditions.RemoveAll(
		[&](const FActiveExpedition& E) { return E.ExpeditionId == ExpeditionId; });

	UE_LOG(LogAetherRealm, Log, TEXT("Expedition '%s' claimed: %d mora, %d item types"),
		*ExpeditionId.ToString(), Row->MoraReward, Row->ItemRewards.Num());

	if (UAchievementSubsystem* Achievements = GI->GetSubsystem<UAchievementSubsystem>())
	{
		Achievements->ReportStat(TEXT("Stat_ExpeditionsClaimed"));
	}

	OnExpeditionsChanged.Broadcast(GI->ActiveExpeditions);
	GI->AutoSave();
	return EExpeditionResult::Success;
}

bool UExpeditionSubsystem::CancelExpedition(FName ExpeditionId)
{
	UOpenWorldGameInstance* GI = GetOWGameInstance();
	if (!GI)
	{
		return false;
	}

	const int32 Removed = GI->ActiveExpeditions.RemoveAll(
		[&](const FActiveExpedition& E) { return E.ExpeditionId == ExpeditionId; });
	if (Removed > 0)
	{
		OnExpeditionsChanged.Broadcast(GI->ActiveExpeditions);
		GI->AutoSave();
	}
	return Removed > 0;
}

TArray<FActiveExpedition> UExpeditionSubsystem::GetActiveExpeditions() const
{
	const UOpenWorldGameInstance* GI = GetOWGameInstance();
	return GI ? GI->ActiveExpeditions : TArray<FActiveExpedition>();
}

int32 UExpeditionSubsystem::SecondsRemaining(FName ExpeditionId) const
{
	const FActiveExpedition* Active = FindActive(ExpeditionId);
	if (!Active)
	{
		return -1;
	}

	const FDateTime End = Active->StartTime + FTimespan::FromHours(Active->DurationHours);
	const FDateTime Now = FDateTime::UtcNow();
	return (Now >= End) ? 0 : static_cast<int32>((End - Now).GetTotalSeconds());
}
