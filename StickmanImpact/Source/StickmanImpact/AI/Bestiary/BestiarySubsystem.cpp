// Copyright StickmanImpact Project.

#include "BestiarySubsystem.h"

void UBestiarySubsystem::NotifyEncountered(FName ArchetypeID)
{
	if (ArchetypeID.IsNone())
	{
		return;
	}
	bool bAlready = false;
	EncounteredIDs.Add(ArchetypeID, &bAlready);
	if (!bAlready)
	{
		OnBestiaryEntryUpdated.Broadcast(ArchetypeID);
	}
}

void UBestiarySubsystem::NotifyKilled(FName ArchetypeID)
{
	if (ArchetypeID.IsNone())
	{
		return;
	}
	const int32 OldCount = GetKillCount(ArchetypeID);
	const int32 NewCount = ++KillCounts.FindOrAdd(ArchetypeID);
	EncounteredIDs.Add(ArchetypeID);

	// Fire on a newly-revealed weakness so the journal UI can flag it.
	if (OldCount < KillsToRevealWeakness && NewCount >= KillsToRevealWeakness)
	{
		OnBestiaryEntryUpdated.Broadcast(ArchetypeID);
	}
}

int32 UBestiarySubsystem::GetKillCount(FName ArchetypeID) const
{
	const int32* Count = KillCounts.Find(ArchetypeID);
	return Count ? *Count : 0;
}

void UBestiarySubsystem::ExportSaveState(TArray<FName>& OutSeen, TMap<FName, int32>& OutKills) const
{
	OutSeen = EncounteredIDs.Array();
	OutKills = KillCounts;
}

void UBestiarySubsystem::ImportSaveState(const TArray<FName>& InSeen, const TMap<FName, int32>& InKills)
{
	EncounteredIDs = TSet<FName>(InSeen);
	KillCounts = InKills;
}
