// Copyright StickmanImpact Project.

#include "AdaptiveDifficultySubsystem.h"
#include "Character/StickmanCharacter.h"
#include "Combat/StickmanAttributeSet.h"
#include "Kismet/GameplayStatics.h"

void UAdaptiveDifficultySubsystem::RecordPlayerSkillUse(FGameplayTag SkillTag)
{
	if (SkillTag.IsValid())
	{
		SkillUseCounts.FindOrAdd(SkillTag)++;
	}
}

float UAdaptiveDifficultySubsystem::GetAggressionMultiplier() const
{
	const float Now = GetWorld() ? GetWorld()->GetTimeSeconds() : 0.f;
	const float UnhitTime = Now - LastPlayerHitTime;
	const float Ramp = FMath::Clamp((UnhitTime - UnhitAggressionSeconds) / UnhitAggressionSeconds, 0.f, 1.f);
	return (1.f + Ramp * (MaxAggressionMultiplier - 1.f)) * DifficultyScale;
}

float UAdaptiveDifficultySubsystem::GetAttackCooldownMultiplier() const
{
	const AStickmanCharacter* Player = Cast<AStickmanCharacter>(UGameplayStatics::GetPlayerPawn(this, 0));
	const UStickmanAttributeSet* Attributes = Player ? Player->GetStickmanAttributeSet() : nullptr;
	if (Attributes && Attributes->GetMaxHealth() > 0.f
		&& Attributes->GetHealth() / Attributes->GetMaxHealth() <= LowHPMercyThreshold)
	{
		return MercyCooldownMultiplier / FMath::Max(DifficultyScale, 0.1f);
	}
	return 1.f / FMath::Max(GetAggressionMultiplier(), 0.1f); // Aggressive = shorter cooldowns.
}

FGameplayTag UAdaptiveDifficultySubsystem::GetPlayerFavoriteSkill() const
{
	FGameplayTag Favorite;
	int32 Best = 0;
	for (const auto& Pair : SkillUseCounts)
	{
		if (Pair.Value > Best)
		{
			Best = Pair.Value;
			Favorite = Pair.Key;
		}
	}
	return Favorite;
}
