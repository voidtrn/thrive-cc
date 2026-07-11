// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "StickmanCollectible.generated.h"

class UStaticMeshComponent;
class USphereComponent;
class UNiagaraSystem;
class USoundBase;

/** Oculi-style floating collectible: bobs/rotates in place, auto-collects on touch, no interact prompt needed. */
UCLASS()
class STICKMANIMPACT_API AStickmanCollectible : public AActor
{
	GENERATED_BODY()

public:
	AStickmanCollectible();

	virtual void Tick(float DeltaSeconds) override;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Collectible")
	FString ItemID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Collectible")
	FName Region;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Collectible")
	float BobHeight = 20.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Collectible")
	float BobSpeed = 2.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Collectible")
	float RotationSpeed = 90.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Collectible")
	TObjectPtr<UNiagaraSystem> CollectVFX;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Collectible")
	TObjectPtr<USoundBase> CollectSound;

protected:
	virtual void BeginPlay() override;

	UFUNCTION()
	void OnCollectOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp,
		int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult);

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Collectible", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UStaticMeshComponent> CollectibleMesh;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Collectible", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<USphereComponent> CollectSphere;

private:
	FVector BaseLocation = FVector::ZeroVector;
	float BobTime = 0.f;
};
