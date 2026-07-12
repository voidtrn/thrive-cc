// Copyright StickmanImpact Project.

#include "ElementAbsorptionComponent.h"
#include "Character/StickmanCharacter.h"
#include "Combat/StickmanAbilitySystemComponent.h"
#include "Combat/StickmanAttributeSet.h"
#include "Combat/Abilities/GA_NormalAttack.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "NiagaraFunctionLibrary.h"
#include "TimerManager.h"

bool UElementAbsorptionComponent::Absorb(EStickmanElement Element)
{
	AStickmanCharacter* Character = Cast<AStickmanCharacter>(GetOwner());
	if (!Character || Element == EStickmanElement::None)
	{
		return false;
	}

	const double Now = GetWorld()->GetTimeSeconds();
	if (const double* Last = LastAbsorbTime.Find(Element))
	{
		if (Now - *Last < PerElementCooldown)
		{
			return false; // Per-element internal cooldown.
		}
	}
	LastAbsorbTime.Add(Element, Now);

	switch (Element)
	{
		case EStickmanElement::Pyro:
		{
			// Weapon infusion: normal attacks carry Pyro for the duration.
			if (UStickmanAbilitySystemComponent* ASC = Character->GetStickmanAbilitySystemComponent())
			{
				if (UStickmanGameplayAbility* NormalAttack =
						ASC->FindGrantedAbilityForSkillTag(Character->GetNormalAttackSkillTag()))
				{
					NormalAttack->SkillData.Element = EStickmanElement::Pyro;
				}
			}
			break;
		}
		case EStickmanElement::Cryo:
		{
			if (UStickmanAttributeSet* Attributes = Character->GetStickmanAttributeSet())
			{
				Attributes->SetDefense(Attributes->GetDefense() * CryoDefenseMultiplier);
			}
			break;
		}
		case EStickmanElement::Electro:
		{
			Character->GetCharacterMovement()->MaxWalkSpeed *= ElectroSpeedMultiplier;
			break;
		}
		default:
			return false; // Only Pyro/Cryo/Electro absorbable per the design spec.
	}

	if (AbsorptionVFX)
	{
		UNiagaraFunctionLibrary::SpawnSystemAttached(AbsorptionVFX, Character->GetRootComponent(), NAME_None,
			FVector::ZeroVector, FRotator::ZeroRotator, EAttachLocation::KeepRelativeOffset, true);
	}

	OnElementAbsorbed.Broadcast(Element, BuffDuration);

	GetWorld()->GetTimerManager().SetTimer(BuffExpireTimerHandle,
		FTimerDelegate::CreateUObject(this, &UElementAbsorptionComponent::ExpireBuff, Element), BuffDuration, false);
	return true;
}

void UElementAbsorptionComponent::ExpireBuff(EStickmanElement Element)
{
	AStickmanCharacter* Character = Cast<AStickmanCharacter>(GetOwner());
	if (!Character)
	{
		return;
	}

	switch (Element)
	{
		case EStickmanElement::Pyro:
			if (UStickmanAbilitySystemComponent* ASC = Character->GetStickmanAbilitySystemComponent())
			{
				if (UStickmanGameplayAbility* NormalAttack =
						ASC->FindGrantedAbilityForSkillTag(Character->GetNormalAttackSkillTag()))
				{
					NormalAttack->SkillData.Element = EStickmanElement::None;
				}
			}
			break;
		case EStickmanElement::Cryo:
			if (UStickmanAttributeSet* Attributes = Character->GetStickmanAttributeSet())
			{
				Attributes->SetDefense(Attributes->GetDefense() / CryoDefenseMultiplier);
			}
			break;
		case EStickmanElement::Electro:
			Character->GetCharacterMovement()->MaxWalkSpeed /= ElectroSpeedMultiplier;
			break;
		default:
			break;
	}
}
