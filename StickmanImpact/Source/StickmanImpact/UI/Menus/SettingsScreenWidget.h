// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "SettingsScreenWidget.generated.h"

class UComboBoxString;
class USlider;
class UCheckBox;
class UButton;

UENUM(BlueprintType)
enum class EColorblindModeSetting : uint8
{
	Off,
	Deuteranopia,
	Protanopia,
	Tritanopia
};

/**
 * Settings screen backed by two stores:
 * - Graphics (resolution/quality/FPS cap/VSync) -> UGameUserSettings (engine-persisted).
 * - Everything else (audio volumes/gameplay/accessibility) -> GConfig GameUserSettings ini
 *   custom section, applied on change (audio volumes route to UStickmanAudioManager).
 * Key rebinding: Enhanced Input user settings (bEnableUserSettings already on in
 * DefaultEngine.ini) — expose per-action rebind rows in a WBP using UEnhancedInputUserSettings;
 * too editor-asset-coupled to hardcode here. Mouse sensitivity applies to the PlayerController.
 */
UCLASS()
class STICKMANIMPACT_API USettingsScreenWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	// --- Graphics ---
	UFUNCTION(BlueprintCallable, Category = "Settings|Graphics")
	void SetQualityPreset(int32 PresetIndex); // 0 Low..3 Epic

	UFUNCTION(BlueprintCallable, Category = "Settings|Graphics")
	void SetResolutionFromString(const FString& ResolutionString); // "1920x1080"

	UFUNCTION(BlueprintCallable, Category = "Settings|Graphics")
	void SetFPSCap(float MaxFPS); // 0 = uncapped

	UFUNCTION(BlueprintCallable, Category = "Settings|Graphics")
	void SetVSyncEnabled(bool bEnabled);

	// --- Audio (routes to UStickmanAudioManager) ---
	UFUNCTION(BlueprintCallable, Category = "Settings|Audio")
	void SetVolume(FName Category, float Volume);

	// --- Controls ---
	UFUNCTION(BlueprintCallable, Category = "Settings|Controls")
	void SetMouseSensitivity(float Sensitivity);

	// --- Gameplay ---
	UFUNCTION(BlueprintCallable, Category = "Settings|Gameplay")
	void SetLanguage(const FString& CultureCode); // "en", "id", "ja", ...

	UFUNCTION(BlueprintCallable, Category = "Settings|Gameplay")
	void SetAutoSaveIntervalMinutes(float Minutes);

	UFUNCTION(BlueprintCallable, Category = "Settings|Gameplay")
	void SetSubtitlesEnabled(bool bEnabled);

	// --- Accessibility ---
	UFUNCTION(BlueprintCallable, Category = "Settings|Accessibility")
	void SetColorblindMode(EColorblindModeSetting Mode);

	UFUNCTION(BlueprintCallable, Category = "Settings|Accessibility")
	void SetScreenShakeEnabled(bool bEnabled);

	// 0-100 (%). Scales every camera shake amplitude; combat/juice systems multiply by this.
	UFUNCTION(BlueprintCallable, Category = "Settings|Accessibility")
	void SetScreenShakeIntensityPercent(float Percent);

	// Motion-sickness reduction: kills motion blur + velocity FOV/camera dynamics.
	UFUNCTION(BlueprintCallable, Category = "Settings|Accessibility")
	void SetReduceMotion(bool bEnabled);

	UFUNCTION(BlueprintCallable, Category = "Settings|Accessibility")
	void SetSubtitleSizeScale(float Scale); // 0.75-2.0

	UFUNCTION(BlueprintCallable, Category = "Settings|Accessibility")
	void SetSubtitleBackgroundOpacity(float Opacity); // 0-1

	UFUNCTION(BlueprintCallable, Category = "Settings|Accessibility")
	void SetSubtitleSpeakerColorEnabled(bool bEnabled);

	// Repeated actions (sprint/aim/crouch) as hold vs toggle.
	UFUNCTION(BlueprintCallable, Category = "Settings|Accessibility")
	void SetToggleHoldActions(bool bToggle);

	// Emit audio cues for visually-conveyed info (off-screen telegraphs, low HP).
	UFUNCTION(BlueprintCallable, Category = "Settings|Accessibility")
	void SetAudioCuesForVisualInfo(bool bEnabled);

	UFUNCTION(BlueprintCallable, Category = "Settings")
	void ApplyAndSave();

	// Global read points for other systems (camera shake honors this, subtitles widget etc.).
	UFUNCTION(BlueprintPure, Category = "Settings")
	static bool IsScreenShakeEnabled();

	// 1.0 = 100%. IsScreenShakeEnabled()==false forces this to 0.
	UFUNCTION(BlueprintPure, Category = "Settings")
	static float GetScreenShakeScale();

	UFUNCTION(BlueprintPure, Category = "Settings")
	static bool IsReduceMotionEnabled();

	UFUNCTION(BlueprintPure, Category = "Settings")
	static bool AreSubtitlesEnabled();

	UFUNCTION(BlueprintPure, Category = "Settings")
	static float GetSubtitleSizeScale();

	UFUNCTION(BlueprintPure, Category = "Settings")
	static float GetSubtitleBackgroundOpacity();

	UFUNCTION(BlueprintPure, Category = "Settings")
	static bool IsSubtitleSpeakerColorEnabled();

	UFUNCTION(BlueprintPure, Category = "Settings")
	static bool AreActionsToggle();

	UFUNCTION(BlueprintPure, Category = "Settings")
	static bool AreAudioCuesForVisualInfoEnabled();

	UFUNCTION(BlueprintPure, Category = "Settings")
	static float GetSavedMouseSensitivity();

	UFUNCTION(BlueprintPure, Category = "Settings")
	static float GetSavedAutoSaveIntervalMinutes();

protected:
	virtual void NativeConstruct() override;

	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UComboBoxString> ResolutionCombo;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UComboBoxString> QualityCombo;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<USlider> FPSCapSlider;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UCheckBox> VSyncCheckBox;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<USlider> MasterVolumeSlider;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<USlider> MusicVolumeSlider;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<USlider> SFXVolumeSlider;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<USlider> VoiceVolumeSlider;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<USlider> SensitivitySlider;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UComboBoxString> LanguageCombo;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UCheckBox> SubtitlesCheckBox;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UComboBoxString> ColorblindCombo;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UCheckBox> ScreenShakeCheckBox;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<USlider> ShakeIntensitySlider;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UCheckBox> ReduceMotionCheckBox;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<USlider> SubtitleSizeSlider;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<USlider> SubtitleBackgroundSlider;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UCheckBox> SubtitleSpeakerColorCheckBox;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UCheckBox> ToggleHoldCheckBox;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UCheckBox> AudioCuesCheckBox;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> ApplyButton;

private:
	UFUNCTION()
	void OnApplyClicked() { ApplyAndSave(); }

	void LoadCurrentValuesIntoWidgets();
};
