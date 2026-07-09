#include "System/WorldLevelStatics.h"

int32 UWorldLevelStatics::WorldLevelForAR(int32 AdventureRank)
{
	if (AdventureRank >= 30) return 5;
	if (AdventureRank >= 25) return 4;
	if (AdventureRank >= 20) return 3;
	if (AdventureRank >= 15) return 2;
	if (AdventureRank >= 10) return 1;
	return 0;
}

float UWorldLevelStatics::EnemyHPMultiplier(int32 WorldLevel)
{
	return 1.f + 0.6f * FMath::Clamp(WorldLevel, 0, MaxWorldLevel);
}

float UWorldLevelStatics::EnemyATKMultiplier(int32 WorldLevel)
{
	return 1.f + 0.35f * FMath::Clamp(WorldLevel, 0, MaxWorldLevel);
}

float UWorldLevelStatics::EnemyDEFMultiplier(int32 WorldLevel)
{
	return 1.f + 0.2f * FMath::Clamp(WorldLevel, 0, MaxWorldLevel);
}

float UWorldLevelStatics::MoraDropMultiplier(int32 WorldLevel)
{
	return 1.f + 0.5f * FMath::Clamp(WorldLevel, 0, MaxWorldLevel);
}

int32 UWorldLevelStatics::BonusEnemyLevels(int32 WorldLevel)
{
	return FMath::Clamp(WorldLevel, 0, MaxWorldLevel) * 8;
}

int32 UWorldLevelStatics::BonusMaterialRolls(int32 WorldLevel)
{
	if (WorldLevel >= 5) return 2;
	if (WorldLevel >= 3) return 1;
	return 0;
}
