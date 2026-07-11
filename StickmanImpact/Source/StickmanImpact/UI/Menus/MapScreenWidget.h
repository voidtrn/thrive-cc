// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "MapScreenWidget.generated.h"

class UImage;
class UCanvasPanel;
class UTextBlock;
class UButton;
class UTexture2D;
class AWaypointActor;

/** A named region's bounds on the world map, for labels + exploration % readout. */
USTRUCT(BlueprintType)
struct FMapRegionEntry
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Map")
	FName RegionID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Map")
	FText RegionName;

	// World-space center of the region label.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Map")
	FVector2D WorldCenter = FVector2D::ZeroVector;
};

/**
 * Full-screen map: a pre-authored map texture (not a live capture — an open-world map is a
 * painted/baked image in practice), zoom + pan, region name labels, exploration % per region
 * (from UCollectibleManager), waypoint markers with a click-to-teleport button, and quest
 * markers for the tracked quest. Underground layers = swap MapTexture per layer index.
 *
 * World-to-map mapping: the map texture covers the world rect [WorldOrigin, WorldOrigin +
 * WorldSize] — keep in sync with the level's actual bounds (same convention as the minimap's
 * fog of war).
 */
UCLASS()
class STICKMANIMPACT_API UMapScreenWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Map")
	TObjectPtr<UTexture2D> SurfaceMapTexture;

	// Index 0 = surface; additional entries are underground layers toggled by CycleMapLayer().
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Map")
	TArray<TObjectPtr<UTexture2D>> MapLayers;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Map")
	FVector2D WorldOrigin = FVector2D(-50000.f, -50000.f);

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Map")
	float WorldSize = 100000.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Map")
	TArray<FMapRegionEntry> Regions;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Map")
	FVector2D ZoomRange = FVector2D(0.5f, 4.f);

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Map")
	TObjectPtr<UTexture2D> WaypointMarkerIcon;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Map")
	TObjectPtr<UTexture2D> QuestMarkerIcon;

	UFUNCTION(BlueprintCallable, Category = "Map")
	void AddZoom(float Delta);

	UFUNCTION(BlueprintCallable, Category = "Map")
	void AddPan(FVector2D Delta);

	UFUNCTION(BlueprintCallable, Category = "Map")
	void CycleMapLayer();

	// Called by a waypoint marker's button; shows the teleport confirm for that waypoint.
	UFUNCTION(BlueprintCallable, Category = "Map")
	void SelectWaypoint(AWaypointActor* Waypoint);

	UFUNCTION(BlueprintCallable, Category = "Map")
	void TeleportToSelected();

protected:
	virtual void NativeConstruct() override;

	void RefreshMarkers();
	void RefreshRegionLabels();
	FVector2D WorldToMapPosition(const FVector& WorldLocation) const;

	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> MapImage;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UCanvasPanel> MarkerCanvas;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> SelectedWaypointNameText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> TeleportButton;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> LayerNameText;

private:
	UImage* AcquireMarkerImage(int32 Index);
	UTextBlock* AcquireRegionLabel(int32 Index);

	UPROPERTY()
	TArray<TObjectPtr<UImage>> PooledMarkers;

	UPROPERTY()
	TArray<TObjectPtr<UTextBlock>> PooledRegionLabels;

	UPROPERTY()
	TObjectPtr<AWaypointActor> SelectedWaypoint;

	float CurrentZoom = 1.f;
	FVector2D CurrentPan = FVector2D::ZeroVector;
	int32 CurrentLayerIndex = 0;
};
