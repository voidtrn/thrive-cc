// Copyright StickmanImpact Project.

#include "StickmanElementalShard.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SphereComponent.h"
#include "GameFramework/Character.h"
#include "TimerManager.h"

AStickmanElementalShard::AStickmanElementalShard()
{
	PrimaryActorTick.bCanEverTick = false;

	ShardMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("ShardMesh"));
	RootComponent = ShardMesh;
	ShardMesh->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
	ShardMesh->SetCollisionResponseToAllChannels(ECR_Overlap);

	PickupSphere = CreateDefaultSubobject<USphereComponent>(TEXT("PickupSphere"));
	PickupSphere->SetupAttachment(RootComponent);
	PickupSphere->InitSphereRadius(75.f);
	PickupSphere->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
	PickupSphere->SetCollisionResponseToAllChannels(ECR_Overlap);
}

void AStickmanElementalShard::BeginPlay()
{
	Super::BeginPlay();

	PickupSphere->OnComponentBeginOverlap.AddDynamic(this, &AStickmanElementalShard::OnPickupOverlap);

	FTimerHandle ExpireHandle;
	GetWorldTimerManager().SetTimer(ExpireHandle, this, &AActor::K2_DestroyActor, Lifetime, false);
}

void AStickmanElementalShard::OnPickupOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor,
	UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	if (!Cast<ACharacter>(OtherActor))
	{
		return;
	}

	UE_LOG(LogTemp, Log, TEXT("[Crystallize] %s picked up a %d-element shard worth %.0f shield."),
		*OtherActor->GetName(), static_cast<int32>(Element), ShieldAmount);

	Destroy();
}
