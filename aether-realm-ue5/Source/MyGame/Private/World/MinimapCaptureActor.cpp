#include "World/MinimapCaptureActor.h"
#include "Components/SceneCaptureComponent2D.h"
#include "Engine/TextureRenderTarget2D.h"
#include "Kismet/GameplayStatics.h"

AMinimapCaptureActor::AMinimapCaptureActor()
{
	PrimaryActorTick.bCanEverTick = true;

	Capture = CreateDefaultSubobject<USceneCaptureComponent2D>(TEXT("Capture"));
	SetRootComponent(Capture);

	Capture->ProjectionType = ECameraProjectionMode::Orthographic;
	Capture->OrthoWidth = 4000.f;
	Capture->CaptureSource = ESceneCaptureSource::SCS_FinalColorLDR;
	Capture->bCaptureEveryFrame = false; // manual interval
	Capture->bCaptureOnMovement = false;
	// Lihat lurus ke bawah
	Capture->SetRelativeRotation(FRotator(-90.f, 0.f, 0.f));
}

void AMinimapCaptureActor::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);

	const APawn* Player = UGameplayStatics::GetPlayerPawn(this, 0);
	if (!Player)
	{
		return;
	}

	// Follow player dari atas
	SetActorLocation(Player->GetActorLocation() + FVector(0, 0, Height));

	TimeSinceCapture += DeltaSeconds;
	if (TimeSinceCapture >= CaptureInterval)
	{
		TimeSinceCapture = 0.f;
		if (RenderTarget)
		{
			Capture->TextureTarget = RenderTarget;
			Capture->CaptureScene();
		}
	}
}

void AMinimapCaptureActor::SetZoom(float NewOrthoWidth)
{
	Capture->OrthoWidth = FMath::Clamp(NewOrthoWidth, MinOrthoWidth, MaxOrthoWidth);
}

float AMinimapCaptureActor::GetZoom() const
{
	return Capture->OrthoWidth;
}
