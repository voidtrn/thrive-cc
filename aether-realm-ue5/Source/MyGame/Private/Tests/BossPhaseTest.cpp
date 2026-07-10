#include "Misc/AutomationTest.h"
#include "Character/EnemyBoss.h"

#if WITH_AUTOMATION_TESTS

/**
 * Unit test index phase boss (fungsi statik murni — deterministik, tanpa World).
 * Jalankan: Editor → Tools → Session Frontend → Automation →
 * cari "AetherRealm.Boss".
 */

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FBossPhaseIndexTest,
	"AetherRealm.Boss.PhaseIndex",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FBossPhaseIndexTest::RunTest(const FString&)
{
	const TArray<float> Thresholds = { 0.7f, 0.4f };

	TestEqual(TEXT("full HP = phase 0"),
		AEnemyBoss::ComputePhaseIndex(1.f, Thresholds), 0);
	TestEqual(TEXT("HP 71% = masih phase 0"),
		AEnemyBoss::ComputePhaseIndex(0.71f, Thresholds), 0);
	TestEqual(TEXT("HP 70% tepat = phase 1"),
		AEnemyBoss::ComputePhaseIndex(0.7f, Thresholds), 1);
	TestEqual(TEXT("HP 50% = masih phase 1"),
		AEnemyBoss::ComputePhaseIndex(0.5f, Thresholds), 1);
	TestEqual(TEXT("HP 40% tepat = phase 2"),
		AEnemyBoss::ComputePhaseIndex(0.4f, Thresholds), 2);
	TestEqual(TEXT("HP 10% = phase 2 (max, tak lewat)"),
		AEnemyBoss::ComputePhaseIndex(0.1f, Thresholds), 2);
	TestEqual(TEXT("thresholds kosong = selalu phase 0"),
		AEnemyBoss::ComputePhaseIndex(0.f, TArray<float>{}), 0);

	return true;
}

#endif // WITH_AUTOMATION_TESTS
