#include "Combat/BuffComponent.h"
#include "Character/CharacterBase.h"

UBuffComponent::UBuffComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
}

void UBuffComponent::BeginPlay()
{
	Super::BeginPlay();
	OwnerChar = Cast<ACharacterBase>(GetOwner());
}

void UBuffComponent::ApplyDelta(EArtifactStat Stat, float Delta, float Sign)
{
	if (!OwnerChar)
	{
		return;
	}
	const float V = Delta * Sign;

	switch (Stat)
	{
	case EArtifactStat::ATK:              OwnerChar->ATK += V; break;
	case EArtifactStat::DEF:              OwnerChar->DEF += V; break;
	case EArtifactStat::ElementalMastery: OwnerChar->ElementalMastery += V; break;
	case EArtifactStat::CritRate:         OwnerChar->CritRate += V; break;
	case EArtifactStat::CritDMG:          OwnerChar->CritDMG += V; break;
	case EArtifactStat::EnergyRecharge:   OwnerChar->EnergyRecharge += V; break;
	case EArtifactStat::HP:               OwnerChar->MaxHP += V; break;
	default: break; // percent stat: konversi ke flat sebelum ApplyBuff
	}
}

void UBuffComponent::ApplyBuff(FName BuffId, EArtifactStat Stat, float Delta, float Duration)
{
	// BuffId sama = refresh (revert lama dulu, apply baru)
	RemoveBuff(BuffId);

	ApplyDelta(Stat, Delta, +1.f);

	FActiveBuff Buff;
	Buff.BuffId = BuffId;
	Buff.Stat = Stat;
	Buff.Delta = Delta;
	Buff.TimeRemaining = Duration;
	ActiveBuffs.Add(Buff);

	OnBuffsChanged.Broadcast(ActiveBuffs);
}

void UBuffComponent::RemoveBuff(FName BuffId)
{
	for (int32 i = ActiveBuffs.Num() - 1; i >= 0; --i)
	{
		if (ActiveBuffs[i].BuffId == BuffId)
		{
			ApplyDelta(ActiveBuffs[i].Stat, ActiveBuffs[i].Delta, -1.f); // revert
			ActiveBuffs.RemoveAt(i);
		}
	}
	OnBuffsChanged.Broadcast(ActiveBuffs);
}

void UBuffComponent::TickComponent(float DeltaTime, ELevelTick TickType,
	FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	bool bChanged = false;
	for (int32 i = ActiveBuffs.Num() - 1; i >= 0; --i)
	{
		ActiveBuffs[i].TimeRemaining -= DeltaTime;
		if (ActiveBuffs[i].TimeRemaining <= 0.f)
		{
			ApplyDelta(ActiveBuffs[i].Stat, ActiveBuffs[i].Delta, -1.f);
			ActiveBuffs.RemoveAt(i);
			bChanged = true;
		}
	}
	if (bChanged)
	{
		OnBuffsChanged.Broadcast(ActiveBuffs);
	}
}
