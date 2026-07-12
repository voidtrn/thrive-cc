// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "GameplayTagContainer.h"
#include "ComboMeterSubsystem.generated.h"

UENUM(BlueprintType)
enum class EComboRank : uint8
{
	None,
	D,
	C,
	B,
	A,
	S,
	SS
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnComboRankChanged, EComboRank, NewRank, int32, StylePoints);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnComboDropped);

/**
 * Fighting-game combo meter: hits build style points (variety-weighted, not raw count — a
 * fresh skill tag is worth triple a repeated one), rank D→SS from style points, +5% damage
 * per rank (read by ApplyDamageToTarget via GetRankDamageMultiplier), 3s no-hit decay.
 * Character aura intensity: bind a Niagara float to OnComboRankChanged in the WBP/VFX side.
 *
 * Team combo: listens to UPartyManager::OnPartySwitched — switching mid-combo keeps the
 * combo alive, fires a tag-attack window, and (if the incoming character's element differs)
 * arms a one-shot elemental tag damage bonus.
 */
UCLASS()
class STICKMANIMPACT_API UComboMeterSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Combo")
	float ComboDecaySeconds = 3.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Combo")
	float DamageBonusPerRank = 0.05f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Combo")
	float ElementalTagBonus = 0.25f;

	// Style thresholds for D/C/B/A/S/SS.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Combo")
	TArray<int32> RankThresholds = { 3, 8, 15, 25, 40, 60 };

	// Called on every player hit (from ApplyDamageToTarget) with the skill that dealt it.
	UFUNCTION(BlueprintCallable, Category = "Combo")
	void RegisterHit(FGameplayTag SkillTag);

	UFUNCTION(BlueprintPure, Category = "Combo")
	EComboRank GetRank() const { return CurrentRank; }

	UFUNCTION(BlueprintPure, Category = "Combo")
	int32 GetHitCount() const { return HitCount; }

	UFUNCTION(BlueprintPure, Category = "Combo")
	int32 GetStylePoints() const { return StylePoints; }

	// 1.0 + 5% per rank + one-shot elemental tag bonus (consumed on read).
	UFUNCTION(BlueprintCallable, Category = "Combo")
	float ConsumeDamageMultiplier();

	UPROPERTY(BlueprintAssignable, Category = "Combo")
	FOnComboRankChanged OnComboRankChanged;

	UPROPERTY(BlueprintAssignable, Category = "Combo")
	FOnComboDropped OnComboDropped;

private:
	void DecayCombo();
	void RecalculateRank();

	UFUNCTION()
	void HandlePartySwitched(int32 NewIndex, int32 OldIndex);

	int32 HitCount = 0;
	int32 StylePoints = 0;
	EComboRank CurrentRank = EComboRank::None;
	TSet<FString> SkillsUsedThisCombo;
	bool bElementalTagBonusArmed = false;
	FTimerHandle DecayTimerHandle;
};
