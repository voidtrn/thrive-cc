// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "EnemyArchetypeTypes.h"
#include "EnemyFactory.generated.h"

class AStickmanEnemyCharacter;

/**
 * Spawns + configures enemies from FEnemyArchetype rows — the "modular enemy factory" that
 * lets a 50+ roster live entirely in a DataTable. `SpawnArchetype` deferred-spawns the row's
 * EnemyClass (or the base pawn), stamps stats/element/personality/attacks/resistances/loot,
 * attaches the archetype's mechanic component, level-scales, then finishes spawning. Used by
 * AEnemySpawner (via archetype ID pools), world events, and the roguelike room generator.
 */
UCLASS()
class STICKMANIMPACT_API UEnemyFactory : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	// Assign the bestiary DataTable at startup (from GameInstance/BP init).
	UFUNCTION(BlueprintCallable, Category = "Bestiary")
	void SetArchetypeTable(UDataTable* Table) { ArchetypeTable = Table; }

	// Spawn + fully configure an enemy from an archetype row. Level scales BaseStats.
	UFUNCTION(BlueprintCallable, Category = "Bestiary")
	AStickmanEnemyCharacter* SpawnArchetype(FName ArchetypeID, const FTransform& SpawnTransform, int32 Level = 1);

	UFUNCTION(BlueprintPure, Category = "Bestiary")
	bool GetArchetype(FName ArchetypeID, FEnemyArchetype& OutArchetype) const;

	// All archetype IDs of a faction (spawn-table building, journal listing).
	UFUNCTION(BlueprintPure, Category = "Bestiary")
	TArray<FName> GetArchetypesByFaction(EEnemyFaction Faction) const;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Bestiary")
	float StatGrowthPerLevel = 0.15f;

private:
	UPROPERTY()
	TObjectPtr<UDataTable> ArchetypeTable;
};
