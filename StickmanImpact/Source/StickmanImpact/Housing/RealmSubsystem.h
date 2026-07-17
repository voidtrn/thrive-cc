// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "HousingTypes.h"
#include "RealmSubsystem.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnRealmEnergyChanged, int32, NewEnergy);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnRealmLayoutUnlocked, ERealmLayout, Layout);

/**
 * Owns the "Serenitea Realm" pocket-dimension state: unlocked layouts, the active layout, the
 * placed-furniture list (the authoritative save data — the build component edits it and spawns
 * actors from it), realm energy (sum of placed pieces' energy + full-set bonuses) and its
 * benefit thresholds, comfort level (drives NPC visitor frequency), and gardening plots.
 *
 * The build/edit UX lives in UHousingBuildComponent; this subsystem is the model + benefits.
 * Realm-energy thresholds unlock open-world perks (stamina regen, crafting speed, realm shop,
 * a second layout slot) — `GetActiveEnergyBenefits` returns which are active. Companion
 * visitors / realm events are content that reads comfort + placed sets.
 */
UCLASS()
class STICKMANIMPACT_API URealmSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Realm")
	void SetFurnitureTable(UDataTable* Table) { FurnitureTable = Table; }

	// --- Layouts --------------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Realm")
	void UnlockLayout(ERealmLayout Layout);

	UFUNCTION(BlueprintPure, Category = "Realm")
	bool IsLayoutUnlocked(ERealmLayout Layout) const { return UnlockedLayouts.Contains(Layout); }

	UFUNCTION(BlueprintCallable, Category = "Realm")
	bool SetActiveLayout(ERealmLayout Layout);

	UFUNCTION(BlueprintPure, Category = "Realm")
	ERealmLayout GetActiveLayout() const { return ActiveLayout; }

	// --- Placement model (edited by UHousingBuildComponent) -------------------------------

	UFUNCTION(BlueprintCallable, Category = "Realm")
	int32 AddPlacedFurniture(const FPlacedFurniture& Piece);

	UFUNCTION(BlueprintCallable, Category = "Realm")
	void RemovePlacedFurniture(int32 Index);

	UFUNCTION(BlueprintPure, Category = "Realm")
	const TArray<FPlacedFurniture>& GetPlacedFurniture() const { return PlacedFurniture; }

	// --- Realm energy + benefits ----------------------------------------------------------

	UFUNCTION(BlueprintPure, Category = "Realm")
	int32 GetRealmEnergy() const { return RealmEnergy; }

	UFUNCTION(BlueprintPure, Category = "Realm")
	int32 GetComfortLevel() const;

	// Which energy-threshold benefits are currently active (thresholds in EnergyThresholds).
	UFUNCTION(BlueprintPure, Category = "Realm")
	int32 GetUnlockedBenefitTier() const;

	// --- Gardening ------------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Realm")
	int32 PlantSeed(FVector Location, FName SeedID, FName TraitTag);

	// Advance all plots (call on day rollover or a timer). Cross-breeds adjacent mature plots.
	UFUNCTION(BlueprintCallable, Category = "Realm")
	void AdvanceGardens(float GrowthDelta);

	UFUNCTION(BlueprintCallable, Category = "Realm")
	bool HarvestPlot(int32 PlotIndex, FName& OutSeedID);

	UFUNCTION(BlueprintPure, Category = "Realm")
	const TArray<FGardenPlot>& GetGardenPlots() const { return GardenPlots; }

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Realm")
	TArray<int32> EnergyThresholds = { 500, 1500, 3000, 5000 };

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Realm")
	int32 FullSetBonusEnergy = 100;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Realm")
	float CrossBreedDistance = 200.f;

	UPROPERTY(BlueprintAssignable, Category = "Realm")
	FOnRealmEnergyChanged OnRealmEnergyChanged;

	UPROPERTY(BlueprintAssignable, Category = "Realm")
	FOnRealmLayoutUnlocked OnRealmLayoutUnlocked;

	// Save hooks (not yet in the binary format — see README).
	void ExportSaveState(TArray<FPlacedFurniture>& OutFurniture, TArray<FGardenPlot>& OutGardens, ERealmLayout& OutLayout) const;
	void ImportSaveState(const TArray<FPlacedFurniture>& InFurniture, const TArray<FGardenPlot>& InGardens, ERealmLayout InLayout);

private:
	void RecalculateEnergy();

	UPROPERTY()
	TObjectPtr<UDataTable> FurnitureTable;

	TSet<ERealmLayout> UnlockedLayouts;
	ERealmLayout ActiveLayout = ERealmLayout::EmeraldForest;
	TArray<FPlacedFurniture> PlacedFurniture;
	TArray<FGardenPlot> GardenPlots;
	int32 RealmEnergy = 0;
};
