// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "SubtitleWidget.generated.h"

class UTextBlock;
class UBorder;

/** Subscribes to UCutsceneManager::OnSubtitleChanged and shows/hides a subtitle line with a translucent background. */
UCLASS()
class STICKMANIMPACT_API USubtitleWidget : public UUserWidget
{
	GENERATED_BODY()

protected:
	virtual void NativeConstruct() override;
	virtual void NativeDestruct() override;

	UFUNCTION()
	void HandleSubtitleChanged(FText Text, FLinearColor Color);

	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> SubtitleText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UBorder> BackgroundBorder;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Subtitle")
	float BackgroundOpacity = 0.6f;
};
