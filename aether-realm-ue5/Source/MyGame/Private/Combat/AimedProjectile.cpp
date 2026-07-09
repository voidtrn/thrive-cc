#include "Combat/AimedProjectile.h"
#include "Character/CharacterBase.h"
#include "Combat/CombatComponent.h"
#include "Components/SphereComponent.h"
#include "GameFramework/ProjectileMovementComponent.h"

AAimedProjectile::AAimedProjectile()
{
	PrimaryActorTick.bCanEverTick = false;
	bReplicates = true;
	SetReplicatingMovement(true);

	Collision = CreateDefaultSubobject<USphereComponent>(TEXT("Collision"));
	Collision->InitSphereRadius(12.f);
	Collision->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
	Collision->SetCollisionObjectType(ECC_WorldDynamic);
	Collision->SetCollisionResponseToAllChannels(ECR_Ignore);
	Collision->SetCollisionResponseToChannel(ECC_Pawn, ECR_Overlap);
	Collision->SetCollisionResponseToChannel(ECC_WorldStatic, ECR_Block);
	SetRootComponent(Collision);

	Movement = CreateDefaultSubobject<UProjectileMovementComponent>(TEXT("Movement"));
	Movement->UpdatedComponent = Collision;
	Movement->bRotationFollowsVelocity = true;
	Movement->ProjectileGravityScale = 0.05f;
}

void AAimedProjectile::BeginPlay()
{
	Super::BeginPlay();
	SetLifeSpan(MaxLifeSeconds);

	Movement->InitialSpeed = ProjectileSpeed;
	Movement->MaxSpeed = ProjectileSpeed;
	Movement->Velocity = GetActorForwardVector() * ProjectileSpeed;

	// Hit-detection server-only — client cukup lihat replikasi + VFX impact.
	if (HasAuthority())
	{
		Collision->OnComponentBeginOverlap.AddDynamic(this, &AAimedProjectile::OnSphereOverlap);
		Collision->OnComponentHit.AddDynamic(this, &AAimedProjectile::OnBlocked);
	}
}

void AAimedProjectile::InitShot(ACharacterBase* InShooter, const FAttackParams& InParams)
{
	Shooter = InShooter;
	AttackParams = InParams;
	if (Shooter)
	{
		Collision->IgnoreActorWhenMoving(Shooter, true);
	}
}

void AAimedProjectile::OnSphereOverlap(UPrimitiveComponent*, AActor* OtherActor,
	UPrimitiveComponent*, int32, bool, const FHitResult& SweepResult)
{
	if (bImpacted || !OtherActor || OtherActor == Shooter || OtherActor == this)
	{
		return;
	}

	// Hanya musuh — co-op friendly-fire off
	ACharacterBase* Victim = Cast<ACharacterBase>(OtherActor);
	if (!Victim || !Victim->ActorHasTag(TEXT("Enemy")) || !Victim->IsAlive())
	{
		return;
	}

	Impact(SweepResult.IsValidBlockingHit() ? SweepResult.ImpactPoint : GetActorLocation(), Victim);
}

void AAimedProjectile::OnBlocked(UPrimitiveComponent*, AActor*, UPrimitiveComponent*,
	FVector, const FHitResult& Hit)
{
	if (!bImpacted)
	{
		Impact(Hit.ImpactPoint, nullptr);
	}
}

void AAimedProjectile::Impact(const FVector& Location, ACharacterBase* Victim)
{
	bImpacted = true;

	if (Victim && Shooter)
	{
		if (UCombatComponent* Combat = Shooter->FindComponentByClass<UCombatComponent>())
		{
			Combat->DealDamage(Victim, AttackParams);
		}
	}

	OnImpact(Location, Victim != nullptr);

	// Beri 2 frame supaya multicast VFX sempat sampai sebelum destroy
	SetLifeSpan(0.05f);
	Movement->StopMovementImmediately();
	Collision->SetCollisionEnabled(ECollisionEnabled::NoCollision);
}
