// Copyright StickmanImpact Project.

#include "ElementalTerrainZone.h"
#include "Combat/ElementalReactionManager.h"
#include "Components/BoxComponent.h"
#include "GameFramework/Character.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "NiagaraFunctionLibrary.h"
#include "TimerManager.h"

AElementalTerrainZone::AElementalTerrainZone()
{
	PrimaryActorTick.bCanEverTick = false;

	ZoneBounds = CreateDefaultSubobject<UBoxComponent>(TEXT("ZoneBounds"));
	RootComponent = ZoneBounds;
	ZoneBounds->SetBoxExtent(FVector(300.f, 300.f, 100.f));
	ZoneBounds->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
	ZoneBounds->SetCollisionResponseToAllChannels(ECR_Overlap);
}

void AElementalTerrainZone::BeginPlay()
{
	Super::BeginPlay();

	ZoneBounds->OnComponentBeginOverlap.AddDynamic(this, &AElementalTerrainZone::OnZoneBeginOverlap);
	ZoneBounds->OnComponentEndOverlap.AddDynamic(this, &AElementalTerrainZone::OnZoneEndOverlap);
	GetWorldTimerManager().SetTimer(ZoneTickTimerHandle, this, &AElementalTerrainZone::TickZone, TickInterval, true);

	if (ZoneVFX)
	{
		UNiagaraFunctionLibrary::SpawnSystemAttached(ZoneVFX, ZoneBounds, NAME_None, FVector::ZeroVector,
			FRotator::ZeroRotator, EAttachLocation::KeepRelativeOffset, true);
	}
	if (Lifetime > 0.f)
	{
		SetLifeSpan(Lifetime);
	}
}

void AElementalTerrainZone::OnZoneBeginOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor,
	UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	if (Cast<ACharacter>(OtherActor))
	{
		OverlappingPawns.AddUnique(OtherActor);
		ApplyEnterEffect(OtherActor);
	}
}

void AElementalTerrainZone::OnZoneEndOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor,
	UPrimitiveComponent* OtherComp, int32 OtherBodyIndex)
{
	OverlappingPawns.Remove(OtherActor);
	RemoveExitEffect(OtherActor);
}

void AElementalTerrainZone::ApplyEnterEffect(AActor* Actor)
{
	ACharacter* Character = Cast<ACharacter>(Actor);
	if (!Character)
	{
		return;
	}
	switch (ZoneType)
	{
		case ETerrainZoneType::Frozen:
			Character->GetCharacterMovement()->GroundFriction = 0.3f; // Slippery.
			break;
		case ETerrainZoneType::Overgrown:
			Character->GetCharacterMovement()->MaxWalkSpeed *= 0.6f; // Slow.
			break;
		default:
			break;
	}
}

void AElementalTerrainZone::RemoveExitEffect(AActor* Actor)
{
	ACharacter* Character = Cast<ACharacter>(Actor);
	if (!Character)
	{
		return;
	}
	switch (ZoneType)
	{
		case ETerrainZoneType::Frozen:
			Character->GetCharacterMovement()->GroundFriction = 4.f; // Project default.
			break;
		case ETerrainZoneType::Overgrown:
			Character->GetCharacterMovement()->MaxWalkSpeed /= 0.6f;
			break;
		default:
			break;
	}
}

void AElementalTerrainZone::TickZone()
{
	UElementalReactionManager* Reactions = GetGameInstance()
		? GetGameInstance()->GetSubsystem<UElementalReactionManager>() : nullptr;

	for (int32 Index = OverlappingPawns.Num() - 1; Index >= 0; --Index)
	{
		AActor* Pawn = OverlappingPawns[Index];
		if (!Pawn)
		{
			OverlappingPawns.RemoveAt(Index);
			continue;
		}

		switch (ZoneType)
		{
			case ETerrainZoneType::Burning:
				if (Reactions)
				{
					Reactions->ApplyElement(Pawn, EStickmanElement::Pyro, 30.f, TickDamage);
				}
				break;
			case ETerrainZoneType::Wet:
				if (Reactions)
				{
					Reactions->ApplyElement(Pawn, EStickmanElement::Hydro, 40.f);
				}
				break;
			case ETerrainZoneType::Electrified:
				if (Reactions)
				{
					Reactions->ApplyElement(Pawn, EStickmanElement::Electro, 30.f, TickDamage);
					if (FMath::FRand() < ParalyzeChance)
					{
						// Paralyze proc: brief movement lock.
						if (ACharacter* Character = Cast<ACharacter>(Pawn))
						{
							Character->GetCharacterMovement()->DisableMovement();
							FTimerHandle Recover;
							GetWorldTimerManager().SetTimer(Recover,
								FTimerDelegate::CreateWeakLambda(Character, [Character]()
								{
									Character->GetCharacterMovement()->SetMovementMode(MOVE_Walking);
								}), 0.6f, false);
						}
					}
				}
				break;
			case ETerrainZoneType::Overgrown:
				if (Reactions)
				{
					Reactions->ApplyElement(Pawn, EStickmanElement::Dendro, 30.f);
				}
				break;
			default:
				break;
		}
	}
}
