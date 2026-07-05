#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "System/WishTypes.h"
#include "InventoryTypes.generated.h"

class UTexture2D;

/** Tab inventory (spec 7B). */
UENUM(BlueprintType)
enum class EItemCategory : uint8
{
	Weapon,
	Artifact,
	Material,   // ascension, talent, weapon, local specialty
	Food,       // heal, buff, revival
	QuestItem,
	Consumable  // potion, gadget
};

UENUM(BlueprintType)
enum class EItemRarity : uint8
{
	OneStar,
	TwoStar,
	ThreeStar,  // border biru
	FourStar,   // border ungu
	FiveStar    // border emas
};

/** Row DT_Items — definisi semua item. */
USTRUCT(BlueprintType)
struct FItemDefRow : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FText DisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, meta = (MultiLine = true))
	FText Description;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	EItemCategory Category = EItemCategory::Material;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	EItemRarity Rarity = EItemRarity::ThreeStar;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TSoftObjectPtr<UTexture2D> Icon;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	int32 MaxStack = 999;
};

/** Slot artifact (5 slot Genshin). */
UENUM(BlueprintType)
enum class EArtifactSlot : uint8
{
	Flower,
	Plume,
	Sands,
	Goblet,
	Circlet
};

UENUM(BlueprintType)
enum class EArtifactStat : uint8
{
	HP, HPPercent,
	ATK, ATKPercent,
	DEF, DEFPercent,
	ElementalMastery,
	EnergyRecharge,
	CritRate, CritDMG,
	ElementalDMGBonus,
	HealingBonus
};

USTRUCT(BlueprintType)
struct FArtifactSubstat
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	EArtifactStat Stat = EArtifactStat::ATK;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	float Value = 0.f;
};

/** Instance artifact yang dimiliki (roll unik per drop). */
USTRUCT(BlueprintType)
struct FArtifactInstance
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FGuid InstanceId;

	/** Set (nama set untuk bonus 2/4-piece). */
	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FName SetId;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	EArtifactSlot Slot = EArtifactSlot::Flower;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	EItemRarity Rarity = EItemRarity::FourStar;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	int32 Level = 0;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	EArtifactStat MainStat = EArtifactStat::HP;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	float MainStatValue = 0.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	TArray<FArtifactSubstat> Substats;

	/** NAME_None = tidak di-equip. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FName EquippedCharacter;
};

/** Pin custom di map (player place, max 99). */
USTRUCT(BlueprintType)
struct FMapPin
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FVector Location = FVector::ZeroVector;

	/** Index icon pin (UI picker). */
	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	int32 IconType = 0;
};

/** Riwayat pull (Wish History, retensi 6 bulan). */
USTRUCT(BlueprintType)
struct FWishHistoryEntry
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly)
	FName ItemId;

	UPROPERTY(BlueprintReadOnly)
	EWishRarity Rarity = EWishRarity::ThreeStar;

	UPROPERTY(BlueprintReadOnly)
	EBannerType BannerType = EBannerType::Standard;

	UPROPERTY(BlueprintReadOnly)
	FDateTime Timestamp;
};

/** Elemental resonance party (2 elemen sama). */
UENUM(BlueprintType)
enum class EElementalResonance : uint8
{
	None,
	FerventFlames,      // 2 Pyro: +25% ATK
	SoothingWater,      // 2 Hydro: +25% Max HP
	ShatteringIce,      // 2 Cryo: +15% crit vs frozen
	HighVoltage,        // 2 Electro: energy dari reaction
	ImpetuousWinds,     // 2 Anemo: -15% stamina cost
	EnduringRock,       // 2 Geo: +15% shield strength
	SprawlingGreenery,  // 2 Dendro: +50 EM
	ProtectiveCanopy    // 4 elemen beda: +15% semua RES
};
