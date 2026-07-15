// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "GameplayTagContainer.h"
#include "PartyBanterComponent.generated.h"

class USoundBase;

/** One ambient banter line. Authored in arrays/DataAssets on the component. */
USTRUCT(BlueprintType)
struct FBanterLine
{
	GENERATED_BODY()

	// Must be in the party for the line to play.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Banter")
	FString SpeakerCharacterID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Banter", meta = (MultiLine = "true"))
	FText Line;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Banter")
	TObjectPtr<USoundBase> VoiceLine;

	// Optional gates: story flag, minimum bond with the speaker.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Banter")
	FGameplayTag RequiredStoryFlag;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Banter")
	int32 MinBondLevel = 0;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnBanterPlayed, const FString&, SpeakerCharacterID, const FText&, Line);

/**
 * Ambient party chatter while exploring — the "characters exist outside cutscenes" layer.
 * Every BanterInterval (±variance) it picks one eligible line: speaker in party, story
 * flag met (via UDialogueManager), bond high enough (via UCharacterBondSubsystem), not
 * one of the last RecentLineMemory lines, and never during dialogue/combat-ish montages.
 * OnBanterPlayed feeds the subtitle/speech-bubble widget; VoiceLine plays 2D if set.
 *
 * Lines gated on MinBondLevel double as bond-level rewards: higher bond = characters
 * open up more. Deeper back-and-forth exchanges are authored as UDialogueSequences and
 * triggered from a banter line's story flag instead of chaining here.
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UPartyBanterComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UPartyBanterComponent();

	virtual void BeginPlay() override;
	virtual void EndPlay(const EEndPlayReason::Type EndPlayReason) override;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Banter")
	TArray<FBanterLine> BanterLines;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Banter")
	float BanterInterval = 120.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Banter")
	float IntervalVariance = 45.f;

	// How many recently-played line indices are excluded from re-selection.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Banter")
	int32 RecentLineMemory = 5;

	UPROPERTY(BlueprintAssignable, Category = "Banter")
	FOnBanterPlayed OnBanterPlayed;

private:
	void ScheduleNext();
	void TryPlayBanter();
	bool IsLineEligible(int32 LineIndex) const;

	FTimerHandle BanterTimerHandle;
	TArray<int32> RecentLineIndices;
};
