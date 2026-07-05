#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "MinimapCaptureActor.generated.h"

class USceneCaptureComponent2D;
class UTextureRenderTarget2D;

/**
 * Kamera top-down ortho yang follow player → render ke RT_Minimap.
 * UI: image bulat (material mask) sample render target, rotate ikut player.
 * Place satu di L_OpenWorld, assign RenderTarget.
 */
UCLASS()
class MYGAME_API AMinimapCaptureActor : public AActor
{
	GENERATED_BODY()

public:
	AMinimapCaptureActor();

	virtual void Tick(float DeltaSeconds) override;

	/** Zoom minimap (scroll di area minimap). */
	UFUNCTION(BlueprintCallable, Category = "Minimap")
	void SetZoom(float NewOrthoWidth);

	UFUNCTION(BlueprintPure, Category = "Minimap")
	float GetZoom() const;

protected:
	UPROPERTY(VisibleAnywhere, Category = "Components")
	TObjectPtr<USceneCaptureComponent2D> Capture;

	/** RT_Minimap (buat di editor: 512x512 RGBA8). */
	UPROPERTY(EditAnywhere, Category = "Minimap")
	TObjectPtr<UTextureRenderTarget2D> RenderTarget;

	UPROPERTY(EditAnywhere, Category = "Minimap")
	float Height = 5000.f;

	UPROPERTY(EditAnywhere, Category = "Minimap")
	float MinOrthoWidth = 2000.f;

	UPROPERTY(EditAnywhere, Category = "Minimap")
	float MaxOrthoWidth = 12000.f;

	/** Capture 15 fps cukup — hemat GPU. */
	UPROPERTY(EditAnywhere, Category = "Minimap")
	float CaptureInterval = 1.f / 15.f;

private:
	float TimeSinceCapture = 0.f;
};
