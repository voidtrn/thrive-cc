// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "StickmanPressurePlate.generated.h"

class UStaticMeshComponent;
class UBoxComponent;

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnPressurePlateActivated);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnPressurePlateDeactivated);

/** Stays active while at least one Pawn/physics-simulating actor is standing on it — a door/gate Blueprint binds to the two delegates. */
UCLASS()
class STICKMANIMPACT_API AStickmanPressurePlate : public AActor
{
	GENERATED_BODY()

public:
	AStickmanPressurePlate();

	UFUNCTION(BlueprintPure, Category = "Puzzle")
	bool IsActivated() const { return OverlappingActors.Num() > 0; }

	UPROPERTY(BlueprintAssignable, Category = "Puzzle")
	FOnPressurePlateActivated OnActivated;

	UPROPERTY(BlueprintAssignable, Category = "Puzzle")
	FOnPressurePlateDeactivated OnDeactivated;

protected:
	virtual void BeginPlay() override;

	UFUNCTION()
	void OnPlateBeginOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp,
		int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult);

	UFUNCTION()
	void OnPlateEndOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp,
		int32 OtherBodyIndex);

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Puzzle", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UStaticMeshComponent> PlateMesh;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Puzzle", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UBoxComponent> DetectionBox;

private:
	UPROPERTY()
	TArray<TObjectPtr<AActor>> OverlappingActors;
};
