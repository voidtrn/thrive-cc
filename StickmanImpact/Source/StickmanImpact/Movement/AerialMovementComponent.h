// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "AerialMovementComponent.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnDoubleJump);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnAirDash);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnDiveBomb);

/**
 * Air-mobility kit on the player, layered over the base jump/dive. Owns the mid-air move
 * budget that resets on landing:
 * - **Double jump**: one extra jump mid-air (unlockable). Trickster style + upgrades can raise
 *   the extra-jump count.
 * - **Air dash**: omnidirectional dash in air, costs AirDashStamina; base 1 per airtime,
 *   plus UStyleSubsystem::GetExtraAirDashes() (Trickster grants more).
 * - **Hover**: brief anti-gravity hold (on burst activation) for HoverDuration.
 * - **Dive bomb**: while diving (the character's existing dive), an attack input triggers a
 *   ground slam — OnDiveBomb fires so the combat side spawns the slam ability + shockwave.
 *
 * Call the Try* methods from input; each returns true if it consumed a move. Landing (polled
 * from the owner's movement) refills the budget.
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UAerialMovementComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UAerialMovementComponent();

	virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

	UFUNCTION(BlueprintCallable, Category = "Aerial")
	bool TryDoubleJump();

	UFUNCTION(BlueprintCallable, Category = "Aerial")
	bool TryAirDash(const FVector& WorldDirection);

	UFUNCTION(BlueprintCallable, Category = "Aerial")
	bool TryHover();

	// Call on an attack input while airborne+diving; returns true if it becomes a dive bomb.
	UFUNCTION(BlueprintCallable, Category = "Aerial")
	bool TryDiveBomb();

	UFUNCTION(BlueprintPure, Category = "Aerial")
	bool IsHovering() const { return bHovering; }

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Aerial")
	bool bDoubleJumpUnlocked = false;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Aerial")
	int32 BaseExtraJumps = 1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Aerial")
	float DoubleJumpZVelocity = 700.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Aerial")
	int32 BaseAirDashes = 1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Aerial")
	float AirDashSpeed = 1500.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Aerial")
	float AirDashStamina = 20.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Aerial")
	float HoverDuration = 0.5f;

	UPROPERTY(BlueprintAssignable, Category = "Aerial")
	FOnDoubleJump OnDoubleJump;

	UPROPERTY(BlueprintAssignable, Category = "Aerial")
	FOnAirDash OnAirDash;

	UPROPERTY(BlueprintAssignable, Category = "Aerial")
	FOnDiveBomb OnDiveBomb;

protected:
	virtual void BeginPlay() override;

private:
	int32 MaxExtraJumps() const;
	int32 MaxAirDashes() const;
	void EndHover();

	int32 JumpsUsed = 0;
	int32 AirDashesUsed = 0;
	bool bHovering = false;
	bool bWasFalling = false;
	FTimerHandle HoverTimerHandle;
};
