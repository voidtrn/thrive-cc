// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "SkillSystem/StickmanSkillTypes.h"
#include "GameplayTagContainer.h"
#include "WeaponSwapComponent.generated.h"

class UAnimMontage;
class USkillDataAsset;

/** One equipped weapon loadout slot. */
USTRUCT(BlueprintType)
struct FEquippedWeapon
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	EWeaponType WeaponType = EWeaponType::Sword;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	EWeaponSubType SubType = EWeaponSubType::Longsword;

	// The normal-attack skill tag this weapon drives (its combo lives on the granted ability).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	FGameplayTag NormalAttackTag;

	// Heavy-attack skill tag (sub-type-defining move).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	FGameplayTag HeavyAttackTag;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	TObjectPtr<class USkeletalMesh> WeaponMesh;
};

/** The unique first-attack-after-swap move for a from→to weapon pair. */
USTRUCT(BlueprintType)
struct FSwapAttack
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	EWeaponType FromType = EWeaponType::Sword;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	EWeaponType ToType = EWeaponType::Claymore;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	TObjectPtr<UAnimMontage> SwapAttackMontage;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	float BonusDamageMultiplier = 1.5f;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnWeaponSwapped, int32, ActiveSlot);

/**
 * Two-weapon mid-combat swap (Genshin-swap meets DMC style-switch). Swap is instant and
 * doesn't reset the combo — `bComboContinues` tells the attack ability to keep the chain
 * index across the swap. The first attack after a swap plays the matching FSwapAttack
 * (Sword→Claymore overhead slam, Ranged→Melee gap-closer, etc.) with a bonus-damage window
 * the funnel reads via `ConsumeSwapBonus`. SwapCooldown (1.5s) gates spam.
 *
 * Style/rank live in UStyleSubsystem + the existing UComboMeterSubsystem (varied weapon use
 * feeds style points); this component just owns the loadout + swap timing.
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UWeaponSwapComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UWeaponSwapComponent();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	FEquippedWeapon PrimaryWeapon;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	FEquippedWeapon SecondaryWeapon;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	TArray<FSwapAttack> SwapAttacks;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	float SwapCooldown = 1.5f;

	// Swap to the other weapon. Returns false if on cooldown.
	UFUNCTION(BlueprintCallable, Category = "Weapon")
	bool SwapWeapon();

	UFUNCTION(BlueprintPure, Category = "Weapon")
	const FEquippedWeapon& GetActiveWeapon() const { return bSecondaryActive ? SecondaryWeapon : PrimaryWeapon; }

	UFUNCTION(BlueprintPure, Category = "Weapon")
	bool IsSwapReady() const;

	// The armed swap-attack montage (or null if the swap window has passed). Non-consuming.
	UFUNCTION(BlueprintPure, Category = "Weapon")
	UAnimMontage* GetPendingSwapAttack() const;

	// Damage-funnel hook: returns the swap bonus (or 1) and disarms it. One-shot per swap.
	UFUNCTION(BlueprintCallable, Category = "Weapon")
	float ConsumeSwapBonus();

	UPROPERTY(BlueprintAssignable, Category = "Weapon")
	FOnWeaponSwapped OnWeaponSwapped;

private:
	const FSwapAttack* FindSwapAttack(EWeaponType From, EWeaponType To) const;

	bool bSecondaryActive = false;
	double LastSwapTime = -100.0;
	float ArmedSwapBonus = 1.f;
	double SwapBonusExpiry = -100.0;
	TObjectPtr<UAnimMontage> PendingSwapMontage;
};
