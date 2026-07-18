// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "MoralitySubsystem.generated.h"

/** The four quadrants of the two-axis system. */
UENUM(BlueprintType)
enum class EMoralityQuadrant : uint8
{
	Paragon,    // Compassion + Order: lawful good
	Rebel,      // Compassion + Chaos: chaotic good
	Judge,      // Cruelty + Order: lawful evil
	Anarchist,  // Cruelty + Chaos: chaotic evil
	Neutral     // near the axes' center
};

UENUM(BlueprintType)
enum class EMoralityAction : uint8
{
	SpareEnemy,         // +Compassion
	ExecuteSurrendered, // +Cruelty
	FollowLaw,          // +Order
	BreakRulesForGood,  // +Chaos
	HelpFreely,         // +Compassion
	DemandPayment,      // slight +Cruelty
	AcceptAuthority,    // +Order
	RebelAgainstCorrupt // +Chaos
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnMoralityChanged, float, Compassion, float, Order);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnQuadrantChanged, EMoralityQuadrant, NewQuadrant);

/**
 * Two-axis morality: **Compassion↔Cruelty** (-100..+100, + = compassion) and
 * **Order↔Chaos** (-100..+100, + = order). `RecordAction` moves both axes by the action's
 * authored deltas; quadrant = sign pair once past NeutralBand (inside it = Neutral, the
 * rarest path with its own content).
 *
 * Visual transformation: `GetTransformIntensity` (0-1, distance from center) + the quadrant
 * drive the character's aura color/material morph (BP reads on OnQuadrantChanged /
 * OnMoralityChanged — golden glow → demonic hints scale with intensity). Elemental VFX
 * tinting rides the same hook. NPC reactions/quests/equipment gate on `GetQuadrant` +
 * `GetTransformIntensity` (e.g. "Sword of Mercy" requires Paragon at ≥0.5). Redemption/
 * corruption arcs are quests that call RecordAction with large deltas — morality is never
 * permanent. Companions react via their own content reading the quadrant.
 */
UCLASS()
class STICKMANIMPACT_API UMoralitySubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Morality")
	void RecordAction(EMoralityAction Action);

	// Direct axis nudge for bespoke story beats (redemption/corruption quests).
	UFUNCTION(BlueprintCallable, Category = "Morality")
	void AddMorality(float CompassionDelta, float OrderDelta);

	UFUNCTION(BlueprintPure, Category = "Morality")
	float GetCompassion() const { return Compassion; }

	UFUNCTION(BlueprintPure, Category = "Morality")
	float GetOrder() const { return Order; }

	UFUNCTION(BlueprintPure, Category = "Morality")
	EMoralityQuadrant GetQuadrant() const;

	// 0 at center → 1 at an extreme corner; drives how visible the transformation is.
	UFUNCTION(BlueprintPure, Category = "Morality")
	float GetTransformIntensity() const;

	// Convenience gate for morality-locked content.
	UFUNCTION(BlueprintPure, Category = "Morality")
	bool MeetsRequirement(EMoralityQuadrant RequiredQuadrant, float MinIntensity) const;

	// |axis| must exceed this to leave Neutral.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Morality")
	float NeutralBand = 15.f;

	// Per-action axis deltas (Compassion, Order).
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Morality")
	TMap<EMoralityAction, FVector2D> ActionDeltas = {
		{ EMoralityAction::SpareEnemy,          FVector2D(+8.f,  0.f) },
		{ EMoralityAction::ExecuteSurrendered,  FVector2D(-10.f, 0.f) },
		{ EMoralityAction::FollowLaw,           FVector2D(0.f,  +6.f) },
		{ EMoralityAction::BreakRulesForGood,   FVector2D(+2.f, -6.f) },
		{ EMoralityAction::HelpFreely,          FVector2D(+6.f,  0.f) },
		{ EMoralityAction::DemandPayment,       FVector2D(-3.f,  0.f) },
		{ EMoralityAction::AcceptAuthority,     FVector2D(0.f,  +5.f) },
		{ EMoralityAction::RebelAgainstCorrupt, FVector2D(+3.f, -8.f) }
	};

	UPROPERTY(BlueprintAssignable, Category = "Morality")
	FOnMoralityChanged OnMoralityChanged;

	UPROPERTY(BlueprintAssignable, Category = "Morality")
	FOnQuadrantChanged OnQuadrantChanged;

	// Save hooks (not yet in the binary format — see README).
	void ExportSaveState(float& OutCompassion, float& OutOrder) const { OutCompassion = Compassion; OutOrder = Order; }
	void ImportSaveState(float InCompassion, float InOrder);

private:
	float Compassion = 0.f;
	float Order = 0.f;
	EMoralityQuadrant LastQuadrant = EMoralityQuadrant::Neutral;
};
