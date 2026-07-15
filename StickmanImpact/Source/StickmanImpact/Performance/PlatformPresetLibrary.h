// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Kismet/BlueprintFunctionLibrary.h"
#include "PlatformPresetLibrary.generated.h"

UENUM(BlueprintType)
enum class EPlatformPreset : uint8
{
	PC_Low,
	PC_Medium,
	PC_High,
	PC_Ultra,
	SteamDeck,     // 800p-ish, capped 60, TSR, medium-biased.
	Console_Quality, // 30 FPS locked, high settings.
	Console_Performance // 60 FPS locked, medium settings.
};

/**
 * One place to slam a coherent quality+framerate+resolution profile. Wraps
 * UGameUserSettings scalability + the CVars that don't have GameUserSettings equivalents
 * (dynamic resolution bounds, TSR). Presets are opinionated starting points — the settings
 * screen's manual sliders still layer on top afterward.
 *
 * "Console"/"Steam Deck" presets are just CVar/scalability bundles — there is no
 * platform-detection or first-party SDK here (that's per-platform packaging). Call the
 * matching preset from a platform-specific GameUserSettings ini or a startup check.
 */
UCLASS()
class STICKMANIMPACT_API UPlatformPresetLibrary : public UBlueprintFunctionLibrary
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Performance", meta = (WorldContext = "WorldContextObject"))
	static void ApplyPreset(const UObject* WorldContextObject, EPlatformPreset Preset);

	/**
	 * Turn on UE5 dynamic resolution: the engine scales primary screen percentage to hold
	 * TargetGPUTimeMs (per-frame GPU budget — 16.6ms = 60 FPS, 33.3ms = 30), clamped to
	 * [MinScreenPercent, MaxScreenPercent], with TSR upsampling the result. This is GPU-time
	 * driven (not FPS) and smoothed by the engine — the right layer for it, so we configure
	 * bounds rather than hand-roll a resolution loop.
	 */
	UFUNCTION(BlueprintCallable, Category = "Performance", meta = (WorldContext = "WorldContextObject"))
	static void ConfigureDynamicResolution(const UObject* WorldContextObject, bool bEnable,
		float TargetGPUTimeMs = 16.6f, float MinScreenPercent = 50.f, float MaxScreenPercent = 100.f);

private:
	static void SetCVar(const UObject* WorldContextObject, const TCHAR* Command);
	static void ApplyFrameCapAndScalability(const UObject* WorldContextObject, int32 ScalabilityLevel, float FrameCap);
};
