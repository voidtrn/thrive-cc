#include "World/DayNightController.h"
#include "System/OpenWorldGameState.h"
#include "Engine/DirectionalLight.h"
#include "Engine/SkyLight.h"
#include "Components/DirectionalLightComponent.h"
#include "Components/SkyLightComponent.h"

ADayNightController::ADayNightController()
{
	PrimaryActorTick.bCanEverTick = true;
	PrimaryActorTick.TickInterval = 0.1f; // 10 Hz cukup untuk sun rotation
}

EDayPhase ADayNightController::PhaseFromHours(float Hours)
{
	if (Hours >= 5.f && Hours < 7.f)   return EDayPhase::Dawn;
	if (Hours >= 7.f && Hours < 18.f)  return EDayPhase::Day;
	if (Hours >= 18.f && Hours < 20.f) return EDayPhase::Dusk;
	return EDayPhase::Night;
}

void ADayNightController::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);

	const AOpenWorldGameState* GS = GetWorld()->GetGameState<AOpenWorldGameState>();
	if (!GS || !SunLight)
	{
		return;
	}

	const float Hours = GS->GetWorldTimeHours();

	// Sun pitch: 6:00 = terbit (0°), 12:00 = puncak (-90°), 18:00 = terbenam (-180°)
	const float SunAngle = (Hours - 6.f) / 24.f * 360.f;
	SunLight->SetActorRotation(FRotator(-SunAngle, -60.f, 0.f));

	// Intensity + tint malam
	UDirectionalLightComponent* SunComp =
		Cast<UDirectionalLightComponent>(SunLight->GetLightComponent());
	if (SunComp)
	{
		const bool bNight = Hours < 5.f || Hours >= 20.f;
		const float Target = bNight ? NightIntensity : DayIntensity;
		SunComp->SetIntensity(FMath::FInterpTo(SunComp->Intensity, Target, DeltaSeconds, 1.f));
		SunComp->SetLightColor(bNight ? NightTint : FLinearColor::White);
	}

	// Phase change → broadcast (NPC schedule, star visibility, dst)
	const EDayPhase NewPhase = PhaseFromHours(Hours);
	if (NewPhase != CurrentPhase)
	{
		CurrentPhase = NewPhase;
		OnDayPhaseChanged.Broadcast(NewPhase);

		if (SkyLight)
		{
			SkyLight->GetLightComponent()->RecaptureSky();
		}
	}
}
