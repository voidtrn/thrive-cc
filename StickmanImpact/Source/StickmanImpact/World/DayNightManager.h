// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "StickmanWorldTypes.h"
#include "DayNightManager.generated.h"

class ADirectionalLight;
class ASkyLight;
class AExponentialHeightFog;
class UPostProcessComponent;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnTimeOfDayChanged, ETimeOfDay, NewTimeOfDay);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnHourChanged, float, NewHour);

/**
 * Drives the sun's rotation, sky light intensity, fog color, and a post-process volume's
 * exposure/color grading across a full day/night cycle. Reference the level's existing
 * lighting actors rather than spawning new ones. UStickmanScheduleComponent and
 * AEnemySpawner both look this actor up (UGameplayStatics::GetActorOfClass) to react to
 * time of day if one exists in the level; both keep working with a fallback if it doesn't.
 */
UCLASS()
class STICKMANIMPACT_API ADayNightManager : public AActor
{
	GENERATED_BODY()

public:
	ADayNightManager();

	virtual void Tick(float DeltaSeconds) override;

	UPROPERTY(EditInstanceOnly, BlueprintReadWrite, Category = "Day Night")
	TObjectPtr<ADirectionalLight> SunLight;

	UPROPERTY(EditInstanceOnly, BlueprintReadWrite, Category = "Day Night")
	TObjectPtr<ASkyLight> SkyLight;

	UPROPERTY(EditInstanceOnly, BlueprintReadWrite, Category = "Day Night")
	TObjectPtr<AExponentialHeightFog> HeightFog;

	UPROPERTY(EditInstanceOnly, BlueprintReadWrite, Category = "Day Night")
	TObjectPtr<class APostProcessVolume> PostProcessVolume;

	// Full 24-hour cycle length in real-world minutes.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Day Night")
	float DayLengthMinutes = 24.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Day Night")
	float StartHour = 8.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Day Night")
	FLinearColor DayFogColor = FLinearColor(0.6f, 0.7f, 0.8f);

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Day Night")
	FLinearColor NightFogColor = FLinearColor(0.02f, 0.02f, 0.05f);

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Day Night")
	float DaySkyLightIntensity = 1.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Day Night")
	float NightSkyLightIntensity = 0.1f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Day Night")
	float DayExposureBias = 0.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Day Night")
	float NightExposureBias = -1.5f;

	UPROPERTY(BlueprintAssignable, Category = "Day Night")
	FOnTimeOfDayChanged OnTimeOfDayChanged;

	// Streetlights (and anything else) bind to this to know when to switch on/off.
	UPROPERTY(BlueprintAssignable, Category = "Day Night")
	FOnHourChanged OnHourChanged;

	UFUNCTION(BlueprintPure, Category = "Day Night")
	float GetCurrentHour() const { return CurrentHour; }

	UFUNCTION(BlueprintPure, Category = "Day Night")
	ETimeOfDay GetTimeOfDay() const;

	UFUNCTION(BlueprintPure, Category = "Day Night")
	bool IsNight() const { return GetTimeOfDay() == ETimeOfDay::Night; }

	UFUNCTION(BlueprintCallable, Category = "Day Night")
	void SetCurrentHour(float NewHour) { CurrentHour = FMath::Fmod(NewHour, 24.f); }

protected:
	virtual void BeginPlay() override;

private:
	float CurrentHour = 8.f;
	ETimeOfDay LastTimeOfDay = ETimeOfDay::Day;
};
