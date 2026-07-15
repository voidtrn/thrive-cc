// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "Data/InventoryManager.h"
#include "InventorySlotWidget.generated.h"

class UImage;
class UTextBlock;
class UButton;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnInventorySlotClicked, FName, ItemID);

/** One grid cell: icon, count badge, rarity tint, "new" glow. Clicking reports its ItemID upward. */
UCLASS()
class STICKMANIMPACT_API UInventorySlotWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Inventory Slot")
	void SetItem(const FInventoryItem& Item);

	UFUNCTION(BlueprintCallable, Category = "Inventory Slot")
	void SetEmpty();

	UPROPERTY(BlueprintAssignable, Category = "Inventory Slot")
	FOnInventorySlotClicked OnSlotClicked;

protected:
	virtual void NativeConstruct() override;

	UFUNCTION()
	void HandleClicked();

	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> SlotButton;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> ItemIcon;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> CountText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> NewHighlight;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> RarityBorder;

private:
	FName CurrentItemID;
};
