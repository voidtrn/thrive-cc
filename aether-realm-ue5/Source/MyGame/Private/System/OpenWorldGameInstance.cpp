#include "System/OpenWorldGameInstance.h"
#include "System/OpenWorldSaveGame.h"
#include "Kismet/GameplayStatics.h"
#include "MyGame.h"

void UOpenWorldGameInstance::Init()
{
	Super::Init();

	if (SavedPartyCharacterIds.IsEmpty())
	{
		SavedPartyCharacterIds = DefaultParty;
	}

	UE_LOG(LogAetherRealm, Log, TEXT("GameInstance initialized. Party size: %d"), SavedPartyCharacterIds.Num());
}

bool UOpenWorldGameInstance::SaveToSlot(const FString& SlotName)
{
	UOpenWorldSaveGame* Save = Cast<UOpenWorldSaveGame>(
		UGameplayStatics::CreateSaveGameObject(UOpenWorldSaveGame::StaticClass()));
	if (!Save)
	{
		return false;
	}

	Save->PartyCharacterIds = SavedPartyCharacterIds;
	Save->ActiveCharacterIndex = SavedActiveCharacterIndex;
	Save->UnlockedWaypoints = UnlockedWaypoints.Array();
	Save->CollectedItemIds = CollectedItemIds.Array();
	Save->LastOpenWorldTransform = LastOpenWorldTransform;

	const bool bOk = UGameplayStatics::SaveGameToSlot(Save, SlotName, 0);
	UE_LOG(LogAetherRealm, Log, TEXT("Save to '%s': %s"), *SlotName, bOk ? TEXT("OK") : TEXT("FAILED"));
	return bOk;
}

bool UOpenWorldGameInstance::LoadFromSlot(const FString& SlotName)
{
	if (!UGameplayStatics::DoesSaveGameExist(SlotName, 0))
	{
		return false;
	}

	UOpenWorldSaveGame* Save = Cast<UOpenWorldSaveGame>(
		UGameplayStatics::LoadGameFromSlot(SlotName, 0));
	if (!Save)
	{
		return false;
	}

	SavedPartyCharacterIds = Save->PartyCharacterIds;
	SavedActiveCharacterIndex = Save->ActiveCharacterIndex;
	UnlockedWaypoints = TSet<FName>(Save->UnlockedWaypoints);
	CollectedItemIds = TSet<FName>(Save->CollectedItemIds);
	LastOpenWorldTransform = Save->LastOpenWorldTransform;

	UE_LOG(LogAetherRealm, Log, TEXT("Loaded slot '%s'"), *SlotName);
	return true;
}
