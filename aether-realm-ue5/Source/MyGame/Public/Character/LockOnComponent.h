#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "LockOnComponent.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnLockTargetChanged, AActor*, NewTarget);

/**
 * Combat lock-on (middle mouse): cari enemy terdekat yang terlihat,
 * kamera menghadap target selama lock aktif.
 * Enemy ditandai actor tag "Enemy" (Phase 3 ganti ke interface/team system).
 */
UCLASS(ClassGroup = (Combat), meta = (BlueprintSpawnableComponent))
class MYGAME_API ULockOnComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	ULockOnComponent();

	virtual void TickComponent(float DeltaTime, ELevelTick TickType,
		FActorComponentTickFunction* ThisTickFunction) override;

	/** Toggle: lock ke enemy terdekat / lepas lock. */
	UFUNCTION(BlueprintCallable, Category = "LockOn")
	void ToggleLockOn();

	UFUNCTION(BlueprintCallable, Category = "LockOn")
	void ClearLock();

	UFUNCTION(BlueprintPure, Category = "LockOn")
	AActor* GetTarget() const { return Target.Get(); }

	UFUNCTION(BlueprintPure, Category = "LockOn")
	bool IsLocked() const { return Target.IsValid(); }

	UPROPERTY(BlueprintAssignable, Category = "LockOn")
	FOnLockTargetChanged OnTargetChanged;

protected:
	UPROPERTY(EditDefaultsOnly, Category = "LockOn")
	float SearchRadius = 1500.f;

	/** Lock lepas otomatis kalau target lebih jauh dari ini. */
	UPROPERTY(EditDefaultsOnly, Category = "LockOn")
	float BreakDistance = 2500.f;

	UPROPERTY(EditDefaultsOnly, Category = "LockOn")
	float CameraInterpSpeed = 6.f;

	UPROPERTY(EditDefaultsOnly, Category = "LockOn")
	FName EnemyTag = TEXT("Enemy");

private:
	TWeakObjectPtr<AActor> Target;

	AActor* FindBestTarget() const;
	bool HasLineOfSight(const AActor* Candidate) const;
};
