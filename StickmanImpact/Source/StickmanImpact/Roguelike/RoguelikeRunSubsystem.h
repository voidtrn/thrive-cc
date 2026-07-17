// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "RoguelikeTypes.h"
#include "RoguelikeRunSubsystem.generated.h"

class UDungeonGenerator;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnBoonsOffered, const TArray<FName>&, BoonIDs);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnBoonAcquired, FName, BoonID, int32, NewLevel);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnFloorChanged, int32, FloorNumber);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnRunEnded, bool, bCleared);

/**
 * Owns a roguelike "Abyss Domain" run: seed, current floor/room, the generated layout, the
 * acquired boons (stacking to upgrade + synergy resolution), Abyssal Shards currency, and the
 * cross-run persistence (Abyss Talent Tree + starting-buff choice). A run ends on death (keep
 * shards, lose boons) or clearing floor 12.
 *
 * Boon flow: `OfferBoons()` rolls 3 (rarity-weighted, from the boon DataTable, excluding
 * maxed ones) → `OnBoonsOffered`; `ChooseBoon(id)` stacks it (grants its EffectTag/GE) and
 * resolves synergies. `GetBoonLevel`/`GetBoonMagnitude` are what combat/defense systems read.
 * Shards: `AddShards` from room clears; `SpendShards` at shop/revive.
 */
UCLASS()
class STICKMANIMPACT_API URoguelikeRunSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;

	UFUNCTION(BlueprintCallable, Category = "Roguelike")
	void SetBoonTable(UDataTable* Table) { BoonTable = Table; }

	// --- Run lifecycle --------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Roguelike")
	void StartRun(int32 Seed);

	UFUNCTION(BlueprintCallable, Category = "Roguelike")
	TArray<FGeneratedRoom> AdvanceFloor();

	UFUNCTION(BlueprintCallable, Category = "Roguelike")
	void EndRun(bool bCleared);

	UFUNCTION(BlueprintPure, Category = "Roguelike")
	int32 GetCurrentFloor() const { return CurrentFloor; }

	UFUNCTION(BlueprintPure, Category = "Roguelike")
	int32 GetSeed() const { return RunSeed; }

	// --- Boons ----------------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Roguelike")
	TArray<FName> OfferBoons();

	UFUNCTION(BlueprintCallable, Category = "Roguelike")
	void ChooseBoon(FName BoonID);

	UFUNCTION(BlueprintPure, Category = "Roguelike")
	int32 GetBoonLevel(FName BoonID) const;

	// Summed magnitude for a boon across its stacked levels (0 if not owned).
	UFUNCTION(BlueprintPure, Category = "Roguelike")
	float GetBoonMagnitude(FName BoonID) const;

	UFUNCTION(BlueprintPure, Category = "Roguelike")
	TArray<FName> GetAcquiredBoons() const;

	// --- Currency + persistence -----------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Roguelike")
	void AddShards(int32 Amount) { AbyssalShards += FMath::Max(Amount, 0); }

	UFUNCTION(BlueprintCallable, Category = "Roguelike")
	bool SpendShards(int32 Amount);

	UFUNCTION(BlueprintPure, Category = "Roguelike")
	int32 GetShards() const { return AbyssalShards; }

	// Permanent talent purchased with shards (persists across runs).
	UFUNCTION(BlueprintCallable, Category = "Roguelike")
	bool BuyTalent(FName TalentID, int32 Cost);

	UFUNCTION(BlueprintPure, Category = "Roguelike")
	bool HasTalent(FName TalentID) const { return PurchasedTalents.Contains(TalentID); }

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Roguelike")
	int32 BoonChoicesPerRoom = 3;

	UPROPERTY(BlueprintAssignable, Category = "Roguelike")
	FOnBoonsOffered OnBoonsOffered;

	UPROPERTY(BlueprintAssignable, Category = "Roguelike")
	FOnBoonAcquired OnBoonAcquired;

	UPROPERTY(BlueprintAssignable, Category = "Roguelike")
	FOnFloorChanged OnFloorChanged;

	UPROPERTY(BlueprintAssignable, Category = "Roguelike")
	FOnRunEnded OnRunEnded;

	// Save hooks — shards + talents persist; boons are run-scoped (not saved). Not yet in the
	// binary save format.
	void ExportSaveState(int32& OutShards, TArray<FName>& OutTalents) const { OutShards = AbyssalShards; OutTalents = PurchasedTalents.Array(); }
	void ImportSaveState(int32 InShards, const TArray<FName>& InTalents) { AbyssalShards = InShards; PurchasedTalents = TSet<FName>(InTalents); }

private:
	void ResolveSynergies(FName JustAcquired);
	float RarityWeight(EBoonRarity Rarity) const;

	UPROPERTY()
	TObjectPtr<UDungeonGenerator> Generator;

	UPROPERTY()
	TObjectPtr<UDataTable> BoonTable;

	int32 RunSeed = 0;
	int32 CurrentFloor = 0;
	bool bRunActive = false;

	TMap<FName, int32> AcquiredBoons; // BoonID -> level
	int32 AbyssalShards = 0;
	TSet<FName> PurchasedTalents;
};
