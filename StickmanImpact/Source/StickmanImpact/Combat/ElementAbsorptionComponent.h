// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "SkillSystem/StickmanSkillTypes.h"
#include "ElementAbsorptionComponent.generated.h"

class UNiagaraSystem;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnElementAbsorbed, EStickmanElement, Element, float, Duration);

/**
 * Environmental element absorption: call Absorb(Element) from element sources in the world
 * (burning ground, elemental crystals, AStickmanTorch overlaps, ...). Effects for 10s:
 *   Pyro   = weapon infusion (normal attacks carry Pyro),
 *   Cryo   = defense buff standing in for a shield (real shield attr still pending),
 *   Electro= +movement speed.
 * Per-element internal cooldown; absorption VFX attaches for the buff's duration.
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UElementAbsorptionComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Absorption")
	float BuffDuration = 10.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Absorption")
	float PerElementCooldown = 20.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Absorption")
	float ElectroSpeedMultiplier = 1.25f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Absorption")
	float CryoDefenseMultiplier = 1.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Absorption")
	TObjectPtr<UNiagaraSystem> AbsorptionVFX;

	UFUNCTION(BlueprintCallable, Category = "Absorption")
	bool Absorb(EStickmanElement Element);

	UPROPERTY(BlueprintAssignable, Category = "Absorption")
	FOnElementAbsorbed OnElementAbsorbed;

private:
	void ExpireBuff(EStickmanElement Element);

	TMap<EStickmanElement, double> LastAbsorbTime;
	FTimerHandle BuffExpireTimerHandle;
};
