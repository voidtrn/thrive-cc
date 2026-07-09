#include "Misc/AutomationTest.h"
#include "System/WorldLevelStatics.h"
#include "System/ResinSubsystem.h"
#include "System/ExpeditionSubsystem.h"

#if WITH_AUTOMATION_TESTS

// ---------- World Level ----------

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWorldLevelMappingTest,
	"AetherRealm.Meta.WorldLevelMapping",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FWorldLevelMappingTest::RunTest(const FString&)
{
	// Batas tiap tier
	TestEqual(TEXT("AR1 = WL0"), UWorldLevelStatics::WorldLevelForAR(1), 0);
	TestEqual(TEXT("AR9 = WL0"), UWorldLevelStatics::WorldLevelForAR(9), 0);
	TestEqual(TEXT("AR10 = WL1"), UWorldLevelStatics::WorldLevelForAR(10), 1);
	TestEqual(TEXT("AR15 = WL2"), UWorldLevelStatics::WorldLevelForAR(15), 2);
	TestEqual(TEXT("AR20 = WL3"), UWorldLevelStatics::WorldLevelForAR(20), 3);
	TestEqual(TEXT("AR25 = WL4"), UWorldLevelStatics::WorldLevelForAR(25), 4);
	TestEqual(TEXT("AR30 = WL5"), UWorldLevelStatics::WorldLevelForAR(30), 5);
	TestEqual(TEXT("AR60 tetap WL5"), UWorldLevelStatics::WorldLevelForAR(60), 5);

	// Multiplier monoton naik & WL0 = baseline 1.0
	TestEqual(TEXT("WL0 HP baseline"), UWorldLevelStatics::EnemyHPMultiplier(0), 1.f);
	for (int32 WL = 1; WL <= 5; ++WL)
	{
		TestTrue(TEXT("HP naik per WL"),
			UWorldLevelStatics::EnemyHPMultiplier(WL) > UWorldLevelStatics::EnemyHPMultiplier(WL - 1));
		TestTrue(TEXT("ATK naik per WL"),
			UWorldLevelStatics::EnemyATKMultiplier(WL) > UWorldLevelStatics::EnemyATKMultiplier(WL - 1));
		TestTrue(TEXT("Mora naik per WL"),
			UWorldLevelStatics::MoraDropMultiplier(WL) > UWorldLevelStatics::MoraDropMultiplier(WL - 1));
	}

	// Input di luar range di-clamp, tidak meledak
	TestEqual(TEXT("WL negatif = baseline"), UWorldLevelStatics::EnemyHPMultiplier(-3), 1.f);
	TestEqual(TEXT("WL 99 = WL5"), UWorldLevelStatics::EnemyHPMultiplier(99),
		UWorldLevelStatics::EnemyHPMultiplier(5));

	// Bonus rolls
	TestEqual(TEXT("WL0 tanpa bonus roll"), UWorldLevelStatics::BonusMaterialRolls(0), 0);
	TestEqual(TEXT("WL3 +1 roll"), UWorldLevelStatics::BonusMaterialRolls(3), 1);
	TestEqual(TEXT("WL5 +2 roll"), UWorldLevelStatics::BonusMaterialRolls(5), 2);

	return true;
}

// ---------- Resin ----------

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FResinRegenTest,
	"AetherRealm.Meta.ResinRegen",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FResinRegenTest::RunTest(const FString&)
{
	const FDateTime T0(2026, 7, 9, 12, 0, 0);
	constexpr int32 Tick = UResinSubsystem::RegenSecondsPerResin; // 480
	int32 Resin;
	FDateTime Stamp;

	// 1 interval utuh = +1
	UResinSubsystem::ComputeRegen(100, T0, T0 + FTimespan::FromSeconds(Tick), Resin, Stamp);
	TestEqual(TEXT("+1 setelah 8 menit"), Resin, 101);
	TestEqual(TEXT("timestamp maju 1 tick"), Stamp, T0 + FTimespan::FromSeconds(Tick));

	// Interval parsial: resin tetap, timestamp TIDAK maju (sisa tidak hangus)
	UResinSubsystem::ComputeRegen(100, T0, T0 + FTimespan::FromSeconds(Tick - 1), Resin, Stamp);
	TestEqual(TEXT("parsial: resin tetap"), Resin, 100);
	TestEqual(TEXT("parsial: timestamp tetap"), Stamp, T0);

	// 2.5 interval = +2, timestamp maju 2 tick (0.5 tersisa)
	UResinSubsystem::ComputeRegen(100, T0, T0 + FTimespan::FromSeconds(Tick * 5 / 2), Resin, Stamp);
	TestEqual(TEXT("2.5 tick = +2"), Resin, 102);
	TestEqual(TEXT("timestamp maju 2 tick"), Stamp, T0 + FTimespan::FromSeconds(Tick * 2));

	// Offline lama: clamp ke cap
	UResinSubsystem::ComputeRegen(10, T0, T0 + FTimespan::FromDays(30), Resin, Stamp);
	TestEqual(TEXT("offline lama = cap"), Resin, UResinSubsystem::ResinCap);
	TestEqual(TEXT("penuh: timestamp pinned Now"), Stamp, T0 + FTimespan::FromDays(30));

	// Sudah di cap: tidak nambah, timestamp pinned
	UResinSubsystem::ComputeRegen(UResinSubsystem::ResinCap, T0, T0 + FTimespan::FromSeconds(Tick * 10), Resin, Stamp);
	TestEqual(TEXT("di cap: tidak regen"), Resin, UResinSubsystem::ResinCap);

	// Overflow (dari item): tetap tidak regen, tidak dipotong
	UResinSubsystem::ComputeRegen(200, T0, T0 + FTimespan::FromSeconds(Tick * 10), Resin, Stamp);
	TestEqual(TEXT("overflow dipertahankan"), Resin, 200);

	// Clock mundur: tidak kasih resin gratis
	UResinSubsystem::ComputeRegen(100, T0, T0 - FTimespan::FromHours(5), Resin, Stamp);
	TestEqual(TEXT("clock mundur: resin tetap"), Resin, 100);
	TestTrue(TEXT("clock mundur: timestamp di-pin ulang"), Stamp <= T0 - FTimespan::FromHours(5));

	// Tepat penuh dari regen: 150 + 10 tick = 160
	UResinSubsystem::ComputeRegen(150, T0, T0 + FTimespan::FromSeconds(Tick * 10), Resin, Stamp);
	TestEqual(TEXT("regen sampai persis cap"), Resin, UResinSubsystem::ResinCap);

	return true;
}

// ---------- Expedition ----------

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FExpeditionCompletionTest,
	"AetherRealm.Meta.ExpeditionCompletion",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FExpeditionCompletionTest::RunTest(const FString&)
{
	const FDateTime Start(2026, 7, 9, 8, 0, 0);

	TestFalse(TEXT("baru mulai: belum selesai"),
		UExpeditionSubsystem::IsCompleteAt(Start, 8, Start + FTimespan::FromMinutes(1)));
	TestFalse(TEXT("1 detik sebelum selesai"),
		UExpeditionSubsystem::IsCompleteAt(Start, 8, Start + FTimespan::FromHours(8) - FTimespan::FromSeconds(1)));
	TestTrue(TEXT("tepat durasi: selesai"),
		UExpeditionSubsystem::IsCompleteAt(Start, 8, Start + FTimespan::FromHours(8)));
	TestTrue(TEXT("lewat durasi: selesai"),
		UExpeditionSubsystem::IsCompleteAt(Start, 8, Start + FTimespan::FromDays(3)));
	TestFalse(TEXT("clock mundur: tidak selesai"),
		UExpeditionSubsystem::IsCompleteAt(Start, 8, Start - FTimespan::FromHours(1)));

	return true;
}

#endif // WITH_AUTOMATION_TESTS
