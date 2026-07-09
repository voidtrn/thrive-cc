#include "System/LevelingComponent.h"
#include "System/OpenWorldGameInstance.h"
#include "System/WeaponTypes.h"
#include "Combat/CharacterProgressionComponent.h"
#include "Character/CharacterBase.h"
#include "GameFramework/PlayerController.h"
#include "Engine/DataTable.h"
#include "MyGame.h"

UOpenWorldGameInstance* ULevelingComponent::GetGI() const
{
	return GetWorld() ? GetWorld()->GetGameInstance<UOpenWorldGameInstance>() : nullptr;
}

// ---------- Static curves & caps ----------

int32 ULevelingComponent::LevelCapForAscension(int32 AscensionPhase)
{
	static const int32 Caps[] = { 20, 40, 50, 60, 70, 80, 90 };
	return Caps[FMath::Clamp(AscensionPhase, 0, 6)];
}

int32 ULevelingComponent::ArtifactMaxLevel(EItemRarity Rarity)
{
	switch (Rarity)
	{
	case EItemRarity::FiveStar:  return 20;
	case EItemRarity::FourStar:  return 16;
	case EItemRarity::ThreeStar: return 12;
	case EItemRarity::TwoStar:   return 8;
	default:                     return 4;
	}
}

int32 ULevelingComponent::CharacterExpToNextLevel(int32 CurrentLevel)
{
	// Kurva naik: makin tinggi level makin mahal (approx, tuning via curve nanti).
	return 1000 + CurrentLevel * CurrentLevel * 120;
}

int32 ULevelingComponent::WeaponExpToNextLevel(int32 CurrentLevel)
{
	return 600 + CurrentLevel * CurrentLevel * 80;
}

int32 ULevelingComponent::ArtifactExpToNextLevel(int32 CurrentLevel, EItemRarity Rarity)
{
	const float RarityFactor = (Rarity == EItemRarity::FiveStar) ? 1.f
		: (Rarity == EItemRarity::FourStar) ? 0.6f : 0.35f;
	return FMath::CeilToInt((2500.f + CurrentLevel * 1000.f) * RarityFactor);
}

int32 ULevelingComponent::ArtifactMaxSubstats(EItemRarity Rarity)
{
	switch (Rarity)
	{
	case EItemRarity::FiveStar:
	case EItemRarity::FourStar:  return 4;
	case EItemRarity::ThreeStar: return 3;
	case EItemRarity::TwoStar:   return 2;
	default:                     return 1;
	}
}

float ULevelingComponent::RollSubstatValue(EArtifactStat Stat)
{
	// Nilai satu-roll representatif (persen dalam 0-1). Randomisasi ±10%.
	float Base = 0.f;
	switch (Stat)
	{
	case EArtifactStat::HP:                Base = 200.f;  break;
	case EArtifactStat::ATK:               Base = 14.f;   break;
	case EArtifactStat::DEF:               Base = 16.f;   break;
	case EArtifactStat::HPPercent:         Base = 0.041f; break;
	case EArtifactStat::ATKPercent:        Base = 0.041f; break;
	case EArtifactStat::DEFPercent:        Base = 0.051f; break;
	case EArtifactStat::ElementalMastery:  Base = 16.f;   break;
	case EArtifactStat::EnergyRecharge:    Base = 0.045f; break;
	case EArtifactStat::CritRate:          Base = 0.027f; break;
	case EArtifactStat::CritDMG:           Base = 0.054f; break;
	default:                               Base = 0.04f;  break;
	}
	return Base * FMath::FRandRange(0.9f, 1.1f);
}

// ---------- Cost payment ----------

ELevelingResult ULevelingComponent::TryPayCost(int32 MoraCost, const TArray<FMaterialCost>& Materials)
{
	UOpenWorldGameInstance* GI = GetGI();
	if (!GI)
	{
		return ELevelingResult::InvalidTarget;
	}
	if (GI->Mora < MoraCost)
	{
		return ELevelingResult::NotEnoughMora;
	}
	for (const FMaterialCost& M : Materials)
	{
		if (!GI->HasItem(M.ItemId, M.Count))
		{
			return ELevelingResult::NotEnoughMaterials;
		}
	}
	// Semua cukup — konsumsi atomik.
	GI->Mora -= MoraCost;
	for (const FMaterialCost& M : Materials)
	{
		GI->RemoveItem(M.ItemId, M.Count);
	}
	return ELevelingResult::Success;
}

// ---------- Shared EXP-item level-up ----------

ELevelingResult ULevelingComponent::LevelUpByExpItems(int32& OutLevel, int32 CurrentAscension,
	int32 TargetLevel, FName ExpItemId, int32 ExpPerItem, bool bWeapon)
{
	UOpenWorldGameInstance* GI = GetGI();
	if (!GI || ExpPerItem <= 0)
	{
		return ELevelingResult::InvalidTarget;
	}

	const int32 Cap = LevelCapForAscension(CurrentAscension);
	TargetLevel = FMath::Min(TargetLevel, Cap);
	if (TargetLevel <= OutLevel)
	{
		return (OutLevel >= Cap) ? ELevelingResult::MaxLevelReached : ELevelingResult::InvalidTarget;
	}

	int64 TotalExp = 0;
	for (int32 L = OutLevel; L < TargetLevel; ++L)
	{
		TotalExp += bWeapon ? WeaponExpToNextLevel(L) : CharacterExpToNextLevel(L);
	}

	const int32 ItemsNeeded = FMath::CeilToInt(static_cast<double>(TotalExp) / ExpPerItem);
	const int32 MoraCost = FMath::CeilToInt(TotalExp * MoraPerExp);

	if (GI->Mora < MoraCost)
	{
		return ELevelingResult::NotEnoughMora;
	}
	if (!GI->HasItem(ExpItemId, ItemsNeeded))
	{
		return ELevelingResult::NotEnoughMaterials;
	}

	GI->RemoveItem(ExpItemId, ItemsNeeded);
	GI->Mora -= MoraCost;
	OutLevel = TargetLevel;
	return ELevelingResult::Success;
}

// ---------- Character ----------

ELevelingResult ULevelingComponent::LevelUpCharacter(ACharacterBase* Character, int32 TargetLevel)
{
	if (!Character)
	{
		return ELevelingResult::InvalidTarget;
	}
	const ELevelingResult R = LevelUpByExpItems(Character->Level, Character->Ascension,
		TargetLevel, CharacterExpItemId, CharacterExpPerItem, /*bWeapon=*/false);
	if (R == ELevelingResult::Success)
	{
		if (UCharacterProgressionComponent* Prog = Character->FindComponentByClass<UCharacterProgressionComponent>())
		{
			Prog->Recalculate();
		}
		PersistCharacterState(Character);
		OnCharacterLeveled.Broadcast(Character, Character->Level);
	}
	return R;
}

ELevelingResult ULevelingComponent::AscendCharacter(ACharacterBase* Character)
{
	if (!Character)
	{
		return ELevelingResult::InvalidTarget;
	}
	if (Character->Ascension >= 6)
	{
		return ELevelingResult::MaxLevelReached;
	}
	if (Character->Level < LevelCapForAscension(Character->Ascension))
	{
		return ELevelingResult::LevelRequirementNotMet;
	}
	if (!CharacterAscensionTable)
	{
		return ELevelingResult::MissingCostData;
	}

	const FName RowKey = *FString::Printf(TEXT("%s_%d"),
		*Character->CharacterID.ToString(), Character->Ascension);
	const FAscensionCostRow* Row = CharacterAscensionTable->FindRow<FAscensionCostRow>(RowKey, TEXT("Ascend"));
	if (!Row)
	{
		return ELevelingResult::MissingCostData;
	}

	const ELevelingResult Pay = TryPayCost(Row->MoraCost, Row->Materials);
	if (Pay != ELevelingResult::Success)
	{
		return Pay;
	}

	++Character->Ascension;
	if (UCharacterProgressionComponent* Prog = Character->FindComponentByClass<UCharacterProgressionComponent>())
	{
		Prog->Recalculate();
	}
	PersistCharacterState(Character);
	OnCharacterAscended.Broadcast(Character, Character->Ascension);
	return ELevelingResult::Success;
}

ELevelingResult ULevelingComponent::LevelUpTalent(FName CharacterId, ETalentSource Talent)
{
	UOpenWorldGameInstance* GI = GetGI();
	if (!GI || CharacterId.IsNone())
	{
		return ELevelingResult::InvalidTarget;
	}

	FTalentLevels& Talents = GI->CharacterTalents.FindOrAdd(CharacterId);
	int32* LevelPtr = nullptr;
	const TCHAR* TalentName = TEXT("");
	switch (Talent)
	{
	case ETalentSource::NormalAttack:   LevelPtr = &Talents.NormalAttack;   TalentName = TEXT("NormalAttack");   break;
	case ETalentSource::ElementalSkill: LevelPtr = &Talents.ElementalSkill; TalentName = TEXT("ElementalSkill"); break;
	case ETalentSource::ElementalBurst: LevelPtr = &Talents.ElementalBurst; TalentName = TEXT("ElementalBurst"); break;
	default: return ELevelingResult::InvalidTarget;
	}

	if (*LevelPtr >= 10)
	{
		return ELevelingResult::MaxLevelReached;
	}
	if (!TalentCostTable)
	{
		return ELevelingResult::MissingCostData;
	}

	const int32 Target = *LevelPtr + 1;
	const FName RowKey = *FString::Printf(TEXT("%s_%s_%d"), *CharacterId.ToString(), TalentName, Target);
	const FTalentCostRow* Row = TalentCostTable->FindRow<FTalentCostRow>(RowKey, TEXT("Talent"));
	if (!Row)
	{
		return ELevelingResult::MissingCostData;
	}

	const ELevelingResult Pay = TryPayCost(Row->MoraCost, Row->Materials);
	if (Pay != ELevelingResult::Success)
	{
		return Pay;
	}

	*LevelPtr = Target;

	// Sinkron ke progression karakter aktif (kalau CharacterId sedang di-field).
	if (const APlayerController* PC = Cast<APlayerController>(GetOwner()))
	{
		if (const ACharacterBase* Pawn = Cast<ACharacterBase>(PC->GetPawn()))
		{
			if (Pawn->CharacterID == CharacterId)
			{
				if (UCharacterProgressionComponent* Prog = Pawn->FindComponentByClass<UCharacterProgressionComponent>())
				{
					Prog->Talents = Talents;
				}
			}
		}
	}

	OnTalentLeveled.Broadcast(CharacterId, Talent, Target);
	return ELevelingResult::Success;
}

// ---------- Weapon ----------

ELevelingResult ULevelingComponent::LevelUpWeapon(FGuid WeaponInstanceId, int32 TargetLevel)
{
	UOpenWorldGameInstance* GI = GetGI();
	if (!GI)
	{
		return ELevelingResult::InvalidTarget;
	}
	FWeaponInstance* W = GI->OwnedWeapons.FindByPredicate(
		[&](const FWeaponInstance& I) { return I.InstanceId == WeaponInstanceId; });
	if (!W)
	{
		return ELevelingResult::InvalidTarget;
	}

	const ELevelingResult R = LevelUpByExpItems(W->Level, W->Ascension, TargetLevel,
		WeaponExpItemId, WeaponExpPerItem, /*bWeapon=*/true);
	if (R == ELevelingResult::Success)
	{
		RecalcCharacterIfActive(W->EquippedCharacter);
	}
	return R;
}

ELevelingResult ULevelingComponent::AscendWeapon(FGuid WeaponInstanceId)
{
	UOpenWorldGameInstance* GI = GetGI();
	if (!GI)
	{
		return ELevelingResult::InvalidTarget;
	}
	FWeaponInstance* W = GI->OwnedWeapons.FindByPredicate(
		[&](const FWeaponInstance& I) { return I.InstanceId == WeaponInstanceId; });
	if (!W)
	{
		return ELevelingResult::InvalidTarget;
	}
	if (W->Ascension >= 6)
	{
		return ELevelingResult::MaxLevelReached;
	}
	if (W->Level < LevelCapForAscension(W->Ascension))
	{
		return ELevelingResult::LevelRequirementNotMet;
	}
	if (!WeaponAscensionTable)
	{
		return ELevelingResult::MissingCostData;
	}

	const FName RowKey = *FString::Printf(TEXT("%s_%d"), *W->WeaponId.ToString(), W->Ascension);
	const FAscensionCostRow* Row = WeaponAscensionTable->FindRow<FAscensionCostRow>(RowKey, TEXT("WeaponAscend"));
	if (!Row)
	{
		return ELevelingResult::MissingCostData;
	}

	const ELevelingResult Pay = TryPayCost(Row->MoraCost, Row->Materials);
	if (Pay != ELevelingResult::Success)
	{
		return Pay;
	}

	++W->Ascension;
	RecalcCharacterIfActive(W->EquippedCharacter);
	return ELevelingResult::Success;
}

float ULevelingComponent::GetPassiveMagnitude(float BaseValue, float ValuePerRefine, int32 Refinement)
{
	return BaseValue + ValuePerRefine * (FMath::Clamp(Refinement, 1, 5) - 1);
}

ELevelingResult ULevelingComponent::RefineWeapon(FGuid TargetInstanceId, FGuid FodderInstanceId)
{
	UOpenWorldGameInstance* GI = GetGI();
	if (!GI || TargetInstanceId == FodderInstanceId)
	{
		return ELevelingResult::InvalidTarget;
	}

	FWeaponInstance* Target = GI->OwnedWeapons.FindByPredicate(
		[&](const FWeaponInstance& W) { return W.InstanceId == TargetInstanceId; });
	const FWeaponInstance* Fodder = GI->OwnedWeapons.FindByPredicate(
		[&](const FWeaponInstance& W) { return W.InstanceId == FodderInstanceId; });

	if (!Target || !Fodder)
	{
		return ELevelingResult::InvalidTarget;
	}
	if (Target->WeaponId != Fodder->WeaponId || !Fodder->EquippedCharacter.IsNone())
	{
		// Bukan duplikat senjata sama / fodder sedang di-equip karakter
		return ELevelingResult::InvalidTarget;
	}
	if (Target->Refinement >= 5)
	{
		return ELevelingResult::MaxLevelReached;
	}

	// Refine dulu, simpan info yang dibutuhkan, BARU remove — RemoveAll
	// meng-invalidate kedua pointer.
	++Target->Refinement;
	const int32 NewRefinement = Target->Refinement;
	const FName EquippedChar = Target->EquippedCharacter;
	GI->OwnedWeapons.RemoveAll(
		[&](const FWeaponInstance& W) { return W.InstanceId == FodderInstanceId; });

	RecalcCharacterIfActive(EquippedChar);
	UE_LOG(LogAetherRealm, Log, TEXT("Weapon refined to R%d (fodder consumed)"), NewRefinement);
	return ELevelingResult::Success;
}

// ---------- Artifact ----------

ELevelingResult ULevelingComponent::EnhanceArtifact(FGuid ArtifactInstanceId, int32 ExpFromFodder)
{
	UOpenWorldGameInstance* GI = GetGI();
	if (!GI || ExpFromFodder <= 0)
	{
		return ELevelingResult::InvalidTarget;
	}
	FArtifactInstance* A = GI->OwnedArtifacts.FindByPredicate(
		[&](const FArtifactInstance& I) { return I.InstanceId == ArtifactInstanceId; });
	if (!A)
	{
		return ELevelingResult::InvalidTarget;
	}

	const int32 MaxLvl = ArtifactMaxLevel(A->Rarity);
	if (A->Level >= MaxLvl)
	{
		return ELevelingResult::MaxLevelReached;
	}

	const int32 MoraCost = FMath::CeilToInt(ExpFromFodder * MoraPerExp);
	if (GI->Mora < MoraCost)
	{
		return ELevelingResult::NotEnoughMora;
	}
	GI->Mora -= MoraCost;
	A->Experience += ExpFromFodder;

	while (A->Level < MaxLvl)
	{
		const int32 Need = ArtifactExpToNextLevel(A->Level, A->Rarity);
		if (A->Experience < Need)
		{
			break;
		}
		A->Experience -= Need;
		++A->Level;

		// Milestone tiap +4: substat baru atau upgrade acak.
		if (A->Level % 4 == 0)
		{
			RollArtifactSubstat(*A);
		}
	}
	if (A->Level >= MaxLvl)
	{
		A->Experience = 0; // EXP lebih di level max hangus (Genshin behavior)
	}

	RecalcCharacterIfActive(A->EquippedCharacter);
	OnArtifactEnhanced.Broadcast(A->InstanceId, A->Level);
	return ELevelingResult::Success;
}

void ULevelingComponent::RollArtifactSubstat(FArtifactInstance& Artifact) const
{
	const int32 MaxSubs = ArtifactMaxSubstats(Artifact.Rarity);
	if (Artifact.Substats.Num() < MaxSubs)
	{
		// Tambah substat baru dari pool (bukan main stat, bukan yang sudah ada).
		static const EArtifactStat Pool[] = {
			EArtifactStat::HP, EArtifactStat::HPPercent,
			EArtifactStat::ATK, EArtifactStat::ATKPercent,
			EArtifactStat::DEF, EArtifactStat::DEFPercent,
			EArtifactStat::ElementalMastery, EArtifactStat::EnergyRecharge,
			EArtifactStat::CritRate, EArtifactStat::CritDMG };

		TArray<EArtifactStat> Candidates;
		for (EArtifactStat S : Pool)
		{
			if (S == Artifact.MainStat)
			{
				continue;
			}
			const bool bExists = Artifact.Substats.ContainsByPredicate(
				[S](const FArtifactSubstat& Sub) { return Sub.Stat == S; });
			if (!bExists)
			{
				Candidates.Add(S);
			}
		}
		if (Candidates.Num() > 0)
		{
			const EArtifactStat Chosen = Candidates[FMath::RandRange(0, Candidates.Num() - 1)];
			FArtifactSubstat NewSub;
			NewSub.Stat = Chosen;
			NewSub.Value = RollSubstatValue(Chosen);
			Artifact.Substats.Add(NewSub);
		}
	}
	else if (Artifact.Substats.Num() > 0)
	{
		// Upgrade satu substat acak.
		const int32 Idx = FMath::RandRange(0, Artifact.Substats.Num() - 1);
		Artifact.Substats[Idx].Value += RollSubstatValue(Artifact.Substats[Idx].Stat);
	}
}

// ---------- Helpers ----------

void ULevelingComponent::RecalcCharacterIfActive(FName CharacterId) const
{
	if (CharacterId.IsNone())
	{
		return;
	}
	const APlayerController* PC = Cast<APlayerController>(GetOwner());
	if (!PC)
	{
		return;
	}
	ACharacterBase* Pawn = Cast<ACharacterBase>(PC->GetPawn());
	if (Pawn && Pawn->CharacterID == CharacterId)
	{
		if (UCharacterProgressionComponent* Prog = Pawn->FindComponentByClass<UCharacterProgressionComponent>())
		{
			Prog->Recalculate();
		}
	}
}

void ULevelingComponent::PersistCharacterState(const ACharacterBase* Character) const
{
	UOpenWorldGameInstance* GI = GetGI();
	if (!GI || !Character)
	{
		return;
	}
	FCharacterSaveData* Data = GI->PartyCharacterData.FindByPredicate(
		[&](const FCharacterSaveData& D) { return D.CharacterId == Character->CharacterID; });
	if (Data)
	{
		Data->Level = Character->Level;
		Data->Ascension = Character->Ascension;
	}
}
