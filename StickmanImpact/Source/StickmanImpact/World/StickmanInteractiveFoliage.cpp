// Copyright StickmanImpact Project.

#include "StickmanInteractiveFoliage.h"
#include "Components/StaticMeshComponent.h"
#include "NiagaraFunctionLibrary.h"

AStickmanInteractiveFoliage::AStickmanInteractiveFoliage()
{
	PrimaryActorTick.bCanEverTick = false;

	FoliageMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("FoliageMesh"));
	RootComponent = FoliageMesh;
	FoliageMesh->SetCollisionResponseToAllChannels(ECR_Overlap);
}

void AStickmanInteractiveFoliage::OnBurned()
{
	if (BurntMaterial)
	{
		FoliageMesh->SetMaterial(0, BurntMaterial);
	}
}

void AStickmanInteractiveFoliage::OnFrozen()
{
	if (FrozenMaterial)
	{
		FoliageMesh->SetMaterial(0, FrozenMaterial);
	}
}

void AStickmanInteractiveFoliage::OnCut()
{
	if (CutVFX)
	{
		UNiagaraFunctionLibrary::SpawnSystemAtLocation(this, CutVFX, GetActorLocation());
	}
	Destroy();
}
