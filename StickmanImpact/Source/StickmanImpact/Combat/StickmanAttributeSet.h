// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "AttributeSet.h"
#include "AbilitySystemComponent.h"
#include "StickmanAttributeSet.generated.h"

// Boilerplate GAS accessor macros: for an attribute named "Health" this generates
// GetHealth() / GetHealthAttribute() / SetHealth() / InitHealth().
#define ATTRIBUTE_ACCESSORS(ClassName, PropertyName) \
	GAMEPLAYATTRIBUTE_PROPERTY_GETTER(ClassName, PropertyName) \
	GAMEPLAYATTRIBUTE_VALUE_GETTER(PropertyName) \
	GAMEPLAYATTRIBUTE_VALUE_SETTER(PropertyName) \
	GAMEPLAYATTRIBUTE_VALUE_INITTER(PropertyName)

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FStickmanAttributeChanged, float, NewValue, float, MaxValue);

/**
 * Core RPG attributes driving AStickmanCharacter through the GameplayAbilitySystem.
 * Damage/Healing are "meta" attributes: they are never read directly, only ever used as a
 * temporary landing pad in PostGameplayEffectExecute() before being folded into Health.
 * This is the standard GAS pattern (see Lyra/ActionRPG samples) — it lets every damage/heal
 * source (abilities, DoTs, scripted events) go through one clamp + broadcast codepath.
 */
UCLASS()
class STICKMANIMPACT_API UStickmanAttributeSet : public UAttributeSet
{
	GENERATED_BODY()

public:
	UStickmanAttributeSet();

	virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;
	virtual void PreAttributeChange(const FGameplayAttribute& Attribute, float& NewValue) override;
	virtual void PostGameplayEffectExecute(const FGameplayEffectModCallbackData& Data) override;

	UPROPERTY(BlueprintAssignable, Category = "Attributes|Events")
	FStickmanAttributeChanged OnHealthChanged;

	UPROPERTY(BlueprintAssignable, Category = "Attributes|Events")
	FStickmanAttributeChanged OnStaminaChanged;

	UPROPERTY(BlueprintAssignable, Category = "Attributes|Events")
	FStickmanAttributeChanged OnEnergyChanged;

	UPROPERTY(ReplicatedUsing = OnRep_Health, BlueprintReadOnly, Category = "Attributes")
	FGameplayAttributeData Health;
	ATTRIBUTE_ACCESSORS(UStickmanAttributeSet, Health)

	UPROPERTY(ReplicatedUsing = OnRep_MaxHealth, BlueprintReadOnly, Category = "Attributes")
	FGameplayAttributeData MaxHealth;
	ATTRIBUTE_ACCESSORS(UStickmanAttributeSet, MaxHealth)

	UPROPERTY(ReplicatedUsing = OnRep_Stamina, BlueprintReadOnly, Category = "Attributes")
	FGameplayAttributeData Stamina;
	ATTRIBUTE_ACCESSORS(UStickmanAttributeSet, Stamina)

	UPROPERTY(ReplicatedUsing = OnRep_MaxStamina, BlueprintReadOnly, Category = "Attributes")
	FGameplayAttributeData MaxStamina;
	ATTRIBUTE_ACCESSORS(UStickmanAttributeSet, MaxStamina)

	UPROPERTY(ReplicatedUsing = OnRep_Attack, BlueprintReadOnly, Category = "Attributes")
	FGameplayAttributeData Attack;
	ATTRIBUTE_ACCESSORS(UStickmanAttributeSet, Attack)

	UPROPERTY(ReplicatedUsing = OnRep_Defense, BlueprintReadOnly, Category = "Attributes")
	FGameplayAttributeData Defense;
	ATTRIBUTE_ACCESSORS(UStickmanAttributeSet, Defense)

	UPROPERTY(ReplicatedUsing = OnRep_ElementalMastery, BlueprintReadOnly, Category = "Attributes")
	FGameplayAttributeData ElementalMastery;
	ATTRIBUTE_ACCESSORS(UStickmanAttributeSet, ElementalMastery)

	UPROPERTY(ReplicatedUsing = OnRep_EnergyRecharge, BlueprintReadOnly, Category = "Attributes")
	FGameplayAttributeData EnergyRecharge;
	ATTRIBUTE_ACCESSORS(UStickmanAttributeSet, EnergyRecharge)

	UPROPERTY(ReplicatedUsing = OnRep_CurrentEnergy, BlueprintReadOnly, Category = "Attributes")
	FGameplayAttributeData CurrentEnergy;
	ATTRIBUTE_ACCESSORS(UStickmanAttributeSet, CurrentEnergy)

	UPROPERTY(ReplicatedUsing = OnRep_MaxEnergy, BlueprintReadOnly, Category = "Attributes")
	FGameplayAttributeData MaxEnergy;
	ATTRIBUTE_ACCESSORS(UStickmanAttributeSet, MaxEnergy)

	// Meta attributes — not replicated, not clamped by MaxHealth, exist only for one execute.
	UPROPERTY(BlueprintReadOnly, Category = "Attributes|Meta")
	FGameplayAttributeData Damage;
	ATTRIBUTE_ACCESSORS(UStickmanAttributeSet, Damage)

	UPROPERTY(BlueprintReadOnly, Category = "Attributes|Meta")
	FGameplayAttributeData Healing;
	ATTRIBUTE_ACCESSORS(UStickmanAttributeSet, Healing)

protected:
	UFUNCTION()
	void OnRep_Health(const FGameplayAttributeData& OldValue);
	UFUNCTION()
	void OnRep_MaxHealth(const FGameplayAttributeData& OldValue);
	UFUNCTION()
	void OnRep_Stamina(const FGameplayAttributeData& OldValue);
	UFUNCTION()
	void OnRep_MaxStamina(const FGameplayAttributeData& OldValue);
	UFUNCTION()
	void OnRep_Attack(const FGameplayAttributeData& OldValue);
	UFUNCTION()
	void OnRep_Defense(const FGameplayAttributeData& OldValue);
	UFUNCTION()
	void OnRep_ElementalMastery(const FGameplayAttributeData& OldValue);
	UFUNCTION()
	void OnRep_EnergyRecharge(const FGameplayAttributeData& OldValue);
	UFUNCTION()
	void OnRep_CurrentEnergy(const FGameplayAttributeData& OldValue);
	UFUNCTION()
	void OnRep_MaxEnergy(const FGameplayAttributeData& OldValue);

private:
	void ClampAttribute(const FGameplayAttribute& Attribute, float& NewValue) const;
};

#undef ATTRIBUTE_ACCESSORS
