#include "Misc/AutomationTest.h"
#include "Combat/DamageCalculator.h"

#if WITH_AUTOMATION_TESTS

/**
 * Unit test formula damage (fungsi statik murni — deterministik).
 * Jalankan: Editor → Tools → Session Frontend → Automation →
 * cari "AetherRealm.Damage".
 */

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FDamageDefReductionTest,
	"AetherRealm.Damage.DefReduction",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FDamageDefReductionTest::RunTest(const FString&)
{
	// DEFReduction = (Atk+100) / ((Vic+100) + (Atk+100))
	// Level sama → 0.5 (musuh menyerap separuh)
	TestEqual(TEXT("level sama = 0.5"),
		UDamageCalculator::DefReduction(90, 90), 0.5f, 0.001f);

	// Penyerang jauh lebih tinggi → mendekati 1.0
	const float High = UDamageCalculator::DefReduction(90, 1);
	TestTrue(TEXT("attacker >> victim mendekati 1"), High > 0.65f && High < 1.f);

	// Penyerang jauh lebih rendah → < 0.5
	TestTrue(TEXT("attacker << victim < 0.5"),
		UDamageCalculator::DefReduction(1, 90) < 0.5f);

	return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FDamageResMultiplierTest,
	"AetherRealm.Damage.ResMultiplier",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FDamageResMultiplierTest::RunTest(const FString&)
{
	// RES 0% → x1.0
	TestEqual(TEXT("RES 0"), UDamageCalculator::ResMultiplier(0.f), 1.f, 0.001f);
	// RES 10% → 1 - 0.1/2 = 0.95
	TestEqual(TEXT("RES 10%"), UDamageCalculator::ResMultiplier(0.1f), 0.95f, 0.001f);
	// RES 100% (immune-ish) → 1 - 0.5 = 0.5
	TestEqual(TEXT("RES 100%"), UDamageCalculator::ResMultiplier(1.f), 0.5f, 0.001f);
	// RES negatif -50% → 1 - (-0.5/4) = 1.125 (bonus damage, formula /4)
	TestEqual(TEXT("RES negatif pakai /4"),
		UDamageCalculator::ResMultiplier(-0.5f), 1.125f, 0.001f);

	return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FDamageEmBonusTest,
	"AetherRealm.Damage.EmBonus",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FDamageEmBonusTest::RunTest(const FString&)
{
	// EM 0 → 0 bonus
	TestEqual(TEXT("amp EM 0"), UDamageCalculator::AmpEmBonus(0.f), 0.f, 0.001f);
	// EM 100 → 2.78*100/1500 ≈ 0.1853
	TestEqual(TEXT("amp EM 100"),
		UDamageCalculator::AmpEmBonus(100.f), 2.78f * 100.f / 1500.f, 0.001f);
	// Monoton naik
	TestTrue(TEXT("amp EM naik"),
		UDamageCalculator::AmpEmBonus(200.f) > UDamageCalculator::AmpEmBonus(100.f));

	// Transformative EM 0 → 0
	TestEqual(TEXT("trans EM 0"), UDamageCalculator::TransformativeEmBonus(0.f), 0.f, 0.001f);
	TestTrue(TEXT("trans EM naik"),
		UDamageCalculator::TransformativeEmBonus(100.f) > 0.f);

	return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FDamageTransformativeBaseTest,
	"AetherRealm.Damage.TransformativeBase",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FDamageTransformativeBaseTest::RunTest(const FString&)
{
	// TransformativeBaseDamage = 17.17 * Level * ReactionCoefficient
	TestEqual(TEXT("level 0 = 0 damage"),
		UDamageCalculator::TransformativeBaseDamage(0, 1.f), 0.f, 0.001f);
	TestEqual(TEXT("coefficient 0 = 0 damage"),
		UDamageCalculator::TransformativeBaseDamage(90, 0.f), 0.f, 0.001f);
	TestEqual(TEXT("level 90, coefficient 1 = 17.17*90"),
		UDamageCalculator::TransformativeBaseDamage(90, 1.f), 17.17f * 90.f, 0.01f);
	TestTrue(TEXT("monoton naik thd level"),
		UDamageCalculator::TransformativeBaseDamage(90, 1.f) > UDamageCalculator::TransformativeBaseDamage(50, 1.f));
	TestTrue(TEXT("monoton naik thd coefficient"),
		UDamageCalculator::TransformativeBaseDamage(90, 2.f) > UDamageCalculator::TransformativeBaseDamage(90, 1.f));

	return true;
}

/** Shattering Ice resonance (2 Cryo): +crit rate vs frozen. RESONANCE_SYSTEM.md. */
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FDamageEffectiveCritRateTest,
	"AetherRealm.Damage.EffectiveCritRate",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FDamageEffectiveCritRateTest::RunTest(const FString&)
{
	// Victim tidak frozen → bonus resonance tidak berlaku, base rate saja.
	TestEqual(TEXT("not frozen: base rate only"),
		UDamageCalculator::EffectiveCritRate(0.05f, false, 0.15f), 0.05f, 0.001f);

	// Victim frozen tapi resonance tidak aktif (bonus 0) → base rate saja.
	TestEqual(TEXT("frozen, no resonance: base rate only"),
		UDamageCalculator::EffectiveCritRate(0.05f, true, 0.f), 0.05f, 0.001f);

	// Victim frozen + Shattering Ice aktif → base + 15%.
	TestEqual(TEXT("frozen + resonance: base + bonus"),
		UDamageCalculator::EffectiveCritRate(0.05f, true, 0.15f), 0.20f, 0.001f);

	return true;
}

#endif // WITH_AUTOMATION_TESTS
