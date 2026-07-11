// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "SkillSystem/StickmanSkillTypes.h"
#include "StickmanReactionTypes.generated.h"

class UNiagaraSystem;
class USoundBase;
class UCameraShakeBase;

UENUM(BlueprintType)
enum class EStickmanReactionType : uint8
{
	None,
	Melt,			// Pyro <-> Cryo
	Vaporize,		// Pyro <-> Hydro
	Overload,		// Pyro + Electro
	Burning,		// Pyro + Dendro
	Frozen,			// Cryo + Hydro
	Superconduct,	// Cryo + Electro
	ElectroCharged,	// Hydro + Electro
	Bloom,			// Hydro + Dendro
	Swirl,			// Anemo + any
	Crystallize,	// Geo + Pyro/Hydro/Cryo/Electro
	Quicken,		// Electro + Dendro (aura, not a burst)
	Aggravate,		// Electro hits a Quicken'd target
	Spread			// Dendro hits a Quicken'd target
};

/** One element "aura" currently active on an actor. Decays to nothing after Duration seconds. */
USTRUCT(BlueprintType)
struct FActiveElement
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly, Category = "Reaction")
	EStickmanElement Element = EStickmanElement::None;

	UPROPERTY(BlueprintReadOnly, Category = "Reaction")
	float Gauge = 0.f;

	UPROPERTY(BlueprintReadOnly, Category = "Reaction")
	float Duration = 6.f;

	UPROPERTY(BlueprintReadOnly, Category = "Reaction")
	float AppliedTime = 0.f;

	float GetRemainingTime(float CurrentTime) const { return (AppliedTime + Duration) - CurrentTime; }
	bool IsExpired(float CurrentTime) const { return GetRemainingTime(CurrentTime) <= 0.f; }
};

/** Non-aura reaction state that persists independently of the gauge list above (CC, auras that don't decay like normal elements, timed debuffs). */
USTRUCT()
struct FStickmanReactionState
{
	GENERATED_BODY()

	bool bFrozen = false;
	float FrozenEndTime = -1.f;

	// Quicken (Electro+Dendro aura): further Electro hits = Aggravate, further Dendro hits = Spread.
	bool bQuickened = false;
	float QuickenEndTime = -1.f;

	// Superconduct: -40% Defense for 12s.
	bool bDefenseShredded = false;
	float DefenseShredEndTime = -1.f;
	float DefenseShredFraction = 0.4f;
};

/** VFX/SFX/camera-shake to play when a given reaction triggers — assign per-project in a UStickmanReactionEffectsDataAsset. */
USTRUCT(BlueprintType)
struct FReactionEffectData
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Reaction")
	TObjectPtr<UNiagaraSystem> VFX;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Reaction")
	TObjectPtr<USoundBase> Sound;

	// Only Melt/Vaporize/Overload shake the camera per the design spec ("major reactions").
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Reaction")
	TSubclassOf<UCameraShakeBase> CameraShakeClass;
};

/** Broadcast whenever a reaction resolves — UI (gauge display, damage numbers, popups) hooks this. */
DECLARE_DYNAMIC_MULTICAST_DELEGATE_FourParams(FStickmanReactionTriggered, AActor*, Target, EStickmanReactionType, Reaction,
	float, ReactionDamage, FVector, ReactionLocation);

DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams(FStickmanElementApplied, AActor*, Target, EStickmanElement, Element,
	float, Gauge);
