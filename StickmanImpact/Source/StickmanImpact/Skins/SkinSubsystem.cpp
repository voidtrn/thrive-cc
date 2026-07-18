// Copyright StickmanImpact Project.

#include "SkinSubsystem.h"

bool USkinSubsystem::UnlockSkin(FName SkinID)
{
	FSkinDef Def;
	if (!GetSkinDef(SkinID, Def) || UnlockedSkins.Contains(SkinID))
	{
		return false;
	}
	UnlockedSkins.Add(SkinID);
	OnSkinUnlocked.Broadcast(SkinID);

	if (!Def.CollectionID.IsNone())
	{
		CheckCollectionCompletion(Def.CollectionID);
	}
	return true;
}

bool USkinSubsystem::EquipSkin(const FString& CharacterID, FName SkinID)
{
	FSkinDef Def;
	if (!GetSkinDef(SkinID, Def) || !UnlockedSkins.Contains(SkinID) || Def.CharacterID != CharacterID)
	{
		return false;
	}
	EquippedSkins.Add(CharacterID, SkinID);
	OnSkinEquipped.Broadcast(CharacterID, SkinID);
	return true;
}

FName USkinSubsystem::GetEquippedSkin(const FString& CharacterID) const
{
	const FName* SkinID = EquippedSkins.Find(CharacterID);
	return SkinID ? *SkinID : NAME_None;
}

bool USkinSubsystem::GetSkinDef(FName SkinID, FSkinDef& OutDef) const
{
	if (!SkinTable)
	{
		return false;
	}
	if (const FSkinDef* Row = SkinTable->FindRow<FSkinDef>(SkinID, TEXT("Skins")))
	{
		OutDef = *Row;
		return true;
	}
	return false;
}

TArray<FName> USkinSubsystem::GetSkinsForCharacter(const FString& CharacterID) const
{
	TArray<FName> Result;
	if (!SkinTable)
	{
		return Result;
	}
	SkinTable->ForeachRow<FSkinDef>(TEXT("Skins"), [&](const FName& RowName, const FSkinDef& Def)
	{
		if (Def.CharacterID == CharacterID)
		{
			Result.Add(Def.SkinID.IsNone() ? RowName : Def.SkinID);
		}
	});
	return Result;
}

int32 USkinSubsystem::GetMythicStage(FName SkinID, int32 CharacterLevel) const
{
	FSkinDef Def;
	if (!GetSkinDef(SkinID, Def) || Def.Tier != ESkinTier::Mythic || Def.MythicStageLevels.Num() == 0)
	{
		return -1;
	}
	int32 Stage = 0;
	for (int32 Index = 0; Index < Def.MythicStageLevels.Num(); ++Index)
	{
		if (CharacterLevel >= Def.MythicStageLevels[Index])
		{
			Stage = Index + 1;
		}
	}
	return Stage;
}

void USkinSubsystem::CheckCollectionCompletion(FName CollectionID)
{
	if (!SkinTable)
	{
		return;
	}
	bool bComplete = true;
	SkinTable->ForeachRow<FSkinDef>(TEXT("Skins"), [&](const FName&, const FSkinDef& Def)
	{
		if (Def.CollectionID == CollectionID && !UnlockedSkins.Contains(Def.SkinID))
		{
			bComplete = false;
		}
	});
	if (bComplete)
	{
		OnSkinCollectionCompleted.Broadcast(CollectionID);
	}
}

void USkinSubsystem::ExportSaveState(TArray<FName>& OutUnlocked, TMap<FString, FName>& OutEquipped) const
{
	OutUnlocked = UnlockedSkins.Array();
	OutEquipped = EquippedSkins;
}

void USkinSubsystem::ImportSaveState(const TArray<FName>& InUnlocked, const TMap<FString, FName>& InEquipped)
{
	UnlockedSkins = TSet<FName>(InUnlocked);
	EquippedSkins = InEquipped;
}
