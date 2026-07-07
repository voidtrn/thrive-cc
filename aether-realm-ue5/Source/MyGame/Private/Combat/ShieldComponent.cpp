#include "Combat/ShieldComponent.h"
#include "MyGame.h"

UShieldComponent::UShieldComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
}

float UShieldComponent::ElementMultiplier(EElement ShieldElement, EElement DamageElement)
{
	// Shield berelemen 2.5× lebih efektif menyerap elemen yang sama.
	return (ShieldElement != EElement::None && ShieldElement == DamageElement) ? 2.5f : 1.f;
}

void UShieldComponent::ApplyShield(FName SourceId, EElement Element, float BaseAmount, float Duration)
{
	if (BaseAmount <= 0.f || Duration <= 0.f)
	{
		return;
	}

	const float Amount = BaseAmount * (1.f + ExtraShieldStrength);

	// SourceId sama = refresh: ambil yang lebih besar, reset timer (Genshin behavior).
	FActiveShield* Existing = ActiveShields.FindByPredicate(
		[&](const FActiveShield& S) { return S.SourceId == SourceId; });
	if (Existing)
	{
		Existing->Amount = FMath::Max(Existing->Amount, Amount);
		Existing->Element = Element;
		Existing->TimeRemaining = Duration;
	}
	else
	{
		FActiveShield Shield;
		Shield.SourceId = SourceId;
		Shield.Element = Element;
		Shield.Amount = Amount;
		Shield.TimeRemaining = Duration;
		ActiveShields.Add(Shield);
	}

	OnShieldChanged.Broadcast(GetTotalShield());
}

float UShieldComponent::AbsorbDamage(float Damage, EElement DamageElement)
{
	if (Damage <= 0.f || ActiveShields.Num() == 0)
	{
		return Damage;
	}

	float Remaining = Damage;
	bool bAnyBroken = false;

	// Serap dari shield paling lama (index awal) dulu.
	for (FActiveShield& Shield : ActiveShields)
	{
		if (Remaining <= 0.f)
		{
			break;
		}
		const float Mult = ElementMultiplier(Shield.Element, DamageElement);
		const float Capacity = Shield.Amount * Mult; // damage yang bisa diserap
		const float Absorbed = FMath::Min(Remaining, Capacity);
		Remaining -= Absorbed;
		Shield.Amount -= Absorbed / Mult; // kurangi shield sesuai efektivitas
		if (Shield.Amount <= KINDA_SMALL_NUMBER)
		{
			Shield.Amount = 0.f;
			bAnyBroken = true;
		}
	}

	ActiveShields.RemoveAll([](const FActiveShield& S) { return S.Amount <= 0.f; });

	OnShieldChanged.Broadcast(GetTotalShield());
	if (bAnyBroken && ActiveShields.Num() == 0)
	{
		OnShieldBroken.Broadcast();
	}

	return Remaining;
}

float UShieldComponent::GetTotalShield() const
{
	float Total = 0.f;
	for (const FActiveShield& S : ActiveShields)
	{
		Total += S.Amount;
	}
	return Total;
}

void UShieldComponent::ClearAllShields()
{
	if (ActiveShields.Num() > 0)
	{
		ActiveShields.Reset();
		OnShieldChanged.Broadcast(0.f);
	}
}

void UShieldComponent::TickComponent(float DeltaTime, ELevelTick TickType,
	FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	if (ActiveShields.Num() == 0)
	{
		return;
	}

	bool bChanged = false;
	for (int32 i = ActiveShields.Num() - 1; i >= 0; --i)
	{
		ActiveShields[i].TimeRemaining -= DeltaTime;
		if (ActiveShields[i].TimeRemaining <= 0.f)
		{
			ActiveShields.RemoveAt(i);
			bChanged = true;
		}
	}
	if (bChanged)
	{
		OnShieldChanged.Broadcast(GetTotalShield());
	}
}
