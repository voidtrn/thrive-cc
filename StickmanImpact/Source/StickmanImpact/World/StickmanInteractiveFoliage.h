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
 *
 * Living-world: burned/frozen/cut foliage regrows after RegrowTime instead of staying
 * dead forever — cut clumps hide rather than Destroy() so they can come back, and the
 * regrow scales the mesh 0.2 -> 1.0 like AResourceNode. RegrowTime = 0 disables regrowth
 * (permanent, e.g. story-relevant trees). Regrowth is session-only; it isn't serialized
 * into save files (world actor state persistence is scoped out — see README).
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

	// Seconds before burned/frozen/cut foliage returns to normal. 0 = never regrows.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Foliage")
	float RegrowTime = 180.f;

	UFUNCTION(BlueprintCallable, Category = "Foliage")
	void OnBurned();

	UFUNCTION(BlueprintCallable, Category = "Foliage")
	void OnFrozen();

	UFUNCTION(BlueprintCallable, Category = "Foliage")
	void OnCut();

protected:
	virtual void BeginPlay() override;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Foliage", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UStaticMeshComponent> FoliageMesh;

private:
	void ScheduleRegrow();
	void BeginRegrow();
	void TickRegrow();

	UPROPERTY()
	TArray<TObjectPtr<UMaterialInterface>> OriginalMaterials;

	bool bWasCut = false;
	FTimerHandle RegrowTimerHandle;
	FTimerHandle RegrowScaleTimerHandle;
	FVector OriginalScale = FVector::OneVector;
	float RegrowScaleAlpha = 1.f;
};
