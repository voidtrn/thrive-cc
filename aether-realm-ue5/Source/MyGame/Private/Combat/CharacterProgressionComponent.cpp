#include "Combat/CharacterProgressionComponent.h"
#include "Combat/BuffComponent.h"
#include "Character/CharacterBase.h"
#include "Engine/DataTable.h"
#include "MyGame.h"

UCharacterProgressionComponent::UCharacterProgressionComponent()
{
	PrimaryComponentTick.bCanEverTick = false;
}

void UCharacterProgressionComponent::BeginPlay()
{
	Super::BeginPlay();
	OwnerChar = Cast<ACharacterBase>(GetOwner());
	Recalculate();
}

float UCharacterProgressionComponent::LevelScale(int32 Level) const
{
	// lvl 1 = 1.0, naik linear ke ~8× di lvl 90
	return 1.f + (Level - 1) * StatPerLevelFactor;
}

float UCharacterProgressionComponent::GetTalentMultiplier(int32 TalentLevel) const
{
	// lvl 1 = 1.0, tiap level +10% skala damage (approx)
	return 1.f + (FMath::Clamp(TalentLevel, 1, 10) - 1) * 0.1f;
}

void UCharacterProgressionComponent::SetConstellation(int32 NewLevel)
{
	ConstellationLevel = FMath::Clamp(NewLevel, 0, 6);
	Recalculate();
}

void UCharacterProgressionComponent::AccumulateStat(
	EArtifactStat Stat, float Value, FDerivedStats& Flat, FDerivedStats& Percent) const
{
	switch (Stat)
	{
	case EArtifactStat::HP:               Flat.MaxHP += Value; break;
	case EArtifactStat::HPPercent:        Percent.MaxHP += Value; break;
	case EArtifactStat::ATK:              Flat.ATK += Value; break;
	case EArtifactStat::ATKPercent:       Percent.ATK += Value; break;
	case EArtifactStat::DEF:              Flat.DEF += Value; break;
	case EArtifactStat::DEFPercent:       Percent.DEF += Value; break;
	case EArtifactStat::ElementalMastery: Flat.ElementalMastery += Value; break;
	case EArtifactStat::EnergyRecharge:   CachedStats.EnergyRecharge += Value; break;
	case EArtifactStat::CritRate:         CachedStats.CritRate += Value; break;
	case EArtifactStat::CritDMG:          CachedStats.CritDMG += Value; break;
	case EArtifactStat::ElementalDMGBonus: CachedStats.ElementalDMGBonus += Value; break;
	case EArtifactStat::HealingBonus:     CachedStats.HealingBonus += Value; break;
	}
}

void UCharacterProgressionComponent::ApplySetBonuses(FDerivedStats& Flat, FDerivedStats& Percent)
{
	ActiveSetEffects.Reset();
	if (!ArtifactSetTable)
	{
		return;
	}

	// Hitung jumlah piece per SetId
	TMap<FName, int32> SetCounts;
	for (const FArtifactInstance& Art : EquippedArtifacts)
	{
		if (!Art.SetId.IsNone())
		{
			SetCounts.FindOrAdd(Art.SetId)++;
		}
	}

	for (const auto& Pair : SetCounts)
	{
		const FArtifactSetRow* Row = ArtifactSetTable->FindRow<FArtifactSetRow>(Pair.Key, TEXT("SetBonus"));
		if (!Row)
		{
			continue;
		}

		// 2-piece
		if (Pair.Value >= 2 && Row->TwoPieceBonus.Value != 0.f)
		{
			AccumulateStat(Row->TwoPieceBonus.Stat, Row->TwoPieceBonus.Value, Flat, Percent);
		}
		// 4-piece: stat + efek spesial
		if (Pair.Value >= 4)
		{
			if (Row->FourPieceStatBonus.Value != 0.f)
			{
				AccumulateStat(Row->FourPieceStatBonus.Stat, Row->FourPieceStatBonus.Value, Flat, Percent);
			}
			if (!Row->FourPieceEffectId.IsNone())
			{
				ActiveSetEffects.Add(Row->FourPieceEffectId);
			}
		}
	}
}

void UCharacterProgressionComponent::Recalculate()
{
	if (!OwnerChar)
	{
		OwnerChar = Cast<ACharacterBase>(GetOwner());
		if (!OwnerChar)
		{
			return;
		}
	}

	const float Scale = LevelScale(OwnerChar->Level);

	// Base karakter (skala level)
	const float BaseHP = BaseHPLevel1 * Scale;
	const float BaseCharATK = BaseATKLevel1 * Scale;
	const float BaseDEF = BaseDEFLevel1 * Scale;

	// Reset stat langsung-akumulasi (crit/ER/EM/dmg bonus/heal ditambah
	// via AccumulateStat -> CachedStats; jangan panggil dobel per sumber)
	CachedStats = FDerivedStats();

	// Penampung flat & persen HP/ATK/DEF dari semua sumber
	FDerivedStats Flat;    // nilai mentah (HP, ATK, DEF, EM)
	FDerivedStats Percent; // 0-1 (HP%, ATK%, DEF%)

	// --- Senjata: base ATK + substat (sekali) ---
	float WeaponBaseATK = 0.f;
	if (WeaponTable && !EquippedWeapon.WeaponId.IsNone())
	{
		if (const FWeaponDefRow* Def = WeaponTable->FindRow<FWeaponDefRow>(
			EquippedWeapon.WeaponId, TEXT("Progression")))
		{
			WeaponBaseATK = Def->BaseATKLevel1 + Def->ATKPerLevel * (EquippedWeapon.Level - 1);
			const float SubVal = Def->SubStatBase + Def->SubStatPerLevel * (EquippedWeapon.Level - 1);
			AccumulateStat(Def->SubStat, SubVal, Flat, Percent);
		}
	}

	// --- Artifact (5 slot): main stat + substat ---
	for (const FArtifactInstance& Art : EquippedArtifacts)
	{
		AccumulateStat(Art.MainStat, Art.MainStatValue, Flat, Percent);
		for (const FArtifactSubstat& Sub : Art.Substats)
		{
			AccumulateStat(Sub.Stat, Sub.Value, Flat, Percent);
		}
	}

	// --- Set bonus 2/4-piece ---
	ApplySetBonuses(Flat, Percent);

	// --- Resonance (party-wide, di-set ResonanceComponent) ---
	Percent.ATK += ResonanceATKPercent;
	Percent.MaxHP += ResonanceHPPercent;
	Flat.ElementalMastery += ResonanceEMFlat;

	// --- Gabung sesuai rumus Genshin ---
	CachedStats.MaxHP = BaseHP * (1.f + Percent.MaxHP) + Flat.MaxHP;
	CachedStats.ATK = (BaseCharATK + WeaponBaseATK) * (1.f + Percent.ATK) + Flat.ATK;
	CachedStats.DEF = BaseDEF * (1.f + Percent.DEF) + Flat.DEF;
	CachedStats.ElementalMastery += Flat.ElementalMastery;
	// CritRate/CritDMG/ER/DMGBonus/Heal sudah terakumulasi langsung di CachedStats;
	// tambahkan baseline:
	CachedStats.CritRate += 0.05f;   // 5% base
	CachedStats.CritDMG += 0.5f;     // 50% base
	CachedStats.EnergyRecharge += 1.f; // 100% base

	// --- Tulis ke CharacterBase ---
	OwnerChar->MaxHP = CachedStats.MaxHP;
	OwnerChar->ATK = CachedStats.ATK;
	OwnerChar->DEF = CachedStats.DEF;
	OwnerChar->ElementalMastery = CachedStats.ElementalMastery;
	OwnerChar->CritRate = CachedStats.CritRate;
	OwnerChar->CritDMG = CachedStats.CritDMG;
	OwnerChar->EnergyRecharge = CachedStats.EnergyRecharge;
	OwnerChar->ElementalDMGBonus = CachedStats.ElementalDMGBonus;
	OwnerChar->HealingBonus = CachedStats.HealingBonus;

	// Buff aktif ter-hapus oleh penulisan stat di atas — pasang ulang
	// (kalau tidak, stat jatuh di bawah base saat buff expire)
	if (UBuffComponent* Buff = OwnerChar->FindComponentByClass<UBuffComponent>())
	{
		Buff->ReapplyActiveBuffs();
	}

	// Jaga CurrentHP tidak melebihi MaxHP baru
	OwnerChar->CurrentHP = FMath::Min(OwnerChar->CurrentHP, OwnerChar->MaxHP);

	OnStatsRecalculated.Broadcast(CachedStats);
	UE_LOG(LogAetherRealm, Verbose, TEXT("Stats recalculated: HP %.0f ATK %.0f DEF %.0f"),
		CachedStats.MaxHP, CachedStats.ATK, CachedStats.DEF);
}
