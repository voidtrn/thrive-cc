// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "CharacterCreatorTypes.h"
#include "GameplayTagContainer.h"
#include "CharacterCreatorSubsystem.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnCustomCharacterChanged);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnTravelerElementSwapped, EStickmanElement, NewElement);

/**
 * The custom "Traveler" protagonist: active preset (applied onto the player pawn's stickman
 * materials/rig by the character BP reading GetActivePreset), preset slots, export/import
 * share codes (struct → JSON → hex code, Soul-Calibur style), and the Traveler's special
 * identity:
 *
 * - **Any-element**: `SwapTravelerElement` retunes the Traveler's kit to any element with an
 *   internal cooldown (`ElementSwapCooldown`); late-game `UnlockDualElement` opens a second
 *   simultaneous slot. Story dialogue reads `GetTravelerElement`.
 * - **Borrowed skills**: bond with a party character (UCharacterBondSubsystem) → `BorrowSkill`
 *   equips one of their skill tags, max `MaxBorrowedSkills` at once; synergy bonuses are
 *   content keyed on the combination.
 * - **Custom skill tree**: four branches (Elemental/Weapon/Traveler/Social) as purchasable
 *   node IDs — `BuyTreeNode`/`HasTreeNode`; effects read the owned set (same pattern as the
 *   Abyss talents).
 *
 * Appearance changes later (barber/salon) just overwrite the active preset for currency;
 * elemental outfits/dyes are skin-system content reading the preset colors.
 */
UCLASS()
class STICKMANIMPACT_API UCharacterCreatorSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	// --- Preset ---------------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Creator")
	void SetActivePreset(const FCustomCharacterPreset& Preset);

	UFUNCTION(BlueprintPure, Category = "Creator")
	const FCustomCharacterPreset& GetActivePreset() const { return ActivePreset; }

	UFUNCTION(BlueprintCallable, Category = "Creator")
	void SavePresetToSlot(int32 Slot);

	UFUNCTION(BlueprintCallable, Category = "Creator")
	bool LoadPresetFromSlot(int32 Slot);

	// Share codes: preset -> hex string; import parses + applies.
	UFUNCTION(BlueprintCallable, Category = "Creator")
	FString ExportPresetCode() const;

	UFUNCTION(BlueprintCallable, Category = "Creator")
	bool ImportPresetCode(const FString& Code);

	// --- Traveler element -----------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Creator")
	bool SwapTravelerElement(EStickmanElement NewElement);

	UFUNCTION(BlueprintPure, Category = "Creator")
	EStickmanElement GetTravelerElement() const { return ActivePreset.StartingElement; }

	UFUNCTION(BlueprintCallable, Category = "Creator")
	void UnlockDualElement() { bDualElementUnlocked = true; }

	UFUNCTION(BlueprintCallable, Category = "Creator")
	bool SetSecondElement(EStickmanElement Element);

	UFUNCTION(BlueprintPure, Category = "Creator")
	EStickmanElement GetSecondElement() const { return SecondElement; }

	// --- Borrowed skills ------------------------------------------------------------------

	// Requires bond level >= BondLevelToBorrow with the source character (checked internally).
	UFUNCTION(BlueprintCallable, Category = "Creator")
	bool BorrowSkill(const FString& FromCharacterID, FGameplayTag SkillTag);

	UFUNCTION(BlueprintCallable, Category = "Creator")
	void UnborrowSkill(FGameplayTag SkillTag);

	UFUNCTION(BlueprintPure, Category = "Creator")
	TArray<FGameplayTag> GetBorrowedSkills() const { return BorrowedSkills; }

	// --- Custom skill tree ----------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Creator")
	bool BuyTreeNode(FName NodeID, int32 Cost);

	UFUNCTION(BlueprintPure, Category = "Creator")
	bool HasTreeNode(FName NodeID) const { return OwnedTreeNodes.Contains(NodeID); }

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Creator")
	float ElementSwapCooldown = 20.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Creator")
	int32 MaxBorrowedSkills = 3;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Creator")
	int32 BondLevelToBorrow = 5;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Creator")
	int32 SkillPoints = 0;

	UPROPERTY(BlueprintAssignable, Category = "Creator")
	FOnCustomCharacterChanged OnCustomCharacterChanged;

	UPROPERTY(BlueprintAssignable, Category = "Creator")
	FOnTravelerElementSwapped OnTravelerElementSwapped;

	// Save hooks (not yet in the binary format — see README).
	void ExportSaveState(FCustomCharacterPreset& OutPreset, TArray<FName>& OutNodes, TArray<FGameplayTag>& OutBorrowed) const;
	void ImportSaveState(const FCustomCharacterPreset& InPreset, const TArray<FName>& InNodes, const TArray<FGameplayTag>& InBorrowed);

private:
	FCustomCharacterPreset ActivePreset;
	TMap<int32, FCustomCharacterPreset> PresetSlots;

	double LastElementSwapTime = -1000.0;
	bool bDualElementUnlocked = false;
	EStickmanElement SecondElement = EStickmanElement::None;

	TArray<FGameplayTag> BorrowedSkills;
	TSet<FName> OwnedTreeNodes;
};
