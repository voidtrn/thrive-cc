#include "Misc/AutomationTest.h"
#include "System/SessionChronicleSubsystem.h"

#if WITH_AUTOMATION_TESTS

/**
 * Unit test seleksi peak memoar (fungsi statik murni — deterministik, tanpa
 * World). Jalankan: Editor → Tools → Session Frontend → Automation →
 * cari "AetherRealm.Chronicle".
 */

namespace
{
	FChronicleEntry MakeEntry(float Intensity, float SessionSeconds)
	{
		FChronicleEntry E;
		E.Type = TEXT("Test");
		E.Intensity = Intensity;
		E.SessionSeconds = SessionSeconds;
		return E;
	}
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FChronicleSelectTopMomentsTest,
	"AetherRealm.Chronicle.SelectTopMoments",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FChronicleSelectTopMomentsTest::RunTest(const FString&)
{
	TArray<FChronicleEntry> Moments;
	Moments.Add(MakeEntry(0.3f, 10.f));
	Moments.Add(MakeEntry(0.9f, 20.f));
	Moments.Add(MakeEntry(0.6f, 30.f));
	Moments.Add(MakeEntry(0.9f, 40.f)); // intensitas seri dgn #2, lebih baru

	// Urut intensitas turun; seri → lebih baru duluan
	TArray<FChronicleEntry> Top = USessionChronicleSubsystem::SelectTopMoments(Moments, 3);
	TestEqual(TEXT("ambil 3"), Top.Num(), 3);
	TestEqual(TEXT("#1 = intensitas 0.9 paling baru (40s)"), Top[0].SessionSeconds, 40.f, 0.001f);
	TestEqual(TEXT("#2 = intensitas 0.9 lebih lama (20s)"), Top[1].SessionSeconds, 20.f, 0.001f);
	TestEqual(TEXT("#3 = intensitas 0.6"), Top[2].Intensity, 0.6f, 0.001f);

	// MaxCount > jumlah = kembalikan semua
	TestEqual(TEXT("MaxCount besar = semua"),
		USessionChronicleSubsystem::SelectTopMoments(Moments, 10).Num(), 4);

	// Input kosong = kosong
	TestEqual(TEXT("kosong = kosong"),
		USessionChronicleSubsystem::SelectTopMoments({}, 3).Num(), 0);

	// MaxCount 0 = kosong
	TestEqual(TEXT("MaxCount 0 = kosong"),
		USessionChronicleSubsystem::SelectTopMoments(Moments, 0).Num(), 0);

	// Input asli tak berubah urutan (fungsi pure)
	TestEqual(TEXT("input tak dimodifikasi"), Moments[0].Intensity, 0.3f, 0.001f);

	return true;
}

#endif // WITH_AUTOMATION_TESTS
