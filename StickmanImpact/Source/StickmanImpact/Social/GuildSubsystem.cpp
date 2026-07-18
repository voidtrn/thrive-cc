// Copyright StickmanImpact Project.

#include "GuildSubsystem.h"

bool UGuildSubsystem::CreateGuild(const FString& Name, const FString& Tag)
{
	if (bInGuild || Name.IsEmpty() || Tag.Len() < 2 || Tag.Len() > 4)
	{
		return false;
	}

	Guild = FGuildInfo();
	Guild.GuildName = Name;
	Guild.GuildTag = Tag;
	bInGuild = true;

	// Creator is the Guild Master.
	AddMember(TEXT("You"), EGuildRole::GuildMaster);
	return true;
}

// ---------------------------------------------------------------- members -------------

FGuildMember* UGuildSubsystem::FindMember(const FString& PlayerName)
{
	return Members.FindByPredicate([&](const FGuildMember& Member) { return Member.PlayerName == PlayerName; });
}

void UGuildSubsystem::AddMember(const FString& PlayerName, EGuildRole Role)
{
	if (!bInGuild || FindMember(PlayerName) || Members.Num() >= GetMemberCap())
	{
		return;
	}
	FGuildMember Member;
	Member.PlayerName = PlayerName;
	Member.Role = Role;
	Members.Add(Member);
}

bool UGuildSubsystem::SetMemberRole(const FString& PlayerName, EGuildRole Role)
{
	if (FGuildMember* Member = FindMember(PlayerName))
	{
		Member->Role = Role;
		return true;
	}
	return false;
}

// ---------------------------------------------------------------- progression ---------

void UGuildSubsystem::AddGuildEXP(int32 Amount)
{
	if (!bInGuild || Amount <= 0)
	{
		return;
	}
	Guild.GuildEXP += Amount;
	const int32 NewLevel = FMath::Clamp(1 + Guild.GuildEXP / EXPPerLevel, 1, 50);
	if (NewLevel > Guild.Level)
	{
		Guild.Level = NewLevel;
		OnGuildLevelUp.Broadcast(NewLevel);
	}
}

// ---------------------------------------------------------------- bank ----------------

void UGuildSubsystem::DepositItem(FName ItemID, int32 Quantity)
{
	if (bInGuild && HasPerk(10) && Quantity > 0) // bank unlocks at guild level 10
	{
		Bank.FindOrAdd(ItemID) += Quantity;
	}
}

bool UGuildSubsystem::WithdrawItem(FName ItemID, int32 Quantity)
{
	int32* Stored = Bank.Find(ItemID);
	if (!Stored || *Stored < Quantity || Quantity <= 0)
	{
		return false;
	}
	*Stored -= Quantity;
	return true;
}

int32 UGuildSubsystem::GetBankQuantity(FName ItemID) const
{
	const int32* Stored = Bank.Find(ItemID);
	return Stored ? *Stored : 0;
}

// ---------------------------------------------------------------- missions ------------

void UGuildSubsystem::SetWeeklyMission(FName MissionID, int32 Goal)
{
	FMission Mission;
	Mission.Goal = Goal;
	WeeklyMissions.Add(MissionID, Mission);
}

void UGuildSubsystem::AddMissionProgress(FName MissionID, int32 Amount, const FString& ContributorName)
{
	FMission* Mission = WeeklyMissions.Find(MissionID);
	if (!Mission || Mission->Goal <= 0 || Amount <= 0)
	{
		return;
	}

	const bool bWasComplete = Mission->Progress >= Mission->Goal;
	Mission->Progress += Amount;

	if (FGuildMember* Contributor = FindMember(ContributorName))
	{
		Contributor->WeeklyContribution += Amount;
	}
	AddGuildEXP(Amount);

	if (!bWasComplete && Mission->Progress >= Mission->Goal)
	{
		OnGuildMissionCompleted.Broadcast(MissionID);
	}
}

// ---------------------------------------------------------------- raid boss -----------

void UGuildSubsystem::StartRaidBoss(float TotalHP)
{
	if (!HasPerk(30)) // raid boss unlocks at guild level 30
	{
		return;
	}
	RaidBossMaxHP = FMath::Max(TotalHP, 1.f);
	RaidBossHP = RaidBossMaxHP;
	RaidRewardTierFired = 0;
	RaidContributions.Empty();
}

void UGuildSubsystem::AddRaidDamage(float Damage, const FString& ContributorName)
{
	if (RaidBossHP <= 0.f || Damage <= 0.f)
	{
		return;
	}

	RaidBossHP = FMath::Max(RaidBossHP - Damage, 0.f);
	RaidContributions.FindOrAdd(ContributorName) += Damage;

	// Reward tiers at 75/50/25/0% remaining.
	const float Fraction = GetRaidHPFraction();
	static const float Tiers[] = { 0.75f, 0.5f, 0.25f, 0.f };
	for (int32 Index = RaidRewardTierFired; Index < 4; ++Index)
	{
		if (Fraction <= Tiers[Index])
		{
			RaidRewardTierFired = Index + 1;
			OnGuildRaidProgress.Broadcast(Fraction, RaidRewardTierFired);
		}
	}
}

float UGuildSubsystem::GetRaidHPFraction() const
{
	return RaidBossMaxHP > 0.f ? RaidBossHP / RaidBossMaxHP : 0.f;
}

// ---------------------------------------------------------------- save ----------------

void UGuildSubsystem::ExportSaveState(FGuildInfo& OutGuild, TArray<FGuildMember>& OutMembers, TMap<FName, int32>& OutBank) const
{
	OutGuild = Guild;
	OutMembers = Members;
	OutBank = Bank;
}

void UGuildSubsystem::ImportSaveState(const FGuildInfo& InGuild, const TArray<FGuildMember>& InMembers, const TMap<FName, int32>& InBank)
{
	Guild = InGuild;
	Members = InMembers;
	Bank = InBank;
	bInGuild = !Guild.GuildName.IsEmpty();
}
