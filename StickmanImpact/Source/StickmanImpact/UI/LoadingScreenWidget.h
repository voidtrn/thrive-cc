// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "LoadingScreenWidget.generated.h"

class UTextBlock;
class UProgressBar;

/**
 * Loading screen: random rotating gameplay tip + a progress bar. Honest caveat on progress:
 * USaveManager's async load has no granular progress callbacks (one background read), so the
 * bar animates toward ~90% on a timer and snaps to 100% when OnLoadCompleted fires — the
 * standard fake-but-smooth loading bar. Push this via UMenuNavigationManager before calling
 * LoadFromSlotAsync; it pops itself on completion.
 */
UCLASS()
class STICKMANIMPACT_API ULoadingScreenWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Loading")
	TArray<FText> GameplayTips;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Loading")
	float TipRotationInterval = 4.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Loading")
	float FakeProgressPerSecond = 0.35f;

protected:
	virtual void NativeConstruct() override;
	virtual void NativeDestruct() override;
	virtual void NativeTick(const FGeometry& MyGeometry, float InDeltaTime) override;

	UFUNCTION()
	void HandleLoadCompleted(int32 SlotIndex, bool bSuccess);

	void ShowRandomTip();

	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> TipText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UProgressBar> LoadProgressBar;

private:
	float CurrentProgress = 0.f;
	float TimeSinceTipChange = 0.f;
	bool bLoadFinished = false;
};
