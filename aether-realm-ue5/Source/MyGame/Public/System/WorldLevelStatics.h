#pragma once

#include "CoreMinimal.h"
#include "Kismet/BlueprintFunctionLibrary.h"
#include "WorldLevelStatics.generated.h"

/**
 * World Level — jembatan Adventure Rank → kesulitan dunia (Genshin-like).
 * AR naik (quest/chest/oculi) → world level naik → musuh lebih kuat &
 * drop lebih banyak. Semua fungsi pure static supaya bisa di-automation-test
 * dan dipanggil dari mana pun (enemy spawn, UI, reward calc).
 *
 * WL : AR        : efek kasar
 * 0  : 1-9       : baseline
 * 1  : 10-14     : HP +60%, ATK +35%, mora +50%
 * 2  : 15-19     : dst linear per WL
 * 3  : 20-24
 * 4  : 25-29
 * 5  : 30+       : endgame
 */
UCLASS()
class MYGAME_API UWorldLevelStatics : public UBlueprintFunctionLibrary
{
	GENERATED_BODY()

public:
	static constexpr int32 MaxWorldLevel = 5;

	/** World level dari Adventure Rank (0..5). */
	UFUNCTION(BlueprintPure, Category = "WorldLevel")
	static int32 WorldLevelForAR(int32 AdventureRank);

	/** Multiplier HP musuh (1.0 di WL0, +60% per WL). */
	UFUNCTION(BlueprintPure, Category = "WorldLevel")
	static float EnemyHPMultiplier(int32 WorldLevel);

	/** Multiplier ATK musuh (+35% per WL). */
	UFUNCTION(BlueprintPure, Category = "WorldLevel")
	static float EnemyATKMultiplier(int32 WorldLevel);

	/** Multiplier DEF musuh (+20% per WL). */
	UFUNCTION(BlueprintPure, Category = "WorldLevel")
	static float EnemyDEFMultiplier(int32 WorldLevel);

	/** Multiplier mora drop (+50% per WL). */
	UFUNCTION(BlueprintPure, Category = "WorldLevel")
	static float MoraDropMultiplier(int32 WorldLevel);

	/** Tambahan level display/formula musuh (+8 per WL — dipakai DamageCalculator). */
	UFUNCTION(BlueprintPure, Category = "WorldLevel")
	static int32 BonusEnemyLevels(int32 WorldLevel);

	/** Jumlah drop material ekstra: WL3+ = +1 roll, WL5 = +2 roll. */
	UFUNCTION(BlueprintPure, Category = "WorldLevel")
	static int32 BonusMaterialRolls(int32 WorldLevel);
};
