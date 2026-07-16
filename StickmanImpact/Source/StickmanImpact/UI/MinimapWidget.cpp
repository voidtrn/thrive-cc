// Copyright StickmanImpact Project.

#include "MinimapWidget.h"
#include "MinimapCaptureComponent.h"
#include "Components/Image.h"
#include "Components/CanvasPanel.h"
#include "Components/CanvasPanelSlot.h"
#include "Kismet/GameplayStatics.h"
#include "Kismet/KismetRenderingLibrary.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Engine/TextureRenderTarget2D.h"
#include "World/WaypointManager.h"
#include "World/WaypointActor.h"
#include "World/ResourceNode.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "AI/StickmanNPC.h"
#include "Quest/QuestManager.h"
#include "Quest/QuestDataAsset.h"
#include "EngineUtils.h"

namespace
{
	// World bounds the fog-of-war reveal texture maps to — tune to your level's extents.
	constexpr float WorldOriginX = -50000.f;
	constexpr float WorldOriginY = -50000.f;
	constexpr float WorldSize = 100000.f;
}

void UMinimapWidget::NativeConstruct()
{
	Super::NativeConstruct();

	FogRevealRT = UKismetRenderingLibrary::CreateRenderTarget2D(this, 1024, 1024, ETextureRenderTargetFormat::RTF_RGBA8);

	if (FogRevealMaterial)
	{
		FogRevealMID = UMaterialInstanceDynamic::Create(FogRevealMaterial, this);
	}
	if (CompositeMaterial)
	{
		CompositeMID = UMaterialInstanceDynamic::Create(CompositeMaterial, this);
		if (MapImage)
		{
			MapImage->SetBrushFromMaterial(CompositeMID);
		}
	}
}

UMinimapCaptureComponent* UMinimapWidget::FindCaptureComponent() const
{
	const APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0);
	return PlayerPawn ? PlayerPawn->FindComponentByClass<UMinimapCaptureComponent>() : nullptr;
}

FVector2D UMinimapWidget::WorldToMapUV(const FVector& WorldLocation, const FVector& PlayerLocation, float OrthoWidth) const
{
	// Map is player-centered and north-up: local UV 0.5,0.5 is always the player.
	const FVector2D Delta(WorldLocation.X - PlayerLocation.X, WorldLocation.Y - PlayerLocation.Y);
	const FVector2D UV = FVector2D(0.5f, 0.5f) + FVector2D(Delta.X, -Delta.Y) / FMath::Max(OrthoWidth, 1.f);
	return UV;
}

void UMinimapWidget::NativeTick(const FGeometry& MyGeometry, float InDeltaTime)
{
	Super::NativeTick(MyGeometry, InDeltaTime);

	const APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0);
	UMinimapCaptureComponent* CaptureComponent = FindCaptureComponent();
	if (!PlayerPawn || !CaptureComponent)
	{
		return;
	}

	const FVector PlayerLocation = PlayerPawn->GetActorLocation();
	const float OrthoWidth = CaptureComponent->GetCurrentOrthoWidth();

	if (PlayerIconImage)
	{
		PlayerIconImage->SetRenderTransformAngle(PlayerPawn->GetActorRotation().Yaw);
	}

	// Fog of war: reveal a circle around the player's WORLD-space UV (fixed world bounds,
	// independent of the player-centered capture) into a persistent (never-cleared) RT.
	const FVector2D PlayerWorldUV((PlayerLocation.X - WorldOriginX) / WorldSize, (PlayerLocation.Y - WorldOriginY) / WorldSize);

	if (FogRevealMID && FogRevealRT)
	{
		FogRevealMID->SetVectorParameterValue(TEXT("RevealCenter"), FLinearColor(PlayerWorldUV.X, PlayerWorldUV.Y, 0.f, 0.f));
		FogRevealMID->SetScalarParameterValue(TEXT("RevealRadius"), RevealRadius);
		UKismetRenderingLibrary::DrawMaterialToRenderTarget(this, FogRevealRT, FogRevealMID);
	}

	if (CompositeMID)
	{
		CompositeMID->SetTextureParameterValue(TEXT("MapCapture"), CaptureComponent->GetMinimapRenderTarget());
		CompositeMID->SetTextureParameterValue(TEXT("FogReveal"), FogRevealRT);
		CompositeMID->SetVectorParameterValue(TEXT("PlayerWorldUV"), FLinearColor(PlayerWorldUV.X, PlayerWorldUV.Y, 0.f, 0.f));
		CompositeMID->SetScalarParameterValue(TEXT("OrthoWidthUVFraction"), OrthoWidth / WorldSize);
	}

	TimeSinceMarkerRefresh += InDeltaTime;
	if (TimeSinceMarkerRefresh >= MarkerRefreshInterval)
	{
		TimeSinceMarkerRefresh = 0.f;
		RefreshMarkers();
	}
}

UImage* UMinimapWidget::AcquireMarkerImage(int32 Index)
{
	if (!MarkerCanvas)
	{
		return nullptr;
	}
	if (PooledMarkerImages.IsValidIndex(Index))
	{
		return PooledMarkerImages[Index];
	}

	UImage* NewImage = NewObject<UImage>(this);
	MarkerCanvas->AddChildToCanvas(NewImage);
	if (UCanvasPanelSlot* CanvasSlot = Cast<UCanvasPanelSlot>(NewImage->Slot))
	{
		CanvasSlot->SetSize(FVector2D(16.f, 16.f));
		CanvasSlot->SetAlignment(FVector2D(0.5f, 0.5f));
	}
	PooledMarkerImages.Add(NewImage);
	return NewImage;
}

void UMinimapWidget::RefreshMarkers()
{
	const APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0);
	UMinimapCaptureComponent* CaptureComponent = FindCaptureComponent();
	UWorld* World = GetWorld();
	if (!PlayerPawn || !CaptureComponent || !World || !MapImage)
	{
		return;
	}

	const FVector PlayerLocation = PlayerPawn->GetActorLocation();
	const float OrthoWidth = CaptureComponent->GetCurrentOrthoWidth();
	const FVector2D MapSize = MapImage->GetCachedGeometry().GetLocalSize();

	struct FPendingMarker { FVector WorldLocation; UTexture2D* Icon; };
	TArray<FPendingMarker> Pending;

	for (TActorIterator<AStickmanEnemyCharacter> It(World); It; ++It)
	{
		if (FVector::Dist(It->GetActorLocation(), PlayerLocation) <= MarkerQueryRadius)
		{
			Pending.Add({ It->GetActorLocation(), EnemyMarkerIcon });
		}
	}
	for (TActorIterator<AStickmanNPC> It(World); It; ++It)
	{
		if (FVector::Dist(It->GetActorLocation(), PlayerLocation) <= MarkerQueryRadius)
		{
			Pending.Add({ It->GetActorLocation(), NPCMarkerIcon });
		}
	}
	for (TActorIterator<AResourceNode> It(World); It; ++It)
	{
		if (It->IsAvailable() && FVector::Dist(It->GetActorLocation(), PlayerLocation) <= MarkerQueryRadius)
		{
			Pending.Add({ It->GetActorLocation(), ResourceMarkerIcon });
		}
	}
	if (const UGameInstance* GameInstance = GetGameInstance())
	{
		if (const UWaypointManager* WaypointManager = GameInstance->GetSubsystem<UWaypointManager>())
		{
			for (AWaypointActor* Waypoint : WaypointManager->GetUnlockedWaypoints())
			{
				if (Waypoint && FVector::Dist(Waypoint->GetActorLocation(), PlayerLocation) <= MarkerQueryRadius)
				{
					Pending.Add({ Waypoint->GetActorLocation(), WaypointMarkerIcon });
				}
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
					if (Objective.ObjectiveType == EObjectiveType::ReachLocation && !Objective.IsComplete())
					{
						Pending.Add({ Objective.TargetLocation, QuestMarkerIcon });
					}
					else if (Objective.TargetActor && !Objective.IsComplete())
					{
						Pending.Add({ Objective.TargetActor->GetActorLocation(), QuestMarkerIcon });
					}
				}
			}
		}
	}

	int32 VisibleCount = 0;
	for (const FPendingMarker& Marker : Pending)
	{
		const FVector2D UV = WorldToMapUV(Marker.WorldLocation, PlayerLocation, OrthoWidth);
		if (UV.X < 0.f || UV.X > 1.f || UV.Y < 0.f || UV.Y > 1.f)
		{
			continue; // Off the currently-zoomed map area.
		}

		UImage* MarkerImage = AcquireMarkerImage(VisibleCount);
		if (!MarkerImage)
		{
			continue;
		}
		if (Marker.Icon)
		{
			MarkerImage->SetBrushFromTexture(Marker.Icon);
		}
		MarkerImage->SetVisibility(ESlateVisibility::HitTestInvisible);
		if (UCanvasPanelSlot* CanvasSlot = Cast<UCanvasPanelSlot>(MarkerImage->Slot))
		{
			CanvasSlot->SetPosition(FVector2D(UV.X * MapSize.X, UV.Y * MapSize.Y));
		}
		++VisibleCount;
	}

	// Hide any pooled images left over from a previous, busier refresh.
	for (int32 Index = VisibleCount; Index < PooledMarkerImages.Num(); ++Index)
	{
		PooledMarkerImages[Index]->SetVisibility(ESlateVisibility::Collapsed);
	}
}

void UMinimapWidget::CycleZoom()
{
	if (UMinimapCaptureComponent* CaptureComponent = FindCaptureComponent())
	{
		CaptureComponent->CycleZoom();
	}
}

void UMinimapWidget::RevealAll()
{
	if (FogRevealRT)
	{
		UKismetRenderingLibrary::ClearRenderTarget2D(this, FogRevealRT, FLinearColor::White);
	}
}
