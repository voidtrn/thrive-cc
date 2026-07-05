#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "Chaos/ChaosEngineInterface.h"
#include "FootstepComponent.generated.h"

class USoundBase;

/**
 * Footstep per-surface (spec C2). Pasang di BP karakter, panggil
 * PlayFootstep() dari Anim Notify di frame foot-plant.
 *
 * Deteksi: trace ke bawah → Physical Material SurfaceType → sound map.
 * Buat PhysicalMaterial per surface (PM_Grass=SurfaceType1, PM_Dirt=2,
 * PM_Stone=3, PM_Wood=4, PM_Water=5, PM_Snow=6, PM_Sand=7, PM_Metal=8 —
 * daftarkan nama di Project Settings → Physics → Physical Surface).
 * Volume ikut speed (walk<run<sprint), pitch random ±5%.
 */
UCLASS(ClassGroup = (Audio), meta = (BlueprintSpawnableComponent))
class MYGAME_API UFootstepComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	/** Anim Notify foot plant. SocketName = kaki yang mendarat (foot_l/foot_r). */
	UFUNCTION(BlueprintCallable, Category = "Footstep")
	void PlayFootstep(FName SocketName = NAME_None);

protected:
	/** Sound per surface type. Default = fallback. */
	UPROPERTY(EditDefaultsOnly, Category = "Footstep")
	TMap<TEnumAsByte<EPhysicalSurface>, TObjectPtr<USoundBase>> SurfaceSounds;

	UPROPERTY(EditDefaultsOnly, Category = "Footstep")
	TObjectPtr<USoundBase> DefaultSound;

	UPROPERTY(EditDefaultsOnly, Category = "Footstep")
	float TraceDistance = 120.f;

	/** Volume per kecepatan: X = speed, Y = volume (0.4 @walk → 1.0 @sprint). */
	UPROPERTY(EditDefaultsOnly, Category = "Footstep")
	float WalkVolume = 0.4f;

	UPROPERTY(EditDefaultsOnly, Category = "Footstep")
	float SprintVolume = 1.0f;

	/** Random pitch ±persen (0.05 = ±5%). */
	UPROPERTY(EditDefaultsOnly, Category = "Footstep")
	float PitchVariation = 0.05f;
};
