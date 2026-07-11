// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "StickmanInteractiveFoliage.generated.h"

class UStaticMeshComponent;
class UNiagaraSystem;

/**
 * A single interactive foliage clump (grass tuft, bush, small tree) — not part of the
 * Foliage-tool's procedural instances, since those don't support per-instance reactions
 * without a custom instance-tracking system. Place these individually wherever a burn/
 * cut/freeze reaction should actually do something.
 */
UCLASS()
class STICKMANIMPACT_API AStickmanInteractiveFoliage : public AActor
{
	GENERATED_BODY()

public:
	AStickmanInteractiveFoliage();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Foliage")
	TObjectPtr<UMaterialInterface> BurntMaterial;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Foliage")
	TObjectPtr<UMaterialInterface> FrozenMaterial;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Foliage")
	TObjectPtr<UNiagaraSystem> CutVFX;

	UFUNCTION(BlueprintCallable, Category = "Foliage")
	void OnBurned();

	UFUNCTION(BlueprintCallable, Category = "Foliage")
	void OnFrozen();

	UFUNCTION(BlueprintCallable, Category = "Foliage")
	void OnCut();

protected:
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Foliage", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UStaticMeshComponent> FoliageMesh;
};
