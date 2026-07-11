// Copyright StickmanImpact Project.

#include "StickmanHUD.h"

AStickmanHUD::AStickmanHUD()
{
}

void AStickmanHUD::DrawHUD()
{
	Super::DrawHUD();
	// Gameplay HUD (health/stamina/skill cooldown bars) is built in UMG (see WBP_MainHUD)
	// and driven by UStickmanHUDWidget bindings once that widget is authored in-editor.
}
