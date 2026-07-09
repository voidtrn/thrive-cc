#pragma once

#include "CoreMinimal.h"
#include "Subsystems/WorldSubsystem.h"
#include "Combat/CombatTypes.h"
#include "DamageNumberPoolSubsystem.generated.h"

class UDamageNumberWidget;
class UWidgetComponent;

/**
 * Object pool untuk floating damage number.
 *
 * Sebelumnya tiap hit spawn AActor + UWidgetComponent + UUserWidget baru lalu
 * auto-destroy 1.2 detik — saat AOE besar / banyak musuh (ratusan hit/detik)
 * ini badai alokasi + register/unregister component. Pool ini reuse actor:
 * hide saat expire, unhide + reposisi saat dipakai lagi. Alokasi berhenti
 * setelah pool warm (max MaxPoolSize actor hidup sekaligus).
 *
 * Dipakai lewat UCombatComponent::SpawnDamageNumber — BP tidak perlu berubah.
 */
UCLASS()
class MYGAME_API UDamageNumberPoolSubsystem : public UWorldSubsystem
{
	GENERATED_BODY()

public:
	/** Tampilkan damage number di Location. WidgetClass dari CombatComponent (BP-set). */
	void ShowDamageNumber(TSubclassOf<UDamageNumberWidget> WidgetClass,
		const FVector& Location, const FDamageResult& Result);

	/** Batas actor pool — lebih dari ini, entry paling tua dicuri (bukan alokasi baru). */
	static constexpr int32 MaxPoolSize = 64;
	static constexpr float NumberLifetime = 1.2f;

private:
	struct FPooledNumber
	{
		TWeakObjectPtr<AActor> Actor;
		TWeakObjectPtr<UWidgetComponent> Widget;
		double ExpireTime = 0.0;
		bool bActive = false;
	};

	TArray<FPooledNumber> Pool;
	FTimerHandle SweepTimer;

	/** Cari entry bebas / buat baru / curi paling tua. Return index valid atau INDEX_NONE. */
	int32 AcquireEntry(TSubclassOf<UDamageNumberWidget> WidgetClass, const FVector& Location);

	void HideEntry(FPooledNumber& Entry);
	void ReleaseExpired();
};
