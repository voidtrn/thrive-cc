// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "SkinTypes.h"
#include "SkinSubsystem.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnSkinEquipped, const FString&, CharacterID, FName, SkinID);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnSkinUnlocked, FName, SkinID);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnSkinCollectionCompleted, FName, CollectionID);

/**
 * Skin ownership + equip state. `UnlockSkin` (from currency/events/battle-pass/drops —
 * acquisition is content), `EquipSkin(character, skin)` → `OnSkinEquipped`; the character BP
 * applies the FSkinDef's overrides on switch-in (mesh/weapon/portrait), the VFX manager
 * pushes `VFXColorOverride` into the skill-VFX Material Parameter Collection, and audio
 * checks the SFX/voice overrides. Mythic evolution = `GetMythicStage(level)` on the def.
 * Completing a CollectionID (owning every skin in it) fires the collection bonus delegate.
 * Preview/tryout is UI over the same table (no state).
 */
UCLASS()
class STICKMANIMPACT_API USkinSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Skins")
	void SetSkinTable(UDataTable* Table) { SkinTable = Table; }

	UFUNCTION(BlueprintCallable, Category = "Skins")
	bool UnlockSkin(FName SkinID);

	UFUNCTION(BlueprintCallable, Category = "Skins")
	bool EquipSkin(const FString& CharacterID, FName SkinID);

	UFUNCTION(BlueprintPure, Category = "Skins")
	FName GetEquippedSkin(const FString& CharacterID) const;

	UFUNCTION(BlueprintPure, Category = "Skins")
	bool IsSkinUnlocked(FName SkinID) const { return UnlockedSkins.Contains(SkinID); }

	UFUNCTION(BlueprintPure, Category = "Skins")
	bool GetSkinDef(FName SkinID, FSkinDef& OutDef) const;

	// All skins for a character (shop/wardrobe listing).
	UFUNCTION(BlueprintPure, Category = "Skins")
	TArray<FName> GetSkinsForCharacter(const FString& CharacterID) const;

	// Mythic: which evolution stage a skin is at for a character level (0-based; -1 = not mythic).
	UFUNCTION(BlueprintPure, Category = "Skins")
	int32 GetMythicStage(FName SkinID, int32 CharacterLevel) const;

	UPROPERTY(BlueprintAssignable, Category = "Skins")
	FOnSkinEquipped OnSkinEquipped;

	UPROPERTY(BlueprintAssignable, Category = "Skins")
	FOnSkinUnlocked OnSkinUnlocked;

	UPROPERTY(BlueprintAssignable, Category = "Skins")
	FOnSkinCollectionCompleted OnSkinCollectionCompleted;

	// Save hooks (not yet in the binary format — see README).
	void ExportSaveState(TArray<FName>& OutUnlocked, TMap<FString, FName>& OutEquipped) const;
	void ImportSaveState(const TArray<FName>& InUnlocked, const TMap<FString, FName>& InEquipped);

private:
	void CheckCollectionCompletion(FName CollectionID);

	UPROPERTY()
	TObjectPtr<UDataTable> SkinTable;

	TSet<FName> UnlockedSkins;
	TMap<FString, FName> EquippedSkins; // CharacterID -> SkinID
};
