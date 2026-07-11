// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "StickmanFoliageInteractionComponent.generated.h"

class UMaterialParameterCollection;

/**
 * Drop on the player character: writes its world position into a Material Parameter
 * Collection vector every tick so grass materials can read it (World Position Offset node,
 * distance-to-CharacterPosition falloff) to bend away from the character — no per-blade
 * gameplay code needed, it's entirely a material-side effect driven by this one MPC vector.
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UStickmanFoliageInteractionComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UStickmanFoliageInteractionComponent();

	virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Foliage")
	TObjectPtr<UMaterialParameterCollection> FoliageMPC;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Foliage")
	FName PositionParameterName = TEXT("CharacterPosition");
};
