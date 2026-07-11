// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "StickmanInteractable.h"
#include "ResourceNode.generated.h"

class UStaticMeshComponent;

/** Ore/plant/other gatherable that hides + disables collision on gather, then respawns after RespawnTime. */
UCLASS()
class STICKMANIMPACT_API AResourceNode : public AActor, public IStickmanInteractable
{
	GENERATED_BODY()

public:
	AResourceNode();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Resource")
	FName ResourceType;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Resource")
	int32 GatherAmount = 1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Resource")
	float RespawnTime = 300.f;

	UFUNCTION(BlueprintPure, Category = "Resource")
	bool IsAvailable() const { return bIsAvailable; }

	virtual void Interact_Implementation(AActor* Instigator) override;
	virtual FText GetInteractionPrompt_Implementation() const override;

protected:
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Resource", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UStaticMeshComponent> ResourceMesh;

private:
	void Respawn();

	bool bIsAvailable = true;
	FTimerHandle RespawnTimerHandle;
};
