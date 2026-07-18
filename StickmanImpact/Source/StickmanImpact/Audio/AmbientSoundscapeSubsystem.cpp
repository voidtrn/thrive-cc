// Copyright StickmanImpact Project.

#include "AmbientSoundscapeSubsystem.h"
#include "World/DayNightManager.h"
#include "Components/AudioComponent.h"
#include "Kismet/GameplayStatics.h"

void UAmbientSoundscapeSubsystem::Deinitialize()
{
	StopBed(0.f);
	Super::Deinitialize();
}

void UAmbientSoundscapeSubsystem::SetRegionBed(const FAmbientBed& Bed)
{
	StopBed(1.5f);

	UWorld* World = GetGameInstance()->GetWorld();
	if (!World)
	{
		return;
	}

	USoundBase* ChannelSounds[5] = { Bed.WindLoop, Bed.WaterLoop, Bed.WildlifeDayLoop, Bed.CivilizationLoop, Bed.InteriorLoop };
	Components.SetNum(5);
	Volumes.Init(0.f, 5);
	for (int32 Index = 0; Index < 5; ++Index)
	{
		if (ChannelSounds[Index])
		{
			Components[Index] = UGameplayStatics::SpawnSound2D(World, ChannelSounds[Index], 0.f, 1.f, 0.f,
				nullptr, true, false);
		}
	}
	// Night wildlife runs as a parallel stem crossfaded against the day one.
	WildlifeNightComponent = Bed.WildlifeNightLoop
		? UGameplayStatics::SpawnSound2D(World, Bed.WildlifeNightLoop, 0.f, 1.f, 0.f, nullptr, true, false)
		: nullptr;
}

void UAmbientSoundscapeSubsystem::StopBed(float FadeOut)
{
	for (UAudioComponent* Component : Components)
	{
		if (Component)
		{
			Component->FadeOut(FadeOut, 0.f);
		}
	}
	if (WildlifeNightComponent)
	{
		WildlifeNightComponent->FadeOut(FadeOut, 0.f);
		WildlifeNightComponent = nullptr;
	}
	Components.Empty();
	Volumes.Empty();
}

float UAmbientSoundscapeSubsystem::TargetForChannel(EAmbientChannel Channel, bool bNight, float AltitudeAlpha) const
{
	switch (Channel)
	{
		case EAmbientChannel::Wind:
			return bIndoors ? 0.f : FMath::Clamp(0.3f + 0.7f * AltitudeAlpha + WeatherIntensity * 0.5f, 0.f, 1.f);
		case EAmbientChannel::Water:
			return WaterProximity;
		case EAmbientChannel::Wildlife:
			// Day stem: full by day, gone at night (the night stem mirrors it inverted).
			return (bIndoors || bNight) ? 0.f : 1.f;
		case EAmbientChannel::Civilization:
			return CivilizationProximity;
		case EAmbientChannel::Interior:
			return bIndoors ? 1.f : 0.f;
		default:
			return 0.f;
	}
}

void UAmbientSoundscapeSubsystem::Tick(float DeltaTime)
{
	const UWorld* World = GetGameInstance()->GetWorld();
	if (!World)
	{
		return;
	}

	// Time of day + player altitude feed the targets.
	bool bNight = false;
	if (const ADayNightManager* DayNight = Cast<ADayNightManager>(
			UGameplayStatics::GetActorOfClass(World, ADayNightManager::StaticClass())))
	{
		bNight = DayNight->IsNight();
	}
	float AltitudeAlpha = 0.f;
	if (const APawn* Player = UGameplayStatics::GetPlayerPawn(World, 0))
	{
		AltitudeAlpha = FMath::GetMappedRangeValueClamped(WindAltitudeRange, FVector2D(0.f, 1.f),
			Player->GetActorLocation().Z);
	}

	for (int32 Index = 0; Index < Components.Num(); ++Index)
	{
		if (!Components[Index])
		{
			continue;
		}
		const float Target = TargetForChannel(static_cast<EAmbientChannel>(Index), bNight, AltitudeAlpha);
		Volumes[Index] = FMath::FInterpTo(Volumes[Index], Target, DeltaTime, FadeSpeed);
		Components[Index]->SetVolumeMultiplier(Volumes[Index]);
	}

	if (WildlifeNightComponent)
	{
		const float NightTarget = (bIndoors || !bNight) ? 0.f : 1.f;
		WildlifeNightComponent->SetVolumeMultiplier(
			FMath::FInterpTo(WildlifeNightComponent->VolumeMultiplier, NightTarget, DeltaTime, FadeSpeed));
	}
}
