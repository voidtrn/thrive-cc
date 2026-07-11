#include "UI/DamageNumberCarrier.h"
#include "UI/DamageNumberWidget.h"
#include "UI/DamageNumberPoolSubsystem.h"
#include "Components/WidgetComponent.h"
#include "TimerManager.h"

ADamageNumberCarrier::ADamageNumberCarrier()
{
	PrimaryActorTick.bCanEverTick = false;
	SetReplicates(false); // presentation-only, sama seperti implementasi lama (gak pernah dimulticast)

	USceneComponent* SceneRoot = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
	SetRootComponent(SceneRoot);

	Widget = CreateDefaultSubobject<UWidgetComponent>(TEXT("DamageNumberWidget"));
	Widget->SetupAttachment(SceneRoot);
	Widget->SetWidgetSpace(EWidgetSpace::Screen);
	Widget->SetDrawAtDesiredSize(true);

	SetActorHiddenInGame(true);
	// Screen-space UWidgetComponent render lewat viewport overlay, gak selalu
	// ke-suppress cuma dari actor-hidden (gotcha UE) — hide widget-nya sendiri
	// juga biar carrier ter-pool bener-bener invisible, bukan "hantu" nomor.
	Widget->SetHiddenInGame(true);
}

void ADamageNumberCarrier::Activate(TSubclassOf<UDamageNumberWidget> WidgetClass, const FVector& Location,
	const FDamageResult& Result, float LifeSeconds)
{
	SetActorLocation(Location);
	SetActorHiddenInGame(false);
	Widget->SetHiddenInGame(false);

	if (CachedWidgetClass != WidgetClass)
	{
		Widget->SetWidgetClass(WidgetClass);
		// InitWidget sinkron di sini (bukan nunggu frame berikutnya) — nutup
		// known limitation BUILD_NOTES.md ("GetWidget() bisa null 1 frame
		// setelah spawn"). Carrier lama (reused) udah punya widget dari
		// aktivasi pertama, jadi ini cuma kena pas carrier baru/first-grow.
		Widget->InitWidget();
		CachedWidgetClass = WidgetClass;
	}

	if (UDamageNumberWidget* NumberWidget = Cast<UDamageNumberWidget>(Widget->GetWidget()))
	{
		NumberWidget->SetDamageInfo(Result);
	}

	GetWorldTimerManager().SetTimer(ReleaseTimer, this, &ADamageNumberCarrier::ReleaseSelf, LifeSeconds, false);
}

void ADamageNumberCarrier::ReleaseSelf()
{
	SetActorHiddenInGame(true);
	Widget->SetHiddenInGame(true);

	if (UWorld* World = GetWorld())
	{
		if (UDamageNumberPoolSubsystem* Pool = World->GetSubsystem<UDamageNumberPoolSubsystem>())
		{
			Pool->Release(this);
		}
	}
}
