#pragma once

#include "CoreMinimal.h"
#include "Subsystems/WorldSubsystem.h"
#include "Combat/CombatTypes.h"
#include "ElementAdaptationSubsystem.generated.h"

/**
 * Enemy Elemental Adaptation — musuh se-dunia pelan-pelan "belajar" elemen
 * yang paling sering dipakai player dan jadi attuned (RES naik vs elemen itu,
 * decay begitu player ganti gaya). Nemesis-system-lite versi elemental —
 * twist yang gak ada di Genshin/ARPG open-world lain (dunia mereka statis;
 * riset di GAME_LONGEVITY_PATTERNS.md: pola "sistem yang belajar dari
 * pemain" = alasan L4D2 awet, dan pacing director project ini udah setengah
 * jalan ke sana — ini lapisan keduanya, di sisi combat).
 *
 * Desain anti-frustasi (bukan hard counter):
 * - Cuma aktif kalau satu elemen DOMINAN (>50% dari damage elemental
 *   berjalan) DAN volumenya cukup (ActivationWeight) — main variatif =
 *   gak pernah kena.
 * - Cap di MaxAdaptationRES (default 30% — kerasa, gak bikin immune;
 *   ResMultiplier existing handle nilai ini biasa aja).
 * - Exponential decay (DecayTauSeconds) — ganti elemen bentar aja udah
 *   mulai netral lagi. Superconduct RES-shred tetap jalan di atasnya
 *   (shred dikurangkan SETELAH base+adaptation, jalur existing).
 *
 * Server-only secara efektif: satu-satunya reporter adalah
 * UCombatComponent::DealDamage yang udah di-gate HasAuthority() — map di
 * client selamanya kosong, dan damage resolve di server, jadi gak butuh
 * replikasi.
 */
UCLASS()
class MYGAME_API UElementAdaptationSubsystem : public UTickableWorldSubsystem
{
	GENERATED_BODY()

public:
	virtual void Tick(float DeltaTime) override;
	virtual TStatId GetStatId() const override
	{
		RETURN_QUICK_DECLARE_CYCLE_STAT(UElementAdaptationSubsystem, STATGROUP_Tickables);
	}

	/** Lapor damage elemental player→enemy. Dipanggil server-side (DealDamage). */
	void ReportElementalDamage(EElement Element, float Damage);

	/** RES tambahan musuh vs elemen ini (0..MaxAdaptationRES). Dibaca EnemyBase::GetBaseResistance. */
	UFUNCTION(BlueprintPure, Category = "Adaptation")
	float GetAdaptationRES(EElement Element) const;

	/** Elemen yang lagi paling di-attune musuh (None = belum ada). UI/debug. */
	UFUNCTION(BlueprintPure, Category = "Adaptation")
	EElement GetDominantElement() const;

	/**
	 * Math inti — pure static, testable tanpa World:
	 * dominance factor ((share-0.5)*2, clamp 0-1: mulai kerasa begitu satu
	 * elemen lewat 50% porsi) × volume factor (Total/Activation, clamp 0-1:
	 * butuh cukup banyak damage sebelum musuh "sadar") × MaxRES.
	 */
	static float ComputeAdaptationRES(float DominantWeight, float TotalWeight,
		float ActivationWeight, float MaxRES);

protected:
	/** Cap RES adaptasi (0.30 = musuh serap 15% lebih banyak via ResMultiplier — kerasa, bukan tembok). */
	UPROPERTY(EditDefaultsOnly, Category = "Adaptation", meta = (ClampMin = 0, ClampMax = 0.9))
	float MaxAdaptationRES = 0.30f;

	/** Total damage elemental berjalan yang dibutuhkan sebelum adaptasi full-strength. */
	UPROPERTY(EditDefaultsOnly, Category = "Adaptation", meta = (ClampMin = 1))
	float ActivationWeight = 8000.f;

	/** Waktu paruh-efektif decay (detik). ~45s: ganti elemen 1 menit = nyaris netral. */
	UPROPERTY(EditDefaultsOnly, Category = "Adaptation", meta = (ClampMin = 1))
	float DecayTauSeconds = 45.f;

private:
	/** Bobot damage berjalan per elemen (decay eksponensial di Tick). */
	TMap<EElement, float> ElementWeights;

	float GetTotalWeight() const;
};
