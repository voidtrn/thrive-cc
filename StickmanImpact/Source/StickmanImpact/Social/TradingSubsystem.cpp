// Copyright StickmanImpact Project.

#include "TradingSubsystem.h"

// ---------------------------------------------------------------- market --------------

FGuid UTradingSubsystem::CreateListing(FName ItemID, int32 Quantity, int32 AskPrice, float DurationHours, bool bBuyOrder)
{
	if (!CanTrade() || !IsItemTradable(ItemID) || Quantity <= 0 || AskPrice <= 0)
	{
		return FGuid();
	}

	FMarketListing Listing;
	Listing.ListingID = FGuid::NewGuid();
	Listing.ItemID = ItemID;
	Listing.Quantity = Quantity;
	Listing.AskPrice = AskPrice;
	Listing.SellerName = TEXT("You");
	Listing.HoursRemaining = FMath::Clamp(DurationHours, 24.f, 72.f);
	Listing.bBuyOrder = bBuyOrder;
	Listings.Add(Listing);

	++TradesToday;
	// Listing fee is a currency sink — debit AskPrice * ListingFeeFraction at the wallet
	// call site (no wallet system here by design; the fee amount is the contract).
	return Listing.ListingID;
}

bool UTradingSubsystem::CancelListing(FGuid ListingID)
{
	return Listings.RemoveAll([&](const FMarketListing& Listing)
	{
		return Listing.ListingID == ListingID;
	}) > 0;
}

bool UTradingSubsystem::ExecutePurchase(FGuid ListingID, const FString& BuyerName)
{
	const int32 Index = Listings.IndexOfByPredicate([&](const FMarketListing& Listing)
	{
		return Listing.ListingID == ListingID;
	});
	if (Index == INDEX_NONE || !CanTrade())
	{
		return false;
	}

	const FMarketListing Listing = Listings[Index];
	Listings.RemoveAt(Index);
	++TradesToday;

	// Price history for the graph; tax (TradeTaxFraction) debits at the wallet call site.
	TArray<int32>& History = PriceHistory.FindOrAdd(Listing.ItemID);
	History.Add(Listing.AskPrice);
	if (History.Num() > 50)
	{
		History.RemoveAt(0);
	}

	OnListingSold.Broadcast(Listing.ItemID, Listing.AskPrice);
	return true;
}

TArray<FMarketListing> UTradingSubsystem::GetActiveListings(FName FilterItemID) const
{
	TArray<FMarketListing> Result;
	for (const FMarketListing& Listing : Listings)
	{
		if (FilterItemID.IsNone() || Listing.ItemID == FilterItemID)
		{
			Result.Add(Listing);
		}
	}
	return Result;
}

float UTradingSubsystem::GetAveragePrice(FName ItemID, int32 LastN) const
{
	const TArray<int32>* History = PriceHistory.Find(ItemID);
	if (!History || History->Num() == 0)
	{
		return 0.f;
	}
	const int32 Count = FMath::Min(LastN, History->Num());
	int64 Sum = 0;
	for (int32 Index = History->Num() - Count; Index < History->Num(); ++Index)
	{
		Sum += (*History)[Index];
	}
	return static_cast<float>(Sum) / Count;
}

void UTradingSubsystem::AdvanceGameHours(float Hours)
{
	if (Hours <= 0.f)
	{
		return;
	}
	for (int32 Index = Listings.Num() - 1; Index >= 0; --Index)
	{
		Listings[Index].HoursRemaining -= Hours;
		if (Listings[Index].HoursRemaining <= 0.f)
		{
			Listings.RemoveAt(Index); // expired (item returns at the inventory call site)
		}
	}
	// Daily counters roll over each 24 game-hours.
	DayAccumulator += Hours;
	if (DayAccumulator >= 24.f)
	{
		DayAccumulator = 0.f;
		TradesToday = 0;
		GiftsToday = 0;
	}
}

// ---------------------------------------------------------------- gates ---------------

void UTradingSubsystem::SetItemTradable(FName ItemID, bool bTradable)
{
	if (bTradable)
	{
		UntradableItems.Remove(ItemID);
	}
	else
	{
		UntradableItems.Add(ItemID);
	}
}

bool UTradingSubsystem::CanTrade() const
{
	return AccountAgeHours >= NewAccountTradeLockHours && TradesToday < DailyTradeLimit;
}

// ---------------------------------------------------------------- crafting ------------

void UTradingSubsystem::AddCraftingExp(int32 Amount)
{
	if (Amount <= 0 || Specialization == ECraftSpecialization::None)
	{
		return;
	}
	const int32 OldLevel = GetCraftLevel();
	CraftingExp += Amount;
	const int32 NewLevel = GetCraftLevel();
	if (NewLevel > OldLevel)
	{
		OnCraftSpecLevelUp.Broadcast(Specialization, NewLevel);
	}
}

int32 UTradingSubsystem::GetCraftLevel() const
{
	return 1 + CraftingExp / 500;
}

bool UTradingSubsystem::RollMasterpiece(ECraftSpecialization ForSpec)
{
	if (ForSpec != Specialization || Specialization == ECraftSpecialization::None)
	{
		return false;
	}
	const float Chance = 0.02f + 0.01f * (GetCraftLevel() - 1);
	return FMath::FRand() < FMath::Min(Chance, 0.25f);
}

// ---------------------------------------------------------------- gifts ---------------

bool UTradingSubsystem::SendGift(const FString& FriendName, FName ItemID)
{
	if (GiftsToday >= DailyGiftLimit || !IsItemTradable(ItemID) || FriendName.IsEmpty())
	{
		return false;
	}
	++GiftsToday;
	// Delivery is backend-side; locally the item debits at the inventory call site.
	return true;
}

// ---------------------------------------------------------------- save ----------------

void UTradingSubsystem::ExportSaveState(int32& OutCraftExp, uint8& OutSpec) const
{
	OutCraftExp = CraftingExp;
	OutSpec = static_cast<uint8>(Specialization);
}

void UTradingSubsystem::ImportSaveState(int32 InCraftExp, uint8 InSpec)
{
	CraftingExp = InCraftExp;
	Specialization = static_cast<ECraftSpecialization>(InSpec);
}
