#include "System/MusicManagerSubsystem.h"
#include "Components/AudioComponent.h"
#include "Kismet/GameplayStatics.h"
#include "Sound/SoundBase.h"

void UMusicManagerSubsystem::SetStateTrack(EMusicState State, USoundBase* Track)
{
	StateTracks.Add(State, Track);

	// Track state aktif diganti (mis. day→night exploration) → crossfade in-place
	if (State == CurrentState && ActiveTrack && ActiveTrack->Sound != Track)
	{
		SetMusicState(State, 3.f);
	}
}

UAudioComponent* UMusicManagerSubsystem::CreateMusicComponent(USoundBase* Sound)
{
	UAudioComponent* Component = UGameplayStatics::CreateSound2D(
		GetWorld(), Sound, 0.f, 1.f, 0.f, nullptr, /*bPersistAcrossLevelTransition=*/false, /*bAutoDestroy=*/false);
	return Component;
}

void UMusicManagerSubsystem::SetMusicState(EMusicState NewState, float CrossfadeSeconds)
{
	GetWorld()->GetTimerManager().ClearTimer(ExitCombatTimer);

	const bool bSameTrack = NewState == CurrentState && ActiveTrack
		&& StateTracks.FindRef(NewState) == ActiveTrack->Sound;
	if (bSameTrack)
	{
		return;
	}
	CurrentState = NewState;

	USoundBase* NewTrack = StateTracks.FindRef(NewState);

	// Fade out track lama
	if (FadingTrack)
	{
		FadingTrack->Stop();
		FadingTrack = nullptr;
	}
	if (ActiveTrack)
	{
		ActiveTrack->FadeOut(CrossfadeSeconds, 0.f);
		FadingTrack = ActiveTrack;
		ActiveTrack = nullptr;
	}

	// Fade in track baru
	if (NewTrack)
	{
		ActiveTrack = CreateMusicComponent(NewTrack);
		if (ActiveTrack)
		{
			ActiveTrack->FadeIn(CrossfadeSeconds, 1.f);
		}
	}
}

void UMusicManagerSubsystem::RequestExitCombat(float DelaySeconds)
{
	if (CurrentState != EMusicState::Combat && CurrentState != EMusicState::Boss)
	{
		return;
	}

	GetWorld()->GetTimerManager().SetTimer(ExitCombatTimer,
		[WeakThis = TWeakObjectPtr<UMusicManagerSubsystem>(this)]()
		{
			if (WeakThis.IsValid())
			{
				WeakThis->SetMusicState(EMusicState::Exploration, 3.f);
			}
		}, DelaySeconds, false);
}

void UMusicManagerSubsystem::SetCombatIntensity(float Intensity01)
{
	// Sederhana: volume boost 1.0 → 1.15 by intensity. Adaptive layering
	// penuh (add percussion/brass per level) = MetaSounds/Wwise territory.
	if (ActiveTrack && (CurrentState == EMusicState::Combat || CurrentState == EMusicState::Boss))
	{
		ActiveTrack->SetVolumeMultiplier(FMath::Lerp(1.f, 1.15f, FMath::Clamp(Intensity01, 0.f, 1.f)));
	}
}
