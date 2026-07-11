// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "GameplayTagContainer.h"
#include "SkillCooldownWidget.generated.h"

class UImage;
class UProgressBar;
class UTextBlock;
class UWidgetAnimation;

/**
 * One skill icon: radial cooldown fill (bind a UProgressBar with Fill Type = Radial in the
 * WBP), cooldown seconds text, a glow overlay shown when ready, and a shake animation played
 * when TryCast() is called but the skill can't actually activate (on cooldown / not enough
 * energy) — call TryCast() from the input handler instead of activating the skill directly
 * if you want this widget to auto-shake on a failed attempt.
 */
UCLASS()
class STICKMANIMPACT_API USkillCooldownWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	// Which skill this icon tracks — must match a granted ability's FSkillData::SkillTag.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skill Cooldown")
	FGameplayTag SkillTag;

	UFUNCTION(BlueprintCallable, Category = "Skill Cooldown")
	bool TryCast();

protected:
	virtual void NativeTick(const FGeometry& MyGeometry, float InDeltaTime) override;

	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> SkillIcon;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UProgressBar> CooldownRadialBar;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> CooldownText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> GlowOverlay;

	// Author "ShakeAnim" in the WBP; auto-played by TryCast() on a failed attempt.
	UPROPERTY(Transient, meta = (BindWidgetAnimOptional))
	TObjectPtr<UWidgetAnimation> ShakeAnim;

private:
	class UStickmanAbilitySystemComponent* GetPlayerASC() const;

	bool bWasReadyLastTick = false;
};
