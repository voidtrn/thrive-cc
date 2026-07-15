// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "StickmanGameFlow.generated.h"

class UUserWidget;

UENUM(BlueprintType)
enum class EGameFlowState : uint8
{
	Splash,
	TitleScreen,
	Loading,
	Playing,
	Paused,
	Cutscene,
	Dialogue
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnGameFlowStateChanged, EGameFlowState, NewState, EGameFlowState, OldState);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnFadeRequested, bool, bFadeToBlack);

/**
 * Master state machine tying the subsystems together: Splash → TitleScreen → Loading →
 * Playing, with Paused/Cutscene/Dialogue as Playing-adjacent states (Cutscene/Dialogue enter
 * automatically off UCutsceneManager/UDialogueManager delegates, so nothing else needs to
 * report them). Transitions validate against a legal-move table — an illegal request logs and
 * is refused rather than corrupting state.
 *
 * Fades: broadcasts OnFadeRequested; a persistent HUD-level fade widget (black image, lerp
 * opacity) listens — camera fades also work (APlayerCameraManager::StartCameraFade is used as
 * the built-in fallback so fades function before any UI exists).
 *
 * First-time setup: bFirstLaunch persisted in the settings config section; on first PlayGame,
 * grants InitialCharacterRow from CharacterTable to the party and sets the tutorial-active
 * flag the tutorial subsystem reads.
 *
 * Crash recovery: the engine's crash handling is external (see PACKAGING.md); what this does
 * is detect an unclean previous session (sentinel file written on init, cleared on clean
 * shutdown) and offer the auto-save on the next launch via bLastSessionCrashed.
 */
UCLASS(Config = Game)
class STICKMANIMPACT_API UStickmanGameFlow : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;
	virtual void Deinitialize() override;

	UFUNCTION(BlueprintPure, Category = "Game Flow")
	EGameFlowState GetState() const { return CurrentState; }

	UFUNCTION(BlueprintCallable, Category = "Game Flow")
	bool RequestState(EGameFlowState NewState);

	// TitleScreen -> Loading -> Playing, loading slot (INDEX_NONE = new game).
	UFUNCTION(BlueprintCallable, Category = "Game Flow")
	void StartGame(int32 LoadSlotIndex);

	UFUNCTION(BlueprintCallable, Category = "Game Flow")
	void ReturnToTitle();

	UFUNCTION(BlueprintCallable, Category = "Game Flow")
	void TogglePause();

	UFUNCTION(BlueprintPure, Category = "Game Flow")
	bool DidLastSessionCrash() const { return bLastSessionCrashed; }

	UFUNCTION(BlueprintPure, Category = "Game Flow")
	bool IsFirstLaunch() const { return bFirstLaunch; }

	// DataTable of FStickmanCharacterData + row name granted on first launch.
	UPROPERTY(Config)
	FSoftObjectPath CharacterTablePath;

	UPROPERTY(Config)
	FName InitialCharacterRow = TEXT("Hero01");

	UPROPERTY(BlueprintAssignable, Category = "Game Flow")
	FOnGameFlowStateChanged OnStateChanged;

	UPROPERTY(BlueprintAssignable, Category = "Game Flow")
	FOnFadeRequested OnFadeRequested;

private:
	bool IsTransitionLegal(EGameFlowState From, EGameFlowState To) const;
	void SetStateInternal(EGameFlowState NewState);
	void DoFade(bool bToBlack);
	void RunFirstTimeSetup();

	UFUNCTION()
	void HandleCutsceneStarted(class ULevelSequence* Sequence);
	UFUNCTION()
	void HandleCutsceneEnded(class ULevelSequence* Sequence);
	UFUNCTION()
	void HandleDialogueStarted(class UDialogueSequence* Sequence);
	UFUNCTION()
	void HandleDialogueEnded(class UDialogueSequence* Sequence);
	UFUNCTION()
	void HandleLoadCompleted(int32 SlotIndex, bool bSuccess);

	FString GetSessionSentinelPath() const;

	EGameFlowState CurrentState = EGameFlowState::Splash;
	bool bLastSessionCrashed = false;
	bool bFirstLaunch = true;
	int32 PendingLoadSlot = INDEX_NONE;
};
