#pragma once

#include "CoreMinimal.h"
#include "Subsystems/WorldSubsystem.h"
#include "DamageNumberPoolSubsystem.generated.h"

class ADamageNumberCarrier;
class UDamageNumberWidget;
struct FDamageResult;

/**
 * Pool `ADamageNumberCarrier` — ganti pola spawn-actor-per-hit lama
 * (ANTISIPASI #4 CODE_REVIEW.md: "banyak alokasi kalau ratusan hit/detik").
 * Free-list sederhana: ambil carrier nganggur atau spawn baru kalau kosong,
 * carrier balik ke pool sendiri (lewat `Release`) setelah durasi tampil.
 */
UCLASS()
class MYGAME_API UDamageNumberPoolSubsystem : public UWorldSubsystem
{
	GENERATED_BODY()

public:
	/** Tampilkan damage number di Location. LifeSeconds = berapa lama sebelum carrier di-pool balik. */
	void Show(TSubclassOf<UDamageNumberWidget> WidgetClass, const FVector& Location,
		const FDamageResult& Result, float LifeSeconds = 1.2f);

	/** Dipanggil carrier sendiri setelah selesai tampil. */
	void Release(ADamageNumberCarrier* Carrier);

private:
	UPROPERTY()
	TArray<TObjectPtr<ADamageNumberCarrier>> FreeList;
};
