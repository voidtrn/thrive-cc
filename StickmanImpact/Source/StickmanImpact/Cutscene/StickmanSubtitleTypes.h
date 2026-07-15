// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "StickmanSubtitleTypes.generated.h"

/** One subtitle line, timed against the playing Level Sequence's own clock. */
USTRUCT(BlueprintType)
struct FSubtitleEntry
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Subtitle")
	FText Text;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Subtitle")
	float StartTime = 0.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Subtitle")
	float EndTime = 2.f;

	// Which "track"/speaker this belongs to — lets two characters have overlapping subtitles
	// rendered in different colors/positions instead of clobbering one line.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Subtitle")
	FName SpeakerTrack = NAME_None;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Subtitle")
	FLinearColor SpeakerColor = FLinearColor::White;

	bool IsActiveAtTime(float Time) const { return Time >= StartTime && Time <= EndTime; }
};
