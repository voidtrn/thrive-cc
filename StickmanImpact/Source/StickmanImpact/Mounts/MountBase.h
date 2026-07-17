// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "MountTypes.h"
#include "MountBase.generated.h"

class AStickmanCharacter;
class UNiagaraSystem;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnMountRidingChanged, bool, bRiding);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnMountDowned);

/**
 * A rideable mount. When the player mounts, the player's controller possesses this pawn (the
 * rider character is attached to the "seat" socket + hidden/disabled), so all the movement
 * input drives the mount; dismount re-possesses the rider. Per-type movement is applied in
 * BeginPlay from FMountStats + EMountType (flying uses stamina for altitude, aquatic swims,
 * climbing walks walls in tagged zones).
 *
 * Mounted combat: `MountCharge` builds speed for a velocity-scaled impact; `UseMountAbility`
 * fires the type ability (Ground stomp/kick, Flying dive/gust, Aquatic tail/jet). The mount
 * has its own HP (`MountHealth`) and can be downed (dismounts the rider, revive by item or
 * cooldown). `DismountAttack` launches the rider into an aerial slam.
 *
 * Bonding is tracked per-mount in UMountManagerSubsystem; higher bond unlocks the abilities
 * and raises stats.
 */
UCLASS()
class STICKMANIMPACT_API AMountBase : public ACharacter
{
	GENERATED_BODY()

public:
	AMountBase();

	virtual void BeginPlay() override;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Mount")
	FName MountID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Mount")
	EMountType MountType = EMountType::Ground;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Mount")
	FMountStats Stats;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Mount")
	FName SeatSocket = TEXT("Seat");

	// --- Riding ---------------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Mount")
	void Mount(AStickmanCharacter* Rider);

	UFUNCTION(BlueprintCallable, Category = "Mount")
	void Dismount();

	// Dismount + launch the rider into an aerial slam.
	UFUNCTION(BlueprintCallable, Category = "Mount")
	void DismountAttack();

	UFUNCTION(BlueprintPure, Category = "Mount")
	bool IsRidden() const { return Rider != nullptr; }

	// --- Combat ---------------------------------------------------------------------------

	// Build charge speed; impact damage scales with velocity (applied on the next blocking hit).
	UFUNCTION(BlueprintCallable, Category = "Mount")
	void MountCharge();

	// Fire the type-specific mount ability.
	UFUNCTION(BlueprintCallable, Category = "Mount")
	void UseMountAbility();

	UFUNCTION(BlueprintCallable, Category = "Mount")
	void TakeMountDamage(float Amount);

	UFUNCTION(BlueprintPure, Category = "Mount")
	bool IsDowned() const { return bDowned; }

	// --- Feedback -------------------------------------------------------------------------

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Mount")
	TObjectPtr<UNiagaraSystem> AbilityVFX;

	UPROPERTY(BlueprintAssignable, Category = "Mount")
	FOnMountRidingChanged OnMountRidingChanged;

	UPROPERTY(BlueprintAssignable, Category = "Mount")
	FOnMountDowned OnMountDowned;

	// Per-type ability realized in BP (stomp/dive/tail-whip content); C++ owns HP/charge/attach.
	UFUNCTION(BlueprintImplementableEvent, Category = "Mount")
	void OnMountAbility(EMountType Type);

protected:
	virtual void NotifyHit(class UPrimitiveComponent* MyComp, AActor* Other, class UPrimitiveComponent* OtherComp,
		bool bSelfMoved, FVector HitLocation, FVector HitNormal, FVector NormalImpulse, const FHitResult& Hit) override;

private:
	void ApplyTypeMovement();

	UPROPERTY()
	TObjectPtr<AStickmanCharacter> Rider;

	UPROPERTY()
	TObjectPtr<class AController> RiderController;

	float MountHealth = 500.f;
	bool bDowned = false;
	bool bCharging = false;
};
