// Copyright StickmanImpact Project.

#include "StickmanCrowdManager.h"
#include "AI/StickmanNPC.h"
#include "Components/SkeletalMeshComponent.h"
#include "Kismet/GameplayStatics.h"

AStickmanCrowdManager::AStickmanCrowdManager()
{
	PrimaryActorTick.bCanEverTick = true;
	PrimaryActorTick.TickInterval = 1.f;
}

void AStickmanCrowdManager::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);

	TimeSinceRefresh += DeltaSeconds;
	if (TimeSinceRefresh < RefreshInterval)
	{
		return;
	}
	TimeSinceRefresh = 0.f;

	if (ActiveBySpawnPoint.Num() != SpawnPoints.Num())
	{
		ActiveBySpawnPoint.SetNum(SpawnPoints.Num());
	}

	RefreshCrowd();
}

void AStickmanCrowdManager::RefreshCrowd()
{
	const APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0);
	if (!PlayerPawn || NPCVariants.Num() == 0)
	{
		return;
	}

	int32 ActiveCount = 0;
	for (const TWeakObjectPtr<AStickmanNPC>& Weak : ActiveBySpawnPoint)
	{
		if (Weak.IsValid())
		{
			++ActiveCount;
		}
	}

	const FVector CameraLocation = PlayerPawn->GetActorLocation();

	for (int32 Index = 0; Index < SpawnPoints.Num(); ++Index)
	{
		const FCrowdSpawnPoint& SpawnPoint = SpawnPoints[Index];
		const FVector WorldLocation = GetActorLocation() + SpawnPoint.Location;
		const float Distance = FVector::Dist(CameraLocation, WorldLocation);

		AStickmanNPC* CurrentOccupant = ActiveBySpawnPoint[Index].Get();

		if (CurrentOccupant && Distance > DeactivationDistance)
		{
			ReturnToPool(CurrentOccupant);
			ActiveBySpawnPoint[Index] = nullptr;
			--ActiveCount;
			continue;
		}

		if (!CurrentOccupant && Distance <= ActivationDistance && ActiveCount < MaxActiveNPCs)
		{
			const float* Density = DensityPerAreaType.Find(SpawnPoint.AreaType);
			if (Density && FMath::FRand() > *Density)
			{
				continue; // This pass rolled low for a sparse area type — skip, try again next refresh.
			}

			const TSubclassOf<AStickmanNPC> ChosenClass = NPCVariants[FMath::RandRange(0, NPCVariants.Num() - 1)];
			AStickmanNPC* NewNPC = AcquireFromPool(ChosenClass, WorldLocation);
			if (NewNPC)
			{
				ActiveBySpawnPoint[Index] = NewNPC;
				++ActiveCount;
			}
		}
	}
}

AStickmanNPC* AStickmanCrowdManager::AcquireFromPool(TSubclassOf<AStickmanNPC> NPCClass, const FVector& Location)
{
	for (int32 Index = PooledInactiveNPCs.Num() - 1; Index >= 0; --Index)
	{
		AStickmanNPC* Pooled = PooledInactiveNPCs[Index].Get();
		if (!Pooled)
		{
			PooledInactiveNPCs.RemoveAt(Index);
			continue;
		}
		if (Pooled->GetClass() != NPCClass)
		{
			continue;
		}

		PooledInactiveNPCs.RemoveAt(Index);
		Pooled->SetActorLocation(Location);
		Pooled->SetActorHiddenInGame(false);
		Pooled->SetActorEnableCollision(true);
		Pooled->SetActorTickEnabled(true);
		ApplyVariant(Pooled);
		return Pooled;
	}

	AStickmanNPC* NewNPC = GetWorld()->SpawnActor<AStickmanNPC>(NPCClass, Location, FRotator::ZeroRotator);
	if (NewNPC)
	{
		ApplyVariant(NewNPC);
	}
	return NewNPC;
}

void AStickmanCrowdManager::ReturnToPool(AStickmanNPC* NPC)
{
	if (!NPC)
	{
		return;
	}
	NPC->SetActorHiddenInGame(true);
	NPC->SetActorEnableCollision(false);
	NPC->SetActorTickEnabled(false);
	PooledInactiveNPCs.Add(NPC);
}

void AStickmanCrowdManager::ApplyVariant(AStickmanNPC* NPC) const
{
	if (!NPC)
	{
		return;
	}

	const float Scale = FMath::FRandRange(SizeVariantRange.X, SizeVariantRange.Y);
	NPC->SetActorScale3D(FVector(Scale));

	if (ColorVariants.Num() > 0 && NPC->GetMesh())
	{
		UMaterialInterface* ChosenMaterial = ColorVariants[FMath::RandRange(0, ColorVariants.Num() - 1)];
		NPC->GetMesh()->SetMaterial(0, ChosenMaterial);
	}
}
