#include "System/ElementAdaptationSubsystem.h"
#include "System/SessionChronicleSubsystem.h"
#include "Engine/GameInstance.h"

namespace
{
	// EElement → FName stabil buat ContextId chronicle / arg delegate. UI yang
	// petakan ke teks terlokalisasi (disiplin ANTISIPASI #8).
	FName ElementToName(EElement Element)
	{
		switch (Element)
		{
		case EElement::Pyro:    return TEXT("Pyro");
		case EElement::Hydro:   return TEXT("Hydro");
		case EElement::Cryo:    return TEXT("Cryo");
		case EElement::Electro: return TEXT("Electro");
		case EElement::Anemo:   return TEXT("Anemo");
		case EElement::Geo:     return TEXT("Geo");
		case EElement::Dendro:  return TEXT("Dendro");
		default:                return NAME_None;
		}
	}
}

void UElementAdaptationSubsystem::Tick(float DeltaTime)
{
	// TIDAK panggil Super::Tick — di UTickableWorldSubsystem itu PURE_VIRTUAL
	// stub, manggil = fatal error tiap tick (ke-tangkep review; pola sama
	// dgn ElementalReactionSubsystem/UITweenSubsystem existing yang juga
	// gak manggil Super).

	if (ElementWeights.IsEmpty())
	{
		// Semua bobot sudah decay habis — reset latch pengumuman (player
		// berhenti nyerang lama, "dunia lupa" → bisa diumumkan lagi nanti).
		// UpdateAttunementAnnouncement lihat Dominant==None → clear latch
		// eksplisit di cabang pertamanya.
		if (AnnouncedElement != EElement::None)
		{
			UpdateAttunementAnnouncement();
		}
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

	UpdateAttunementAnnouncement();
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

EAttunementEdge UElementAdaptationSubsystem::EvaluateAttunementEdge(
	float CurrentRES, float MaxRES, bool bAnnounced)
{
	// Hysteresis lebar: umumkan begitu efek "kerasa" (60% cap), reset kalau
	// sudah luntur jelas (25% cap). Gap lebar = decay/regain kecil di sekitar
	// ambang gak bikin toast kedip-kedip.
	constexpr float HighRatio = 0.6f;
	constexpr float LowRatio = 0.25f;

	const float Ratio = MaxRES > 0.f ? CurrentRES / MaxRES : 0.f;

	if (!bAnnounced && Ratio >= HighRatio)
	{
		return EAttunementEdge::Rising;
	}
	if (bAnnounced && Ratio < LowRatio)
	{
		return EAttunementEdge::Falling;
	}
	return EAttunementEdge::None;
}

void UElementAdaptationSubsystem::UpdateAttunementAnnouncement()
{
	// Server-only (map client selalu kosong, tapi guard tegas biar konsisten
	// dgn penulis chronicle lain — mis. PacingDirector::EmitHighlight).
	const UWorld* World = GetWorld();
	if (!World || World->GetNetMode() == NM_Client)
	{
		return;
	}

	const EElement Dominant = GetDominantElement();

	// Tak ada elemen dominan lagi (semua bobot decay / netral) sementara masih
	// ke-latch = falling edge eksplisit: bersihkan latch di sini, TIDAK
	// bergantung side-effect reset di bawah (biar refactor cabang berikut gak
	// diam-diam bikin latch nyangkut selamanya — review finding).
	if (Dominant == EElement::None)
	{
		AnnouncedElement = EElement::None;
		return;
	}

	// Elemen dominan berpindah sementara masih ke-latch elemen lama → reset
	// latch lama dulu, biar elemen baru bisa fire rising sendiri.
	if (AnnouncedElement != EElement::None && Dominant != AnnouncedElement)
	{
		AnnouncedElement = EElement::None;
	}

	const float CurrentRES = GetAdaptationRES(Dominant);
	const bool bAnnounced = (AnnouncedElement == Dominant);

	switch (EvaluateAttunementEdge(CurrentRES, MaxAdaptationRES, bAnnounced))
	{
	case EAttunementEdge::Rising:
	{
		AnnouncedElement = Dominant;
		OnWorldAttuned.Broadcast(Dominant);

		// Chronicle: "dunia belajar gayamu" — momen memoar self-reference.
		if (const UGameInstance* GI = World->GetGameInstance())
		{
			if (USessionChronicleSubsystem* Chronicle = GI->GetSubsystem<USessionChronicleSubsystem>())
			{
				Chronicle->RecordMoment(TEXT("WorldAttuned"), ElementToName(Dominant),
					FVector::ZeroVector, 0.5f);
			}
		}
		break;
	}
	case EAttunementEdge::Falling:
		AnnouncedElement = EElement::None;
		break;

	case EAttunementEdge::None:
	default:
		break;
	}
}
