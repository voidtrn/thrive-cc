#pragma once

#include "CoreMinimal.h"
#include "Character/EnemyBase.h"
#include "EnemyBoss.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnBossPhaseChanged, int32, NewPhase);

/**
 * Enemy dengan phase transition berbasis HP%. Phase 0 = HP penuh; tiap
 * threshold di `PhaseHPThresholds` terlewati (menurun) → phase naik,
 * broadcast `OnBossPhaseChanged` (BP hook: ganti moveset/spawn add/dst),
 * invulnerable singkat + reset poise supaya transisi tak di-interrupt combo
 * pemain, dan opsional enrage (`PhaseATKMultipliers`).
 */
UCLASS()
class MYGAME_API AEnemyBoss : public AEnemyBase
{
	GENERATED_BODY()

public:
	AEnemyBoss(const FObjectInitializer& ObjectInitializer);

	/** DataTable (FEnemyStatsRow::PoiseThreshold) menang kalau di-isi designer;
	 *  BossPoiseThreshold cuma fallback C++ kalau row-nya kosong (0). */
	virtual float GetPoiseThreshold() const override
	{
		const float DataPoise = GetStats().PoiseThreshold;
		return DataPoise > 0.f ? DataPoise : BossPoiseThreshold;
	}

	UFUNCTION(BlueprintPure, Category = "Boss")
	int32 GetCurrentPhase() const { return CurrentPhase; }

	/**
	 * HP% (0-1, terurut menurun) tempat transisi terjadi.
	 * {0.7, 0.4} = phase 1 @ HP<=70%, phase 2 @ HP<=40%.
	 */
	UPROPERTY(EditDefaultsOnly, Category = "Boss|Phases")
	TArray<float> PhaseHPThresholds;

	/** ATK multiplier per phase (index 0 = phase awal). Kosong = tak enrage. */
	UPROPERTY(EditDefaultsOnly, Category = "Boss|Phases")
	TArray<float> PhaseATKMultipliers;

	/** Durasi invulnerable saat transisi phase (detik) — supaya tak di-interrupt. */
	UPROPERTY(EditDefaultsOnly, Category = "Boss|Phases")
	float PhaseTransitionInvulnerability = 1.5f;

	/** Poise threshold boss — jauh lebih tinggi dari enemy biasa secara default. */
	UPROPERTY(EditDefaultsOnly, Category = "Boss|Poise")
	float BossPoiseThreshold = 300.f;

	UPROPERTY(BlueprintAssignable, Category = "Boss")
	FOnBossPhaseChanged OnBossPhaseChanged;

	/**
	 * Pure — index phase untuk HP% given thresholds. Fungsi statik murni
	 * (deterministik, sama pola dengan UDamageCalculator) supaya testable
	 * tanpa World — lihat Private/Tests/BossPhaseTest.cpp.
	 */
	static int32 ComputePhaseIndex(float HPPercent, const TArray<float>& Thresholds);

protected:
	virtual void BeginPlay() override;

	UFUNCTION()
	void HandleHealthChangedForPhase(float NewHP, float MaxHPValue);

private:
	int32 CurrentPhase = 0;
	float BossBaseATK = 0.f;
	FTimerHandle PhaseInvulnTimer;

	void EnterPhase(int32 NewPhase);
	void EndPhaseInvulnerability();
};
