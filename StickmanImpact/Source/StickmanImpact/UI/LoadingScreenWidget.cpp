// Copyright StickmanImpact Project.

#include "LoadingScreenWidget.h"
#include "Components/TextBlock.h"
#include "Components/ProgressBar.h"
#include "SaveSystem/SaveManager.h"
#include "UI/MenuNavigationManager.h"

void ULoadingScreenWidget::NativeConstruct()
{
	Super::NativeConstruct();

	if (USaveManager* SaveManager = GetGameInstance()->GetSubsystem<USaveManager>())
	{
		SaveManager->OnLoadCompleted.AddDynamic(this, &ULoadingScreenWidget::HandleLoadCompleted);
	}
	ShowRandomTip();
}

void ULoadingScreenWidget::NativeDestruct()
{
	if (USaveManager* SaveManager = GetGameInstance()->GetSubsystem<USaveManager>())
	{
		SaveManager->OnLoadCompleted.RemoveDynamic(this, &ULoadingScreenWidget::HandleLoadCompleted);
	}
	Super::NativeDestruct();
}

void ULoadingScreenWidget::ShowRandomTip()
{
	if (TipText && GameplayTips.Num() > 0)
	{
		TipText->SetText(GameplayTips[FMath::RandRange(0, GameplayTips.Num() - 1)]);
	}
}

void ULoadingScreenWidget::NativeTick(const FGeometry& MyGeometry, float InDeltaTime)
{
	Super::NativeTick(MyGeometry, InDeltaTime);

	TimeSinceTipChange += InDeltaTime;
	if (TimeSinceTipChange >= TipRotationInterval)
	{
		TimeSinceTipChange = 0.f;
		ShowRandomTip();
	}

	if (!bLoadFinished)
	{
		CurrentProgress = FMath::Min(CurrentProgress + FakeProgressPerSecond * InDeltaTime, 0.9f);
	}
	if (LoadProgressBar)
	{
		LoadProgressBar->SetPercent(CurrentProgress);
	}
}

void ULoadingScreenWidget::HandleLoadCompleted(int32 SlotIndex, bool bSuccess)
{
	bLoadFinished = true;
	CurrentProgress = 1.f;
	if (LoadProgressBar)
	{
		LoadProgressBar->SetPercent(1.f);
	}

	// Pop ourselves off the menu stack (or just remove if shown standalone).
	if (UMenuNavigationManager* MenuNav = GetGameInstance()->GetSubsystem<UMenuNavigationManager>())
	{
		if (MenuNav->GetCurrentMenu() == this)
		{
			MenuNav->PopMenu();
			return;
		}
	}
	RemoveFromParent();
}
