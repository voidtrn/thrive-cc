// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "GameplayTagContainer.h"
#include "StickmanDialogueTypes.h"
#include "DialogueManager.generated.h"

class UDialogueSequence;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnDialogueStarted, UDialogueSequence*, Sequence);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnDialogueLineChanged, FDialogueLine, Line);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnDialogueEnded, UDialogueSequence*, Sequence);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnDialogueChoicesPresented, const TArray<FDialogueChoice>&, Choices);

/**
 * Runs one UDialogueSequence at a time: filters lines by RequiredFlags, applies SetFlagsAfter,
 * tracks story flags (GameplayTags) and which sequences have already played, and presents
 * branching choices at the end of a sequence. UDialogueWidget is the UI-facing consumer —
 * bind to the delegates below, call SkipLine()/AdvanceLine()/SelectChoice() from input.
 */
UCLASS()
class STICKMANIMPACT_API UDialogueManager : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Dialogue")
	bool bPauseGameDuringDialogue = false;

	UPROPERTY(BlueprintAssignable, Category = "Dialogue")
	FOnDialogueStarted OnDialogueStarted;

	UPROPERTY(BlueprintAssignable, Category = "Dialogue")
	FOnDialogueLineChanged OnDialogueLineChanged;

	UPROPERTY(BlueprintAssignable, Category = "Dialogue")
	FOnDialogueEnded OnDialogueEnded;

	UPROPERTY(BlueprintAssignable, Category = "Dialogue")
	FOnDialogueChoicesPresented OnDialogueChoicesPresented;

	UFUNCTION(BlueprintCallable, Category = "Dialogue")
	void StartDialogue(UDialogueSequence* Sequence);

	// Advances to the next eligible line (or ends/presents choices if there isn't one).
	UFUNCTION(BlueprintCallable, Category = "Dialogue")
	void AdvanceLine();

	// Skips the rest of the current sequence outright (no-op if !bCanSkip or bImportantStory).
	UFUNCTION(BlueprintCallable, Category = "Dialogue")
	void SkipLine();

	UFUNCTION(BlueprintCallable, Category = "Dialogue")
	void SelectChoice(int32 ChoiceIndex);

	UFUNCTION(BlueprintPure, Category = "Dialogue")
	bool IsDialogueActive() const { return CurrentSequence != nullptr; }

	UFUNCTION(BlueprintPure, Category = "Dialogue")
	FDialogueLine GetCurrentLine() const;

	// DisplayTime if authored, else ~15 chars/sec with a 1.5s floor — for auto-advance mode.
	UFUNCTION(BlueprintPure, Category = "Dialogue")
	float GetCurrentLineDisplayTime() const { return CalculateDisplayTime(GetCurrentLine()); }

	// --- Story flags (GameplayTags) -------------------------------------
	UFUNCTION(BlueprintCallable, Category = "Dialogue|Story")
	void SetStoryFlag(FGameplayTag Flag);

	UFUNCTION(BlueprintCallable, Category = "Dialogue|Story")
	void ClearStoryFlag(FGameplayTag Flag);

	UFUNCTION(BlueprintPure, Category = "Dialogue|Story")
	bool HasStoryFlag(FGameplayTag Flag) const;

	// --- Replay prevention -----------------------------------------------
	UFUNCTION(BlueprintPure, Category = "Dialogue")
	bool HasPlayedDialogue(const FString& SequenceID) const;

	UFUNCTION(BlueprintCallable, Category = "Dialogue")
	void ResetPlayedDialogue(const FString& SequenceID);

	UFUNCTION(BlueprintCallable, Category = "Dialogue")
	void ResetAllPlayedDialogue();

	UFUNCTION(BlueprintPure, Category = "Dialogue")
	const TArray<FDialogueLine>& GetHistory() const { return HistoryLog; }

private:
	void EndDialogue();
	bool IsLineEligible(const FDialogueLine& Line) const;
	float CalculateDisplayTime(const FDialogueLine& Line) const;
	void PresentChoicesOrEnd();

	UPROPERTY()
	TObjectPtr<UDialogueSequence> CurrentSequence;

	int32 CurrentLineIndex = INDEX_NONE;

	FGameplayTagContainer StoryFlags;
	TSet<FString> PlayedDialogueIDs;

	UPROPERTY()
	TArray<FDialogueLine> HistoryLog;
};
