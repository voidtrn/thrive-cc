// Copyright StickmanImpact Project.

#include "StickmanInteractiveFoliage.h"
#include "Components/StaticMeshComponent.h"
#include "NiagaraFunctionLibrary.h"
#include "TimerManager.h"

AStickmanInteractiveFoliage::AStickmanInteractiveFoliage()
{
	PrimaryActorTick.bCanEverTick = false;

	FoliageMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("FoliageMesh"));
	RootComponent = FoliageMesh;
	FoliageMesh->SetCollisionResponseToAllChannels(ECR_Overlap);
}

void AStickmanInteractiveFoliage::BeginPlay()
{
	Super::BeginPlay();

	OriginalScale = GetActorScale3D();
	for (int32 Index = 0; Index < FoliageMesh->GetNumMaterials(); ++Index)
	{
		OriginalMaterials.Add(FoliageMesh->GetMaterial(Index));
	}
}

void AStickmanInteractiveFoliage::OnBurned()
{
	if (BurntMaterial)
	{
		FoliageMesh->SetMaterial(0, BurntMaterial);
	}
	ScheduleRegrow();
}

void AStickmanInteractiveFoliage::OnFrozen()
{
	if (FrozenMaterial)
	{
		FoliageMesh->SetMaterial(0, FrozenMaterial);
	}
	ScheduleRegrow();
}

void AStickmanInteractiveFoliage::OnCut()
{
	if (CutVFX)
	{
		UNiagaraFunctionLibrary::SpawnSystemAtLocation(this, CutVFX, GetActorLocation());
	}

	if (RegrowTime <= 0.f)
	{
		Destroy();
		return;
	}

	// Hide instead of Destroy so the clump can regrow.
	bWasCut = true;
	SetActorHiddenInGame(true);
	SetActorEnableCollision(false);
	ScheduleRegrow();
}

void AStickmanInteractiveFoliage::ScheduleRegrow()
{
	if (RegrowTime <= 0.f)
	{
		return;
	}
	GetWorldTimerManager().SetTimer(RegrowTimerHandle, this, &AStickmanInteractiveFoliage::BeginRegrow, RegrowTime, false);
}

void AStickmanInteractiveFoliage::BeginRegrow()
{
	for (int32 Index = 0; Index < OriginalMaterials.Num(); ++Index)
	{
		FoliageMesh->SetMaterial(Index, OriginalMaterials[Index]);
	}

	if (bWasCut)
	{
		bWasCut = false;
		SetActorHiddenInGame(false);
		SetActorEnableCollision(true);

		// Grow back visibly rather than popping in at full size.
		RegrowScaleAlpha = 0.2f;
		SetActorScale3D(OriginalScale * RegrowScaleAlpha);
		GetWorldTimerManager().SetTimer(RegrowScaleTimerHandle, this, &AStickmanInteractiveFoliage::TickRegrow, 0.5f, true);
	}
}

void AStickmanInteractiveFoliage::TickRegrow()
{
	RegrowScaleAlpha = FMath::Min(RegrowScaleAlpha + 0.05f, 1.f);
	SetActorScale3D(OriginalScale * RegrowScaleAlpha);

	if (RegrowScaleAlpha >= 1.f)
	{
		GetWorldTimerManager().ClearTimer(RegrowScaleTimerHandle);
	}
}
