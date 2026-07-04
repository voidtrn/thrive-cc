#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Combat/CombatTypes.h"
#include "OculusCollectible.generated.h"

class USphereComponent;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnOculusCollected, FName, ItemId, int32, TotalCollected);

/**
 * Oculus collectible: float + auto pickup saat player nyentuh.
 * VFX glow per elemen region = Niagara di BP child. Persistence via save.
 * Minimap indicator: bind OnPlayerNearby di widget map (Phase 5).
 */
UCLASS()
class MYGAME_API AOculusCollectible : public AActor
{
	GENERATED_BODY()

public:
	AOculusCollectible();

	virtual void Tick(float DeltaSeconds) override;

	UFUNCTION(BlueprintPure, Category = "Oculus")
	FName GetOculusId() const { return FName(*GetName()); }

	UPROPERTY(BlueprintAssignable, Category = "Oculus")
	FOnOculusCollected OnCollected;

protected:
	virtual void BeginPlay() override;

	/** Item ID di inventory (Oculus_Anemo, Oculus_Geo, dst). */
	UPROPERTY(EditAnywhere, Category = "Oculus")
	FName ItemId = TEXT("Oculus_Anemo");

	/** Elemen region — warna glow VFX di BP. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Oculus")
	EElement RegionElement = EElement::Anemo;

	UPROPERTY(VisibleAnywhere, Category = "Components")
	TObjectPtr<USphereComponent> PickupRadius;

	/** Amplitudo & speed float bobbing. */
	UPROPERTY(EditAnywhere, Category = "Oculus")
	float BobAmplitude = 20.f;

	UPROPERTY(EditAnywhere, Category = "Oculus")
	float BobSpeed = 2.f;

	UFUNCTION()
	void OnPickupOverlap(UPrimitiveComponent* OverlappedComp, AActor* OtherActor,
		UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep,
		const FHitResult& SweepResult);

private:
	FVector BaseLocation;
};
