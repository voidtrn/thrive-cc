#pragma once

#include "CoreMinimal.h"
#include "Subsystems/WorldSubsystem.h"
#include "GameDirectorSubsystem.generated.h"

/** Fase pacing (siklus L4D2: bangun tensi → puncak → napas). */
UENUM(BlueprintType)
enum class EDirectorPhase : uint8
{
	BuildUp,  // tensi dibangun — ambush/spawn ekstra diizinkan
	Peak,     // pertarungan intens — JANGAN tambah musuh
	Relax     // jeda napas setelah puncak — dunia tenang sebentar
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnDirectorPhaseChanged, EDirectorPhase, OldPhase, EDirectorPhase, NewPhase);

/**
 * Game Director — pacing dinamis ala AI Director L4D2, disesuaikan open
 * world. Melacak "intensity" (0-100) dari kejadian combat, lalu mengatur
 * ritme: saat pemain santai terlalu lama, buka jendela ambush; saat
 * pertarungan memuncak, tahan spawn; setelah puncak, beri jeda napas.
 *
 * Intensity naik dari: damage diterima pemain (proporsi MaxHP), musuh
 * terbunuh. Turun (decay) seiring waktu. Fase pakai hysteresis supaya
 * tidak flip-flop di sekitar threshold.
 *
 * Pemakaian (BP spawner / encounter volume):
 *   Tick → IsAmbushWindow()? → spawn wave kecil → NotifyAmbushSpawned()
 *   Boss/domain BP → GetPhase() == Peak? → tunda add-spawn
 * Hook C++ sudah terpasang: damage pemain (CharacterBase) & kill musuh
 * (EnemyBase). Server-side; single-player = listen server implisit.
 *
 * Semua math inti pure static — automation-testable.
 */
UCLASS()
class MYGAME_API UGameDirectorSubsystem : public UTickableWorldSubsystem
{
	GENERATED_BODY()

public:
	// ---------- Tuning ----------
	static constexpr float PeakEnterThreshold = 70.f;   // BuildUp → Peak
	static constexpr float PeakExitThreshold = 40.f;    // Peak → Relax (hysteresis)
	static constexpr float RelaxDuration = 25.f;        // detik jeda napas
	static constexpr float DecayPerSecond = 4.f;
	static constexpr float IntensityPerKill = 8.f;
	static constexpr float IntensityPerFullHPDamage = 40.f; // damage 100% MaxHP
	static constexpr float AmbushQuietSeconds = 15.f;    // sepi minimal sebelum ambush
	static constexpr float AmbushCooldownSeconds = 45.f; // jarak antar ambush
	static constexpr float AmbushMaxIntensity = 30.f;    // ambush hanya saat tensi rendah

	// ---------- Tickable ----------
	virtual void Tick(float DeltaTime) override;
	virtual TStatId GetStatId() const override
	{
		RETURN_QUICK_DECLARE_CYCLE_STAT(UGameDirectorSubsystem, STATGROUP_Tickables);
	}

	// ---------- Laporan kejadian (dipanggil hook C++/BP) ----------
	/** Damage diterima pemain, dinormalisasi (Damage / MaxHP, 0-1). */
	UFUNCTION(BlueprintCallable, Category = "Director")
	void ReportPlayerDamage(float NormalizedDamage);

	UFUNCTION(BlueprintCallable, Category = "Director")
	void ReportEnemyKilled();

	/** Spawner WAJIB panggil ini setelah spawn ambush (mulai cooldown). */
	UFUNCTION(BlueprintCallable, Category = "Director")
	void NotifyAmbushSpawned();

	// ---------- Query (BP spawner / debug) ----------
	UFUNCTION(BlueprintPure, Category = "Director")
	float GetIntensity() const { return Intensity; }

	UFUNCTION(BlueprintPure, Category = "Director")
	EDirectorPhase GetPhase() const { return Phase; }

	/** Saat true: pemain "terlalu tenang" — waktunya kejutan. */
	UFUNCTION(BlueprintPure, Category = "Director")
	bool IsAmbushWindow() const;

	UPROPERTY(BlueprintAssignable, Category = "Director")
	FOnDirectorPhaseChanged OnPhaseChanged;

	// ---------- Math inti (pure static, testable) ----------
	static float DecayedIntensity(float Current, float DeltaTime);

	/** Transisi fase dengan hysteresis. SecondsInPhase = umur fase sekarang. */
	static EDirectorPhase ComputePhaseTransition(
		EDirectorPhase Current, float Intensity, float SecondsInPhase);

	static bool IsAmbushWindowAt(
		EDirectorPhase Phase, float Intensity,
		float SecondsSinceCombat, float SecondsSinceAmbush);

protected:
	float Intensity = 0.f;
	EDirectorPhase Phase = EDirectorPhase::BuildUp;
	double PhaseStartTime = 0.0;
	double LastCombatTime = -1000.0;
	double LastAmbushTime = -1000.0;

	void AddIntensity(float Delta);
	void SetPhase(EDirectorPhase NewPhase);
};
