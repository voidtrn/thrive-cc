// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "GameplayTagContainer.h"
#include "ConsequenceTrackerSubsystem.generated.h"

UENUM(BlueprintType)
enum class EFactionStanding : uint8
{
	Hostile,
	Unfriendly,
	Neutral,
	Friendly,
	Allied
};

/**
 * A butterfly-effect rule: when the player has picked OptionID at ChoiceID, wait
 * DelayGameHours, then set ConsequenceFlag. Content (dialogue variants, quests, world
 * changes) keys off the flag through the systems that already read story flags — the
 * consequence is deliberately NOT immediate, that's the point.
 */
USTRUCT(BlueprintType)
struct FDeferredConsequence
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Consequence")
	FName ChoiceID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Consequence")
	FName RequiredOptionID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Consequence")
	float DelayGameHours = 24.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Consequence")
	FGameplayTag ConsequenceFlag;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnChoiceRecorded, FName, ChoiceID, FName, OptionID);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnFactionStandingChanged, FName, Faction, EFactionStanding, NewStanding);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnConsequenceTriggered, FGameplayTag, ConsequenceFlag);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnNPCDeathMarked, FName, NPCID);

/**
 * The story's memory. Everything "choice & consequence" funnels through here:
 *
 * - **Choices**: RecordChoice(ChoiceID, OptionID) — call from dialogue choice handlers /
 *   quest branches. GetChosenOption is how later content asks "what did they pick?".
 * - **Branches**: a major branch is just a choice every subsequent piece of content
 *   checks; nothing structural needed beyond flags + this record.
 * - **Factions**: alignment score per faction with standing bands
 *   (Hostile<-50<Unfriendly<-10<Neutral<+10<Friendly<+50<Allied). Quest lines gate on
 *   GetFactionStanding — raising one side lowers its rival if you say so at the call site.
 * - **Permanent NPC death**: MarkNPCDead — NPC actors check IsNPCDead in BeginPlay and
 *   self-destroy; dialogue/quests treat the ID as gone. There is no resurrection path by
 *   design.
 * - **Butterfly effect**: RegisterDeferredConsequence rules arm when their choice is
 *   recorded and fire (set ConsequenceFlag via UDialogueManager) DelayGameHours later —
 *   drive the clock with NotifyGameHoursPassed from ADayNightManager, same hook as
 *   reputation decay.
 */
UCLASS()
class STICKMANIMPACT_API UConsequenceTrackerSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	// --- Choices ---------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Consequence")
	void RecordChoice(FName ChoiceID, FName OptionID);

	UFUNCTION(BlueprintPure, Category = "Consequence")
	FName GetChosenOption(FName ChoiceID) const;

	UFUNCTION(BlueprintPure, Category = "Consequence")
	bool WasChoiceMade(FName ChoiceID) const { return Choices.Contains(ChoiceID); }

	// --- Factions --------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Consequence")
	void AddFactionAlignment(FName Faction, int32 Delta);

	UFUNCTION(BlueprintPure, Category = "Consequence")
	int32 GetFactionAlignment(FName Faction) const;

	UFUNCTION(BlueprintPure, Category = "Consequence")
	EFactionStanding GetFactionStanding(FName Faction) const;

	// --- Permanent NPC death -----------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Consequence")
	void MarkNPCDead(FName NPCID);

	UFUNCTION(BlueprintPure, Category = "Consequence")
	bool IsNPCDead(FName NPCID) const { return DeadNPCIDs.Contains(NPCID); }

	// --- Butterfly effect ----------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Consequence")
	void RegisterDeferredConsequence(const FDeferredConsequence& Rule);

	UFUNCTION(BlueprintCallable, Category = "Consequence")
	void NotifyGameHoursPassed(float Hours);

	// --- Delegates -------------------------------------------------------------------------

	UPROPERTY(BlueprintAssignable, Category = "Consequence")
	FOnChoiceRecorded OnChoiceRecorded;

	UPROPERTY(BlueprintAssignable, Category = "Consequence")
	FOnFactionStandingChanged OnFactionStandingChanged;

	UPROPERTY(BlueprintAssignable, Category = "Consequence")
	FOnConsequenceTriggered OnConsequenceTriggered;

	UPROPERTY(BlueprintAssignable, Category = "Consequence")
	FOnNPCDeathMarked OnNPCDeathMarked;

	// Save hooks (not yet in the binary save format — see README).
	void ExportSaveState(TMap<FName, FName>& OutChoices, TMap<FName, int32>& OutFactions, TArray<FName>& OutDeadNPCs) const;
	void ImportSaveState(const TMap<FName, FName>& InChoices, const TMap<FName, int32>& InFactions, const TArray<FName>& InDeadNPCs);

private:
	struct FArmedConsequence
	{
		FDeferredConsequence Rule;
		float HoursRemaining = 0.f;
	};

	EFactionStanding StandingForScore(int32 Score) const;
	void ArmMatchingConsequences(FName ChoiceID, FName OptionID);

	TMap<FName, FName> Choices;
	TMap<FName, int32> FactionAlignment;
	TSet<FName> DeadNPCIDs;
	TArray<FDeferredConsequence> PendingRules;   // Registered, choice not yet made.
	TArray<FArmedConsequence> ArmedConsequences; // Choice made, counting down.
};
