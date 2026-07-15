// Copyright StickmanImpact Project.

#include "StickmanEquipmentTypes.h"

void FEquipmentStatTotals::AddStat(EArtifactStat Stat, float Value)
{
	switch (Stat)
	{
		case EArtifactStat::HP: FlatHP += Value; break;
		case EArtifactStat::HPPercent: PercentHP += Value; break;
		case EArtifactStat::ATK: FlatATK += Value; break;
		case EArtifactStat::ATKPercent: PercentATK += Value; break;
		case EArtifactStat::DEF: FlatDEF += Value; break;
		case EArtifactStat::DEFPercent: PercentDEF += Value; break;
		case EArtifactStat::ElementalMastery: ElementalMastery += Value; break;
		case EArtifactStat::EnergyRecharge: EnergyRechargePercent += Value; break;
		case EArtifactStat::CRITRate: CritRatePercent += Value; break;
		case EArtifactStat::CRITDMG: CritDMGPercent += Value; break;
		case EArtifactStat::PhysicalDMG: PhysicalDMGPercent += Value; break;
		case EArtifactStat::ElementalDMG: ElementalDMGPercent += Value; break;
		case EArtifactStat::HealingBonus: HealingBonusPercent += Value; break;
		default: break;
	}
}
