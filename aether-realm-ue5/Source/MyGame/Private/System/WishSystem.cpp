#include "System/WishSystem.h"
#include "System/OpenWorldGameInstance.h"
#include "MyGame.h"

UOpenWorldGameInstance* UWishSystem::GetOWGameInstance() const
{
	return Cast<UOpenWorldGameInstance>(GetGameInstance());
}

EFateType UWishSystem::GetFateTypeForBanner(EBannerType Type)
{
	return (Type == EBannerType::Standard || Type == EBannerType::Beginner)
		? EFateType::Acquaint
		: EFateType::Intertwined;
}

int32 UWishSystem::GetFateCost(const FBannerData& Banner, int32 Count)
{
	// Beginner: diskon 8 Fate untuk 10-pull
	if (Banner.BannerType == EBannerType::Beginner && Count == 10)
	{
		return 8;
	}
	return Count;
}

void UWishSystem::GetPityThresholds(EBannerType Type, int32& OutSoftPity, int32& OutHardPity)
{
	if (Type == EBannerType::LimitedWeapon)
	{
		OutSoftPity = 65;
		OutHardPity = 80;
	}
	else
	{
		OutSoftPity = 75;
		OutHardPity = 90;
	}
}

FBannerPityState UWishSystem::GetPityState(EBannerType Type) const
{
	if (const UOpenWorldGameInstance* GI = GetOWGameInstance())
	{
		if (const FBannerPityState* State = GI->WishPityStates.Find(Type))
		{
			return *State;
		}
	}
	return FBannerPityState();
}

void UWishSystem::SetEpitomizedTarget(FName TargetItemId)
{
	if (UOpenWorldGameInstance* GI = GetOWGameInstance())
	{
		FBannerPityState& Pity = GI->WishPityStates.FindOrAdd(EBannerType::LimitedWeapon);
		if (Pity.EpitomizedTarget != TargetItemId)
		{
			Pity.EpitomizedTarget = TargetItemId;
			Pity.EpitomizedPoints = 0; // ganti target = reset points
		}
	}
}

bool UWishSystem::CanPull(const FBannerData& Banner, int32 Count) const
{
	const UOpenWorldGameInstance* GI = GetOWGameInstance();
	if (!GI || (Count != 1 && Count != 10))
	{
		return false;
	}

	// Banner window (Standard/Beginner tanpa tanggal = selalu aktif)
	if (Banner.BannerType == EBannerType::LimitedCharacter || Banner.BannerType == EBannerType::LimitedWeapon)
	{
		const FDateTime Now = FDateTime::UtcNow();
		if (Banner.EndDate.GetTicks() > 0 && (Now < Banner.StartDate || Now > Banner.EndDate))
		{
			return false;
		}
	}

	// Beginner cap 20 pull
	if (Banner.BannerType == EBannerType::Beginner)
	{
		const FBannerPityState State = GetPityState(EBannerType::Beginner);
		if (State.TotalPulls + Count > BeginnerMaxPulls)
		{
			return false;
		}
	}

	const int32 Cost = GetFateCost(Banner, Count);
	const int32 Available = GetFateTypeForBanner(Banner.BannerType) == EFateType::Acquaint
		? GI->AcquaintFates : GI->IntertwinedFates;
	return Available >= Cost;
}

TArray<FWishResult> UWishSystem::Pull(const FBannerData& Banner, int32 Count)
{
	TArray<FWishResult> Results;
	UOpenWorldGameInstance* GI = GetOWGameInstance();
	if (!GI || !CanPull(Banner, Count))
	{
		return Results;
	}

	// Bayar
	const int32 Cost = GetFateCost(Banner, Count);
	if (GetFateTypeForBanner(Banner.BannerType) == EFateType::Acquaint)
	{
		GI->AcquaintFates -= Cost;
	}
	else
	{
		GI->IntertwinedFates -= Cost;
	}

	FBannerPityState& Pity = GI->WishPityStates.FindOrAdd(Banner.BannerType);

	for (int32 i = 0; i < Count; ++i)
	{
		FWishResult Result = RollSingle(Banner, Pity);
		ApplyOwnershipRewards(Result);
		Results.Add(Result);

		// Wish history (retensi 6 bulan, di-prune saat save)
		FWishHistoryEntry Entry;
		Entry.ItemId = Result.ItemId;
		Entry.Rarity = Result.Rarity;
		Entry.BannerType = Banner.BannerType;
		Entry.Timestamp = FDateTime::UtcNow();
		GI->WishHistory.Add(Entry);
	}

	GI->AutoSave();
	OnWishCompleted.Broadcast(Results);
	return Results;
}

FWishResult UWishSystem::RollSingle(const FBannerData& Banner, FBannerPityState& Pity)
{
	Pity.PullsSince5Star++;
	Pity.PullsSince4Star++;
	Pity.TotalPulls++;

	int32 SoftPity, HardPity;
	GetPityThresholds(Banner.BannerType, SoftPity, HardPity);

	// Beginner: pull ke-10 guaranteed featured (Noelle) — 4* featured slot 0
	if (Banner.BannerType == EBannerType::Beginner
		&& Pity.TotalPulls == 10 && Banner.Featured4Star.Num() > 0)
	{
		FWishResult Result;
		Result.ItemId = Banner.Featured4Star[0];
		Result.Rarity = EWishRarity::FourStar;
		Result.bFeatured = true;
		Pity.PullsSince4Star = 0;
		return Result;
	}

	// --- Rate 5* dengan soft/hard pity ---
	float Chance5 = Rate5Star;
	if (Pity.PullsSince5Star >= HardPity)
	{
		Chance5 = 1.f;
	}
	else if (Pity.PullsSince5Star >= SoftPity)
	{
		// Formula spec: 0.6% + (pull - (soft-1)) * 6%
		Chance5 = Rate5Star + (Pity.PullsSince5Star - (SoftPity - 1)) * SoftPityStepPerPull;
	}

	if (FMath::FRand() < Chance5)
	{
		return MakeResult(Banner, Pity, EWishRarity::FiveStar);
	}

	// --- 4*: base 5.1%, guarantee tiap 10 ---
	if (Pity.PullsSince4Star >= 10 || FMath::FRand() < Rate4Star)
	{
		return MakeResult(Banner, Pity, EWishRarity::FourStar);
	}

	return MakeResult(Banner, Pity, EWishRarity::ThreeStar);
}

FWishResult UWishSystem::MakeResult(const FBannerData& Banner, FBannerPityState& Pity, EWishRarity Rarity)
{
	FWishResult Result;
	Result.Rarity = Rarity;

	auto PickRandom = [](const TArray<FName>& Pool) -> FName
	{
		return Pool.Num() > 0 ? Pool[FMath::RandRange(0, Pool.Num() - 1)] : NAME_None;
	};

	switch (Rarity)
	{
	case EWishRarity::FiveStar:
	{
		Pity.PullsSince5Star = 0;

		if (Banner.BannerType == EBannerType::LimitedCharacter)
		{
			// 50/50: kalah sekali → guaranteed berikutnya
			const bool bFeatured = Pity.bGuaranteedFeatured5Star || FMath::FRand() < 0.5f;
			if (bFeatured)
			{
				Result.ItemId = PickRandom(Banner.Featured5Star);
				Result.bFeatured = true;
				Pity.bGuaranteedFeatured5Star = false;
			}
			else
			{
				Result.ItemId = PickRandom(Banner.Pool5StarStandard);
				Pity.bGuaranteedFeatured5Star = true;
			}
		}
		else if (Banner.BannerType == EBannerType::LimitedWeapon)
		{
			// Epitomized Path: 2x bukan target → guaranteed target
			if (!Pity.EpitomizedTarget.IsNone() && Pity.EpitomizedPoints >= 2)
			{
				Result.ItemId = Pity.EpitomizedTarget;
				Result.bFeatured = true;
				Pity.EpitomizedPoints = 0;
			}
			else
			{
				// 75% featured (random dari 2 weapon)
				const bool bFeatured = FMath::FRand() < 0.75f;
				Result.ItemId = bFeatured
					? PickRandom(Banner.Featured5Star)
					: PickRandom(Banner.Pool5StarStandard);
				Result.bFeatured = bFeatured;

				if (!Pity.EpitomizedTarget.IsNone())
				{
					if (Result.ItemId == Pity.EpitomizedTarget)
					{
						Pity.EpitomizedPoints = 0;
					}
					else
					{
						Pity.EpitomizedPoints++;
					}
				}
			}
		}
		else // Standard / Beginner: no rate-up
		{
			Result.ItemId = PickRandom(
				Banner.Featured5Star.Num() > 0 ? Banner.Featured5Star : Banner.Pool5StarStandard);
		}
		break;
	}

	case EWishRarity::FourStar:
	{
		Pity.PullsSince4Star = 0;

		if (Banner.BannerType == EBannerType::LimitedCharacter && Banner.Featured4Star.Num() > 0)
		{
			// Rate-up 4*: 50%, kalah → guaranteed berikutnya
			const bool bFeatured = Pity.bGuaranteedFeatured4Star || FMath::FRand() < 0.5f;
			if (bFeatured)
			{
				Result.ItemId = PickRandom(Banner.Featured4Star);
				Result.bFeatured = true;
				Pity.bGuaranteedFeatured4Star = false;
			}
			else
			{
				Result.ItemId = PickRandom(Banner.Pool4Star);
				Pity.bGuaranteedFeatured4Star = true;
			}
		}
		else
		{
			Result.ItemId = PickRandom(
				Banner.Featured4Star.Num() > 0 && FMath::FRand() < 0.5f
					? Banner.Featured4Star : Banner.Pool4Star);
		}
		break;
	}

	default: // 3*
		Result.ItemId = PickRandom(Banner.Pool3Star);
		break;
	}

	return Result;
}

void UWishSystem::ApplyOwnershipRewards(FWishResult& Result)
{
	UOpenWorldGameInstance* GI = GetOWGameInstance();
	if (!GI)
	{
		return;
	}

	switch (Result.Rarity)
	{
	case EWishRarity::FiveStar:
		if (GI->OwnedWishItems.Contains(Result.ItemId))
		{
			Result.bDuplicate = true;
			Result.StarglitterGained = 10;
		}
		break;

	case EWishRarity::FourStar:
		if (GI->OwnedWishItems.Contains(Result.ItemId))
		{
			Result.bDuplicate = true;
			Result.StarglitterGained = 2;
		}
		break;

	default: // 3* weapon: selalu stardust
		Result.StardustGained = 15;
		break;
	}

	GI->OwnedWishItems.Add(Result.ItemId);
	GI->Starglitter += Result.StarglitterGained;
	GI->Stardust += Result.StardustGained;
}

// ---------- Currency exchange ----------

bool UWishSystem::ConvertPrimogemsToFates(EFateType Type, int32 FateCount)
{
	UOpenWorldGameInstance* GI = GetOWGameInstance();
	const int32 Cost = FateCount * PrimogemsPerFate;
	if (!GI || FateCount <= 0 || GI->Primogems < Cost)
	{
		return false;
	}

	GI->Primogems -= Cost;
	(Type == EFateType::Acquaint ? GI->AcquaintFates : GI->IntertwinedFates) += FateCount;
	return true;
}

bool UWishSystem::ExchangeStarglitterForFate(EFateType Type, int32 FateCount)
{
	UOpenWorldGameInstance* GI = GetOWGameInstance();
	const int32 Cost = FateCount * StarglitterPerFate;
	if (!GI || FateCount <= 0 || GI->Starglitter < Cost)
	{
		return false;
	}

	GI->Starglitter -= Cost;
	(Type == EFateType::Acquaint ? GI->AcquaintFates : GI->IntertwinedFates) += FateCount;
	return true;
}

bool UWishSystem::ExchangeStardustForFate(EFateType Type, int32 FateCount)
{
	UOpenWorldGameInstance* GI = GetOWGameInstance();
	const int32 Cost = FateCount * StardustPerFate;
	if (!GI || FateCount <= 0 || GI->Stardust < Cost)
	{
		return false;
	}

	// Limit 5/bulan — reset otomatis saat ganti bulan
	const FString MonthKey = FDateTime::UtcNow().ToString(TEXT("%Y-%m"));
	if (GI->StardustExchangeMonth != MonthKey)
	{
		GI->StardustExchangeMonth = MonthKey;
		GI->StardustExchangedThisMonth = 0;
	}
	if (GI->StardustExchangedThisMonth + FateCount > StardustFateMonthlyLimit)
	{
		return false;
	}

	GI->Stardust -= Cost;
	GI->StardustExchangedThisMonth += FateCount;
	(Type == EFateType::Acquaint ? GI->AcquaintFates : GI->IntertwinedFates) += FateCount;
	return true;
}
