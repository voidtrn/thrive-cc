// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/WidgetComponent.h"
#include "Combat/StickmanReactionTypes.h"
#include "EnemyElementalDisplayComponent.generated.h"

/**
 * Drop this on any enemy actor: shows its active elemental auras (via
 * UElementalReactionManager::GetActiveElements) as floating icons+bars, and pops up
 * "MELT"/"VAPORIZE"/... text (with a damage number) whenever a reaction fires on it.
 * Set WidgetClass (inherited from UWidgetComponent) to a Blueprint subclass of
 * UStickmanElementalGaugeWidget.
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UEnemyElementalDisplayComponent : public UWidgetComponent
{
	GENERATED_BODY()

public:
	UEnemyElementalDisplayComponent();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Elemental Gauge")
	float PollInterval = 0.2f;

protected:
	virtual void BeginPlay() override;
	virtual void EndPlay(const EEndPlayReason::Type EndPlayReason) override;

private:
	void PollActiveElements();

	UFUNCTION()
	void HandleReactionTriggered(AActor* Target, EStickmanReactionType Reaction, float ReactionDamage, FVector ReactionLocation);

	FTimerHandle PollTimerHandle;
};
