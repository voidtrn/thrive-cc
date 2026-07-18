// Copyright StickmanImpact Project.

#include "AdaptiveMusicSubsystem.h"
#include "Components/AudioComponent.h"
#include "Kismet/GameplayStatics.h"
#include "TimerManager.h"

void UAdaptiveMusicSubsystem::Deinitialize()
{
	StopLayeredTrack(0.f);
	Super::Deinitialize();
}

void UAdaptiveMusicSubsystem::PlayLayeredTrack(const FLayeredMusicTrack& Track)
{
	StopLayeredTrack(0.5f);

	UWorld* World = GetGameInstance()->GetWorld();
	if (!World)
	{
		return;
	}

	const int32 LayerCount = FMath::Min(Track.Layers.Num(), 8);
	LayerComponents.SetNum(LayerCount);
	LayerTargets.Init(0.f, LayerCount);
	LayerVolumes.Init(0.f, LayerCount);

	// All stems start together at zero volume so they stay sample-synced; targets fade them.
	for (int32 Index = 0; Index < LayerCount; ++Index)
	{
		if (!Track.Layers[Index])
		{
			continue;
		}
		UAudioComponent* Component = UGameplayStatics::SpawnSound2D(World, Track.Layers[Index], 0.f,
			1.f, 0.f, nullptr, true /*persist across level*/, false /*don't auto destroy*/);
		LayerComponents[Index] = Component;
	}

	// Ambient always on as the bed.
	SetLayerTarget(EMusicLayer::Ambient, true);
}

void UAdaptiveMusicSubsystem::StopLayeredTrack(float FadeOut)
{
	for (UAudioComponent* Component : LayerComponents)
	{
		if (Component)
		{
			Component->FadeOut(FadeOut, 0.f);
		}
	}
	LayerComponents.Empty();
	LayerTargets.Empty();
	LayerVolumes.Empty();
}

void UAdaptiveMusicSubsystem::Tick(float DeltaTime)
{
	for (int32 Index = 0; Index < LayerComponents.Num(); ++Index)
	{
		if (!LayerComponents[Index])
		{
			continue;
		}
		const float Duck = bDuckedState ? DuckVolume : 1.f;
		LayerVolumes[Index] = FMath::FInterpTo(LayerVolumes[Index],
			LayerTargets.IsValidIndex(Index) ? LayerTargets[Index] : 0.f, DeltaTime, LayerFadeSpeed);
		LayerComponents[Index]->SetVolumeMultiplier(LayerVolumes[Index] * Duck);
	}
}

// ---------------------------------------------------------------- state inputs --------

void UAdaptiveMusicSubsystem::SetLayerTarget(EMusicLayer Layer, bool bActive)
{
	const int32 Index = static_cast<int32>(Layer);
	if (LayerTargets.IsValidIndex(Index))
	{
		const float NewTarget = bActive ? 1.f : 0.f;
		if (!FMath::IsNearlyEqual(LayerTargets[Index], NewTarget))
		{
			LayerTargets[Index] = NewTarget;
			OnMusicLayerChanged.Broadcast(Layer, bActive);
		}
	}
}

void UAdaptiveMusicSubsystem::RecomputeTargets()
{
	SetLayerTarget(EMusicLayer::Ambient, true);
	SetLayerTarget(EMusicLayer::LightPercussion, CurrentEnemyCount > 0);
	SetLayerTarget(EMusicLayer::FullRhythm, CurrentEnemyCount > 0);
	SetLayerTarget(EMusicLayer::Intense, bElitePresent);
	SetLayerTarget(EMusicLayer::Epic, bBossTransition);
	SetLayerTarget(EMusicLayer::Desperate, PlayerHealthFraction < 0.3f && CurrentEnemyCount > 0);
	SetLayerTarget(EMusicLayer::Triumphant, bVictoryNear);
	SetLayerTarget(EMusicLayer::Climax, bAwakeningActive);
}

void UAdaptiveMusicSubsystem::NotifyCombatState(int32 EnemyCount, bool bEliteOrBossPresent)
{
	CurrentEnemyCount = EnemyCount;
	bElitePresent = bEliteOrBossPresent;
	RecomputeTargets();
}

void UAdaptiveMusicSubsystem::NotifyBossPhaseTransition()
{
	bBossTransition = true;
	RecomputeTargets();

	// The Epic layer is a moment, not a state — drop it after 8s.
	if (UWorld* World = GetGameInstance()->GetWorld())
	{
		World->GetTimerManager().SetTimer(BossTransitionResetHandle,
			FTimerDelegate::CreateWeakLambda(this, [this]()
			{
				bBossTransition = false;
				RecomputeTargets();
			}), 8.f, false);
	}
}

void UAdaptiveMusicSubsystem::NotifyPlayerHealthFraction(float Fraction)
{
	PlayerHealthFraction = Fraction;
	RecomputeTargets();
}

void UAdaptiveMusicSubsystem::NotifyAwakening(bool bActive)
{
	bAwakeningActive = bActive;
	RecomputeTargets();
}

void UAdaptiveMusicSubsystem::NotifyVictoryNear(bool bNear)
{
	bVictoryNear = bNear;
	RecomputeTargets();
}

void UAdaptiveMusicSubsystem::PlayStinger(USoundBase* Stinger)
{
	if (Stinger)
	{
		UGameplayStatics::PlaySound2D(GetGameInstance()->GetWorld(), Stinger);
	}
}

void UAdaptiveMusicSubsystem::SetDucked(bool bDucked)
{
	bDuckedState = bDucked;
}
