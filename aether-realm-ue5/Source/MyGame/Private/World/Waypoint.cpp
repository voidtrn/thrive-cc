#include "World/Waypoint.h"
#include "Components/SphereComponent.h"
#include "Character/CharacterBase.h"
#include "System/AchievementSubsystem.h"
#include "System/OpenWorldGameInstance.h"
#include "Kismet/GameplayStatics.h"
#include "MyGame.h"

AWaypoint::AWaypoint()
{
	PrimaryActorTick.bCanEverTick = false;

	USceneComponent* Root = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
	SetRootComponent(Root);

	UnlockRadius = CreateDefaultSubobject<USphereComponent>(TEXT("UnlockRadius"));
	UnlockRadius->SetupAttachment(Root);
	UnlockRadius->SetSphereRadius(500.f);
	UnlockRadius->SetCollisionProfileName(TEXT("Trigger"));
}

void AWaypoint::BeginPlay()
{
	Super::BeginPlay();

	UnlockRadius->SetSphereRadius(UnlockDistance);

	// Sudah pernah unlock di save?
	if (const UOpenWorldGameInstance* GI = GetGameInstance<UOpenWorldGameInstance>())
	{
		if (GI->UnlockedWaypoints.Contains(GetWaypointId()))
		{
			bUnlocked = true;
			return;
		}
	}

	UnlockRadius->OnComponentBeginOverlap.AddDynamic(this, &AWaypoint::OnUnlockOverlap);
}

void AWaypoint::OnUnlockOverlap(UPrimitiveComponent*, AActor* OtherActor,
	UPrimitiveComponent*, int32, bool, const FHitResult&)
{
	const APawn* Pawn = Cast<APawn>(OtherActor);
	if (!bUnlocked && Pawn && Pawn->IsPlayerControlled())
	{
		Unlock();
	}
}

void AWaypoint::Unlock()
{
	bUnlocked = true;

	if (UOpenWorldGameInstance* GI = GetGameInstance<UOpenWorldGameInstance>())
	{
		GI->UnlockedWaypoints.Add(GetWaypointId());
	}

	UAchievementSubsystem::Report(this, TEXT("Stat_WaypointsUnlocked"));
	OnUnlocked.Broadcast(this);
	UE_LOG(LogAetherRealm, Log, TEXT("Waypoint unlocked: %s"), *GetName());
}

void AWaypoint::TeleportHere(APlayerController* Player)
{
	if (!bUnlocked || !Player || !Player->GetPawn())
	{
		return;
	}

	Player->GetPawn()->SetActorLocation(GetActorLocation() + SpawnOffset);

	// Team full heal (spec) — sekarang pawn aktif; Phase 5 loop seluruh party
	if (ACharacterBase* Character = Cast<ACharacterBase>(Player->GetPawn()))
	{
		Character->Heal(Character->MaxHP);
		Character->CurrentStamina = Character->MaxStamina;
	}

	// Auto-save tiap teleport (spec 4D)
	if (UOpenWorldGameInstance* GI = GetGameInstance<UOpenWorldGameInstance>())
	{
		GI->AutoSave();
	}
}
