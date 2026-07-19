// Copyright StickmanImpact Project.

#include "StickmanGameMode.h"
#include "Character/StickmanCharacter.h"
#include "StickmanPlayerController.h"
#include "UI/StickmanHUD.h"
#include "StickmanCity/StickmanCityGenerator.h"
#include "AI/StickmanNPC.h"
#include "Engine/World.h"

AStickmanGameMode::AStickmanGameMode()
{
	DefaultPawnClass = AStickmanCharacter::StaticClass();
	PlayerControllerClass = AStickmanPlayerController::StaticClass();
	HUDClass = AStickmanHUD::StaticClass();
}

void AStickmanGameMode::BeginPlay()
{
	Super::BeginPlay();

	if (bBuildDevCity)
	{
		BuildDevCity();
	}
}

void AStickmanGameMode::BuildDevCity()
{
	UWorld* World = GetWorld();
	if (!World)
	{
		return;
	}

	// One generator at the origin lays down the whole urban scene; the player spawns on the
	// central street intersection (even grid => origin is a crossing, not a building lot).
	FActorSpawnParameters CityParams;
	CityParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
	World->SpawnActor<AStickmanCityGenerator>(
		AStickmanCityGenerator::StaticClass(), FTransform::Identity, CityParams);

	// A handful of civilian NPCs along the nearby streets so the town feels inhabited.
	FActorSpawnParameters NpcParams;
	NpcParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AdjustIfPossibleButAlwaysSpawn;
	const FVector NpcSpots[] = {
		FVector( 400.f,  150.f, 120.f),
		FVector( 800.f, -300.f, 120.f),
		FVector(-500.f,  450.f, 120.f),
		FVector(-350.f, -600.f, 120.f),
		FVector( 150.f,  900.f, 120.f),
		FVector(-900.f, -100.f, 120.f),
	};
	for (const FVector& Spot : NpcSpots)
	{
		World->SpawnActor<AStickmanNPC>(AStickmanNPC::StaticClass(),
			FTransform(FRotator::ZeroRotator, Spot), NpcParams);
	}
}
