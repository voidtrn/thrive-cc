#include "World/DomainChallenge.h"
#include "Character/EnemyBase.h"
#include "System/PacingDirectorSubsystem.h"
#include "Components/BoxComponent.h"
#include "TimerManager.h"
#include "MyGame.h"

ADomainChallenge::ADomainChallenge()
{
	PrimaryActorTick.bCanEverTick = true;

	SpawnArea = CreateDefaultSubobject<UBoxComponent>(TEXT("SpawnArea"));
	SetRootComponent(SpawnArea);
	SpawnArea->SetBoxExtent(FVector(800.f, 800.f, 200.f));
	SpawnArea->SetCollisionEnabled(ECollisionEnabled::NoCollision);
}

void ADomainChallenge::StartDomain()
{
	if (State == EDomainState::Active || Waves.IsEmpty())
	{
		return;
	}

	TimeRemaining = TimeLimit;
	CurrentWaveIndex = -1;
	AliveEnemies.Reset();
	SetState(EDomainState::Active);

	SpawnWave(0);
}

void ADomainChallenge::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);

	if (State != EDomainState::Active)
	{
		return;
	}

	TimeRemaining -= DeltaSeconds;
	if (TimeRemaining <= 0.f)
	{
		TimeRemaining = 0.f;
		SetState(EDomainState::Failed);
		// Bersihkan musuh sisa
		for (AEnemyBase* Enemy : AliveEnemies)
		{
			if (IsValid(Enemy))
			{
				Enemy->Destroy();
			}
		}
		AliveEnemies.Reset();
	}
}

FVector ADomainChallenge::RandomSpawnPoint() const
{
	const FVector Extent = SpawnArea->GetScaledBoxExtent();
	const FVector Origin = SpawnArea->GetComponentLocation();
	return Origin + FVector(
		FMath::FRandRange(-Extent.X, Extent.X),
		FMath::FRandRange(-Extent.Y, Extent.Y),
		0.f);
}

void ADomainChallenge::SpawnWave(int32 WaveIndex)
{
	if (!Waves.IsValidIndex(WaveIndex))
	{
		return;
	}

	CurrentWaveIndex = WaveIndex;
	AliveEnemies.Reset();

	// Spawn budget pacing director — konsumen C++ pertama (sebelumnya cuma
	// diiklankan di docs). Domain = wave curated, jadi cuma skala NAIK
	// (Peak 1.5×, tekanan buat pemain dominan); mercy saat Relax TIDAK
	// mengurangi wave — ngurangin isi challenge arena = cheese ("masuk pas
	// Relax = domain gampang"). Mercy di domain lewat jalur loot bonus.
	float SpawnMultiplier = 1.f;
	if (const UPacingDirectorSubsystem* Pacing = GetWorld()->GetSubsystem<UPacingDirectorSubsystem>())
	{
		SpawnMultiplier = FMath::Max(1.f, Pacing->GetSpawnBudgetMultiplier());
	}

	for (const auto& Pair : Waves[WaveIndex].Enemies)
	{
		if (!Pair.Key)
		{
			continue;
		}
		// Pair.Value == 0 = entri sengaja dimatikan designer (default TMap
		// editor juga 0) — jangan dipaksa jadi 1 oleh clamp; min-1 cuma
		// berlaku buat entri yang memang aktif.
		const int32 SpawnCount = Pair.Value > 0
			? FMath::Max(1, FMath::RoundToInt(Pair.Value * SpawnMultiplier))
			: 0;
		for (int32 i = 0; i < SpawnCount; ++i)
		{
			FActorSpawnParameters Params;
			Params.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AdjustIfPossibleButAlwaysSpawn;
			AEnemyBase* Enemy = GetWorld()->SpawnActor<AEnemyBase>(
				Pair.Key, RandomSpawnPoint(), FRotator::ZeroRotator, Params);
			if (Enemy)
			{
				// Pantau kematian untuk cek wave clear
				Enemy->OnDied.AddDynamic(this, &ADomainChallenge::CheckWaveClearFromDeath);
				AliveEnemies.Add(Enemy);
			}
		}
	}

	OnWaveChanged.Broadcast(CurrentWaveIndex, Waves.Num());
	UE_LOG(LogAetherRealm, Log, TEXT("Domain wave %d/%d spawned (%d enemies)"),
		WaveIndex + 1, Waves.Num(), AliveEnemies.Num());
}

void ADomainChallenge::CheckWaveClearFromDeath(ACharacterBase* DeadCharacter)
{
	// Delay 1 frame: HP baru saja jadi 0, biar RemoveAll akurat
	GetWorldTimerManager().SetTimerForNextTick([this]() { CheckWaveClear(); });
}

void ADomainChallenge::CheckWaveClear()
{
	// Sisa musuh hidup?
	AliveEnemies.RemoveAll([](const AEnemyBase* E) { return !IsValid(E) || !E->IsAlive(); });
	if (AliveEnemies.Num() > 0 || State != EDomainState::Active)
	{
		return;
	}

	// Wave bersih
	if (CurrentWaveIndex + 1 < Waves.Num())
	{
		FTimerHandle Handle;
		GetWorldTimerManager().SetTimer(Handle,
			[this, Next = CurrentWaveIndex + 1]() { SpawnWave(Next); },
			WaveDelay, false);
	}
	else
	{
		SetState(EDomainState::Cleared);
		OnDomainCleared(); // BP: reward
	}
}

void ADomainChallenge::SetState(EDomainState NewState)
{
	if (State == NewState)
	{
		return;
	}
	State = NewState;
	OnStateChanged.Broadcast(NewState);
}
