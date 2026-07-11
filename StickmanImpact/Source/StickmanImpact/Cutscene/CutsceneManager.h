// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "StickmanSubtitleTypes.h"
#include "CutsceneManager.generated.h"

class ULevelSequence;
class ULevelSequencePlayer;
class ALevelSequenceActor;
class USoundBase;
class UNiagaraSystem;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnCutsceneStarted, ULevelSequence*, Sequence);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnCutsceneEnded, ULevelSequence*, Sequence);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnLetterboxToggled, bool, bShow);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnSubtitleChanged, FText, Text, FLinearColor, Color);

/**
 * Plays Level Sequences as cutscenes: skip-to-end, pause/resume, playback speed, a letterbox
 * on/off delegate for the HUD to react to, and a simple polling-based subtitle track driven
 * off the sequence's own playback time. Also exposes PlaySound/SpawnVFX/ShowSubtitle so a
 * Sequencer Event Track can call back into gameplay code mid-cutscene.
 */
UCLASS()
class STICKMANIMPACT_API UCutsceneManager : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	virtual void Deinitialize() override;

	UFUNCTION(BlueprintCallable, Category = "Cutscene")
	void PlayCutscene(ULevelSequence* Sequence, bool bSkippable);

	// Fades to the end of the sequence instantly (no-op if the current cutscene isn't skippable).
	UFUNCTION(BlueprintCallable, Category = "Cutscene")
	void SkipCutscene();

	UFUNCTION(BlueprintCallable, Category = "Cutscene")
	void PauseCutscene();

	UFUNCTION(BlueprintCallable, Category = "Cutscene")
	void ResumeCutscene();

	UFUNCTION(BlueprintCallable, Category = "Cutscene")
	void SetPlaybackSpeed(float Speed);

	UFUNCTION(BlueprintPure, Category = "Cutscene")
	bool IsCutscenePlaying() const { return CurrentSequence != nullptr; }

	// --- Callable from a Sequencer Event Track ---------------------------
	UFUNCTION(BlueprintCallable, Category = "Cutscene|Events")
	void PlaySound(USoundBase* Sound);

	UFUNCTION(BlueprintCallable, Category = "Cutscene|Events")
	void SpawnVFX(UNiagaraSystem* VFX, FVector Location);

	UFUNCTION(BlueprintCallable, Category = "Cutscene|Events")
	void ShowSubtitle(FText Text, FLinearColor Color);

	// Author the subtitle timeline for the currently-queued cutscene before calling
	// PlayCutscene() — polled every 0.1s against the sequence's own playback time.
	UFUNCTION(BlueprintCallable, Category = "Cutscene|Subtitles")
	void SetSubtitleTrack(const TArray<FSubtitleEntry>& Entries);

	UPROPERTY(BlueprintAssignable, Category = "Cutscene")
	FOnCutsceneStarted OnCutsceneStarted;

	UPROPERTY(BlueprintAssignable, Category = "Cutscene")
	FOnCutsceneEnded OnCutsceneEnded;

	UPROPERTY(BlueprintAssignable, Category = "Cutscene")
	FOnLetterboxToggled OnLetterboxToggled;

	UPROPERTY(BlueprintAssignable, Category = "Cutscene")
	FOnSubtitleChanged OnSubtitleChanged;

	// Tracks which cutscenes have played, keyed by an ID the trigger volume provides
	// (see ACutsceneTriggerVolume::CutsceneID) — separate from the ULevelSequence pointer so
	// designers can re-point a trigger at a different sequence without losing "already watched".
	UFUNCTION(BlueprintPure, Category = "Cutscene")
	bool HasWatchedCutscene(const FString& CutsceneID) const { return WatchedCutsceneIDs.Contains(CutsceneID); }

	UFUNCTION(BlueprintCallable, Category = "Cutscene")
	void MarkCutsceneWatched(const FString& CutsceneID) { WatchedCutsceneIDs.Add(CutsceneID); }

private:
	UFUNCTION()
	void HandleSequenceFinished();

	void TickSubtitles();
	void EndCutscene();

	UPROPERTY()
	TObjectPtr<ULevelSequence> CurrentSequence;

	UPROPERTY()
	TObjectPtr<ULevelSequencePlayer> CurrentPlayer;

	UPROPERTY()
	TObjectPtr<ALevelSequenceActor> CurrentSequenceActor;

	bool bCurrentSkippable = true;

	TArray<FSubtitleEntry> PendingSubtitleTrack;
	TArray<FSubtitleEntry> ActiveSubtitleTrack;
	FText LastSubtitleText;

	FTimerHandle SubtitleTimerHandle;

	TSet<FString> WatchedCutsceneIDs;
};
