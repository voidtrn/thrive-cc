// Copyright StickmanImpact Project.

#include "RoguelikeRunSubsystem.h"
#include "DungeonGenerator.h"

void URoguelikeRunSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);
	Generator = NewObject<UDungeonGenerator>(this);
}

// ---------------------------------------------------------------- run lifecycle -------

void URoguelikeRunSubsystem::StartRun(int32 Seed)
{
	RunSeed = Seed;
	CurrentFloor = 0;
	bRunActive = true;
	AcquiredBoons.Empty(); // boons are run-scoped
}

TArray<FGeneratedRoom> URoguelikeRunSubsystem::AdvanceFloor()
{
	if (!bRunActive)
	{
		return {};
	}
	++CurrentFloor;
	OnFloorChanged.Broadcast(CurrentFloor);
	return Generator ? Generator->GenerateFloor(RunSeed, CurrentFloor) : TArray<FGeneratedRoom>();
}

void URoguelikeRunSubsystem::EndRun(bool bCleared)
{
	bRunActive = false;
	AcquiredBoons.Empty(); // lose boons; shards + talents persist
	OnRunEnded.Broadcast(bCleared);
}

// ---------------------------------------------------------------- boons ---------------

float URoguelikeRunSubsystem::RarityWeight(EBoonRarity Rarity) const
{
	switch (Rarity)
	{
		case EBoonRarity::Common: return 60.f;
		case EBoonRarity::Rare: return 25.f;
		case EBoonRarity::Epic: return 12.f;
		case EBoonRarity::Legendary: return 3.f;
		default: return 1.f;
	}
}

TArray<FName> URoguelikeRunSubsystem::OfferBoons()
{
	TArray<FName> Offered;
	if (!BoonTable)
	{
		return Offered;
	}

	// Build the eligible pool (exclude boons already at MaxLevel).
	TArray<const FBoonDef*> Pool;
	BoonTable->ForeachRow<FBoonDef>(TEXT("Roguelike"), [&](const FName&, const FBoonDef& Def)
	{
		const int32* Level = AcquiredBoons.Find(Def.BoonID);
		if (!Level || *Level < Def.MaxLevel)
		{
			Pool.Add(&Def);
		}
	});

	FRandomStream Stream(RunSeed * 101 + CurrentFloor * 53 + AcquiredBoons.Num() * 7);
	for (int32 Pick = 0; Pick < BoonChoicesPerRoom && Pool.Num() > 0; ++Pick)
	{
		float Total = 0.f;
		for (const FBoonDef* Def : Pool)
		{
			Total += RarityWeight(Def->Rarity);
		}
		float Roll = Stream.FRandRange(0.f, Total);
		int32 ChosenIndex = 0;
		for (int32 Index = 0; Index < Pool.Num(); ++Index)
		{
			Roll -= RarityWeight(Pool[Index]->Rarity);
			if (Roll <= 0.f) { ChosenIndex = Index; break; }
		}
		Offered.Add(Pool[ChosenIndex]->BoonID);
		Pool.RemoveAt(ChosenIndex); // no dupes in one offer
	}

	OnBoonsOffered.Broadcast(Offered);
	return Offered;
}

void URoguelikeRunSubsystem::ChooseBoon(FName BoonID)
{
	if (!BoonTable || !BoonTable->FindRow<FBoonDef>(BoonID, TEXT("Roguelike")))
	{
		return;
	}
	const int32 NewLevel = ++AcquiredBoons.FindOrAdd(BoonID);
	OnBoonAcquired.Broadcast(BoonID, NewLevel);
	ResolveSynergies(BoonID);
}

void URoguelikeRunSubsystem::ResolveSynergies(FName JustAcquired)
{
	const FBoonDef* Def = BoonTable->FindRow<FBoonDef>(JustAcquired, TEXT("Roguelike"));
	if (!Def || Def->SynergyBoonID.IsNone())
	{
		return;
	}
	// If all synergy partners are owned, grant the synergy boon once.
	for (const FName& Partner : Def->SynergyPartners)
	{
		if (!AcquiredBoons.Contains(Partner))
		{
			return;
		}
	}
	if (!AcquiredBoons.Contains(Def->SynergyBoonID))
	{
		const int32 Level = ++AcquiredBoons.FindOrAdd(Def->SynergyBoonID);
		OnBoonAcquired.Broadcast(Def->SynergyBoonID, Level);
	}
}

int32 URoguelikeRunSubsystem::GetBoonLevel(FName BoonID) const
{
	const int32* Level = AcquiredBoons.Find(BoonID);
	return Level ? *Level : 0;
}

float URoguelikeRunSubsystem::GetBoonMagnitude(FName BoonID) const
{
	const int32 Level = GetBoonLevel(BoonID);
	if (Level <= 0 || !BoonTable)
	{
		return 0.f;
	}
	const FBoonDef* Def = BoonTable->FindRow<FBoonDef>(BoonID, TEXT("Roguelike"));
	return Def ? Def->MagnitudePerLevel * Level : 0.f;
}

TArray<FName> URoguelikeRunSubsystem::GetAcquiredBoons() const
{
	TArray<FName> Result;
	AcquiredBoons.GenerateKeyArray(Result);
	return Result;
}

// ---------------------------------------------------------------- currency ------------

bool URoguelikeRunSubsystem::SpendShards(int32 Amount)
{
	if (Amount <= 0 || AbyssalShards < Amount)
	{
		return false;
	}
	AbyssalShards -= Amount;
	return true;
}

bool URoguelikeRunSubsystem::BuyTalent(FName TalentID, int32 Cost)
{
	if (PurchasedTalents.Contains(TalentID) || !SpendShards(Cost))
	{
		return false;
	}
	PurchasedTalents.Add(TalentID);
	return true;
}
