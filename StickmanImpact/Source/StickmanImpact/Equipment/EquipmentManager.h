// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "StickmanEquipmentTypes.h"
#include "EquipmentManager.generated.h"

class UStickmanAttributeSet;
class UDataTable;

/** One saved loadout — stores IDs only; resolving them back to full FArtifactData/FWeaponData needs an inventory system (not built yet). */
USTRUCT(BlueprintType)
struct FEquipmentPreset
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadWrite, Category = "Equipment")
	FString WeaponID;

	UPROPERTY(BlueprintReadWrite, Category = "Equipment")
	TMap<EArtifactSlot, FString> ArtifactIDsBySlot;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnEquipmentChanged);

/**
 * Attach to a character: one weapon slot + 5 artifact slots, computing FEquipmentStatTotals
 * from all of it plus any matching FArtifactSetBonus (looked up from ArtifactSetBonusTable by
 * SetName, counting how many equipped artifacts share each SetName for 2pc/4pc thresholds).
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UEquipmentManager : public UActorComponent
{
	GENERATED_BODY()

public:
	UEquipmentManager();

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Equipment")
	TObjectPtr<UDataTable> ArtifactSetBonusTable;

	UFUNCTION(BlueprintCallable, Category = "Equipment")
	void EquipWeapon(const FWeaponData& Weapon);

	UFUNCTION(BlueprintCallable, Category = "Equipment")
	void UnequipWeapon();

	UFUNCTION(BlueprintCallable, Category = "Equipment")
	void EquipArtifact(const FArtifactData& Artifact);

	UFUNCTION(BlueprintCallable, Category = "Equipment")
	void UnequipArtifact(EArtifactSlot Slot);

	UFUNCTION(BlueprintPure, Category = "Equipment")
	FWeaponData GetEquippedWeapon() const { return EquippedWeapon; }

	UFUNCTION(BlueprintPure, Category = "Equipment")
	bool GetEquippedArtifact(EArtifactSlot Slot, FArtifactData& OutArtifact) const;

	UFUNCTION(BlueprintPure, Category = "Equipment")
	FEquipmentStatTotals GetTotalStats() const { return CachedTotals; }

	// Preview totals as if NewArtifact replaced whatever's in Slot — for a comparison UI, does
	// not actually equip anything.
	UFUNCTION(BlueprintPure, Category = "Equipment")
	FEquipmentStatTotals PreviewArtifactSwap(const FArtifactData& NewArtifact, EArtifactSlot Slot) const;

	UFUNCTION(BlueprintCallable, Category = "Equipment")
	void ApplyTotalsToAttributeSet(UStickmanAttributeSet* AttributeSet, float BaseAttack, float BaseDefense,
		float BaseHealth) const;

	UFUNCTION(BlueprintCallable, Category = "Equipment|Presets")
	void SaveEquipmentPreset(FName PresetName);

	// Loading only restores WeaponID/ArtifactIDsBySlot — actually re-equipping needs an
	// inventory system to look the IDs back up into full FWeaponData/FArtifactData.
	UFUNCTION(BlueprintPure, Category = "Equipment|Presets")
	bool GetEquipmentPreset(FName PresetName, FEquipmentPreset& OutPreset) const;

	UFUNCTION(BlueprintCallable, Category = "Equipment|Leveling")
	void LevelUpWeapon(float EXPAmount);

	UPROPERTY(BlueprintAssignable, Category = "Equipment")
	FOnEquipmentChanged OnEquipmentChanged;

private:
	void RecalculateTotals();
	FEquipmentStatTotals CalculateTotalsWithOverride(const FArtifactData* OverrideArtifact, EArtifactSlot OverrideSlot) const;
	void ApplySetBonuses(FEquipmentStatTotals& Totals, const TMap<FName, int32>& SetCounts) const;

	UPROPERTY()
	FWeaponData EquippedWeapon;

	UPROPERTY()
	TMap<EArtifactSlot, FArtifactData> EquippedArtifacts;

	UPROPERTY()
	TMap<FName, FEquipmentPreset> SavedPresets;

	FEquipmentStatTotals CachedTotals;
};
