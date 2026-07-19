// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "Party/StickmanPartyTypes.h"
#include "Equipment/StickmanEquipmentTypes.h"
#include "CharacterScreenWidget.generated.h"

class UImage;
class UTextBlock;
class UProgressBar;
class UButton;
class UPanelWidget;
class UMaterialInstanceDynamic;
class ACharacterPreviewStage;

/**
 * Character screen: rotatable 3D stickman preview (via ACharacterPreviewStage's render
 * target), full stat panel, equipment/artifact slot buttons (click-to-equip — real drag-drop
 * is a WBP-side OnDragDetected/OnDrop override on the slot buttons; the C++ Equip.../Unequip...
 * entry points here are what both paths call), skill showcase, constellation viewer, level/EXP
 * bar, and party tabs.
 */
UCLASS()
class STICKMANIMPACT_API UCharacterScreenWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	// Degrees per pixel of horizontal drag on the preview image.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character Screen")
	float PreviewRotateSpeed = 0.5f;

	UFUNCTION(BlueprintCallable, Category = "Character Screen")
	void SelectPartyTab(int32 MemberIndex);

	UFUNCTION(BlueprintCallable, Category = "Character Screen")
	void RotatePreview(float DeltaDegrees);

	// Click-to-equip entry points — the inventory screen (or a WBP drag-drop OnDrop) calls these.
	UFUNCTION(BlueprintCallable, Category = "Character Screen")
	void EquipWeaponOnSelected(const FWeaponData& Weapon);

	UFUNCTION(BlueprintCallable, Category = "Character Screen")
	void EquipArtifactOnSelected(const FArtifactData& Artifact);

	UFUNCTION(BlueprintPure, Category = "Character Screen")
	int32 GetSelectedMemberIndex() const { return SelectedMemberIndex; }

protected:
	virtual void NativeConstruct() override;
	virtual void NativeDestruct() override;

	UFUNCTION()
	void OnPartyTab0() { SelectPartyTab(0); }
	UFUNCTION()
	void OnPartyTab1() { SelectPartyTab(1); }
	UFUNCTION()
	void OnPartyTab2() { SelectPartyTab(2); }
	UFUNCTION()
	void OnPartyTab3() { SelectPartyTab(3); }

	void RefreshAll();
	void RefreshStatsPanel();
	void RefreshEquipmentSlots();
	void RefreshSkillsAndConstellations();
	void RefreshLevelBar();

	// --- Preview -------------------------------------------------------------
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> PreviewImage;

	// --- Stats ---------------------------------------------------------------
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> NameText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> HPStatText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> ATKStatText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> DEFStatText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> EMStatText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> ERStatText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> CritRateStatText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> CritDMGStatText;

	// --- Equipment slots -------------------------------------------------------
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> WeaponSlotIcon;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> FlowerSlotIcon;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> PlumeSlotIcon;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> SandsSlotIcon;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> GobletSlotIcon;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> CircletSlotIcon;

	// --- Skills / constellations -------------------------------------------------
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> SkillIcon;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> SkillNameText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> BurstIcon;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> BurstNameText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UPanelWidget> ConstellationPanel;

	// --- Level ------------------------------------------------------------------
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> LevelText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UProgressBar> EXPBar;

	// --- Party tabs ----------------------------------------------------------------
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> PartyTabButton0;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> PartyTabButton1;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> PartyTabButton2;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> PartyTabButton3;

private:
	class UPartyManager* GetPartyManager() const;
	class UEquipmentManager* GetPlayerEquipment() const;

	UPROPERTY()
	TObjectPtr<ACharacterPreviewStage> PreviewStage;

	int32 SelectedMemberIndex = 0;
};
