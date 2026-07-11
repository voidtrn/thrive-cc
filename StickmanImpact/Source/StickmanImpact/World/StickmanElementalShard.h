// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "SkillSystem/StickmanSkillTypes.h"
#include "StickmanElementalShard.generated.h"

class UStaticMeshComponent;
class USphereComponent;

/**
 * Crystallize's dropped shield shard. Auto-destroys after Lifetime if never collected.
 * NOTE: picking it up currently just destroys the shard and logs the shield amount — actually
 * absorbing damage needs a Shield attribute on UStickmanAttributeSet plus a check in its
 * PostGameplayEffectExecute, which is out of scope here; wire that up before shipping.
 */
UCLASS()
class STICKMANIMPACT_API AStickmanElementalShard : public AActor
{
	GENERATED_BODY()

public:
	AStickmanElementalShard();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Shard")
	EStickmanElement Element = EStickmanElement::Geo;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Shard")
	float ShieldAmount = 100.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Shard")
	float Lifetime = 15.f;

protected:
	virtual void BeginPlay() override;

	UFUNCTION()
	void OnPickupOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp,
		int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult);

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Shard", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UStaticMeshComponent> ShardMesh;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Shard", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<USphereComponent> PickupSphere;
};
