// Copyright StickmanImpact Project.

#include "MapScreenWidget.h"
#include "Components/Image.h"
#include "Components/CanvasPanel.h"
#include "Components/CanvasPanelSlot.h"
#include "Components/TextBlock.h"
#include "Components/Button.h"
#include "World/WaypointManager.h"
#include "World/WaypointActor.h"
#include "World/CollectibleManager.h"
#include "Quest/QuestManager.h"
#include "UI/MenuNavigationManager.h"

void UMapScreenWidget::NativeConstruct()
{
	Super::NativeConstruct();

	if (TeleportButton)
	{
		TeleportButton->OnClicked.AddDynamic(this, &UMapScreenWidget::TeleportToSelected);
		TeleportButton->SetVisibility(ESlateVisibility::Collapsed);
	}
	if (MapImage && SurfaceMapTexture)
	{
		MapImage->SetBrushFromTexture(SurfaceMapTexture);
	}
	if (MapLayers.Num() == 0 && SurfaceMapTexture)
	{
		MapLayers.Add(SurfaceMapTexture);
	}

	RefreshMarkers();
	RefreshRegionLabels();
}

FVector2D UMapScreenWidget::WorldToMapPosition(const FVector& WorldLocation) const
{
	if (!MapImage)
	{
		return FVector2D::ZeroVector;
	}
	const FVector2D MapSize = MapImage->GetCachedGeometry().GetLocalSize();
	const FVector2D UV(
		(WorldLocation.X - WorldOrigin.X) / WorldSize,
		(WorldLocation.Y - WorldOrigin.Y) / WorldSize);
	// Pan/zoom applied on top of the base UV mapping.
	return (UV * MapSize + CurrentPan) * CurrentZoom;
}

void UMapScreenWidget::AddZoom(float Delta)
{
	CurrentZoom = FMath::Clamp(CurrentZoom + Delta, ZoomRange.X, ZoomRange.Y);
	if (MapImage)
	{
		MapImage->SetRenderScale(FVector2D(CurrentZoom, CurrentZoom));
	}
	RefreshMarkers();
	RefreshRegionLabels();
}

void UMapScreenWidget::AddPan(FVector2D Delta)
{
	CurrentPan += Delta / FMath::Max(CurrentZoom, 0.01f);
	if (MapImage)
	{
		MapImage->SetRenderTranslation(CurrentPan * CurrentZoom);
	}
	RefreshMarkers();
	RefreshRegionLabels();
}

void UMapScreenWidget::CycleMapLayer()
{
	if (MapLayers.Num() == 0)
	{
		return;
	}
	CurrentLayerIndex = (CurrentLayerIndex + 1) % MapLayers.Num();
	if (MapImage && MapLayers[CurrentLayerIndex])
	{
		MapImage->SetBrushFromTexture(MapLayers[CurrentLayerIndex]);
	}
	if (LayerNameText)
	{
		LayerNameText->SetText(CurrentLayerIndex == 0
			? NSLOCTEXT("Map", "Surface", "Surface")
			: FText::Format(NSLOCTEXT("Map", "UndergroundFormat", "Underground {0}"), FText::AsNumber(CurrentLayerIndex)));
	}
}

UImage* UMapScreenWidget::AcquireMarkerImage(int32 Index)
{
	if (!MarkerCanvas)
	{
		return nullptr;
	}
	if (PooledMarkers.IsValidIndex(Index))
	{
		return PooledMarkers[Index];
	}
	UImage* NewImage = NewObject<UImage>(this);
	MarkerCanvas->AddChildToCanvas(NewImage);
	if (UCanvasPanelSlot* CanvasSlot = Cast<UCanvasPanelSlot>(NewImage->Slot))
	{
		CanvasSlot->SetSize(FVector2D(24.f, 24.f));
		CanvasSlot->SetAlignment(FVector2D(0.5f, 0.5f));
	}
	PooledMarkers.Add(NewImage);
	return NewImage;
}

UTextBlock* UMapScreenWidget::AcquireRegionLabel(int32 Index)
{
	if (!MarkerCanvas)
	{
		return nullptr;
	}
	if (PooledRegionLabels.IsValidIndex(Index))
	{
		return PooledRegionLabels[Index];
	}
	UTextBlock* NewLabel = NewObject<UTextBlock>(this);
	MarkerCanvas->AddChildToCanvas(NewLabel);
	if (UCanvasPanelSlot* CanvasSlot = Cast<UCanvasPanelSlot>(NewLabel->Slot))
	{
		CanvasSlot->SetAlignment(FVector2D(0.5f, 0.5f));
		CanvasSlot->SetAutoSize(true);
	}
	PooledRegionLabels.Add(NewLabel);
	return NewLabel;
}

void UMapScreenWidget::RefreshMarkers()
{
	const UGameInstance* GameInstance = GetGameInstance();
	if (!GameInstance)
	{
		return;
	}

	int32 MarkerIndex = 0;

	if (const UWaypointManager* WaypointManager = GameInstance->GetSubsystem<UWaypointManager>())
	{
		for (AWaypointActor* Waypoint : WaypointManager->GetUnlockedWaypoints())
		{
			UImage* Marker = Waypoint ? AcquireMarkerImage(MarkerIndex) : nullptr;
			if (!Marker)
			{
				continue;
			}
			if (WaypointMarkerIcon)
			{
				Marker->SetBrushFromTexture(WaypointMarkerIcon);
			}
			Marker->SetVisibility(ESlateVisibility::Visible);
			if (UCanvasPanelSlot* CanvasSlot = Cast<UCanvasPanelSlot>(Marker->Slot))
			{
				CanvasSlot->SetPosition(WorldToMapPosition(Waypoint->GetActorLocation()));
			}
			++MarkerIndex;
			// Marker click-to-select: markers are plain UImages here; wrap them in Buttons in
			// a WBP subclass (or forward OnMouseButtonDown) and call SelectWaypoint(Waypoint).
		}
	}

	if (const UQuestManager* QuestManager = GameInstance->GetSubsystem<UQuestManager>())
	{
		const FString TrackedID = QuestManager->GetTrackedQuestID();
		if (!TrackedID.IsEmpty())
		{
			const FQuestStage Stage = QuestManager->GetCurrentStage(TrackedID);
			for (const FQuestObjective& Objective : Stage.Objectives)
			{
				if (Objective.IsComplete())
				{
					continue;
				}
				const FVector MarkerWorld = Objective.TargetActor
					? Objective.TargetActor->GetActorLocation() : Objective.TargetLocation;
				if (MarkerWorld.IsNearlyZero())
				{
					continue;
				}
				UImage* Marker = AcquireMarkerImage(MarkerIndex);
				if (!Marker)
				{
					continue;
				}
				if (QuestMarkerIcon)
				{
					Marker->SetBrushFromTexture(QuestMarkerIcon);
				}
				Marker->SetVisibility(ESlateVisibility::Visible);
				if (UCanvasPanelSlot* CanvasSlot = Cast<UCanvasPanelSlot>(Marker->Slot))
				{
					CanvasSlot->SetPosition(WorldToMapPosition(MarkerWorld));
				}
				++MarkerIndex;
			}
		}
	}

	for (int32 Index = MarkerIndex; Index < PooledMarkers.Num(); ++Index)
	{
		PooledMarkers[Index]->SetVisibility(ESlateVisibility::Collapsed);
	}
}

void UMapScreenWidget::RefreshRegionLabels()
{
	const UGameInstance* GameInstance = GetGameInstance();
	const UCollectibleManager* Collectibles = GameInstance ? GameInstance->GetSubsystem<UCollectibleManager>() : nullptr;

	for (int32 Index = 0; Index < Regions.Num(); ++Index)
	{
		UTextBlock* Label = AcquireRegionLabel(Index);
		if (!Label)
		{
			continue;
		}
		const FMapRegionEntry& Region = Regions[Index];
		const float Progress = Collectibles ? Collectibles->GetRegionProgress(Region.RegionID) * 100.f : 0.f;
		Label->SetText(FText::Format(NSLOCTEXT("Map", "RegionFormat", "{0}  ({1}%)"),
			Region.RegionName, FText::AsNumber(FMath::RoundToInt(Progress))));
		Label->SetVisibility(ESlateVisibility::HitTestInvisible);
		if (UCanvasPanelSlot* CanvasSlot = Cast<UCanvasPanelSlot>(Label->Slot))
		{
			CanvasSlot->SetPosition(WorldToMapPosition(FVector(Region.WorldCenter.X, Region.WorldCenter.Y, 0.f)));
		}
	}
}

void UMapScreenWidget::SelectWaypoint(AWaypointActor* Waypoint)
{
	SelectedWaypoint = Waypoint;
	if (SelectedWaypointNameText)
	{
		SelectedWaypointNameText->SetText(Waypoint ? Waypoint->WaypointName : FText::GetEmpty());
	}
	if (TeleportButton)
	{
		TeleportButton->SetVisibility(Waypoint ? ESlateVisibility::Visible : ESlateVisibility::Collapsed);
	}
}

void UMapScreenWidget::TeleportToSelected()
{
	if (!SelectedWaypoint)
	{
		return;
	}

	UGameInstance* GameInstance = GetGameInstance();
	if (UWaypointManager* WaypointManager = GameInstance ? GameInstance->GetSubsystem<UWaypointManager>() : nullptr)
	{
		WaypointManager->TeleportTo(SelectedWaypoint);
		// Close all menus so the player lands back in gameplay.
		if (UMenuNavigationManager* MenuNav = GameInstance->GetSubsystem<UMenuNavigationManager>())
		{
			MenuNav->PopToRoot();
		}
	}
}
