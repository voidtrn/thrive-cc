#include "Misc/AutomationTest.h"
#include "System/WorldLevelStatics.h"
#include "System/ResinSubsystem.h"
#include "System/ExpeditionSubsystem.h"
#include "System/ReputationSubsystem.h"
#include "System/LevelingComponent.h"
#include "System/GameDirectorSubsystem.h"
#include "Character/AimModeComponent.h"

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

// ---------- Reputation ----------

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FReputationCurveTest,
	"AetherRealm.Meta.ReputationCurve",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FReputationCurveTest::RunTest(const FString&)
{
	// Titik kunci kurva: L1=0, L2=1000, L3=2500 (1000+1500), L10=27000
	TestEqual(TEXT("L1 = 0 EXP"), UReputationSubsystem::ExpToReachLevel(1), 0);
	TestEqual(TEXT("L2 = 1000"), UReputationSubsystem::ExpToReachLevel(2), 1000);
	TestEqual(TEXT("L3 = 2500"), UReputationSubsystem::ExpToReachLevel(3), 2500);
	TestEqual(TEXT("L10 = 27000"), UReputationSubsystem::ExpToReachLevel(10), 27000);

	// Inverse konsisten: LevelForTotalExp(ExpToReachLevel(L)) == L, dan
	// 1 EXP sebelum threshold masih level sebelumnya.
	for (int32 L = 2; L <= UReputationSubsystem::MaxReputationLevel; ++L)
	{
		const int32 Threshold = UReputationSubsystem::ExpToReachLevel(L);
		TestEqual(TEXT("threshold tepat = level"), UReputationSubsystem::LevelForTotalExp(Threshold), L);
		TestEqual(TEXT("threshold-1 = level sebelumnya"),
			UReputationSubsystem::LevelForTotalExp(Threshold - 1), L - 1);
	}

	// Clamp: EXP raksasa & input aneh tidak melampaui max
	TestEqual(TEXT("EXP raksasa = max level"),
		UReputationSubsystem::LevelForTotalExp(999999999), UReputationSubsystem::MaxReputationLevel);
	TestEqual(TEXT("EXP 0 = L1"), UReputationSubsystem::LevelForTotalExp(0), 1);
	TestEqual(TEXT("level > max di-clamp"),
		UReputationSubsystem::ExpToReachLevel(99), UReputationSubsystem::ExpToReachLevel(10));

	return true;
}

// ---------- Weapon Refinement ----------

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FRefinementMagnitudeTest,
	"AetherRealm.Meta.RefinementMagnitude",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FRefinementMagnitudeTest::RunTest(const FString&)
{
	// Skala linear: base di R1, +per-refine tiap rank. Contoh pasif
	// "skill DMG +12% / +3% per refine" → R1 12%, R5 24%.
	TestEqual(TEXT("R1 = base"), ULevelingComponent::GetPassiveMagnitude(0.12f, 0.03f, 1), 0.12f);
	TestEqual(TEXT("R3 = base+2 step"), ULevelingComponent::GetPassiveMagnitude(0.12f, 0.03f, 3), 0.18f);
	TestEqual(TEXT("R5 = base+4 step"), ULevelingComponent::GetPassiveMagnitude(0.12f, 0.03f, 5), 0.24f);

	// Refinement di luar range di-clamp 1-5
	TestEqual(TEXT("R0 clamp ke R1"), ULevelingComponent::GetPassiveMagnitude(0.12f, 0.03f, 0), 0.12f);
	TestEqual(TEXT("R9 clamp ke R5"), ULevelingComponent::GetPassiveMagnitude(0.12f, 0.03f, 9), 0.24f);

	return true;
}

// ---------- Game Director ----------

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FDirectorPacingTest,
	"AetherRealm.Meta.DirectorPacing",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FDirectorPacingTest::RunTest(const FString&)
{
	using D = UGameDirectorSubsystem;

	// Decay linear, tidak negatif
	TestEqual(TEXT("decay 1s"), D::DecayedIntensity(50.f, 1.f), 50.f - D::DecayPerSecond);
	TestEqual(TEXT("decay tidak negatif"), D::DecayedIntensity(2.f, 10.f), 0.f);
	TestEqual(TEXT("dt negatif diabaikan"), D::DecayedIntensity(50.f, -5.f), 50.f);

	// Transisi + hysteresis
	TestTrue(TEXT("BuildUp tetap di 69"),
		D::ComputePhaseTransition(EDirectorPhase::BuildUp, 69.f, 100.f) == EDirectorPhase::BuildUp);
	TestTrue(TEXT("BuildUp -> Peak di 70"),
		D::ComputePhaseTransition(EDirectorPhase::BuildUp, 70.f, 0.f) == EDirectorPhase::Peak);
	TestTrue(TEXT("Peak bertahan di 41 (hysteresis)"),
		D::ComputePhaseTransition(EDirectorPhase::Peak, 41.f, 60.f) == EDirectorPhase::Peak);
	TestTrue(TEXT("Peak -> Relax di 40"),
		D::ComputePhaseTransition(EDirectorPhase::Peak, 40.f, 60.f) == EDirectorPhase::Relax);
	TestTrue(TEXT("Relax belum habis: tetap"),
		D::ComputePhaseTransition(EDirectorPhase::Relax, 10.f, D::RelaxDuration - 1.f) == EDirectorPhase::Relax);
	TestTrue(TEXT("Relax habis -> BuildUp"),
		D::ComputePhaseTransition(EDirectorPhase::Relax, 10.f, D::RelaxDuration) == EDirectorPhase::BuildUp);
	TestTrue(TEXT("combat besar memotong Relax -> Peak"),
		D::ComputePhaseTransition(EDirectorPhase::Relax, 75.f, 5.f) == EDirectorPhase::Peak);

	// Jendela ambush: semua syarat harus terpenuhi
	TestTrue(TEXT("ambush valid"),
		D::IsAmbushWindowAt(EDirectorPhase::BuildUp, 10.f, 20.f, 60.f));
	TestFalse(TEXT("bukan BuildUp: tolak"),
		D::IsAmbushWindowAt(EDirectorPhase::Relax, 10.f, 20.f, 60.f));
	TestFalse(TEXT("tensi tinggi: tolak"),
		D::IsAmbushWindowAt(EDirectorPhase::BuildUp, 35.f, 20.f, 60.f));
	TestFalse(TEXT("belum cukup sepi: tolak"),
		D::IsAmbushWindowAt(EDirectorPhase::BuildUp, 10.f, 5.f, 60.f));
	TestFalse(TEXT("cooldown ambush belum lewat: tolak"),
		D::IsAmbushWindowAt(EDirectorPhase::BuildUp, 10.f, 20.f, 10.f));

	return true;
}

// ---------- TPS Spread ----------

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FAimSpreadTest,
	"AetherRealm.Meta.AimSpread",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FAimSpreadTest::RunTest(const FString&)
{
	const FVector Base = FVector(1, 0, 0);

	// Spread 0 = arah persis
	TestTrue(TEXT("spread 0 = base dir"),
		UAimModeComponent::ComputeSpreadDirection(Base, 0.f, 0.5f, 0.5f).Equals(Base, 1e-4f));

	// Hasil selalu unit vector & dalam cone (sampling grid deterministik)
	constexpr float HalfAngle = 5.f;
	const float MinDot = FMath::Cos(FMath::DegreesToRadians(HalfAngle)) - 1e-4f;
	for (int32 A = 0; A <= 10; ++A)
	{
		for (int32 B = 0; B <= 10; ++B)
		{
			const FVector Dir = UAimModeComponent::ComputeSpreadDirection(
				Base, HalfAngle, A / 10.f, B / 10.f);
			TestTrue(TEXT("unit length"), FMath::IsNearlyEqual(Dir.Size(), 1.f, 1e-3f));
			if (FVector::DotProduct(Dir, Base) < MinDot)
			{
				AddError(FString::Printf(TEXT("keluar cone: rand=(%d,%d) dot=%f"),
					A, B, FVector::DotProduct(Dir, Base)));
			}
		}
	}

	// Rand01A = 1 (tepi cone) harus MENYENTUH sudut penuh (bukan selalu tengah)
	const FVector Edge = UAimModeComponent::ComputeSpreadDirection(Base, HalfAngle, 1.f, 0.f);
	TestTrue(TEXT("tepi cone tercapai"),
		FMath::IsNearlyEqual(
			FMath::RadiansToDegrees(FMath::Acos(FVector::DotProduct(Edge, Base))),
			HalfAngle, 0.1f));

	// Arah nol tidak meledak
	TestTrue(TEXT("zero dir aman"),
		UAimModeComponent::ComputeSpreadDirection(FVector::ZeroVector, 5.f, 0.5f, 0.5f).IsNearlyZero());

	return true;
}

#endif // WITH_AUTOMATION_TESTS
