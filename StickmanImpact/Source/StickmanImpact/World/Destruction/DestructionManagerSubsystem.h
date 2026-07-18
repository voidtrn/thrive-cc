// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "DestructionManagerSubsystem.generated.h"

class ADestructibleObject;

/**
 * Destruction performance budget + session persistence. Broken objects register here:
 * debris actors (registered by the break BPs via `RegisterDebris`) are capped at
 * MaxActiveDebris — oldest fade out first; a cleanup sweep also lifespans debris after
 * DebrisLifetime. Minor destructions reset on reload (nothing stored); major ones are
 * remembered for the session (`WasBrokenThisSession`, checked by the objects at BeginPlay
 * so they re-break on level revisit). "Memory of Destruction" story pieces = story flags,
 * not this. LOD on debris = the GC asset's own settings — documented, not code.
 */
UCLASS()
class STICKMANIMPACT_API UDestructionManagerSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	void NotifyObjectBroken(ADestructibleObject* Object, bool bMinor);

	// Break-realization BPs register their spawned debris/GC actors for the budget.
	UFUNCTION(BlueprintCallable, Category = "Destruction")
	void RegisterDebris(AActor* Debris);

	UFUNCTION(BlueprintPure, Category = "Destruction")
	bool WasBrokenThisSession(FName ObjectID) const { return SessionBrokenIDs.Contains(ObjectID); }

	UFUNCTION(BlueprintPure, Category = "Destruction")
	int32 GetActiveDebrisCount() const;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Destruction")
	int32 MaxActiveDebris = 60;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Destruction")
	float DebrisLifetime = 20.f;

private:
	TSet<FName> SessionBrokenIDs;

	UPROPERTY()
	TArray<TWeakObjectPtr<AActor>> ActiveDebris;
};
