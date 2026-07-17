// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "StyleSubsystem.generated.h"

/** The four switchable DMC-style combat stances. */
UENUM(BlueprintType)
enum class ECombatStyle : uint8
{
	Trickster,   // Movement: triple dash, air dash, teleport.
	Swordmaster, // Extended melee strings.
	Gunslinger,  // Enhanced ranged, charged shots.
	RoyalGuard   // Enhanced block, doubled parry window, counter damage up.
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnCombatStyleChanged, ECombatStyle, NewStyle);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnStyleLevelUp, ECombatStyle, Style, int32, NewLevel);

/**
 * DMC-inspired combat styles layered on top of the existing style-RANK system
 * (UComboMeterSubsystem owns the D→SS meter from attack variety). This subsystem owns which
 * *style stance* is active (D-pad switch, cancelable pose), per-style EXP/level (1-3+, using
 * a style = gains its EXP), and the per-style modifiers other systems read:
 *
 * - `GetStyleDamageMultiplier` / `GetStyleEnergyMultiplier` — funnel + energy gen scale by
 *   style (and by the combo rank, so varied play compounds).
 * - RoyalGuard bumps the parry window: `UDefenseComponent` multiplies its window by
 *   `GetParryWindowMultiplier`. Trickster grants extra air dashes: the movement code queries
 *   `GetExtraAirDashes`. Swordmaster/Gunslinger unlock extended strings / charged shots the
 *   attack abilities gate on `GetStyleLevel`.
 * - Style Lv3 signature moves (Trick Up/Down, Drive/Overdrive, Rain Storm, Royal Release) are
 *   abilities gated on `IsSignatureUnlocked` — granted when the style hits level 3.
 */
UCLASS()
class STICKMANIMPACT_API UStyleSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Style")
	void SetStyle(ECombatStyle NewStyle);

	UFUNCTION(BlueprintPure, Category = "Style")
	ECombatStyle GetStyle() const { return ActiveStyle; }

	// Call when the player performs a varied action in a style — grants style EXP.
	UFUNCTION(BlueprintCallable, Category = "Style")
	void AddStyleExp(int32 Amount);

	UFUNCTION(BlueprintPure, Category = "Style")
	int32 GetStyleLevel(ECombatStyle Style) const;

	UFUNCTION(BlueprintPure, Category = "Style")
	bool IsSignatureUnlocked(ECombatStyle Style) const { return GetStyleLevel(Style) >= 3; }

	// --- Modifiers other systems read (active style) --------------------------------------

	UFUNCTION(BlueprintPure, Category = "Style")
	float GetStyleDamageMultiplier() const;

	UFUNCTION(BlueprintPure, Category = "Style")
	float GetStyleEnergyMultiplier() const;

	// RoyalGuard doubles the parry window (1x otherwise).
	UFUNCTION(BlueprintPure, Category = "Style")
	float GetParryWindowMultiplier() const { return ActiveStyle == ECombatStyle::RoyalGuard ? 2.f : 1.f; }

	// Trickster grants +1 air dash per level (0 otherwise).
	UFUNCTION(BlueprintPure, Category = "Style")
	int32 GetExtraAirDashes() const;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Style")
	TArray<int32> ExpPerLevel = { 100, 250, 500, 900 };

	UPROPERTY(BlueprintAssignable, Category = "Style")
	FOnCombatStyleChanged OnCombatStyleChanged;

	UPROPERTY(BlueprintAssignable, Category = "Style")
	FOnStyleLevelUp OnStyleLevelUp;

	// Save hooks (not yet in the binary format — see README).
	void ExportSaveState(ECombatStyle& OutStyle, TMap<ECombatStyle, int32>& OutExp) const { OutStyle = ActiveStyle; OutExp = StyleExp; }
	void ImportSaveState(ECombatStyle InStyle, const TMap<ECombatStyle, int32>& InExp) { ActiveStyle = InStyle; StyleExp = InExp; }

private:
	int32 LevelForExp(int32 Exp) const;

	ECombatStyle ActiveStyle = ECombatStyle::Swordmaster;
	TMap<ECombatStyle, int32> StyleExp;
};
