// Copyright StickmanImpact Project.

#include "StickmanPressurePlate.h"
#include "Components/StaticMeshComponent.h"
#include "Components/BoxComponent.h"
#include "GameFramework/Character.h"

AStickmanPressurePlate::AStickmanPressurePlate()
{
	PrimaryActorTick.bCanEverTick = false;

	PlateMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("PlateMesh"));
	RootComponent = PlateMesh;

	DetectionBox = CreateDefaultSubobject<UBoxComponent>(TEXT("DetectionBox"));
	DetectionBox->SetupAttachment(RootComponent);
	DetectionBox->SetBoxExtent(FVector(80.f, 80.f, 40.f));
	DetectionBox->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
	DetectionBox->SetCollisionResponseToAllChannels(ECR_Overlap);
}

void AStickmanPressurePlate::BeginPlay()
{
	Super::BeginPlay();
	DetectionBox->OnComponentBeginOverlap.AddDynamic(this, &AStickmanPressurePlate::OnPlateBeginOverlap);
	DetectionBox->OnComponentEndOverlap.AddDynamic(this, &AStickmanPressurePlate::OnPlateEndOverlap);
}

void AStickmanPressurePlate::OnPlateBeginOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor,
	UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	if (!OtherActor || (!Cast<ACharacter>(OtherActor) && !OtherComp->IsSimulatingPhysics()))
	{
		return;
	}

	const bool bWasEmpty = OverlappingActors.Num() == 0;
	OverlappingActors.AddUnique(OtherActor);
	if (bWasEmpty)
	{
		OnActivated.Broadcast();
	}
}

void AStickmanPressurePlate::OnPlateEndOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor,
	UPrimitiveComponent* OtherComp, int32 OtherBodyIndex)
{
	OverlappingActors.Remove(OtherActor);
	if (OverlappingActors.Num() == 0)
	{
		OnDeactivated.Broadcast();
	}
}
