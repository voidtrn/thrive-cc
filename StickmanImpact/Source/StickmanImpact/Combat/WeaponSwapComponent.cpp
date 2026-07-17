// Copyright StickmanImpact Project.

#include "WeaponSwapComponent.h"

UWeaponSwapComponent::UWeaponSwapComponent()
{
	PrimaryComponentTick.bCanEverTick = false;
}

bool UWeaponSwapComponent::IsSwapReady() const
{
	return GetWorld() && (GetWorld()->GetTimeSeconds() - LastSwapTime) >= SwapCooldown;
}

bool UWeaponSwapComponent::SwapWeapon()
{
	if (!IsSwapReady())
	{
		return false;
	}

	const EWeaponType FromType = GetActiveWeapon().WeaponType;
	bSecondaryActive = !bSecondaryActive;
	const EWeaponType ToType = GetActiveWeapon().WeaponType;
	LastSwapTime = GetWorld()->GetTimeSeconds();

	// Arm the swap attack: first attack after the swap plays it with a bonus. The window is
	// the swap cooldown itself — swap again and it re-arms.
	PendingSwapMontage = nullptr;
	ArmedSwapBonus = 1.f;
	if (const FSwapAttack* Swap = FindSwapAttack(FromType, ToType))
	{
		PendingSwapMontage = Swap->SwapAttackMontage;
		ArmedSwapBonus = Swap->BonusDamageMultiplier;
		SwapBonusExpiry = LastSwapTime + SwapCooldown;
	}

	OnWeaponSwapped.Broadcast(bSecondaryActive ? 1 : 0);
	return true;
}

const FSwapAttack* UWeaponSwapComponent::FindSwapAttack(EWeaponType From, EWeaponType To) const
{
	for (const FSwapAttack& Swap : SwapAttacks)
	{
		if (Swap.FromType == From && Swap.ToType == To)
		{
			return &Swap;
		}
	}
	return nullptr;
}

UAnimMontage* UWeaponSwapComponent::GetPendingSwapAttack() const
{
	if (GetWorld() && GetWorld()->GetTimeSeconds() <= SwapBonusExpiry)
	{
		return PendingSwapMontage;
	}
	return nullptr;
}

float UWeaponSwapComponent::ConsumeSwapBonus()
{
	if (ArmedSwapBonus > 1.f && GetWorld()->GetTimeSeconds() <= SwapBonusExpiry)
	{
		const float Bonus = ArmedSwapBonus;
		ArmedSwapBonus = 1.f;
		PendingSwapMontage = nullptr;
		return Bonus;
	}
	return 1.f;
}
