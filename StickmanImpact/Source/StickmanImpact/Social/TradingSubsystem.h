// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "TradingSubsystem.generated.h"

UENUM(BlueprintType)
enum class ECraftSpecialization : uint8
{
	None,
	Weaponsmith,
	Alchemist,
	Enchanter,
	Furnisher
};

/** One market listing (the local order book the market UI shows). */
USTRUCT(BlueprintType)
struct FMarketListing
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Trade")
	FGuid ListingID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Trade")
	FName ItemID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Trade")
	int32 Quantity = 1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Trade")
	int32 AskPrice = 0;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Trade")
	FString SellerName;

	// Expiry in game-hours remaining (24/48/72h listings).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Trade")
	float HoursRemaining = 24.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Trade")
	bool bBuyOrder = false; // true = a request to buy at AskPrice
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnListingSold, FName, ItemID, int32, Price);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnCraftSpecLevelUp, ECraftSpecialization, Spec, int32, NewLevel);

/**
 * Player-economy model with the balance safeguards baked in — local-first like guild/PvP
 * (real player-to-player exchange + a shared order book require the backend service; the
 * model + sinks are what a backend mirrors).
 *
 * - **Market board**: list (with a listing fee — a sink), buy orders, expiry
 *   (`AdvanceGameHours`), per-item price history (`GetPriceHistory` averages for the
 *   graph). `ExecutePurchase` applies the trade tax (another sink).
 * - **Tradability**: `SetItemTradable` blacklist (quest/achievement/premium items are
 *   account-bound; enforced at listing time).
 * - **Anti-abuse throttles**: `DailyTradeLimit`, `NewAccountTradeLockHours` (both checked
 *   in CanTrade) — the flag/report pipeline is backend-side.
 * - **Crafting economy**: `ECraftSpecialization` levels from crafting
 *   (`AddCraftingExp`) with a masterpiece proc chance that grows with level
 *   (`RollMasterpiece`) — commissions/reputation are content over these numbers.
 * - **Gifts**: `SendGift` with a daily limit (delivery is backend; locally it debits and
 *   logs).
 */
UCLASS()
class STICKMANIMPACT_API UTradingSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	// --- Market board ---------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Trade")
	FGuid CreateListing(FName ItemID, int32 Quantity, int32 AskPrice, float DurationHours, bool bBuyOrder);

	UFUNCTION(BlueprintCallable, Category = "Trade")
	bool CancelListing(FGuid ListingID);

	// Buy an active listing: applies the trade tax, records price history.
	UFUNCTION(BlueprintCallable, Category = "Trade")
	bool ExecutePurchase(FGuid ListingID, const FString& BuyerName);

	UFUNCTION(BlueprintPure, Category = "Trade")
	TArray<FMarketListing> GetActiveListings(FName FilterItemID) const;

	// Rolling average sale prices (most recent LastN) for the price-history graph.
	UFUNCTION(BlueprintPure, Category = "Trade")
	float GetAveragePrice(FName ItemID, int32 LastN = 10) const;

	// Advance listing expiries (wire to the same game-hour tick as reputation decay).
	UFUNCTION(BlueprintCallable, Category = "Trade")
	void AdvanceGameHours(float Hours);

	// --- Tradability + throttles ----------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Trade")
	void SetItemTradable(FName ItemID, bool bTradable);

	UFUNCTION(BlueprintPure, Category = "Trade")
	bool IsItemTradable(FName ItemID) const { return !UntradableItems.Contains(ItemID); }

	UFUNCTION(BlueprintPure, Category = "Trade")
	bool CanTrade() const;

	UFUNCTION(BlueprintCallable, Category = "Trade")
	void SetAccountAgeHours(float Hours) { AccountAgeHours = Hours; }

	// --- Crafting specialization ----------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Trade")
	void SetSpecialization(ECraftSpecialization Spec) { Specialization = Spec; }

	UFUNCTION(BlueprintCallable, Category = "Trade")
	void AddCraftingExp(int32 Amount);

	UFUNCTION(BlueprintPure, Category = "Trade")
	int32 GetCraftLevel() const;

	// Masterpiece proc: base 2% + 1%/level, only within the chosen specialization.
	UFUNCTION(BlueprintCallable, Category = "Trade")
	bool RollMasterpiece(ECraftSpecialization ForSpec);

	// --- Gifts ----------------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Trade")
	bool SendGift(const FString& FriendName, FName ItemID);

	// --- Tunables (the sinks) -------------------------------------------------------------

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Trade")
	float ListingFeeFraction = 0.02f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Trade")
	float TradeTaxFraction = 0.05f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Trade")
	int32 DailyTradeLimit = 20;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Trade")
	float NewAccountTradeLockHours = 48.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Trade")
	int32 DailyGiftLimit = 3;

	UPROPERTY(BlueprintAssignable, Category = "Trade")
	FOnListingSold OnListingSold;

	UPROPERTY(BlueprintAssignable, Category = "Trade")
	FOnCraftSpecLevelUp OnCraftSpecLevelUp;

	// Save hooks (not yet in the binary format — see README).
	void ExportSaveState(int32& OutCraftExp, uint8& OutSpec) const;
	void ImportSaveState(int32 InCraftExp, uint8 InSpec);

private:
	TArray<FMarketListing> Listings;
	TMap<FName, TArray<int32>> PriceHistory;
	TSet<FName> UntradableItems;

	int32 TradesToday = 0;
	int32 GiftsToday = 0;
	float AccountAgeHours = 9999.f;
	float DayAccumulator = 0.f;

	ECraftSpecialization Specialization = ECraftSpecialization::None;
	int32 CraftingExp = 0;
};
