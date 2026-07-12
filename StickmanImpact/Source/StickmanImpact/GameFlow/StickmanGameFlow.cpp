// Copyright StickmanImpact Project.

#include "StickmanGameFlow.h"
#include "SaveSystem/SaveManager.h"
#include "Cutscene/CutsceneManager.h"
#include "Dialogue/DialogueManager.h"
#include "Party/PartyManager.h"
#include "Party/StickmanPartyTypes.h"
#include "Kismet/GameplayStatics.h"
#include "Engine/DataTable.h"
#include "Misc/ConfigCacheIni.h"
#include "Misc/FileHelper.h"
#include "HAL/PlatformFileManager.h"
#include "TimerManager.h"

namespace
{
	const TCHAR* FlowConfigSection = TEXT("/Script/StickmanImpact.StickmanGameFlow");
}

FString UStickmanGameFlow::GetSessionSentinelPath() const
{
	return FPaths::ProjectSavedDir() / TEXT("session.lock");
}

void UStickmanGameFlow::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);

	// Unclean-shutdown detection: sentinel still present = last session never cleaned up.
	IPlatformFile& PlatformFile = FPlatformFileManager::Get().GetPlatformFile();
	bLastSessionCrashed = PlatformFile.FileExists(*GetSessionSentinelPath());
	FFileHelper::SaveStringToFile(TEXT("running"), *GetSessionSentinelPath());

	GConfig->GetBool(FlowConfigSection, TEXT("bFirstLaunch"), bFirstLaunch, GGameUserSettingsIni);

	// Defer delegate wiring one tick (subsystem init order isn't guaranteed).
	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().SetTimerForNextTick([this]()
		{
			if (UCutsceneManager* Cutscenes = GetGameInstance()->GetSubsystem<UCutsceneManager>())
			{
				Cutscenes->OnCutsceneStarted.AddDynamic(this, &UStickmanGameFlow::HandleCutsceneStarted);
				Cutscenes->OnCutsceneEnded.AddDynamic(this, &UStickmanGameFlow::HandleCutsceneEnded);
			}
			if (UDialogueManager* Dialogue = GetGameInstance()->GetSubsystem<UDialogueManager>())
			{
				Dialogue->OnDialogueStarted.AddDynamic(this, &UStickmanGameFlow::HandleDialogueStarted);
				Dialogue->OnDialogueEnded.AddDynamic(this, &UStickmanGameFlow::HandleDialogueEnded);
			}
			if (USaveManager* Saves = GetGameInstance()->GetSubsystem<USaveManager>())
			{
				Saves->OnLoadCompleted.AddDynamic(this, &UStickmanGameFlow::HandleLoadCompleted);
			}

			// Splash is brief and code-driven; UI (title screen widget) listens to OnStateChanged.
			SetStateInternal(EGameFlowState::TitleScreen);
		});
	}
}

void UStickmanGameFlow::Deinitialize()
{
	// Clean shutdown: remove the sentinel so the next launch knows this session ended properly.
	FPlatformFileManager::Get().GetPlatformFile().DeleteFile(*GetSessionSentinelPath());
	Super::Deinitialize();
}

bool UStickmanGameFlow::IsTransitionLegal(EGameFlowState From, EGameFlowState To) const
{
	if (From == To)
	{
		return false;
	}
	switch (From)
	{
		case EGameFlowState::Splash: return To == EGameFlowState::TitleScreen;
		case EGameFlowState::TitleScreen: return To == EGameFlowState::Loading;
		case EGameFlowState::Loading: return To == EGameFlowState::Playing || To == EGameFlowState::TitleScreen;
		case EGameFlowState::Playing:
			return To == EGameFlowState::Paused || To == EGameFlowState::Cutscene
				|| To == EGameFlowState::Dialogue || To == EGameFlowState::Loading
				|| To == EGameFlowState::TitleScreen;
		case EGameFlowState::Paused: return To == EGameFlowState::Playing || To == EGameFlowState::TitleScreen;
		case EGameFlowState::Cutscene: return To == EGameFlowState::Playing || To == EGameFlowState::Dialogue;
		case EGameFlowState::Dialogue: return To == EGameFlowState::Playing || To == EGameFlowState::Cutscene;
		default: return false;
	}
}

bool UStickmanGameFlow::RequestState(EGameFlowState NewState)
{
	if (!IsTransitionLegal(CurrentState, NewState))
	{
		UE_LOG(LogTemp, Warning, TEXT("[GameFlow] Illegal transition %s -> %s refused."),
			*UEnum::GetValueAsString(CurrentState), *UEnum::GetValueAsString(NewState));
		return false;
	}
	SetStateInternal(NewState);
	return true;
}

void UStickmanGameFlow::SetStateInternal(EGameFlowState NewState)
{
	const EGameFlowState OldState = CurrentState;
	CurrentState = NewState;
	OnStateChanged.Broadcast(NewState, OldState);
}

void UStickmanGameFlow::DoFade(bool bToBlack)
{
	OnFadeRequested.Broadcast(bToBlack);

	// Built-in fallback so fades work before any fade widget exists.
	if (APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0))
	{
		if (PC->PlayerCameraManager)
		{
			PC->PlayerCameraManager->StartCameraFade(bToBlack ? 0.f : 1.f, bToBlack ? 1.f : 0.f, 0.5f,
				FLinearColor::Black, true, bToBlack);
		}
	}
}

void UStickmanGameFlow::StartGame(int32 LoadSlotIndex)
{
	if (!RequestState(EGameFlowState::Loading))
	{
		return;
	}
	DoFade(true);
	PendingLoadSlot = LoadSlotIndex;

	if (LoadSlotIndex == INDEX_NONE)
	{
		// New game: no save to load — first-time setup then straight to Playing.
		RunFirstTimeSetup();
		SetStateInternal(EGameFlowState::Playing);
		DoFade(false);
		return;
	}

	if (USaveManager* Saves = GetGameInstance()->GetSubsystem<USaveManager>())
	{
		Saves->LoadFromSlotAsync(LoadSlotIndex); // HandleLoadCompleted advances the state.
	}
}

void UStickmanGameFlow::HandleLoadCompleted(int32 SlotIndex, bool bSuccess)
{
	if (CurrentState != EGameFlowState::Loading || SlotIndex != PendingLoadSlot)
	{
		return;
	}
	PendingLoadSlot = INDEX_NONE;

	SetStateInternal(bSuccess ? EGameFlowState::Playing : EGameFlowState::TitleScreen);
	DoFade(false);
	if (!bSuccess)
	{
		UE_LOG(LogTemp, Error, TEXT("[GameFlow] Load failed (slot %d incl. fallbacks) — returned to title."), SlotIndex);
	}
}

void UStickmanGameFlow::ReturnToTitle()
{
	DoFade(true);
	if (USaveManager* Saves = GetGameInstance()->GetSubsystem<USaveManager>())
	{
		Saves->RequestAutoSave(TEXT("return to title"));
	}
	SetStateInternal(EGameFlowState::TitleScreen);
	DoFade(false);
}

void UStickmanGameFlow::TogglePause()
{
	if (CurrentState == EGameFlowState::Playing)
	{
		RequestState(EGameFlowState::Paused);
		UGameplayStatics::SetGamePaused(this, true);
	}
	else if (CurrentState == EGameFlowState::Paused)
	{
		RequestState(EGameFlowState::Playing);
		UGameplayStatics::SetGamePaused(this, false);
	}
}

void UStickmanGameFlow::RunFirstTimeSetup()
{
	if (!bFirstLaunch)
	{
		return;
	}
	bFirstLaunch = false;
	GConfig->SetBool(FlowConfigSection, TEXT("bFirstLaunch"), false, GGameUserSettingsIni);
	GConfig->Flush(false, GGameUserSettingsIni);

	// Grant the starting character.
	if (const UDataTable* CharacterTable = Cast<UDataTable>(CharacterTablePath.TryLoad()))
	{
		if (const FStickmanCharacterData* Row = CharacterTable->FindRow<FStickmanCharacterData>(
				InitialCharacterRow, TEXT("FirstTimeSetup")))
		{
			if (UPartyManager* Party = GetGameInstance()->GetSubsystem<UPartyManager>())
			{
				Party->AddPartyMember(*Row);
			}
		}
	}
	// Tutorial system reads IsFirstLaunch()==true state via its own "seen" tracking — nothing
	// else to flag here; every tutorial is unseen on a fresh install by definition.
}

void UStickmanGameFlow::HandleCutsceneStarted(ULevelSequence* Sequence)
{
	if (CurrentState == EGameFlowState::Playing || CurrentState == EGameFlowState::Dialogue)
	{
		SetStateInternal(EGameFlowState::Cutscene);
	}
}

void UStickmanGameFlow::HandleCutsceneEnded(ULevelSequence* Sequence)
{
	if (CurrentState == EGameFlowState::Cutscene)
	{
		SetStateInternal(EGameFlowState::Playing);
	}
}

void UStickmanGameFlow::HandleDialogueStarted(UDialogueSequence* Sequence)
{
	if (CurrentState == EGameFlowState::Playing)
	{
		SetStateInternal(EGameFlowState::Dialogue);
	}
}

void UStickmanGameFlow::HandleDialogueEnded(UDialogueSequence* Sequence)
{
	if (CurrentState == EGameFlowState::Dialogue)
	{
		SetStateInternal(EGameFlowState::Playing);
	}
}
