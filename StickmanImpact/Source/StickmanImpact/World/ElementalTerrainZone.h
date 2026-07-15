// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "SkillSystem/StickmanSkillTypes.h"
#include "ElementalTerrainZone.generated.h"

class UBoxComponent;
class UNiagaraComponent;

UENUM(BlueprintType)
enum class ETerrainZoneType : uint8
{
	Burning,		// DoT tick + applies Pyro
	Frozen,			// slippery: ground friction cut while inside
	Wet,			// applies Hydro (conducts Electro in larger radius via the aura itself)
	Electrified,	// applies Electro, paralyze proc chance (brief freeze)
	Overgrown,		// slow + applies Dendro
	Crystallized	// spawns Geo shard on first step-in per actor
};

/**
 * Elemental terrain patch: place in the world (or spawn from reactions/skills — e.g. Wildfire
 * can drop a Burning zone, freezing water spawns a walkable Frozen platform actor). Overlapping
 * pawns tick the zone effect every TickInterval. Lifetime 0 = permanent placement.
 */
UCLASS()
class STICKMANIMPACT_API AElementalTerrainZone : public AActor
{
	GENERATED_BODY()

public:
	AElementalTerrainZone();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Terrain Zone")
	ETerrainZoneType ZoneType = ETerrainZoneType::Burning;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Terrain Zone")
	float TickInterval = 1.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Terrain Zone")
	float TickDamage = 15.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Terrain Zone")
	float ParalyzeChance = 0.15f;

	// 0 = permanent.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Terrain Zone")
	float Lifetime = 0.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Terrain Zone")
	TObjectPtr<class UNiagaraSystem> ZoneVFX;

protected:
	virtual void BeginPlay() override;

	UFUNCTION()
	void OnZoneBeginOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp,
		int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult);

	UFUNCTION()
	void OnZoneEndOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp,
		int32 OtherBodyIndex);

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Terrain Zone", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UBoxComponent> ZoneBounds;

private:
	void TickZone();
	void ApplyEnterEffect(AActor* Actor);
	void RemoveExitEffect(AActor* Actor);

	UPROPERTY()
	TArray<TObjectPtr<AActor>> OverlappingPawns;

	FTimerHandle ZoneTickTimerHandle;
};
