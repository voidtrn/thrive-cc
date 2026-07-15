// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "StickmanDamageNumberTypes.h"
#include "StickmanDamageNumberManager.generated.h"

class UWidgetComponent;
class UStickmanDamageNumberWidget;

/**
 * Pools floating damage-number WidgetComponents so combat doesn't spawn/destroy a widget per
 * hit — components are attached to whichever actor was just hit, then detached and recycled
 * once their number finishes rising/fading (see UStickmanDamageNumberWidget::NativeTick).
 */
UCLASS()
class STICKMANIMPACT_API UStickmanDamageNumberManager : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Damage Numbers")
	TSubclassOf<UStickmanDamageNumberWidget> DamageNumberWidgetClass;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Damage Numbers")
	FVector SpawnOffset = FVector(0.f, 0.f, 120.f);

	UFUNCTION(BlueprintCallable, Category = "Damage Numbers")
	void SpawnDamageNumber(AActor* Target, float Damage, EDamageNumberType Type);

	// Hits on the same target within this window merge into one accumulating number instead
	// of stacking overlapping widgets (multi-hit readability). 0 disables merging.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Damage Numbers")
	float AccumulationWindow = 0.4f;

	virtual void Deinitialize() override;

private:
	UWidgetComponent* AcquirePooledComponent();
	void ReturnToPool(UStickmanDamageNumberWidget* Widget, TWeakObjectPtr<UWidgetComponent> Component);

	UPROPERTY()
	TObjectPtr<AActor> PoolOwnerActor;

	UPROPERTY()
	TArray<TObjectPtr<UWidgetComponent>> InactivePool;

	// Accumulation state per target.
	struct FAccumulatingNumber
	{
		TWeakObjectPtr<UStickmanDamageNumberWidget> Widget;
		float Total = 0.f;
		double LastHitTime = 0.0;
		EDamageNumberType Type = EDamageNumberType::Physical;
	};
	TMap<TWeakObjectPtr<AActor>, FAccumulatingNumber> Accumulating;
};
