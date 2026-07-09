#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "AchievementTypes.generated.h"

/** Hasil klaim reward (achievement & reputation — UI tahu alasan gagal). */
UENUM(BlueprintType)
enum class EClaimResult : uint8
{
	Success,
	NotUnlocked,     // progress belum sampai target
	AlreadyClaimed,
	InvalidData      // table/row tidak ditemukan
};

/**
 * Row DT_Achievements. Achievement dilacak lewat counter seumur-save
 * (LifetimeStats di GameInstance) — kode gameplay lapor lewat
 * UAchievementSubsystem::Report, achievement unlock otomatis saat
 * counter >= TargetCount, reward diklaim manual (Genshin-style).
 *
 * Stat key kanonis yang sudah di-wire C++:
 *   Stat_EnemiesDefeated, Stat_ChestsOpened, Stat_OculiCollected,
 *   Stat_WaypointsUnlocked, Stat_WishesMade, Stat_ReactionsTriggered,
 *   Stat_ExpeditionsClaimed, Stat_ResinSpent
 * BP bebas menambah key baru (cooking, domain, quest) via Report.
 */
USTRUCT(BlueprintType)
struct FAchievementRow : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FText DisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, meta = (MultiLine = true))
	FText Description;

	/** Counter yang dilacak (lihat daftar kanonis di atas). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FName StatKey;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, meta = (ClampMin = 1))
	int32 TargetCount = 1;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	int32 PrimogemReward = 5;
};
