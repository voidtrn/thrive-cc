#pragma once

#include "CoreMinimal.h"
#include "Combat/CombatTypes.h"
#include "DamageCalculator.generated.h"

class ACharacterBase;

/**
 * Formula damage terpusat:
 * Damage = (ATK * SkillMult + Flat) * (1+DMGBonus) * CritMult
 *          * ReactionMult * DEFReduction * RESMultiplier
 */
UCLASS()
class MYGAME_API UDamageCalculator : public UBlueprintFunctionLibrary
{
	GENERATED_BODY()

public:
	/** Hitung damage lengkap. bOutCrit = hasil roll crit. */
	UFUNCTION(BlueprintCallable, Category = "Combat|Damage")
	static float CalculateDamage(
		const ACharacterBase* Attacker,
		const ACharacterBase* Victim,
		float SkillMultiplier,
		float FlatDamage,
		EElement Element,
		float ReactionMultiplier,
		float FlatReactionBonus,
		bool& bOutCrit);

	/** DEFReduction = (CharLvl+100) / ((EnemyLvl+100) + (CharLvl+100)) */
	static float DefReduction(int32 AttackerLevel, int32 VictimLevel);

	/** RES >= 0: 1 - RES/2. RES < 0: 1 - RES/4. */
	static float ResMultiplier(float Resistance);

	/** Bonus amp reaction dari Elemental Mastery: 2.78 * EM / (EM + 1400). */
	static float AmpEmBonus(float ElementalMastery);

	/** Bonus transformative dari EM: 16 * EM / (EM + 2000). */
	static float TransformativeEmBonus(float ElementalMastery);

	/** Base damage transformative reaction by level (aproksimasi linear, tuning nanti). */
	static float TransformativeBaseDamage(int32 Level, float ReactionCoefficient);
};
