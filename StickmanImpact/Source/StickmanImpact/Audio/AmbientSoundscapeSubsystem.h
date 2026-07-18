// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "Tickable.h"
#include "AmbientSoundscapeSubsystem.generated.h"

class USoundBase;
class UAudioComponent;

/** The ambient bed channels mixed by the soundscape. */
UENUM(BlueprintType)
enum class EAmbientChannel : uint8
{
	Wind,          // altitude + weather scaled; silent indoors
	Water,         // proximity-driven (river/ocean/rain-on-surface)
	Wildlife,      // region + time-of-day (birds day, crickets night)
	Civilization,  // town chatter/blacksmith/market near settlements
	Interior       // dungeon drips/settling stone; replaces Wind inside
};

/** One region's ambient bed (looping stems per channel + day/night wildlife variants). */
USTRUCT(BlueprintType)
struct FAmbientBed
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambient")
	FName RegionTag;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambient")
	TObjectPtr<USoundBase> WindLoop;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambient")
	TObjectPtr<USoundBase> WaterLoop;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambient")
	TObjectPtr<USoundBase> WildlifeDayLoop;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambient")
	TObjectPtr<USoundBase> WildlifeNightLoop;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambient")
	TObjectPtr<USoundBase> CivilizationLoop;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambient")
	TObjectPtr<USoundBase> InteriorLoop;
};

/**
 * The living ambient bed: per-region looping stems whose volumes ride game state each tick —
 * wind scales with player altitude + weather intensity (silent when
 * `SetIndoors(true)`, where the Interior channel takes over), water with
 * `SetWaterProximity` (river/ocean triggers set it), wildlife picks the day or night loop
 * from ADayNightManager, civilization with `SetCivilizationProximity` (town volumes).
 * `SetRegionBed` swaps stems with a crossfade on region change (call alongside
 * `SetCurrentRegion`).
 *
 * Reverb zones, occlusion, HRTF, and Doppler are engine-side: UE Audio Volumes + the
 * spatialization plugin settings, plus the occlusion trace the SFX path already does —
 * documented, not reimplemented. Diegetic sources (bard, music box, humming chest, hollow
 * wall) are placed audio actors; the "sound as gameplay clue" pattern is content.
 * Priority/ducking rides the existing sound-class mix (Gameplay > Dialogue > Music >
 * Ambient).
 */
UCLASS()
class STICKMANIMPACT_API UAmbientSoundscapeSubsystem : public UGameInstanceSubsystem, public FTickableGameObject
{
	GENERATED_BODY()

public:
	virtual void Deinitialize() override;

	// FTickableGameObject
	virtual void Tick(float DeltaTime) override;
	virtual TStatId GetStatId() const override { RETURN_QUICK_DECLARE_CYCLE_STAT(UAmbientSoundscapeSubsystem, STATGROUP_Tickables); }
	virtual bool IsTickable() const override { return Components.Num() > 0; }

	UFUNCTION(BlueprintCallable, Category = "Ambient")
	void SetRegionBed(const FAmbientBed& Bed);

	UFUNCTION(BlueprintCallable, Category = "Ambient")
	void StopBed(float FadeOut = 2.f);

	// --- State inputs (volumes ease toward these) -----------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Ambient")
	void SetIndoors(bool bInIndoors) { bIndoors = bInIndoors; }

	UFUNCTION(BlueprintCallable, Category = "Ambient")
	void SetWeatherIntensity(float Intensity) { WeatherIntensity = FMath::Clamp(Intensity, 0.f, 1.f); }

	UFUNCTION(BlueprintCallable, Category = "Ambient")
	void SetWaterProximity(float Proximity) { WaterProximity = FMath::Clamp(Proximity, 0.f, 1.f); }

	UFUNCTION(BlueprintCallable, Category = "Ambient")
	void SetCivilizationProximity(float Proximity) { CivilizationProximity = FMath::Clamp(Proximity, 0.f, 1.f); }

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Ambient")
	float FadeSpeed = 0.8f;

	// Altitude (world Z) span mapped 0->1 wind intensity.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Ambient")
	FVector2D WindAltitudeRange = FVector2D(0.f, 4000.f);

private:
	float TargetForChannel(EAmbientChannel Channel, bool bNight, float AltitudeAlpha) const;

	UPROPERTY()
	TArray<TObjectPtr<UAudioComponent>> Components; // index = EAmbientChannel (5 fixed)

	UPROPERTY()
	TObjectPtr<UAudioComponent> WildlifeNightComponent; // swapped with day by time

	TArray<float> Volumes;

	bool bIndoors = false;
	float WeatherIntensity = 0.f;
	float WaterProximity = 0.f;
	float CivilizationProximity = 0.f;
};
