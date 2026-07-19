// Copyright StickmanImpact Project.

#include "SaveManager.h"
#include "Dialogue/DialogueManager.h"
#include "Quest/QuestManager.h"
#include "Quest/QuestDataAsset.h"
#include "World/WaypointManager.h"
#include "World/WaypointActor.h"
#include "World/CollectibleManager.h"
#include "World/DayNightManager.h"
#include "Cutscene/CutsceneManager.h"
#include "Data/InventoryManager.h"
#include "Party/PartyManager.h"
#include "UI/Menus/SettingsScreenWidget.h"
#include "Kismet/GameplayStatics.h"
#include "Serialization/MemoryWriter.h"
#include "Serialization/MemoryReader.h"
#include "Serialization/ObjectAndNameAsStringProxyArchive.h"
#include "Misc/Compression.h"
#include "Misc/Crc.h"
#include "Misc/FileHelper.h"
#include "HAL/PlatformFileManager.h"
#include "Async/Async.h"
#include "TimerManager.h"

namespace
{
	constexpr uint32 SaveMagic = 0x53544B4D; // "STKM"
	constexpr int32 CurrentSaveVersion = 1;
	// Obfuscation key — deterrence only, see header comment. Not a secret.
	constexpr uint8 XORKey[] = { 0x5A, 0x13, 0xC7, 0x2E, 0x81, 0x4F, 0x9B, 0x66 };

	TArray<uint8> SerializeSaveObject(UStickmanSaveGame* SaveObject)
	{
		TArray<uint8> Bytes;
		FMemoryWriter Writer(Bytes, true);
		FObjectAndNameAsStringProxyArchive Archive(Writer, false);
		Archive.ArIsSaveGame = true;
		SaveObject->Serialize(Archive);
		return Bytes;
	}

	UStickmanSaveGame* DeserializeSaveObject(const TArray<uint8>& Bytes)
	{
		UStickmanSaveGame* SaveObject = NewObject<UStickmanSaveGame>();
		FMemoryReader Reader(Bytes, true);
		FObjectAndNameAsStringProxyArchive Archive(Reader, false);
		Archive.ArIsSaveGame = true;
		SaveObject->Serialize(Archive);
		return SaveObject;
	}
}

void USaveManager::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);
	SessionStartSeconds = FPlatformTime::Seconds();

	// Subsystem init order isn't guaranteed — defer delegate wiring one tick.
	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().SetTimerForNextTick([this]()
		{
			if (UQuestManager* Quests = GetGameInstance()->GetSubsystem<UQuestManager>())
			{
				Quests->OnQuestUpdated.AddDynamic(this, &USaveManager::HandleQuestUpdated);
			}
			if (UWaypointManager* Waypoints = GetGameInstance()->GetSubsystem<UWaypointManager>())
			{
				Waypoints->OnWaypointUnlocked.AddDynamic(this, &USaveManager::HandleWaypointUnlocked);
			}
			StartAutoSaveTimer();

			GetWorld()->GetTimerManager().SetTimer(FogSampleTimerHandle, this, &USaveManager::SampleFogPoint, 5.f, true);
		});
	}
}

void USaveManager::Deinitialize()
{
	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().ClearTimer(AutoSaveTimerHandle);
		World->GetTimerManager().ClearTimer(FogSampleTimerHandle);
	}
	Super::Deinitialize();
}

void USaveManager::StartAutoSaveTimer()
{
	const float IntervalSeconds = FMath::Max(USettingsScreenWidget::GetSavedAutoSaveIntervalMinutes(), 1.f) * 60.f;
	GetWorld()->GetTimerManager().SetTimer(AutoSaveTimerHandle,
		FTimerDelegate::CreateWeakLambda(this, [this]() { RequestAutoSave(TEXT("interval")); }),
		IntervalSeconds, true);
}

void USaveManager::HandleQuestUpdated(UQuestDataAsset* Quest, int32 StageIndex)
{
	RequestAutoSave(TEXT("quest progress"));
}

void USaveManager::HandleWaypointUnlocked(AWaypointActor* Waypoint)
{
	// Waypoint unlock doubles as the "area transition" auto-save trigger — one world, no
	// hard level transitions to hook.
	RequestAutoSave(TEXT("waypoint unlocked"));
}

void USaveManager::RequestAutoSave(const FString& Reason)
{
	UE_LOG(LogTemp, Log, TEXT("[SaveManager] Auto-save (%s)"), *Reason);
	SaveToSlot(AutoSaveSlot);
}

void USaveManager::SampleFogPoint()
{
	if (const APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0))
	{
		const FVector Location = PlayerPawn->GetActorLocation();
		// Skip if barely moved since the last sample — keeps the array bounded on idle.
		if (VisitedFogPoints.Num() == 0
			|| FVector2D::DistSquared(VisitedFogPoints.Last(), FVector2D(Location.X, Location.Y)) > FMath::Square(500.f))
		{
			VisitedFogPoints.Add(FVector2D(Location.X, Location.Y));
		}
	}
}

float USaveManager::GetTotalPlaytimeSeconds() const
{
	return LoadedPlaytimeSeconds + static_cast<float>(FPlatformTime::Seconds() - SessionStartSeconds);
}

// -------------------------------------------------------------------
// Gather / apply
// -------------------------------------------------------------------

UStickmanSaveGame* USaveManager::GatherWorldState()
{
	UStickmanSaveGame* Save = NewObject<UStickmanSaveGame>(this);
	Save->SaveVersion = CurrentSaveVersion;

	UGameInstance* GameInstance = GetGameInstance();

	if (const APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0))
	{
		Save->PlayerLocation = PlayerPawn->GetActorLocation();
		Save->PlayerRotation = PlayerPawn->GetActorRotation();
	}
	if (const UPartyManager* Party = GameInstance->GetSubsystem<UPartyManager>())
	{
		Save->PartyMembers = Party->GetPartyMembers();
		Save->ActivePartyIndex = Party->GetActiveIndex();
	}
	if (const UInventoryManager* Inventory = GameInstance->GetSubsystem<UInventoryManager>())
	{
		Save->InventoryItems = Inventory->ExportItems();
	}
	if (const UQuestManager* Quests = GameInstance->GetSubsystem<UQuestManager>())
	{
		Quests->ExportSaveState(Save->ActiveQuests, Save->CompletedQuestIDs, Save->TrackedQuestID);
	}
	if (const UDialogueManager* Dialogue = GameInstance->GetSubsystem<UDialogueManager>())
	{
		Dialogue->ExportSaveState(Save->StoryFlags, Save->PlayedDialogueIDs);
	}
	if (const UCutsceneManager* Cutscenes = GameInstance->GetSubsystem<UCutsceneManager>())
	{
		Save->WatchedCutsceneIDs = Cutscenes->GetWatchedCutsceneIDs();
	}
	if (const UWaypointManager* Waypoints = GameInstance->GetSubsystem<UWaypointManager>())
	{
		Save->UnlockedWaypointIDs = Waypoints->GetUnlockedWaypointIDs();
	}
	if (const UCollectibleManager* Collectibles = GameInstance->GetSubsystem<UCollectibleManager>())
	{
		Save->CollectedItemIDs = Collectibles->GetCollectedIDs();
	}
	if (const ADayNightManager* DayNight = Cast<ADayNightManager>(
			UGameplayStatics::GetActorOfClass(this, ADayNightManager::StaticClass())))
	{
		Save->WorldTimeHour = DayNight->GetCurrentHour();
	}
	Save->VisitedFogPoints = VisitedFogPoints;

	Save->Metadata.bOccupied = true;
	Save->Metadata.TotalPlaytimeSeconds = GetTotalPlaytimeSeconds();
	Save->Metadata.ActiveCharacterLevel = Save->PartyMembers.IsValidIndex(Save->ActivePartyIndex)
		? Save->PartyMembers[Save->ActivePartyIndex].CurrentLevel : 1;
	Save->Metadata.LocationName = CurrentLocationName;
	Save->Metadata.Timestamp = FDateTime::Now();

	return Save;
}

void USaveManager::ApplyWorldState(UStickmanSaveGame* Save)
{
	if (!Save)
	{
		return;
	}

	UGameInstance* GameInstance = GetGameInstance();

	// Order matters: party/inventory before quests (rewards no-op safely), flags before
	// anything that might read them, pawn transform last.
	if (UInventoryManager* Inventory = GameInstance->GetSubsystem<UInventoryManager>())
	{
		Inventory->ImportItems(Save->InventoryItems);
	}
	if (UDialogueManager* Dialogue = GameInstance->GetSubsystem<UDialogueManager>())
	{
		Dialogue->ImportSaveState(Save->StoryFlags, Save->PlayedDialogueIDs);
	}
	if (UCutsceneManager* Cutscenes = GameInstance->GetSubsystem<UCutsceneManager>())
	{
		Cutscenes->RestoreWatchedCutsceneIDs(Save->WatchedCutsceneIDs);
	}
	if (UPartyManager* Party = GameInstance->GetSubsystem<UPartyManager>())
	{
		Party->ImportSaveState(Save->PartyMembers, Save->ActivePartyIndex);
	}
	if (UQuestManager* Quests = GameInstance->GetSubsystem<UQuestManager>())
	{
		Quests->ImportSaveState(Save->ActiveQuests, Save->CompletedQuestIDs, Save->TrackedQuestID);
	}
	if (UWaypointManager* Waypoints = GameInstance->GetSubsystem<UWaypointManager>())
	{
		Waypoints->RestoreUnlockedFromIDs(Save->UnlockedWaypointIDs, GetWorld());
	}
	if (UCollectibleManager* Collectibles = GameInstance->GetSubsystem<UCollectibleManager>())
	{
		Collectibles->RestoreCollectedIDs(Save->CollectedItemIDs);
	}
	if (ADayNightManager* DayNight = Cast<ADayNightManager>(
			UGameplayStatics::GetActorOfClass(this, ADayNightManager::StaticClass())))
	{
		DayNight->SetCurrentHour(Save->WorldTimeHour);
	}

	VisitedFogPoints = Save->VisitedFogPoints;
	LoadedPlaytimeSeconds = Save->Metadata.TotalPlaytimeSeconds;
	SessionStartSeconds = FPlatformTime::Seconds();

	if (APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0))
	{
		PlayerPawn->SetActorLocationAndRotation(Save->PlayerLocation, Save->PlayerRotation, false, nullptr,
			ETeleportType::TeleportPhysics);
	}
}

// -------------------------------------------------------------------
// File IO: [magic][version][crc][compressed+obfuscated payload]
// -------------------------------------------------------------------

FString USaveManager::GetSlotFilePath(int32 SlotIndex) const
{
	return FPaths::ProjectSavedDir() / TEXT("SaveGames") / FString::Printf(TEXT("StickmanSlot%d.sav"), SlotIndex);
}

void USaveManager::XORObfuscate(TArray<uint8>& Bytes)
{
	for (int32 Index = 0; Index < Bytes.Num(); ++Index)
	{
		Bytes[Index] ^= XORKey[Index % UE_ARRAY_COUNT(XORKey)];
	}
}

bool USaveManager::WriteSlotFile(int32 SlotIndex, const TArray<uint8>& RawSaveBytes) const
{
	// Compress.
	int32 CompressedSize = FCompression::CompressMemoryBound(NAME_Zlib, RawSaveBytes.Num());
	TArray<uint8> Compressed;
	Compressed.SetNumUninitialized(CompressedSize);
	if (!FCompression::CompressMemory(NAME_Zlib, Compressed.GetData(), CompressedSize, RawSaveBytes.GetData(),
			RawSaveBytes.Num()))
	{
		return false;
	}
	Compressed.SetNum(CompressedSize);

	XORObfuscate(Compressed);
	const uint32 Checksum = FCrc::MemCrc32(Compressed.GetData(), Compressed.Num());

	TArray<uint8> FileBytes;
	FMemoryWriter Writer(FileBytes);
	uint32 Magic = SaveMagic;
	int32 Version = CurrentSaveVersion;
	int32 UncompressedSize = RawSaveBytes.Num();
	uint32 ChecksumCopy = Checksum;
	Writer << Magic << Version << ChecksumCopy << UncompressedSize;
	Writer.Serialize(Compressed.GetData(), Compressed.Num());

	// Backup the previous save before overwriting.
	const FString FilePath = GetSlotFilePath(SlotIndex);
	IPlatformFile& PlatformFile = FPlatformFileManager::Get().GetPlatformFile();
	if (PlatformFile.FileExists(*FilePath))
	{
		PlatformFile.CopyFile(*(FilePath + TEXT(".bak")), *FilePath);
	}

	return FFileHelper::SaveArrayToFile(FileBytes, *FilePath);
}

bool USaveManager::ReadSlotFile(int32 SlotIndex, TArray<uint8>& OutRawSaveBytes, bool bTryBackup) const
{
	const FString FilePath = GetSlotFilePath(SlotIndex) + (bTryBackup ? TEXT(".bak") : TEXT(""));

	TArray<uint8> FileBytes;
	if (!FFileHelper::LoadFileToArray(FileBytes, *FilePath))
	{
		return false;
	}

	FMemoryReader Reader(FileBytes);
	uint32 Magic = 0, Checksum = 0;
	int32 Version = 0, UncompressedSize = 0;
	Reader << Magic << Version << Checksum << UncompressedSize;
	if (Magic != SaveMagic || Version > CurrentSaveVersion || UncompressedSize <= 0)
	{
		UE_LOG(LogTemp, Warning, TEXT("[SaveManager] Slot %d%s: bad magic/version."), SlotIndex,
			bTryBackup ? TEXT(" (backup)") : TEXT(""));
		return false;
	}
	// Version < CurrentSaveVersion: future migrations hook here (none needed at v1).

	TArray<uint8> Compressed;
	Compressed.SetNumUninitialized(FileBytes.Num() - Reader.Tell());
	Reader.Serialize(Compressed.GetData(), Compressed.Num());

	if (FCrc::MemCrc32(Compressed.GetData(), Compressed.Num()) != Checksum)
	{
		UE_LOG(LogTemp, Warning, TEXT("[SaveManager] Slot %d%s: checksum mismatch (corrupted)."), SlotIndex,
			bTryBackup ? TEXT(" (backup)") : TEXT(""));
		return false;
	}

	XORObfuscate(Compressed);

	OutRawSaveBytes.SetNumUninitialized(UncompressedSize);
	return FCompression::UncompressMemory(NAME_Zlib, OutRawSaveBytes.GetData(), UncompressedSize,
		Compressed.GetData(), Compressed.Num());
}

// -------------------------------------------------------------------
// Public save/load
// -------------------------------------------------------------------

bool USaveManager::SaveToSlot(int32 SlotIndex)
{
	if (SlotIndex < 0 || SlotIndex >= NumSlots)
	{
		return false;
	}

	UStickmanSaveGame* Save = GatherWorldState();
	const TArray<uint8> RawBytes = SerializeSaveObject(Save);
	const bool bSuccess = WriteSlotFile(SlotIndex, RawBytes);

	OnSaveCompleted.Broadcast(SlotIndex, bSuccess);
	return bSuccess;
}

bool USaveManager::LoadFromSlot(int32 SlotIndex)
{
	if (SlotIndex < 0 || SlotIndex >= NumSlots)
	{
		return false;
	}

	TArray<uint8> RawBytes;
	bool bLoaded = ReadSlotFile(SlotIndex, RawBytes, false);
	if (!bLoaded)
	{
		bLoaded = ReadSlotFile(SlotIndex, RawBytes, true); // corrupted -> .bak
	}
	if (!bLoaded && SlotIndex != AutoSaveSlot)
	{
		UE_LOG(LogTemp, Warning, TEXT("[SaveManager] Slot %d unrecoverable — falling back to auto-save."), SlotIndex);
		bLoaded = ReadSlotFile(AutoSaveSlot, RawBytes, false) || ReadSlotFile(AutoSaveSlot, RawBytes, true);
	}
	if (!bLoaded)
	{
		OnLoadCompleted.Broadcast(SlotIndex, false);
		return false;
	}

	ApplyWorldState(DeserializeSaveObject(RawBytes));
	OnLoadCompleted.Broadcast(SlotIndex, true);
	return true;
}

void USaveManager::LoadFromSlotAsync(int32 SlotIndex)
{
	// File IO + decompress on a worker; deserialize/apply must be game-thread (UObjects).
	AsyncTask(ENamedThreads::AnyBackgroundThreadNormalTask, [this, SlotIndex]()
	{
		TArray<uint8> RawBytes;
		bool bLoaded = ReadSlotFile(SlotIndex, RawBytes, false) || ReadSlotFile(SlotIndex, RawBytes, true);
		if (!bLoaded && SlotIndex != AutoSaveSlot)
		{
			bLoaded = ReadSlotFile(AutoSaveSlot, RawBytes, false) || ReadSlotFile(AutoSaveSlot, RawBytes, true);
		}

		AsyncTask(ENamedThreads::GameThread, [this, SlotIndex, bLoaded, RawBytes = MoveTemp(RawBytes)]()
		{
			if (bLoaded)
			{
				ApplyWorldState(DeserializeSaveObject(RawBytes));
			}
			OnLoadCompleted.Broadcast(SlotIndex, bLoaded);
		});
	});
}

FSaveSlotMetadata USaveManager::GetSlotMetadata(int32 SlotIndex) const
{
	// Metadata lives inside the payload; reading it means a full read — acceptable for a
	// 4-slot UI. A sidecar .meta file is the optimization if this ever matters.
	TArray<uint8> RawBytes;
	if (!ReadSlotFile(SlotIndex, RawBytes, false) && !ReadSlotFile(SlotIndex, RawBytes, true))
	{
		return FSaveSlotMetadata();
	}
	const UStickmanSaveGame* Save = DeserializeSaveObject(RawBytes);
	return Save ? Save->Metadata : FSaveSlotMetadata();
}
