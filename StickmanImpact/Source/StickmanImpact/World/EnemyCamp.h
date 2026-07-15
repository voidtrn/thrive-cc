// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "EnemyCamp.generated.h"

class AEnemySpawner;

/**
 * Groups several AEnemySpawners together: when any member spawner's enemy enters combat,
 * every other member spawner's currently-alive enemies are alerted to investigate.
 */
UCLASS()
class STICKMANIMPACT_API AEnemyCamp : public AActor
{
	GENERATED_BODY()

public:
	AEnemyCamp();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camp")
	TArray<TObjectPtr<AEnemySpawner>> MemberSpawners;

protected:
	virtual void BeginPlay() override;

private:
	UFUNCTION()
	void HandleMemberEnteredCombat(AActor* Enemy, AActor* Target);
};
