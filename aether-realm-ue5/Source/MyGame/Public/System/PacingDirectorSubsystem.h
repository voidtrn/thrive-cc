#pragma once

#include "CoreMinimal.h"
#include "Subsystems/WorldSubsystem.h"
#include "PacingDirectorSubsystem.generated.h"

/**
 * Fase pacing — ritme L4D2: tekanan naik → puncak → napas → ulang.
 * Lihat Docs/GAME_LONGEVITY_PATTERNS.md §3 (kenapa + riset di baliknya).
 */
UENUM(BlueprintType)
enum class EPacingState : uint8
{
	BuildUp,  // tekanan normal, menanjak
	Peak,     // intensitas penuh (stress tinggi tertahan)
	Relax     // jeda napas setelah peak
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnPacingStateChanged, EPacingState, NewState);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnHighlightMoment, FName, Reason, FVector, Location);

/**
 * AI Director ala Left 4 Dead untuk open-world ARPG. Memantau performa
 * pemain (HP, damage diterima, kill rate, jumlah aggro) → skor stress 0-1 →
 * state machine BuildUp/Peak/Relax. Sistem lain POLL multiplier atau
 * subscribe event:
 *
 *   GetSpawnBudgetMultiplier()      spawner/DomainChallenge — Relax 0.5×, Peak 1.5×
 *   GetLootBonusMultiplier()        drop logic — mercy loot saat kesulitan lama
 *   GetEnemyAggressionMultiplier()  BT service musuh — pasif saat Relax
 *   OnPacingStateChanged            hook BP transisi fase
 *   OnHighlightMoment               momen clip-worthy (chain besar/clutch/boss
 *                                   phase saat Peak) — BP pasang slow-mo/sting
 *
 * Musik: auto-drive MusicManagerSubsystem::SetCombatIntensity tiap update,
 * tanpa wiring BP.
 *
 * Input di-report dari kode yang sudah ada (bukan scan per-frame):
 * CharacterBase::ApplyDamage (player kena hit), EnemyBase::HandleDeath (kill
 * + lepas aggro), EnemyAIController (aggro baru), EnemyBoss::EnterPhase.
 * BP bisa report manual juga (chain reaction dari reaction UI, dsb).
 *
 * Single-player/host-authoritative: hidup di server; multiplier dikonsumsi
 * logic server-side (spawn/loot/AI), jadi tak butuh replikasi sendiri.
 */
UCLASS()
class MYGAME_API UPacingDirectorSubsystem : public UWorldSubsystem
{
	GENERATED_BODY()

public:
	virtual void OnWorldBeginPlay(UWorld& InWorld) override;

	// ---------- Input (report dari gameplay) ----------
	/** Player kena damage. Fraction = damage / MaxHP korban (0-1). */
	void ReportPlayerDamaged(float DamageFraction);

	/** Musuh mati dibunuh player. Clutch (HP pemain < 15%) dideteksi internal. */
	UFUNCTION(BlueprintCallable, Category = "Pacing")
	void ReportEnemyKilled(const FVector& Location);

	/** Musuh mulai/berhenti aggro (delta +1/-1). */
	void ReportEnemyAggro(int32 Delta);

	/** Reaksi berantai (elemental chain) sepanjang N — report dari BP/reaction logic. */
	UFUNCTION(BlueprintCallable, Category = "Pacing")
	void ReportChainReaction(int32 ChainLength, const FVector& Location);

	/** Boss ganti phase — dipanggil AEnemyBoss::EnterPhase. */
	void ReportBossPhaseChanged(int32 NewPhase, const FVector& Location);

	// ---------- Output (poll) ----------
	UFUNCTION(BlueprintPure, Category = "Pacing")
	float GetStress() const { return CurrentStress; }

	UFUNCTION(BlueprintPure, Category = "Pacing")
	EPacingState GetPacingState() const { return State; }

	/** Budget spawn musuh: Relax 0.5, BuildUp 1.0, Peak 1.5. */
	UFUNCTION(BlueprintPure, Category = "Pacing")
	float GetSpawnBudgetMultiplier() const;

	/** Mercy loot: 1.0 normal, naik s/d 1.5 kalau pemain kesulitan lama (rubber-band). */
	UFUNCTION(BlueprintPure, Category = "Pacing")
	float GetLootBonusMultiplier() const;

	/** Agresi musuh (BT service): Relax 0.7, BuildUp 1.0, Peak 1.3. */
	UFUNCTION(BlueprintPure, Category = "Pacing")
	float GetEnemyAggressionMultiplier() const;

	UPROPERTY(BlueprintAssignable, Category = "Pacing")
	FOnPacingStateChanged OnPacingStateChanged;

	UPROPERTY(BlueprintAssignable, Category = "Pacing")
	FOnHighlightMoment OnHighlightMoment;

	// ---------- Pure (testable tanpa World — PacingDirectorTest.cpp) ----------
	/**
	 * Skor stress 0-1. HPFraction rendah, damage baru, dan aggro banyak
	 * menaikkan; kill rate tinggi menurunkan (pemain dominan).
	 */
	static float ComputeStress(float HPFraction, float RecentDamage01,
		float RecentKills01, int32 AggroCount);

private:
	// -- state machine --
	EPacingState State = EPacingState::BuildUp;
	float CurrentStress = 0.f;
	float StateTimer = 0.f;         // detik di state sekarang
	float HighStressHold = 0.f;     // detik beruntun stress > PeakEntryThreshold
	float StressedSeconds = 0.f;    // akumulasi kesulitan (mercy loot), decay saat aman

	// -- moving window input --
	float RecentDamage = 0.f;       // akumulasi fraksi damage, decay per update
	float RecentKills = 0.f;        // akumulasi kill, decay per update
	int32 AggroCount = 0;

	// -- tuning (const — ubah di kode; expose ke config kalau perlu nanti) --
	static constexpr float UpdateInterval = 0.5f;
	static constexpr float PeakEntryThreshold = 0.65f;
	static constexpr float PeakEntryHoldSeconds = 4.f;
	static constexpr float PeakDurationSeconds = 20.f;
	static constexpr float PeakEarlyExitStress = 0.3f;
	static constexpr float RelaxDurationSeconds = 15.f;
	static constexpr float DamageDecayPerSecond = 0.15f;
	static constexpr float KillDecayPerSecond = 0.3f;
	static constexpr float ClutchHPThreshold = 0.15f;

	FTimerHandle UpdateTimer;

	void Update();
	void SetState(EPacingState NewState);

	/** HP fraction TERENDAH di antara semua player pawn (co-op fair). 1.0 kalau tak ada. */
	float GetPlayerHPFraction() const;
};
