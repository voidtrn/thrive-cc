#pragma once

#include "CoreMinimal.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "OpenWorldMovementComponent.generated.h"

/**
 * Movement custom: 3 tier kecepatan darat (walk/run/sprint sesuai
 * blend space 0-250 / 250-500 / 500-800) + mode glide.
 * Climb & swim detail menyusul; flag-nya sudah ada supaya AnimBP stabil.
 */
UCLASS()
class MYGAME_API UOpenWorldMovementComponent : public UCharacterMovementComponent
{
	GENERATED_BODY()

public:
	UOpenWorldMovementComponent();

	UFUNCTION(BlueprintCallable, Category = "Movement")
	void SetSprinting(bool bNewSprinting);

	UFUNCTION(BlueprintPure, Category = "Movement")
	bool IsSprinting() const { return bWantsToSprint; }

	UFUNCTION(BlueprintCallable, Category = "Movement|Glide")
	void StartGliding();

	UFUNCTION(BlueprintCallable, Category = "Movement|Glide")
	void StopGliding();

	UFUNCTION(BlueprintPure, Category = "Movement|Glide")
	bool IsGliding() const { return bIsGliding; }

	UFUNCTION(BlueprintPure, Category = "Movement|Climb")
	bool IsClimbing() const { return bIsClimbing; }

	// --- Speed tiers (match BS_Locomotion) ---
	UPROPERTY(EditDefaultsOnly, Category = "Movement|Speeds")
	float WalkSpeed = 250.f;

	UPROPERTY(EditDefaultsOnly, Category = "Movement|Speeds")
	float RunSpeed = 500.f;

	UPROPERTY(EditDefaultsOnly, Category = "Movement|Speeds")
	float SprintSpeed = 800.f;

	// --- Glide tuning ---
	/** Kecepatan turun konstan saat glide (cm/s). */
	UPROPERTY(EditDefaultsOnly, Category = "Movement|Glide")
	float GlideVerticalSpeed = -180.f;

	UPROPERTY(EditDefaultsOnly, Category = "Movement|Glide")
	float GlideAirControl = 0.9f;

	UPROPERTY(EditDefaultsOnly, Category = "Movement|Glide")
	float GlideMaxHorizontalSpeed = 600.f;

	virtual void PhysFalling(float deltaTime, int32 Iterations) override;

protected:
	bool bWantsToSprint = false;
	bool bIsGliding = false;
	bool bIsClimbing = false; // Phase 3: climb system

	float DefaultAirControl = 0.35f;

	void RefreshMaxWalkSpeed();
};
