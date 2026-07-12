// Copyright StickmanImpact Project.

#include "AttackTokenSubsystem.h"
#include "TimerManager.h"

void UAttackTokenSubsystem::PruneExpired() const
{
	const double Now = GetWorld() ? GetWorld()->GetTimeSeconds() : 0.0;
	Tokens.RemoveAll([this, Now](const FToken& Token)
	{
		return !Token.Holder.IsValid() || Now - Token.GrantTime > TokenTimeout;
	});
}

bool UAttackTokenSubsystem::RequestAttackToken(AActor* Requester)
{
	if (!Requester)
	{
		return false;
	}
	PruneExpired();

	// Already holding one? Refresh it.
	for (FToken& Token : Tokens)
	{
		if (Token.Holder == Requester)
		{
			Token.GrantTime = GetWorld()->GetTimeSeconds();
			return true;
		}
	}

	if (Tokens.Num() >= MaxConcurrentAttackers + BonusSlots)
	{
		return false; // Rotation full — circle instead.
	}

	FToken NewToken;
	NewToken.Holder = Requester;
	NewToken.GrantTime = GetWorld()->GetTimeSeconds();
	Tokens.Add(NewToken);
	return true;
}

void UAttackTokenSubsystem::ReleaseAttackToken(AActor* Holder)
{
	Tokens.RemoveAll([Holder](const FToken& Token) { return Token.Holder == Holder; });
}

int32 UAttackTokenSubsystem::GetActiveAttackerCount() const
{
	PruneExpired();
	return Tokens.Num();
}

void UAttackTokenSubsystem::OpenComboAttackWindow(float Duration)
{
	BonusSlots = 1;
	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().SetTimer(ComboWindowTimerHandle, FTimerDelegate::CreateWeakLambda(this, [this]()
		{
			BonusSlots = 0;
		}), Duration, false);
	}
}
