#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "Combat/CombatTypes.h"
#include "System/LevelingTypes.h"
#include "UI/InventoryTypes.h"
#include "LevelingComponent.generated.h"

class ACharacterBase;
class UDataTable;
class UOpenWorldGameInstance;

/** Alasan gagal upgrade — UI tampilkan pesan yang tepat. */
UENUM(BlueprintType)
enum class ELevelingResult : uint8
{
	Success,
	NotEnoughMora,
	NotEnoughMaterials,
	MaxLevelReached,
	LevelRequirementNotMet,   // harus level cap sebelum ascend
	InvalidTarget,
	MissingCostData
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnCharacterLeveled, ACharacterBase*, Character, int32, NewLevel);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnCharacterAscended, ACharacterBase*, Character, int32, NewAscension);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams(FOnTalentLeveled, FName, CharacterId, ETalentSource, Talent, int32, NewLevel);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnArtifactEnhanced, FGuid, ArtifactId, int32, NewLevel);

/**
 * Sistem konsumsi material untuk leveling (P3 gap).
 * Pasang di PlayerController (butuh akses GameInstance untuk inventory/mora).
 *
 * Semua biaya data-driven via DataTable:
 *   - Ascension  : DT_CharacterAscension / DT_WeaponAscension (FAscensionCostRow)
 *   - Talent     : DT_TalentCost (FTalentCostRow)
 *   - Level EXP  : item EXP (CharacterExpItemId) + mora (rasio EXP/5)
 *   - Artifact   : EXP fodder + mora
 */
UCLASS(ClassGroup = (Progression), meta = (BlueprintSpawnableComponent))
class MYGAME_API ULevelingComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	// ---------- Character ----------
	/** Naikkan level karakter aktif ke TargetLevel (batasi cap ascension). */
	UFUNCTION(BlueprintCallable, Category = "Leveling|Character")
	ELevelingResult LevelUpCharacter(ACharacterBase* Character, int32 TargetLevel);

	/** Ascension karakter (level harus == cap phase sekarang). */
	UFUNCTION(BlueprintCallable, Category = "Leveling|Character")
	ELevelingResult AscendCharacter(ACharacterBase* Character);

	/** Naikkan satu talent 1 level. Talent disimpan di GameInstance per CharacterId. */
	UFUNCTION(BlueprintCallable, Category = "Leveling|Talent")
	ELevelingResult LevelUpTalent(FName CharacterId, ETalentSource Talent);

	// ---------- Weapon ----------
	UFUNCTION(BlueprintCallable, Category = "Leveling|Weapon")
	ELevelingResult LevelUpWeapon(FGuid WeaponInstanceId, int32 TargetLevel);

	UFUNCTION(BlueprintCallable, Category = "Leveling|Weapon")
	ELevelingResult AscendWeapon(FGuid WeaponInstanceId);

	// ---------- Artifact ----------
	/** Tambah EXP fodder ke artifact; level naik & substat baru/upgrade tiap +4. */
	UFUNCTION(BlueprintCallable, Category = "Leveling|Artifact")
	ELevelingResult EnhanceArtifact(FGuid ArtifactInstanceId, int32 ExpFromFodder);

	// ---------- Query (UI) ----------
	/** Level cap untuk phase ascension (0..6 → 20/40/50/60/70/80/90). */
	UFUNCTION(BlueprintPure, Category = "Leveling")
	static int32 LevelCapForAscension(int32 AscensionPhase);

	/** Level cap artifact by rarity (5★=20, 4★=16, 3★=12, 2★=8, 1★=4). */
	UFUNCTION(BlueprintPure, Category = "Leveling")
	static int32 ArtifactMaxLevel(EItemRarity Rarity);

	// ---------- Events ----------
	UPROPERTY(BlueprintAssignable) FOnCharacterLeveled OnCharacterLeveled;
	UPROPERTY(BlueprintAssignable) FOnCharacterAscended OnCharacterAscended;
	UPROPERTY(BlueprintAssignable) FOnTalentLeveled OnTalentLeveled;
	UPROPERTY(BlueprintAssignable) FOnArtifactEnhanced OnArtifactEnhanced;

protected:
	// ---------- Config: data tables ----------
	UPROPERTY(EditDefaultsOnly, Category = "Leveling|Data")
	TObjectPtr<UDataTable> CharacterAscensionTable;

	UPROPERTY(EditDefaultsOnly, Category = "Leveling|Data")
	TObjectPtr<UDataTable> WeaponAscensionTable;

	UPROPERTY(EditDefaultsOnly, Category = "Leveling|Data")
	TObjectPtr<UDataTable> TalentCostTable;

	// ---------- Config: EXP items ----------
	/** Item EXP karakter (Hero's Wit). */
	UPROPERTY(EditDefaultsOnly, Category = "Leveling|Exp")
	FName CharacterExpItemId = TEXT("Item_HeroWit");

	UPROPERTY(EditDefaultsOnly, Category = "Leveling|Exp")
	int32 CharacterExpPerItem = 20000;

	/** Item EXP senjata (Mystic Enhancement Ore). */
	UPROPERTY(EditDefaultsOnly, Category = "Leveling|Exp")
	FName WeaponExpItemId = TEXT("Item_MysticOre");

	UPROPERTY(EditDefaultsOnly, Category = "Leveling|Exp")
	int32 WeaponExpPerItem = 10000;

	/** Rasio mora per EXP (Genshin: 1 mora / 5 EXP). */
	UPROPERTY(EditDefaultsOnly, Category = "Leveling|Exp")
	float MoraPerExp = 0.2f;

private:
	UOpenWorldGameInstance* GetGI() const;

	/** Cek + konsumsi mora & material. False (tanpa perubahan) kalau kurang. */
	ELevelingResult TryPayCost(int32 MoraCost, const TArray<FMaterialCost>& Materials);

	/** EXP kumulatif dari level ke level+1 (kurva karakter). */
	static int32 CharacterExpToNextLevel(int32 CurrentLevel);
	static int32 WeaponExpToNextLevel(int32 CurrentLevel);
	static int32 ArtifactExpToNextLevel(int32 CurrentLevel, EItemRarity Rarity);

	/** Level-up berbasis EXP-item generik (karakter/senjata share logika). */
	ELevelingResult LevelUpByExpItems(int32& OutLevel, int32 CurrentAscension, int32 TargetLevel,
		FName ExpItemId, int32 ExpPerItem, bool bWeapon);

	/** Roll nilai substat representatif untuk stat (untuk artifact enhance). */
	static float RollSubstatValue(EArtifactStat Stat);
	static int32 ArtifactMaxSubstats(EItemRarity Rarity);

	/** Tambah substat baru / upgrade acak saat artifact lewati milestone +4. */
	void RollArtifactSubstat(struct FArtifactInstance& Artifact) const;

	/** Recalc stat karakter aktif kalau CharacterId cocok pawn yang dikuasai. */
	void RecalcCharacterIfActive(FName CharacterId) const;

	/** Tulis Level/Ascension karakter ke PartyCharacterData (persist off-field). */
	void PersistCharacterState(const ACharacterBase* Character) const;
};
