#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "CutsceneActor.generated.h"

class UDataTable;
class ACameraActor;
class APlayerController;
class APawn;

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnCutsceneFinished);

/** Satu shot kamera dalam cutscene — posisi/rotasi relatif ke transform actor ini. */
USTRUCT(BlueprintType)
struct FCutsceneShot
{
	GENERATED_BODY()

	/** Relatif ke transform ACutsceneActor (placement di level = titik acuan adegan). */
	UPROPERTY(EditAnywhere, Category = "Cutscene")
	FVector RelativeLocation = FVector(-300.f, 0.f, 150.f);

	UPROPERTY(EditAnywhere, Category = "Cutscene")
	FRotator RelativeRotation = FRotator::ZeroRotator;

	UPROPERTY(EditAnywhere, Category = "Cutscene", meta = (ClampMin = 5, ClampMax = 170))
	float FOV = 60.f;

	/** Berapa lama shot ini tertahan (detik) sebelum cut/blend ke shot berikutnya. */
	UPROPERTY(EditAnywhere, Category = "Cutscene", meta = (ClampMin = 0.1))
	float HoldSeconds = 2.5f;

	/** Durasi blend KE shot ini dari shot sebelumnya (0 = hard cut). */
	UPROPERTY(EditAnywhere, Category = "Cutscene", meta = (ClampMin = 0))
	float BlendSeconds = 0.75f;
};

/**
 * Cutscene ringan tanpa Sequencer: rangkaian shot kamera (ACameraActor
 * di-spawn & digeser tiap shot lewat SetViewTargetWithBlend) + opsional
 * trigger dialogue di akhir. Placement di level = titik acuan RelativeLocation
 * tiap shot (drag actor ini ke scene, isi Shots di Details panel).
 *
 * Ini presentation client-local murni (viewport + input mode) — TIDAK
 * memodifikasi gameplay state replicated, jadi tidak butuh HasAuthority()
 * guard seperti CombatComponent/damage pipeline. Panggil Play() di machine
 * yang relevan (biasanya lewat trigger volume BP di jalur GoToLocation
 * quest objective, pola sama dengan trigger volume yang sudah ada).
 */
UCLASS()
class MYGAME_API ACutsceneActor : public AActor
{
	GENERATED_BODY()

public:
	ACutsceneActor();

	/** Mulai cutscene utk satu player lokal. No-op kalau sudah main atau Shots kosong. */
	UFUNCTION(BlueprintCallable, Category = "Cutscene")
	void Play(APlayerController* PC);

	/** Hentikan paksa (skip) — tetap jalanin dialogue akhir kalau ada, sama seperti selesai normal. */
	UFUNCTION(BlueprintCallable, Category = "Cutscene")
	void Skip();

	UFUNCTION(BlueprintPure, Category = "Cutscene")
	bool IsPlaying() const { return IsValid(CachedPC); }

	UPROPERTY(BlueprintAssignable, Category = "Cutscene")
	FOnCutsceneFinished OnCutsceneFinished;

protected:
	/** Cutscene diputus paksa (level streamed out, dll) — bersihin camera & input mode, jangan biarin stuck. */
	virtual void EndPlay(const EEndPlayReason::Type EndPlayReason) override;

	UPROPERTY(EditAnywhere, Category = "Cutscene")
	TArray<FCutsceneShot> Shots;

	/** Opsional — dipicu setelah shot terakhir (mis. hasil BuildYukineIntroDialogue). */
	UPROPERTY(EditAnywhere, Category = "Cutscene|Dialogue")
	TObjectPtr<UDataTable> DialogueTable;

	UPROPERTY(EditAnywhere, Category = "Cutscene|Dialogue")
	FName DialogueStartNode = TEXT("Start");

	/** Destroy actor ini otomatis setelah selesai main (cutscene one-shot). */
	UPROPERTY(EditAnywhere, Category = "Cutscene")
	bool bDestroyAfterPlay = false;

private:
	UPROPERTY()
	TObjectPtr<ACameraActor> ShotCamera;

	UPROPERTY()
	TObjectPtr<APlayerController> CachedPC;

	UPROPERTY()
	TObjectPtr<APawn> CachedPawn;

	int32 CurrentShotIndex = 0;
	FTimerHandle ShotTimer;

	void ApplyShot(int32 ShotIndex);
	void AdvanceShot();
	void EndCutscene();
};
