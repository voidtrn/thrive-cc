// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "GachaScreenWidget.generated.h"

class UImage;
class UTextBlock;
class UButton;
class UTexture2D;
class UDataTable;

/** One pullable entry in a banner's pool (rows of a DataTable, RowStruct = this). */
USTRUCT(BlueprintType)
struct FGachaPoolEntry : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Gacha")
	FName ItemID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Gacha")
	FText DisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Gacha", meta = (ClampMin = "3", ClampMax = "5"))
	int32 Rarity = 3;

	// True for characters, false for weapons.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Gacha")
	bool bIsCharacter = false;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Gacha")
	TObjectPtr<UTexture2D> RevealArt;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnWishRevealed, FGachaPoolEntry, Result);

/**
 * Wish/gacha screen: banner art, 1x/10x pull buttons, Genshin-style pity (5★ guaranteed at
 * Pity90, 4★+ at every 10th pull, soft pity ramp from Pity75), a reveal queue the WBP steps
 * through (OnWishRevealed per item — play the reveal animation there, colored by rarity),
 * and results deposited into UInventoryManager. Currency cost is stubbed at 0 until a wallet
 * exists — pulls are free, honestly labeled.
 */
UCLASS()
class STICKMANIMPACT_API UGachaScreenWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Gacha")
	TObjectPtr<UDataTable> BannerPoolTable;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Gacha")
	TObjectPtr<UTexture2D> BannerArt;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Gacha")
	int32 HardPity5Star = 90;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Gacha")
	int32 SoftPityStart = 75;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Gacha")
	float Base5StarRate = 0.006f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Gacha")
	float Base4StarRate = 0.051f;

	UFUNCTION(BlueprintCallable, Category = "Gacha")
	void WishOne();

	UFUNCTION(BlueprintCallable, Category = "Gacha")
	void WishTen();

	// WBP calls this after finishing each reveal animation to advance the queue.
	UFUNCTION(BlueprintCallable, Category = "Gacha")
	void AdvanceRevealQueue();

	UFUNCTION(BlueprintPure, Category = "Gacha")
	int32 GetPityCount() const { return PityCounter5Star; }

	UPROPERTY(BlueprintAssignable, Category = "Gacha")
	FOnWishRevealed OnWishRevealed;

protected:
	virtual void NativeConstruct() override;

	UFUNCTION()
	void OnWishOneClicked() { WishOne(); }
	UFUNCTION()
	void OnWishTenClicked() { WishTen(); }

	void RefreshPityText();

	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> BannerImage;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> PityCounterText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> WishOneButton;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> WishTenButton;

private:
	FGachaPoolEntry RollOnce();
	FGachaPoolEntry PickRandomOfRarity(int32 Rarity) const;
	void DepositResult(const FGachaPoolEntry& Result);

	TArray<FGachaPoolEntry> RevealQueue;
	int32 PityCounter5Star = 0;
	int32 PityCounter4Star = 0;
};
