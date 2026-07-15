// Copyright StickmanImpact Project.

#include "StickmanCollectible.h"
#include "CollectibleManager.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SphereComponent.h"
#include "GameFramework/Character.h"
#include "NiagaraFunctionLibrary.h"
#include "Kismet/GameplayStatics.h"

AStickmanCollectible::AStickmanCollectible()
{
	PrimaryActorTick.bCanEverTick = true;

	CollectibleMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("CollectibleMesh"));
	RootComponent = CollectibleMesh;
	CollectibleMesh->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
	CollectibleMesh->SetCollisionResponseToAllChannels(ECR_Overlap);

	CollectSphere = CreateDefaultSubobject<USphereComponent>(TEXT("CollectSphere"));
	CollectSphere->SetupAttachment(RootComponent);
	CollectSphere->InitSphereRadius(100.f);
	CollectSphere->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
	CollectSphere->SetCollisionResponseToAllChannels(ECR_Overlap);
}

void AStickmanCollectible::BeginPlay()
{
	Super::BeginPlay();
	BaseLocation = GetActorLocation();
	CollectSphere->OnComponentBeginOverlap.AddDynamic(this, &AStickmanCollectible::OnCollectOverlap);

	if (const UGameInstance* GameInstance = GetGameInstance())
	{
		if (const UCollectibleManager* Manager = GameInstance->GetSubsystem<UCollectibleManager>())
		{
			if (Manager->IsCollected(ItemID))
			{
				Destroy(); // Already picked up in a previous session/visit.
			}
		}
	}
}

void AStickmanCollectible::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);

	BobTime += DeltaSeconds;
	const float ZOffset = FMath::Sin(BobTime * BobSpeed) * BobHeight;
	SetActorLocation(BaseLocation + FVector(0.f, 0.f, ZOffset));
	AddActorLocalRotation(FRotator(0.f, RotationSpeed * DeltaSeconds, 0.f));
}

void AStickmanCollectible::OnCollectOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor,
	UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	if (!Cast<ACharacter>(OtherActor))
	{
		return;
	}

	UGameInstance* GameInstance = GetGameInstance();
	UCollectibleManager* Manager = GameInstance ? GameInstance->GetSubsystem<UCollectibleManager>() : nullptr;
	if (!Manager || !Manager->CollectItem(ItemID, Region))
	{
		return;
	}

	if (CollectVFX)
	{
		UNiagaraFunctionLibrary::SpawnSystemAtLocation(this, CollectVFX, GetActorLocation());
	}
	if (CollectSound)
	{
		UGameplayStatics::PlaySoundAtLocation(this, CollectSound, GetActorLocation());
	}
	Destroy();
}
