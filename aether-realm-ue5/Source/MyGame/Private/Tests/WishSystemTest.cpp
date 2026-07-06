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

#endif // WITH_AUTOMATION_TESTS
