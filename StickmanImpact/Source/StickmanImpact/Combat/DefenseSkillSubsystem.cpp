// Copyright StickmanImpact Project.

#include "DefenseSkillSubsystem.h"
#include "Party/PartyManager.h"

void UDefenseSkillSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);

	Collection.InitializeDependency<UPartyManager>();
	if (UPartyManager* Party = GetGameInstance()->GetSubsystem<UPartyManager>())
	{
		Party->OnMemberAscended.AddDynamic(this, &UDefenseSkillSubsystem::HandleMemberAscended);
	}
}

void UDefenseSkillSubsystem::Deinitialize()
{
	if (UPartyManager* Party = GetGameInstance()->GetSubsystem<UPartyManager>())
	{
		Party->OnMemberAscended.RemoveDynamic(this, &UDefenseSkillSubsystem::HandleMemberAscended);
	}
	Super::Deinitialize();
}

void UDefenseSkillSubsystem::SetPerfectDodgeLevel(int32 Level)
{
	const int32 Clamped = FMath::Clamp(Level, 0, 4);
	if (Clamped != PerfectDodgeLevel)
	{
		PerfectDodgeLevel = Clamped;
		OnDefenseSkillUnlocked.Broadcast(false, PerfectDodgeLevel);
	}
}

void UDefenseSkillSubsystem::SetParryLevel(int32 Level)
{
	const int32 Clamped = FMath::Clamp(Level, 0, 4);
	if (Clamped != ParryLevel)
	{
		ParryLevel = Clamped;
		OnDefenseSkillUnlocked.Broadcast(true, ParryLevel);
	}
}

void UDefenseSkillSubsystem::HandleMemberAscended(int32 MemberIndex, int32 NewAscensionLevel)
{
	// Ascension unlocks both tracks up to the reached level (capped 4). Never downgrades.
	SetPerfectDodgeLevel(FMath::Max(PerfectDodgeLevel, FMath::Min(NewAscensionLevel, 4)));
	SetParryLevel(FMath::Max(ParryLevel, FMath::Min(NewAscensionLevel, 4)));
}
