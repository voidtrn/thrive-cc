#include "Combat/DamageCalculator.h"
#include "Character/CharacterBase.h"
#include "System/OpenWorldPlayerController.h"
#include "System/ResonanceComponent.h"

float UDamageCalculator::CalculateDamage(
	const ACharacterBase* Attacker,
	const ACharacterBase* Victim,
	float SkillMultiplier,
	float FlatDamage,
	EElement Element,
	float ReactionMultiplier,
	float FlatReactionBonus,
	bool& bOutCrit)
{
	if (!Attacker || !Victim)
	{
		bOutCrit = false;
		return 0.f;
	}

	const float Base = Attacker->ATK * SkillMultiplier + FlatDamage + FlatReactionBonus;

	// DMGBonus% per elemen (physical/elemental terpisah, di-set progression + goblet).
	const float DmgBonus = 1.f + Attacker->GetDMGBonus(Element);

	// Shattering Ice resonance (2 Cryo, RESONANCE_SYSTEM.md): +crit rate vs
	// musuh frozen. Query ada di UResonanceComponent sejak awal tapi gak
	// pernah dibaca di mana pun — 0 dampak gameplay walau resonance-nya
	// "aktif". Attacker non-player (enemy attacking enemy — gak ada di
	// gameplay sekarang, tapi AEnemyBase juga ACharacterBase) gak punya
	// AOpenWorldPlayerController → Cast gagal ke nullptr, no-op aman.
	float ResonanceCritBonus = 0.f;
	if (Victim->IsFrozen())
	{
		if (const AOpenWorldPlayerController* PC = Cast<AOpenWorldPlayerController>(Attacker->GetController()))
		{
			if (const UResonanceComponent* Resonance = PC->GetResonance())
			{
				ResonanceCritBonus = Resonance->GetCritRateVsFrozenBonus();
			}
		}
	}

	bOutCrit = FMath::FRand() < EffectiveCritRate(Attacker->CritRate, Victim->IsFrozen(), ResonanceCritBonus);
	const float CritMult = bOutCrit ? (1.f + Attacker->CritDMG) : 1.f;

	const float Def = DefReduction(Attacker->Level, Victim->Level);
	const float Res = ResMultiplier(Victim->GetResistance(Element));

	return Base * DmgBonus * CritMult * ReactionMultiplier * Def * Res;
}

float UDamageCalculator::DefReduction(int32 AttackerLevel, int32 VictimLevel)
{
	const float A = AttackerLevel + 100.f;
	const float V = VictimLevel + 100.f;
	return A / (V + A);
}

float UDamageCalculator::ResMultiplier(float Resistance)
{
	if (Resistance < 0.f)
	{
		return 1.f - Resistance / 4.f;
	}
	return 1.f - Resistance / 2.f;
}

float UDamageCalculator::AmpEmBonus(float ElementalMastery)
{
	return 2.78f * ElementalMastery / (ElementalMastery + 1400.f);
}

float UDamageCalculator::TransformativeEmBonus(float ElementalMastery)
{
	return 16.f * ElementalMastery / (ElementalMastery + 2000.f);
}

float UDamageCalculator::TransformativeBaseDamage(int32 Level, float ReactionCoefficient)
{
	// Aproksimasi linear kurva level Genshin — cukup untuk prototype, tuning via curve asset nanti.
	const float LevelMultiplier = 17.17f * Level;
	return LevelMultiplier * ReactionCoefficient;
}

float UDamageCalculator::EffectiveCritRate(float BaseCritRate, bool bVictimFrozen, float CritVsFrozenBonus)
{
	return bVictimFrozen ? BaseCritRate + CritVsFrozenBonus : BaseCritRate;
}
