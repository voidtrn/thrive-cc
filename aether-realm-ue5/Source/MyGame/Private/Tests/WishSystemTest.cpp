#include "Misc/AutomationTest.h"
#include "System/WishSystem.h"
#include "System/WishTypes.h"

#if WITH_AUTOMATION_TESTS

/** Unit test biaya & tipe fate wish (fungsi statik murni). */

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWishFateCostTest,
	"AetherRealm.Wish.FateCost",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FWishFateCostTest::RunTest(const FString&)
{
	FBannerData Standard;
	Standard.BannerType = EBannerType::Standard;

	FBannerData Beginner;
	Beginner.BannerType = EBannerType::Beginner;

	// Standard: 1:1
	TestEqual(TEXT("standard 1-pull"), UWishSystem::GetFateCost(Standard, 1), 1);
	TestEqual(TEXT("standard 10-pull"), UWishSystem::GetFateCost(Standard, 10), 10);

	// Beginner: 10-pull diskon jadi 8
	TestEqual(TEXT("beginner 10-pull diskon"), UWishSystem::GetFateCost(Beginner, 10), 8);
	TestEqual(TEXT("beginner 1-pull normal"), UWishSystem::GetFateCost(Beginner, 1), 1);

	return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWishFateTypeTest,
	"AetherRealm.Wish.FateType",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FWishFateTypeTest::RunTest(const FString&)
{
	// Standard & Beginner → Acquaint (biru)
	TestTrue(TEXT("standard = Acquaint"),
		UWishSystem::GetFateTypeForBanner(EBannerType::Standard) == EFateType::Acquaint);
	TestTrue(TEXT("beginner = Acquaint"),
		UWishSystem::GetFateTypeForBanner(EBannerType::Beginner) == EFateType::Acquaint);

	// Limited → Intertwined (pelangi)
	TestTrue(TEXT("limited char = Intertwined"),
		UWishSystem::GetFateTypeForBanner(EBannerType::LimitedCharacter) == EFateType::Intertwined);
	TestTrue(TEXT("limited weapon = Intertwined"),
		UWishSystem::GetFateTypeForBanner(EBannerType::LimitedWeapon) == EFateType::Intertwined);

	return true;
}

// ---------- Pity / 50-50 / Epitomized Path ----------
// Semua test di bawah pakai RollSingleForTest (pure logic, tanpa GameInstance).
// RNG di-seed supaya deterministik per platform; assert utama adalah INVARIANT
// (hard pity, guarantee, flag 50/50) yang harus berlaku untuk seed apa pun.

namespace WishTestHelpers
{
	FBannerData MakeLimitedCharBanner()
	{
		FBannerData Banner;
		Banner.BannerType = EBannerType::LimitedCharacter;
		Banner.Featured5Star = { TEXT("Char_Featured5") };
		Banner.Featured4Star = { TEXT("Char_Featured4A"), TEXT("Char_Featured4B") };
		Banner.Pool5StarStandard = { TEXT("Char_Std5A"), TEXT("Char_Std5B") };
		Banner.Pool4Star = { TEXT("Char_Std4") };
		Banner.Pool3Star = { TEXT("Wpn_3Star") };
		return Banner;
	}

	FBannerData MakeWeaponBanner()
	{
		FBannerData Banner;
		Banner.BannerType = EBannerType::LimitedWeapon;
		Banner.Featured5Star = { TEXT("Wpn_FeaturedA"), TEXT("Wpn_FeaturedB") };
		Banner.Pool5StarStandard = { TEXT("Wpn_Std5") };
		Banner.Pool4Star = { TEXT("Wpn_Std4") };
		Banner.Pool3Star = { TEXT("Wpn_3Star") };
		return Banner;
	}

	FBannerData MakeStandardBanner()
	{
		FBannerData Banner;
		Banner.BannerType = EBannerType::Standard;
		Banner.Pool5StarStandard = { TEXT("Std_5") };
		Banner.Pool4Star = { TEXT("Std_4") };
		Banner.Pool3Star = { TEXT("Std_3") };
		return Banner;
	}
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWishPityThresholdTest,
	"AetherRealm.Wish.PityThresholds",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FWishPityThresholdTest::RunTest(const FString&)
{
	int32 Soft = 0, Hard = 0;

	// Char/Standard/Beginner: 75/90
	UWishSystem::GetPityThresholdsForTest(EBannerType::LimitedCharacter, Soft, Hard);
	TestEqual(TEXT("char soft pity"), Soft, 75);
	TestEqual(TEXT("char hard pity"), Hard, 90);

	UWishSystem::GetPityThresholdsForTest(EBannerType::Standard, Soft, Hard);
	TestEqual(TEXT("standard soft pity"), Soft, 75);
	TestEqual(TEXT("standard hard pity"), Hard, 90);

	// Weapon: 65/80
	UWishSystem::GetPityThresholdsForTest(EBannerType::LimitedWeapon, Soft, Hard);
	TestEqual(TEXT("weapon soft pity"), Soft, 65);
	TestEqual(TEXT("weapon hard pity"), Hard, 80);

	return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWishHardPityTest,
	"AetherRealm.Wish.HardPityGuarantee",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FWishHardPityTest::RunTest(const FString&)
{
	using namespace WishTestHelpers;
	FMath::RandInit(0xA37E12);
	UWishSystem* Wish = NewObject<UWishSystem>(GetTransientPackage());

	const FBannerData Banners[] = { MakeLimitedCharBanner(), MakeWeaponBanner(), MakeStandardBanner() };

	for (const FBannerData& Banner : Banners)
	{
		int32 Soft = 0, Hard = 0;
		UWishSystem::GetPityThresholdsForTest(Banner.BannerType, Soft, Hard);

		// Pull ke-Hard (state Hard-1 sebelum roll) HARUS 5* — invariant, bukan statistik.
		FBannerPityState Pity;
		Pity.PullsSince5Star = Hard - 1;
		const FWishResult Result = Wish->RollSingleForTest(Banner, Pity);

		TestTrue(FString::Printf(TEXT("hard pity %d = 5* (banner %d)"), Hard, (int32)Banner.BannerType),
			Result.Rarity == EWishRarity::FiveStar);
		TestEqual(TEXT("pity reset setelah 5*"), Pity.PullsSince5Star, 0);
	}

	return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWishPityIntervalTest,
	"AetherRealm.Wish.PityIntervals",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FWishPityIntervalTest::RunTest(const FString&)
{
	using namespace WishTestHelpers;
	FMath::RandInit(0xA37E12);
	UWishSystem* Wish = NewObject<UWishSystem>(GetTransientPackage());
	const FBannerData Banner = MakeStandardBanner();

	FBannerPityState Pity;
	constexpr int32 NumPulls = 20000;

	int32 Gap5 = 0;
	int32 Count5 = 0;
	int64 TotalGap5 = 0;

	for (int32 i = 0; i < NumPulls; ++i)
	{
		const FWishResult Result = Wish->RollSingleForTest(Banner, Pity);
		Gap5++;

		if (Result.Rarity == EWishRarity::FiveStar)
		{
			// INVARIANT: tidak pernah lebih dari hard pity 90
			if (Gap5 > 90)
			{
				AddError(FString::Printf(TEXT("5* gap %d > hard pity 90"), Gap5));
			}
			TotalGap5 += Gap5;
			Count5++;
			Gap5 = 0;
		}
		else if (Result.Rarity == EWishRarity::ThreeStar)
		{
			// INVARIANT guarantee 4*: hasil 3* hanya mungkin kalau counter
			// pre-roll ≤ 9 (counter ≥ 10 memaksa 4* kecuali 5* keluar).
			// 5* tidak me-reset counter, jadi cek state langsung, bukan gap.
			if (Pity.PullsSince4Star > 10)
			{
				AddError(FString::Printf(
					TEXT("3* keluar padahal PullsSince4Star=%d > 10"), Pity.PullsSince4Star));
			}
		}
	}

	TestTrue(TEXT("cukup sample 5*"), Count5 > 100);
	if (Count5 > 0)
	{
		// Soft pity menekan rata-rata interval di bawah soft threshold + margin.
		// Base rate murni tanpa pity ≈ 1/0.006 = 167; dengan soft+hard pity
		// rata-rata teoretis ≈ 62. Bound longgar anti-flaky: [40, 80].
		const double MeanGap = double(TotalGap5) / Count5;
		TestTrue(FString::Printf(TEXT("mean 5* interval %.1f dalam [40,80]"), MeanGap),
			MeanGap > 40.0 && MeanGap < 80.0);
	}

	return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWishFiftyFiftyTest,
	"AetherRealm.Wish.FiftyFifty",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FWishFiftyFiftyTest::RunTest(const FString&)
{
	using namespace WishTestHelpers;
	FMath::RandInit(0xA37E12);
	UWishSystem* Wish = NewObject<UWishSystem>(GetTransientPackage());
	const FBannerData Banner = MakeLimitedCharBanner();

	FBannerPityState Pity;
	int32 Soft = 0, Hard = 0;
	UWishSystem::GetPityThresholdsForTest(Banner.BannerType, Soft, Hard);

	bool bSawLoss = false;
	for (int32 Attempt = 0; Attempt < 400 && !bSawLoss; ++Attempt)
	{
		// Paksa 5* via hard pity supaya tiap iterasi menguji cabang 50/50.
		Pity.PullsSince5Star = Hard - 1;
		const FWishResult Result = Wish->RollSingleForTest(Banner, Pity);
		TestTrue(TEXT("forced roll = 5*"), Result.Rarity == EWishRarity::FiveStar);

		if (Result.bFeatured)
		{
			TestTrue(TEXT("featured 5* dari list featured"),
				Banner.Featured5Star.Contains(Result.ItemId));
			TestFalse(TEXT("menang 50/50 tidak set guarantee"), Pity.bGuaranteedFeatured5Star);
		}
		else
		{
			// KALAH 50/50 → invariant: item dari pool standard + guarantee ON
			bSawLoss = true;
			TestTrue(TEXT("loss 50/50 dari pool standard"),
				Banner.Pool5StarStandard.Contains(Result.ItemId));
			TestTrue(TEXT("loss 50/50 set guaranteed flag"), Pity.bGuaranteedFeatured5Star);

			// Next 5* HARUS featured
			Pity.PullsSince5Star = Hard - 1;
			const FWishResult Next = Wish->RollSingleForTest(Banner, Pity);
			TestTrue(TEXT("guaranteed roll = 5*"), Next.Rarity == EWishRarity::FiveStar);
			TestTrue(TEXT("guaranteed roll = featured"), Next.bFeatured);
			TestTrue(TEXT("guaranteed item dari list featured"),
				Banner.Featured5Star.Contains(Next.ItemId));
			TestFalse(TEXT("guarantee flag cleared"), Pity.bGuaranteedFeatured5Star);
		}
	}

	// P(tidak pernah kalah 50/50 dalam 400 percobaan) = 0.5^400 ≈ 0
	TestTrue(TEXT("observasi minimal 1 loss 50/50"), bSawLoss);
	return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWishEpitomizedPathTest,
	"AetherRealm.Wish.EpitomizedPath",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FWishEpitomizedPathTest::RunTest(const FString&)
{
	using namespace WishTestHelpers;
	FMath::RandInit(0xA37E12);
	UWishSystem* Wish = NewObject<UWishSystem>(GetTransientPackage());
	const FBannerData Banner = MakeWeaponBanner();
	const FName Target = Banner.Featured5Star[0];

	int32 Soft = 0, Hard = 0;
	UWishSystem::GetPityThresholdsForTest(Banner.BannerType, Soft, Hard);

	// INVARIANT: 2 points → 5* berikutnya PASTI target, points reset.
	{
		FBannerPityState Pity;
		Pity.EpitomizedTarget = Target;
		Pity.EpitomizedPoints = 2;
		Pity.PullsSince5Star = Hard - 1;

		const FWishResult Result = Wish->RollSingleForTest(Banner, Pity);
		TestTrue(TEXT("epitomized roll = 5*"), Result.Rarity == EWishRarity::FiveStar);
		TestEqual(TEXT("epitomized 2pt = guaranteed target"), Result.ItemId, Target);
		TestTrue(TEXT("target dihitung featured"), Result.bFeatured);
		TestEqual(TEXT("points reset setelah target"), Pity.EpitomizedPoints, 0);
	}

	// Akumulasi points: 5* bukan target nambah 1 point, dapat target reset 0.
	{
		FBannerPityState Pity;
		Pity.EpitomizedTarget = Target;

		for (int32 i = 0; i < 300; ++i)
		{
			const int32 PointsBefore = Pity.EpitomizedPoints;
			Pity.PullsSince5Star = Hard - 1;
			const FWishResult Result = Wish->RollSingleForTest(Banner, Pity);
			TestTrue(TEXT("forced roll = 5*"), Result.Rarity == EWishRarity::FiveStar);

			if (Result.ItemId == Target)
			{
				TestEqual(TEXT("dapat target → points reset"), Pity.EpitomizedPoints, 0);
			}
			else
			{
				TestEqual(TEXT("bukan target → points +1"), Pity.EpitomizedPoints, PointsBefore + 1);
				TestTrue(TEXT("points tidak pernah > 2"), Pity.EpitomizedPoints <= 2);
			}
		}
	}

	return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWishSoftPityRampTest,
	"AetherRealm.Wish.SoftPityRamp",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FWishSoftPityRampTest::RunTest(const FString&)
{
	using namespace WishTestHelpers;
	FMath::RandInit(0xA37E12);
	UWishSystem* Wish = NewObject<UWishSystem>(GetTransientPackage());
	const FBannerData Banner = MakeStandardBanner();

	// Bandingkan rate 5* di zona base (pity rendah) vs zona soft pity.
	// Soft pity 6%/step harus bikin rate zona soft >> base 0.6%.
	constexpr int32 Trials = 4000;

	auto RateAtPity = [&](int32 PityBefore) -> double
	{
		int32 Hits = 0;
		for (int32 i = 0; i < Trials; ++i)
		{
			FBannerPityState Pity;
			Pity.PullsSince5Star = PityBefore;
			if (Wish->RollSingleForTest(Banner, Pity).Rarity == EWishRarity::FiveStar)
			{
				Hits++;
			}
		}
		return double(Hits) / Trials;
	};

	const double BaseRate = RateAtPity(10);   // jauh di bawah soft pity 75
	const double SoftRate = RateAtPity(80);   // 6 step ke zona soft ≈ 0.6% + 6*6% = 36.6%

	// Base 0.6%: bound longgar [0%, 2%]
	TestTrue(FString::Printf(TEXT("base rate %.3f%% < 2%%"), BaseRate * 100.0), BaseRate < 0.02);
	// Soft zone: harus jelas lebih tinggi (teoretis 36.6%, bound longgar > 25%)
	TestTrue(FString::Printf(TEXT("soft pity rate %.1f%% > 25%%"), SoftRate * 100.0), SoftRate > 0.25);
	TestTrue(TEXT("soft >> base"), SoftRate > BaseRate * 10.0);

	return true;
}

#endif // WITH_AUTOMATION_TESTS
