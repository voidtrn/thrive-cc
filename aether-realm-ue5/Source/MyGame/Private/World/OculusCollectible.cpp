#include "World/OculusCollectible.h"
#include "Components/SphereComponent.h"
#include "System/OpenWorldGameInstance.h"
#include "MyGame.h"

AOculusCollectible::AOculusCollectible()
{
	PrimaryActorTick.bCanEverTick = true;

	PickupRadius = CreateDefaultSubobject<USphereComponent>(TEXT("PickupRadius"));
	SetRootComponent(PickupRadius);
	PickupRadius->SetSphereRadius(120.f);
	PickupRadius->SetCollisionProfileName(TEXT("Trigger"));
}

void AOculusCollectible::BeginPlay()
{
	Super::BeginPlay();

	BaseLocation = GetActorLocation();

	// Sudah diambil di save → hilang
	if (const UOpenWorldGameInstance* GI = GetGameInstance<UOpenWorldGameInstance>())
	{
		if (GI->CollectedOculi.Contains(GetOculusId()))
		{
			Destroy();
			return;
		}
	}

	PickupRadius->OnComponentBeginOverlap.AddDynamic(this, &AOculusCollectible::OnPickupOverlap);
}

void AOculusCollectible::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);

	// Float bobbing
	const float Offset = FMath::Sin(GetWorld()->GetTimeSeconds() * BobSpeed) * BobAmplitude;
	SetActorLocation(BaseLocation + FVector(0, 0, Offset));
}

void AOculusCollectible::OnPickupOverlap(UPrimitiveComponent*, AActor* OtherActor,
	UPrimitiveComponent*, int32, bool, const FHitResult&)
{
	const APawn* Pawn = Cast<APawn>(OtherActor);
	if (!Pawn || !Pawn->IsPlayerControlled())
	{
		return;
	}

	int32 Total = 0;
	if (UOpenWorldGameInstance* GI = GetGameInstance<UOpenWorldGameInstance>())
	{
		GI->CollectedOculi.Add(GetOculusId());
		Total = ++GI->InventoryItems.FindOrAdd(ItemId);
	}

	OnCollected.Broadcast(ItemId, Total);
	UE_LOG(LogAetherRealm, Log, TEXT("Oculus collected: %s (total %d)"), *ItemId.ToString(), Total);

	Destroy();
}
