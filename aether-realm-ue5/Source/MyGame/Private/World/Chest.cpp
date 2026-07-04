#include "World/Chest.h"
#include "Character/EnemyBase.h"
#include "System/OpenWorldGameInstance.h"
#include "Kismet/GameplayStatics.h"
#include "MyGame.h"

AChest::AChest()
{
	PrimaryActorTick.bCanEverTick = false;
}

void AChest::BeginPlay()
{
	Super::BeginPlay();

	State = bStartLocked ? EChestState::Locked : EChestState::Closed;

	// Persistence: sudah dibuka di save → langsung state Opened
	if (!bEventChest)
	{
		if (const UOpenWorldGameInstance* GI = GetGameInstance<UOpenWorldGameInstance>())
		{
			if (GI->OpenedChests.Contains(GetChestId()))
			{
				State = EChestState::Opened;
			}
		}
	}
}

bool AChest::TryOpen(APlayerController* Player)
{
	if (State == EChestState::Locked)
	{
		// Auto-unlock kalau semua enemy sekitar mati
		if (EnemyCheckRadius > 0.f && AreNearbyEnemiesDead())
		{
			UnlockChest();
		}
		else
		{
			return false;
		}
	}

	if (State != EChestState::Closed)
	{
		return false;
	}

	State = EChestState::Opening;
	OnOpeningStarted(); // BP: play animasi → FinishOpening()
	return true;
}

void AChest::UnlockChest()
{
	if (State == EChestState::Locked)
	{
		State = EChestState::Closed;
	}
}

void AChest::FinishOpening()
{
	if (State != EChestState::Opening)
	{
		return;
	}
	State = EChestState::Opened;

	const int32 Primogems = RollPrimogems();

	if (UOpenWorldGameInstance* GI = GetGameInstance<UOpenWorldGameInstance>())
	{
		GI->Primogems += Primogems;
		for (const auto& Loot : BonusLoot)
		{
			GI->InventoryItems.FindOrAdd(Loot.Key) += Loot.Value;
		}
		if (!bEventChest)
		{
			GI->OpenedChests.Add(GetChestId()); // no respawn — persist
		}
	}

	OnChestOpened.Broadcast(this, Primogems);
	UE_LOG(LogAetherRealm, Log, TEXT("Chest opened: %s (+%d primogems)"), *GetName(), Primogems);
}

int32 AChest::RollPrimogems() const
{
	switch (Tier)
	{
	case EChestTier::Common:    return FMath::RandRange(2, 5);
	case EChestTier::Exquisite: return FMath::RandRange(5, 10);
	case EChestTier::Precious:  return FMath::RandRange(10, 20);
	case EChestTier::Luxurious: return FMath::RandRange(20, 40);
	default:                    return 0;
	}
}

bool AChest::AreNearbyEnemiesDead() const
{
	TArray<AActor*> Enemies;
	UGameplayStatics::GetAllActorsOfClass(GetWorld(), AEnemyBase::StaticClass(), Enemies);

	for (const AActor* Actor : Enemies)
	{
		const AEnemyBase* Enemy = Cast<AEnemyBase>(Actor);
		if (Enemy && Enemy->IsAlive()
			&& FVector::Dist(Enemy->GetActorLocation(), GetActorLocation()) < EnemyCheckRadius)
		{
			return false;
		}
	}
	return true;
}
