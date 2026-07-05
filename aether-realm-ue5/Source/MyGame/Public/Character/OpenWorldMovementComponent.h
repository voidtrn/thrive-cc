#pragma once

#include "CoreMinimal.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "OpenWorldMovementComponent.generated.h"

/** Custom movement mode di MOVE_Custom. */
UENUM(BlueprintType)
enum class ECustomMovementMode : uint8
{
	CMOVE_None = 0,
	CMOVE_Climb = 1
};

/**
 * Movement custom: 3 tier kecepatan darat (walk/run/sprint sesuai
 * blend space 0-250 / 250-500 / 500-800), glide, climb (custom mode).
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

	// ---------- Climbing ----------
	/** Cek dinding di depan (angle > 45°) lalu masuk mode climb. */
	UFUNCTION(BlueprintCallable, Category = "Movement|Climb")
	bool TryStartClimbing();

	UFUNCTION(BlueprintCallable, Category = "Movement|Climb")
	void StopClimbing();

	/** Lompatan kecil ke atas saat climbing. Stamina dicek pemanggil (25). */
	UFUNCTION(BlueprintCallable, Category = "Movement|Climb")
	void JumpClimb();

	UFUNCTION(BlueprintPure, Category = "Movement|Climb")
	bool IsClimbing() const
	{
		return MovementMode == MOVE_Custom && CustomMovementMode == static_cast<uint8>(ECustomMovementMode::CMOVE_Climb);
	}

	/** Multiplier stamina dari material dinding (licin = mahal). */
	UFUNCTION(BlueprintPure, Category = "Movement|Climb")
	float GetClimbSurfaceCostMultiplier() const { return CurrentClimbCostMultiplier; }

	UPROPERTY(EditDefaultsOnly, Category = "Movement|Climb")
	float ClimbSpeed = 120.f;

	/** Sudut minimal permukaan dianggap wall (derajat dari horizontal). */
	UPROPERTY(EditDefaultsOnly, Category = "Movement|Climb")
	float MinClimbAngle = 45.f;

	UPROPERTY(EditDefaultsOnly, Category = "Movement|Climb")
	float ClimbTraceDistance = 80.f;

	/** Boost jump climb (unit). */
	UPROPERTY(EditDefaultsOnly, Category = "Movement|Climb")
	float JumpClimbBoost = 200.f;

	/** Stamina cost per surface type (licin > 1.0). */
	UPROPERTY(EditDefaultsOnly, Category = "Movement|Climb")
	TMap<TEnumAsByte<EPhysicalSurface>, float> ClimbCostMultiplierPerSurface;

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
	virtual void PhysCustom(float deltaTime, int32 Iterations) override;

protected:
	bool bWantsToSprint = false;
	bool bIsGliding = false;

	float DefaultAirControl = 0.35f;
	float CurrentClimbCostMultiplier = 1.f;
	FVector ClimbSurfaceNormal = FVector::ZeroVector;

	void RefreshMaxWalkSpeed();
	void PhysClimb(float deltaTime, int32 Iterations);
	bool TraceClimbSurface(FHitResult& OutHit) const;
};
