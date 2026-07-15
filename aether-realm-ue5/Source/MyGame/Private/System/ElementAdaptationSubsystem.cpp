#include "System/ElementAdaptationSubsystem.h"

void UElementAdaptationSubsystem::Tick(float DeltaTime)
{
	// TIDAK panggil Super::Tick — di UTickableWorldSubsystem itu PURE_VIRTUAL
	// stub, manggil = fatal error tiap tick (ke-tangkep review; pola sama
	// dgn ElementalReactionSubsystem/UITweenSubsystem existing yang juga
	// gak manggil Super).

	if (ElementWeights.IsEmpty())
	{
		return;
	}

	const float Decay = FMath::Exp(-DeltaTime / DecayTauSeconds);
	for (auto It = ElementWeights.CreateIterator(); It; ++It)
	{
		It.Value() *= Decay;
		if (It.Value() < 1.f) // bobot receh — buang, biar map gak numpuk elemen mati
		{
			It.RemoveCurrent();
		}
	}
}

void UElementAdaptationSubsystem::ReportElementalDamage(EElement Element, float Damage)
{
	if (Element == EElement::None || Damage <= 0.f)
	{
		return;
	}
	ElementWeights.FindOrAdd(Element) += Damage;
}

float UElementAdaptationSubsystem::GetTotalWeight() const
{
	float Total = 0.f;
	for (const auto& Pair : ElementWeights)
	{
		Total += Pair.Value;
	}
	return Total;
}

EElement UElementAdaptationSubsystem::GetDominantElement() const
{
	EElement Dominant = EElement::None;
	float Best = 0.f;
	for (const auto& Pair : ElementWeights)
	{
		if (Pair.Value > Best)
		{
			Best = Pair.Value;
			Dominant = Pair.Key;
		}
	}
	return Dominant;
}

float UElementAdaptationSubsystem::GetAdaptationRES(EElement Element) const
{
	if (Element == EElement::None)
	{
		return 0.f;
	}

	const float* Weight = ElementWeights.Find(Element);
	if (!Weight)
	{
		return 0.f;
	}

	return ComputeAdaptationRES(*Weight, GetTotalWeight(), ActivationWeight, MaxAdaptationRES);
}

float UElementAdaptationSubsystem::ComputeAdaptationRES(float DominantWeight, float TotalWeight,
	float ActivationWeight, float MaxRES)
{
	if (TotalWeight <= 0.f || ActivationWeight <= 0.f || DominantWeight <= 0.f)
	{
		return 0.f;
	}

	// Dominance: mulai 0 di share 50%, penuh di share 100%. Main variatif
	// (gak ada elemen lewat separuh porsi) = faktor 0 = gak pernah kena.
	const float Share = DominantWeight / TotalWeight;
	const float DominanceFactor = FMath::Clamp((Share - 0.5f) * 2.f, 0.f, 1.f);

	// Volume: musuh butuh "ngeliat" cukup damage dulu sebelum sadar pola.
	const float VolumeFactor = FMath::Clamp(TotalWeight / ActivationWeight, 0.f, 1.f);

	return MaxRES * DominanceFactor * VolumeFactor;
}
