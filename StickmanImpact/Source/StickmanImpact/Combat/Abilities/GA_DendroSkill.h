// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Combat/StickmanGameplayAbility.h"
#include "GA_DendroSkill.generated.h"

/**
 * "Thorn Field" — plants a field of thorns at the caster's location that ticks anyone
 * standing in it for 90% ATK per second, applying Dendro, for FieldDuration seconds.
 * The ability instance outlives its own cast animation to keep ticking the field, ending
 * itself once the field expires.
 */
UCLASS()
class STICKMANIMPACT_API UGA_DendroSkill : public UStickmanGameplayAbility
{
	GENERATED_BODY()

public:
	UGA_DendroSkill();

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float FieldRadius = 350.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float FieldDuration = 6.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float TickInterval = 1.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	TSubclassOf<class UGameplayEffect> DendroStatusEffectClass;

protected:
	virtual void OnAbilityActivated() override;
	virtual void OnAbilityEnded(bool bWasCancelled) override;

private:
	void TickField();

	FVector FieldOrigin = FVector::ZeroVector;
	float ElapsedFieldTime = 0.f;
	FTimerHandle FieldTickTimerHandle;
};
