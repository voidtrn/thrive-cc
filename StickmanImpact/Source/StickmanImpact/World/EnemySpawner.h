// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "EnemySpawner.generated.h"

class AStickmanEnemyCharacter;

USTRUCT(BlueprintType)
struct FEnemySpawnEntry
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Spawner")
	TSubclassOf<AStickmanEnemyCharacter> EnemyClass;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Spawner")
	float Weight = 1.f;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnEnemyEnteredCombat, AActor*, Enemy, AActor*, Target);

/**
 * Places a pool of weighted enemy archetypes in the world, spawning up to MaxActiveEnemies
 * within SpawnRadius and respawning RespawnTime seconds after each death. Stats scale off
 * BaseEnemyLevel via SpawnActorDeferred so the level multiplier lands before the enemy's own
 * BeginPlay initializes its AttributeSet from Stats.
 */
UCLASS()
class STICKMANIMPACT_API AEnemySpawner : public AActor
{
	GENERATED_BODY()

public:
	AEnemySpawner();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Spawner")
	TArray<FEnemySpawnEntry> SpawnPool;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Spawner")
	float SpawnRadius = 500.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Spawner")
	float RespawnTime = 30.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Spawner")
	int32 MaxActiveEnemies = 3;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Spawner")
	int32 BaseEnemyLevel = 1;

	// Multiplies FStickmanStats fields by (1 + (BaseEnemyLevel - 1) * this) per level above 1.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Spawner")
	float StatGrowthPerLevel = 0.15f;

	UPROPERTY(BlueprintAssignable, Category = "Spawner")
	FOnEnemyEnteredCombat OnEnemyEnteredCombat;

	UFUNCTION(BlueprintCallable, Category = "Spawner")
	void NotifyEnemyEnteredCombat(AActor* Enemy, AActor* Target) { OnEnemyEnteredCombat.Broadcast(Enemy, Target); }

	UFUNCTION(BlueprintCallable, Category = "Spawner")
	void SpawnOneEnemy();

	// Every currently-alive enemy this spawner has spawned.
	UFUNCTION(BlueprintPure, Category = "Spawner")
	TArray<AStickmanEnemyCharacter*> GetActiveEnemies() const;

protected:
	virtual void BeginPlay() override;

private:
	TSubclassOf<AStickmanEnemyCharacter> PickWeightedClass() const;

	UFUNCTION()
	void HandleEnemyDestroyed(AActor* DestroyedActor);

	void ScheduleRespawn();

	UPROPERTY()
	TArray<TWeakObjectPtr<AStickmanEnemyCharacter>> ActiveEnemies;

	FTimerHandle RespawnTimerHandle;
};
