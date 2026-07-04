#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "DayNightController.generated.h"

class ADirectionalLight;
class ASkyLight;

UENUM(BlueprintType)
enum class EDayPhase : uint8
{
	Dawn,   // 5:00 - 7:00
	Day,    // 7:00 - 18:00
	Dusk,   // 18:00 - 20:00
	Night   // 20:00 - 5:00
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnDayPhaseChanged, EDayPhase, NewPhase);

/**
 * Rotasi matahari + intensitas dari WorldTimeHours GameState
 * (1 siklus = 24 menit real, configurable via GameState TimeScale).
 * Place satu di L_OpenWorld, assign SunLight + SkyLight.
 * NPC schedule: bind OnDayPhaseChanged.
 */
UCLASS()
class MYGAME_API ADayNightController : public AActor
{
	GENERATED_BODY()

public:
	ADayNightController();

	virtual void Tick(float DeltaSeconds) override;

	UFUNCTION(BlueprintPure, Category = "DayNight")
	EDayPhase GetCurrentPhase() const { return CurrentPhase; }

	UFUNCTION(BlueprintPure, Category = "DayNight")
	static EDayPhase PhaseFromHours(float Hours);

	UPROPERTY(BlueprintAssignable, Category = "DayNight")
	FOnDayPhaseChanged OnDayPhaseChanged;

protected:
	UPROPERTY(EditAnywhere, Category = "DayNight")
	TObjectPtr<ADirectionalLight> SunLight;

	UPROPERTY(EditAnywhere, Category = "DayNight")
	TObjectPtr<ASkyLight> SkyLight;

	/** Intensitas sun siang / malam (moonlight). */
	UPROPERTY(EditAnywhere, Category = "DayNight")
	float DayIntensity = 8.f;

	UPROPERTY(EditAnywhere, Category = "DayNight")
	float NightIntensity = 0.4f;

	/** Warna ambient malam: biru gelap (anime night). */
	UPROPERTY(EditAnywhere, Category = "DayNight")
	FLinearColor NightTint = FLinearColor(0.35f, 0.45f, 0.9f);

private:
	EDayPhase CurrentPhase = EDayPhase::Day;
};
