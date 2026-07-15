// Copyright StickmanImpact Project.

#include "CharacterPreviewStage.h"
#include "Components/SkeletalMeshComponent.h"
#include "Components/SceneCaptureComponent2D.h"
#include "Engine/TextureRenderTarget2D.h"

ACharacterPreviewStage::ACharacterPreviewStage()
{
	PrimaryActorTick.bCanEverTick = false;

	// Separate scene root so rotating the mesh doesn't drag the capture around with it.
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("StageRoot"));

	PreviewMesh = CreateDefaultSubobject<USkeletalMeshComponent>(TEXT("PreviewMesh"));
	PreviewMesh->SetupAttachment(RootComponent);
	PreviewMesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);

	PreviewCapture = CreateDefaultSubobject<USceneCaptureComponent2D>(TEXT("PreviewCapture"));
	PreviewCapture->SetupAttachment(RootComponent);
	// Framed slightly above origin, looking back at the mesh from 300 units out.
	PreviewCapture->SetRelativeLocation(FVector(300.f, 0.f, 90.f));
	PreviewCapture->SetRelativeRotation(FRotator(0.f, 180.f, 0.f));
	PreviewCapture->CaptureSource = ESceneCaptureSource::SCS_FinalColorLDR;
	PreviewCapture->bCaptureEveryFrame = true;
	// Only render the preview mesh, not the whole world around the stage.
	PreviewCapture->PrimitiveRenderMode = ESceneCapturePrimitiveRenderMode::PRM_UseShowOnlyList;
}

void ACharacterPreviewStage::BeginPlay()
{
	Super::BeginPlay();

	PreviewRenderTarget = NewObject<UTextureRenderTarget2D>(this);
	PreviewRenderTarget->InitAutoFormat(RenderTargetSize, RenderTargetSize);
	PreviewRenderTarget->UpdateResourceImmediate(true);
	PreviewCapture->TextureTarget = PreviewRenderTarget;
	PreviewCapture->ShowOnlyComponent(PreviewMesh);
}

void ACharacterPreviewStage::SetPreviewMesh(USkeletalMesh* Mesh)
{
	PreviewMesh->SetSkeletalMesh(Mesh);
}

void ACharacterPreviewStage::AddYaw(float DeltaDegrees)
{
	// Capture stays fixed on the root; only the mesh spins.
	PreviewMesh->AddLocalRotation(FRotator(0.f, DeltaDegrees, 0.f));
}
