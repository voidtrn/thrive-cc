// Copyright StickmanImpact Project.

#include "StickmanAudioManager.h"
#include "Kismet/GameplayStatics.h"
#include "Components/AudioComponent.h"
#include "Sound/SoundClass.h"
#include "Sound/SoundMix.h"
#include "Sound/SoundConcurrency.h"
#include "TimerManager.h"

void UStickmanAudioManager::SetCategoryVolume(FName Category, float Volume)
{
	Volume = FMath::Clamp(Volume, 0.f, 1.f);
	CategoryVolumes.FindOrAdd(Category) = Volume;

	USoundClass* const* SoundClass = CategorySoundClasses.Find(Category);
	if (!SoundClass || !*SoundClass || !VolumeControlMix || !GetWorld())
	{
		return;
	}

	UGameplayStatics::SetSoundMixClassOverride(GetWorld(), VolumeControlMix, *SoundClass, Volume, 1.f, 0.2f);
	UGameplayStatics::PushSoundMixModifier(GetWorld(), VolumeControlMix);
}

float UStickmanAudioManager::GetCategoryVolume(FName Category) const
{
	const float* Volume = CategoryVolumes.Find(Category);
	return Volume ? *Volume : 1.f;
}

UAudioComponent* UStickmanAudioManager::PlaySFX(USoundBase* Sound, FVector Location, float VolumeMultiplier,
	float PitchMultiplier)
{
	if (!Sound || !GetWorld())
	{
		return nullptr;
	}

	UAudioComponent* Component = UGameplayStatics::SpawnSoundAtLocation(GetWorld(), Sound, Location,
		FRotator::ZeroRotator, VolumeMultiplier, PitchMultiplier);
	if (!Component)
	{
		return nullptr;
	}

	if (DefaultSFXConcurrency)
	{
		Component->ConcurrencySet.Add(DefaultSFXConcurrency);
	}

	// Occlusion: single trace listener -> source; blocked = muffled via lowpass.
	if (bEnableOcclusion)
	{
		FVector ListenerLocation = FVector::ZeroVector;
		if (const APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(GetWorld(), 0))
		{
			ListenerLocation = PlayerPawn->GetActorLocation();
		}

		FHitResult Hit;
		FCollisionQueryParams QueryParams;
		QueryParams.bTraceComplex = false;
		const bool bOccluded = GetWorld()->LineTraceSingleByChannel(Hit, ListenerLocation, Location,
			ECC_Visibility, QueryParams);
		if (bOccluded)
		{
			Component->SetLowPassFilterEnabled(true);
			Component->SetLowPassFilterFrequency(OccludedLowpassFrequency);
		}
	}

	return Component;
}

void UStickmanAudioManager::PlayUISound(USoundBase* Sound)
{
	if (Sound && GetWorld())
	{
		UGameplayStatics::PlaySound2D(GetWorld(), Sound);
	}
}

void UStickmanAudioManager::SetCurrentRegion(FName Region)
{
	if (Region == CurrentRegion)
	{
		return;
	}
	CurrentRegion = Region;

	// Combat music owns the speakers while intensity is up; region change lands after combat.
	if (CurrentCombatIntensity > 0.f)
	{
		return;
	}

	if (USoundBase* const* Track = RegionBGM.Find(Region))
	{
		CrossfadeTo(*Track);
	}
}

void UStickmanAudioManager::SetCombatIntensity(float Intensity, bool bBossFight)
{
	Intensity = FMath::Clamp(Intensity, 0.f, 1.f);
	const bool bWasInCombat = CurrentCombatIntensity > 0.f;
	const bool bNowInCombat = Intensity > 0.f;
	CurrentCombatIntensity = Intensity;

	if (bNowInCombat && !bWasInCombat)
	{
		CrossfadeTo(bBossFight && BossBGM ? BossBGM : CombatBGM);
	}
	else if (!bNowInCombat && bWasInCombat)
	{
		USoundBase* const* RegionTrack = RegionBGM.Find(CurrentRegion);
		CrossfadeTo(RegionTrack ? *RegionTrack : nullptr);
	}
	// Layered intensity blending (quiet combat layer under exploration at 0<x<1) needs a
	// MetaSound with an Intensity input — see README's MetaSound notes; discrete swap here.
}

void UStickmanAudioManager::PlayNextInPlaylist()
{
	if (Playlist.Num() == 0)
	{
		return;
	}
	// Shuffle: random index different from the last, when possible.
	int32 NextIndex = FMath::RandRange(0, Playlist.Num() - 1);
	if (Playlist.Num() > 1 && NextIndex == PlaylistIndex)
	{
		NextIndex = (NextIndex + 1) % Playlist.Num();
	}
	PlaylistIndex = NextIndex;
	CrossfadeTo(Playlist[PlaylistIndex]);
}

void UStickmanAudioManager::CrossfadeTo(USoundBase* NewTrack)
{
	if (NewTrack == CurrentBGMTrack || !GetWorld())
	{
		return;
	}
	CurrentBGMTrack = NewTrack;

	// Whatever was fading out already gets cut — only ever two live BGM components.
	if (FadingOutBGMComponent)
	{
		FadingOutBGMComponent->Stop();
		FadingOutBGMComponent = nullptr;
	}
	FadingOutBGMComponent = ActiveBGMComponent;
	ActiveBGMComponent = nullptr;

	if (NewTrack)
	{
		ActiveBGMComponent = UGameplayStatics::SpawnSound2D(GetWorld(), NewTrack, 0.f);
		if (ActiveBGMComponent)
		{
			ActiveBGMComponent->FadeIn(CrossfadeDuration, 1.f);
		}
	}
	if (FadingOutBGMComponent)
	{
		FadingOutBGMComponent->FadeOut(CrossfadeDuration, 0.f);
	}

	CrossfadeElapsed = 0.f;
	GetWorld()->GetTimerManager().SetTimer(CrossfadeTimerHandle, this, &UStickmanAudioManager::TickCrossfade,
		0.1f, true);
}

void UStickmanAudioManager::TickCrossfade()
{
	CrossfadeElapsed += 0.1f;
	if (CrossfadeElapsed < CrossfadeDuration)
	{
		return;
	}

	if (FadingOutBGMComponent)
	{
		FadingOutBGMComponent->Stop();
		FadingOutBGMComponent = nullptr;
	}
	if (GetWorld())
	{
		GetWorld()->GetTimerManager().ClearTimer(CrossfadeTimerHandle);
	}
}
