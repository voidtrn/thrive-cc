#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "System/LevelingTypes.h"
#include "ExpeditionTypes.generated.h"

/** Row DT_Expeditions — definisi satu tujuan expedition. */
USTRUCT(BlueprintType)
struct FExpeditionRow : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FText DisplayName;

	/** Durasi jam real-time. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, meta = (ClampMin = 1, ClampMax = 24))
	int32 DurationHours = 8;

	/** AR minimal untuk unlock. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	int32 ARRequirement = 1;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	int32 MoraReward = 0;

	/** Item hasil (reuse FMaterialCost: item + jumlah). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TArray<FMaterialCost> ItemRewards;
};

/** Satu expedition yang sedang berjalan (persist di GameInstance/save). */
USTRUCT(BlueprintType)
struct FActiveExpedition
{
	GENERATED_BODY()

	/** Row name di DT_Expeditions. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FName ExpeditionId;

	/** Karakter yang dikirim (tidak boleh dipakai expedition lain). */
	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FName CharacterId;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FDateTime StartTime;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	int32 DurationHours = 8;
};
