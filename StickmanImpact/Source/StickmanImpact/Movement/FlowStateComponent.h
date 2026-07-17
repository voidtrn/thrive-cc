// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "FlowStateComponent.generated.h"

/** The movement techniques the flow chain recognizes. */
UENUM(BlueprintType)
enum class EMovementTech : uint8
{
	Sprint,
	Slide,
	Jump,
	WallRun,
	Grapple,
	Glide,
	AirDash,
	DoubleJump
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnFlowChainChanged, int32, ChainLength);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnFlowStateChanged, bool, bActive);

/**
 * "Moment system" — chaining *different* movement techs without touching the ground for too
 * long builds a flow chain. Report each tech via NotifyTech (from the wall-run / grapple /
 * dash / glide code). Chaining distinct techs (a repeat resets the streak) past
 * FlowStateThreshold enters Flow State: speed up, stamina cost down, particle trail — the
 * modifiers other systems read via GetSpeedMultiplier / GetStaminaCostMultiplier. Idle on the
 * ground for GroundResetTime breaks the chain.
 *
 * Also tracks style points (creative chains) and the session's longest flow distance for the
 * "Longest Flow: 250m" readout + region-traversal leaderboard hooks.
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UFlowStateComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UFlowStateComponent();

	virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

	// Report a movement tech was performed. Distinct-from-last extends the chain.
	UFUNCTION(BlueprintCallable, Category = "Flow")
	void NotifyTech(EMovementTech Tech);

	UFUNCTION(BlueprintPure, Category = "Flow")
	bool IsInFlowState() const { return bFlowActive; }

	UFUNCTION(BlueprintPure, Category = "Flow")
	int32 GetChainLength() const { return ChainLength; }

	UFUNCTION(BlueprintPure, Category = "Flow")
	float GetSpeedMultiplier() const { return bFlowActive ? FlowSpeedMultiplier : 1.f; }

	UFUNCTION(BlueprintPure, Category = "Flow")
	float GetStaminaCostMultiplier() const { return bFlowActive ? FlowStaminaCostMultiplier : 1.f; }

	UFUNCTION(BlueprintPure, Category = "Flow")
	int32 GetStylePoints() const { return StylePoints; }

	UFUNCTION(BlueprintPure, Category = "Flow")
	float GetLongestFlowDistance() const { return LongestFlowDistance; }

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Flow")
	int32 FlowStateThreshold = 4;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Flow")
	float FlowSpeedMultiplier = 1.25f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Flow")
	float FlowStaminaCostMultiplier = 0.6f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Flow")
	float GroundResetTime = 1.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Flow")
	TObjectPtr<class UNiagaraSystem> FlowTrailVFX;

	UPROPERTY(BlueprintAssignable, Category = "Flow")
	FOnFlowChainChanged OnFlowChainChanged;

	UPROPERTY(BlueprintAssignable, Category = "Flow")
	FOnFlowStateChanged OnFlowStateChanged;

private:
	void BreakChain();
	void SetFlowActive(bool bActive);

	int32 ChainLength = 0;
	int32 StylePoints = 0;
	EMovementTech LastTech = EMovementTech::Sprint;
	bool bHasLastTech = false;
	bool bFlowActive = false;

	float GroundedTime = 0.f;
	float CurrentFlowDistance = 0.f;
	float LongestFlowDistance = 0.f;
	FVector LastPosition = FVector::ZeroVector;

	UPROPERTY()
	TObjectPtr<class UNiagaraComponent> ActiveTrail;
};
