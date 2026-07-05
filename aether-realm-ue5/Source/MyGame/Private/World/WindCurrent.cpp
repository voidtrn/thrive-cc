#include "World/WindCurrent.h"
#include "Components/BoxComponent.h"
#include "Character/CharacterBase.h"
#include "Character/OpenWorldMovementComponent.h"

AWindCurrent::AWindCurrent()
{
	PrimaryActorTick.bCanEverTick = true;

	WindVolume = CreateDefaultSubobject<UBoxComponent>(TEXT("WindVolume"));
	SetRootComponent(WindVolume);
	WindVolume->SetBoxExtent(FVector(300.f, 300.f, 1000.f));
	WindVolume->SetCollisionProfileName(TEXT("Trigger"));
}

void AWindCurrent::BeginPlay()
{
	Super::BeginPlay();
	WindVolume->OnComponentBeginOverlap.AddDynamic(this, &AWindCurrent::OnWindEnter);
	WindVolume->OnComponentEndOverlap.AddDynamic(this, &AWindCurrent::OnWindExit);
}

void AWindCurrent::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);

	TArray<AActor*> Overlapping;
	WindVolume->GetOverlappingActors(Overlapping, ACharacterBase::StaticClass());

	for (AActor* Actor : Overlapping)
	{
		ACharacterBase* Character = Cast<ACharacterBase>(Actor);
		UOpenWorldMovementComponent* Move = Character ? Character->GetOpenWorldMovement() : nullptr;
		if (!Move || !Move->IsGliding())
		{
			continue;
		}

		// Dorong ke atas — override descent glide
		FVector Vel = Character->GetVelocity();
		Vel.Z = FMath::FInterpTo(Vel.Z, UpdraftSpeed, DeltaSeconds, 3.f);
		Move->Velocity = Vel;
	}
}

void AWindCurrent::OnWindEnter(UPrimitiveComponent*, AActor* OtherActor,
	UPrimitiveComponent*, int32, bool, const FHitResult&)
{
	if (ACharacterBase* Character = Cast<ACharacterBase>(OtherActor))
	{
		Character->SetInWindCurrent(true);
	}
}

void AWindCurrent::OnWindExit(UPrimitiveComponent*, AActor* OtherActor,
	UPrimitiveComponent*, int32)
{
	if (ACharacterBase* Character = Cast<ACharacterBase>(OtherActor))
	{
		Character->SetInWindCurrent(false);
	}
}
