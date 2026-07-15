// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "StickmanReactionTypes.h"
#include "ElementalReactionManager.generated.h"

class UStickmanReactionEffectsDataAsset;
class UStickmanAttributeSet;
class UAbilitySystemComponent;
class IConsoleCommand;
class AStickmanGeoWall;

/** Result of a single ApplyElement() call — what (if anything) reacted, and how it should modify the triggering hit's damage. */
USTRUCT(BlueprintType)
struct FStickmanReactionResult
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly, Category = "Reaction")
	EStickmanReactionType Reaction = EStickmanReactionType::None;

	// Multiplies the *triggering hit's* damage (Melt/Vaporize only — everything else is 1.0
	// and deals its own independent ReactionDamage instead).
	UPROPERTY(BlueprintReadOnly, Category = "Reaction")
	float DamageMultiplier = 1.f;

	// Independent reaction damage (Overload/Superconduct/ElectroCharged/Bloom/Swirl/Aggravate/Spread).
	UPROPERTY(BlueprintReadOnly, Category = "Reaction")
	float ReactionDamage = 0.f;
};

/**
 * The heart of StickmanImpact's combat system: tracks elemental auras per actor and resolves
 * every Genshin-style elemental reaction (Melt, Vaporize, Overload, Burning, Frozen,
 * Superconduct, Electro-Charged, Bloom, Swirl, Crystallize, Quicken/Aggravate/Spread).
 *
 * Usage: combat abilities call CalculateReactionDamage() once per elemental hit — it applies
 * the attacker's element, resolves whatever reaction that triggers (spawning VFX/SFX/camera
 * shake, applying CC/debuffs, dealing independent reaction damage), and returns the final
 * damage number the ability should apply to the *original* hit.
 */
UCLASS()
class STICKMANIMPACT_API UElementalReactionManager : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;
	virtual void Deinitialize() override;

	// Low-level: adds/refreshes Element on Target, resolving a reaction against whatever's
	// already there. AttackerElementalMastery is only needed to size independent reaction
	// damage (Overload, Superconduct, ...); pass 0 if you only care about aura/status tracking.
	UFUNCTION(BlueprintCallable, Category = "Reactions")
	FStickmanReactionResult ApplyElement(AActor* Target, EStickmanElement Element, float Gauge,
		float AttackerElementalMastery = 0.f);

	// High-level: the entry point combat abilities should actually call. Applies AttackerElement
	// to Target, resolves any reaction, and returns the (possibly multiplied) damage the ability
	// should deal for this hit. Independent reaction damage is applied directly to Target inside
	// this call, separate from the returned value.
	UFUNCTION(BlueprintCallable, Category = "Reactions")
	float CalculateReactionDamage(AActor* Target, float IncomingDamage, EStickmanElement AttackerElement,
		float ElementalMastery);

	UFUNCTION(BlueprintCallable, Category = "Reactions")
	bool TryShatterFrozen(AActor* Target, float& OutDamageMultiplier);

	UFUNCTION(BlueprintPure, Category = "Reactions")
	TArray<FActiveElement> GetActiveElements(AActor* Target);

	UFUNCTION(BlueprintPure, Category = "Reactions")
	bool IsFrozen(AActor* Target) const;

	UFUNCTION(BlueprintPure, Category = "Reactions")
	float GetDefenseMultiplier(AActor* Target) const;

	UPROPERTY(BlueprintAssignable, Category = "Reactions")
	FStickmanReactionTriggered OnReactionTriggered;

	UPROPERTY(BlueprintAssignable, Category = "Reactions")
	FStickmanElementApplied OnElementApplied;

	// --- Reaction chains ---------------------------------------------------
	// Reactions within ChainWindow of each other chain: +15% reaction damage per link,
	// broadcast for the "reaction chain x3!" UI. A chain that consumes all 7 elements =
	// Grand Reaction (massive AoE at the last target).
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Reactions|Chain")
	float ChainWindow = 4.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Reactions|Chain")
	float ChainDamageBonusPerLink = 0.15f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Reactions|Chain")
	float GrandReactionDamage = 800.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Reactions|Chain")
	float GrandReactionRadius = 900.f;

	UFUNCTION(BlueprintPure, Category = "Reactions|Chain")
	int32 GetCurrentChainCount() const { return ReactionChainCount; }

	DECLARE_MULTICAST_DELEGATE_OneParam(FOnReactionChain, int32);
	FOnReactionChain OnReactionChain;

	// Data asset holding VFX/SFX/camera shake per reaction. Point ReactionEffectsAssetPath at
	// it in DefaultGame.ini under [/Script/StickmanImpact.ElementalReactionManager], or assign
	// directly if you subclass this subsystem in Blueprint.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Reactions")
	TObjectPtr<UStickmanReactionEffectsDataAsset> ReactionEffects;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Reactions")
	TSubclassOf<AStickmanElementalShard> ElementalShardClass;

private:
	EStickmanReactionType DetermineTripleReaction(EStickmanElement A, EStickmanElement B, EStickmanElement Incoming) const;
	void TrackReactionChain(AActor* Target, EStickmanElement ConsumedA, EStickmanElement ConsumedB);
	float GetChainDamageMultiplier() const;
	float GetTargetReactionDamageScale(AActor* Target, EStickmanReactionType Reaction) const;

	EStickmanReactionType DetermineReaction(EStickmanElement Existing, EStickmanElement Incoming) const;
	static bool IsSwirlable(EStickmanElement Element);
	static bool IsCrystallizable(EStickmanElement Element);
	float GetBaseAuraDuration(EStickmanElement Element, float Gauge) const;

	FStickmanReactionResult ResolveReaction(AActor* Target, EStickmanReactionType Reaction,
		EStickmanElement ExistingElement, EStickmanElement IncomingElement, float ElementalMastery, bool bAllowSwirlSpread);

	void PruneExpiredElements(AActor* Target);

	void ApplyDirectDamage(AActor* Target, float Damage) const;
	void PlayReactionEffects(AActor* Target, EStickmanReactionType Reaction) const;
	void LogReaction(AActor* Target, EStickmanReactionType Reaction, float Damage) const;

	void FreezeTarget(AActor* Target, float Duration);
	void UnfreezeTarget(TWeakObjectPtr<AActor> Target);

	void StartBurningDoT(AActor* Target, float ElementalMastery);
	void StartElectroChargedTicks(AActor* Target, float ElementalMastery);
	void StartBloomCore(AActor* Target, float ElementalMastery);
	void ApplyOverloadKnockback(AActor* Center, float Radius, float Force) const;
	void ApplySwirlSpread(AActor* Origin, EStickmanElement SpreadElement, float ElementalMastery);

	TMap<TWeakObjectPtr<AActor>, TArray<FActiveElement>> ActiveElementsMap;
	TMap<TWeakObjectPtr<AActor>, FStickmanReactionState> ReactionStateMap;

	// Chain runtime state.
	int32 ReactionChainCount = 0;
	double LastReactionTime = -999.0;
	TSet<uint8> ElementsConsumedThisChain;

	IConsoleCommand* ShowReactionLogCommand = nullptr;
	IConsoleCommand* DisplayElementalGaugeCommand = nullptr;
	bool bLoggingEnabled = true;
	bool bDisplayGaugeDebug = false;

	void ToggleReactionLog();
	void ToggleGaugeDisplay();

public:
	bool IsReactionLoggingEnabled() const { return bLoggingEnabled; }
	bool IsGaugeDebugDisplayEnabled() const { return bDisplayGaugeDebug; }
};
