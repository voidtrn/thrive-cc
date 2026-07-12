#include "UI/DamageNumberPoolSubsystem.h"
#include "UI/DamageNumberCarrier.h"

void UDamageNumberPoolSubsystem::Show(TSubclassOf<UDamageNumberWidget> WidgetClass, const FVector& Location,
	const FDamageResult& Result, float LifeSeconds)
{
	if (!WidgetClass || !GetWorld())
	{
		return;
	}

	ADamageNumberCarrier* Carrier = nullptr;
	while (!FreeList.IsEmpty() && !Carrier)
	{
		Carrier = FreeList.Pop(/*bAllowShrinking=*/false); // hot path per-hit — jangan realloc backing buffer tiap pop
		if (!IsValid(Carrier)) // jaga-jaga kalau carrier di-destroy eksternal (level transition, dll)
		{
			Carrier = nullptr;
		}
	}

	if (!Carrier)
	{
		Carrier = GetWorld()->SpawnActor<ADamageNumberCarrier>();
	}

	if (Carrier)
	{
		Carrier->Activate(WidgetClass, Location, Result, LifeSeconds);
	}
}

void UDamageNumberPoolSubsystem::Release(ADamageNumberCarrier* Carrier)
{
	if (IsValid(Carrier))
	{
		// Add (bukan AddUnique) — satu-satunya jalur balik ke pool cuma lewat
		// timer one-shot di carrier sendiri, gak mungkin dobel-release.
		FreeList.Add(Carrier);
	}
}
