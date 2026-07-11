// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "Combat/StickmanReactionTypes.h"
#include "StickmanElementalGaugeWidget.generated.h"

class UImage;
class UProgressBar;
class UTextBlock;
class UWidgetAnimation;

/**
 * Floating per-enemy display: one icon+bar pair per active element aura (bar shows remaining
 * duration, not raw gauge), plus a reaction popup ("MELT", "VAPORIZE", ...) with damage number.
 * All icon/bar/text widgets are BindWidgetOptional — a WBP subclass only needs to include the
 * ones it wants to actually show.
 */
UCLASS()
class STICKMANIMPACT_API UStickmanElementalGaugeWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Elemental Gauge")
	void UpdateGauges(const TArray<FActiveElement>& ActiveElements);

	UFUNCTION(BlueprintCallable, Category = "Elemental Gauge")
	void ShowReactionPopup(EStickmanReactionType Reaction, float ReactionDamage);

	// Optional per-reaction icon lookup (e.g. a little flame/snowflake/lightning glyph).
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Elemental Gauge")
	TMap<EStickmanReactionType, TObjectPtr<UTexture2D>> ReactionIcons;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Elemental Gauge")
	float PopupDisplayDuration = 1.2f;

protected:
	// One Image + ProgressBar pair per element. Bind only the ones your WBP actually has.
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> Image_Pyro;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UProgressBar> Bar_Pyro;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> Image_Cryo;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UProgressBar> Bar_Cryo;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> Image_Hydro;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UProgressBar> Bar_Hydro;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> Image_Electro;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UProgressBar> Bar_Electro;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> Image_Anemo;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UProgressBar> Bar_Anemo;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> Image_Geo;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UProgressBar> Bar_Geo;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> Image_Dendro;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UProgressBar> Bar_Dendro;

	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> ReactionPopupText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> ReactionPopupIcon;

	// Author a Widget Animation named "ReactionPopupAnim" in the WBP (scale up + fade) and
	// it's auto-bound here and played automatically — no extra C++ needed for the flourish.
	UPROPERTY(Transient, meta = (BindWidgetAnimOptional))
	TObjectPtr<UWidgetAnimation> ReactionPopupAnim;

private:
	void SetElementWidgets(EStickmanElement Element, bool bVisible, float DurationPercent);
	void GetWidgetsForElement(EStickmanElement Element, UImage*& OutImage, UProgressBar*& OutBar);
	void HideReactionPopup();

	FTimerHandle PopupHideTimerHandle;
};
