// Copyright StickmanImpact Project.

#include "DestructionManagerSubsystem.h"
#include "DestructibleObject.h"

void UDestructionManagerSubsystem::NotifyObjectBroken(ADestructibleObject* Object, bool bMinor)
{
	if (!Object)
	{
		return;
	}
	if (!bMinor)
	{
		// Session memory: majors stay broken on level revisit (checked in BeginPlay).
		SessionBrokenIDs.Add(Object->GetFName());
	}
}

void UDestructionManagerSubsystem::RegisterDebris(AActor* Debris)
{
	if (!Debris)
	{
		return;
	}

	Debris->SetLifeSpan(DebrisLifetime);
	ActiveDebris.Add(Debris);

	// Budget: prune dead entries, then fade out the oldest past the cap.
	ActiveDebris.RemoveAll([](const TWeakObjectPtr<AActor>& Weak) { return !Weak.IsValid(); });
	while (ActiveDebris.Num() > MaxActiveDebris)
	{
		if (AActor* Oldest = ActiveDebris[0].Get())
		{
			Oldest->SetLifeSpan(0.5f); // quick fade-out via lifespan
		}
		ActiveDebris.RemoveAt(0);
	}
}

int32 UDestructionManagerSubsystem::GetActiveDebrisCount() const
{
	int32 Count = 0;
	for (const TWeakObjectPtr<AActor>& Weak : ActiveDebris)
	{
		if (Weak.IsValid())
		{
			++Count;
		}
	}
	return Count;
}
