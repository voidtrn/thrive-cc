// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "GameplayTagContainer.h"
#include "StickmanStatTypes.h"
#include "StickmanCharacter.generated.h"

class USpringArmComponent;
class UCameraComponent;
class UInputMappingContext;
class UInputAction;
class UCameraShakeBase;
class UCurveFloat;
struct FInputActionValue;

/**
 * Player-controlled stickman. Third-person character with movement (walk/sprint/dash/
 * double-jump), a stamina economy, gameplay-tag-driven movement state, and Enhanced Input
 * bindings for the RPG action set (attack / skills / burst).
 */
UCLASS()
class STICKMANIMPACT_API AStickmanCharacter : public ACharacter
{
	GENERATED_BODY()

public:
	AStickmanCharacter();

	virtual void Tick(float DeltaSeconds) override;
	virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;
	virtual void Jump() override;

protected:
	virtual void BeginPlay() override;

	// -------------------------------------------------------------------
	// Components
	// -------------------------------------------------------------------

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<USpringArmComponent> CameraBoom;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UCameraComponent> FollowCamera;

	// -------------------------------------------------------------------
	// Enhanced Input
	// -------------------------------------------------------------------

	// Assign in the character Blueprint/DefaultObject to the IMC_Default asset created in-editor.
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputMappingContext> DefaultMappingContext;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> MoveAction;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> LookAction;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> JumpAction;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> SprintAction;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> DashAction;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> NormalAttackAction;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> Skill1Action;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> Skill2Action;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> InteractAction;

	// Optional: mouse wheel / gamepad stick axis for camera zoom (not in the base IA list,
	// bind an IA_Zoom asset here if you want zoom; safe to leave unset).
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> ZoomAction;

	// -------------------------------------------------------------------
	// Stats
	// -------------------------------------------------------------------

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats")
	FStickmanStats Stats;

	// -------------------------------------------------------------------
	// Movement tuning
	// -------------------------------------------------------------------

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
	float WalkSpeed = 400.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
	float SprintSpeed = 700.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
	float DashDistance = 600.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
	float DashCooldown = 1.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
	float DashDuration = 0.2f;

	// Optional easing curve (0-1 over 0-1 time). If unset, a linear dash is used.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
	TObjectPtr<UCurveFloat> DashCurve;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
	int32 MaxJumpCount = 2;

	// -------------------------------------------------------------------
	// Stamina
	// -------------------------------------------------------------------

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stamina")
	float SprintStaminaDrainRate = 10.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stamina")
	float DashStaminaCost = 25.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stamina")
	float StaminaRegenRate = 8.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stamina")
	float StaminaRegenDelay = 1.f;

	UPROPERTY(BlueprintReadOnly, Category = "Stamina")
	float CurrentStamina = 0.f;

	// -------------------------------------------------------------------
	// Camera tuning
	// -------------------------------------------------------------------

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
	float CameraLagSpeedValue = 3.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
	float MinCameraBoomLength = 200.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
	float MaxCameraBoomLength = 600.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
	float WalkFOV = 90.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
	float SprintFOV = 100.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
	float FOVInterpSpeed = 4.f;

	// Simple camera shake played on dash start. Assign a UCameraShakeBase Blueprint subclass.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
	TSubclassOf<UCameraShakeBase> DashCameraShakeClass;

public:
	// -------------------------------------------------------------------
	// Input handlers
	// -------------------------------------------------------------------

	void Move(const FInputActionValue& Value);
	void Look(const FInputActionValue& Value);
	void Zoom(const FInputActionValue& Value);
	void StartSprint();
	void StopSprint();
	void Dash();
	void OnNormalAttack();
	void OnSkill1();
	void OnSkill2();
	void OnInteract();

	UFUNCTION(BlueprintPure, Category = "Stamina")
	float GetStaminaPercent() const { return Stats.MaxStamina > 0.f ? CurrentStamina / Stats.MaxStamina : 0.f; }

	UFUNCTION(BlueprintPure, Category = "Movement")
	FGameplayTag GetCurrentMovementTag() const { return CurrentMovementTag; }

	// Raw axis values from the last Move/Look input events — used by the on-screen input
	// debug widget so testers can confirm Enhanced Input is actually reaching the character.
	UFUNCTION(BlueprintPure, Category = "Input|Debug")
	FVector2D GetLastMoveInput() const { return CachedMoveInput; }

	UFUNCTION(BlueprintPure, Category = "Input|Debug")
	FVector2D GetLastLookInput() const { return CachedLookInput; }

private:
	void TickDash(float DeltaSeconds);
	void TickStaminaRegen(float DeltaSeconds);
	void TickCamera(float DeltaSeconds);
	void ConsumeStamina(float Amount);
	void UpdateMovementStateTag();
	void ShowDebugOnScreen() const;

	FGameplayTag CurrentMovementTag;

	bool bWantsToSprint = false;

	// Dash runtime state.
	bool bIsDashing = false;
	bool bDashOnCooldown = false;
	FVector DashStartLocation = FVector::ZeroVector;
	FVector DashTargetLocation = FVector::ZeroVector;
	float DashElapsedTime = 0.f;
	FTimerHandle DashCooldownTimerHandle;

	// Stamina runtime state: time since the last stamina-consuming action, used for the regen delay.
	float TimeSinceStaminaUse = 0.f;

	// Double jump runtime state.
	int32 CurrentJumpCount = 0;

	FVector2D CachedMoveInput = FVector2D::ZeroVector;
	FVector2D CachedLookInput = FVector2D::ZeroVector;
};
