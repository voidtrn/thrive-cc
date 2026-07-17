// Copyright StickmanImpact Project.

#include "MountManagerSubsystem.h"
#include "MountBase.h"
#include "Kismet/GameplayStatics.h"
#include "NavigationSystem.h"

void UMountManagerSubsystem::RegisterMount(const FMountRecord& Record)
{
	if (!Record.MountID.IsNone())
	{
		OwnedMounts.Add(Record.MountID, Record);
	}
}

bool UMountManagerSubsystem::IsSummonReady() const
{
	const UWorld* World = GetGameInstance() ? GetGameInstance()->GetWorld() : nullptr;
	return World && (World->GetTimeSeconds() - LastDismountTime) >= SummonCooldown;
}

AMountBase* UMountManagerSubsystem::SummonMount(FName MountID)
{
	if (!IsSummonReady() || !DefaultMountClass || !OwnedMounts.Contains(MountID))
	{
		return nullptr;
	}

	UWorld* World = GetGameInstance()->GetWorld();
	const APawn* Player = UGameplayStatics::GetPlayerPawn(World, 0);
	if (!World || !Player)
	{
		return nullptr;
	}

	// Spawn a short distance from the player and let it run in (BP/AI handles the approach).
	FVector SpawnLocation = Player->GetActorLocation() + Player->GetActorForwardVector() * 500.f;
	if (UNavigationSystemV1* Nav = UNavigationSystemV1::GetCurrent(World))
	{
		FNavLocation NavLocation;
		if (Nav->GetRandomReachablePointInRadius(SpawnLocation, 300.f, NavLocation))
		{
			SpawnLocation = NavLocation.Location;
		}
	}

	if (ActiveMountActor)
	{
		ActiveMountActor->Destroy();
	}

	ActiveMountActor = World->SpawnActor<AMountBase>(DefaultMountClass, SpawnLocation, Player->GetActorRotation());
	if (ActiveMountActor)
	{
		ActiveMountActor->MountID = MountID;
		ActiveMountID = MountID;
		OnMountSummoned.Broadcast(ActiveMountActor);
	}
	return ActiveMountActor;
}

void UMountManagerSubsystem::AddBondXP(FName MountID, int32 Amount)
{
	FMountRecord* Record = OwnedMounts.Find(MountID);
	if (!Record || Amount <= 0)
	{
		return;
	}
	const int32 OldLevel = Record->BondLevel;
	Record->BondXP += Amount;
	Record->BondLevel = LevelForXP(Record->BondXP);
	if (Record->BondLevel > OldLevel)
	{
		OnMountBondLevelUp.Broadcast(MountID, Record->BondLevel);
	}
}

void UMountManagerSubsystem::NotifyDismounted(FName MountID)
{
	if (const UWorld* World = GetGameInstance()->GetWorld())
	{
		LastDismountTime = World->GetTimeSeconds();
	}
	AddBondXP(MountID, 10); // riding builds bond
}

int32 UMountManagerSubsystem::LevelForXP(int32 XP) const
{
	int32 Level = 1;
	for (int32 Index = 0; Index < BondXPPerLevel.Num(); ++Index)
	{
		if (XP >= BondXPPerLevel[Index])
		{
			Level = Index + 2;
		}
	}
	return Level;
}

bool UMountManagerSubsystem::GetMountRecord(FName MountID, FMountRecord& OutRecord) const
{
	if (const FMountRecord* Record = OwnedMounts.Find(MountID))
	{
		OutRecord = *Record;
		return true;
	}
	return false;
}

TArray<FName> UMountManagerSubsystem::GetOwnedMounts() const
{
	TArray<FName> Result;
	OwnedMounts.GenerateKeyArray(Result);
	return Result;
}

void UMountManagerSubsystem::ExportSaveState(TArray<FMountRecord>& OutRecords, FName& OutActive) const
{
	OwnedMounts.GenerateValueArray(OutRecords);
	OutActive = ActiveMountID;
}

void UMountManagerSubsystem::ImportSaveState(const TArray<FMountRecord>& InRecords, FName InActive)
{
	OwnedMounts.Empty();
	for (const FMountRecord& Record : InRecords)
	{
		OwnedMounts.Add(Record.MountID, Record);
	}
	ActiveMountID = InActive;
}
