#include "System/OpenWorldGameInstance.h"
#include "Kismet/GameplayStatics.h"
#include "GameFramework/Character.h"
#include "MyGame.h"

void UOpenWorldGameInstance::Init()
{
	Super::Init();

	SessionStartTime = FPlatformTime::Seconds();

	if (SavedPartyCharacterIds.IsEmpty())
	{
		SavedPartyCharacterIds = DefaultParty;
	}

	UE_LOG(LogAetherRealm, Log, TEXT("GameInstance initialized. Party size: %d"), SavedPartyCharacterIds.Num());
}

float UOpenWorldGameInstance::GetTotalPlayTimeSeconds() const
{
	return LoadedPlayTimeSeconds + static_cast<float>(FPlatformTime::Seconds() - SessionStartTime);
}

bool UOpenWorldGameInstance::SaveToSlot(const FString& SlotName)
{
	UOpenWorldSaveGame* Save = Cast<UOpenWorldSaveGame>(
		UGameplayStatics::CreateSaveGameObject(UOpenWorldSaveGame::StaticClass()));
	if (!Save)
	{
		return false;
	}

	// Posisi player saat ini
	if (const APawn* Pawn = UGameplayStatics::GetPlayerPawn(this, 0))
	{
		Save->PlayerPosition = Pawn->GetActorLocation();
		Save->PlayerRotation = Pawn->GetActorRotation();
	}
	Save->CurrentRegion = CurrentRegion;

	Save->PartyCharacters = PartyCharacterData;
	Save->ActiveCharacterIndex = SavedActiveCharacterIndex;

	for (const auto& Item : InventoryItems)
	{
		Save->InventoryItems.Add({ Item.Key, Item.Value });
	}
	Save->OpenedChests = OpenedChests.Array();
	Save->CollectedOculi = CollectedOculi.Array();
	Save->UnlockedWaypoints = UnlockedWaypoints.Array();
	Save->CompletedQuests = CompletedQuests.Array();
	Save->QuestProgress = QuestProgress;
	Save->ActiveQuestStates = ActiveQuestStates;
	Save->DailyCommissionDate = DailyCommissionDate;
	Save->DailyCommissionQuests = DailyCommissionQuests;

	Save->Primogems = Primogems;
	Save->Mora = Mora;
	Save->AdventureRank = AdventureRank;
	Save->ARExperience = ARExperience;

	Save->AcquaintFates = AcquaintFates;
	Save->IntertwinedFates = IntertwinedFates;
	Save->Starglitter = Starglitter;
	Save->Stardust = Stardust;
	Save->OwnedWishItems = OwnedWishItems.Array();
	Save->WishPityStates = WishPityStates;
	Save->StardustExchangeMonth = StardustExchangeMonth;
	Save->StardustExchangedThisMonth = StardustExchangedThisMonth;

	// Prune history > 6 bulan lalu simpan
	const FDateTime Cutoff = FDateTime::UtcNow() - FTimespan::FromDays(183);
	WishHistory.RemoveAll([&](const FWishHistoryEntry& E) { return E.Timestamp < Cutoff; });
	Save->WishHistory = WishHistory;

	Save->MapPins = MapPins;
	Save->OwnedArtifacts = OwnedArtifacts;
	Save->OwnedWeapons = OwnedWeapons;
	Save->CharacterTalents = CharacterTalents;
	Save->CharacterConstellations = CharacterConstellations;

	// Chronicle (memoar) — subsystem yang pegang datanya
	if (const USessionChronicleSubsystem* Chronicle = GetSubsystem<USessionChronicleSubsystem>())
	{
		Chronicle->ExportToSave(Save);
	}

	Save->PlayTimeSeconds = GetTotalPlayTimeSeconds();
	Save->StaminaCapBonus = StaminaCapBonus;
	Save->GameSettings = GameSettings;
	Save->Timestamp = FDateTime::Now();

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

	CurrentRegion = Save->CurrentRegion;
	LastOpenWorldTransform = FTransform(Save->PlayerRotation, Save->PlayerPosition);

	PartyCharacterData = Save->PartyCharacters;
	SavedActiveCharacterIndex = Save->ActiveCharacterIndex;
	SavedPartyCharacterIds.Reset();
	for (const FCharacterSaveData& Data : Save->PartyCharacters)
	{
		SavedPartyCharacterIds.Add(Data.CharacterId);
	}
	if (SavedPartyCharacterIds.IsEmpty())
	{
		SavedPartyCharacterIds = DefaultParty;
	}

	InventoryItems.Reset();
	for (const FItemSaveData& Item : Save->InventoryItems)
	{
		InventoryItems.Add(Item.ItemId, Item.Count);
	}
	OpenedChests = TSet<FName>(Save->OpenedChests);
	CollectedOculi = TSet<FName>(Save->CollectedOculi);
	UnlockedWaypoints = TSet<FName>(Save->UnlockedWaypoints);
	CompletedQuests = TSet<FName>(Save->CompletedQuests);
	QuestProgress = Save->QuestProgress;
	ActiveQuestStates = Save->ActiveQuestStates;
	DailyCommissionDate = Save->DailyCommissionDate;
	DailyCommissionQuests = Save->DailyCommissionQuests;

	Primogems = Save->Primogems;
	Mora = Save->Mora;
	AdventureRank = Save->AdventureRank;
	ARExperience = Save->ARExperience;

	AcquaintFates = Save->AcquaintFates;
	IntertwinedFates = Save->IntertwinedFates;
	Starglitter = Save->Starglitter;
	Stardust = Save->Stardust;
	OwnedWishItems = TSet<FName>(Save->OwnedWishItems);
	WishPityStates = Save->WishPityStates;
	StardustExchangeMonth = Save->StardustExchangeMonth;
	StardustExchangedThisMonth = Save->StardustExchangedThisMonth;
	WishHistory = Save->WishHistory;

	MapPins = Save->MapPins;
	OwnedArtifacts = Save->OwnedArtifacts;
	OwnedWeapons = Save->OwnedWeapons;
	CharacterTalents = Save->CharacterTalents;
	CharacterConstellations = Save->CharacterConstellations;

	// Chronicle (memoar) — restore ke subsystem
	if (USessionChronicleSubsystem* Chronicle = GetSubsystem<USessionChronicleSubsystem>())
	{
		Chronicle->ImportFromSave(Save);
	}

	LoadedPlayTimeSeconds = Save->PlayTimeSeconds;
	SessionStartTime = FPlatformTime::Seconds();
	StaminaCapBonus = Save->StaminaCapBonus;
	GameSettings = Save->GameSettings;

	UE_LOG(LogAetherRealm, Log, TEXT("Loaded slot '%s' (playtime %.0fs)"), *SlotName, LoadedPlayTimeSeconds);
	return true;
}

void UOpenWorldGameInstance::AutoSave()
{
	SaveToSlot(TEXT("Slot0"));
}

bool UOpenWorldGameInstance::AddMapPin(const FMapPin& Pin)
{
	if (MapPins.Num() >= 99)
	{
		return false;
	}
	MapPins.Add(Pin);
	return true;
}

int32 UOpenWorldGameInstance::GetItemCount(FName ItemId) const
{
	const int32* Count = InventoryItems.Find(ItemId);
	return Count ? *Count : 0;
}

void UOpenWorldGameInstance::AddItem(FName ItemId, int32 Count)
{
	if (ItemId.IsNone() || Count == 0)
	{
		return;
	}
	int32& Stored = InventoryItems.FindOrAdd(ItemId);
	Stored = FMath::Max(0, Stored + Count);
	if (Stored == 0)
	{
		InventoryItems.Remove(ItemId);
	}
}

bool UOpenWorldGameInstance::RemoveItem(FName ItemId, int32 Count)
{
	if (Count <= 0)
	{
		return true;
	}
	int32* Stored = InventoryItems.Find(ItemId);
	if (!Stored || *Stored < Count)
	{
		return false; // stok kurang — jangan ubah apa pun
	}
	*Stored -= Count;
	if (*Stored == 0)
	{
		InventoryItems.Remove(ItemId);
	}
	return true;
}
