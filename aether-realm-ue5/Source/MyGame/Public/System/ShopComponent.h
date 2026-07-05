#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "Engine/DataTable.h"
#include "ShopComponent.generated.h"

class UOpenWorldGameInstance;

UENUM(BlueprintType)
enum class EShopCurrency : uint8
{
	Mora,
	Primogem,
	Starglitter,
	Stardust
};

/** Row DT_Shop_* — barang dagangan merchant. */
USTRUCT(BlueprintType)
struct FShopItemRow : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FName ItemId;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	int32 Price = 100;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	EShopCurrency Currency = EShopCurrency::Mora;

	/** Stok per reset. -1 = tak terbatas. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	int32 Stock = -1;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnShopTransaction, FName, ItemId, bool, bBuy);

/**
 * Merchant. Pasang di BP_NPC_Merchant, assign ShopTable.
 * Buy: cek currency → bayar → tambah item → kurangi stok.
 * Sell: tambah currency (SellRatio × price mora) → kurangi item.
 * Stok tersimpan runtime (reset harian via ResetStock dari BP daily).
 */
UCLASS(ClassGroup = (Gameplay), meta = (BlueprintSpawnableComponent))
class MYGAME_API UShopComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Shop")
	bool BuyItem(FName ItemId, int32 Quantity = 1);

	/** Jual item dari inventory (dapat Mora). */
	UFUNCTION(BlueprintCallable, Category = "Shop")
	bool SellItem(FName ItemId, int32 Quantity, int32 UnitMoraValue);

	UFUNCTION(BlueprintPure, Category = "Shop")
	int32 GetRemainingStock(FName ItemId) const;

	UFUNCTION(BlueprintCallable, Category = "Shop")
	void ResetStock();

	UPROPERTY(BlueprintAssignable, Category = "Shop")
	FOnShopTransaction OnTransaction;

protected:
	virtual void BeginPlay() override;

	UPROPERTY(EditDefaultsOnly, Category = "Shop")
	TObjectPtr<UDataTable> ShopTable;

	/** Fraksi harga saat menjual (0.3 = 30%). */
	UPROPERTY(EditDefaultsOnly, Category = "Shop")
	float SellRatio = 0.3f;

private:
	UPROPERTY()
	TObjectPtr<UOpenWorldGameInstance> GI;

	/** Sisa stok runtime (ItemId → count). */
	TMap<FName, int32> RuntimeStock;

	bool SpendCurrency(EShopCurrency Currency, int32 Amount);
	int32 GetCurrency(EShopCurrency Currency) const;
};
