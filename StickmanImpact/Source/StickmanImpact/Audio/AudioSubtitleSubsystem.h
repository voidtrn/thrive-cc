// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "AudioSubtitleSubsystem.generated.h"

UENUM(BlueprintType)
enum class EAudioCueImportance : uint8
{
	Critical,   // enemy attack tells, incoming danger
	Important,  // approaching footsteps, treasure chimes
	Flavor      // ambient description
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnAudioSubtitle, const FText&, Text, EAudioCueImportance, Importance);

/**
 * Accessibility: subtitles for non-dialogue audio ("[Enemy growls behind you]",
 * "[Footsteps approaching]", "[Treasure chimes nearby]"). Systems that play an important
 * sound call `Broadcast` alongside it; the HUD widget renders the queue when the
 * audio-cues-for-visual-info / subtitles settings are on (checked here so callers don't
 * have to). Directional hint is derived from the source location vs the player
 * ("behind you", "to your left"). Visual sound-visualization (radar blips) subscribes to
 * the same delegate. Mono-audio + balance presets are engine audio settings — documented in
 * the settings screen, not duplicated here.
 */
UCLASS()
class STICKMANIMPACT_API UAudioSubtitleSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	// Broadcast a subtitle for a sound at a world location (adds a direction suffix).
	UFUNCTION(BlueprintCallable, Category = "AudioSubtitle")
	void BroadcastAt(const FText& BaseText, FVector SourceLocation, EAudioCueImportance Importance = EAudioCueImportance::Important);

	// Broadcast a non-positional subtitle.
	UFUNCTION(BlueprintCallable, Category = "AudioSubtitle")
	void Broadcast(const FText& Text, EAudioCueImportance Importance = EAudioCueImportance::Important);

	UPROPERTY(BlueprintAssignable, Category = "AudioSubtitle")
	FOnAudioSubtitle OnAudioSubtitle;

private:
	bool ShouldBroadcast() const;
	FString DirectionSuffix(const FVector& SourceLocation) const;
};
