// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Kismet/BlueprintFunctionLibrary.h"
#include "UIJuiceLibrary.generated.h"

UENUM(BlueprintType)
enum class EUIEase : uint8
{
	Linear,
	SmoothStep,   // ease in/out
	EaseOutBack,  // overshoot then settle — button/popup bounce
	EaseOutElastic,
	EaseInCubic,
	EaseOutCubic
};

/**
 * Easing + micro-animation math for UMG juice. WBP animations own keyframed sequences;
 * this covers the procedural cases those can't do cleanly — overshoot bounces, springy
 * settle, per-frame scale/opacity driven from a NativeTick alpha. Pure math, no state.
 *
 * Typical use: a widget stores Elapsed, divides by Duration for Alpha, calls Ease(...) then
 * feeds the result into SetRenderScale/opacity. UJuicyButtonWidget below does exactly this
 * for hover/press so most buttons need no per-widget code at all.
 */
UCLASS()
class STICKMANIMPACT_API UUIJuiceLibrary : public UBlueprintFunctionLibrary
{
	GENERATED_BODY()

public:
	// Remap a 0-1 alpha through the chosen curve (can exceed [0,1] for overshoot curves).
	UFUNCTION(BlueprintPure, Category = "UI|Juice")
	static float Ease(EUIEase Curve, float Alpha);

	// Scalar lerp through a curve (A..B).
	UFUNCTION(BlueprintPure, Category = "UI|Juice")
	static float EaseFloat(EUIEase Curve, float A, float B, float Alpha);

	// Uniform render-scale vector for a bounce/pop (EaseOutBack), e.g. item-obtained popup.
	UFUNCTION(BlueprintPure, Category = "UI|Juice")
	static FVector2D PopScale(float Alpha, float StartScale = 0.6f, float EndScale = 1.f);

	// Critical-damped spring step toward Target. Returns the new value; updates Velocity.
	// Stiffness ~ how snappy; DampingRatio 1 = no overshoot, <1 = bouncy.
	UFUNCTION(BlueprintCallable, Category = "UI|Juice")
	static float SpringInterp(float Current, float Target, UPARAM(ref) float& Velocity,
		float DeltaTime, float Stiffness = 12.f, float DampingRatio = 0.6f);

	// A short decaying shake offset for "damage taken" widget kick — feed accumulating Time.
	UFUNCTION(BlueprintPure, Category = "UI|Juice")
	static FVector2D DecayingShake(float Time, float Duration, float Magnitude = 12.f, float Frequency = 40.f);
};
