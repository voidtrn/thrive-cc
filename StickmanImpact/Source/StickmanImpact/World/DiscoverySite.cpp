// Copyright StickmanImpact Project.

#include "DiscoverySite.h"
#include "Components/SphereComponent.h"
#include "Character/StickmanCharacter.h"
#include "CollectibleManager.h"
#include "DayNightManager.h"
#include "WeatherManager.h"
#include "NiagaraFunctionLibrary.h"
#include "Kismet/GameplayStatics.h"

ADiscoverySite::ADiscoverySite()
{
	PrimaryActorTick.bCanEverTick = false;

	TriggerSphere = CreateDefaultSubobject<USphereComponent>(TEXT("TriggerSphere"));
	RootComponent = TriggerSphere;
	TriggerSphere->SetSphereRadius(200.f);
	TriggerSphere->SetCollisionResponseToAllChannels(ECR_Ignore);
	TriggerSphere->SetCollisionResponseToChannel(ECC_Pawn, ECR_Overlap);
}

void ADiscoverySite::BeginPlay()
{
	Super::BeginPlay();

	if (UDiscoveryManager* Discovery = GetGameInstance()->GetSubsystem<UDiscoveryManager>())
	{
		Discovery->RegisterSecret(DiscoveryID, Area);

		// Already found in a previous visit/session — nothing left to trigger.
		if (Discovery->IsDiscovered(DiscoveryID))
		{
			SetActorEnableCollision(false);
			return;
		}
	}

	if (bStartSealed)
	{
		SetActorHiddenInGame(true);
		SetActorEnableCollision(false);
	}

	TriggerSphere->OnComponentBeginOverlap.AddDynamic(this, &ADiscoverySite::HandleOverlap);
}

void ADiscoverySite::Unseal()
{
	if (!bStartSealed)
	{
		return;
	}
	bStartSealed = false;
	SetActorHiddenInGame(false);
	SetActorEnableCollision(true);
}

void ADiscoverySite::NotifyElementApplied(EStickmanElement Element)
{
	if (bStartSealed && Element == RequiredElement && Element != EStickmanElement::None)
	{
		Unseal();
	}
}

bool ADiscoverySite::PassesTimeWeatherGate() const
{
	if (bOnlyAtNight)
	{
		const ADayNightManager* DayNight = Cast<ADayNightManager>(
			UGameplayStatics::GetActorOfClass(this, ADayNightManager::StaticClass()));
		if (!DayNight || !DayNight->IsNight())
		{
			return false;
		}
	}

	if (bRequireWeather)
	{
		const UWeatherManager* Weather = GetGameInstance()->GetSubsystem<UWeatherManager>();
		if (!Weather || Weather->GetCurrentWeather() != RequiredWeather)
		{
			return false;
		}
	}

	return true;
}

void ADiscoverySite::HandleOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor,
	UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	AStickmanCharacter* Player = Cast<AStickmanCharacter>(OtherActor);
	if (!Player || !PassesTimeWeatherGate())
	{
		return;
	}

	UDiscoveryManager* Discovery = GetGameInstance()->GetSubsystem<UDiscoveryManager>();
	if (!Discovery)
	{
		return;
	}

	FDiscoveryJournalEntry Entry;
	Entry.DiscoveryID = DiscoveryID;
	Entry.DisplayName = DisplayName;
	Entry.Area = Area;
	Entry.Layer = Layer;
	Entry.Tier = Tier;
	Entry.Location = GetActorLocation();
	if (const ADayNightManager* DayNight = Cast<ADayNightManager>(
			UGameplayStatics::GetActorOfClass(this, ADayNightManager::StaticClass())))
	{
		Entry.GameHourFound = DayNight->GetCurrentHour();
	}

	if (!Discovery->RecordDiscovery(Entry))
	{
		return; // Already discovered (double overlap / duplicate ID) — no double rewards.
	}

	if (UCollectibleManager* Collectibles = GetGameInstance()->GetSubsystem<UCollectibleManager>())
	{
		Collectibles->GrantReward(Reward);
	}

	if (DiscoveryVFX)
	{
		UNiagaraFunctionLibrary::SpawnSystemAtLocation(this, DiscoveryVFX, GetActorLocation());
	}
	if (DiscoverySound)
	{
		UGameplayStatics::PlaySoundAtLocation(this, DiscoverySound, GetActorLocation());
	}

	SetActorEnableCollision(false);
	OnDiscovered(Player);
}
