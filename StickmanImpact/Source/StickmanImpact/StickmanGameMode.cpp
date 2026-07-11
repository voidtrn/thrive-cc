// Copyright StickmanImpact Project.

#include "StickmanGameMode.h"
#include "Character/StickmanCharacter.h"
#include "StickmanPlayerController.h"
#include "UI/StickmanHUD.h"

AStickmanGameMode::AStickmanGameMode()
{
	DefaultPawnClass = AStickmanCharacter::StaticClass();
	PlayerControllerClass = AStickmanPlayerController::StaticClass();
	HUDClass = AStickmanHUD::StaticClass();
}
