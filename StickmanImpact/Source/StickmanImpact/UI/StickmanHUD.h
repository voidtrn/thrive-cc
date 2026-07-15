// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/HUD.h"
#include "StickmanHUD.generated.h"

UCLASS()
class STICKMANIMPACT_API AStickmanHUD : public AHUD
{
	GENERATED_BODY()

public:
	AStickmanHUD();

	virtual void DrawHUD() override;
};
