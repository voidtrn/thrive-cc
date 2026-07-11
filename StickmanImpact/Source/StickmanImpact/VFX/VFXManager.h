// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "VFXManager.generated.h"

class UNiagaraSystem;
class UNiagaraComponent;

UENUM(BlueprintType)
enum class EVFXQuality : uint8
{
	Low,
	Medium,
	High,
	Ultra
};

/**
 * VFX spawning with pooling, quality gating, distance LOD, and screen-space culling.
 * Attach to the character (or any heavy VFX emitter). Per-call flow in SpawnVFX:
 *  1. Cull: skip entirely if beyond CullDistance from the camera, or behind it
 *     (dot(camera forward, to-target) < 0 past a small radius) — cheapest possible
 *     "screen-space" test without a render query.
 *  2. LOD: past LODDistance, spawned components get FloatParameter "SpawnRateScale" set to
 *     LODSpawnRateScale — author Niagara systems with a float User parameter of that name
 *     multiplying their spawn rates (systems without it are unaffected).
 *  3. Quality: global quality also drives "SpawnRateScale" (Low 0.4 / Medium 0.7 / High 1.0 /
 *     Ultra 1.0) and maps onto the engine's fx.Niagara scalability CVars via SetVFXQuality.
 *  4. Pool: finished components deactivate and return for reuse instead of destroy/respawn.
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UVFXManager : public UActorComponent
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "VFX")
	float CullDistance = 15000.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "VFX")
	float LODDistance = 5000.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "VFX")
	float LODSpawnRateScale = 0.35f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "VFX")
	int32 MaxPoolSize = 32;

	UFUNCTION(BlueprintCallable, Category = "VFX")
	UNiagaraComponent* SpawnVFX(UNiagaraSystem* System, FVector Location, FRotator Rotation);

	UFUNCTION(BlueprintCallable, Category = "VFX")
	UNiagaraComponent* SpawnVFXAttached(UNiagaraSystem* System, USceneComponent* AttachTo, FName SocketName = NAME_None);

	// Applies engine Niagara scalability CVars + the per-spawn SpawnRateScale mapping.
	UFUNCTION(BlueprintCallable, Category = "VFX")
	static void SetVFXQuality(EVFXQuality Quality);

	UFUNCTION(BlueprintPure, Category = "VFX")
	static EVFXQuality GetVFXQuality() { return GlobalQuality; }

private:
	bool ShouldCull(const FVector& Location, float& OutDistanceToCamera) const;
	UNiagaraComponent* AcquireComponent(UNiagaraSystem* System);

	UFUNCTION()
	void HandleSystemFinished(UNiagaraComponent* FinishedComponent);

	static float GetQualitySpawnRateScale();

	UPROPERTY()
	TArray<TObjectPtr<UNiagaraComponent>> InactivePool;

	static EVFXQuality GlobalQuality;
};
