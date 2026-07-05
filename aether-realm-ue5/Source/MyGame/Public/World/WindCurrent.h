#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "WindCurrent.generated.h"

class UBoxComponent;

/**
 * Kolom angin: karakter gliding di dalamnya terdorong ke atas,
 * stamina glide gratis selama di dalam. Auto-deploy glider saat masuk.
 */
UCLASS()
class MYGAME_API AWindCurrent : public AActor
{
	GENERATED_BODY()

public:
	AWindCurrent();

	virtual void Tick(float DeltaSeconds) override;

protected:
	virtual void BeginPlay() override;

	UPROPERTY(VisibleAnywhere, Category = "Components")
	TObjectPtr<UBoxComponent> WindVolume;

	/** Kecepatan dorong ke atas (cm/s). */
	UPROPERTY(EditAnywhere, Category = "Wind")
	float UpdraftSpeed = 900.f;

	UFUNCTION()
	void OnWindEnter(UPrimitiveComponent* OverlappedComp, AActor* OtherActor,
		UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep,
		const FHitResult& SweepResult);

	UFUNCTION()
	void OnWindExit(UPrimitiveComponent* OverlappedComp, AActor* OtherActor,
		UPrimitiveComponent* OtherComp, int32 OtherBodyIndex);
};
