// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "ReplaySubsystem.generated.h"

USTRUCT(BlueprintType)
struct FReplayEventMarker
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly, Category = "Replay")
	float TimeSeconds = 0.f;

	// "kill" | "death" | "skill" | "reaction" | "bookmark"
	UPROPERTY(BlueprintReadOnly, Category = "Replay")
	FString EventType;

	UPROPERTY(BlueprintReadOnly, Category = "Replay")
	FString Description;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnReplayRecordingChanged, bool, bRecording);

/**
 * Wrapper over UE's native replay system (DemoNetDriver): recording captures the
 * replicated network stream to disk (small files — inputs/state, not video), playback
 * re-simulates it with full time control. Single-player records fine (the local demo
 * driver replicates to the file).
 *
 * - **Record**: `StartRecording(name)` / `StopRecording`; auto-record keeps the last
 *   MaxAutoReplays (FIFO delete, bookmarked ones exempt via `BookmarkReplay`).
 * - **Markers**: `AddEventMarker` timestamps kills/deaths/skills during recording; the
 *   timeline UI reads `GetEventMarkers` for jump-to-event.
 * - **Playback**: `PlayReplay(name)`; speed = `SetPlaybackSpeed` (0.25-8x via demo world
 *   time dilation), `JumpToTime` = the demo driver's GotoTimeInSeconds, pause = speed 0.
 *   Frame-step = pause + a tiny jump.
 * - **Cameras**: during playback the world is a normal (re-simulated) world — the photo-mode
 *   free camera works as-is, which also covers "photo mode during replays". Follow/player/
 *   enemy views = SetViewTarget on the replayed pawns. Cinematic keyframed camera tracks +
 *   cut/transition editing are Sequencer territory (the replay world can be recorded INTO
 *   Sequencer for that) — documented, not duplicated.
 * - **Export/share**: the .replay file itself is shareable (small); MP4 export is honest
 *   out-of-scope in-engine — route through Sequencer render or platform capture tools.
 */
UCLASS()
class STICKMANIMPACT_API UReplaySubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	// --- Recording ------------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Replay")
	void StartRecording(const FString& ReplayName);

	UFUNCTION(BlueprintCallable, Category = "Replay")
	void StopRecording();

	UFUNCTION(BlueprintPure, Category = "Replay")
	bool IsRecording() const { return bRecording; }

	// Timestamped event during recording (kill/death/skill/reaction) for the timeline.
	UFUNCTION(BlueprintCallable, Category = "Replay")
	void AddEventMarker(const FString& EventType, const FString& Description);

	UFUNCTION(BlueprintPure, Category = "Replay")
	const TArray<FReplayEventMarker>& GetEventMarkers() const { return EventMarkers; }

	// Exempt a replay from FIFO auto-delete.
	UFUNCTION(BlueprintCallable, Category = "Replay")
	void BookmarkReplay(const FString& ReplayName) { BookmarkedReplays.Add(ReplayName); }

	// --- Playback -------------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Replay")
	void PlayReplay(const FString& ReplayName);

	// 0 = paused; clamped 0-8.
	UFUNCTION(BlueprintCallable, Category = "Replay")
	void SetPlaybackSpeed(float Speed);

	UFUNCTION(BlueprintCallable, Category = "Replay")
	void JumpToTime(float TimeSeconds);

	UFUNCTION(BlueprintPure, Category = "Replay")
	bool IsInPlayback() const;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Replay")
	int32 MaxAutoReplays = 5;

	UPROPERTY(BlueprintAssignable, Category = "Replay")
	FOnReplayRecordingChanged OnReplayRecordingChanged;

private:
	void PruneAutoReplays();

	bool bRecording = false;
	double RecordStartTime = 0.0;
	TArray<FReplayEventMarker> EventMarkers;
	TArray<FString> AutoReplayNames; // FIFO of auto-record names
	TSet<FString> BookmarkedReplays;
};
