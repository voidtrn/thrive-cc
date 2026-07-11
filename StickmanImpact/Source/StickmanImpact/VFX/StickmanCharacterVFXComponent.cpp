// Copyright StickmanImpact Project.

#include "StickmanCharacterVFXComponent.h"
#include "VFXManager.h"
#include "Character/StickmanCharacter.h"
#include "Character/StickmanGameplayTags.h"
#include "UI/StickmanDamageNumberTypes.h"
#include "NiagaraComponent.h"
#include "NiagaraFunctionLibrary.h"

UStickmanCharacterVFXComponent::UStickmanCharacterVFXComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
}

void UStickmanCharacterVFXComponent::UpdateStateLoop(TObjectPtr<UNiagaraComponent>& LoopComponent,
	UNiagaraSystem* System, bool bShouldBeActive)
{
	if (bShouldBeActive)
	{
		if (!LoopComponent && System)
		{
			const AStickmanCharacter* Character = Cast<AStickmanCharacter>(GetOwner());
			UVFXManager* VFX = GetOwner() ? GetOwner()->FindComponentByClass<UVFXManager>() : nullptr;
			if (VFX && Character)
			{
				LoopComponent = VFX->SpawnVFXAttached(System, Character->GetRootComponent());
			}
		}
	}
	else if (LoopComponent)
	{
		LoopComponent->Deactivate(); // Returns to the VFXManager pool via OnSystemFinished.
		LoopComponent = nullptr;
	}
}

void UStickmanCharacterVFXComponent::TickComponent(float DeltaTime, ELevelTick TickType,
	FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	const AStickmanCharacter* Character = Cast<AStickmanCharacter>(GetOwner());
	if (!Character)
	{
		return;
	}

	using namespace StickmanGameplayTags;
	const FGameplayTag Tag = Character->GetCurrentMovementTag();

	UpdateStateLoop(DashTrailComponent, DashTrailVFX, Tag == State_Movement_Dashing);
	UpdateStateLoop(SprintWindComponent, SprintWindVFX, Tag == State_Movement_Sprinting);
	UpdateStateLoop(GlideWindComponent, GlideWindLinesVFX, Tag == State_Movement_Gliding);
	UpdateStateLoop(SwimSplashComponent, SwimSplashVFX, Tag == State_Movement_Swimming);

	// Landing impact: airborne last tick, grounded now.
	const bool bIsAirborne = Tag == State_Movement_Falling || Tag == State_Movement_Jumping
		|| Tag == State_Movement_Gliding;
	if (bWasAirborne && !bIsAirborne && LandingImpactVFX)
	{
		if (UVFXManager* VFX = GetOwner()->FindComponentByClass<UVFXManager>())
		{
			VFX->SpawnVFX(LandingImpactVFX, Character->GetActorLocation() - FVector(0.f, 0.f, 80.f),
				FRotator::ZeroRotator);
		}
	}
	bWasAirborne = bIsAirborne;
	LastMovementTag = Tag;
}

void UStickmanCharacterVFXComponent::SetElement(EStickmanElement Element)
{
	const FLinearColor ElementColor = UStickmanDamageNumberStatics::GetElementColor(Element);
	const AStickmanCharacter* Character = Cast<AStickmanCharacter>(GetOwner());
	UVFXManager* VFX = GetOwner() ? GetOwner()->FindComponentByClass<UVFXManager>() : nullptr;
	if (!Character || !VFX)
	{
		return;
	}

	if (!AuraComponent && ElementalAuraVFX)
	{
		AuraComponent = VFX->SpawnVFXAttached(ElementalAuraVFX, Character->GetRootComponent());
	}
	if (AuraComponent)
	{
		AuraComponent->SetColorParameter(TEXT("ElementColor"), ElementColor);
	}

	if (!WeaponTrailComponent && WeaponTrailVFX && Character->GetMesh())
	{
		WeaponTrailComponent = VFX->SpawnVFXAttached(WeaponTrailVFX, Character->GetMesh(), WeaponSocketName);
	}
	if (WeaponTrailComponent)
	{
		WeaponTrailComponent->SetColorParameter(TEXT("ElementColor"), ElementColor);
	}
}
