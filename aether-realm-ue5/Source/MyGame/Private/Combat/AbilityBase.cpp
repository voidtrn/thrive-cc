#include "Combat/AbilityBase.h"
#include "Character/CharacterBase.h"
#include "Kismet/GameplayStatics.h"
#include "Engine/World.h"

UWorld* UAbilityBase::GetWorld() const
{
	// CDO (editor default object) tidak punya world
	if (HasAllFlags(RF_ClassDefaultObject))
	{
		return nullptr;
	}
	// Outer = CombatComponent → world actor
	if (const UObject* Outer = GetOuter())
	{
		return Outer->GetWorld();
	}
	return nullptr;
}

bool UAbilityBase::IsOnCooldown() const
{
	const UWorld* World = GetWorld();
	return World && World->GetTimeSeconds() < CooldownEndTime;
}

float UAbilityBase::GetCooldownRemaining() const
{
	const UWorld* World = GetWorld();
	return World ? FMath::Max(0.f, static_cast<float>(CooldownEndTime - World->GetTimeSeconds())) : 0.f;
}

bool UAbilityBase::CanActivate(const ACharacterBase* Owner) const
{
	if (!Owner || !Owner->IsAlive() || IsOnCooldown())
	{
		return false;
	}
	if (Slot == EAbilitySlot::ElementalBurst && Owner->CurrentEnergy < EnergyCost)
	{
		return false;
	}
	return true;
}

bool UAbilityBase::Activate(ACharacterBase* Owner)
{
	if (!CanActivate(Owner))
	{
		return false;
	}

	CooldownEndTime = Owner->GetWorld()->GetTimeSeconds() + Cooldown;

	if (Slot == EAbilitySlot::ElementalBurst)
	{
		Owner->CurrentEnergy = 0.f; // burst menguras seluruh energy

		// Cinematic: slow motion singkat
		if (SlowMotionDuration > 0.f)
		{
			UGameplayStatics::SetGlobalTimeDilation(Owner, SlowMotionDilation);
			FTimerHandle Handle;
			Owner->GetWorldTimerManager().SetTimer(Handle, [WeakOwner = TWeakObjectPtr<ACharacterBase>(Owner)]()
			{
				if (WeakOwner.IsValid())
				{
					UGameplayStatics::SetGlobalTimeDilation(WeakOwner.Get(), 1.f);
				}
			}, SlowMotionDuration * SlowMotionDilation, false); // real time ≈ duration * dilation

			Owner->PlayBurstShake();
		}
		// i-frame burst: Phase 4 — flag invulnerable di CharacterBase; sekarang durasi disimpan di config.
	}

	if (Montage)
	{
		Owner->PlayAnimMontage(Montage);
	}

	OnActivate(Owner);
	return true;
}
