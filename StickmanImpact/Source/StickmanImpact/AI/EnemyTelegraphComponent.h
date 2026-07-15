// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "EnemyTelegraphComponent.generated.h"

class USoundBase;
class UMaterialInterface;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnTelegraphStarted, float, TellDuration);

/**
 * Attack "tell": BeginTelegraph(Duration) flashes the mesh white (MPC-free — drives a
 * "TellFlash" scalar on the mesh's dynamic materials), plays a per-attack tell sound, drops a
 * ground indicator decal, then fires OnTelegraphFinished so the BT task releases the actual
 * attack. Consistent timing per attack = learnable pattern; bFeint (rare) cancels at the last
 * moment instead of attacking. During the final PerfectDodgeWindow the component watches the
 * player: dashing inside it = perfect dodge (micro slow-mo via UGameFeelComponent).
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UEnemyTelegraphComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UEnemyTelegraphComponent();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Telegraph")
	TObjectPtr<USoundBase> TellSound;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Telegraph")
	TObjectPtr<UMaterialInterface> GroundIndicatorDecal;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Telegraph")
	float GroundIndicatorRadius = 200.f;

	// Final slice of the tell during which a player dash = perfect dodge.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Telegraph")
	float PerfectDodgeWindow = 0.25f;

	// Chance this tell is a feint (cancels instead of attacking). Keep rare.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Telegraph")
	float FeintChance = 0.08f;

	// White flash = parryable; red flash = unparryable (player must dodge). Drives
	// "TellFlash" (white) vs "TellUnparryable" (red) scalars on the mesh materials.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Telegraph")
	bool bDefaultAttackParryable = true;

	// Fires the tell; OnFinished(true) = attack really comes, (false) = feint canceled.
	DECLARE_DELEGATE_OneParam(FOnTelegraphFinished, bool);
	void BeginTelegraph(float TellDuration, FOnTelegraphFinished OnFinished);

	// Overload that sets whether the telegraphed attack is parryable (red vs white flash).
	void BeginTelegraph(float TellDuration, bool bParryable, FOnTelegraphFinished OnFinished);

	// Read by the damage funnel to decide if a parry can catch this attack.
	UFUNCTION(BlueprintPure, Category = "Telegraph")
	bool IsCurrentAttackParryable() const { return bCurrentAttackParryable; }

	UFUNCTION(BlueprintPure, Category = "Telegraph")
	bool IsTelegraphing() const { return bTelegraphing; }

	UPROPERTY(BlueprintAssignable, Category = "Telegraph")
	FOnTelegraphStarted OnTelegraphStarted;

protected:
	virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

private:
	void SetMeshFlash(float Intensity);
	void FinishTelegraph();

	bool bTelegraphing = false;
	bool bIsFeint = false;
	bool bCurrentAttackParryable = true;
	float TelegraphRemaining = 0.f;
	float TelegraphTotal = 0.f;
	FOnTelegraphFinished FinishedDelegate;
};
