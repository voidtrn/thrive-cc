// Copyright StickmanImpact Project.

#include "StickmanEnemyCharacter.h"
#include "Combat/StickmanAbilitySystemComponent.h"
#include "Combat/StickmanAttributeSet.h"

AStickmanEnemyCharacter::AStickmanEnemyCharacter()
{
	AbilitySystemComponent = CreateDefaultSubobject<UStickmanAbilitySystemComponent>(TEXT("AbilitySystemComponent"));
	AbilitySystemComponent->SetIsReplicated(true);
	AbilitySystemComponent->SetReplicationMode(EGameplayEffectReplicationMode::Minimal);

	AttributeSet = CreateDefaultSubobject<UStickmanAttributeSet>(TEXT("AttributeSet"));
}

void AStickmanEnemyCharacter::BeginPlay()
{
	Super::BeginPlay();

	PatrolOrigin = GetActorLocation();

	if (AbilitySystemComponent)
	{
		AbilitySystemComponent->InitAbilityActorInfo(this, this);
		if (AttributeSet)
		{
			AttributeSet->InitHealth(Stats.MaxHealth);
			AttributeSet->InitMaxHealth(Stats.MaxHealth);
			AttributeSet->InitStamina(Stats.MaxStamina);
			AttributeSet->InitMaxStamina(Stats.MaxStamina);
			AttributeSet->InitAttack(Stats.Attack);
			AttributeSet->InitDefense(Stats.Defense);
			AttributeSet->InitElementalMastery(Stats.ElementalMastery);
			AttributeSet->InitEnergyRecharge(Stats.EnergyRecharge);
		}
		AbilitySystemComponent->GrantDefaultAbilities(DefaultAbilities);
	}
}

UAbilitySystemComponent* AStickmanEnemyCharacter::GetAbilitySystemComponent() const
{
	return AbilitySystemComponent;
}

FGameplayTag AStickmanEnemyCharacter::SelectWeightedAttack() const
{
	if (WeightedAttacks.Num() == 0)
	{
		return FGameplayTag();
	}

	float TotalWeight = 0.f;
	for (const FStickmanWeightedAttack& Attack : WeightedAttacks)
	{
		TotalWeight += FMath::Max(Attack.Weight, 0.f);
	}
	if (TotalWeight <= 0.f)
	{
		return WeightedAttacks[0].SkillTag;
	}

	float Roll = FMath::FRandRange(0.f, TotalWeight);
	for (const FStickmanWeightedAttack& Attack : WeightedAttacks)
	{
		Roll -= FMath::Max(Attack.Weight, 0.f);
		if (Roll <= 0.f)
		{
			return Attack.SkillTag;
		}
	}
	return WeightedAttacks.Last().SkillTag;
}

float AStickmanEnemyCharacter::GetHealthPercent() const
{
	if (!AttributeSet || AttributeSet->GetMaxHealth() <= 0.f)
	{
		return 1.f;
	}
	return AttributeSet->GetHealth() / AttributeSet->GetMaxHealth();
}
