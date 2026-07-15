// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "StickmanCrowdManager.generated.h"

class AStickmanNPC;

/** One place a crowd NPC can appear, plus which "area type" density bucket it belongs to. */
USTRUCT(BlueprintType)
struct FCrowdSpawnPoint
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Crowd")
	FVector Location = FVector::ZeroVector;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Crowd")
	FName AreaType = TEXT("Default");
};

/**
 * Ambient NPC crowd population: pools/reuses NPC actors instead of spawning fresh ones,
 * activating a spawn point's NPC only once the camera is within ActivationDistance and
 * despawning (returning to the pool) beyond DeactivationDistance, capped at MaxActiveNPCs
 * total. Each area type can have its own spawn density; color/size variants keep a crowd
 * from looking like clones of one actor.
 */
UCLASS()
class STICKMANIMPACT_API AStickmanCrowdManager : public AActor
{
	GENERATED_BODY()

public:
	AStickmanCrowdManager();

	virtual void Tick(float DeltaSeconds) override;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Crowd")
	TArray<TSubclassOf<AStickmanNPC>> NPCVariants;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Crowd")
	TArray<FCrowdSpawnPoint> SpawnPoints;

	// 0-1 chance a given spawn point actually gets an NPC each pass, per area type — lets a
	// quiet alley have a sparser crowd than a market square without needing fewer spawn points.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Crowd")
	TMap<FName, float> DensityPerAreaType;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Crowd")
	int32 MaxActiveNPCs = 50;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Crowd")
	float ActivationDistance = 6000.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Crowd")
	float DeactivationDistance = 8000.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Crowd")
	FVector2D SizeVariantRange = FVector2D(0.92f, 1.08f);

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Crowd")
	TArray<TObjectPtr<UMaterialInterface>> ColorVariants;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Crowd")
	float RefreshInterval = 1.f;

private:
	void RefreshCrowd();
	AStickmanNPC* AcquireFromPool(TSubclassOf<AStickmanNPC> NPCClass, const FVector& Location);
	void ReturnToPool(AStickmanNPC* NPC);
	void ApplyVariant(AStickmanNPC* NPC) const;

	TArray<TWeakObjectPtr<AStickmanNPC>> PooledInactiveNPCs;

	// Index-aligned with SpawnPoints: which NPC (if any) currently occupies that point.
	TArray<TWeakObjectPtr<AStickmanNPC>> ActiveBySpawnPoint;

	float TimeSinceRefresh = 0.f;
};
