// Copyright StickmanImpact Project.

#include "WeatherManager.h"
#include "Combat/ElementalReactionManager.h"
#include "NiagaraFunctionLibrary.h"
#include "NiagaraComponent.h"
#include "Kismet/GameplayStatics.h"
#include "Kismet/KismetMaterialLibrary.h"
#include "Materials/MaterialParameterCollection.h"
#include "TimerManager.h"

void UWeatherManager::Deinitialize()
{
	ClearWeatherEffectTimers();
	if (GetWorld())
	{
		GetWorld()->GetTimerManager().ClearTimer(TransitionTimerHandle);
	}
	Super::Deinitialize();
}

void UWeatherManager::SetWeather(EStickmanWeatherType NewWeather)
{
	if (NewWeather == CurrentWeather)
	{
		return;
	}

	CurrentWeather = NewWeather;
	TransitionElapsed = 0.f;

	ClearWeatherEffectTimers();
	RefreshVFX();

	if (GetWorld())
	{
		GetWorld()->GetTimerManager().SetTimer(TransitionTimerHandle, this, &UWeatherManager::TickTransition, 0.1f, true);

		if (NewWeather == EStickmanWeatherType::Rain || NewWeather == EStickmanWeatherType::Storm)
		{
			GetWorld()->GetTimerManager().SetTimer(RainHydroTimerHandle, this, &UWeatherManager::TickRainHydro,
				RainHydroTickInterval, true);
		}
		if (NewWeather == EStickmanWeatherType::Storm)
		{
			GetWorld()->GetTimerManager().SetTimer(StormLightningTimerHandle, this, &UWeatherManager::TickStormLightning,
				StormLightningInterval, true);
		}
	}

	OnWeatherChanged.Broadcast(NewWeather);
}

void UWeatherManager::ClearWeatherEffectTimers()
{
	if (!GetWorld())
	{
		return;
	}
	GetWorld()->GetTimerManager().ClearTimer(RainHydroTimerHandle);
	GetWorld()->GetTimerManager().ClearTimer(StormLightningTimerHandle);
}

void UWeatherManager::RefreshVFX()
{
	if (ActiveVFXComponent)
	{
		ActiveVFXComponent->DestroyComponent();
		ActiveVFXComponent = nullptr;
	}

	const TObjectPtr<UNiagaraSystem>* VFX = WeatherVFX.Find(CurrentWeather);
	APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0);
	if (!VFX || !*VFX || !PlayerPawn || !PlayerPawn->GetRootComponent())
	{
		return;
	}

	ActiveVFXComponent = UNiagaraFunctionLibrary::SpawnSystemAttached(*VFX, PlayerPawn->GetRootComponent(), NAME_None,
		FVector(0.f, 0.f, 300.f), FRotator::ZeroRotator, EAttachLocation::KeepRelativeOffset, false);
}

void UWeatherManager::TickTransition()
{
	TransitionElapsed += 0.1f;
	const float Alpha = FMath::Clamp(TransitionElapsed / FMath::Max(TransitionDuration, 0.1f), 0.f, 1.f);

	if (WeatherMPC)
	{
		const bool bIsWet = CurrentWeather == EStickmanWeatherType::Rain || CurrentWeather == EStickmanWeatherType::Storm;
		UKismetMaterialLibrary::SetScalarParameterValue(this, WeatherMPC, TEXT("WetSurface"), bIsWet ? Alpha : 1.f - Alpha);
		UKismetMaterialLibrary::SetScalarParameterValue(this, WeatherMPC, TEXT("WeatherBlend"), Alpha);
	}

	if (Alpha >= 1.f && GetWorld())
	{
		GetWorld()->GetTimerManager().ClearTimer(TransitionTimerHandle);
	}
}

void UWeatherManager::TickRainHydro()
{
	APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0);
	if (!PlayerPawn)
	{
		return;
	}

	if (UElementalReactionManager* ReactionManager = GetGameInstance()->GetSubsystem<UElementalReactionManager>())
	{
		ReactionManager->ApplyElement(PlayerPawn, EStickmanElement::Hydro, 40.f);
	}
}

void UWeatherManager::TickStormLightning()
{
	APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0);
	if (!PlayerPawn)
	{
		return;
	}

	const FVector2D RandomOffset = FMath::RandPointInCircle(StormLightningRadius * 3.f);
	const FVector StrikeLocation = PlayerPawn->GetActorLocation() + FVector(RandomOffset.X, RandomOffset.Y, 0.f);

	const float DistanceToStrike = FVector::Dist(StrikeLocation, PlayerPawn->GetActorLocation());
	if (DistanceToStrike > StormLightningRadius)
	{
		return; // Struck somewhere else in the (larger) storm area this time — no hazard this tick.
	}

	if (UElementalReactionManager* ReactionManager = GetGameInstance()->GetSubsystem<UElementalReactionManager>())
	{
		ReactionManager->ApplyElement(PlayerPawn, EStickmanElement::Electro, 60.f);
	}
}

float UWeatherManager::GetMoveSpeedMultiplier() const
{
	switch (CurrentWeather)
	{
		case EStickmanWeatherType::Rain: return 0.95f;
		case EStickmanWeatherType::Storm: return 0.9f;
		case EStickmanWeatherType::Snow: return 0.92f;
		default: return 1.f;
	}
}
