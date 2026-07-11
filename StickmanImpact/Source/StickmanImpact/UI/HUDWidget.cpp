// Copyright StickmanImpact Project.

#include "HUDWidget.h"
#include "Components/ProgressBar.h"
#include "Components/TextBlock.h"
#include "Components/Image.h"
#include "MinimapWidget.h"
#include "QuestTrackerWidget.h"
#include "SkillCooldownWidget.h"
#include "StickmanElementalGaugeWidget.h"
#include "StickmanDamageNumberTypes.h"
#include "Character/StickmanCharacter.h"
#include "Combat/StickmanAttributeSet.h"
#include "Combat/CombatFeedbackSubsystem.h"
#include "Combat/ElementalReactionManager.h"
#include "Party/PartyManager.h"
#include "World/DayNightManager.h"
#include "Kismet/GameplayStatics.h"
#include "GameFramework/PlayerState.h"

namespace
{
	AStickmanCharacter* GetPlayerStickman(const UObject* WorldContext)
	{
		return Cast<AStickmanCharacter>(UGameplayStatics::GetPlayerPawn(WorldContext, 0));
	}
}

void UHUDWidget::NativeConstruct()
{
	Super::NativeConstruct();

	if (const AStickmanCharacter* PlayerCharacter = GetPlayerStickman(this))
	{
		if (UStickmanAttributeSet* AttributeSet = PlayerCharacter->GetStickmanAttributeSet())
		{
			AttributeSet->OnHealthChanged.AddDynamic(this, &UHUDWidget::HandleHealthChanged);
			AttributeSet->OnStaminaChanged.AddDynamic(this, &UHUDWidget::HandleStaminaChanged);
			AttributeSet->OnEnergyChanged.AddDynamic(this, &UHUDWidget::HandleEnergyChanged);

			HandleHealthChanged(AttributeSet->GetHealth(), AttributeSet->GetMaxHealth());
			HandleStaminaChanged(AttributeSet->GetStamina(), AttributeSet->GetMaxStamina());
			HandleEnergyChanged(AttributeSet->GetCurrentEnergy(), AttributeSet->GetMaxEnergy());
		}

		if (NormalAttackIcon) NormalAttackIcon->SkillTag = PlayerCharacter->NormalAttackSkillTag;
		if (Skill1Icon) Skill1Icon->SkillTag = PlayerCharacter->Skill1SkillTag;
		if (Skill2Icon) Skill2Icon->SkillTag = PlayerCharacter->Skill2SkillTag;
	}

	if (UGameInstance* GameInstance = GetGameInstance())
	{
		if (UCombatFeedbackSubsystem* CombatFeedback = GameInstance->GetSubsystem<UCombatFeedbackSubsystem>())
		{
			CombatFeedback->OnHitLanded.AddDynamic(this, &UHUDWidget::HandleHitLanded);
			CombatFeedback->OnKillConfirmed.AddDynamic(this, &UHUDWidget::HandleKillConfirmed);
			CombatFeedback->OnComboCountChanged.AddDynamic(this, &UHUDWidget::HandleComboCountChanged);
		}
		if (UElementalReactionManager* ReactionManager = GameInstance->GetSubsystem<UElementalReactionManager>())
		{
			ReactionManager->OnReactionTriggered.AddDynamic(this, &UHUDWidget::HandleReactionTriggered);
		}
		if (UPartyManager* PartyManager = GameInstance->GetSubsystem<UPartyManager>())
		{
			PartyManager->OnPartySwitched.AddDynamic(this, &UHUDWidget::HandlePartySwitched);
		}
	}

	if (const ADayNightManager* DayNight = Cast<ADayNightManager>(UGameplayStatics::GetActorOfClass(this, ADayNightManager::StaticClass())))
	{
		HandleTimeOfDayChanged(DayNight->GetTimeOfDay());
	}

	HideInteractionPrompt();
	RefreshPartyList();
}

void UHUDWidget::NativeDestruct()
{
	if (const AStickmanCharacter* PlayerCharacter = GetPlayerStickman(this))
	{
		if (UStickmanAttributeSet* AttributeSet = PlayerCharacter->GetStickmanAttributeSet())
		{
			AttributeSet->OnHealthChanged.RemoveDynamic(this, &UHUDWidget::HandleHealthChanged);
			AttributeSet->OnStaminaChanged.RemoveDynamic(this, &UHUDWidget::HandleStaminaChanged);
			AttributeSet->OnEnergyChanged.RemoveDynamic(this, &UHUDWidget::HandleEnergyChanged);
		}
	}
	if (UGameInstance* GameInstance = GetGameInstance())
	{
		if (UCombatFeedbackSubsystem* CombatFeedback = GameInstance->GetSubsystem<UCombatFeedbackSubsystem>())
		{
			CombatFeedback->OnHitLanded.RemoveDynamic(this, &UHUDWidget::HandleHitLanded);
			CombatFeedback->OnKillConfirmed.RemoveDynamic(this, &UHUDWidget::HandleKillConfirmed);
			CombatFeedback->OnComboCountChanged.RemoveDynamic(this, &UHUDWidget::HandleComboCountChanged);
		}
		if (UElementalReactionManager* ReactionManager = GameInstance->GetSubsystem<UElementalReactionManager>())
		{
			ReactionManager->OnReactionTriggered.RemoveDynamic(this, &UHUDWidget::HandleReactionTriggered);
		}
		if (UPartyManager* PartyManager = GameInstance->GetSubsystem<UPartyManager>())
		{
			PartyManager->OnPartySwitched.RemoveDynamic(this, &UHUDWidget::HandlePartySwitched);
		}
	}
	Super::NativeDestruct();
}

void UHUDWidget::HandleHealthChanged(float NewHealth, float MaxHealth)
{
	if (!HealthBar)
	{
		return;
	}
	const float Percent = MaxHealth > 0.f ? NewHealth / MaxHealth : 0.f;
	HealthBar->SetPercent(Percent);
	HealthBar->SetFillColorAndOpacity(Percent <= LowHealthThreshold ? LowHealthColor : NormalHealthColor);
}

void UHUDWidget::HandleStaminaChanged(float NewStamina, float MaxStamina)
{
	if (StaminaBar)
	{
		StaminaBar->SetPercent(MaxStamina > 0.f ? NewStamina / MaxStamina : 0.f);
	}
}

void UHUDWidget::HandleEnergyChanged(float NewEnergy, float MaxEnergy)
{
	if (EnergyBar)
	{
		EnergyBar->SetPercent(MaxEnergy > 0.f ? NewEnergy / MaxEnergy : 0.f);
	}
}

void UHUDWidget::HandleHitLanded(AActor* Target, float Damage, bool bIsCritical)
{
	if (HitMarkerImage)
	{
		HitMarkerImage->SetVisibility(ESlateVisibility::HitTestInvisible);
		HitMarkerTimer = HitMarkerDuration;
	}
}

void UHUDWidget::HandleKillConfirmed(AActor* Target)
{
	if (KillConfirmImage)
	{
		KillConfirmImage->SetVisibility(ESlateVisibility::HitTestInvisible);
		KillConfirmTimer = KillConfirmDuration;
	}
}

void UHUDWidget::HandleComboCountChanged(int32 ComboCount)
{
	if (!ComboCounterText)
	{
		return;
	}
	if (ComboCount <= 0)
	{
		ComboCounterText->SetVisibility(ESlateVisibility::Collapsed);
		return;
	}
	ComboCounterText->SetText(FText::Format(NSLOCTEXT("HUD", "ComboFormat", "{0} HITS"), FText::AsNumber(ComboCount)));
	ComboCounterText->SetVisibility(ESlateVisibility::HitTestInvisible);
	ComboHideTimer = ComboCounterHideDelay;
}

void UHUDWidget::HandleReactionTriggered(AActor* Target, EStickmanReactionType Reaction, float ReactionDamage, FVector Location)
{
	if (!ReactionPopupText)
	{
		return;
	}
	ReactionPopupText->SetText(UStickmanDamageNumberStatics::GetReactionDisplayName(Reaction));
	ReactionPopupText->SetVisibility(ESlateVisibility::HitTestInvisible);
	ReactionPopupTimer = ReactionPopupDuration;
}

void UHUDWidget::HandleTimeOfDayChanged(ETimeOfDay NewTimeOfDay)
{
	if (!TimeOfDayIcon)
	{
		return;
	}
	if (const TObjectPtr<UTexture2D>* Icon = TimeOfDayIcons.Find(NewTimeOfDay))
	{
		TimeOfDayIcon->SetBrushFromTexture(*Icon);
	}
}

void UHUDWidget::HandlePartySwitched(int32 NewIndex, int32 OldIndex)
{
	RefreshPartyList();

	if (const AStickmanCharacter* PlayerCharacter = GetPlayerStickman(this))
	{
		if (UGameInstance* GameInstance = GetGameInstance())
		{
			if (const UPartyManager* PartyManager = GameInstance->GetSubsystem<UPartyManager>())
			{
				if (NormalAttackIcon) NormalAttackIcon->SkillTag = PlayerCharacter->NormalAttackSkillTag;
				if (Skill1Icon) Skill1Icon->SkillTag = PlayerCharacter->Skill1SkillTag;
				if (Skill2Icon) Skill2Icon->SkillTag = PlayerCharacter->Skill2SkillTag;
				if (CurrentCharacterPortrait)
				{
					CurrentCharacterPortrait->SetBrushFromTexture(PartyManager->GetActiveMember().CharacterData.CharacterIcon);
				}
			}
		}
	}
}

void UHUDWidget::RefreshPartyList()
{
	UGameInstance* GameInstance = GetGameInstance();
	const UPartyManager* PartyManager = GameInstance ? GameInstance->GetSubsystem<UPartyManager>() : nullptr;
	if (!PartyManager)
	{
		return;
	}

	const TArray<FPartyMemberState> Members = PartyManager->GetPartyMembers();
	UImage* Portraits[4] = { PartyPortrait0, PartyPortrait1, PartyPortrait2, PartyPortrait3 };
	UProgressBar* HealthBars[4] = { PartyHealthBar0, PartyHealthBar1, PartyHealthBar2, PartyHealthBar3 };

	for (int32 Index = 0; Index < 4; ++Index)
	{
		if (Portraits[Index] && Members.IsValidIndex(Index) && Members[Index].CharacterData.CharacterIcon)
		{
			Portraits[Index]->SetBrushFromTexture(Members[Index].CharacterData.CharacterIcon);
			Portraits[Index]->SetVisibility(ESlateVisibility::HitTestInvisible);
		}
		else if (Portraits[Index])
		{
			Portraits[Index]->SetVisibility(ESlateVisibility::Collapsed);
		}
		if (HealthBars[Index])
		{
			HealthBars[Index]->SetVisibility(Members.IsValidIndex(Index) ? ESlateVisibility::HitTestInvisible : ESlateVisibility::Collapsed);
		}
	}
}

void UHUDWidget::ShowInteractionPrompt(const FText& PromptText)
{
	if (InteractionPromptText)
	{
		InteractionPromptText->SetText(PromptText);
		InteractionPromptText->SetVisibility(ESlateVisibility::HitTestInvisible);
	}
}

void UHUDWidget::HideInteractionPrompt()
{
	if (InteractionPromptText)
	{
		InteractionPromptText->SetVisibility(ESlateVisibility::Collapsed);
	}
}

void UHUDWidget::RefreshPing(float DeltaSeconds)
{
	PingRefreshTimer -= DeltaSeconds;
	if (PingRefreshTimer > 0.f || !PingText)
	{
		return;
	}
	PingRefreshTimer = 1.f;

	const APlayerState* PlayerState = UGameplayStatics::GetPlayerController(this, 0)
		? UGameplayStatics::GetPlayerController(this, 0)->PlayerState
		: nullptr;
	const float PingMs = PlayerState ? PlayerState->GetPingInMilliseconds() : 0.f;
	PingText->SetText(FText::Format(NSLOCTEXT("HUD", "PingFormat", "{0} ms"), FText::AsNumber(FMath::RoundToInt(PingMs))));
}

void UHUDWidget::HideHitMarkerIfExpired(float DeltaSeconds)
{
	if (HitMarkerTimer <= 0.f)
	{
		return;
	}
	HitMarkerTimer -= DeltaSeconds;
	if (HitMarkerTimer <= 0.f && HitMarkerImage)
	{
		HitMarkerImage->SetVisibility(ESlateVisibility::Collapsed);
	}
}

void UHUDWidget::HideKillConfirmIfExpired(float DeltaSeconds)
{
	if (KillConfirmTimer <= 0.f)
	{
		return;
	}
	KillConfirmTimer -= DeltaSeconds;
	if (KillConfirmTimer <= 0.f && KillConfirmImage)
	{
		KillConfirmImage->SetVisibility(ESlateVisibility::Collapsed);
	}
}

void UHUDWidget::HideReactionPopupIfExpired(float DeltaSeconds)
{
	if (ReactionPopupTimer <= 0.f)
	{
		return;
	}
	ReactionPopupTimer -= DeltaSeconds;
	if (ReactionPopupTimer <= 0.f && ReactionPopupText)
	{
		ReactionPopupText->SetVisibility(ESlateVisibility::Collapsed);
	}
}

void UHUDWidget::NativeTick(const FGeometry& MyGeometry, float InDeltaTime)
{
	Super::NativeTick(MyGeometry, InDeltaTime);

	RefreshPing(InDeltaTime);
	HideHitMarkerIfExpired(InDeltaTime);
	HideKillConfirmIfExpired(InDeltaTime);
	HideReactionPopupIfExpired(InDeltaTime);

	if (ComboHideTimer > 0.f)
	{
		ComboHideTimer -= InDeltaTime;
		if (ComboHideTimer <= 0.f && ComboCounterText)
		{
			ComboCounterText->SetVisibility(ESlateVisibility::Collapsed);
		}
	}

	if (PlayerBuffDisplay)
	{
		if (UGameInstance* GameInstance = GetGameInstance())
		{
			if (UElementalReactionManager* ReactionManager = GameInstance->GetSubsystem<UElementalReactionManager>())
			{
				if (AStickmanCharacter* PlayerCharacter = GetPlayerStickman(this))
				{
					PlayerBuffDisplay->UpdateGauges(ReactionManager->GetActiveElements(PlayerCharacter));
				}
			}
		}
	}
}
