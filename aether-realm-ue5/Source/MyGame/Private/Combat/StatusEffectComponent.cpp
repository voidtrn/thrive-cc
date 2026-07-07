#include "Combat/StatusEffectComponent.h"
#include "Character/CharacterBase.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "MyGame.h"

UStatusEffectComponent::UStatusEffectComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
}

void UStatusEffectComponent::BeginPlay()
{
	Super::BeginPlay();
	OwnerChar = Cast<ACharacterBase>(GetOwner());
	if (OwnerChar)
	{
		if (const UCharacterMovementComponent* Move = OwnerChar->GetCharacterMovement())
		{
			BaseWalkSpeed = Move->MaxWalkSpeed;
		}
	}
}

void UStatusEffectComponent::ApplyStatus(FName StatusId, EStatusType Type, float Magnitude,
	float Duration, float TickInterval, EElement Element)
{
	if (!OwnerChar || Duration <= 0.f)
	{
		return;
	}

	FStatusEffect* Existing = ActiveStatuses.FindByPredicate(
		[&](const FStatusEffect& S) { return S.StatusId == StatusId; });
	if (Existing)
	{
		Existing->Type = Type;
		Existing->Magnitude = Magnitude;
		Existing->Element = Element;
		Existing->TickInterval = TickInterval;
		Existing->TimeRemaining = Duration;
	}
	else
	{
		FStatusEffect S;
		S.StatusId = StatusId;
		S.Type = Type;
		S.Magnitude = Magnitude;
		S.Element = Element;
		S.TickInterval = TickInterval;
		S.TimeRemaining = Duration;
		S.TimeToNextTick = TickInterval;
		ActiveStatuses.Add(S);
	}

	RecomputeMoveSpeed();
	UpdateStunState();
	OnStatusChanged.Broadcast(ActiveStatuses);
}

void UStatusEffectComponent::RemoveStatus(FName StatusId)
{
	const int32 Removed = ActiveStatuses.RemoveAll([&](const FStatusEffect& S) { return S.StatusId == StatusId; });
	if (Removed > 0)
	{
		RecomputeMoveSpeed();
		UpdateStunState();
		OnStatusChanged.Broadcast(ActiveStatuses);
	}
}

bool UStatusEffectComponent::HasStatus(FName StatusId) const
{
	return ActiveStatuses.ContainsByPredicate([&](const FStatusEffect& S) { return S.StatusId == StatusId; });
}

bool UStatusEffectComponent::IsStunned() const
{
	return ActiveStatuses.ContainsByPredicate([](const FStatusEffect& S) { return S.Type == EStatusType::Stun; });
}

void UStatusEffectComponent::RecomputeMoveSpeed()
{
	if (!OwnerChar || BaseWalkSpeed <= 0.f)
	{
		return;
	}
	float Multiplier = 1.f;
	for (const FStatusEffect& S : ActiveStatuses)
	{
		if (S.Type == EStatusType::MoveSpeedMultiplier)
		{
			Multiplier *= S.Magnitude;
		}
	}
	if (UCharacterMovementComponent* Move = OwnerChar->GetCharacterMovement())
	{
		Move->MaxWalkSpeed = BaseWalkSpeed * Multiplier;
	}
}

void UStatusEffectComponent::UpdateStunState()
{
	if (!OwnerChar)
	{
		return;
	}
	UCharacterMovementComponent* Move = OwnerChar->GetCharacterMovement();
	if (!Move)
	{
		return;
	}

	const bool bStunned = IsStunned();
	if (bStunned && !bMovementDisabledByStun)
	{
		Move->DisableMovement();
		bMovementDisabledByStun = true;
	}
	else if (!bStunned && bMovementDisabledByStun)
	{
		bMovementDisabledByStun = false;
		// Jangan un-freeze: kalau masih frozen, biarkan frozen yang pegang movement.
		if (!OwnerChar->IsFrozen())
		{
			Move->SetMovementMode(MOVE_Walking);
		}
	}
}

void UStatusEffectComponent::TickComponent(float DeltaTime, ELevelTick TickType,
	FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	if (ActiveStatuses.Num() == 0 || !OwnerChar)
	{
		return;
	}

	bool bChanged = false;
	for (int32 i = ActiveStatuses.Num() - 1; i >= 0; --i)
	{
		FStatusEffect& S = ActiveStatuses[i];

		// DOT tick
		if (S.Type == EStatusType::DamageOverTime && S.TickInterval > 0.f)
		{
			S.TimeToNextTick -= DeltaTime;
			if (S.TimeToNextTick <= 0.f)
			{
				OwnerChar->ApplyDamageOverTime(S.Magnitude, S.Element);
				S.TimeToNextTick += S.TickInterval;
			}
		}

		S.TimeRemaining -= DeltaTime;
		if (S.TimeRemaining <= 0.f)
		{
			ActiveStatuses.RemoveAt(i);
			bChanged = true;
		}
	}

	if (bChanged)
	{
		RecomputeMoveSpeed();
		UpdateStunState();
		OnStatusChanged.Broadcast(ActiveStatuses);
	}
}
