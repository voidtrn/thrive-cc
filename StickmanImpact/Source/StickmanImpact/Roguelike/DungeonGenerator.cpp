// Copyright StickmanImpact Project.

#include "DungeonGenerator.h"

int32 UDungeonGenerator::RoomsForFloor(int32 FloorNumber)
{
	if (FloorNumber >= 12) return 0;   // final boss only
	if (FloorNumber >= 10) return 5;
	if (FloorNumber >= 7)  return 4;
	if (FloorNumber >= 4)  return 3;
	return 2;
}

ERoomType UDungeonGenerator::PickNonBossRoom(FRandomStream& Stream, int32 RoomIndex) const
{
	// First room of a floor is always Combat; the rest are weighted variety.
	if (RoomIndex == 0)
	{
		return ERoomType::Combat;
	}
	const float Roll = Stream.FRand();
	if (Roll < 0.55f) return ERoomType::Combat;
	if (Roll < 0.68f) return ERoomType::Treasure;
	if (Roll < 0.80f) return ERoomType::Shop;
	if (Roll < 0.88f) return ERoomType::Rest;
	if (Roll < 0.94f) return ERoomType::Mystery;
	if (Roll < 0.98f) return ERoomType::Puzzle;
	return ERoomType::Trap;
}

TArray<FGeneratedRoom> UDungeonGenerator::GenerateFloor(int32 Seed, int32 FloorNumber)
{
	// Seed the stream per floor so each floor is stable but distinct within a run.
	FRandomStream Stream(Seed * 977 + FloorNumber * 31);

	const FName Biome = BiomeTags.Num() > 0
		? BiomeTags[Stream.RandRange(0, BiomeTags.Num() - 1)] : NAME_None;

	TArray<FGeneratedRoom> Rooms;
	const int32 NonBoss = RoomsForFloor(FloorNumber);
	for (int32 Index = 0; Index < NonBoss; ++Index)
	{
		FGeneratedRoom Room;
		Room.RoomType = PickNonBossRoom(Stream, Index);
		Room.RoomIndex = Index;
		Room.BiomeTag = Biome;
		Rooms.Add(Room);
	}

	// Every floor ends on a boss room.
	FGeneratedRoom BossRoom;
	BossRoom.RoomType = ERoomType::Boss;
	BossRoom.RoomIndex = NonBoss;
	BossRoom.BiomeTag = Biome;
	Rooms.Add(BossRoom);

	return Rooms;
}

EEnemyAffix UDungeonGenerator::RollAffix(int32 Seed, int32 FloorNumber, int32 RoomIndex)
{
	if (FloorNumber < 4)
	{
		return EEnemyAffix::None;
	}
	FRandomStream Stream(Seed * 613 + FloorNumber * 17 + RoomIndex * 7);
	// Affix pool grows harsher with floor depth; pick from Frenzied..Giant.
	const int32 Max = FMath::Min(static_cast<int32>(EEnemyAffix::Giant), 1 + (FloorNumber - 3));
	return static_cast<EEnemyAffix>(Stream.RandRange(1, FMath::Clamp(Max, 1, static_cast<int32>(EEnemyAffix::Giant))));
}
