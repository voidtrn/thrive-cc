// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "GameplayTagContainer.h"
#include "EndingSubsystem.generated.h"

/** The five endings + hidden true ending. */
UENUM(BlueprintType)
enum class EGameEnding : uint8
{
	FallenHero,    // 0-20: dark — allies as final boss, world falls
	LoneSurvivor,  // 21-40: bittersweet — saved but scarred
	Balance,       // 41-60: neutral — magic sealed away
	HerosLegacy,   // 61-80: good — golden age
	TrueSavior,    // 81-100 + secret conditions: best — cycle broken
	Undetermined
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnEndingScoreChanged, int32, NewScore, EGameEnding, ProjectedEnding);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnEndingLocked, EGameEnding, Ending);

/**
 * The hidden ending score (0-100) + ending determination. Score moves via
 * `AddEndingPoints(source, delta)` — call from major story choices (±10), side-quest
 * resolutions (±3), character interactions (±1), faction allegiances (±5); each call also
 * logs into the choice log (`GetChoiceLog`) so the player can review what mattered.
 *
 * `GetProjectedEnding` maps score → the five thresholds; the **True Savior** ending
 * additionally requires every flag in `TrueEndingRequiredFlags` set (checked against
 * UDialogueManager story flags) — points alone never reach it. `LockEnding` is called at the
 * point-of-no-return (fires the pre-final NPC hint before via the projection). Seen endings
 * are recorded for NG+ (`HasSeenEnding` — NG+ dialogue/buff variations key off it).
 */
UCLASS()
class STICKMANIMPACT_API UEndingSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Ending")
	void AddEndingPoints(const FString& SourceDescription, int32 Delta);

	UFUNCTION(BlueprintPure, Category = "Ending")
	int32 GetEndingScore() const { return EndingScore; }

	// Score → ending; TrueSavior only if the secret flags are all set.
	UFUNCTION(BlueprintCallable, Category = "Ending")
	EGameEnding GetProjectedEnding() const;

	// Point-of-no-return: fixes the ending, records it as seen.
	UFUNCTION(BlueprintCallable, Category = "Ending")
	EGameEnding LockEnding();

	UFUNCTION(BlueprintPure, Category = "Ending")
	bool HasSeenEnding(EGameEnding Ending) const { return SeenEndings.Contains(Ending); }

	// The reviewable log of scored decisions: "description (+/-N)".
	UFUNCTION(BlueprintPure, Category = "Ending")
	const TArray<FString>& GetChoiceLog() const { return ChoiceLog; }

	// Flags the hidden true ending requires (set them from the secret quest chain).
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Ending")
	TArray<FGameplayTag> TrueEndingRequiredFlags;

	UPROPERTY(BlueprintAssignable, Category = "Ending")
	FOnEndingScoreChanged OnEndingScoreChanged;

	UPROPERTY(BlueprintAssignable, Category = "Ending")
	FOnEndingLocked OnEndingLocked;

	// Save hooks (not yet in the binary format — see README).
	void ExportSaveState(int32& OutScore, TArray<FString>& OutLog, TArray<EGameEnding>& OutSeen) const;
	void ImportSaveState(int32 InScore, const TArray<FString>& InLog, const TArray<EGameEnding>& InSeen);

private:
	bool AreTrueEndingConditionsMet() const;

	int32 EndingScore = 50; // start neutral
	TArray<FString> ChoiceLog;
	TSet<EGameEnding> SeenEndings;
	bool bEndingLocked = false;
	EGameEnding LockedEnding = EGameEnding::Undetermined;
};
