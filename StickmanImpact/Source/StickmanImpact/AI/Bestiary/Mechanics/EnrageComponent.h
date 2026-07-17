// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "EnrageComponent.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnEnraged);

/**
 * Reusable archetype mechanic: the owner enrages when its HP drops below EnrageHealthPercent
 * — faster movement + a lasting attack buff + enrage VFX. Used by Berserker/Champion-type
 * Hilichurls and any "enrages at 50%" archetype (set via FEnemyArchetype::MechanicComponentClass).
 * One-shot per life.
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UEnrageComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UEnrageComponent();

	virtual void BeginPlay() override;
	virtual void EndPlay(const EEndPlayReason::Type EndPlayReason) override;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Enrage", meta = (ClampMin = "0", ClampMax = "1"))
	float EnrageHealthPercent = 0.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Enrage")
	float MoveSpeedMultiplier = 1.4f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Enrage")
	float AttackMultiplier = 1.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Enrage")
	TObjectPtr<class UNiagaraSystem> EnrageVFX;

	UPROPERTY(BlueprintAssignable, Category = "Enrage")
	FOnEnraged OnEnraged;

	UFUNCTION(BlueprintPure, Category = "Enrage")
	bool IsEnraged() const { return bEnraged; }

private:
	UFUNCTION()
	void HandleHealthChanged(float NewHealth, float MaxHealth);

	void Enrage();

	bool bEnraged = false;
};
