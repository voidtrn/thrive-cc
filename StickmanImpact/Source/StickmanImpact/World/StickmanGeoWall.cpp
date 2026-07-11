// Copyright StickmanImpact Project.

#include "StickmanGeoWall.h"
#include "Components/StaticMeshComponent.h"
#include "TimerManager.h"

AStickmanGeoWall::AStickmanGeoWall()
{
	PrimaryActorTick.bCanEverTick = false;

	WallMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("WallMesh"));
	RootComponent = WallMesh;
	WallMesh->SetCollisionEnabled(ECollisionEnabled::QueryAndPhysics);
	WallMesh->SetCollisionResponseToAllChannels(ECR_Block);
}

void AStickmanGeoWall::BeginPlay()
{
	Super::BeginPlay();

	FTimerHandle DestroyTimerHandle;
	GetWorldTimerManager().SetTimer(DestroyTimerHandle, this, &AActor::K2_DestroyActor, WallDuration, false);
}
