// Copyright StickmanImpact Project.

#include "RealmSubsystem.h"

void URealmSubsystem::UnlockLayout(ERealmLayout Layout)
{
	bool bAlready = false;
	UnlockedLayouts.Add(Layout, &bAlready);
	if (!bAlready)
	{
		OnRealmLayoutUnlocked.Broadcast(Layout);
	}
}

bool URealmSubsystem::SetActiveLayout(ERealmLayout Layout)
{
	if (!UnlockedLayouts.Contains(Layout))
	{
		return false;
	}
	ActiveLayout = Layout;
	return true;
}

// ---------------------------------------------------------------- placement -----------

int32 URealmSubsystem::AddPlacedFurniture(const FPlacedFurniture& Piece)
{
	const int32 Index = PlacedFurniture.Add(Piece);
	RecalculateEnergy();
	return Index;
}

void URealmSubsystem::RemovePlacedFurniture(int32 Index)
{
	if (PlacedFurniture.IsValidIndex(Index))
	{
		PlacedFurniture.RemoveAt(Index);
		RecalculateEnergy();
	}
}

void URealmSubsystem::RecalculateEnergy()
{
	int32 Energy = 0;
	TMap<FName, int32> SetCounts;
	TMap<FName, int32> SetTotals;

	if (FurnitureTable)
	{
		// Precount how many pieces each set has (for the full-set check).
		FurnitureTable->ForeachRow<FFurnitureDef>(TEXT("Realm"), [&](const FName&, const FFurnitureDef& Def)
		{
			if (!Def.SetID.IsNone())
			{
				SetTotals.FindOrAdd(Def.SetID)++;
			}
		});

		for (const FPlacedFurniture& Piece : PlacedFurniture)
		{
			if (const FFurnitureDef* Def = FurnitureTable->FindRow<FFurnitureDef>(Piece.FurnitureID, TEXT("Realm")))
			{
				Energy += Def->RealmEnergy;
				if (!Def->SetID.IsNone())
				{
					SetCounts.FindOrAdd(Def->SetID)++;
				}
			}
		}

		// Full-set bonuses.
		for (const TPair<FName, int32>& Pair : SetCounts)
		{
			const int32* Total = SetTotals.Find(Pair.Key);
			if (Total && Pair.Value >= *Total)
			{
				Energy += FullSetBonusEnergy;
			}
		}
	}

	if (Energy != RealmEnergy)
	{
		RealmEnergy = Energy;
		OnRealmEnergyChanged.Broadcast(RealmEnergy);
	}
}

int32 URealmSubsystem::GetComfortLevel() const
{
	// Comfort tracks placed decoration density + energy tier.
	return GetUnlockedBenefitTier() * 2 + PlacedFurniture.Num() / 10;
}

int32 URealmSubsystem::GetUnlockedBenefitTier() const
{
	int32 Tier = 0;
	for (int32 Index = 0; Index < EnergyThresholds.Num(); ++Index)
	{
		if (RealmEnergy >= EnergyThresholds[Index])
		{
			Tier = Index + 1;
		}
	}
	return Tier;
}

// ---------------------------------------------------------------- gardening -----------

int32 URealmSubsystem::PlantSeed(FVector Location, FName SeedID, FName TraitTag)
{
	FGardenPlot Plot;
	Plot.Location = Location;
	Plot.SeedID = SeedID;
	Plot.TraitTag = TraitTag;
	return GardenPlots.Add(Plot);
}

void URealmSubsystem::AdvanceGardens(float GrowthDelta)
{
	for (FGardenPlot& Plot : GardenPlots)
	{
		if (Plot.SeedID.IsNone())
		{
			continue;
		}
		Plot.Growth = FMath::Min(Plot.Growth + GrowthDelta, 1.f);
	}

	// Cross-breed: adjacent mature plots with different traits produce a hybrid trait on the
	// first, seeding future flower colors.
	for (int32 A = 0; A < GardenPlots.Num(); ++A)
	{
		if (GardenPlots[A].Growth < 1.f)
		{
			continue;
		}
		for (int32 B = A + 1; B < GardenPlots.Num(); ++B)
		{
			if (GardenPlots[B].Growth >= 1.f
				&& GardenPlots[A].TraitTag != GardenPlots[B].TraitTag
				&& FVector::Dist(GardenPlots[A].Location, GardenPlots[B].Location) <= CrossBreedDistance)
			{
				GardenPlots[A].TraitTag = FName(*(GardenPlots[A].TraitTag.ToString() + TEXT("x") + GardenPlots[B].TraitTag.ToString()));
			}
		}
	}
}

bool URealmSubsystem::HarvestPlot(int32 PlotIndex, FName& OutSeedID)
{
	if (!GardenPlots.IsValidIndex(PlotIndex) || GardenPlots[PlotIndex].Growth < 1.f)
	{
		return false;
	}
	OutSeedID = GardenPlots[PlotIndex].SeedID;
	GardenPlots[PlotIndex].Growth = 0.f; // replantable plot
	GardenPlots[PlotIndex].SeedID = NAME_None;
	return true;
}

// ---------------------------------------------------------------- save ----------------

void URealmSubsystem::ExportSaveState(TArray<FPlacedFurniture>& OutFurniture, TArray<FGardenPlot>& OutGardens, ERealmLayout& OutLayout) const
{
	OutFurniture = PlacedFurniture;
	OutGardens = GardenPlots;
	OutLayout = ActiveLayout;
}

void URealmSubsystem::ImportSaveState(const TArray<FPlacedFurniture>& InFurniture, const TArray<FGardenPlot>& InGardens, ERealmLayout InLayout)
{
	PlacedFurniture = InFurniture;
	GardenPlots = InGardens;
	ActiveLayout = InLayout;
	UnlockedLayouts.Add(InLayout);
	RecalculateEnergy();
}
