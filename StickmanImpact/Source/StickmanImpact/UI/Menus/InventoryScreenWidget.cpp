// Copyright StickmanImpact Project.

#include "InventoryScreenWidget.h"
#include "InventorySlotWidget.h"
#include "Components/UniformGridPanel.h"
#include "Components/TextBlock.h"
#include "Components/Image.h"
#include "Components/Button.h"
#include "Components/PanelWidget.h"

UInventoryManager* UInventoryScreenWidget::GetInventory() const
{
	const UGameInstance* GameInstance = GetGameInstance();
	return GameInstance ? GameInstance->GetSubsystem<UInventoryManager>() : nullptr;
}

void UInventoryScreenWidget::NativeConstruct()
{
	Super::NativeConstruct();

	if (TabWeaponsButton) TabWeaponsButton->OnClicked.AddDynamic(this, &UInventoryScreenWidget::OnTabWeapons);
	if (TabArtifactsButton) TabArtifactsButton->OnClicked.AddDynamic(this, &UInventoryScreenWidget::OnTabArtifacts);
	if (TabMaterialsButton) TabMaterialsButton->OnClicked.AddDynamic(this, &UInventoryScreenWidget::OnTabMaterials);
	if (TabConsumablesButton) TabConsumablesButton->OnClicked.AddDynamic(this, &UInventoryScreenWidget::OnTabConsumables);
	if (TabQuestItemsButton) TabQuestItemsButton->OnClicked.AddDynamic(this, &UInventoryScreenWidget::OnTabQuestItems);
	if (DestroyConfirmButton) DestroyConfirmButton->OnClicked.AddDynamic(this, &UInventoryScreenWidget::ConfirmDestroy);
	if (DestroyCancelButton) DestroyCancelButton->OnClicked.AddDynamic(this, &UInventoryScreenWidget::CancelDestroy);

	if (UInventoryManager* Inventory = GetInventory())
	{
		Inventory->OnItemChanged.AddDynamic(this, &UInventoryScreenWidget::HandleItemChanged);
	}
	if (DestroyConfirmPanel)
	{
		DestroyConfirmPanel->SetVisibility(ESlateVisibility::Collapsed);
	}

	RefreshGrid();
}

void UInventoryScreenWidget::NativeDestruct()
{
	if (UInventoryManager* Inventory = GetInventory())
	{
		Inventory->OnItemChanged.RemoveDynamic(this, &UInventoryScreenWidget::HandleItemChanged);
	}
	Super::NativeDestruct();
}

void UInventoryScreenWidget::HandleItemChanged(FName ItemID, int32 NewCount)
{
	RefreshGrid();
	if (ItemID == SelectedItemID)
	{
		RefreshDetailPanel();
	}
}

void UInventoryScreenWidget::SelectCategory(EInventoryCategory Category)
{
	CurrentCategory = Category;
	SelectedItemID = NAME_None;
	RefreshGrid();
	RefreshDetailPanel();
}

void UInventoryScreenWidget::CycleSortMode()
{
	CurrentSortMode = static_cast<EInventorySortMode>((static_cast<uint8>(CurrentSortMode) + 1) % 4);
	if (SortModeText)
	{
		SortModeText->SetText(UEnum::GetDisplayValueAsText(CurrentSortMode));
	}
	RefreshGrid();
}

void UInventoryScreenWidget::RefreshGrid()
{
	UInventoryManager* Inventory = GetInventory();
	if (!Inventory || !ItemGrid || !SlotWidgetClass)
	{
		return;
	}

	const TArray<FInventoryItem> ItemsToShow = Inventory->GetItemsByCategory(CurrentCategory, CurrentSortMode);

	// Grow the pool as needed, reuse existing slots otherwise.
	while (PooledSlots.Num() < ItemsToShow.Num())
	{
		UInventorySlotWidget* NewSlot = CreateWidget<UInventorySlotWidget>(this, SlotWidgetClass);
		if (!NewSlot)
		{
			break;
		}
		NewSlot->OnSlotClicked.AddDynamic(this, &UInventoryScreenWidget::SelectItem);
		const int32 Index = PooledSlots.Num();
		ItemGrid->AddChildToUniformGrid(NewSlot, Index / GridColumns, Index % GridColumns);
		PooledSlots.Add(NewSlot);
	}

	for (int32 Index = 0; Index < PooledSlots.Num(); ++Index)
	{
		if (ItemsToShow.IsValidIndex(Index))
		{
			PooledSlots[Index]->SetItem(ItemsToShow[Index]);
		}
		else
		{
			PooledSlots[Index]->SetEmpty();
		}
	}
}

void UInventoryScreenWidget::SelectItem(FName ItemID)
{
	SelectedItemID = ItemID;
	if (UInventoryManager* Inventory = GetInventory())
	{
		Inventory->MarkItemSeen(ItemID); // Clears the "new" highlight on first view.
	}
	RefreshGrid();
	RefreshDetailPanel();
}

void UInventoryScreenWidget::RefreshDetailPanel()
{
	UInventoryManager* Inventory = GetInventory();
	if (!Inventory)
	{
		return;
	}

	// Find the selected item in the current category listing.
	const TArray<FInventoryItem> CategoryItems = Inventory->GetItemsByCategory(CurrentCategory, CurrentSortMode);
	const FInventoryItem* Selected = CategoryItems.FindByPredicate(
		[this](const FInventoryItem& Item) { return Item.ItemID == SelectedItemID; });

	const bool bHasSelection = Selected != nullptr;
	if (DetailNameText)
	{
		DetailNameText->SetText(bHasSelection ? Selected->DisplayName : FText::GetEmpty());
	}
	if (DetailDescriptionText)
	{
		DetailDescriptionText->SetText(bHasSelection ? Selected->Description : FText::GetEmpty());
	}
	if (DetailCountText)
	{
		DetailCountText->SetText(bHasSelection
			? FText::Format(NSLOCTEXT("Inventory", "CountFormat", "Owned: {0}"), FText::AsNumber(Selected->Count))
			: FText::GetEmpty());
	}
	if (DetailIcon)
	{
		if (bHasSelection && Selected->Icon)
		{
			DetailIcon->SetBrushFromTexture(Selected->Icon);
		}
		DetailIcon->SetVisibility(bHasSelection ? ESlateVisibility::HitTestInvisible : ESlateVisibility::Hidden);
	}
}

void UInventoryScreenWidget::RequestDestroySelected()
{
	if (SelectedItemID.IsNone() || !DestroyConfirmPanel)
	{
		return;
	}
	// Quest items can't be destroyed.
	if (CurrentCategory == EInventoryCategory::QuestItems)
	{
		return;
	}
	DestroyConfirmPanel->SetVisibility(ESlateVisibility::Visible);
}

void UInventoryScreenWidget::ConfirmDestroy()
{
	if (UInventoryManager* Inventory = GetInventory())
	{
		Inventory->RemoveItem(SelectedItemID, Inventory->GetItemCount(SelectedItemID));
	}
	SelectedItemID = NAME_None;
	CancelDestroy();
	RefreshGrid();
	RefreshDetailPanel();
}

void UInventoryScreenWidget::CancelDestroy()
{
	if (DestroyConfirmPanel)
	{
		DestroyConfirmPanel->SetVisibility(ESlateVisibility::Collapsed);
	}
}
