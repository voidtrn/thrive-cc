// Copyright StickmanImpact Project.

#include "InventorySlotWidget.h"
#include "Components/Image.h"
#include "Components/TextBlock.h"
#include "Components/Button.h"

namespace
{
	FLinearColor GetRarityColor(int32 Rarity)
	{
		switch (Rarity)
		{
			case 5: return FLinearColor(1.f, 0.65f, 0.1f);  // gold
			case 4: return FLinearColor(0.65f, 0.35f, 0.9f); // purple
			case 3: return FLinearColor(0.3f, 0.55f, 0.95f); // blue
			case 2: return FLinearColor(0.35f, 0.8f, 0.5f);  // green
			default: return FLinearColor(0.7f, 0.7f, 0.7f);  // grey
		}
	}
}

void UInventorySlotWidget::NativeConstruct()
{
	Super::NativeConstruct();
	if (SlotButton)
	{
		SlotButton->OnClicked.AddDynamic(this, &UInventorySlotWidget::HandleClicked);
	}
}

void UInventorySlotWidget::HandleClicked()
{
	if (!CurrentItemID.IsNone())
	{
		OnSlotClicked.Broadcast(CurrentItemID);
	}
}

void UInventorySlotWidget::SetItem(const FInventoryItem& Item)
{
	CurrentItemID = Item.ItemID;
	SetVisibility(ESlateVisibility::Visible);

	if (ItemIcon)
	{
		if (Item.Icon)
		{
			ItemIcon->SetBrushFromTexture(Item.Icon);
		}
		ItemIcon->SetVisibility(ESlateVisibility::HitTestInvisible);
	}
	if (CountText)
	{
		CountText->SetText(Item.Count > 1 ? FText::AsNumber(Item.Count) : FText::GetEmpty());
	}
	if (NewHighlight)
	{
		NewHighlight->SetVisibility(Item.bIsNew ? ESlateVisibility::HitTestInvisible : ESlateVisibility::Collapsed);
	}
	if (RarityBorder)
	{
		RarityBorder->SetColorAndOpacity(GetRarityColor(Item.Rarity));
	}
}

void UInventorySlotWidget::SetEmpty()
{
	CurrentItemID = NAME_None;
	SetVisibility(ESlateVisibility::Collapsed);
}
