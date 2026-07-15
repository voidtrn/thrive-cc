// Copyright StickmanImpact Project.

#include "DayNightManager.h"
#include "Engine/DirectionalLight.h"
#include "Engine/SkyLight.h"
#include "Components/SkyLightComponent.h"
#include "Engine/ExponentialHeightFog.h"
#include "Components/ExponentialHeightFogComponent.h"
#include "Engine/PostProcessVolume.h"

ADayNightManager::ADayNightManager()
{
	PrimaryActorTick.bCanEverTick = true;
}

void ADayNightManager::BeginPlay()
{
	Super::BeginPlay();
	CurrentHour = FMath::Fmod(StartHour, 24.f);
	LastTimeOfDay = GetTimeOfDay();
}

ETimeOfDay ADayNightManager::GetTimeOfDay() const
{
	if (CurrentHour >= 5.f && CurrentHour < 7.f) return ETimeOfDay::Dawn;
	if (CurrentHour >= 7.f && CurrentHour < 18.f) return ETimeOfDay::Day;
	if (CurrentHour >= 18.f && CurrentHour < 20.f) return ETimeOfDay::Dusk;
	return ETimeOfDay::Night;
}

void ADayNightManager::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);

	const float DayLengthSeconds = FMath::Max(DayLengthMinutes, 0.1f) * 60.f;
	const float HoursPerSecond = 24.f / DayLengthSeconds;
	CurrentHour = FMath::Fmod(CurrentHour + DeltaSeconds * HoursPerSecond, 24.f);

	OnHourChanged.Broadcast(CurrentHour);

	const ETimeOfDay NewTimeOfDay = GetTimeOfDay();
	if (NewTimeOfDay != LastTimeOfDay)
	{
		LastTimeOfDay = NewTimeOfDay;
		OnTimeOfDayChanged.Broadcast(NewTimeOfDay);
	}

	// Smooth day<->night blend for lerped values (1 at noon, 0 at midnight), independent of
	// the discrete Dawn/Day/Dusk/Night buckets above.
	const float Radians = (CurrentHour / 24.f) * 2.f * PI;
	const float DayFactor = (FMath::Cos(Radians - PI) + 1.f) * 0.5f;

	if (SunLight)
	{
		const float SunPitch = (CurrentHour / 24.f) * 360.f - 90.f;
		SunLight->SetActorRotation(FRotator(SunPitch, -30.f, 0.f));
	}
	if (SkyLight)
	{
		const float Intensity = FMath::Lerp(NightSkyLightIntensity, DaySkyLightIntensity, DayFactor);
		SkyLight->GetLightComponent()->SetIntensity(Intensity);
	}
	if (HeightFog)
	{
		const FLinearColor FogColor = FMath::Lerp(NightFogColor, DayFogColor, DayFactor);
		HeightFog->GetComponent()->SetFogInscatteringColor(FogColor);
	}
	if (PostProcessVolume)
	{
		const float ExposureBias = FMath::Lerp(NightExposureBias, DayExposureBias, DayFactor);
		PostProcessVolume->Settings.bOverride_AutoExposureBias = true;
		PostProcessVolume->Settings.AutoExposureBias = ExposureBias;
	}
}
