#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "StatueOfTheSeven.generated.h"

/**
 * Statue of The Seven: interact = heal full party + revive + full energy.
 * OfferOculi: tukar oculi → +10 stamina cap (total cap 240).
 * Unlock map area = hook delegate untuk fog-of-war map Phase 5.
 */
UCLASS()
class MYGAME_API AStatueOfTheSeven : public AActor
{
	GENERATED_BODY()

public:
	AStatueOfTheSeven();

	/** Interact (F): heal 100%, revive, full energy. */
	UFUNCTION(BlueprintCallable, Category = "Statue")
	void Worship(APlayerController* Player);

	/** Tukar oculi region ini untuk upgrade stamina. False kalau kurang. */
	UFUNCTION(BlueprintCallable, Category = "Statue")
	bool OfferOculi(APlayerController* Player);

	UFUNCTION(BlueprintPure, Category = "Statue")
	int32 GetOculiRequired() const { return OculiPerUpgrade; }

protected:
	/** Region yang statue ini buka (map reveal Phase 5). */
	UPROPERTY(EditAnywhere, Category = "Statue")
	FName RegionName = TEXT("Starter");

	/** Item ID oculi region ini di inventory. */
	UPROPERTY(EditAnywhere, Category = "Statue")
	FName OculiItemId = TEXT("Oculus_Anemo");

	UPROPERTY(EditAnywhere, Category = "Statue")
	int32 OculiPerUpgrade = 5;

	UPROPERTY(EditAnywhere, Category = "Statue")
	float StaminaPerUpgrade = 10.f;
};
