// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "Chaos/ChaosEngineInterface.h" // EPhysicalSurface
#include "StickmanFootstepComponent.generated.h"

class USoundBase;

/**
 * Surface-aware footsteps: PlayFootstep() (call from an AnimNotify on the walk/run cycle's
 * foot-plant frames) traces down, reads the hit's PhysicalMaterial surface type, and plays
 * the matching sound through UStickmanAudioManager. Author PhysicalMaterial assets per surface
 * (PM_Grass etc.), set their SurfaceType (Project Settings > Physics > Physical Surface:
 * define Grass/Stone/Wood/Water/Sand/Snow/Metal as SurfaceType1-7), assign to ground materials.
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UStickmanFootstepComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	// Surface type -> footstep sound (randomize inside via a SoundCue/MetaSound random node).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Footsteps")
	TMap<TEnumAsByte<EPhysicalSurface>, TObjectPtr<USoundBase>> FootstepSounds;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Footsteps")
	TObjectPtr<USoundBase> DefaultFootstepSound;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Footsteps")
	float TraceDistance = 150.f;

	UFUNCTION(BlueprintCallable, Category = "Footsteps")
	void PlayFootstep();
};
