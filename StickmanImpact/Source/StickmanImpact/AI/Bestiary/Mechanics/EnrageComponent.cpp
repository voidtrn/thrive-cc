// Copyright StickmanImpact Project.

#include "EnrageComponent.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "Combat/StickmanAttributeSet.h"
#include "AbilitySystemComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "NiagaraFunctionLibrary.h"

UEnrageComponent::UEnrageComponent()
{
	PrimaryComponentTick.bCanEverTick = false;
}

void UEnrageComponent::BeginPlay()
{
	Super::BeginPlay();

	if (const AStickmanEnemyCharacter* Enemy = Cast<AStickmanEnemyCharacter>(GetOwner()))
	{
		if (UStickmanAttributeSet* Attributes = const_cast<UStickmanAttributeSet*>(
				Enemy->GetAbilitySystemComponent() ? Enemy->GetAbilitySystemComponent()->GetSet<UStickmanAttributeSet>() : nullptr))
		{
			Attributes->OnHealthChanged.AddDynamic(this, &UEnrageComponent::HandleHealthChanged);
		}
	}
}

void UEnrageComponent::EndPlay(const EEndPlayReason::Type EndPlayReason)
{
	if (const AStickmanEnemyCharacter* Enemy = Cast<AStickmanEnemyCharacter>(GetOwner()))
	{
		if (UStickmanAttributeSet* Attributes = const_cast<UStickmanAttributeSet*>(
				Enemy->GetAbilitySystemComponent() ? Enemy->GetAbilitySystemComponent()->GetSet<UStickmanAttributeSet>() : nullptr))
		{
			Attributes->OnHealthChanged.RemoveDynamic(this, &UEnrageComponent::HandleHealthChanged);
		}
	}
	Super::EndPlay(EndPlayReason);
}

void UEnrageComponent::HandleHealthChanged(float NewHealth, float MaxHealth)
{
	if (!bEnraged && MaxHealth > 0.f && (NewHealth / MaxHealth) <= EnrageHealthPercent)
	{
		Enrage();
	}
}

void UEnrageComponent::Enrage()
{
	bEnraged = true;

	if (ACharacter* Character = Cast<ACharacter>(GetOwner()))
	{
		Character->GetCharacterMovement()->MaxWalkSpeed *= MoveSpeedMultiplier;
	}
	if (AStickmanEnemyCharacter* Enemy = Cast<AStickmanEnemyCharacter>(GetOwner()))
	{
		if (UStickmanAttributeSet* Attributes = const_cast<UStickmanAttributeSet*>(
				Enemy->GetAbilitySystemComponent() ? Enemy->GetAbilitySystemComponent()->GetSet<UStickmanAttributeSet>() : nullptr))
		{
			Attributes->SetAttack(Attributes->GetAttack() * AttackMultiplier);
		}
	}
	if (EnrageVFX)
	{
		UNiagaraFunctionLibrary::SpawnSystemAttached(EnrageVFX,
			Cast<ACharacter>(GetOwner()) ? Cast<ACharacter>(GetOwner())->GetMesh() : GetOwner()->GetRootComponent(),
			NAME_None, FVector::ZeroVector, FRotator::ZeroRotator, EAttachLocation::SnapToTarget, true);
	}

	OnEnraged.Broadcast();
}
