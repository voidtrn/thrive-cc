#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "WishTypes.generated.h"

UENUM(BlueprintType)
enum class EBannerType : uint8
{
	Standard,         // Wanderlust: selalu ada, no rate-up, pity 75/90
	LimitedCharacter, // 21 hari, 50/50, pity 75/90
	LimitedWeapon,    // epitomized path, pity 65/80
	Beginner          // max 20 pull, diskon, guaranteed featured
};

UENUM(BlueprintType)
enum class EWishRarity : uint8
{
	ThreeStar,
	FourStar,
	FiveStar
};

UENUM(BlueprintType)
enum class EWishItemType : uint8
{
	Character,
	Weapon
};

UENUM(BlueprintType)
enum class EFateType : uint8
{
	Acquaint,    // biru: Standard & Beginner
	Intertwined  // pelangi: Limited
};

/** Row DataTable banner — buat DT_Banners dari struct ini. */
USTRUCT(BlueprintType)
struct FBannerData : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FName BannerID;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FText BannerName;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	EBannerType BannerType = EBannerType::Standard;

	/** Rate-up 5*. Limited char: 1 item. Weapon: 2 item. Beginner: guaranteed item. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TArray<FName> Featured5Star;

	/** Rate-up 4* (3 item, 50% saat dapat 4*). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TArray<FName> Featured4Star;

	/** Pool non-featured. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TArray<FName> Pool5StarStandard;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TArray<FName> Pool4Star;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TArray<FName> Pool3Star;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FDateTime StartDate;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FDateTime EndDate;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TSoftObjectPtr<UTexture2D> BannerImage;
};

/** State pity per tipe banner (carry over antar banner tipe sama). */
USTRUCT(BlueprintType)
struct FBannerPityState
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly) int32 PullsSince5Star = 0;
	UPROPERTY(BlueprintReadOnly) int32 PullsSince4Star = 0;

	/** Kalah 50/50 → next 5* pasti featured. */
	UPROPERTY(BlueprintReadOnly) bool bGuaranteedFeatured5Star = false;
	UPROPERTY(BlueprintReadOnly) bool bGuaranteedFeatured4Star = false;

	/** Epitomized Path (weapon banner). */
	UPROPERTY(BlueprintReadOnly) int32 EpitomizedPoints = 0;
	UPROPERTY(BlueprintReadOnly) FName EpitomizedTarget;

	/** Total pull di tipe ini (cap Beginner 20). */
	UPROPERTY(BlueprintReadOnly) int32 TotalPulls = 0;
};

/** Hasil satu pull. */
USTRUCT(BlueprintType)
struct FWishResult
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly) FName ItemId;
	UPROPERTY(BlueprintReadOnly) EWishRarity Rarity = EWishRarity::ThreeStar;
	UPROPERTY(BlueprintReadOnly) bool bFeatured = false;
	UPROPERTY(BlueprintReadOnly) bool bDuplicate = false;
	UPROPERTY(BlueprintReadOnly) int32 StarglitterGained = 0;
	UPROPERTY(BlueprintReadOnly) int32 StardustGained = 0;
};
