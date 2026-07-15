// Copyright StickmanImpact Project.

#include "StickmanDamageNumberManager.h"
#include "StickmanDamageNumberWidget.h"
#include "Components/WidgetComponent.h"
#include "GameFramework/Actor.h"
#include "Engine/World.h"

void UStickmanDamageNumberManager::Deinitialize()
{
	InactivePool.Reset();
	if (PoolOwnerActor)
	{
		PoolOwnerActor->Destroy();
		PoolOwnerActor = nullptr;
	}
	Super::Deinitialize();
}

UWidgetComponent* UStickmanDamageNumberManager::AcquirePooledComponent()
{
	if (InactivePool.Num() > 0)
	{
		return InactivePool.Pop();
	}

	UWorld* World = GetWorld();
	if (!World)
	{
		return nullptr;
	}

	if (!PoolOwnerActor)
	{
		FActorSpawnParameters SpawnParams;
		SpawnParams.ObjectFlags |= RF_Transient;
		PoolOwnerActor = World->SpawnActor<AActor>(SpawnParams);
		PoolOwnerActor->SetActorHiddenInGame(true);
	}

	UWidgetComponent* NewComponent = NewObject<UWidgetComponent>(PoolOwnerActor);
	NewComponent->SetWidgetSpace(EWidgetSpace::World);
	NewComponent->SetDrawSize(FVector2D(200.f, 80.f));
	NewComponent->SetWidgetClass(DamageNumberWidgetClass);
	NewComponent->SetupAttachment(PoolOwnerActor->GetRootComponent());
	NewComponent->RegisterComponent();
	return NewComponent;
}

void UStickmanDamageNumberManager::SpawnDamageNumber(AActor* Target, float Damage, EDamageNumberType Type)
{
	if (!Target || !DamageNumberWidgetClass)
	{
		return;
	}

	// Multi-hit merge: same target, same type, inside the window = grow the existing number.
	// (Crits/reactions never merge into plain numbers — type must match so they stay loud.)
	if (AccumulationWindow > 0.f && GetWorld())
	{
		const double Now = GetWorld()->GetTimeSeconds();
		if (FAccumulatingNumber* Existing = Accumulating.Find(Target))
		{
			UStickmanDamageNumberWidget* ExistingWidget = Existing->Widget.Get();
			if (ExistingWidget && Existing->Type == Type && Now - Existing->LastHitTime <= AccumulationWindow)
			{
				Existing->Total += Damage;
				Existing->LastHitTime = Now;
				ExistingWidget->Activate(Existing->Total, Type); // Re-pop with the grown total.
				return;
			}
		}
	}

	UWidgetComponent* Component = AcquirePooledComponent();
	if (!Component || !Target->GetRootComponent())
	{
		return;
	}

	Component->AttachToComponent(Target->GetRootComponent(), FAttachmentTransformRules::SnapToTargetNotIncludingScale);
	Component->SetRelativeLocation(SpawnOffset);
	Component->SetVisibility(true, true);

	UStickmanDamageNumberWidget* WidgetInstance = Cast<UStickmanDamageNumberWidget>(Component->GetUserWidgetObject());
	if (!WidgetInstance)
	{
		return;
	}

	WidgetInstance->OnLifetimeEnded.BindUObject(this, &UStickmanDamageNumberManager::ReturnToPool,
		TWeakObjectPtr<UWidgetComponent>(Component));
	WidgetInstance->Activate(Damage, Type);

	if (AccumulationWindow > 0.f && GetWorld())
	{
		FAccumulatingNumber State;
		State.Widget = WidgetInstance;
		State.Total = Damage;
		State.LastHitTime = GetWorld()->GetTimeSeconds();
		State.Type = Type;
		Accumulating.Add(Target, State);
	}
}

void UStickmanDamageNumberManager::ReturnToPool(UStickmanDamageNumberWidget* Widget, TWeakObjectPtr<UWidgetComponent> Component)
{
	UWidgetComponent* ResolvedComponent = Component.Get();
	if (!ResolvedComponent)
	{
		return;
	}

	ResolvedComponent->SetVisibility(false, true);
	ResolvedComponent->DetachFromComponent(FDetachmentTransformRules::KeepWorldTransform);
	InactivePool.Add(ResolvedComponent);
}
