// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "VisualStyleSubsystem.generated.h"

class UTexture;
class UMaterialParameterCollection;

/** Outline stencil meanings (the post-process outline material color-codes by stencil). */
UENUM(BlueprintType)
enum class EOutlineKind : uint8
{
	None = 0,
	Ally = 3,      // green
	Enemy = 4,     // red
	NeutralNPC = 5,// white
	Item = 6,      // gold glow
	QuestObject = 7// sparkle+outline
};

/**
 * The C++ side of the anime/cel-shading identity. Materials/post-process assets carry the
 * actual shading (see Docs/VISUAL_STYLE.md for the recipes); this subsystem owns the runtime
 * knobs:
 *
 * - **Region LUT + time-of-day/weather grading**: `SetRegionLUT` applies the region's color
 *   LUT to the player camera post-process; `SetTimeOfDayBlend`/`SetWeatherGrade` push
 *   scalar/color params into the StyleMPC that the grading material reads (dawn pink →
 *   night blue-magenta, rain desaturation, storm contrast).
 * - **Outlines**: `SetActorOutline` stamps custom-depth stencils color-coded by
 *   EOutlineKind (values 3+ so they never collide with detective mode's 1/2). The outline
 *   post-process material reads stencil + depth for thickness-by-distance; through-wall
 *   visibility is the same custom-depth pass. `SetOutlinesEnabled` is the settings toggle.
 * - **Anime moments**: `TriggerSpeedLines` / `TriggerImpactFrame` set MPC scalars the
 *   full-screen anime-FX material animates (radial lines on dash, white-flash + action
 *   lines on heavy hits); motion smear + emotion markers are Niagara content.
 */
UCLASS()
class STICKMANIMPACT_API UVisualStyleSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	// Assign once at startup (grading + anime-FX materials read this MPC).
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Style")
	TObjectPtr<UMaterialParameterCollection> StyleMPC;

	UFUNCTION(BlueprintCallable, Category = "Style")
	void SetStyleMPC(UMaterialParameterCollection* MPC) { StyleMPC = MPC; }

	// --- Color grading --------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Style")
	void SetRegionLUT(UTexture* LUT, float Intensity = 1.f);

	// 0=dawn, 0.25=noon, 0.5=dusk, 0.75=night (the grading material lerps its ramps).
	UFUNCTION(BlueprintCallable, Category = "Style")
	void SetTimeOfDayBlend(float Blend);

	// Desaturation + contrast pushed by weather (rain/storm/fog).
	UFUNCTION(BlueprintCallable, Category = "Style")
	void SetWeatherGrade(float Desaturation, float Contrast);

	// --- Outlines -------------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Style")
	void SetActorOutline(AActor* Actor, EOutlineKind Kind);

	UFUNCTION(BlueprintCallable, Category = "Style")
	void SetOutlinesEnabled(bool bEnabled) { bOutlinesEnabled = bEnabled; }

	UFUNCTION(BlueprintPure, Category = "Style")
	bool AreOutlinesEnabled() const { return bOutlinesEnabled; }

	// --- Anime moments --------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Style")
	void TriggerSpeedLines(float Duration = 0.5f, float Intensity = 1.f);

	UFUNCTION(BlueprintCallable, Category = "Style")
	void TriggerImpactFrame(float Duration = 0.08f);

private:
	void SetMPCScalar(FName Param, float Value);

	bool bOutlinesEnabled = true;
	FTimerHandle SpeedLinesTimerHandle;
	FTimerHandle ImpactFrameTimerHandle;
};
