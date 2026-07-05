#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "UI/InventoryTypes.h"
#include "ConsumableTypes.generated.h"

UENUM(BlueprintType)
enum class EConsumableEffect : uint8
{
	Heal,          // heal instan (flat HP)
	HealPercent,   // heal % MaxHP
	Revive,        // hidupkan karakter mati + heal %
	StatBuff       // buff stat sementara
};

/** Row DT_Consumables — food & potion (hasil cooking). */
USTRUCT(BlueprintType)
struct FConsumableDefRow : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FText DisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	EConsumableEffect Effect = EConsumableEffect::Heal;

	/** Heal: flat HP. HealPercent/Revive: 0-1. StatBuff: tidak dipakai. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	float Magnitude = 0.f;

	// --- StatBuff ---
	UPROPERTY(EditAnywhere, BlueprintReadOnly, meta = (EditCondition = "Effect == EConsumableEffect::StatBuff"))
	EArtifactStat BuffStat = EArtifactStat::ATK;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, meta = (EditCondition = "Effect == EConsumableEffect::StatBuff"))
	float BuffDelta = 0.f;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, meta = (EditCondition = "Effect == EConsumableEffect::StatBuff"))
	float BuffDuration = 30.f;

	// --- Cooking ---
	/** Bahan mentah + jumlah untuk masak item ini (kosong = tidak bisa dimasak). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TMap<FName, int32> Recipe;
};
