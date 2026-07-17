// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "SummonerComponent.generated.h"

/**
 * Reusable archetype mechanic: periodically summons minions from bestiary archetype IDs via
 * UEnemyFactory, up to MaxActiveSummons alive at once. Used by Shaman/Chieftain/Corruptor
 * types and any summoner. Summons spawn in a ring around the owner and scale to the owner's
 * level (LevelForSummons).
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API USummonerComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	USummonerComponent();

	virtual void BeginPlay() override;
	virtual void EndPlay(const EEndPlayReason::Type EndPlayReason) override;

	// Archetype IDs this summoner can call (picked at random each summon).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Summon")
	TArray<FName> SummonArchetypeIDs;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Summon")
	float SummonInterval = 15.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Summon")
	int32 SummonsPerWave = 2;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Summon")
	int32 MaxActiveSummons = 4;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Summon")
	float SummonRadius = 400.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Summon")
	int32 LevelForSummons = 1;

	UFUNCTION(BlueprintCallable, Category = "Summon")
	void SummonWave();

private:
	FTimerHandle SummonTimerHandle;

	UPROPERTY()
	TArray<TWeakObjectPtr<AActor>> ActiveSummons;
};
