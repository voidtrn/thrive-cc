#include "System/OpenWorldGameMode.h"
#include "System/OpenWorldGameState.h"
#include "System/OpenWorldPlayerController.h"
#include "System/OpenWorldPlayerState.h"
#include "System/QuestManager.h"
#include "System/StarterContentLibrary.h"
#include "MyGame.h"

AOpenWorldGameMode::AOpenWorldGameMode()
{
	GameStateClass = AOpenWorldGameState::StaticClass();
	PlayerControllerClass = AOpenWorldPlayerController::StaticClass();
	PlayerStateClass = AOpenWorldPlayerState::StaticClass();
	// DefaultPawnClass di-set dari Blueprint child (BP_OpenWorldGameMode)
	// supaya bisa tunjuk BP_PlayerCharacter tanpa hard reference C++ ke asset.
}

void AOpenWorldGameMode::BeginPlay()
{
	Super::BeginPlay();

	// Starter content dibangun murni di C++ (bukan Data Asset editor) — lihat
	// StarterContentLibrary.h. BP_OpenWorldGameMode masih bisa RegisterQuests
	// tambahan lewat jalur normal (Data Asset), map di QuestManager digabung
	// per-QuestID, bukan ditimpa. GameMode cuma ada di server (lihat header),
	// jadi ini prosedur autoritatif satu sumber, sama pola dgn PHASE6_SETUP.md.
	if (UQuestManager* Quests = GetGameInstance() ? GetGameInstance()->GetSubsystem<UQuestManager>() : nullptr)
	{
		Quests->RegisterQuests(UStarterContentLibrary::BuildPrologueQuests(this));
	}
}

void AOpenWorldGameMode::PostLogin(APlayerController* NewPlayer)
{
	Super::PostLogin(NewPlayer);
	UE_LOG(LogAetherRealm, Log, TEXT("Player joined: %s"), *GetNameSafe(NewPlayer));
}

void AOpenWorldGameMode::RespawnPlayer(APlayerController* Controller)
{
	if (!Controller)
	{
		return;
	}

	if (APawn* OldPawn = Controller->GetPawn())
	{
		OldPawn->Destroy();
	}

	// PlayerStart terdekat dengan waypoint terakhir — Phase 3 ganti dengan
	// sistem teleport waypoint. Sekarang pakai default engine flow.
	RestartPlayer(Controller);
}
