// Copyright StickmanImpact Project.

#include "CutsceneManager.h"
#include "LevelSequence.h"
#include "LevelSequencePlayer.h"
#include "LevelSequenceActor.h"
#include "Kismet/GameplayStatics.h"
#include "NiagaraFunctionLibrary.h"
#include "TimerManager.h"

void UCutsceneManager::Deinitialize()
{
	if (GetWorld())
	{
		GetWorld()->GetTimerManager().ClearTimer(SubtitleTimerHandle);
	}
	Super::Deinitialize();
}

void UCutsceneManager::PlayCutscene(ULevelSequence* Sequence, bool bSkippable)
{
	if (!Sequence || !GetWorld())
	{
		return;
	}

	if (CurrentSequence)
	{
		EndCutscene();
	}

	FMovieSceneSequencePlaybackSettings Settings;
	ALevelSequenceActor* OutActor = nullptr;
	CurrentPlayer = ULevelSequencePlayer::CreateLevelSequencePlayer(GetWorld(), Sequence, Settings, OutActor);
	CurrentSequenceActor = OutActor;
	CurrentSequence = Sequence;
	bCurrentSkippable = bSkippable;

	ActiveSubtitleTrack = PendingSubtitleTrack;
	PendingSubtitleTrack.Reset();
	LastSubtitleText = FText::GetEmpty();

	if (!CurrentPlayer)
	{
		CurrentSequence = nullptr;
		return;
	}

	CurrentPlayer->OnFinished.AddDynamic(this, &UCutsceneManager::HandleSequenceFinished);
	CurrentPlayer->Play();

	OnLetterboxToggled.Broadcast(true);
	OnCutsceneStarted.Broadcast(Sequence);

	GetWorld()->GetTimerManager().SetTimer(SubtitleTimerHandle, this, &UCutsceneManager::TickSubtitles, 0.1f, true);
}

void UCutsceneManager::SkipCutscene()
{
	if (!CurrentPlayer || !bCurrentSkippable)
	{
		return;
	}
	CurrentPlayer->GoToEndAndStop();
}

void UCutsceneManager::PauseCutscene()
{
	if (CurrentPlayer)
	{
		CurrentPlayer->Pause();
	}
}

void UCutsceneManager::ResumeCutscene()
{
	if (CurrentPlayer)
	{
		CurrentPlayer->Play();
	}
}

void UCutsceneManager::SetPlaybackSpeed(float Speed)
{
	if (CurrentPlayer)
	{
		CurrentPlayer->SetPlayRate(FMath::Max(Speed, 0.01f));
	}
}

void UCutsceneManager::PlaySound(USoundBase* Sound)
{
	if (Sound && GetWorld())
	{
		UGameplayStatics::PlaySound2D(GetWorld(), Sound);
	}
}

void UCutsceneManager::SpawnVFX(UNiagaraSystem* VFX, FVector Location)
{
	if (VFX && GetWorld())
	{
		UNiagaraFunctionLibrary::SpawnSystemAtLocation(GetWorld(), VFX, Location);
	}
}

void UCutsceneManager::ShowSubtitle(FText Text, FLinearColor Color)
{
	OnSubtitleChanged.Broadcast(Text, Color);
}

void UCutsceneManager::SetSubtitleTrack(const TArray<FSubtitleEntry>& Entries)
{
	PendingSubtitleTrack = Entries;
}

void UCutsceneManager::TickSubtitles()
{
	if (!CurrentPlayer || ActiveSubtitleTrack.Num() == 0)
	{
		return;
	}

	const float PlaybackTime = static_cast<float>(CurrentPlayer->GetCurrentTime().AsSeconds());

	const FSubtitleEntry* ActiveEntry = ActiveSubtitleTrack.FindByPredicate(
		[PlaybackTime](const FSubtitleEntry& Entry) { return Entry.IsActiveAtTime(PlaybackTime); });

	const FText NewText = ActiveEntry ? ActiveEntry->Text : FText::GetEmpty();
	if (!NewText.EqualTo(LastSubtitleText))
	{
		LastSubtitleText = NewText;
		OnSubtitleChanged.Broadcast(NewText, ActiveEntry ? ActiveEntry->SpeakerColor : FLinearColor::White);
	}
}

void UCutsceneManager::HandleSequenceFinished()
{
	EndCutscene();
}

void UCutsceneManager::EndCutscene()
{
	ULevelSequence* FinishedSequence = CurrentSequence;

	if (GetWorld())
	{
		GetWorld()->GetTimerManager().ClearTimer(SubtitleTimerHandle);
	}

	if (CurrentSequenceActor)
	{
		CurrentSequenceActor->Destroy();
	}

	CurrentPlayer = nullptr;
	CurrentSequenceActor = nullptr;
	CurrentSequence = nullptr;
	ActiveSubtitleTrack.Reset();

	OnLetterboxToggled.Broadcast(false);
	OnSubtitleChanged.Broadcast(FText::GetEmpty(), FLinearColor::White);

	if (FinishedSequence)
	{
		OnCutsceneEnded.Broadcast(FinishedSequence);
	}
}
