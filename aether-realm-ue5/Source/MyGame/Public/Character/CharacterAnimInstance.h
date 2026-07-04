#pragma once

#include "CoreMinimal.h"
#include "Animation/AnimInstance.h"
#include "CharacterAnimInstance.generated.h"

class ACharacterBase;
class UOpenWorldMovementComponent;

/**
 * Base AnimInstance — semua variabel yang dibutuhkan state machine ABP
 * di-cache sekali per frame di sini (thread-safe, tanpa cast di AnimGraph).
 * ABP_CharacterBase dibuat di editor dengan parent class ini.
 */
UCLASS()
class MYGAME_API UCharacterAnimInstance : public UAnimInstance
{
	GENERATED_BODY()

public:
	virtual void NativeInitializeAnimation() override;
	virtual void NativeUpdateAnimation(float DeltaSeconds) override;

protected:
	// --- Locomotion (BS_Locomotion: X=Direction -180..180, Y=Speed 0..800) ---
	UPROPERTY(BlueprintReadOnly, Category = "Locomotion")
	float Speed = 0.f;

	UPROPERTY(BlueprintReadOnly, Category = "Locomotion")
	float Direction = 0.f;

	UPROPERTY(BlueprintReadOnly, Category = "Locomotion")
	bool bIsAccelerating = false;

	UPROPERTY(BlueprintReadOnly, Category = "Locomotion")
	bool bIsSprinting = false;

	// --- Air ---
	UPROPERTY(BlueprintReadOnly, Category = "Air")
	bool bIsInAir = false;

	UPROPERTY(BlueprintReadOnly, Category = "Air")
	float VerticalVelocity = 0.f;

	UPROPERTY(BlueprintReadOnly, Category = "Air")
	bool bIsGliding = false;

	/** Landing berat kalau jatuh lebih cepat dari ini saat mendarat. */
	UPROPERTY(BlueprintReadOnly, Category = "Air")
	bool bHardLanding = false;

	// --- Special ---
	UPROPERTY(BlueprintReadOnly, Category = "Special")
	bool bIsSwimming = false;

	UPROPERTY(BlueprintReadOnly, Category = "Special")
	bool bIsClimbing = false;

	// --- Look At (head tracking, dipakai Control Rig / AnimGraph LookAt node) ---
	UPROPERTY(BlueprintReadOnly, Category = "LookAt")
	FVector LookAtTarget = FVector::ZeroVector;

	UPROPERTY(BlueprintReadOnly, Category = "LookAt")
	bool bHasLookAtTarget = false;

private:
	UPROPERTY()
	TObjectPtr<ACharacterBase> OwnerCharacter;

	UPROPERTY()
	TObjectPtr<UOpenWorldMovementComponent> MoveComp;

	static constexpr float HardLandingThreshold = -900.f;
	float PrevVerticalVelocity = 0.f;
};
