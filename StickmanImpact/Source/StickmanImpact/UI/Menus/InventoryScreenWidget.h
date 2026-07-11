// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "Data/InventoryManager.h"
#include "InventoryScreenWidget.generated.h"

class UUniformGridPanel;
class UTextBlock;
class UImage;
class UButton;
class UPanelWidget;
class UInventorySlotWidget;

/**
 * Grid inventory: category tabs, sort dropdown (cycle button), item detail panel on selection
 * (spec said hover — selection works for gamepad too; hover is a WBP OnMouseEnter forwarding
 * to SelectItem), destroy-with-confirmation, count badges, and a "new" highlight cleared on
 * first view. Slots are pooled UInventorySlotWidget instances in a UniformGridPanel.
 */
UCLASS()
class STICKMANIMPACT_API UInventoryScreenWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Inventory")
	TSubclassOf<UInventorySlotWidget> SlotWidgetClass;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Inventory")
	int32 GridColumns = 8;

	UFUNCTION(BlueprintCallable, Category = "Inventory")
	void SelectCategory(EInventoryCategory Category);

	UFUNCTION(BlueprintCallable, Category = "Inventory")
	void CycleSortMode();

	UFUNCTION(BlueprintCallable, Category = "Inventory")
	void SelectItem(FName ItemID);

	UFUNCTION(BlueprintCallable, Category = "Inventory")
	void RequestDestroySelected();

	UFUNCTION(BlueprintCallable, Category = "Inventory")
	void ConfirmDestroy();

	UFUNCTION(BlueprintCallable, Category = "Inventory")
	void CancelDestroy();

protected:
	virtual void NativeConstruct() override;
	virtual void NativeDestruct() override;

	UFUNCTION()
	void HandleItemChanged(FName ItemID, int32 NewCount);

	UFUNCTION()
	void OnTabWeapons() { SelectCategory(EInventoryCategory::Weapons); }
	UFUNCTION()
	void OnTabArtifacts() { SelectCategory(EInventoryCategory::Artifacts); }
	UFUNCTION()
	void OnTabMaterials() { SelectCategory(EInventoryCategory::Materials); }
	UFUNCTION()
	void OnTabConsumables() { SelectCategory(EInventoryCategory::Consumables); }
	UFUNCTION()
	void OnTabQuestItems() { SelectCategory(EInventoryCategory::QuestItems); }

	void RefreshGrid();
	void RefreshDetailPanel();

	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UUniformGridPanel> ItemGrid;

	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> TabWeaponsButton;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> TabArtifactsButton;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> TabMaterialsButton;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> TabConsumablesButton;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> TabQuestItemsButton;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> SortModeText;

	// Detail panel
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> DetailIcon;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> DetailNameText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> DetailDescriptionText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> DetailCountText;

	// Destroy confirmation
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UPanelWidget> DestroyConfirmPanel;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> DestroyConfirmButton;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> DestroyCancelButton;

private:
	class UInventoryManager* GetInventory() const;

	UPROPERTY()
	TArray<TObjectPtr<UInventorySlotWidget>> PooledSlots;

	EInventoryCategory CurrentCategory = EInventoryCategory::Weapons;
	EInventorySortMode CurrentSortMode = EInventorySortMode::ByRarity;
	FName SelectedItemID;
};
