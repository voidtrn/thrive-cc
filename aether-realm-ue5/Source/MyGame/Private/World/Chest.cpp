#include "World/Chest.h"
#include "Character/EnemyBase.h"
#include "System/OpenWorldGameInstance.h"
#include "Kismet/GameplayStatics.h"
#include "Net/UnrealNetwork.h"
#include "MyGame.h"

AChest::AChest()
{
	PrimaryActorTick.bCanEverTick = false;
	bReplicates = true; // co-op: chest state synced dari host
}

void AChest::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
	Super::GetLifetimeReplicatedProps(OutLifetimeProps);
	DOREPLIFETIME(AChest, State);
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
	// Client guest: forward ke server (server-authoritative)
	if (!HasAuthority())
	{
		Server_TryOpen(Player);
		return true;
	}

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
	Multicast_PlayOpenEffect(); // animasi + VFX di semua client
	return true;
}

void AChest::Server_TryOpen_Implementation(APlayerController* Player)
{
	TryOpen(Player);
}

void AChest::Multicast_PlayOpenEffect_Implementation()
{
	OnOpeningStarted(); // BP: play animasi → FinishOpening() (loot server-only)
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
	// Loot & state final hanya di server (client cukup animasi via multicast)
	if (!HasAuthority() || State != EChestState::Opening)
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
