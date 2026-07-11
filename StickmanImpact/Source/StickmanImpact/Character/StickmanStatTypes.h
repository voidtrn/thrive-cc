// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "StickmanStatTypes.generated.h"

/**
 * Base RPG stat block shared by the player character and (later) enemies.
 * Kept as a plain USTRUCT so designers can tweak values on a DataTable/DataAsset
 * without touching C++.
 */
USTRUCT(BlueprintType)
struct FStickmanStats
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats")
	float MaxHealth = 1000.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats")
	float MaxStamina = 100.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats")
	float Attack = 20.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats")
	float Defense = 10.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats")
	float ElementalMastery = 0.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats")
	float EnergyRecharge = 1.f;
};
