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

/**
 * Pity soft/hard (ANTISIPASI #7, Docs/CODE_REVIEW.md) — sebelumnya cuma
 * di-eyeball, belum ada test. Hard pity harus 100% deterministik (FRand()
 * selalu < 1.f), jadi test ini tidak flaky walau pakai RNG asli.
 */
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWishHardPityTest,
	"AetherRealm.Wish.HardPity",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FWishHardPityTest::RunTest(const FString&)
{
	auto CheckHardPity = [this](EBannerType Type, int32 HardPity, const TCHAR* Label)
	{
		FBannerData Banner;
		Banner.BannerType = Type;
		Banner.Featured5Star = { TEXT("Featured5") };
		Banner.Pool5StarStandard = { TEXT("Standard5") };

		FBannerPityState Pity;
		Pity.PullsSince5Star = HardPity - 1; // RollSingle increments → jadi HardPity

		const FWishResult Result = UWishSystem::RollSingle(Banner, Pity);
		TestTrue(FString::Printf(TEXT("%s: hard pity guarantees 5-star"), Label),
			Result.Rarity == EWishRarity::FiveStar);
		TestEqual(FString::Printf(TEXT("%s: pity resets after 5-star"), Label),
			Pity.PullsSince5Star, 0);
	};

	CheckHardPity(EBannerType::LimitedCharacter, 90, TEXT("Character"));
	CheckHardPity(EBannerType::LimitedWeapon, 80, TEXT("Weapon"));
	CheckHardPity(EBannerType::Standard, 90, TEXT("Standard"));

	return true;
}

/**
 * 4-star guarantee tiap 10 pull tanpa 5-star. Dicek via "!= ThreeStar" (bukan
 * "== FourStar") karena kalau kebetulan 5-star juga menang duluan di roll
 * yang sama, itu tetap valid (guarantee "4-star atau lebih baik").
 */
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWishFourStarGuaranteeTest,
	"AetherRealm.Wish.FourStarGuarantee",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FWishFourStarGuaranteeTest::RunTest(const FString&)
{
	FBannerData Banner;
	Banner.BannerType = EBannerType::Standard;
	Banner.Pool4Star = { TEXT("Pool4") };
	Banner.Pool3Star = { TEXT("Pool3") };

	FBannerPityState Pity;
	Pity.PullsSince4Star = 9; // RollSingle increments → jadi 10 = guarantee

	const FWishResult Result = UWishSystem::RollSingle(Banner, Pity);
	TestTrue(TEXT("10th pull without 4-star+ guarantees 4-star or better"),
		Result.Rarity != EWishRarity::ThreeStar);

	return true;
}

/** 50/50 kalah sekali → next 5-star pasti featured (bGuaranteedFeatured5Star). */
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWishFeaturedGuaranteeTest,
	"AetherRealm.Wish.FeaturedGuarantee",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FWishFeaturedGuaranteeTest::RunTest(const FString&)
{
	FBannerData Banner;
	Banner.BannerType = EBannerType::LimitedCharacter;
	Banner.Featured5Star = { TEXT("FeaturedChar") };
	Banner.Pool5StarStandard = { TEXT("StandardChar") };

	FBannerPityState Pity;
	Pity.PullsSince5Star = 89; // hard pity → 5-star deterministik
	Pity.bGuaranteedFeatured5Star = true; // sudah kalah 50/50 sebelumnya

	const FWishResult Result = UWishSystem::RollSingle(Banner, Pity);
	TestTrue(TEXT("guaranteed featured after losing 50/50"), Result.bFeatured);
	TestEqual(TEXT("item id = featured pool"), Result.ItemId, FName(TEXT("FeaturedChar")));
	TestFalse(TEXT("guarantee flag consumed"), Pity.bGuaranteedFeatured5Star);

	return true;
}

/** Epitomized Path (weapon banner): 2 poin non-target → next 5-star = target pasti. */
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWishEpitomizedPathTest,
	"AetherRealm.Wish.EpitomizedPath",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FWishEpitomizedPathTest::RunTest(const FString&)
{
	FBannerData Banner;
	Banner.BannerType = EBannerType::LimitedWeapon;
	Banner.Featured5Star = { TEXT("WeaponA"), TEXT("WeaponB") };
	Banner.Pool5StarStandard = { TEXT("StandardWeapon") };

	FBannerPityState Pity;
	Pity.PullsSince5Star = 79; // hard pity weapon (80) → 5-star deterministik
	Pity.EpitomizedTarget = TEXT("WeaponA");
	Pity.EpitomizedPoints = 2; // spec: 2x bukan target → guaranteed target

	const FWishResult Result = UWishSystem::RollSingle(Banner, Pity);
	TestEqual(TEXT("epitomized path locks target weapon"), Result.ItemId, FName(TEXT("WeaponA")));
	TestTrue(TEXT("epitomized result counts as featured"), Result.bFeatured);
	TestEqual(TEXT("epitomized points reset"), Pity.EpitomizedPoints, 0);

	return true;
}

#endif // WITH_AUTOMATION_TESTS
