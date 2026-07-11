// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "StickmanWorldTypes.h"
#include "WeatherManager.generated.h"

class UNiagaraSystem;
class UNiagaraComponent;
class UMaterialParameterCollection;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnWeatherChanged, EStickmanWeatherType, NewWeather);

/**
 * Clear/Cloudy/Rain/Storm/Snow with a 30s crossfade. Spawns per-weather VFX attached to the
 * player camera, drives a "WetSurface" Material Parameter Collection scalar for wet-surface
 * shaders, periodically applies Hydro to the player during Rain/Storm, and spawns Electro
 * hazard strikes near the player during Storm.
 *
 * Movement-speed effects (spec: "rain -5%") are exposed via GetMoveSpeedMultiplier() but not
 * force-wired into AStickmanCharacter's movement code — that's one line in
 * AStickmanCharacter::Tick once you're ready (multiply WalkSpeed/SprintSpeed by it before
 * assigning to MaxWalkSpeed), left as a hook rather than touching well-tested movement code.
 */
UCLASS()
class STICKMANIMPACT_API UWeatherManager : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	virtual void Deinitialize() override;

	UFUNCTION(BlueprintCallable, Category = "Weather")
	void SetWeather(EStickmanWeatherType NewWeather);

	UFUNCTION(BlueprintPure, Category = "Weather")
	EStickmanWeatherType GetCurrentWeather() const { return CurrentWeather; }

	UFUNCTION(BlueprintPure, Category = "Weather")
	float GetMoveSpeedMultiplier() const;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Weather")
	TMap<EStickmanWeatherType, TObjectPtr<UNiagaraSystem>> WeatherVFX;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Weather")
	TObjectPtr<UMaterialParameterCollection> WeatherMPC;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Weather")
	float TransitionDuration = 30.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Weather")
	float RainHydroTickInterval = 4.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Weather")
	float StormLightningInterval = 8.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Weather")
	float StormLightningRadius = 300.f;

	UPROPERTY(BlueprintAssignable, Category = "Weather")
	FOnWeatherChanged OnWeatherChanged;

private:
	void TickTransition();
	void TickRainHydro();
	void TickStormLightning();
	void RefreshVFX();
	void ClearWeatherEffectTimers();

	EStickmanWeatherType CurrentWeather = EStickmanWeatherType::Clear;

	UPROPERTY()
	TObjectPtr<UNiagaraComponent> ActiveVFXComponent;

	float TransitionElapsed = 0.f;
	FTimerHandle TransitionTimerHandle;
	FTimerHandle RainHydroTimerHandle;
	FTimerHandle StormLightningTimerHandle;
};
