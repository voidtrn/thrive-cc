// Copyright StickmanImpact Project.

#include "StickmanReplaySubsystem.h"
#include "Engine/GameInstance.h"
#include "Engine/World.h"
#include "Engine/DemoNetDriver.h"
#include "Kismet/GameplayStatics.h"

// ---------------------------------------------------------------- recording -----------

void UStickmanReplaySubsystem::StartRecording(const FString& ReplayName)
{
	if (bRecording)
	{
		return;
	}
	bRecording = true;
	RecordStartTime = FPlatformTime::Seconds();
	EventMarkers.Empty();

	GetGameInstance()->StartRecordingReplay(ReplayName, ReplayName);

	AutoReplayNames.Add(ReplayName);
	PruneAutoReplays();
	OnReplayRecordingChanged.Broadcast(true);
}

void UStickmanReplaySubsystem::StopRecording()
{
	if (!bRecording)
	{
		return;
	}
	bRecording = false;
	GetGameInstance()->StopRecordingReplay();
	OnReplayRecordingChanged.Broadcast(false);
}

void UStickmanReplaySubsystem::AddEventMarker(const FString& EventType, const FString& Description)
{
	if (!bRecording)
	{
		return;
	}
	FReplayEventMarker Marker;
	Marker.TimeSeconds = static_cast<float>(FPlatformTime::Seconds() - RecordStartTime);
	Marker.EventType = EventType;
	Marker.Description = Description;
	EventMarkers.Add(Marker);
}

void UStickmanReplaySubsystem::PruneAutoReplays()
{
	// FIFO delete past the cap; bookmarked replays are exempt (skipped, stay on disk).
	while (AutoReplayNames.Num() > MaxAutoReplays)
	{
		const FString Oldest = AutoReplayNames[0];
		AutoReplayNames.RemoveAt(0);
		if (!BookmarkedReplays.Contains(Oldest))
		{
			// Local replay streamer stores under Saved/Demos/<name>; delete the folder.
			const FString DemoDir = FPaths::ProjectSavedDir() / TEXT("Demos") / Oldest;
			IFileManager::Get().DeleteDirectory(*DemoDir, false, true);
		}
	}
}

// ---------------------------------------------------------------- playback ------------

void UStickmanReplaySubsystem::PlayReplay(const FString& ReplayName)
{
	StopRecording();
	GetGameInstance()->PlayReplay(ReplayName);
}

bool UStickmanReplaySubsystem::IsInPlayback() const
{
	const UWorld* World = GetGameInstance()->GetWorld();
	return World && World->IsPlayingReplay();
}

void UStickmanReplaySubsystem::SetPlaybackSpeed(float Speed)
{
	UWorld* World = GetGameInstance()->GetWorld();
	if (!World || !World->IsPlayingReplay())
	{
		return;
	}
	// Demo playback speed rides world time dilation; 0 = paused (clamped to a tiny epsilon
	// because 0 dilation stalls the world tick entirely).
	UGameplayStatics::SetGlobalTimeDilation(World, FMath::Clamp(Speed, 0.001f, 8.f));
}

void UStickmanReplaySubsystem::JumpToTime(float TimeSeconds)
{
	UWorld* World = GetGameInstance()->GetWorld();
	UDemoNetDriver* Demo = World ? World->GetDemoNetDriver() : nullptr;
	if (Demo)
	{
		Demo->GotoTimeInSeconds(FMath::Max(TimeSeconds, 0.f));
	}
}
