#pragma once

#include "CoreMinimal.h"
#include "CombatTypes.generated.h"

/** Elemen — dasar reaction system (Phase 3). */
UENUM(BlueprintType)
enum class EElement : uint8
{
	None,
	Pyro,
	Hydro,
	Cryo,
	Electro,
	Anemo,
	Geo,
	Dendro
};

UENUM(BlueprintType)
enum class EWeaponType : uint8
{
	Sword,
	Claymore,
	Polearm,
	Bow,
	Catalyst
};

/** Tingkat reaksi kena hit — menentukan state Reaction di AnimBP. */
UENUM(BlueprintType)
enum class EHitReaction : uint8
{
	Light,
	Medium,
	Heavy,
	Stagger,
	Knockback,
	Launch,
	KnockedDown
};
