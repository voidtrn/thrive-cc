// Copyright StickmanImpact Project.

#include "StickmanAttributeSet.h"
#include "Net/UnrealNetwork.h"
#include "GameplayEffectExtension.h"

UStickmanAttributeSet::UStickmanAttributeSet()
{
	InitHealth(100.f);
	InitMaxHealth(1000.f);
	InitStamina(100.f);
	InitMaxStamina(100.f);
	InitAttack(20.f);
	InitDefense(10.f);
	InitElementalMastery(0.f);
	InitEnergyRecharge(1.f);
	InitCurrentEnergy(0.f);
	InitMaxEnergy(60.f);
}

void UStickmanAttributeSet::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
	Super::GetLifetimeReplicatedProps(OutLifetimeProps);

	DOREPLIFETIME_CONDITION_NOTIFY(UStickmanAttributeSet, Health, COND_None, REPNOTIFY_Always);
	DOREPLIFETIME_CONDITION_NOTIFY(UStickmanAttributeSet, MaxHealth, COND_None, REPNOTIFY_Always);
	DOREPLIFETIME_CONDITION_NOTIFY(UStickmanAttributeSet, Stamina, COND_None, REPNOTIFY_Always);
	DOREPLIFETIME_CONDITION_NOTIFY(UStickmanAttributeSet, MaxStamina, COND_None, REPNOTIFY_Always);
	DOREPLIFETIME_CONDITION_NOTIFY(UStickmanAttributeSet, Attack, COND_None, REPNOTIFY_Always);
	DOREPLIFETIME_CONDITION_NOTIFY(UStickmanAttributeSet, Defense, COND_None, REPNOTIFY_Always);
	DOREPLIFETIME_CONDITION_NOTIFY(UStickmanAttributeSet, ElementalMastery, COND_None, REPNOTIFY_Always);
	DOREPLIFETIME_CONDITION_NOTIFY(UStickmanAttributeSet, EnergyRecharge, COND_None, REPNOTIFY_Always);
	DOREPLIFETIME_CONDITION_NOTIFY(UStickmanAttributeSet, CurrentEnergy, COND_None, REPNOTIFY_Always);
	DOREPLIFETIME_CONDITION_NOTIFY(UStickmanAttributeSet, MaxEnergy, COND_None, REPNOTIFY_Always);
}

void UStickmanAttributeSet::ClampAttribute(const FGameplayAttribute& Attribute, float& NewValue) const
{
	if (Attribute == GetHealthAttribute())
	{
		NewValue = FMath::Clamp(NewValue, 0.f, GetMaxHealth());
	}
	else if (Attribute == GetStaminaAttribute())
	{
		NewValue = FMath::Clamp(NewValue, 0.f, GetMaxStamina());
	}
	else if (Attribute == GetCurrentEnergyAttribute())
	{
		NewValue = FMath::Clamp(NewValue, 0.f, GetMaxEnergy());
	}
}

void UStickmanAttributeSet::PreAttributeChange(const FGameplayAttribute& Attribute, float& NewValue)
{
	Super::PreAttributeChange(Attribute, NewValue);
	ClampAttribute(Attribute, NewValue);
}

void UStickmanAttributeSet::PostGameplayEffectExecute(const FGameplayEffectModCallbackData& Data)
{
	Super::PostGameplayEffectExecute(Data);

	const float OldHealth = GetHealth();
	const float OldStamina = GetStamina();
	const float OldEnergy = GetCurrentEnergy();

	// Damage/Healing are meta attributes: fold them into Health once, then zero them out so
	// they don't linger and get re-applied by a later, unrelated PostGameplayEffectExecute call.
	if (Data.EvaluatedData.Attribute == GetDamageAttribute())
	{
		const float DamageDone = GetDamage();
		SetDamage(0.f);
		if (DamageDone > 0.f)
		{
			SetHealth(FMath::Clamp(GetHealth() - DamageDone, 0.f, GetMaxHealth()));
		}
	}
	else if (Data.EvaluatedData.Attribute == GetHealingAttribute())
	{
		const float HealingDone = GetHealing();
		SetHealing(0.f);
		if (HealingDone > 0.f)
		{
			SetHealth(FMath::Clamp(GetHealth() + HealingDone, 0.f, GetMaxHealth()));
		}
	}
	else if (Data.EvaluatedData.Attribute == GetHealthAttribute())
	{
		SetHealth(FMath::Clamp(GetHealth(), 0.f, GetMaxHealth()));
	}
	else if (Data.EvaluatedData.Attribute == GetStaminaAttribute())
	{
		SetStamina(FMath::Clamp(GetStamina(), 0.f, GetMaxStamina()));
	}
	else if (Data.EvaluatedData.Attribute == GetCurrentEnergyAttribute())
	{
		SetCurrentEnergy(FMath::Clamp(GetCurrentEnergy(), 0.f, GetMaxEnergy()));
	}

	if (!FMath::IsNearlyEqual(OldHealth, GetHealth()))
	{
		OnHealthChanged.Broadcast(GetHealth(), GetMaxHealth());
	}
	if (!FMath::IsNearlyEqual(OldStamina, GetStamina()))
	{
		OnStaminaChanged.Broadcast(GetStamina(), GetMaxStamina());
	}
	if (!FMath::IsNearlyEqual(OldEnergy, GetCurrentEnergy()))
	{
		OnEnergyChanged.Broadcast(GetCurrentEnergy(), GetMaxEnergy());
	}
}

void UStickmanAttributeSet::OnRep_Health(const FGameplayAttributeData& OldValue)
{
	GAMEPLAYATTRIBUTE_REPNOTIFY(UStickmanAttributeSet, Health, OldValue);
	OnHealthChanged.Broadcast(GetHealth(), GetMaxHealth());
}

void UStickmanAttributeSet::OnRep_MaxHealth(const FGameplayAttributeData& OldValue)
{
	GAMEPLAYATTRIBUTE_REPNOTIFY(UStickmanAttributeSet, MaxHealth, OldValue);
	OnHealthChanged.Broadcast(GetHealth(), GetMaxHealth());
}

void UStickmanAttributeSet::OnRep_Stamina(const FGameplayAttributeData& OldValue)
{
	GAMEPLAYATTRIBUTE_REPNOTIFY(UStickmanAttributeSet, Stamina, OldValue);
	OnStaminaChanged.Broadcast(GetStamina(), GetMaxStamina());
}

void UStickmanAttributeSet::OnRep_MaxStamina(const FGameplayAttributeData& OldValue)
{
	GAMEPLAYATTRIBUTE_REPNOTIFY(UStickmanAttributeSet, MaxStamina, OldValue);
	OnStaminaChanged.Broadcast(GetStamina(), GetMaxStamina());
}

void UStickmanAttributeSet::OnRep_Attack(const FGameplayAttributeData& OldValue)
{
	GAMEPLAYATTRIBUTE_REPNOTIFY(UStickmanAttributeSet, Attack, OldValue);
}

void UStickmanAttributeSet::OnRep_Defense(const FGameplayAttributeData& OldValue)
{
	GAMEPLAYATTRIBUTE_REPNOTIFY(UStickmanAttributeSet, Defense, OldValue);
}

void UStickmanAttributeSet::OnRep_ElementalMastery(const FGameplayAttributeData& OldValue)
{
	GAMEPLAYATTRIBUTE_REPNOTIFY(UStickmanAttributeSet, ElementalMastery, OldValue);
}

void UStickmanAttributeSet::OnRep_EnergyRecharge(const FGameplayAttributeData& OldValue)
{
	GAMEPLAYATTRIBUTE_REPNOTIFY(UStickmanAttributeSet, EnergyRecharge, OldValue);
}

void UStickmanAttributeSet::OnRep_CurrentEnergy(const FGameplayAttributeData& OldValue)
{
	GAMEPLAYATTRIBUTE_REPNOTIFY(UStickmanAttributeSet, CurrentEnergy, OldValue);
	OnEnergyChanged.Broadcast(GetCurrentEnergy(), GetMaxEnergy());
}

void UStickmanAttributeSet::OnRep_MaxEnergy(const FGameplayAttributeData& OldValue)
{
	GAMEPLAYATTRIBUTE_REPNOTIFY(UStickmanAttributeSet, MaxEnergy, OldValue);
	OnEnergyChanged.Broadcast(GetCurrentEnergy(), GetMaxEnergy());
}
