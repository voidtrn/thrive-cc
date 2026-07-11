// Copyright StickmanImpact Project.

#include "EnemySpawner.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "NavigationSystem.h"
#include "TimerManager.h"

AEnemySpawner::AEnemySpawner()
{
	PrimaryActorTick.bCanEverTick = false;
}

void AEnemySpawner::BeginPlay()
{
	Super::BeginPlay();

	for (int32 Index = 0; Index < MaxActiveEnemies; ++Index)
	{
		SpawnOneEnemy();
	}
}

TSubclassOf<AStickmanEnemyCharacter> AEnemySpawner::PickWeightedClass() const
{
	float TotalWeight = 0.f;
	for (const FEnemySpawnEntry& Entry : SpawnPool)
	{
		TotalWeight += FMath::Max(Entry.Weight, 0.f);
	}
	if (TotalWeight <= 0.f)
	{
		return SpawnPool.Num() > 0 ? SpawnPool[0].EnemyClass : nullptr;
	}

	float Roll = FMath::FRandRange(0.f, TotalWeight);
	for (const FEnemySpawnEntry& Entry : SpawnPool)
	{
		Roll -= FMath::Max(Entry.Weight, 0.f);
		if (Roll <= 0.f)
		{
			return Entry.EnemyClass;
		}
	}
	return SpawnPool.Last().EnemyClass;
}

void AEnemySpawner::SpawnOneEnemy()
{
	if (ActiveEnemies.Num() >= MaxActiveEnemies || SpawnPool.Num() == 0)
	{
		return;
	}

	TSubclassOf<AStickmanEnemyCharacter> EnemyClass = PickWeightedClass();
	if (!EnemyClass)
	{
		return;
	}

	FVector SpawnLocation = GetActorLocation();
	if (UNavigationSystemV1* NavSystem = UNavigationSystemV1::GetCurrent(GetWorld()))
	{
		FNavLocation NavLocation;
		if (NavSystem->GetRandomReachablePointInRadius(GetActorLocation(), SpawnRadius, NavLocation))
		{
			SpawnLocation = NavLocation.Location;
		}
	}

	const FTransform SpawnTransform(GetActorRotation(), SpawnLocation);
	AStickmanEnemyCharacter* NewEnemy = GetWorld()->SpawnActorDeferred<AStickmanEnemyCharacter>(EnemyClass, SpawnTransform);
	if (!NewEnemy)
	{
		return;
	}

	const float LevelMultiplier = 1.f + FMath::Max(BaseEnemyLevel - 1, 0) * StatGrowthPerLevel;
	NewEnemy->Stats.MaxHealth *= LevelMultiplier;
	NewEnemy->Stats.Attack *= LevelMultiplier;
	NewEnemy->Stats.Defense *= LevelMultiplier;
	NewEnemy->SpawningSpawner = this;
	NewEnemy->OnDestroyed.AddDynamic(this, &AEnemySpawner::HandleEnemyDestroyed);

	NewEnemy->FinishSpawning(SpawnTransform);
	ActiveEnemies.Add(NewEnemy);
}

void AEnemySpawner::HandleEnemyDestroyed(AActor* DestroyedActor)
{
	ActiveEnemies.RemoveAll([](const TWeakObjectPtr<AStickmanEnemyCharacter>& Weak) { return !Weak.IsValid(); });
	ScheduleRespawn();
}

void AEnemySpawner::ScheduleRespawn()
{
	GetWorldTimerManager().SetTimer(RespawnTimerHandle, this, &AEnemySpawner::SpawnOneEnemy, RespawnTime, false);
}

TArray<AStickmanEnemyCharacter*> AEnemySpawner::GetActiveEnemies() const
{
	TArray<AStickmanEnemyCharacter*> Result;
	for (const TWeakObjectPtr<AStickmanEnemyCharacter>& Weak : ActiveEnemies)
	{
		if (AStickmanEnemyCharacter* Enemy = Weak.Get())
		{
			Result.Add(Enemy);
		}
	}
	return Result;
}
