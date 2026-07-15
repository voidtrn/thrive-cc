// Copyright StickmanImpact Project.

#include "MinimapCaptureComponent.h"
#include "Engine/TextureRenderTarget2D.h"
#include "GameFramework/Actor.h"

UMinimapCaptureComponent::UMinimapCaptureComponent()
{
	PrimaryComponentTick.bCanEverTick = true;

	ProjectionType = ECameraProjectionMode::Orthographic;
	OrthoWidth = ZoomLevels.IsValidIndex(1) ? ZoomLevels[1] : 6000.f;
	CaptureSource = ESceneCaptureSource::SCS_FinalColorLDR;
	bCaptureEveryFrame = true;
	bCaptureOnMovement = false;

	// Looking straight down: pitch -90.
	SetRelativeRotation(FRotator(-90.f, 0.f, 0.f));
}

void UMinimapCaptureComponent::BeginPlay()
{
	Super::BeginPlay();

	MinimapRenderTarget = NewObject<UTextureRenderTarget2D>(this);
	MinimapRenderTarget->InitAutoFormat(RenderTargetSize, RenderTargetSize);
	MinimapRenderTarget->UpdateResourceImmediate(true);
	TextureTarget = MinimapRenderTarget;

	SetRelativeLocation(FVector(0.f, 0.f, CaptureHeight));
}

void UMinimapCaptureComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	// North-up: only follow the owner's XY position, never its (or our own) yaw/pitch/roll.
	if (const AActor* Owner = GetOwner())
	{
		const FVector OwnerLocation = Owner->GetActorLocation();
		SetWorldLocation(FVector(OwnerLocation.X, OwnerLocation.Y, OwnerLocation.Z + CaptureHeight));
	}
	SetWorldRotation(FRotator(-90.f, 0.f, 0.f));

	OrthoWidth = ZoomLevels.IsValidIndex(CurrentZoomIndex) ? ZoomLevels[CurrentZoomIndex] : OrthoWidth;
}

void UMinimapCaptureComponent::CycleZoom()
{
	if (ZoomLevels.Num() == 0)
	{
		return;
	}
	CurrentZoomIndex = (CurrentZoomIndex + 1) % ZoomLevels.Num();
	OrthoWidth = ZoomLevels[CurrentZoomIndex];
}
