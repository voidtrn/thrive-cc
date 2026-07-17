// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "GrapplingHookComponent.generated.h"

class UCableComponent;
class UNiagaraSystem;
class USoundBase;

UENUM(BlueprintType)
enum class EGrappleMode : uint8
{
	Pull,   // Yank the player to the point (fast straight line).
	Swing,  // Attach + pendulum swing (physics).
	Enemy   // Pull a small enemy in, or pull self to a large one.
};

UENUM(BlueprintType)
enum class EGrappleState : uint8
{
	Idle,
	Firing,
	Attached,
	Reeling
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnGrappleFired, FVector, TargetLocation);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnGrappleReleased);

/**
 * Unlockable grapple gadget on the player. Aim a crosshair at a grapple point (a component
 * tagged "GrapplePoint" or any blocking surface within range), fire, and either get pulled to
 * it (Pull), pendulum-swing from it (Swing), or yank a small enemy / pull to a large one
 * (Enemy). 3 charges, recharge 1 / RechargeInterval, 2s between fires. Releasing preserves
 * momentum (the key to grapple→glide / grapple→wall-run chains, which FlowStateComponent
 * scores). Cable render + whoosh are cosmetic hooks.
 *
 * Physics: Pull drives location toward the anchor with a launch on arrival; Swing applies a
 * rope-constraint acceleration each tick (radial spring toward AnchorPoint at RopeLength) so
 * the player arcs. Full Chaos cable-constraint sim is an upgrade — this is a lightweight
 * analytic pendulum that feels right without a constraint actor.
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UGrapplingHookComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UGrapplingHookComponent();

	virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

	// Fire from the camera at whatever's in range; picks mode automatically (enemy vs surface,
	// Swing if OverrideMode unset and the anchor is above the player, else Pull).
	UFUNCTION(BlueprintCallable, Category = "Grapple")
	bool FireGrapple();

	UFUNCTION(BlueprintCallable, Category = "Grapple")
	void ReleaseGrapple();

	UFUNCTION(BlueprintPure, Category = "Grapple")
	bool IsUnlocked() const { return bUnlocked; }

	UFUNCTION(BlueprintCallable, Category = "Grapple")
	void SetUnlocked(bool bInUnlocked) { bUnlocked = bInUnlocked; }

	UFUNCTION(BlueprintPure, Category = "Grapple")
	int32 GetCharges() const { return Charges; }

	UFUNCTION(BlueprintPure, Category = "Grapple")
	EGrappleState GetState() const { return State; }

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Grapple")
	float GrappleRange = 3000.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Grapple")
	int32 MaxCharges = 3;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Grapple")
	float RechargeInterval = 5.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Grapple")
	float FireCooldown = 2.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Grapple")
	float PullSpeed = 3000.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Grapple")
	float ReleaseBoost = 1.1f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Grapple")
	TObjectPtr<UNiagaraSystem> WhooshVFX;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Grapple")
	TObjectPtr<USoundBase> FireSound;

	UPROPERTY(BlueprintAssignable, Category = "Grapple")
	FOnGrappleFired OnGrappleFired;

	UPROPERTY(BlueprintAssignable, Category = "Grapple")
	FOnGrappleReleased OnGrappleReleased;

protected:
	virtual void BeginPlay() override;

private:
	void TickPull(float DeltaTime);
	void TickSwing(float DeltaTime);
	void Recharge();

	bool bUnlocked = false;
	int32 Charges = 3;
	double LastFireTime = -100.0;

	EGrappleState State = EGrappleState::Idle;
	EGrappleMode Mode = EGrappleMode::Pull;
	FVector AnchorPoint = FVector::ZeroVector;
	float RopeLength = 0.f;
	TWeakObjectPtr<AActor> GrabbedEnemy;

	FTimerHandle RechargeTimerHandle;
};
