// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/SceneCaptureComponent2D.h"
#include "MinimapCaptureComponent.generated.h"

class UTextureRenderTarget2D;

/**
 * Orthographic top-down capture attached above the player, feeding a render target the
 * minimap widget displays. North-up (doesn't rotate with the player — the player icon
 * rotates instead, see UMinimapWidget). Uses the base USceneCaptureComponent2D's own
 * OrthoWidth for zoom (SetZoom() just writes to it) rather than duplicating the property.
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UMinimapCaptureComponent : public USceneCaptureComponent2D
{
	GENERATED_BODY()

public:
	UMinimapCaptureComponent();

	virtual void BeginPlay() override;
	virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Minimap")
	float CaptureHeight = 3000.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Minimap")
	int32 RenderTargetSize = 512;

	// World units visible across the render target — smaller = more zoomed in. A few presets
	// to cycle through for "map zoom levels".
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Minimap")
	TArray<float> ZoomLevels = { 3000.f, 6000.f, 12000.f };

	UPROPERTY(BlueprintReadOnly, Category = "Minimap")
	int32 CurrentZoomIndex = 1;

	UFUNCTION(BlueprintCallable, Category = "Minimap")
	void CycleZoom();

	UFUNCTION(BlueprintPure, Category = "Minimap")
	float GetCurrentOrthoWidth() const { return OrthoWidth; }

	UFUNCTION(BlueprintPure, Category = "Minimap")
	UTextureRenderTarget2D* GetMinimapRenderTarget() const { return MinimapRenderTarget; }

private:
	UPROPERTY()
	TObjectPtr<UTextureRenderTarget2D> MinimapRenderTarget;
};
