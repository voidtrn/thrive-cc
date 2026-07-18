// Copyright StickmanImpact Project.

#include "AwakeningComponent.h"
#include "Character/StickmanCharacter.h"
#include "Combat/StickmanAttributeSet.h"
#include "Audio/StickmanAudioManager.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "NiagaraFunctionLibrary.h"
#include "TimerManager.h"

UAwakeningComponent::UAwakeningComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
}

AStickmanCharacter* UAwakeningComponent::GetOwnerCharacter() const
{
	return Cast<AStickmanCharacter>(GetOwner());
}

void UAwakeningComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	if (!bAwakened)
	{
		return;
	}

	// Rapid HP regen while awakened.
	if (const AStickmanCharacter* Character = GetOwnerCharacter())
	{
		if (UStickmanAttributeSet* Attributes = Character->GetStickmanAttributeSet())
		{
			const float NewHealth = FMath::Min(Attributes->GetHealth() + HealPerSecond * DeltaTime, Attributes->GetMaxHealth());
			Attributes->SetHealth(NewHealth);
		}
	}
}

void UAwakeningComponent::AddGauge(float Amount)
{
	if (bAwakened || Amount <= 0.f)
	{
		return;
	}
	if (GetWorld()->GetTimeSeconds() < GaugeLockedUntil)
	{
		return; // locked out post-awakening
	}

	// Desperation: fills faster at low HP.
	float Scaled = Amount;
	if (const AStickmanCharacter* Character = GetOwnerCharacter())
	{
		if (const UStickmanAttributeSet* Attributes = Character->GetStickmanAttributeSet())
		{
			if (Attributes->GetMaxHealth() > 0.f && Attributes->GetHealth() / Attributes->GetMaxHealth() < 0.3f)
			{
				Scaled *= LowHPGaugeMultiplier;
			}
		}
	}

	Gauge = FMath::Min(Gauge + Scaled, MaxGauge);
	OnAwakeningGaugeChanged.Broadcast(GetGaugeFraction());
}

bool UAwakeningComponent::Activate()
{
	if (bAwakened || Gauge < MaxGauge || ActivationsUsed >= MaxActivationsPerBattle)
	{
		return false;
	}

	bAwakened = true;
	++ActivationsUsed;
	Gauge = 0.f;
	OnAwakeningGaugeChanged.Broadcast(0.f);

	if (Form.AuraVFX)
	{
		if (const AStickmanCharacter* Character = GetOwnerCharacter())
		{
			UNiagaraFunctionLibrary::SpawnSystemAttached(Form.AuraVFX, Character->GetMesh(), NAME_None,
				FVector::ZeroVector, FRotator::ZeroRotator, EAttachLocation::SnapToTarget, true);
		}
	}
	if (Form.ActivationVoiceLine)
	{
		if (const UGameInstance* GI = GetOwner()->GetGameInstance())
		{
			if (UStickmanAudioManager* Audio = GI->GetSubsystem<UStickmanAudioManager>())
			{
				Audio->PlaySFX(Form.ActivationVoiceLine, GetOwner()->GetActorLocation());
			}
		}
	}

	OnAwakeningBegin();
	OnAwakeningStateChanged.Broadcast(true);

	GetWorld()->GetTimerManager().SetTimer(DurationTimerHandle, this, &UAwakeningComponent::EndAwakening, Duration, false);
	return true;
}

void UAwakeningComponent::EndAwakening()
{
	bAwakened = false;
	ExhaustUntil = GetWorld()->GetTimeSeconds() + ExhaustDuration;
	GaugeLockedUntil = GetWorld()->GetTimeSeconds() + GaugeLockAfter;

	OnAwakeningEnd();
	OnAwakeningStateChanged.Broadcast(false);
}

float UAwakeningComponent::GetStatMultiplier() const
{
	if (bAwakened)
	{
		return StatBonus;
	}
	if (GetWorld() && GetWorld()->GetTimeSeconds() < ExhaustUntil)
	{
		return ExhaustStats; // post-awakening exhaustion penalty
	}
	return 1.f;
}
