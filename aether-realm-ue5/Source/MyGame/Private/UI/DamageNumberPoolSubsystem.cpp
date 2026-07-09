#include "UI/DamageNumberPoolSubsystem.h"
#include "UI/DamageNumberWidget.h"
#include "Components/WidgetComponent.h"
#include "TimerManager.h"

void UDamageNumberPoolSubsystem::ShowDamageNumber(
	TSubclassOf<UDamageNumberWidget> WidgetClass, const FVector& Location, const FDamageResult& Result)
{
	if (!WidgetClass)
	{
		return;
	}

	const int32 Index = AcquireEntry(WidgetClass, Location);
	if (Index == INDEX_NONE)
	{
		return;
	}

	FPooledNumber& Entry = Pool[Index];
	Entry.bActive = true;
	Entry.ExpireTime = GetWorld()->GetTimeSeconds() + NumberLifetime;

	// SetDamageInfo re-trigger OnDamageInfoSet di WBP → animasi pop replay
	// dari awal, jadi reuse widget terlihat identik dengan spawn baru.
	if (UDamageNumberWidget* NumberWidget = Cast<UDamageNumberWidget>(Entry.Widget->GetWidget()))
	{
		NumberWidget->SetDamageInfo(Result);
	}

	// Sweep timer jalan hanya saat ada entry aktif.
	FTimerManager& Timers = GetWorld()->GetTimerManager();
	if (!Timers.IsTimerActive(SweepTimer))
	{
		Timers.SetTimer(SweepTimer, this, &UDamageNumberPoolSubsystem::ReleaseExpired, 0.25f, true);
	}
}

int32 UDamageNumberPoolSubsystem::AcquireEntry(
	TSubclassOf<UDamageNumberWidget> WidgetClass, const FVector& Location)
{
	// Buang entry yang actor-nya mati (level unload dsb).
	Pool.RemoveAll([](const FPooledNumber& E) { return !E.Actor.IsValid() || !E.Widget.IsValid(); });

	const double Now = GetWorld()->GetTimeSeconds();

	// 1) Entry idle (termasuk yang expired tapi belum di-sweep).
	int32 Found = INDEX_NONE;
	int32 Oldest = INDEX_NONE;
	for (int32 i = 0; i < Pool.Num(); ++i)
	{
		if (!Pool[i].bActive || Pool[i].ExpireTime <= Now)
		{
			Found = i;
			break;
		}
		if (Oldest == INDEX_NONE || Pool[i].ExpireTime < Pool[Oldest].ExpireTime)
		{
			Oldest = i;
		}
	}

	// 2) Pool belum penuh → alokasi entry baru (hanya terjadi saat warm-up).
	if (Found == INDEX_NONE && Pool.Num() < MaxPoolSize)
	{
		AActor* NumberActor = GetWorld()->SpawnActor<AActor>(
			AActor::StaticClass(), Location, FRotator::ZeroRotator);
		if (!NumberActor)
		{
			return INDEX_NONE;
		}

		USceneComponent* SceneRoot = NewObject<USceneComponent>(NumberActor, TEXT("Root"));
		SceneRoot->RegisterComponent();
		NumberActor->SetRootComponent(SceneRoot);

		UWidgetComponent* Widget = NewObject<UWidgetComponent>(NumberActor, TEXT("DamageNumber"));
		Widget->SetupAttachment(SceneRoot);
		Widget->SetWidgetSpace(EWidgetSpace::Screen);
		Widget->SetWidgetClass(WidgetClass);
		Widget->SetDrawAtDesiredSize(true);
		Widget->RegisterComponent();

		FPooledNumber Entry;
		Entry.Actor = NumberActor;
		Entry.Widget = Widget;
		Found = Pool.Add(Entry);
	}

	// 3) Pool penuh, semua aktif → curi yang paling tua (visual paling hampir hilang).
	if (Found == INDEX_NONE)
	{
		Found = Oldest;
	}
	if (Found == INDEX_NONE)
	{
		return INDEX_NONE;
	}

	FPooledNumber& Entry = Pool[Found];
	AActor* NumberActor = Entry.Actor.Get();
	UWidgetComponent* Widget = Entry.Widget.Get();

	NumberActor->SetActorLocation(Location);
	NumberActor->SetActorHiddenInGame(false);
	Widget->SetVisibility(true);

	// CombatComponent per karakter bisa punya WidgetClass beda — recreate
	// user widget hanya kalau class berubah (kasus jarang).
	if (Widget->GetWidgetClass() != WidgetClass)
	{
		Widget->SetWidgetClass(WidgetClass);
	}

	return Found;
}

void UDamageNumberPoolSubsystem::HideEntry(FPooledNumber& Entry)
{
	Entry.bActive = false;
	if (AActor* NumberActor = Entry.Actor.Get())
	{
		NumberActor->SetActorHiddenInGame(true);
	}
	if (UWidgetComponent* Widget = Entry.Widget.Get())
	{
		Widget->SetVisibility(false);
	}
}

void UDamageNumberPoolSubsystem::ReleaseExpired()
{
	const double Now = GetWorld()->GetTimeSeconds();
	bool bAnyActive = false;

	for (FPooledNumber& Entry : Pool)
	{
		if (Entry.bActive && Entry.ExpireTime <= Now)
		{
			HideEntry(Entry);
		}
		bAnyActive |= Entry.bActive;
	}

	if (!bAnyActive)
	{
		GetWorld()->GetTimerManager().ClearTimer(SweepTimer);
	}
}
