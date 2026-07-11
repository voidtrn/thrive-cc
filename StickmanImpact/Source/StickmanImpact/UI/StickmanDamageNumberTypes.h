// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "SkillSystem/StickmanSkillTypes.h"
#include "Combat/StickmanReactionTypes.h"
#include "StickmanDamageNumberTypes.generated.h"

UENUM(BlueprintType)
enum class EDamageNumberType : uint8
{
	Physical,	// White
	Pyro,		// Red
	HydroCryo,	// Blue
	Electro,	// Purple
	Critical,	// Gold
	Reaction	// Orange, larger text
};

/** Central color/scale lookup so the gauge display, damage numbers, and reaction popups agree. */
UCLASS()
class STICKMANIMPACT_API UStickmanDamageNumberStatics : public UObject
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintPure, Category = "Damage Numbers")
	static FLinearColor GetDamageNumberColor(EDamageNumberType Type);

	UFUNCTION(BlueprintPure, Category = "Damage Numbers")
	static EDamageNumberType GetDamageNumberTypeForElement(EStickmanElement Element);

	// Per the design spec's color coding: Pyro=Red, Cryo=Cyan, Hydro=Blue, Electro=Purple,
	// Anemo=Teal, Geo=Yellow, Dendro=Green.
	UFUNCTION(BlueprintPure, Category = "Elemental Gauge")
	static FLinearColor GetElementColor(EStickmanElement Element);

	UFUNCTION(BlueprintPure, Category = "Elemental Gauge")
	static FText GetReactionDisplayName(EStickmanReactionType Reaction);
};
