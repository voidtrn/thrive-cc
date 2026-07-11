// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "StickmanScheduleComponent.generated.h"

UENUM(BlueprintType)
enum class ENPCRoutineState : uint8
{
	Idle,
	Walk,
	Work,
	Eat,
	Sleep
};

USTRUCT(BlueprintType)
struct FNPCScheduleEntry
{
	GENERATED_BODY()

	// 24-hour clock, e.g. 9.0 = 9:00 AM, 22.5 = 10:30 PM. Wrapping ranges (e.g. 22-6) are supported.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Schedule")
	float StartHour = 0.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Schedule")
	float EndHour = 24.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Schedule")
	ENPCRoutineState Routine = ENPCRoutineState::Idle;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Schedule")
	FVector DestinationLocation = FVector::ZeroVector;

	bool ContainsHour(float Hour) const
	{
		return StartHour <= EndHour ? (Hour >= StartHour && Hour < EndHour)
			: (Hour >= StartHour || Hour < EndHour); // wraps past midnight
	}
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnRoutineChanged, ENPCRoutineState, NewRoutine);

/**
 * Time-of-day-driven daily routine. Pulls the current hour from ADayNightManager once that
 * system exists (see Source/StickmanImpact/World); until then, set DebugOverrideHour to test
 * schedules without it.
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UStickmanScheduleComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UStickmanScheduleComponent();

	virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Schedule")
	TArray<FNPCScheduleEntry> DailySchedule;

	// >= 0 forces this hour instead of querying the world clock — for testing without a Day/Night manager.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Schedule")
	float DebugOverrideHour = -1.f;

	UPROPERTY(BlueprintAssignable, Category = "Schedule")
	FOnRoutineChanged OnRoutineChanged;

	UFUNCTION(BlueprintPure, Category = "Schedule")
	ENPCRoutineState GetCurrentRoutine() const { return CurrentRoutine; }

	UFUNCTION(BlueprintNativeEvent, Category = "Schedule")
	float GetCurrentHour() const;

private:
	ENPCRoutineState CurrentRoutine = ENPCRoutineState::Idle;
	FVector CurrentDestination = FVector::ZeroVector;
};
