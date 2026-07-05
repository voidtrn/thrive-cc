#include "UI/MainHUDWidget.h"
#include "Character/CharacterBase.h"
#include "Character/OpenWorldMovementComponent.h"
#include "Combat/CombatComponent.h"
#include "Combat/AbilityBase.h"
#include "System/PartyManagerComponent.h"
#include "System/QuestManager.h"
#include "System/OpenWorldGameInstance.h"

ACharacterBase* UMainHUDWidget::GetActiveCharacter() const
{
	const APlayerController* PC = GetOwningPlayer();
	return PC ? Cast<ACharacterBase>(PC->GetPawn()) : nullptr;
}

UPartyManagerComponent* UMainHUDWidget::GetPartyManager() const
{
	const APlayerController* PC = GetOwningPlayer();
	return PC ? PC->FindComponentByClass<UPartyManagerComponent>() : nullptr;
}

UQuestManager* UMainHUDWidget::GetQuestManager() const
{
	return GetGameInstance() ? GetGameInstance()->GetSubsystem<UQuestManager>() : nullptr;
}

int32 UMainHUDWidget::GetPartySize() const
{
	const UPartyManagerComponent* Party = GetPartyManager();
	return Party ? Party->GetPartySize() : 0;
}

FPartyMemberHUD UMainHUDWidget::GetPartyMemberHUD(int32 SlotIndex) const
{
	FPartyMemberHUD Result;

	const UPartyManagerComponent* Party = GetPartyManager();
	const UOpenWorldGameInstance* GI = Cast<UOpenWorldGameInstance>(GetGameInstance());
	if (!Party || !GI)
	{
		return Result;
	}

	FCharacterDefRow Def;
	if (Party->GetSlotDef(SlotIndex, Def))
	{
		Result.Name = Def.DisplayName;
		Result.Icon = Def.Icon;
	}

	Result.bActive = Party->GetActiveSlot() == SlotIndex;

	if (Result.bActive)
	{
		// Slot aktif: HP live dari pawn
		if (const ACharacterBase* Character = GetActiveCharacter())
		{
			Result.HPFraction = Character->MaxHP > 0.f ? Character->CurrentHP / Character->MaxHP : 0.f;
			Result.bAlive = Character->IsAlive();
		}
	}
	else if (GI->SavedPartyCharacterIds.IsValidIndex(SlotIndex))
	{
		// Off-field: HP tersimpan di GameInstance
		const FName CharacterId = GI->SavedPartyCharacterIds[SlotIndex];
		const FCharacterSaveData* Data = GI->PartyCharacterData.FindByPredicate(
			[&](const FCharacterSaveData& D) { return D.CharacterId == CharacterId; });

		if (Data)
		{
			Result.HPFraction = Data->CurrentHP < 0.f ? 1.f : FMath::Clamp(Data->CurrentHP / 1000.f, 0.f, 1.f);
			Result.bAlive = Data->CurrentHP != 0.f;
		}
	}

	return Result;
}

float UMainHUDWidget::GetSkillCooldownFraction() const
{
	const ACharacterBase* Character = GetActiveCharacter();
	const UCombatComponent* Combat = Character ? Character->FindComponentByClass<UCombatComponent>() : nullptr;
	const UAbilityBase* Skill = Combat ? Combat->GetElementalSkillAbility() : nullptr;

	if (!Skill || Skill->Cooldown <= 0.f)
	{
		return 0.f;
	}
	return FMath::Clamp(Skill->GetCooldownRemaining() / Skill->Cooldown, 0.f, 1.f);
}

float UMainHUDWidget::GetBurstEnergyFraction() const
{
	const ACharacterBase* Character = GetActiveCharacter();
	if (!Character || Character->MaxEnergy <= 0.f)
	{
		return 0.f;
	}
	return FMath::Clamp(Character->CurrentEnergy / Character->MaxEnergy, 0.f, 1.f);
}

bool UMainHUDWidget::IsBurstReady() const
{
	const ACharacterBase* Character = GetActiveCharacter();
	const UCombatComponent* Combat = Character ? Character->FindComponentByClass<UCombatComponent>() : nullptr;
	const UAbilityBase* Burst = Combat ? Combat->GetElementalBurstAbility() : nullptr;
	return Burst && Burst->CanActivate(Character);
}

float UMainHUDWidget::GetStaminaFraction() const
{
	const ACharacterBase* Character = GetActiveCharacter();
	if (!Character || Character->MaxStamina <= 0.f)
	{
		return 1.f;
	}
	return Character->CurrentStamina / Character->MaxStamina;
}

bool UMainHUDWidget::ShouldShowStaminaBar() const
{
	const ACharacterBase* Character = GetActiveCharacter();
	if (!Character)
	{
		return false;
	}
	// Tampil hanya saat tidak penuh (sedang dipakai/regen) — gaya Genshin
	return Character->CurrentStamina < Character->MaxStamina - 0.5f;
}

FText UMainHUDWidget::GetTrackedQuestName() const
{
	const UQuestManager* Quests = GetQuestManager();
	if (Quests)
	{
		const TArray<UQuestDataAsset*> Active = Quests->GetActiveQuests();
		if (Active.Num() > 0)
		{
			return Active[0]->QuestName;
		}
	}
	return FText::GetEmpty();
}

FText UMainHUDWidget::GetTrackedQuestObjective() const
{
	const UQuestManager* Quests = GetQuestManager();
	if (!Quests)
	{
		return FText::GetEmpty();
	}

	const TArray<UQuestDataAsset*> Active = Quests->GetActiveQuests();
	if (Active.IsEmpty())
	{
		return FText::GetEmpty();
	}

	const FName QuestID = Active[0]->QuestID;
	FQuestStep Step;
	if (!Quests->GetCurrentStep(QuestID, Step))
	{
		return FText::GetEmpty();
	}

	const FActiveQuestState State = Quests->GetQuestState(QuestID);
	if (Step.RequiredCount > 1)
	{
		return FText::Format(NSLOCTEXT("HUD", "ObjectiveFmt", "{0}  {1}/{2}"),
			Step.StepDescription, State.CurrentCount, Step.RequiredCount);
	}
	return Step.StepDescription;
}
