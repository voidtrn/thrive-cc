#pragma once

#include "CoreMinimal.h"
#include "Subsystems/WorldSubsystem.h"
#include "Combat/CombatTypes.h"
#include "ElementAdaptationSubsystem.generated.h"

/** Transisi latch pengumuman attunement (hysteresis, anti-spam). */
UENUM()
enum class EAttunementEdge : uint8
{
	None,     // tak ada perubahan
	Rising,   // baru lewat ambang tinggi → umumkan "dunia attuned"
	Falling   // turun di bawah ambang rendah → reset latch
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnWorldAttuned, EElement, Element);

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
	 * Broadcast sekali saat dunia BARU jadi attuned signifikan vs elemen player
	 * (rising edge, hysteresis) — BP pasang toast "musuh mulai kebal Pyro-mu".
	 * Momen ini juga ditulis ke SessionChronicle ("WorldAttuned") = memoar
	 * "dunia belajar gayamu", reinforce twist self-reference (FOUNDATIONS §2c).
	 *
	 * CO-OP: broadcast HOST-ONLY. Seluruh sistem adaptation ini server-only
	 * by design (ElementWeights cuma diisi DealDamage server-side, map client
	 * selamanya kosong), jadi instance client tak pernah fire delegate ini.
	 * Toast di remote client butuh relay eksplisit (multicast) — di luar scope,
	 * diterima host-only untuk sekarang (lihat ANTISIPASI #10, CODE_REVIEW.md).
	 */
	UPROPERTY(BlueprintAssignable, Category = "Adaptation")
	FOnWorldAttuned OnWorldAttuned;

	/**
	 * Keputusan edge pure (testable tanpa World): rasio CurrentRES/MaxRES lewat
	 * ambang tinggi (0.6) sambil belum diumumkan = Rising; turun di bawah ambang
	 * rendah (0.25) sambil sudah diumumkan = Falling. Hysteresis lebar supaya
	 * decay/regain kecil di sekitar ambang gak spam.
	 */
	static EAttunementEdge EvaluateAttunementEdge(float CurrentRES, float MaxRES, bool bAnnounced);

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

	/** Latch pengumuman: elemen yang sedang diumumkan attuned (None = belum). */
	EElement AnnouncedElement = EElement::None;

	float GetTotalWeight() const;

	/** Cek rising/falling edge tiap Tick, broadcast + tulis chronicle sekali. */
	void UpdateAttunementAnnouncement();
};
