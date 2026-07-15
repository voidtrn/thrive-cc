// Copyright StickmanImpact Project.

#include "StickmanInputDebugWidget.h"
#include "Components/TextBlock.h"
#include "Character/StickmanCharacter.h"
#include "Kismet/GameplayStatics.h"

void UStickmanInputDebugWidget::NativeTick(const FGeometry& MyGeometry, float InDeltaTime)
{
	Super::NativeTick(MyGeometry, InDeltaTime);

	const AStickmanCharacter* StickmanChar = Cast<AStickmanCharacter>(UGameplayStatics::GetPlayerPawn(this, 0));
	if (!StickmanChar)
	{
		return;
	}

	const FVector2D MoveInput = StickmanChar->GetLastMoveInput();
	const FVector2D LookInput = StickmanChar->GetLastLookInput();
	const float StaminaPercent = StickmanChar->GetStaminaPercent() * 100.f;
	const FString StateName = StickmanChar->GetCurrentMovementTag().ToString();

	if (MoveValueText)
	{
		MoveValueText->SetText(FText::FromString(FString::Printf(TEXT("Move: %.2f, %.2f"), MoveInput.X, MoveInput.Y)));
	}
	if (LookValueText)
	{
		LookValueText->SetText(FText::FromString(FString::Printf(TEXT("Look: %.2f, %.2f"), LookInput.X, LookInput.Y)));
	}
	if (StaminaValueText)
	{
		StaminaValueText->SetText(FText::FromString(FString::Printf(TEXT("Stamina: %.0f%%"), StaminaPercent)));
	}
	if (MovementStateText)
	{
		MovementStateText->SetText(FText::FromString(StateName));
	}

	CachedDebugText = FString::Printf(TEXT("Move: %.2f,%.2f | Look: %.2f,%.2f | Stamina: %.0f%% | State: %s"),
		MoveInput.X, MoveInput.Y, LookInput.X, LookInput.Y, StaminaPercent, *StateName);
}
