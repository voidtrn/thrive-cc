// Copyright StickmanImpact Project.

#include "InventoryManager.h"

void UInventoryManager::AddItem(const FInventoryItem& ItemTemplate, int32 Count)
{
	if (ItemTemplate.ItemID.IsNone() || Count <= 0)
	{
		return;
	}

	if (FInventoryItem* Existing = Items.Find(ItemTemplate.ItemID))
	{
		Existing->Count += Count;
		OnItemChanged.Broadcast(ItemTemplate.ItemID, Existing->Count);
		return;
	}

	FInventoryItem NewItem = ItemTemplate;
	NewItem.Count = Count;
	NewItem.bIsNew = true;
	NewItem.AcquiredSequence = NextAcquiredSequence++;
	Items.Add(NewItem.ItemID, NewItem);
	OnItemChanged.Broadcast(NewItem.ItemID, Count);
}

bool UInventoryManager::RemoveItem(FName ItemID, int32 Count)
{
	FInventoryItem* Existing = Items.Find(ItemID);
	if (!Existing || Existing->Count < Count || Count <= 0)
	{
		return false;
	}

	Existing->Count -= Count;
	const int32 NewCount = Existing->Count;
	if (NewCount <= 0)
	{
		Items.Remove(ItemID);
	}
	OnItemChanged.Broadcast(ItemID, NewCount);
	return true;
}

int32 UInventoryManager::GetItemCount(FName ItemID) const
{
	const FInventoryItem* Existing = Items.Find(ItemID);
	return Existing ? Existing->Count : 0;
}

TArray<FInventoryItem> UInventoryManager::GetItemsByCategory(EInventoryCategory Category,
	EInventorySortMode SortMode) const
{
	TArray<FInventoryItem> Result;
	for (const auto& Pair : Items)
	{
		if (Pair.Value.Category == Category)
		{
			Result.Add(Pair.Value);
		}
	}

	switch (SortMode)
	{
		case EInventorySortMode::ByRarity:
			Result.Sort([](const FInventoryItem& A, const FInventoryItem& B) { return A.Rarity > B.Rarity; });
			break;
		case EInventorySortMode::ByName:
			Result.Sort([](const FInventoryItem& A, const FInventoryItem& B)
			{
				return A.DisplayName.ToString() < B.DisplayName.ToString();
			});
			break;
		case EInventorySortMode::ByCount:
			Result.Sort([](const FInventoryItem& A, const FInventoryItem& B) { return A.Count > B.Count; });
			break;
		case EInventorySortMode::ByNewest:
			Result.Sort([](const FInventoryItem& A, const FInventoryItem& B)
			{
				return A.AcquiredSequence > B.AcquiredSequence;
			});
			break;
	}
	return Result;
}

void UInventoryManager::MarkItemSeen(FName ItemID)
{
	if (FInventoryItem* Existing = Items.Find(ItemID))
	{
		Existing->bIsNew = false;
	}
}

bool UInventoryManager::HasItems(const TMap<FName, int32>& Requirements) const
{
	for (const auto& Pair : Requirements)
	{
		if (GetItemCount(Pair.Key) < Pair.Value)
		{
			return false;
		}
	}
	return true;
}

bool UInventoryManager::ConsumeItems(const TMap<FName, int32>& Requirements)
{
	if (!HasItems(Requirements))
	{
		return false;
	}
	for (const auto& Pair : Requirements)
	{
		RemoveItem(Pair.Key, Pair.Value);
	}
	return true;
}
