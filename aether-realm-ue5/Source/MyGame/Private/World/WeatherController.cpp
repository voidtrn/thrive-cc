#include "World/WeatherController.h"
#include "Engine/ExponentialHeightFog.h"
#include "Components/ExponentialHeightFogComponent.h"
#include "Materials/MaterialParameterCollection.h"
#include "Kismet/KismetMaterialLibrary.h"
#include "Kismet/GameplayStatics.h"
#include "NiagaraComponent.h"
#include "MyGame.h"

AWeatherController::AWeatherController()
{
	PrimaryActorTick.bCanEverTick = true;
	PrimaryActorTick.TickInterval = 0.05f;
}

void AWeatherController::BeginPlay()
{
	Super::BeginPlay();

	if (AOpenWorldGameState* GS = GetWorld()->GetGameState<AOpenWorldGameState>())
	{
		GS->OnWeatherChanged.AddDynamic(this, &AWeatherController::HandleWeatherChanged);
		HandleWeatherChanged(GS->GetCurrentWeather());
	}

	if (bRandomWeatherCycle && HasAuthority())
	{
		ScheduleNextCycle();
	}
}

void AWeatherController::HandleWeatherChanged(EWeatherType NewWeather)
{
	ActiveWeather = NewWeather;

	switch (NewWeather)
	{
	case EWeatherType::Clear:
		TargetWetness = 0.f;
		TargetFogDensity = 0.02f;
		break;
	case EWeatherType::Cloudy:
		TargetWetness = 0.f;
		TargetFogDensity = 0.035f;
		break;
	case EWeatherType::Rain:
		TargetWetness = 1.f;
		TargetFogDensity = 0.05f;
		break;
	case EWeatherType::Thunderstorm:
		TargetWetness = 1.f;
		TargetFogDensity = 0.06f;
		ScheduleNextLightning();
		break;
	case EWeatherType::Fog:
		TargetWetness = 0.2f;
		TargetFogDensity = 0.25f;
		break;
	case EWeatherType::Snow:
		TargetWetness = 0.3f;
		TargetFogDensity = 0.08f;
		break;
	}

	if (NewWeather != EWeatherType::Thunderstorm)
	{
		GetWorldTimerManager().ClearTimer(LightningTimer);
	}

	// Rain particle on/off
	if (RainParticles)
	{
		const bool bRaining = NewWeather == EWeatherType::Rain || NewWeather == EWeatherType::Thunderstorm;
		bRaining ? RainParticles->Activate() : RainParticles->Deactivate();
	}

	UE_LOG(LogAetherRealm, Log, TEXT("Weather -> %s"), *UEnum::GetValueAsString(NewWeather));
}

void AWeatherController::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);

	// Smooth blend wetness (material) + fog density
	if (WeatherMPC)
	{
		const float Current = UKismetMaterialLibrary::GetScalarParameterValue(this, WeatherMPC, TEXT("Wetness"));
		UKismetMaterialLibrary::SetScalarParameterValue(this, WeatherMPC, TEXT("Wetness"),
			FMath::FInterpTo(Current, TargetWetness, DeltaSeconds, 0.5f));
	}

	if (HeightFog)
	{
		UExponentialHeightFogComponent* FogComp = HeightFog->GetComponent();
		FogComp->SetFogDensity(FMath::FInterpTo(FogComp->FogDensity, TargetFogDensity, DeltaSeconds, 0.3f));
	}
}

void AWeatherController::ScheduleNextCycle()
{
	const float Delay = FMath::FRandRange(CycleMinMinutes * 60.f, CycleMaxMinutes * 60.f);
	GetWorldTimerManager().SetTimer(CycleTimer, [this]()
	{
		if (AOpenWorldGameState* GS = GetWorld()->GetGameState<AOpenWorldGameState>())
		{
			// Weighted random: Clear paling sering
			const float Roll = FMath::FRand();
			EWeatherType Next;
			if (Roll < 0.40f)      Next = EWeatherType::Clear;
			else if (Roll < 0.60f) Next = EWeatherType::Cloudy;
			else if (Roll < 0.80f) Next = EWeatherType::Rain;
			else if (Roll < 0.90f) Next = EWeatherType::Thunderstorm;
			else                   Next = EWeatherType::Fog;

			GS->SetWeather(Next);
		}
		ScheduleNextCycle();
	}, Delay, false);
}

void AWeatherController::ScheduleNextLightning()
{
	const float Delay = FMath::FRandRange(LightningIntervalMin, LightningIntervalMax);
	GetWorldTimerManager().SetTimer(LightningTimer, this, &AWeatherController::FireLightning, Delay, false);
}

void AWeatherController::FireLightning()
{
	if (ActiveWeather != EWeatherType::Thunderstorm)
	{
		return;
	}

	// Lokasi random sekitar player
	FVector Location = FVector::ZeroVector;
	if (const APawn* Player = UGameplayStatics::GetPlayerPawn(this, 0))
	{
		const FVector2D Offset = FMath::RandPointInCircle(3000.f);
		Location = Player->GetActorLocation() + FVector(Offset.X, Offset.Y, 2000.f);

		// Delayed thunder: kecepatan suara ±343 m/s → 34300 cm/s
		const float Distance = FVector::Dist(Player->GetActorLocation(), Location);
		const float ThunderDelay = Distance / 34300.f;

		OnLightningStrike(Location, ThunderDelay);
	}

	ScheduleNextLightning();
}
