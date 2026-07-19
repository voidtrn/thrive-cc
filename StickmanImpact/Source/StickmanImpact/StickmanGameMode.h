// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "StickmanGameMode.generated.h"

UCLASS()
class STICKMANIMPACT_API AStickmanGameMode : public AGameModeBase
{
	GENERATED_BODY()

public:
	AStickmanGameMode();

	virtual void BeginPlay() override;

	// DEV: procedurally build an urban scene + drop a few civilian NPCs when running on the
	// bare engine template map (no authored level). Delete once a real city level exists.
	UPROPERTY(EditDefaultsOnly, Category = "DevWorld")
	bool bBuildDevCity = true;

private:
	void BuildDevCity();
};
