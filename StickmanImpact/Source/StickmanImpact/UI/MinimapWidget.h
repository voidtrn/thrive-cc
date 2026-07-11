// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "MinimapWidget.generated.h"

class UImage;
class UCanvasPanel;
class UMinimapCaptureComponent;
class UMaterialInterface;
class UMaterialInstanceDynamic;
class UTextureRenderTarget2D;
class UTexture2D;

UENUM(BlueprintType)
enum class EMinimapMarkerType : uint8
{
	Quest,
	Waypoint,
	Enemy,
	NPC,
	Resource
};

/**
 * Displays UMinimapCaptureComponent's render target (north-up), a rotating player triangle,
 * dynamically-pooled markers (quest/waypoint/enemy/NPC/resource), zoom cycling, and a
 * persistent fog-of-war reveal render target composited with the capture in a material.
 *
 * Requires two Material assets authored in-editor (documented in README):
 * - FogRevealMaterial: unlit, additive-ish, params "RevealCenter" (vector, UV 0-1) and
 *   "RevealRadius" (scalar) — draws a soft white circle, everything else transparent/black.
 * - CompositeMaterial: params "MapCapture" (texture) and "FogReveal" (texture) — output =
 *   MapCapture tinted dark where FogReveal is black, full color where FogReveal is white.
 */
UCLASS()
class STICKMANIMPACT_API UMinimapWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Minimap")
	TObjectPtr<UMaterialInterface> FogRevealMaterial;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Minimap")
	TObjectPtr<UMaterialInterface> CompositeMaterial;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Minimap")
	float RevealRadius = 0.12f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Minimap")
	float MarkerRefreshInterval = 0.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Minimap")
	float MarkerQueryRadius = 8000.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Minimap")
	TObjectPtr<UTexture2D> EnemyMarkerIcon;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Minimap")
	TObjectPtr<UTexture2D> NPCMarkerIcon;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Minimap")
	TObjectPtr<UTexture2D> ResourceMarkerIcon;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Minimap")
	TObjectPtr<UTexture2D> WaypointMarkerIcon;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Minimap")
	TObjectPtr<UTexture2D> QuestMarkerIcon;

	UFUNCTION(BlueprintCallable, Category = "Minimap")
	void CycleZoom();

protected:
	virtual void NativeConstruct() override;
	virtual void NativeTick(const FGeometry& MyGeometry, float InDeltaTime) override;

	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> MapImage;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> PlayerIconImage;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UCanvasPanel> MarkerCanvas;

private:
	UMinimapCaptureComponent* FindCaptureComponent() const;
	FVector2D WorldToMapUV(const FVector& WorldLocation, const FVector& PlayerLocation, float OrthoWidth) const;
	void RefreshMarkers();
	UImage* AcquireMarkerImage(int32 Index);

	UPROPERTY()
	TObjectPtr<UTextureRenderTarget2D> FogRevealRT;

	UPROPERTY()
	TObjectPtr<UMaterialInstanceDynamic> FogRevealMID;

	UPROPERTY()
	TObjectPtr<UMaterialInstanceDynamic> CompositeMID;

	UPROPERTY()
	TArray<TObjectPtr<UImage>> PooledMarkerImages;

	float TimeSinceMarkerRefresh = 0.f;
};
