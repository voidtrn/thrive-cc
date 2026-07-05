#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "System/OpenWorldGameState.h"
#include "WeatherController.generated.h"

class UNiagaraComponent;
class UMaterialParameterCollection;
class AExponentialHeightFog;

/**
 * Eksekutor visual cuaca — listen GameState.OnWeatherChanged:
 * - Wetness (MPC scalar) blend halus → material wet surface + puddle
 * - Niagara rain attach ke player
 * - Thunderstorm: kilat (flash) + delayed thunder (jarak → delay suara)
 * - Fog: density ExponentialHeightFog lerp
 * - Random weather cycle (server) tiap 3-8 menit; matikan untuk scripted quest
 */
UCLASS()
class MYGAME_API AWeatherController : public AActor
{
	GENERATED_BODY()

public:
	AWeatherController();

	virtual void Tick(float DeltaSeconds) override;

protected:
	virtual void BeginPlay() override;

	/** MPC berisi scalar "Wetness" 0-1 (dipakai master material). */
	UPROPERTY(EditAnywhere, Category = "Weather")
	TObjectPtr<UMaterialParameterCollection> WeatherMPC;

	UPROPERTY(EditAnywhere, Category = "Weather")
	TObjectPtr<AExponentialHeightFog> HeightFog;

	/** Niagara rain system — attach ke kamera player (BP assign). */
	UPROPERTY(EditAnywhere, Category = "Weather")
	TObjectPtr<UNiagaraComponent> RainParticles;

	UPROPERTY(EditAnywhere, Category = "Weather|Cycle")
	bool bRandomWeatherCycle = true;

	UPROPERTY(EditAnywhere, Category = "Weather|Cycle")
	float CycleMinMinutes = 3.f;

	UPROPERTY(EditAnywhere, Category = "Weather|Cycle")
	float CycleMaxMinutes = 8.f;

	UPROPERTY(EditAnywhere, Category = "Weather|Thunder")
	float LightningIntervalMin = 8.f;

	UPROPERTY(EditAnywhere, Category = "Weather|Thunder")
	float LightningIntervalMax = 20.f;

	/** BP implement: spawn flash + bolt VFX di lokasi, lalu play thunder delayed. */
	UFUNCTION(BlueprintImplementableEvent, Category = "Weather|Thunder")
	void OnLightningStrike(FVector Location, float ThunderDelaySeconds);

	UFUNCTION()
	void HandleWeatherChanged(EWeatherType NewWeather);

private:
	EWeatherType ActiveWeather = EWeatherType::Clear;
	float TargetWetness = 0.f;
	float TargetFogDensity = 0.02f;
	FTimerHandle CycleTimer;
	FTimerHandle LightningTimer;

	void ScheduleNextCycle();
	void ScheduleNextLightning();
	void FireLightning();
};
