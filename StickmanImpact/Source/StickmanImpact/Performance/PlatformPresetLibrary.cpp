// Copyright StickmanImpact Project.

#include "PlatformPresetLibrary.h"
#include "Engine/Engine.h"
#include "GameFramework/GameUserSettings.h"

void UPlatformPresetLibrary::SetCVar(const UObject* WorldContextObject, const TCHAR* Command)
{
	if (GEngine)
	{
		const UWorld* World = WorldContextObject ? WorldContextObject->GetWorld() : nullptr;
		GEngine->Exec(const_cast<UWorld*>(World), Command);
	}
}

void UPlatformPresetLibrary::ApplyFrameCapAndScalability(const UObject* WorldContextObject, int32 ScalabilityLevel, float FrameCap)
{
	if (UGameUserSettings* Settings = GEngine ? GEngine->GetGameUserSettings() : nullptr)
	{
		Settings->SetOverallScalabilityLevel(FMath::Clamp(ScalabilityLevel, 0, 3));
		Settings->SetFrameRateLimit(FrameCap);
		Settings->ApplySettings(false);
	}
}

void UPlatformPresetLibrary::ApplyPreset(const UObject* WorldContextObject, EPlatformPreset Preset)
{
	// Default: TSR as the upsampler (best quality/perf for this style).
	SetCVar(WorldContextObject, TEXT("r.AntiAliasingMethod 4")); // 4 = TSR

	switch (Preset)
	{
	case EPlatformPreset::PC_Low:
		ApplyFrameCapAndScalability(WorldContextObject, 0, 0.f);
		ConfigureDynamicResolution(WorldContextObject, false);
		break;

	case EPlatformPreset::PC_Medium:
		ApplyFrameCapAndScalability(WorldContextObject, 1, 0.f);
		ConfigureDynamicResolution(WorldContextObject, false);
		break;

	case EPlatformPreset::PC_High:
		ApplyFrameCapAndScalability(WorldContextObject, 2, 0.f);
		ConfigureDynamicResolution(WorldContextObject, false);
		break;

	case EPlatformPreset::PC_Ultra:
		ApplyFrameCapAndScalability(WorldContextObject, 3, 0.f);
		ConfigureDynamicResolution(WorldContextObject, false);
		break;

	case EPlatformPreset::SteamDeck:
		// 60 FPS target on a 800p panel — medium settings + dynamic res headroom.
		ApplyFrameCapAndScalability(WorldContextObject, 1, 60.f);
		ConfigureDynamicResolution(WorldContextObject, true, 16.6f, 60.f, 100.f);
		break;

	case EPlatformPreset::Console_Quality:
		// 30 FPS locked, high fidelity.
		ApplyFrameCapAndScalability(WorldContextObject, 3, 30.f);
		ConfigureDynamicResolution(WorldContextObject, true, 33.3f, 70.f, 100.f);
		break;

	case EPlatformPreset::Console_Performance:
		// 60 FPS locked, medium fidelity, more dynamic-res range to protect the framerate.
		ApplyFrameCapAndScalability(WorldContextObject, 2, 60.f);
		ConfigureDynamicResolution(WorldContextObject, true, 16.6f, 50.f, 100.f);
		break;
	}
}

void UPlatformPresetLibrary::ConfigureDynamicResolution(const UObject* WorldContextObject, bool bEnable,
	float TargetGPUTimeMs, float MinScreenPercent, float MaxScreenPercent)
{
	if (!bEnable)
	{
		SetCVar(WorldContextObject, TEXT("r.DynamicRes.OperationMode 0"));
		return;
	}

	// OperationMode 2 = enabled and always on (ignores the r.DynamicRes.TestScreenPercentage path).
	SetCVar(WorldContextObject, TEXT("r.DynamicRes.OperationMode 2"));
	SetCVar(WorldContextObject, *FString::Printf(TEXT("r.DynamicRes.FrameTimeBudget %f"), TargetGPUTimeMs));
	SetCVar(WorldContextObject, *FString::Printf(TEXT("r.DynamicRes.MinScreenPercentage %f"),
		FMath::Clamp(MinScreenPercent, 25.f, 100.f)));
	SetCVar(WorldContextObject, *FString::Printf(TEXT("r.DynamicRes.MaxScreenPercentage %f"),
		FMath::Clamp(MaxScreenPercent, MinScreenPercent, 100.f)));
}
