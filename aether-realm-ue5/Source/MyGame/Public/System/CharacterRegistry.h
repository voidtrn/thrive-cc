#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "Combat/CombatTypes.h"
#include "CharacterRegistry.generated.h"

class ACharacterBase;
class UTexture2D;

/** Row DT_Characters — definisi karakter playable (spawn class + UI assets). */
USTRUCT(BlueprintType)
struct FCharacterDefRow : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FText DisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	EElement Element = EElement::None;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	EWeaponType WeaponType = EWeaponType::Sword;

	/** 4 atau 5 (bintang). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, meta = (ClampMin = 4, ClampMax = 5))
	int32 Rarity = 4;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TSubclassOf<ACharacterBase> CharacterClass;

	/** Icon kecil HUD (slot 1-4). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TSoftObjectPtr<UTexture2D> Icon;

	/** Portrait besar (character screen / dialogue). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TSoftObjectPtr<UTexture2D> Portrait;
};
