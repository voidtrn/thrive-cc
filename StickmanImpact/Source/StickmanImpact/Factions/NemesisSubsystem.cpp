// Copyright StickmanImpact Project.

#include "NemesisSubsystem.h"
#include "FactionSubsystem.h"

FString UNemesisSubsystem::RollName() const
{
	static const TCHAR* First[] = { TEXT("Gor"), TEXT("Vex"), TEXT("Mor"), TEXT("Kra"), TEXT("Zul"), TEXT("Dra") };
	static const TCHAR* Last[] = { TEXT("gash"), TEXT("nak"), TEXT("thok"), TEXT("rim"), TEXT("dar"), TEXT("uzg") };
	static const TCHAR* Title[] = { TEXT("the Cruel"), TEXT("the Swift"), TEXT("Ironhide"), TEXT("the Cunning"), TEXT("Bonebreaker") };

	const int32 F = FMath::RandRange(0, UE_ARRAY_COUNT(First) - 1);
	const int32 L = FMath::RandRange(0, UE_ARRAY_COUNT(Last) - 1);
	const int32 T = FMath::RandRange(0, UE_ARRAY_COUNT(Title) - 1);
	return FString::Printf(TEXT("%s%s %s"), First[F], Last[L], Title[T]);
}

FGuid UNemesisSubsystem::GenerateCaptain(EFaction Faction, FName Territory)
{
	FNemesisCaptain Captain;
	Captain.CaptainID = FGuid::NewGuid();
	Captain.Name = RollName();
	Captain.Faction = Faction;
	Captain.Territory = Territory;
	Captain.Rank = 0;

	if (PossibleStrengths.Num() > 0)
	{
		Captain.StrengthTraits.Add(PossibleStrengths[FMath::RandRange(0, PossibleStrengths.Num() - 1)]);
	}
	if (PossibleWeaknesses.Num() > 0)
	{
		Captain.WeaknessTraits.Add(PossibleWeaknesses[FMath::RandRange(0, PossibleWeaknesses.Num() - 1)]);
	}

	Captains.Add(Captain.CaptainID, Captain);
	return Captain.CaptainID;
}

bool UNemesisSubsystem::GetCaptain(FGuid CaptainID, FNemesisCaptain& OutCaptain) const
{
	if (const FNemesisCaptain* Captain = Captains.Find(CaptainID))
	{
		OutCaptain = *Captain;
		return true;
	}
	return false;
}

TArray<FNemesisCaptain> UNemesisSubsystem::GetActiveCaptains() const
{
	TArray<FNemesisCaptain> Result;
	for (const TPair<FGuid, FNemesisCaptain>& Pair : Captains)
	{
		if (Pair.Value.bAlive)
		{
			Result.Add(Pair.Value);
		}
	}
	return Result;
}

void UNemesisSubsystem::NotifyCaptainDefeatedPlayer(FGuid CaptainID)
{
	FNemesisCaptain* Captain = Captains.Find(CaptainID);
	if (!Captain || !Captain->bAlive)
	{
		return;
	}

	++Captain->TimesDefeatedPlayer;
	++Captain->Rank; // promotion: rank drives HP + an extra ability when spawned
	// Gain a new strength trait on promotion.
	if (PossibleStrengths.Num() > 0)
	{
		Captain->StrengthTraits.AddUnique(PossibleStrengths[FMath::RandRange(0, PossibleStrengths.Num() - 1)]);
	}

	// The captain's faction gains territory influence for the win.
	if (UFactionSubsystem* Factions = GetGameInstance()->GetSubsystem<UFactionSubsystem>())
	{
		Factions->ShiftTerritoryInfluence(Captain->Territory, Captain->Faction, 0.15f);
	}

	OnNemesisPromoted.Broadcast(*Captain);
}

void UNemesisSubsystem::NotifyCaptainDefeated(FGuid CaptainID)
{
	FNemesisCaptain* Captain = Captains.Find(CaptainID);
	if (!Captain || !Captain->bAlive)
	{
		return;
	}

	// Fate: mostly dies; a low-rank one may flee (stays alive, demoted).
	const bool bFlees = Captain->Rank > 0 && FMath::FRand() < 0.25f;
	if (bFlees)
	{
		Captain->Rank = FMath::Max(Captain->Rank - 1, 0);
	}
	else
	{
		Captain->bAlive = false;
		// Faction loses territory grip; a rival can be generated to take the slot.
		if (UFactionSubsystem* Factions = GetGameInstance()->GetSubsystem<UFactionSubsystem>())
		{
			Factions->ShiftTerritoryInfluence(Captain->Territory, Captain->Faction, -0.2f);
		}
	}

	OnNemesisDefeated.Broadcast(*Captain);
}

FText UNemesisSubsystem::GetCaptainTaunt(FGuid CaptainID) const
{
	const FNemesisCaptain* Captain = Captains.Find(CaptainID);
	if (!Captain)
	{
		return FText::GetEmpty();
	}
	if (Captain->TimesDefeatedPlayer == 0)
	{
		return FText::FromString(TEXT("You don't know me yet. You will."));
	}
	if (Captain->TimesDefeatedPlayer == 1)
	{
		return FText::FromString(TEXT("Back for another beating?"));
	}
	return FText::FromString(FString::Printf(TEXT("%s has bested you %d times. This makes another."),
		*Captain->Name, Captain->TimesDefeatedPlayer));
}

void UNemesisSubsystem::ExportSaveState(TArray<FNemesisCaptain>& OutCaptains) const
{
	Captains.GenerateValueArray(OutCaptains);
}

void UNemesisSubsystem::ImportSaveState(const TArray<FNemesisCaptain>& InCaptains)
{
	Captains.Empty();
	for (const FNemesisCaptain& Captain : InCaptains)
	{
		Captains.Add(Captain.CaptainID, Captain);
	}
}
