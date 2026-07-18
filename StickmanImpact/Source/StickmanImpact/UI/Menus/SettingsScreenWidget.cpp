// Copyright StickmanImpact Project.

#include "SettingsScreenWidget.h"
#include "Components/ComboBoxString.h"
#include "Components/Slider.h"
#include "Components/CheckBox.h"
#include "Components/Button.h"
#include "GameFramework/GameUserSettings.h"
#include "GameFramework/PlayerController.h"
#include "Audio/StickmanAudioManager.h"
#include "AI/AdaptiveDifficultySubsystem.h"
#include "Kismet/GameplayStatics.h"
#include "Internationalization/Culture.h"
#include "Misc/ConfigCacheIni.h"

namespace
{
	const TCHAR* SettingsSection = TEXT("/Script/StickmanImpact.StickmanSettings");

	void WriteConfigFloat(const TCHAR* Key, float Value)
	{
		GConfig->SetFloat(SettingsSection, Key, Value, GGameUserSettingsIni);
	}
	void WriteConfigBool(const TCHAR* Key, bool bValue)
	{
		GConfig->SetBool(SettingsSection, Key, bValue, GGameUserSettingsIni);
	}
	float ReadConfigFloat(const TCHAR* Key, float Default)
	{
		float Value = Default;
		GConfig->GetFloat(SettingsSection, Key, Value, GGameUserSettingsIni);
		return Value;
	}
	bool ReadConfigBool(const TCHAR* Key, bool bDefault)
	{
		bool bValue = bDefault;
		GConfig->GetBool(SettingsSection, Key, bValue, GGameUserSettingsIni);
		return bValue;
	}
}

void USettingsScreenWidget::NativeConstruct()
{
	Super::NativeConstruct();

	if (ApplyButton)
	{
		ApplyButton->OnClicked.AddDynamic(this, &USettingsScreenWidget::OnApplyClicked);
	}
	LoadCurrentValuesIntoWidgets();
}

void USettingsScreenWidget::LoadCurrentValuesIntoWidgets()
{
	UGameUserSettings* Settings = GEngine ? GEngine->GetGameUserSettings() : nullptr;

	if (ResolutionCombo && ResolutionCombo->GetOptionCount() == 0)
	{
		for (const TCHAR* Option : { TEXT("1280x720"), TEXT("1600x900"), TEXT("1920x1080"), TEXT("2560x1440"), TEXT("3840x2160") })
		{
			ResolutionCombo->AddOption(Option);
		}
		if (Settings)
		{
			const FIntPoint Current = Settings->GetScreenResolution();
			ResolutionCombo->SetSelectedOption(FString::Printf(TEXT("%dx%d"), Current.X, Current.Y));
		}
	}
	if (QualityCombo && QualityCombo->GetOptionCount() == 0)
	{
		for (const TCHAR* Option : { TEXT("Low"), TEXT("Medium"), TEXT("High"), TEXT("Epic") })
		{
			QualityCombo->AddOption(Option);
		}
		if (Settings)
		{
			QualityCombo->SetSelectedIndex(FMath::Clamp(Settings->GetOverallScalabilityLevel(), 0, 3));
		}
	}
	if (FPSCapSlider && Settings)
	{
		FPSCapSlider->SetValue(Settings->GetFrameRateLimit());
	}
	if (VSyncCheckBox && Settings)
	{
		VSyncCheckBox->SetIsChecked(Settings->IsVSyncEnabled());
	}

	if (MasterVolumeSlider) MasterVolumeSlider->SetValue(ReadConfigFloat(TEXT("MasterVolume"), 1.f));
	if (MusicVolumeSlider) MusicVolumeSlider->SetValue(ReadConfigFloat(TEXT("BGMVolume"), 1.f));
	if (SFXVolumeSlider) SFXVolumeSlider->SetValue(ReadConfigFloat(TEXT("SFXVolume"), 1.f));
	if (VoiceVolumeSlider) VoiceVolumeSlider->SetValue(ReadConfigFloat(TEXT("VoiceVolume"), 1.f));
	if (SensitivitySlider) SensitivitySlider->SetValue(GetSavedMouseSensitivity());
	if (SubtitlesCheckBox) SubtitlesCheckBox->SetIsChecked(AreSubtitlesEnabled());
	if (ScreenShakeCheckBox) ScreenShakeCheckBox->SetIsChecked(IsScreenShakeEnabled());
	if (ShakeIntensitySlider) ShakeIntensitySlider->SetValue(ReadConfigFloat(TEXT("ScreenShakeIntensity"), 100.f));
	if (ReduceMotionCheckBox) ReduceMotionCheckBox->SetIsChecked(IsReduceMotionEnabled());
	if (SubtitleSizeSlider) SubtitleSizeSlider->SetValue(GetSubtitleSizeScale());
	if (SubtitleBackgroundSlider) SubtitleBackgroundSlider->SetValue(GetSubtitleBackgroundOpacity());
	if (SubtitleSpeakerColorCheckBox) SubtitleSpeakerColorCheckBox->SetIsChecked(IsSubtitleSpeakerColorEnabled());
	if (ToggleHoldCheckBox) ToggleHoldCheckBox->SetIsChecked(AreActionsToggle());
	if (AudioCuesCheckBox) AudioCuesCheckBox->SetIsChecked(AreAudioCuesForVisualInfoEnabled());

	if (LanguageCombo && LanguageCombo->GetOptionCount() == 0)
	{
		for (const TCHAR* Option : { TEXT("en"), TEXT("id"), TEXT("ja"), TEXT("zh") })
		{
			LanguageCombo->AddOption(Option);
		}
		LanguageCombo->SetSelectedOption(FInternationalization::Get().GetCurrentCulture()->GetTwoLetterISOLanguageName());
	}
	if (ColorblindCombo && ColorblindCombo->GetOptionCount() == 0)
	{
		for (const TCHAR* Option : { TEXT("Off"), TEXT("Deuteranopia"), TEXT("Protanopia"), TEXT("Tritanopia") })
		{
			ColorblindCombo->AddOption(Option);
		}
		ColorblindCombo->SetSelectedIndex(static_cast<int32>(ReadConfigFloat(TEXT("ColorblindMode"), 0.f)));
	}
}

void USettingsScreenWidget::SetQualityPreset(int32 PresetIndex)
{
	if (UGameUserSettings* Settings = GEngine ? GEngine->GetGameUserSettings() : nullptr)
	{
		Settings->SetOverallScalabilityLevel(FMath::Clamp(PresetIndex, 0, 3));
	}
}

void USettingsScreenWidget::SetResolutionFromString(const FString& ResolutionString)
{
	FString WidthString, HeightString;
	if (!ResolutionString.Split(TEXT("x"), &WidthString, &HeightString))
	{
		return;
	}
	if (UGameUserSettings* Settings = GEngine ? GEngine->GetGameUserSettings() : nullptr)
	{
		Settings->SetScreenResolution(FIntPoint(FCString::Atoi(*WidthString), FCString::Atoi(*HeightString)));
	}
}

void USettingsScreenWidget::SetFPSCap(float MaxFPS)
{
	if (UGameUserSettings* Settings = GEngine ? GEngine->GetGameUserSettings() : nullptr)
	{
		Settings->SetFrameRateLimit(MaxFPS);
	}
}

void USettingsScreenWidget::SetVSyncEnabled(bool bEnabled)
{
	if (UGameUserSettings* Settings = GEngine ? GEngine->GetGameUserSettings() : nullptr)
	{
		Settings->SetVSyncEnabled(bEnabled);
	}
}

void USettingsScreenWidget::SetVolume(FName Category, float Volume)
{
	WriteConfigFloat(*FString::Printf(TEXT("%sVolume"), *Category.ToString()), Volume);
	if (const UGameInstance* GameInstance = GetGameInstance())
	{
		if (UStickmanAudioManager* AudioManager = GameInstance->GetSubsystem<UStickmanAudioManager>())
		{
			AudioManager->SetCategoryVolume(Category, Volume);
		}
	}
}

void USettingsScreenWidget::SetMouseSensitivity(float Sensitivity)
{
	WriteConfigFloat(TEXT("MouseSensitivity"), Sensitivity);
	if (APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0))
	{
		// Yaw/pitch input scale — coarse but engine-native; per-axis fine-tuning belongs in
		// Enhanced Input scalar modifiers on IA_Look.
		PC->InputYawScale_DEPRECATED = 2.5f * Sensitivity;
		PC->InputPitchScale_DEPRECATED = -2.5f * Sensitivity;
	}
}

void USettingsScreenWidget::SetLanguage(const FString& CultureCode)
{
	FInternationalization::Get().SetCurrentCulture(CultureCode);
	GConfig->SetString(SettingsSection, TEXT("Language"), *CultureCode, GGameUserSettingsIni);
}

void USettingsScreenWidget::SetAutoSaveIntervalMinutes(float Minutes)
{
	WriteConfigFloat(TEXT("AutoSaveIntervalMinutes"), Minutes);
}

void USettingsScreenWidget::SetSubtitlesEnabled(bool bEnabled)
{
	WriteConfigBool(TEXT("SubtitlesEnabled"), bEnabled);
}

void USettingsScreenWidget::SetColorblindMode(EColorblindModeSetting Mode)
{
	WriteConfigFloat(TEXT("ColorblindMode"), static_cast<float>(Mode));
	// Engine-side colorblind correction: console vars applied immediately.
	if (GEngine)
	{
		const int32 TypeIndex = static_cast<int32>(Mode); // matches EColorVisionDeficiency order
		GEngine->Exec(GetWorld(), *FString::Printf(TEXT("r.ColorCorrect.DeficiencyType %d"), TypeIndex));
		GEngine->Exec(GetWorld(), TEXT("r.ColorCorrect.DeficiencySeverity 1.0"));
	}
}

void USettingsScreenWidget::SetScreenShakeEnabled(bool bEnabled)
{
	WriteConfigBool(TEXT("ScreenShakeEnabled"), bEnabled);
}

void USettingsScreenWidget::SetScreenShakeIntensityPercent(float Percent)
{
	WriteConfigFloat(TEXT("ScreenShakeIntensity"), FMath::Clamp(Percent, 0.f, 100.f));
}

void USettingsScreenWidget::SetReduceMotion(bool bEnabled)
{
	WriteConfigBool(TEXT("ReduceMotion"), bEnabled);
}

void USettingsScreenWidget::SetSubtitleSizeScale(float Scale)
{
	WriteConfigFloat(TEXT("SubtitleSizeScale"), FMath::Clamp(Scale, 0.75f, 2.f));
}

void USettingsScreenWidget::SetSubtitleBackgroundOpacity(float Opacity)
{
	WriteConfigFloat(TEXT("SubtitleBackgroundOpacity"), FMath::Clamp(Opacity, 0.f, 1.f));
}

void USettingsScreenWidget::SetSubtitleSpeakerColorEnabled(bool bEnabled)
{
	WriteConfigBool(TEXT("SubtitleSpeakerColor"), bEnabled);
}

void USettingsScreenWidget::SetToggleHoldActions(bool bToggle)
{
	WriteConfigBool(TEXT("ToggleHoldActions"), bToggle);
}

void USettingsScreenWidget::SetAudioCuesForVisualInfo(bool bEnabled)
{
	WriteConfigBool(TEXT("AudioCuesForVisualInfo"), bEnabled);
}

void USettingsScreenWidget::SetDifficultyPreset(int32 Preset)
{
	WriteConfigFloat(TEXT("DifficultyPreset"), FMath::Clamp(Preset, 0, 3));
	// Push into the live adaptive-difficulty knob immediately.
	if (const UGameInstance* GameInstance = GetGameInstance())
	{
		if (UAdaptiveDifficultySubsystem* Difficulty = GameInstance->GetSubsystem<UAdaptiveDifficultySubsystem>())
		{
			Difficulty->DifficultyScale = GetDifficultyDamageScale();
		}
	}
}

void USettingsScreenWidget::ApplyAndSave()
{
	// Read every bound widget and push through the setters, then persist.
	if (ResolutionCombo) SetResolutionFromString(ResolutionCombo->GetSelectedOption());
	if (QualityCombo) SetQualityPreset(QualityCombo->GetSelectedIndex());
	if (FPSCapSlider) SetFPSCap(FPSCapSlider->GetValue());
	if (VSyncCheckBox) SetVSyncEnabled(VSyncCheckBox->IsChecked());
	if (MasterVolumeSlider) SetVolume(TEXT("Master"), MasterVolumeSlider->GetValue());
	if (MusicVolumeSlider) SetVolume(TEXT("BGM"), MusicVolumeSlider->GetValue());
	if (SFXVolumeSlider) SetVolume(TEXT("SFX"), SFXVolumeSlider->GetValue());
	if (VoiceVolumeSlider) SetVolume(TEXT("Voice"), VoiceVolumeSlider->GetValue());
	if (SensitivitySlider) SetMouseSensitivity(SensitivitySlider->GetValue());
	if (LanguageCombo) SetLanguage(LanguageCombo->GetSelectedOption());
	if (SubtitlesCheckBox) SetSubtitlesEnabled(SubtitlesCheckBox->IsChecked());
	if (ColorblindCombo) SetColorblindMode(static_cast<EColorblindModeSetting>(ColorblindCombo->GetSelectedIndex()));
	if (ScreenShakeCheckBox) SetScreenShakeEnabled(ScreenShakeCheckBox->IsChecked());
	if (ShakeIntensitySlider) SetScreenShakeIntensityPercent(ShakeIntensitySlider->GetValue());
	if (ReduceMotionCheckBox) SetReduceMotion(ReduceMotionCheckBox->IsChecked());
	if (SubtitleSizeSlider) SetSubtitleSizeScale(SubtitleSizeSlider->GetValue());
	if (SubtitleBackgroundSlider) SetSubtitleBackgroundOpacity(SubtitleBackgroundSlider->GetValue());
	if (SubtitleSpeakerColorCheckBox) SetSubtitleSpeakerColorEnabled(SubtitleSpeakerColorCheckBox->IsChecked());
	if (ToggleHoldCheckBox) SetToggleHoldActions(ToggleHoldCheckBox->IsChecked());
	if (AudioCuesCheckBox) SetAudioCuesForVisualInfo(AudioCuesCheckBox->IsChecked());

	if (UGameUserSettings* Settings = GEngine ? GEngine->GetGameUserSettings() : nullptr)
	{
		Settings->ApplySettings(false);
	}
	GConfig->Flush(false, GGameUserSettingsIni);
}

bool USettingsScreenWidget::IsScreenShakeEnabled()
{
	return ReadConfigBool(TEXT("ScreenShakeEnabled"), true);
}

float USettingsScreenWidget::GetScreenShakeScale()
{
	if (!IsScreenShakeEnabled())
	{
		return 0.f;
	}
	return FMath::Clamp(ReadConfigFloat(TEXT("ScreenShakeIntensity"), 100.f) / 100.f, 0.f, 1.f);
}

bool USettingsScreenWidget::IsReduceMotionEnabled()
{
	return ReadConfigBool(TEXT("ReduceMotion"), false);
}

bool USettingsScreenWidget::AreSubtitlesEnabled()
{
	return ReadConfigBool(TEXT("SubtitlesEnabled"), true);
}

float USettingsScreenWidget::GetSubtitleSizeScale()
{
	return ReadConfigFloat(TEXT("SubtitleSizeScale"), 1.f);
}

float USettingsScreenWidget::GetSubtitleBackgroundOpacity()
{
	return ReadConfigFloat(TEXT("SubtitleBackgroundOpacity"), 0.5f);
}

bool USettingsScreenWidget::IsSubtitleSpeakerColorEnabled()
{
	return ReadConfigBool(TEXT("SubtitleSpeakerColor"), true);
}

bool USettingsScreenWidget::AreActionsToggle()
{
	return ReadConfigBool(TEXT("ToggleHoldActions"), false);
}

bool USettingsScreenWidget::AreAudioCuesForVisualInfoEnabled()
{
	return ReadConfigBool(TEXT("AudioCuesForVisualInfo"), false);
}

int32 USettingsScreenWidget::GetDifficultyPreset()
{
	return FMath::Clamp(FMath::RoundToInt(ReadConfigFloat(TEXT("DifficultyPreset"), 1.f)), 0, 3);
}

float USettingsScreenWidget::GetDifficultyDamageScale()
{
	static const float Scales[] = { 0.6f, 1.f, 1.35f, 1.7f };
	return Scales[GetDifficultyPreset()];
}

float USettingsScreenWidget::GetSavedMouseSensitivity()
{
	return ReadConfigFloat(TEXT("MouseSensitivity"), 1.f);
}

float USettingsScreenWidget::GetSavedAutoSaveIntervalMinutes()
{
	return ReadConfigFloat(TEXT("AutoSaveIntervalMinutes"), 5.f);
}
