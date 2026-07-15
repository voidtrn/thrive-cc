// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "StickmanDamageNumberTypes.h"
#include "StickmanDamageNumberWidget.generated.h"

class UTextBlock;

/**
 * A single floating damage number. Rise + fade is driven natively in NativeTick (no UMG
 * animation asset required), so it works the instant this is subclassed in a WBP with a
 * DamageText TextBlock bound — no extra authoring needed to get working motion.
 */
UCLASS()
class STICKMANIMPACT_API UStickmanDamageNumberWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	// Configures and (re)starts this widget's life — called both on first spawn and every
	// time the pool hands out a previously-used instance.
	UFUNCTION(BlueprintCallable, Category = "Damage Numbers")
	void Activate(float DamageAmount, EDamageNumberType Type);

	virtual void NativeTick(const FGeometry& MyGeometry, float InDeltaTime) override;

	DECLARE_DELEGATE_OneParam(FOnLifetimeEnded, UStickmanDamageNumberWidget*);
	FOnLifetimeEnded OnLifetimeEnded;

protected:
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional))
	TObjectPtr<UTextBlock> DamageText;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Damage Numbers")
	float RiseSpeed = 60.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Damage Numbers")
	float Lifetime = 1.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Damage Numbers")
	float FadeStartFraction = 0.5f;

private:
	float ElapsedTime = 0.f;
	bool bActive = false;
};
