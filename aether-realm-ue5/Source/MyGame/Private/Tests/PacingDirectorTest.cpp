#include "Misc/AutomationTest.h"
#include "System/PacingDirectorSubsystem.h"

#if WITH_AUTOMATION_TESTS

/**
 * Unit test skor stress pacing director (fungsi statik murni — deterministik,
 * tanpa World). Jalankan: Editor → Tools → Session Frontend → Automation →
 * cari "AetherRealm.Pacing".
 */

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FPacingComputeStressTest,
	"AetherRealm.Pacing.ComputeStress",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FPacingComputeStressTest::RunTest(const FString&)
{
	// Kondisi aman: HP penuh, tak ada damage/aggro → stress 0
	TestEqual(TEXT("aman = 0"),
		UPacingDirectorSubsystem::ComputeStress(1.f, 0.f, 0.f, 0), 0.f, 0.001f);

	// Kondisi terburuk: HP habis, damage penuh, 5+ aggro, tanpa kill → 1.0 (cap)
	TestEqual(TEXT("terburuk = 1 (clamp)"),
		UPacingDirectorSubsystem::ComputeStress(0.f, 1.f, 0.f, 10), 1.f, 0.001f);

	// HP rendah menaikkan stress
	TestTrue(TEXT("HP rendah > HP penuh"),
		UPacingDirectorSubsystem::ComputeStress(0.2f, 0.f, 0.f, 0)
		> UPacingDirectorSubsystem::ComputeStress(1.f, 0.f, 0.f, 0));

	// Kill rate menurunkan stress (pemain dominan)
	TestTrue(TEXT("kill menurunkan stress"),
		UPacingDirectorSubsystem::ComputeStress(0.5f, 0.5f, 1.f, 2)
		< UPacingDirectorSubsystem::ComputeStress(0.5f, 0.5f, 0.f, 2));

	// Aggro count di-clamp: 5 aggro = 50 aggro
	TestEqual(TEXT("aggro clamp @5"),
		UPacingDirectorSubsystem::ComputeStress(1.f, 0.f, 0.f, 5),
		UPacingDirectorSubsystem::ComputeStress(1.f, 0.f, 0.f, 50), 0.001f);

	// Tidak pernah negatif walau kill relief besar
	TestEqual(TEXT("floor 0 (kill relief besar)"),
		UPacingDirectorSubsystem::ComputeStress(1.f, 0.f, 1.f, 0), 0.f, 0.001f);

	return true;
}

#endif // WITH_AUTOMATION_TESTS
