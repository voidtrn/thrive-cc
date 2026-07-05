#include "System/ShopComponent.h"
#include "System/OpenWorldGameInstance.h"
#include "MyGame.h"

void UShopComponent::BeginPlay()
{
	Super::BeginPlay();
	GI = GetOwner() ? GetOwner()->GetGameInstance<UOpenWorldGameInstance>() : nullptr;
	ResetStock();
}

void UShopComponent::ResetStock()
{
	RuntimeStock.Reset();
	if (!ShopTable)
	{
		return;
	}
	for (const FName& RowName : ShopTable->GetRowNames())
	{
		if (const FShopItemRow* Row = ShopTable->FindRow<FShopItemRow>(RowName, TEXT("Shop")))
		{
			RuntimeStock.Add(Row->ItemId, Row->Stock);
		}
	}
}

int32 UShopComponent::GetRemainingStock(FName ItemId) const
{
	const int32* Stock = RuntimeStock.Find(ItemId);
	return Stock ? *Stock : 0;
}

int32 UShopComponent::GetCurrency(EShopCurrency Currency) const
{
	if (!GI)
	{
		return 0;
	}
	switch (Currency)
	{
	case EShopCurrency::Mora:        return GI->Mora;
	case EShopCurrency::Primogem:    return GI->Primogems;
	case EShopCurrency::Starglitter: return GI->Starglitter;
	case EShopCurrency::Stardust:    return GI->Stardust;
	}
	return 0;
}

bool UShopComponent::SpendCurrency(EShopCurrency Currency, int32 Amount)
{
	if (!GI || GetCurrency(Currency) < Amount)
	{
		return false;
	}
	switch (Currency)
	{
	case EShopCurrency::Mora:        GI->Mora -= Amount; break;
	case EShopCurrency::Primogem:    GI->Primogems -= Amount; break;
	case EShopCurrency::Starglitter: GI->Starglitter -= Amount; break;
	case EShopCurrency::Stardust:    GI->Stardust -= Amount; break;
	}
	return true;
}

bool UShopComponent::BuyItem(FName ItemId, int32 Quantity)
{
	if (!GI || !ShopTable || Quantity <= 0)
	{
		return false;
	}

	// Cari baris shop untuk ItemId
	const FShopItemRow* Found = nullptr;
	for (const FName& RowName : ShopTable->GetRowNames())
	{
		const FShopItemRow* Row = ShopTable->FindRow<FShopItemRow>(RowName, TEXT("Shop"));
		if (Row && Row->ItemId == ItemId)
		{
			Found = Row;
			break;
		}
	}
	if (!Found)
	{
		return false;
	}

	// Stok
	int32& Stock = RuntimeStock.FindOrAdd(ItemId);
	if (Stock >= 0 && Stock < Quantity)
	{
		return false;
	}

	// Bayar
	const int32 TotalPrice = Found->Price * Quantity;
	if (!SpendCurrency(Found->Currency, TotalPrice))
	{
		return false;
	}

	// Serahkan barang
	GI->InventoryItems.FindOrAdd(ItemId) += Quantity;
	if (Stock >= 0)
	{
		Stock -= Quantity;
	}

	OnTransaction.Broadcast(ItemId, true);
	UE_LOG(LogAetherRealm, Log, TEXT("Bought %dx %s"), Quantity, *ItemId.ToString());
	return true;
}

bool UShopComponent::SellItem(FName ItemId, int32 Quantity, int32 UnitMoraValue)
{
	if (!GI || Quantity <= 0)
	{
		return false;
	}

	int32* Have = GI->InventoryItems.Find(ItemId);
	if (!Have || *Have < Quantity)
	{
		return false;
	}

	*Have -= Quantity;
	if (*Have <= 0)
	{
		GI->InventoryItems.Remove(ItemId);
	}

	GI->Mora += FMath::RoundToInt(UnitMoraValue * SellRatio) * Quantity;

	OnTransaction.Broadcast(ItemId, false);
	return true;
}
