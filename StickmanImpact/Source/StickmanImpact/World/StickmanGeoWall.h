// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "StickmanGeoWall.generated.h"

class UStaticMeshComponent;

/**
 * Temporary blocking wall spawned by GA_GeoSkill ("Stone Wall"). Assign a rock mesh to
 * WallMesh in the Blueprint subclass — the C++ side only wires up collision + the
 * self-destroy timer, since the actual geometry is art, not code.
 */
UCLASS()
class STICKMANIMPACT_API AStickmanGeoWall : public AActor
{
	GENERATED_BODY()

public:
	AStickmanGeoWall();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Geo Wall")
	float WallDuration = 10.f;

protected:
	virtual void BeginPlay() override;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Geo Wall", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UStaticMeshComponent> WallMesh;
};
