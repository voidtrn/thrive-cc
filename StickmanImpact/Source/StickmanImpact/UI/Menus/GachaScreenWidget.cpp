// Copyright StickmanImpact Project.

#include "GachaScreenWidget.h"
#include "Components/Image.h"
#include "Components/TextBlock.h"
#include "Components/Button.h"
#include "Engine/DataTable.h"
#include "Data/InventoryManager.h"

void UGachaScreenWidget::NativeConstruct()
{
	Super::NativeConstruct();

	if (WishOneButton) WishOneButton->OnClicked.AddDynamic(this, &UGachaScreenWidget::OnWishOneClicked);
	if (WishTenButton) WishTenButton->OnClicked.AddDynamic(this, &UGachaScreenWidget::OnWishTenClicked);
	if (BannerImage && BannerArt)
	{
		BannerImage->SetBrushFromTexture(BannerArt);
	}
	RefreshPityText();
}

FGachaPoolEntry UGachaScreenWidget::PickRandomOfRarity(int32 Rarity) const
{
	TArray<FGachaPoolEntry> Candidates;
	if (BannerPoolTable)
	{
		BannerPoolTable->ForeachRow<FGachaPoolEntry>(TEXT("GachaPick"),
			[&Candidates, Rarity](const FName&, const FGachaPoolEntry& Row)
		{
			if (Row.Rarity == Rarity)
			{
				Candidates.Add(Row);
			}
		});
	}
	if (Candidates.Num() == 0)
	{
		// Empty pool for this rarity — degrade to a labeled placeholder instead of crashing.
		FGachaPoolEntry Fallback;
		Fallback.ItemID = TEXT("MissingPoolEntry");
		Fallback.DisplayName = NSLOCTEXT("Gacha", "Missing", "??? (banner pool has no entry of this rarity)");
		Fallback.Rarity = Rarity;
		return Fallback;
	}
	return Candidates[FMath::RandRange(0, Candidates.Num() - 1)];
}

FGachaPoolEntry UGachaScreenWidget::RollOnce()
{
	++PityCounter5Star;
	++PityCounter4Star;

	// Soft pity: 5★ chance ramps steeply from SoftPityStart to hard-guarantee at HardPity5Star.
	float Rate5 = Base5StarRate;
	if (PityCounter5Star > SoftPityStart)
	{
		Rate5 += (PityCounter5Star - SoftPityStart) * 0.06f;
	}

	const float Roll = FMath::FRand();
	int32 ResultRarity = 3;
	if (PityCounter5Star >= HardPity5Star || Roll < Rate5)
	{
		ResultRarity = 5;
		PityCounter5Star = 0;
		PityCounter4Star = 0;
	}
	else if (PityCounter4Star >= 10 || Roll < Rate5 + Base4StarRate)
	{
		ResultRarity = 4;
		PityCounter4Star = 0;
	}

	return PickRandomOfRarity(ResultRarity);
}

void UGachaScreenWidget::DepositResult(const FGachaPoolEntry& Result)
{
	if (const UGameInstance* GameInstance = GetGameInstance())
	{
		if (UInventoryManager* Inventory = GameInstance->GetSubsystem<UInventoryManager>())
		{
			FInventoryItem Item;
			Item.ItemID = Result.ItemID;
			Item.DisplayName = Result.DisplayName;
			Item.Rarity = Result.Rarity;
			Item.Category = Result.bIsCharacter ? EInventoryCategory::Consumables : EInventoryCategory::Weapons;
			Inventory->AddItem(Item, 1);
			// Characters: an owned-characters roster (feeding UPartyManager::AddPartyMember)
			// is the proper destination — deposited as an inventory token until that exists.
		}
	}
}

void UGachaScreenWidget::WishOne()
{
	const FGachaPoolEntry Result = RollOnce();
	DepositResult(Result);
	RevealQueue.Add(Result);
	RefreshPityText();
	AdvanceRevealQueue();
}

void UGachaScreenWidget::WishTen()
{
	for (int32 Index = 0; Index < 10; ++Index)
	{
		const FGachaPoolEntry Result = RollOnce();
		DepositResult(Result);
		RevealQueue.Add(Result);
	}
	RefreshPityText();
	AdvanceRevealQueue();
}

void UGachaScreenWidget::AdvanceRevealQueue()
{
	if (RevealQueue.Num() == 0)
	{
		return;
	}
	const FGachaPoolEntry Next = RevealQueue[0];
	RevealQueue.RemoveAt(0);
	// The WBP listens, plays its reveal animation (gold flash for 5★ etc.), then calls
	// AdvanceRevealQueue() again to step to the next result.
	OnWishRevealed.Broadcast(Next);
}

void UGachaScreenWidget::RefreshPityText()
{
	if (PityCounterText)
	{
		PityCounterText->SetText(FText::Format(NSLOCTEXT("Gacha", "PityFormat", "Pity: {0} / {1}"),
			FText::AsNumber(PityCounter5Star), FText::AsNumber(HardPity5Star)));
	}
}
