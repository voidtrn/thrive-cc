#include "System/OpenWorldPlayerController.h"
#include "System/OpenWorldCheatManager.h"
#include "System/LevelingComponent.h"
#include "System/ResonanceComponent.h"
#include "EnhancedInputSubsystems.h"
#include "InputMappingContext.h"
#include "MyGame.h"

AOpenWorldPlayerController::AOpenWorldPlayerController()
{
	// Cheat console commands (otomatis tidak dibuat di Shipping)
	CheatClass = UOpenWorldCheatManager::StaticClass();

	// Sistem leveling & resonance selalu ada (cheat/UI akses via FindComponentByClass).
	Leveling = CreateDefaultSubobject<ULevelingComponent>(TEXT("LevelingComponent"));
	Resonance = CreateDefaultSubobject<UResonanceComponent>(TEXT("ResonanceComponent"));
}

void AOpenWorldPlayerController::OnPossess(APawn* InPawn)
{
	Super::OnPossess(InPawn);

	// Karakter aktif baru (spawn awal / party swap) → pasang efek resonance.
	if (Resonance)
	{
		Resonance->RefreshResonances();
	}
}

void AOpenWorldPlayerController::BeginPlay()
{
	Super::BeginPlay();

	if (IsLocalController())
	{
		ApplyContextMode(EInputContextMode::Default);
	}
}

void AOpenWorldPlayerController::SetInputContextMode(EInputContextMode NewMode)
{
	if (CurrentMode == NewMode || !IsLocalController())
	{
		return;
	}

	CurrentMode = NewMode;
	ApplyContextMode(NewMode);
}

void AOpenWorldPlayerController::ApplyContextMode(EInputContextMode Mode)
{
	UEnhancedInputLocalPlayerSubsystem* Subsystem =
		ULocalPlayer::GetSubsystem<UEnhancedInputLocalPlayerSubsystem>(GetLocalPlayer());
	if (!Subsystem)
	{
		UE_LOG(LogAetherRealm, Warning, TEXT("EnhancedInput subsystem missing on %s"), *GetNameSafe(this));
		return;
	}

	Subsystem->ClearAllMappings();

	switch (Mode)
	{
	case EInputContextMode::Default:
		if (IMC_Default) { Subsystem->AddMappingContext(IMC_Default, PRIORITY_DEFAULT); }
		SetUIMode(false);
		break;

	case EInputContextMode::Gliding:
		// Overlay: Default tetap aktif, Gliding menimpa action tertentu.
		if (IMC_Default) { Subsystem->AddMappingContext(IMC_Default, PRIORITY_DEFAULT); }
		if (IMC_Gliding) { Subsystem->AddMappingContext(IMC_Gliding, PRIORITY_OVERLAY); }
		SetUIMode(false);
		break;

	case EInputContextMode::Swimming:
		if (IMC_Default) { Subsystem->AddMappingContext(IMC_Default, PRIORITY_DEFAULT); }
		if (IMC_Swimming) { Subsystem->AddMappingContext(IMC_Swimming, PRIORITY_OVERLAY); }
		SetUIMode(false);
		break;

	case EInputContextMode::UI:
		if (IMC_UI) { Subsystem->AddMappingContext(IMC_UI, PRIORITY_MODAL); }
		SetUIMode(true);
		break;

	case EInputContextMode::Dialog:
		if (IMC_Dialog) { Subsystem->AddMappingContext(IMC_Dialog, PRIORITY_MODAL); }
		SetUIMode(true);
		break;
	}

	UE_LOG(LogAetherRealm, Verbose, TEXT("Input context -> %s"), *UEnum::GetValueAsString(Mode));
}

void AOpenWorldPlayerController::SetUIMode(bool bUIMode)
{
	bShowMouseCursor = bUIMode;

	if (bUIMode)
	{
		FInputModeGameAndUI InputMode;
		InputMode.SetLockMouseToViewportBehavior(EMouseLockMode::DoNotLock);
		InputMode.SetHideCursorDuringCapture(false);
		SetInputMode(InputMode);
	}
	else
	{
		SetInputMode(FInputModeGameOnly());
	}
}
