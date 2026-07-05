#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameStateBase.h"
#include "OpenWorldGameState.generated.h"

UENUM(BlueprintType)
enum class EWeatherType : uint8
{
	Clear,
	Cloudy,
	Rain,
	Thunderstorm,
	Fog,
	Snow
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnWeatherChanged, EWeatherType, NewWeather);

/**
 * State dunia yang dibagikan ke semua pemain: jam in-game & cuaca.
 * Direplikasi dari awal supaya co-op tinggal nyala.
 */
UCLASS()
class MYGAME_API AOpenWorldGameState : public AGameStateBase
{
	GENERATED_BODY()

public:
	AOpenWorldGameState();

	virtual void Tick(float DeltaSeconds) override;
	virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;

	/** Jam in-game 0-24. 1 menit real = 1 jam game (default, bisa diubah). */
	UFUNCTION(BlueprintPure, Category = "OpenWorld|Time")
	float GetWorldTimeHours() const { return WorldTimeHours; }

	UFUNCTION(BlueprintPure, Category = "OpenWorld|Weather")
	EWeatherType GetCurrentWeather() const { return CurrentWeather; }

	/** Server-only. Dipanggil sistem cuaca / debug command. */
	UFUNCTION(BlueprintCallable, Category = "OpenWorld|Weather", meta = (CallInEditor = "true"))
	void SetWeather(EWeatherType NewWeather);

	UPROPERTY(BlueprintAssignable, Category = "OpenWorld|Weather")
	FOnWeatherChanged OnWeatherChanged;

protected:
	UPROPERTY(Replicated, VisibleAnywhere, BlueprintReadOnly, Category = "OpenWorld|Time")
	float WorldTimeHours = 9.0f;

	/** Berapa jam game berlalu per detik real. Default: 24 jam game = 24 menit real. */
	UPROPERTY(EditDefaultsOnly, Category = "OpenWorld|Time")
	float TimeScale = 1.0f / 60.0f;

	UPROPERTY(ReplicatedUsing = OnRep_Weather, VisibleAnywhere, BlueprintReadOnly, Category = "OpenWorld|Weather")
	EWeatherType CurrentWeather = EWeatherType::Clear;

	UFUNCTION()
	void OnRep_Weather();
};
