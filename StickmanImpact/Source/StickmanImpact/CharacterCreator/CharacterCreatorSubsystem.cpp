// Copyright StickmanImpact Project.

#include "CharacterCreatorSubsystem.h"
#include "Progression/CharacterBondSubsystem.h"
#include "JsonObjectConverter.h"

void UCharacterCreatorSubsystem::SetActivePreset(const FCustomCharacterPreset& Preset)
{
	ActivePreset = Preset;
	OnCustomCharacterChanged.Broadcast();
}

void UCharacterCreatorSubsystem::SavePresetToSlot(int32 Slot)
{
	PresetSlots.Add(Slot, ActivePreset);
}

bool UCharacterCreatorSubsystem::LoadPresetFromSlot(int32 Slot)
{
	if (const FCustomCharacterPreset* Preset = PresetSlots.Find(Slot))
	{
		SetActivePreset(*Preset);
		return true;
	}
	return false;
}

// ---------------------------------------------------------------- share codes ---------

FString UCharacterCreatorSubsystem::ExportPresetCode() const
{
	FString Json;
	if (!FJsonObjectConverter::UStructToJsonObjectString(ActivePreset, Json))
	{
		return FString();
	}
	// Hex-encode the JSON so the code is copy-paste safe (no quotes/braces).
	return FString::FromHexBlob(reinterpret_cast<const uint8*>(TCHAR_TO_UTF8(*Json)),
		FCStringAnsi::Strlen(TCHAR_TO_UTF8(*Json)));
}

bool UCharacterCreatorSubsystem::ImportPresetCode(const FString& Code)
{
	TArray<uint8> Bytes;
	Bytes.SetNumUninitialized(Code.Len() / 2);
	if (!FString::ToHexBlob(Code, Bytes.GetData(), Bytes.Num()))
	{
		return false;
	}
	Bytes.Add(0); // null-terminate
	const FString Json = UTF8_TO_TCHAR(reinterpret_cast<const char*>(Bytes.GetData()));

	FCustomCharacterPreset Preset;
	if (!FJsonObjectConverter::JsonObjectStringToUStruct(Json, &Preset))
	{
		return false;
	}
	SetActivePreset(Preset);
	return true;
}

// ---------------------------------------------------------------- element -------------

bool UCharacterCreatorSubsystem::SwapTravelerElement(EStickmanElement NewElement)
{
	const UWorld* World = GetGameInstance()->GetWorld();
	if (!World || NewElement == EStickmanElement::None)
	{
		return false;
	}
	if (World->GetTimeSeconds() - LastElementSwapTime < ElementSwapCooldown)
	{
		return false;
	}

	LastElementSwapTime = World->GetTimeSeconds();
	ActivePreset.StartingElement = NewElement;
	OnTravelerElementSwapped.Broadcast(NewElement);
	OnCustomCharacterChanged.Broadcast();
	return true;
}

bool UCharacterCreatorSubsystem::SetSecondElement(EStickmanElement Element)
{
	if (!bDualElementUnlocked)
	{
		return false;
	}
	SecondElement = Element;
	OnCustomCharacterChanged.Broadcast();
	return true;
}

// ---------------------------------------------------------------- borrowed skills -----

bool UCharacterCreatorSubsystem::BorrowSkill(const FString& FromCharacterID, FGameplayTag SkillTag)
{
	if (!SkillTag.IsValid() || BorrowedSkills.Contains(SkillTag) || BorrowedSkills.Num() >= MaxBorrowedSkills)
	{
		return false;
	}

	// Bond gate: must be close enough with the source character.
	if (const UCharacterBondSubsystem* Bonds = GetGameInstance()->GetSubsystem<UCharacterBondSubsystem>())
	{
		if (Bonds->GetBondLevel(FromCharacterID) < BondLevelToBorrow)
		{
			return false;
		}
	}

	BorrowedSkills.Add(SkillTag);
	OnCustomCharacterChanged.Broadcast();
	return true;
}

void UCharacterCreatorSubsystem::UnborrowSkill(FGameplayTag SkillTag)
{
	if (BorrowedSkills.Remove(SkillTag) > 0)
	{
		OnCustomCharacterChanged.Broadcast();
	}
}

// ---------------------------------------------------------------- skill tree ----------

bool UCharacterCreatorSubsystem::BuyTreeNode(FName NodeID, int32 Cost)
{
	if (NodeID.IsNone() || OwnedTreeNodes.Contains(NodeID) || SkillPoints < Cost)
	{
		return false;
	}
	SkillPoints -= Cost;
	OwnedTreeNodes.Add(NodeID);
	return true;
}

// ---------------------------------------------------------------- save ----------------

void UCharacterCreatorSubsystem::ExportSaveState(FCustomCharacterPreset& OutPreset,
	TArray<FName>& OutNodes, TArray<FGameplayTag>& OutBorrowed) const
{
	OutPreset = ActivePreset;
	OutNodes = OwnedTreeNodes.Array();
	OutBorrowed = BorrowedSkills;
}

void UCharacterCreatorSubsystem::ImportSaveState(const FCustomCharacterPreset& InPreset,
	const TArray<FName>& InNodes, const TArray<FGameplayTag>& InBorrowed)
{
	ActivePreset = InPreset;
	OwnedTreeNodes = TSet<FName>(InNodes);
	BorrowedSkills = InBorrowed;
	OnCustomCharacterChanged.Broadcast();
}
