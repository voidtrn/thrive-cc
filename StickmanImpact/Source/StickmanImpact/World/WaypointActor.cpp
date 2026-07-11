// Copyright StickmanImpact Project.

#include "WaypointActor.h"
#include "WaypointManager.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SphereComponent.h"
#include "GameFramework/Character.h"
#include "NiagaraFunctionLibrary.h"

AWaypointActor::AWaypointActor()
{
	PrimaryActorTick.bCanEverTick = false;

	WaypointMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("WaypointMesh"));
	RootComponent = WaypointMesh;

	ActivationSphere = CreateDefaultSubobject<USphereComponent>(TEXT("ActivationSphere"));
	ActivationSphere->SetupAttachment(RootComponent);
	ActivationSphere->InitSphereRadius(ActivationRadius);
	ActivationSphere->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
	ActivationSphere->SetCollisionResponseToAllChannels(ECR_Overlap);
}

void AWaypointActor::BeginPlay()
{
	Super::BeginPlay();
	ActivationSphere->SetSphereRadius(ActivationRadius);
	ActivationSphere->OnComponentBeginOverlap.AddDynamic(this, &AWaypointActor::OnActivationOverlap);
}

void AWaypointActor::OnActivationOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor,
	UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	if (!Cast<ACharacter>(OtherActor))
	{
		return;
	}

	UGameInstance* GameInstance = GetGameInstance();
	UWaypointManager* Manager = GameInstance ? GameInstance->GetSubsystem<UWaypointManager>() : nullptr;
	if (!Manager || Manager->IsWaypointUnlocked(WaypointID))
	{
		return;
	}

	Manager->UnlockWaypoint(this);
	if (UnlockVFX)
	{
		UNiagaraFunctionLibrary::SpawnSystemAtLocation(this, UnlockVFX, GetActorLocation());
	}
}

void AWaypointActor::Interact_Implementation(AActor* Instigator)
{
	if (UGameInstance* GameInstance = GetGameInstance())
	{
		if (UWaypointManager* Manager = GameInstance->GetSubsystem<UWaypointManager>())
		{
			Manager->TeleportTo(this);
		}
	}
}
