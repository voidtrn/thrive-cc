// Copyright StickmanImpact Project.

#include "SkillCooldownWidget.h"
#include "Components/Image.h"
#include "Components/ProgressBar.h"
#include "Components/TextBlock.h"
#include "Combat/StickmanAbilitySystemComponent.h"
#include "Combat/StickmanGameplayAbility.h"
#include "Kismet/GameplayStatics.h"
#include "AbilitySystemBlueprintLibrary.h"

UStickmanAbilitySystemComponent* USkillCooldownWidget::GetPlayerASC() const
{
	APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0);
	return PlayerPawn ? Cast<UStickmanAbilitySystemComponent>(
		UAbilitySystemBlueprintLibrary::GetAbilitySystemComponent(PlayerPawn)) : nullptr;
}

void USkillCooldownWidget::NativeTick(const FGeometry& MyGeometry, float InDeltaTime)
{
	Super::NativeTick(MyGeometry, InDeltaTime);

	UStickmanAbilitySystemComponent* ASC = GetPlayerASC();
	UStickmanGameplayAbility* Ability = ASC ? ASC->FindGrantedAbilityForSkillTag(SkillTag) : nullptr;
	if (!Ability)
	{
		return;
	}

	const float CooldownRemaining = Ability->GetSkillCooldownRemaining();
	const bool bReady = CooldownRemaining <= 0.f && Ability->CheckCost();

	if (CooldownRadialBar)
	{
		const float CooldownDuration = FMath::Max(Ability->SkillData.Cooldown, 0.01f);
		CooldownRadialBar->SetPercent(FMath::Clamp(CooldownRemaining / CooldownDuration, 0.f, 1.f));
	}
	if (CooldownText)
	{
		CooldownText->SetText(CooldownRemaining > 0.f
			? FText::AsNumber(FMath::CeilToInt(CooldownRemaining))
			: FText::GetEmpty());
	}
	if (GlowOverlay)
	{
		GlowOverlay->SetVisibility(bReady ? ESlateVisibility::HitTestInvisible : ESlateVisibility::Collapsed);
	}

	bWasReadyLastTick = bReady;
}

bool USkillCooldownWidget::TryCast()
{
	UStickmanAbilitySystemComponent* ASC = GetPlayerASC();
	UStickmanGameplayAbility* Ability = ASC ? ASC->FindGrantedAbilityForSkillTag(SkillTag) : nullptr;

	const bool bCanCast = Ability && Ability->GetSkillCooldownRemaining() <= 0.f && Ability->CheckCost();
	if (bCanCast)
	{
		ASC->ActivateSkillByTag(SkillTag);
		return true;
	}

	if (ShakeAnim)
	{
		PlayAnimation(ShakeAnim);
	}
	return false;
}
