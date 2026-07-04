#include "System/OpenWorldGameState.h"
#include "Net/UnrealNetwork.h"

AOpenWorldGameState::AOpenWorldGameState()
{
	PrimaryActorTick.bCanEverTick = true;
}

void AOpenWorldGameState::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);

	if (HasAuthority())
	{
		WorldTimeHours = FMath::Fmod(WorldTimeHours + DeltaSeconds * TimeScale, 24.0f);
	}
}

void AOpenWorldGameState::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
	Super::GetLifetimeReplicatedProps(OutLifetimeProps);
	DOREPLIFETIME(AOpenWorldGameState, WorldTimeHours);
	DOREPLIFETIME(AOpenWorldGameState, CurrentWeather);
}

void AOpenWorldGameState::SetWeather(EWeatherType NewWeather)
{
	if (!HasAuthority() || CurrentWeather == NewWeather)
	{
		return;
	}

	CurrentWeather = NewWeather;
	OnRep_Weather(); // server juga perlu broadcast
}

void AOpenWorldGameState::OnRep_Weather()
{
	OnWeatherChanged.Broadcast(CurrentWeather);
}
