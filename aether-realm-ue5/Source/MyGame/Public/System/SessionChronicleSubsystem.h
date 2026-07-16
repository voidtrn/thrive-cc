#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "SessionChronicleSubsystem.generated.h"

/**
 * Satu momen tercatat di memoar. Type = FName event ("ClutchKill",
 * "ChainReaction", "BossPhase", "BossSlain", "Fallen", "DomainUnfinished",
 * "WorldAttuned" [ContextId = nama elemen], "WishFiveStar" [ContextId =
 * ItemId], dst — UI yang memetakan ke teks terlokalisasi, C++ tak menyimpan
 * FText, disiplin ANTISIPASI #8).
 */
USTRUCT(BlueprintType)
struct FChronicleEntry
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly) FName Type;

	/** Konteks: row name boss, id domain, CharacterID — pemberi makna di UI. */
	UPROPERTY(BlueprintReadOnly) FName ContextId;

	UPROPERTY(BlueprintReadOnly) FVector Location = FVector::ZeroVector;

	/** Detik sejak sesi mulai (buat urutan naratif epilog). */
	UPROPERTY(BlueprintReadOnly) float SessionSeconds = 0.f;

	/** Skor intensitas 0-1 — dasar seleksi peak (peak-end rule). */
	UPROPERTY(BlueprintReadOnly) float Intensity = 0.f;

	/** Tanggal nyata — memoar lifetime menampilkan "hari ke-N / on this day". */
	UPROPERTY(BlueprintReadOnly) FDateTime RealTime;
};

/** Epilog sesi — data-only, UI merender saat save/quit (peak-end rule). */
USTRUCT(BlueprintType)
struct FSessionEpilogue
{
	GENERATED_BODY()

	/** Top-N momen paling intens sesi ini (peak), urut intensitas turun. */
	UPROPERTY(BlueprintReadOnly) TArray<FChronicleEntry> PeakMoments;

	/** Momen tercatat terakhir (end). Type None kalau sesi kosong. */
	UPROPERTY(BlueprintReadOnly) FChronicleEntry FinalMoment;

	/** Thread terbuka terbaru (Zeigarnik) — cliffhanger penutup epilog. */
	UPROPERTY(BlueprintReadOnly) FChronicleEntry Cliffhanger;

	UPROPERTY(BlueprintReadOnly) bool bHasCliffhanger = false;

	UPROPERTY(BlueprintReadOnly) float SessionSeconds = 0.f;

	UPROPERTY(BlueprintReadOnly) int32 TotalMomentsThisSession = 0;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnMomentRecorded, const FChronicleEntry&, Entry);

class UOpenWorldSaveGame;

/**
 * Memoar pemain — "story of play" (Docs/GAME_PSYCHOLOGY_FOUNDATIONS.md §6).
 *
 * Merekam momen intens (di-feed otomatis oleh PacingDirector/EnemyBoss/
 * CharacterBase), menyimpan thread terbuka (Zeigarnik), dan menyusun epilog
 * sesi (peak-end rule Kahneman): top-peak + momen akhir + cliffhanger.
 * Lifetime chronicle persist via OpenWorldSaveGame (Export/ImportSave —
 * dipanggil OpenWorldGameInstance::SaveToSlot/LoadFromSlot).
 *
 * GameInstance subsystem (bukan World): memoar hidup lintas level/travel.
 * Session clock = akumulasi manual via momen (SessionSeconds per entry
 * memakai FPlatformTime sejak Initialize).
 */
UCLASS()
class MYGAME_API USessionChronicleSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;

	// ---------- Rekam ----------
	/** Catat momen. Intensity 0-1 (dasar seleksi peak epilog). */
	UFUNCTION(BlueprintCallable, Category = "Chronicle")
	void RecordMoment(FName Type, FName ContextId, const FVector& Location, float Intensity);

	/**
	 * Buka thread Zeigarnik (boss ketemu belum tumbang, domain belum clear).
	 * Idempotent per ContextId — panggilan kedua meng-update, bukan duplikat.
	 */
	UFUNCTION(BlueprintCallable, Category = "Chronicle")
	void OpenThread(FName Type, FName ContextId, const FVector& Location);

	/** Tutup thread (boss tumbang / domain clear). No-op kalau tak ada. */
	UFUNCTION(BlueprintCallable, Category = "Chronicle")
	void ResolveThread(FName ContextId);

	// ---------- Baca ----------
	/** Epilog sesi ini — panggil dari UI saat pemain save/quit. */
	UFUNCTION(BlueprintPure, Category = "Chronicle")
	FSessionEpilogue BuildSessionEpilogue() const;

	/** Memoar lifetime (persist antar sesi), urut kronologis. */
	UFUNCTION(BlueprintPure, Category = "Chronicle")
	const TArray<FChronicleEntry>& GetLifetimeChronicle() const { return LifetimeChronicle; }

	UFUNCTION(BlueprintPure, Category = "Chronicle")
	const TArray<FChronicleEntry>& GetOpenThreads() const { return OpenThreads; }

	/** Toast "momen terekam" — micro-reward variable (FOUNDATIONS §2a). */
	UPROPERTY(BlueprintAssignable, Category = "Chronicle")
	FOnMomentRecorded OnMomentRecorded;

	// ---------- Persistence (dipanggil OpenWorldGameInstance) ----------
	void ExportToSave(UOpenWorldSaveGame* Save) const;
	void ImportFromSave(const UOpenWorldSaveGame* Save);

	// ---------- Pure (testable tanpa World — ChronicleTest.cpp) ----------
	/**
	 * Pilih MaxCount momen ter-intens. Urut intensitas turun; seri →
	 * yang lebih baru menang (recency). Input tak dimodifikasi.
	 */
	static TArray<FChronicleEntry> SelectTopMoments(
		const TArray<FChronicleEntry>& Moments, int32 MaxCount);

private:
	/** Momen sesi berjalan saja (reset tiap boot game). */
	TArray<FChronicleEntry> SessionMoments;

	/** Memoar lintas sesi (ikut save). */
	UPROPERTY()
	TArray<FChronicleEntry> LifetimeChronicle;

	/** Thread Zeigarnik terbuka (ikut save). */
	UPROPERTY()
	TArray<FChronicleEntry> OpenThreads;

	double SessionStartSeconds = 0.0;

	/** Cap memoar — prune intensitas terendah dulu (peak yang dikenang, bukan filler). */
	static constexpr int32 MaxLifetimeEntries = 200;

	float NowSessionSeconds() const;
	void PruneLifetime();
};
