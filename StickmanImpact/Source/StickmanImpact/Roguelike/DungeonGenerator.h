// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "UObject/Object.h"
#include "RoguelikeTypes.h"
#include "DungeonGenerator.generated.h"

/**
 * Deterministic floor layout generator. `GenerateFloor(seed, floorNumber)` returns the room
 * sequence for a floor: N combat/special rooms (count + difficulty scale by floor per the run
 * structure) capped by a boss room, drawn from a seeded stream so the same seed reproduces the
 * exact dungeon. Room *content* (which pre-built RoomPiece / streaming level) is chosen by the
 * caller from its FRoomPiece pool filtered on ERoomType + biome; this class owns the abstract
 * sequence, not the geometry.
 *
 * Floor structure: 1-3 = 2 rooms+boss, 4-6 = 3, 7-9 = 4 (+hazards), 10-11 = 5 (+elites),
 * 12 = final boss only.
 */
UCLASS(BlueprintType)
class STICKMANIMPACT_API UDungeonGenerator : public UObject
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Dungeon")
	TArray<FGeneratedRoom> GenerateFloor(int32 Seed, int32 FloorNumber);

	// Rooms (excluding the boss) for a floor number, per the run structure.
	UFUNCTION(BlueprintPure, Category = "Dungeon")
	static int32 RoomsForFloor(int32 FloorNumber);

	// Enemy affixes begin at floor 4; returns a seeded affix for a room (None before floor 4).
	UFUNCTION(BlueprintCallable, Category = "Dungeon")
	EEnemyAffix RollAffix(int32 Seed, int32 FloorNumber, int32 RoomIndex);

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dungeon")
	TArray<FName> BiomeTags = { TEXT("Pyro"), TEXT("Cryo"), TEXT("Electro"), TEXT("Hydro") };

private:
	// Non-boss room types weighted for variety (combat-heavy with utility rooms sprinkled).
	ERoomType PickNonBossRoom(FRandomStream& Stream, int32 RoomIndex) const;
};
