// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "InventoryManager.generated.h"

class UTexture2D;

UENUM(BlueprintType)
enum class EInventoryCategory : uint8
{
	Weapons,
	Artifacts,
	Materials,
	Consumables,
	QuestItems
};

UENUM(BlueprintType)
enum class EInventorySortMode : uint8
{
	ByRarity,
	ByName,
	ByCount,
	ByNewest
};

/** One inventory stack. Weapons/artifacts store their full data elsewhere (UEquipmentManager /
 * future per-instance storage) — this row is the countable/browsable representation. */
USTRUCT(BlueprintType)
struct FInventoryItem
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Item")
	FName ItemID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Item")
	FText DisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Item")
	FText Description;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Item")
	EInventoryCategory Category = EInventoryCategory::Materials;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Item", meta = (ClampMin = "1", ClampMax = "5"))
	int32 Rarity = 1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Item")
	int32 Count = 1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Item")
	TObjectPtr<UTexture2D> Icon;

	// True until the player first views it in the inventory screen ("new item" highlight).
	UPROPERTY(BlueprintReadWrite, Category = "Item")
	bool bIsNew = true;

	// Monotonic acquisition order, for ByNewest sorting.
	UPROPERTY(BlueprintReadOnly, Category = "Item")
	int32 AcquiredSequence = 0;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnInventoryItemChanged, FName, ItemID, int32, NewCount);

/**
 * Backing store for the inventory screen and every system that grants/consumes items
 * (quest rewards, chest rewards, resource gathering, ascension materials). Closes the
 * "rewards are logged only" gap noted in earlier phases — wire GrantReward paths to AddItem.
 */
UCLASS()
class STICKMANIMPACT_API UInventoryManager : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Inventory")
	void AddItem(const FInventoryItem& ItemTemplate, int32 Count = 1);

	UFUNCTION(BlueprintCallable, Category = "Inventory")
	bool RemoveItem(FName ItemID, int32 Count = 1);

	UFUNCTION(BlueprintPure, Category = "Inventory")
	int32 GetItemCount(FName ItemID) const;

	UFUNCTION(BlueprintPure, Category = "Inventory")
	TArray<FInventoryItem> GetItemsByCategory(EInventoryCategory Category, EInventorySortMode SortMode) const;

	UFUNCTION(BlueprintCallable, Category = "Inventory")
	void MarkItemSeen(FName ItemID);

	// True if every entry in Requirements (ItemID -> count) is present — for ascension checks.
	UFUNCTION(BlueprintPure, Category = "Inventory")
	bool HasItems(const TMap<FName, int32>& Requirements) const;

	UFUNCTION(BlueprintCallable, Category = "Inventory")
	bool ConsumeItems(const TMap<FName, int32>& Requirements);

	UPROPERTY(BlueprintAssignable, Category = "Inventory")
	FOnInventoryItemChanged OnItemChanged;

	// --- Save/load -----------------------------------------------------------
	TArray<FInventoryItem> ExportItems() const;
	void ImportItems(const TArray<FInventoryItem>& SavedItems);

private:
	UPROPERTY()
	TMap<FName, FInventoryItem> Items;

	int32 NextAcquiredSequence = 0;
};
