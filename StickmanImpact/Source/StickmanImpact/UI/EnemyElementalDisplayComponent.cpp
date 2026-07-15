// Copyright StickmanImpact Project.

#include "EnemyElementalDisplayComponent.h"
#include "StickmanElementalGaugeWidget.h"
#include "Combat/ElementalReactionManager.h"
#include "UI/StickmanDamageNumberManager.h"
#include "TimerManager.h"
#include "Engine/World.h"
#include "Engine/GameInstance.h"

UEnemyElementalDisplayComponent::UEnemyElementalDisplayComponent()
{
	SetWidgetSpace(EWidgetSpace::World);
	SetDrawSize(FVector2D(220.f, 100.f));
	SetRelativeLocation(FVector(0.f, 0.f, 180.f));
}

void UEnemyElementalDisplayComponent::BeginPlay()
{
	Super::BeginPlay();

	if (UGameInstance* GameInstance = GetWorld() ? GetWorld()->GetGameInstance() : nullptr)
	{
		if (UElementalReactionManager* ReactionManager = GameInstance->GetSubsystem<UElementalReactionManager>())
		{
			ReactionManager->OnReactionTriggered.AddDynamic(this, &UEnemyElementalDisplayComponent::HandleReactionTriggered);
		}
	}

	GetWorld()->GetTimerManager().SetTimer(PollTimerHandle, this, &UEnemyElementalDisplayComponent::PollActiveElements,
		PollInterval, true);
}

void UEnemyElementalDisplayComponent::EndPlay(const EEndPlayReason::Type EndPlayReason)
{
	if (UGameInstance* GameInstance = GetWorld() ? GetWorld()->GetGameInstance() : nullptr)
	{
		if (UElementalReactionManager* ReactionManager = GameInstance->GetSubsystem<UElementalReactionManager>())
		{
			ReactionManager->OnReactionTriggered.RemoveDynamic(this, &UEnemyElementalDisplayComponent::HandleReactionTriggered);
		}
	}
	if (GetWorld())
	{
		GetWorld()->GetTimerManager().ClearTimer(PollTimerHandle);
	}

	Super::EndPlay(EndPlayReason);
}

void UEnemyElementalDisplayComponent::PollActiveElements()
{
	AActor* Owner = GetOwner();
	UGameInstance* GameInstance = GetWorld() ? GetWorld()->GetGameInstance() : nullptr;
	UElementalReactionManager* ReactionManager = GameInstance ? GameInstance->GetSubsystem<UElementalReactionManager>() : nullptr;
	UStickmanElementalGaugeWidget* GaugeWidget = Cast<UStickmanElementalGaugeWidget>(GetUserWidgetObject());

	if (!Owner || !ReactionManager || !GaugeWidget)
	{
		return;
	}

	GaugeWidget->UpdateGauges(ReactionManager->GetActiveElements(Owner));
}

void UEnemyElementalDisplayComponent::HandleReactionTriggered(AActor* Target, EStickmanReactionType Reaction,
	float ReactionDamage, FVector ReactionLocation)
{
	if (Target != GetOwner())
	{
		return;
	}

	if (UStickmanElementalGaugeWidget* GaugeWidget = Cast<UStickmanElementalGaugeWidget>(GetUserWidgetObject()))
	{
		GaugeWidget->ShowReactionPopup(Reaction, ReactionDamage);
	}

	if (ReactionDamage > 0.f)
	{
		if (UGameInstance* GameInstance = GetWorld() ? GetWorld()->GetGameInstance() : nullptr)
		{
			if (UStickmanDamageNumberManager* DamageNumbers = GameInstance->GetSubsystem<UStickmanDamageNumberManager>())
			{
				DamageNumbers->SpawnDamageNumber(Target, ReactionDamage, EDamageNumberType::Reaction);
			}
		}
	}
}
