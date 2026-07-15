// Copyright StickmanImpact Project.

#include "PartyManager.h"
#include "Character/StickmanCharacter.h"
#include "Combat/StickmanAbilitySystemComponent.h"
#include "Data/InventoryManager.h"
#include "Kismet/GameplayStatics.h"
#include "TimerManager.h"

bool UPartyManager::AddPartyMember(const FStickmanCharacterData& CharacterData)
{
	if (PartyMembers.Num() >= MaxPartySize || CharacterData.CharacterID.IsEmpty())
	{
		return false;
	}
	for (const FPartyMemberState& Existing : PartyMembers)
	{
		if (Existing.CharacterData.CharacterID == CharacterData.CharacterID)
		{
			return false;
		}
	}

	FPartyMemberState NewMember;
	NewMember.CharacterData = CharacterData;
	NewMember.CurrentLevel = 1;
	PartyMembers.Add(NewMember);

	RecalculateResonance();

	if (PartyMembers.Num() == 1)
	{
		ActiveIndex = 0;
		ApplyActiveMemberToPawn();
	}
	return true;
}

bool UPartyManager::RemovePartyMember(const FString& CharacterID)
{
	const int32 FoundIndex = PartyMembers.IndexOfByPredicate(
		[&CharacterID](const FPartyMemberState& Member) { return Member.CharacterData.CharacterID == CharacterID; });
	if (FoundIndex == INDEX_NONE)
	{
		return false;
	}

	PartyMembers.RemoveAt(FoundIndex);
	RecalculateResonance();

	if (ActiveIndex >= PartyMembers.Num())
	{
		ActiveIndex = FMath::Max(PartyMembers.Num() - 1, 0);
	}
	return true;
}

bool UPartyManager::SwitchToIndex(int32 Index)
{
	if (!PartyMembers.IsValidIndex(Index) || Index == ActiveIndex || bSwitchOnCooldown)
	{
		return false;
	}

	const int32 OldIndex = ActiveIndex;
	ActiveIndex = Index;
	ApplyActiveMemberToPawn();

	bSwitchOnCooldown = true;
	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().SetTimer(SwitchCooldownTimerHandle, [this]() { bSwitchOnCooldown = false; },
			SwitchCooldownDuration, false);
	}

	OnPartySwitched.Broadcast(ActiveIndex, OldIndex);

	if (bAutoBurstOnSwitchUnlocked)
	{
		if (AStickmanCharacter* PlayerCharacter = Cast<AStickmanCharacter>(UGameplayStatics::GetPlayerPawn(this, 0)))
		{
			if (UStickmanAbilitySystemComponent* ASC = PlayerCharacter->GetStickmanAbilitySystemComponent())
			{
				ASC->ActivateSkillByTag(PlayerCharacter->GetSkill2Tag());
			}
		}
	}

	return true;
}

void UPartyManager::ApplyActiveMemberToPawn()
{
	if (AStickmanCharacter* PlayerCharacter = Cast<AStickmanCharacter>(UGameplayStatics::GetPlayerPawn(this, 0)))
	{
		PlayerCharacter->ApplyCharacterData(GetActiveMember().CharacterData);
	}
	// "Incoming character can trigger an on-switch passive" — abilities/systems that want to
	// react to this hook OnPartySwitched (broadcast right after this call in SwitchToIndex).
}

FPartyMemberState UPartyManager::GetActiveMember() const
{
	return PartyMembers.IsValidIndex(ActiveIndex) ? PartyMembers[ActiveIndex] : FPartyMemberState();
}

float UPartyManager::GetEXPRequiredForLevel(int32 Level) const
{
	return 100.f * Level * Level; // Simple quadratic curve — retune freely per balance pass.
}

void UPartyManager::GrantEXP(int32 MemberIndex, float EXPAmount)
{
	if (!PartyMembers.IsValidIndex(MemberIndex) || EXPAmount <= 0.f)
	{
		return;
	}

	FPartyMemberState& Member = PartyMembers[MemberIndex];
	Member.CurrentEXP += EXPAmount;

	while (Member.CurrentLevel < MaxCharacterLevel
		&& Member.CurrentEXP >= GetEXPRequiredForLevel(Member.CurrentLevel))
	{
		Member.CurrentEXP -= GetEXPRequiredForLevel(Member.CurrentLevel);
		++Member.CurrentLevel;
		OnMemberLeveledUp.Broadcast(MemberIndex, Member.CurrentLevel);
	}

	if (MemberIndex == ActiveIndex)
	{
		ApplyActiveMemberToPawn();
	}
}

bool UPartyManager::TryAscend(int32 MemberIndex)
{
	if (!PartyMembers.IsValidIndex(MemberIndex))
	{
		return false;
	}

	FPartyMemberState& Member = PartyMembers[MemberIndex];
	const int32 NextAscensionIndex = Member.CurrentAscension;
	if (!Member.CharacterData.AscensionLevels.IsValidIndex(NextAscensionIndex))
	{
		return false; // Already at max ascension.
	}

	const FCharacterAscension& NextAscension = Member.CharacterData.AscensionLevels[NextAscensionIndex];
	if (Member.CurrentLevel < NextAscension.RequiredCharacterLevel)
	{
		return false;
	}

	if (NextAscension.RequiredMaterials.Num() > 0)
	{
		UInventoryManager* Inventory = GetGameInstance()->GetSubsystem<UInventoryManager>();
		if (!Inventory || !Inventory->ConsumeItems(NextAscension.RequiredMaterials))
		{
			return false; // Missing ascension materials.
		}
	}

	UE_LOG(LogTemp, Log, TEXT("[PartyManager] Ascending %s to ascension %d"),
		*Member.CharacterData.CharacterName.ToString(), NextAscension.AscensionLevel);

	Member.CurrentAscension = NextAscension.AscensionLevel;
	OnMemberAscended.Broadcast(MemberIndex, Member.CurrentAscension);

	if (MemberIndex == ActiveIndex)
	{
		ApplyActiveMemberToPawn();
	}
	return true;
}

void UPartyManager::ImportSaveState(const TArray<FPartyMemberState>& Members, int32 ActiveMemberIndex)
{
	PartyMembers = Members;
	ActiveIndex = PartyMembers.IsValidIndex(ActiveMemberIndex) ? ActiveMemberIndex : 0;
	RecalculateResonance();
	if (PartyMembers.Num() > 0)
	{
		ApplyActiveMemberToPawn();
	}
}

void UPartyManager::RecalculateResonance()
{
	TMap<EStickmanElement, int32> ElementCounts;
	for (const FPartyMemberState& Member : PartyMembers)
	{
		ElementCounts.FindOrAdd(Member.CharacterData.Element)++;
	}

	FElementalResonanceBonuses NewResonance;

	const bool bAllFourDifferent = PartyMembers.Num() == MaxPartySize && ElementCounts.Num() == MaxPartySize;
	if (bAllFourDifferent)
	{
		NewResonance.AllElementalDMGBonusPercent = 0.15f;
	}
	else
	{
		for (const auto& Pair : ElementCounts)
		{
			if (Pair.Value < 2)
			{
				continue;
			}
			switch (Pair.Key)
			{
				case EStickmanElement::Pyro: NewResonance.AttackBonusPercent = 0.25f; break;
				case EStickmanElement::Cryo: NewResonance.CritRateBonusPercent = 0.15f; break;
				case EStickmanElement::Hydro: NewResonance.HealingBonusPercent = 0.20f; break;
				case EStickmanElement::Electro: NewResonance.EnergyRechargeBonusPercent = 0.25f; break;
				case EStickmanElement::Anemo: NewResonance.MoveSpeedBonusPercent = 0.10f; break;
				case EStickmanElement::Geo: NewResonance.ShieldStrengthBonusPercent = 0.15f; break;
				case EStickmanElement::Dendro: NewResonance.ElementalMasteryBonusFlat = 80.f; break;
				default: break;
			}
		}
	}

	CachedResonance = NewResonance;
	OnResonanceChanged.Broadcast();
}
