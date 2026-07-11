// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "StickmanWorldTypes.generated.h"

UENUM(BlueprintType)
enum class ETimeOfDay : uint8
{
	Dawn,
	Day,
	Dusk,
	Night
};

UENUM(BlueprintType)
enum class EStickmanWeatherType : uint8
{
	Clear,
	Cloudy,
	Rain,
	Storm,
	Snow
};
