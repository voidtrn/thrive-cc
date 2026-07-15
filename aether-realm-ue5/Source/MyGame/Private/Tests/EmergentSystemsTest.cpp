#include "Misc/AutomationTest.h"
#include "Combat/ElementalReactionSubsystem.h"
#include "System/ElementAdaptationSubsystem.h"
#include "System/OpenWorldGameState.h"

#if WITH_AUTOMATION_TESTS

/**
 * Unit test sistem emergent (weather × element, enemy adaptation) —
 * fungsi statik murni, deterministik, tanpa World.
 * Jalankan: Editor → Tools → Session Frontend → Automation →
 * filter "AetherRealm.Emergent".
 */

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWeatherGaugeMultiplierTest,
	"AetherRealm.Emergent.WeatherGauge",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FWeatherGaugeMultiplierTest::RunTest(const FString&)
{
	using S = UElementalReactionSubsystem;

	// Clear/Cloudy: netral semua elemen
	TestEqual(TEXT("clear = netral"),
		S::GetWeatherGaugeMultiplier(EWeatherType::Clear, EElement::Pyro), 1.f, 0.001f);
	TestEqual(TEXT("cloudy = netral"),
		S::GetWeatherGaugeMultiplier(EWeatherType::Cloudy, EElement::Hydro), 1.f, 0.001f);

	// Rain: Hydro/Electro/Dendro naik, Pyro turun, lainnya netral
	TestEqual(TEXT("rain buff Hydro"),
		S::GetWeatherGaugeMultiplier(EWeatherType::Rain, EElement::Hydro), 1.25f, 0.001f);
	TestEqual(TEXT("rain buff Electro"),
		S::GetWeatherGaugeMultiplier(EWeatherType::Rain, EElement::Electro), 1.15f, 0.001f);
	TestEqual(TEXT("rain nerf Pyro"),
		S::GetWeatherGaugeMultiplier(EWeatherType::Rain, EElement::Pyro), 0.75f, 0.001f);
	TestEqual(TEXT("rain netral Geo"),
		S::GetWeatherGaugeMultiplier(EWeatherType::Rain, EElement::Geo), 1.f, 0.001f);

	// Thunderstorm: Electro paling kuat, Pyro paling lemah
	TestEqual(TEXT("storm buff Electro terbesar"),
		S::GetWeatherGaugeMultiplier(EWeatherType::Thunderstorm, EElement::Electro), 1.3f, 0.001f);
	TestEqual(TEXT("storm nerf Pyro terbesar"),
		S::GetWeatherGaugeMultiplier(EWeatherType::Thunderstorm, EElement::Pyro), 0.6f, 0.001f);

	// Snow: Cryo naik, Pyro turun (lebih ringan dari storm)
	TestEqual(TEXT("snow buff Cryo"),
		S::GetWeatherGaugeMultiplier(EWeatherType::Snow, EElement::Cryo), 1.25f, 0.001f);
	TestEqual(TEXT("snow nerf Pyro ringan"),
		S::GetWeatherGaugeMultiplier(EWeatherType::Snow, EElement::Pyro), 0.8f, 0.001f);

	// None element gak pernah ke-buff cuaca (physical gak punya gauge)
	TestEqual(TEXT("None selalu netral"),
		S::GetWeatherGaugeMultiplier(EWeatherType::Thunderstorm, EElement::None), 1.f, 0.001f);

	return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FElementAdaptationMathTest,
	"AetherRealm.Emergent.AdaptationRES",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FElementAdaptationMathTest::RunTest(const FString&)
{
	using A = UElementAdaptationSubsystem;
	constexpr float Activation = 8000.f;
	constexpr float MaxRES = 0.30f;

	// Belum ada data / input invalid = 0
	TestEqual(TEXT("total 0 = no adaptation"),
		A::ComputeAdaptationRES(0.f, 0.f, Activation, MaxRES), 0.f, 0.001f);
	TestEqual(TEXT("activation 0 = no adaptation (guard)"),
		A::ComputeAdaptationRES(5000.f, 5000.f, 0.f, MaxRES), 0.f, 0.001f);

	// Main variatif: share <= 50% = SELALU 0, berapapun volumenya
	TestEqual(TEXT("share 50% tepat = 0"),
		A::ComputeAdaptationRES(50000.f, 100000.f, Activation, MaxRES), 0.f, 0.001f);
	TestEqual(TEXT("share 30% = 0"),
		A::ComputeAdaptationRES(30000.f, 100000.f, Activation, MaxRES), 0.f, 0.001f);

	// Spam murni 1 elemen + volume penuh = cap MaxRES
	TestEqual(TEXT("share 100% + volume penuh = MaxRES"),
		A::ComputeAdaptationRES(20000.f, 20000.f, Activation, MaxRES), MaxRES, 0.001f);

	// Share 75% + volume penuh = separuh cap (dominance factor 0.5)
	TestEqual(TEXT("share 75% = setengah cap"),
		A::ComputeAdaptationRES(15000.f, 20000.f, Activation, MaxRES), MaxRES * 0.5f, 0.001f);

	// Volume factor: dominan penuh tapi baru separuh activation = separuh cap
	TestEqual(TEXT("volume 50% = setengah cap"),
		A::ComputeAdaptationRES(4000.f, 4000.f, Activation, MaxRES), MaxRES * 0.5f, 0.001f);

	// Monoton: makin dominan makin gede
	TestTrue(TEXT("makin dominan makin gede"),
		A::ComputeAdaptationRES(18000.f, 20000.f, Activation, MaxRES)
			> A::ComputeAdaptationRES(12000.f, 20000.f, Activation, MaxRES));

	return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FAttunementEdgeTest,
	"AetherRealm.Emergent.AttunementEdge",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FAttunementEdgeTest::RunTest(const FString&)
{
	using A = UElementAdaptationSubsystem;
	const float MaxRES = 0.30f;

	// Belum diumumkan + lewat ambang tinggi (0.6 × 0.30 = 0.18) → Rising
	TestTrue(TEXT("rising saat lewat ambang tinggi"),
		A::EvaluateAttunementEdge(0.20f, MaxRES, false) == EAttunementEdge::Rising);

	// Belum diumumkan + di bawah ambang tinggi → None (belum kerasa)
	TestTrue(TEXT("none saat di bawah ambang tinggi, belum announced"),
		A::EvaluateAttunementEdge(0.15f, MaxRES, false) == EAttunementEdge::None);

	// Sudah diumumkan + turun di bawah ambang rendah (0.25 × 0.30 = 0.075) → Falling
	TestTrue(TEXT("falling saat luntur di bawah ambang rendah"),
		A::EvaluateAttunementEdge(0.05f, MaxRES, true) == EAttunementEdge::Falling);

	// Sudah diumumkan + masih di zona hysteresis (antara low & high) → None (gak kedip)
	TestTrue(TEXT("none di zona hysteresis, sudah announced"),
		A::EvaluateAttunementEdge(0.12f, MaxRES, true) == EAttunementEdge::None);

	// MaxRES 0 = rasio 0, gak pernah rising
	TestTrue(TEXT("MaxRES 0 = tak pernah rising"),
		A::EvaluateAttunementEdge(0.f, 0.f, false) == EAttunementEdge::None);

	// Tepat di ambang tinggi = rising (>=)
	TestTrue(TEXT("tepat 0.6 ratio = rising"),
		A::EvaluateAttunementEdge(0.18f, MaxRES, false) == EAttunementEdge::Rising);

	return true;
}

#endif // WITH_AUTOMATION_TESTS
