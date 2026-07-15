// Copyright StickmanImpact Project.

#include "StickmanCheatManager.h"
#include "Data/InventoryManager.h"
#include "Party/PartyManager.h"
#include "Quest/QuestManager.h"
#include "Quest/QuestDataAsset.h"
#include "World/WaypointManager.h"
#include "World/WaypointActor.h"
#include "Character/StickmanCharacter.h"
#include "Combat/StickmanAbilitySystemComponent.h"
#include "Combat/StickmanGameplayAbility.h"
#include "Kismet/GameplayStatics.h"
#include "EngineUtils.h"

bool UStickmanCheatManager::bGodMode = false;
bool UStickmanCheatManager::bInfiniteStamina = false;
bool UStickmanCheatManager::bOneShot = false;
bool UStickmanCheatManager::bInfiniteEnergy = false;
bool UStickmanCheatManager::bNoCooldown = false;

void UStickmanCheatManager::AddItem(FName ItemID, int32 Count)
{
	UGameInstance* GameInstance = GetWorld() ? GetWorld()->GetGameInstance() : nullptr;
	if (UInventoryManager* Inventory = GameInstance ? GameInstance->GetSubsystem<UInventoryManager>() : nullptr)
	{
		FInventoryItem Item;
		Item.ItemID = ItemID;
		Item.DisplayName = FText::FromName(ItemID);
		Item.Category = EInventoryCategory::Materials;
		Inventory->AddItem(Item, FMath::Max(Count, 1));
		UE_LOG(LogTemp, Display, TEXT("[Cheat] Added %d x %s"), Count, *ItemID.ToString());
	}
}

void UStickmanCheatManager::SetLevel(int32 Level)
{
	UGameInstance* GameInstance = GetWorld() ? GetWorld()->GetGameInstance() : nullptr;
	UPartyManager* Party = GameInstance ? GameInstance->GetSubsystem<UPartyManager>() : nullptr;
	if (!Party || Party->GetPartyMembers().Num() == 0)
	{
		return;
	}
	// GrantEXP levels through the curve; grant enough to reach the target from current.
	const int32 ActiveIndex = Party->GetActiveIndex();
	float TotalEXP = 0.f;
	for (int32 L = Party->GetPartyMembers()[ActiveIndex].CurrentLevel; L < Level; ++L)
	{
		TotalEXP += 100.f * L * L;
	}
	Party->GrantEXP(ActiveIndex, TotalEXP + 1.f);
	UE_LOG(LogTemp, Display, TEXT("[Cheat] Active member leveled toward %d"), Level);
}

void UStickmanCheatManager::UnlockAllSkills()
{
	const AStickmanCharacter* Character = Cast<AStickmanCharacter>(UGameplayStatics::GetPlayerPawn(this, 0));
	UStickmanAbilitySystemComponent* ASC = Character ? Character->GetStickmanAbilitySystemComponent() : nullptr;
	if (!ASC)
	{
		return;
	}
	// "Unlock" = clear every skill's cooldown tag so everything is castable now; permanent
	// skill acquisition already comes from DefaultAbilities/party data.
	for (const FGameplayAbilitySpec& Spec : ASC->GetActivatableAbilities())
	{
		if (const UStickmanGameplayAbility* Ability = Cast<UStickmanGameplayAbility>(Spec.Ability))
		{
			if (Ability->SkillData.SkillTag.IsValid())
			{
				ASC->RemoveLooseGameplayTag(Ability->SkillData.SkillTag);
			}
		}
	}
	UE_LOG(LogTemp, Display, TEXT("[Cheat] All skill cooldowns cleared."));
}

void UStickmanCheatManager::Teleport(const FString& WaypointID)
{
	UWorld* World = GetWorld();
	if (!World)
	{
		return;
	}
	for (TActorIterator<AWaypointActor> It(World); It; ++It)
	{
		if (It->WaypointID == WaypointID)
		{
			if (APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0))
			{
				PlayerPawn->SetActorLocation(It->GetActorLocation() + FVector(0.f, 0.f, 100.f), false, nullptr,
					ETeleportType::TeleportPhysics);
				UE_LOG(LogTemp, Display, TEXT("[Cheat] Teleported to %s"), *WaypointID);
			}
			return;
		}
	}
	UE_LOG(LogTemp, Warning, TEXT("[Cheat] No waypoint with ID '%s'"), *WaypointID);
}

void UStickmanCheatManager::CompleteQuest(const FString& QuestID)
{
	UGameInstance* GameInstance = GetWorld() ? GetWorld()->GetGameInstance() : nullptr;
	UQuestManager* Quests = GameInstance ? GameInstance->GetSubsystem<UQuestManager>() : nullptr;
	if (!Quests || !Quests->IsQuestActive(QuestID))
	{
		UE_LOG(LogTemp, Warning, TEXT("[Cheat] Quest '%s' not active."), *QuestID);
		return;
	}

	// Pump ReportProgress until every stage completes (bounded — quests are finite).
	for (int32 Guard = 0; Guard < 100 && Quests->IsQuestActive(QuestID); ++Guard)
	{
		const FQuestStage Stage = Quests->GetCurrentStage(QuestID);
		for (const FQuestObjective& Objective : Stage.Objectives)
		{
			Quests->ReportProgress(Objective.ObjectiveType, Objective.TargetIdentifier, Objective.TargetActor,
				Objective.TargetLocation, Objective.RequiredCount);
		}
	}
	UE_LOG(LogTemp, Display, TEXT("[Cheat] Quest '%s' force-completed."), *QuestID);
}

void UStickmanCheatManager::GodMode()
{
	bGodMode = !bGodMode;
	UE_LOG(LogTemp, Display, TEXT("[Cheat] GodMode %s"), bGodMode ? TEXT("ON") : TEXT("OFF"));
}

void UStickmanCheatManager::InfiniteStamina()
{
	bInfiniteStamina = !bInfiniteStamina;
	UE_LOG(LogTemp, Display, TEXT("[Cheat] InfiniteStamina %s"), bInfiniteStamina ? TEXT("ON") : TEXT("OFF"));
}

void UStickmanCheatManager::OneShot()
{
	bOneShot = !bOneShot;
	UE_LOG(LogTemp, Display, TEXT("[Cheat] OneShot %s"), bOneShot ? TEXT("ON") : TEXT("OFF"));
}

void UStickmanCheatManager::InfiniteEnergy()
{
	bInfiniteEnergy = !bInfiniteEnergy;
	UE_LOG(LogTemp, Display, TEXT("[Cheat] InfiniteEnergy %s"), bInfiniteEnergy ? TEXT("ON") : TEXT("OFF"));
}

void UStickmanCheatManager::NoCooldown()
{
	bNoCooldown = !bNoCooldown;
	UE_LOG(LogTemp, Display, TEXT("[Cheat] NoCooldown %s"), bNoCooldown ? TEXT("ON") : TEXT("OFF"));
}
