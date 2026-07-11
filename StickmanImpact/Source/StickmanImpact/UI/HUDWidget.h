// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "World/StickmanWorldTypes.h"
#include "HUDWidget.generated.h"

class UProgressBar;
class UTextBlock;
class UImage;
class UPanelWidget;
class UWidgetAnimation;
class UMinimapWidget;
class UQuestTrackerWidget;
class USkillCooldownWidget;
class UStickmanElementalGaugeWidget;
class UDayNightManager;

/**
 * Top-level HUD: health/stamina/energy, party list, portrait, 3 skill-cooldown icons,
 * minimap, quest tracker, interaction prompt, buff/debuff readout (reuses
 * UStickmanElementalGaugeWidget for the player's own active elements), ping, time-of-day
 * icon, and combat feedback (hit marker, kill confirm, combo counter, reaction popup).
 * Every sub-element is BindWidgetOptional — include only what your WBP layout needs.
 */
UCLASS()
class STICKMANIMPACT_API UHUDWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "HUD")
	float LowHealthThreshold = 0.3f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "HUD")
	FLinearColor NormalHealthColor = FLinearColor::Green;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "HUD")
	FLinearColor LowHealthColor = FLinearColor::Red;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "HUD")
	TMap<ETimeOfDay, TObjectPtr<UTexture2D>> TimeOfDayIcons;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "HUD")
	float InteractionPromptRange = 200.f;

	UFUNCTION(BlueprintCallable, Category = "HUD")
	void ShowInteractionPrompt(const FText& PromptText);

	UFUNCTION(BlueprintCallable, Category = "HUD")
	void HideInteractionPrompt();

protected:
	virtual void NativeConstruct() override;
	virtual void NativeDestruct() override;
	virtual void NativeTick(const FGeometry& MyGeometry, float InDeltaTime) override;

	UFUNCTION()
	void HandleHealthChanged(float NewHealth, float MaxHealth);
	UFUNCTION()
	void HandleStaminaChanged(float NewStamina, float MaxStamina);
	UFUNCTION()
	void HandleEnergyChanged(float NewEnergy, float MaxEnergy);

	UFUNCTION()
	void HandleHitLanded(AActor* Target, float Damage, bool bIsCritical);
	UFUNCTION()
	void HandleKillConfirmed(AActor* Target);
	UFUNCTION()
	void HandleComboCountChanged(int32 ComboCount);
	UFUNCTION()
	void HandleReactionTriggered(AActor* Target, EStickmanReactionType Reaction, float ReactionDamage, FVector Location);

	UFUNCTION()
	void HandleTimeOfDayChanged(ETimeOfDay NewTimeOfDay);

	UFUNCTION()
	void HandlePartySwitched(int32 NewIndex, int32 OldIndex);

	void RefreshPartyList();
	void RefreshPing(float DeltaSeconds);
	void HideHitMarkerIfExpired(float DeltaSeconds);
	void HideKillConfirmIfExpired(float DeltaSeconds);
	void HideReactionPopupIfExpired(float DeltaSeconds);

	// --- Vitals -----------------------------------------------------------
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UProgressBar> HealthBar;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UProgressBar> StaminaBar;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UProgressBar> EnergyBar;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> CurrentCharacterPortrait;

	// --- Party (up to 4) ----------------------------------------------------
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> PartyPortrait0;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UProgressBar> PartyHealthBar0;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> PartyBurstReadyIcon0;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> PartyPortrait1;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UProgressBar> PartyHealthBar1;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> PartyBurstReadyIcon1;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> PartyPortrait2;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UProgressBar> PartyHealthBar2;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> PartyBurstReadyIcon2;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> PartyPortrait3;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UProgressBar> PartyHealthBar3;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> PartyBurstReadyIcon3;

	// --- Skills / minimap / quest / buffs -----------------------------------
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<USkillCooldownWidget> NormalAttackIcon;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<USkillCooldownWidget> Skill1Icon;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<USkillCooldownWidget> Skill2Icon;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UMinimapWidget> Minimap;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UQuestTrackerWidget> QuestTracker;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UStickmanElementalGaugeWidget> PlayerBuffDisplay;

	// --- Interaction / ping / time-of-day ------------------------------------
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> InteractionPromptText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> PingText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> TimeOfDayIcon;

	// --- Combat feedback -----------------------------------------------------
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> HitMarkerImage;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> KillConfirmImage;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> ComboCounterText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> ReactionPopupText;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "HUD|Combat Feedback")
	float HitMarkerDuration = 0.15f;
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "HUD|Combat Feedback")
	float KillConfirmDuration = 0.6f;
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "HUD|Combat Feedback")
	float ReactionPopupDuration = 1.2f;
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "HUD|Combat Feedback")
	float ComboCounterHideDelay = 1.5f;

private:
	float PingRefreshTimer = 0.f;
	float HitMarkerTimer = 0.f;
	float KillConfirmTimer = 0.f;
	float ReactionPopupTimer = 0.f;
	float ComboHideTimer = 0.f;
};
