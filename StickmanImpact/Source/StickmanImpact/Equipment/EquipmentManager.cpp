// Copyright StickmanImpact Project.

#include "EquipmentManager.h"
#include "Combat/StickmanAttributeSet.h"
#include "Engine/DataTable.h"

UEquipmentManager::UEquipmentManager()
{
	PrimaryComponentTick.bCanEverTick = false;
}

void UEquipmentManager::EquipWeapon(const FWeaponData& Weapon)
{
	EquippedWeapon = Weapon;
	RecalculateTotals();
	OnEquipmentChanged.Broadcast();
}

void UEquipmentManager::UnequipWeapon()
{
	EquippedWeapon = FWeaponData();
	RecalculateTotals();
	OnEquipmentChanged.Broadcast();
}

void UEquipmentManager::EquipArtifact(const FArtifactData& Artifact)
{
	EquippedArtifacts.Add(Artifact.Slot, Artifact);
	RecalculateTotals();
	OnEquipmentChanged.Broadcast();
}

void UEquipmentManager::UnequipArtifact(EArtifactSlot Slot)
{
	EquippedArtifacts.Remove(Slot);
	RecalculateTotals();
	OnEquipmentChanged.Broadcast();
}

bool UEquipmentManager::GetEquippedArtifact(EArtifactSlot Slot, FArtifactData& OutArtifact) const
{
	if (const FArtifactData* Found = EquippedArtifacts.Find(Slot))
	{
		OutArtifact = *Found;
		return true;
	}
	return false;
}

void UEquipmentManager::RecalculateTotals()
{
	CachedTotals = CalculateTotalsWithOverride(nullptr, EArtifactSlot::Flower);
}

FEquipmentStatTotals UEquipmentManager::CalculateTotalsWithOverride(const FArtifactData* OverrideArtifact,
	EArtifactSlot OverrideSlot) const
{
	FEquipmentStatTotals Totals;

	// Weapon: BaseATK scales gently with level (no per-level DataTable — a flat formula is
	// enough for "weapon leveling" without needing 90 authored rows).
	const float LevelScale = 1.f + 0.02f * FMath::Max(EquippedWeapon.Level - 1, 0);
	Totals.FlatATK += EquippedWeapon.BaseATK * LevelScale * (1.f + EquippedWeapon.RefinementLevel * 0.05f);
	Totals.AddStat(EquippedWeapon.SubStatType, EquippedWeapon.SubStatValue);

	TMap<EArtifactSlot, FArtifactData> EffectiveArtifacts = EquippedArtifacts;
	if (OverrideArtifact)
	{
		EffectiveArtifacts.Add(OverrideSlot, *OverrideArtifact);
	}

	TMap<FName, int32> SetCounts;
	for (const auto& Pair : EffectiveArtifacts)
	{
		const FArtifactData& Artifact = Pair.Value;
		Totals.AddStat(Artifact.MainStat.Stat, Artifact.MainStat.Value);
		for (const FArtifactSubStat& SubStat : Artifact.SubStats)
		{
			Totals.AddStat(SubStat.Stat, SubStat.Value);
		}
		if (!Artifact.SetName.IsNone())
		{
			SetCounts.FindOrAdd(Artifact.SetName)++;
		}
	}

	ApplySetBonuses(Totals, SetCounts);
	return Totals;
}

void UEquipmentManager::ApplySetBonuses(FEquipmentStatTotals& Totals, const TMap<FName, int32>& SetCounts) const
{
	if (!ArtifactSetBonusTable)
	{
		return;
	}

	for (const auto& Pair : SetCounts)
	{
		const FArtifactSetBonus* SetBonus = ArtifactSetBonusTable->FindRow<FArtifactSetBonus>(Pair.Key, TEXT("ApplySetBonuses"));
		if (!SetBonus)
		{
			continue;
		}

		if (Pair.Value >= 2)
		{
			for (const FArtifactSubStat& Bonus : SetBonus->TwoPieceStatBonuses)
			{
				Totals.AddStat(Bonus.Stat, Bonus.Value);
			}
		}
		if (Pair.Value >= 4)
		{
			for (const FArtifactSubStat& Bonus : SetBonus->FourPieceStatBonuses)
			{
				Totals.AddStat(Bonus.Stat, Bonus.Value);
			}
			// FourPieceConditionalTag/Magnitude are intentionally not applied here — combat
			// code that can evaluate the condition (e.g. "target is Frozen") checks for the
			// tag itself via GetActiveSetBonusTags()-style lookup and applies the magnitude.
		}
	}
}

FEquipmentStatTotals UEquipmentManager::PreviewArtifactSwap(const FArtifactData& NewArtifact, EArtifactSlot Slot) const
{
	return CalculateTotalsWithOverride(&NewArtifact, Slot);
}

void UEquipmentManager::ApplyTotalsToAttributeSet(UStickmanAttributeSet* AttributeSet, float BaseAttack,
	float BaseDefense, float BaseHealth) const
{
	if (!AttributeSet)
	{
		return;
	}

	const float NewAttack = BaseAttack * (1.f + CachedTotals.PercentATK / 100.f) + CachedTotals.FlatATK;
	const float NewDefense = BaseDefense * (1.f + CachedTotals.PercentDEF / 100.f) + CachedTotals.FlatDEF;
	const float NewMaxHealth = BaseHealth * (1.f + CachedTotals.PercentHP / 100.f) + CachedTotals.FlatHP;

	AttributeSet->SetAttack(NewAttack);
	AttributeSet->SetDefense(NewDefense);
	AttributeSet->SetMaxHealth(NewMaxHealth);
	AttributeSet->SetElementalMastery(AttributeSet->GetElementalMastery() + CachedTotals.ElementalMastery);
	AttributeSet->SetEnergyRecharge(1.f + CachedTotals.EnergyRechargePercent / 100.f);
}

void UEquipmentManager::SaveEquipmentPreset(FName PresetName)
{
	FEquipmentPreset Preset;
	Preset.WeaponID = EquippedWeapon.WeaponID;
	for (const auto& Pair : EquippedArtifacts)
	{
		Preset.ArtifactIDsBySlot.Add(Pair.Key, Pair.Value.ArtifactID);
	}
	SavedPresets.Add(PresetName, Preset);
}

bool UEquipmentManager::GetEquipmentPreset(FName PresetName, FEquipmentPreset& OutPreset) const
{
	if (const FEquipmentPreset* Found = SavedPresets.Find(PresetName))
	{
		OutPreset = *Found;
		return true;
	}
	return false;
}

void UEquipmentManager::LevelUpWeapon(float EXPAmount)
{
	if (EXPAmount <= 0.f)
	{
		return;
	}

	EquippedWeapon.CurrentEXP += EXPAmount;
	while (EquippedWeapon.Level < 90 && EquippedWeapon.CurrentEXP >= 100.f * EquippedWeapon.Level * EquippedWeapon.Level)
	{
		EquippedWeapon.CurrentEXP -= 100.f * EquippedWeapon.Level * EquippedWeapon.Level;
		++EquippedWeapon.Level;
	}

	RecalculateTotals();
	OnEquipmentChanged.Broadcast();
}
