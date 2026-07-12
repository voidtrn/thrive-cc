#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "DamageNumberCarrier.generated.h"

class UWidgetComponent;
class UDamageNumberWidget;
struct FDamageResult;

/**
 * Satu slot damage number reusable — dipakai `UDamageNumberPoolSubsystem`.
 * Bukan spawn/destroy per hit (ANTISIPASI #4 CODE_REVIEW.md): actor+
 * WidgetComponent dibuat sekali, di-hide & dipool balik setelah durasi
 * tampil habis, bukan di-`Destroy()`.
 */
UCLASS()
class MYGAME_API ADamageNumberCarrier : public AActor
{
	GENERATED_BODY()

public:
	ADamageNumberCarrier();

	/** Posisikan, isi data, tampilkan; auto-release ke pool setelah LifeSeconds. */
	void Activate(TSubclassOf<UDamageNumberWidget> WidgetClass, const FVector& Location,
		const FDamageResult& Result, float LifeSeconds);

private:
	UPROPERTY(VisibleAnywhere, meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UWidgetComponent> Widget;

	/** Cache — `SetWidgetClass` cuma dipanggil ulang kalau class-nya beda dari terakhir. */
	UPROPERTY()
	TSubclassOf<UDamageNumberWidget> CachedWidgetClass;

	FTimerHandle ReleaseTimer;

	void ReleaseSelf();
};
