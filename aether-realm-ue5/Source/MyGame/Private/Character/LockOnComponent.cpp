#include "Character/LockOnComponent.h"
#include "GameFramework/Character.h"
#include "GameFramework/Controller.h"
#include "Kismet/GameplayStatics.h"
#include "Kismet/KismetMathLibrary.h"

ULockOnComponent::ULockOnComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
}

void ULockOnComponent::ToggleLockOn()
{
	if (Target.IsValid())
	{
		ClearLock();
		return;
	}

	if (AActor* Best = FindBestTarget())
	{
		Target = Best;
		OnTargetChanged.Broadcast(Best);
	}
}

void ULockOnComponent::ClearLock()
{
	if (Target.IsValid())
	{
		Target = nullptr;
		OnTargetChanged.Broadcast(nullptr);
	}
}

void ULockOnComponent::TickComponent(float DeltaTime, ELevelTick TickType,
	FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	if (!Target.IsValid())
	{
		return;
	}

	ACharacter* OwnerChar = Cast<ACharacter>(GetOwner());
	AController* Controller = OwnerChar ? OwnerChar->GetController() : nullptr;
	if (!Controller)
	{
		return;
	}

	const float Dist = FVector::Dist(OwnerChar->GetActorLocation(), Target->GetActorLocation());
	if (Dist > BreakDistance || !HasLineOfSight(Target.Get()))
	{
		ClearLock();
		return;
	}

	// Kamera interp menghadap target (aim sedikit ke bawah ke arah dada).
	const FVector TargetPoint = Target->GetActorLocation() - FVector(0.f, 0.f, 30.f);
	const FRotator Desired = UKismetMathLibrary::FindLookAtRotation(
		OwnerChar->GetActorLocation() + FVector(0.f, 0.f, 60.f), TargetPoint);
	const FRotator Current = Controller->GetControlRotation();
	const FRotator NewRot = FMath::RInterpTo(Current, Desired, DeltaTime, CameraInterpSpeed);
	Controller->SetControlRotation(FRotator(NewRot.Pitch, NewRot.Yaw, 0.f));
}

AActor* ULockOnComponent::FindBestTarget() const
{
	const AActor* Owner = GetOwner();
	TArray<AActor*> Candidates;
	UGameplayStatics::GetAllActorsWithTag(GetWorld(), EnemyTag, Candidates);

	AActor* Best = nullptr;
	float BestDist = SearchRadius;

	for (AActor* Candidate : Candidates)
	{
		const float Dist = FVector::Dist(Owner->GetActorLocation(), Candidate->GetActorLocation());
		if (Dist < BestDist && HasLineOfSight(Candidate))
		{
			Best = Candidate;
			BestDist = Dist;
		}
	}
	return Best;
}

bool ULockOnComponent::HasLineOfSight(const AActor* Candidate) const
{
	if (!Candidate)
	{
		return false;
	}

	FHitResult Hit;
	FCollisionQueryParams Params;
	Params.AddIgnoredActor(GetOwner());
	Params.AddIgnoredActor(Candidate);

	const bool bBlocked = GetWorld()->LineTraceSingleByChannel(
		Hit,
		GetOwner()->GetActorLocation() + FVector(0.f, 0.f, 60.f),
		Candidate->GetActorLocation(),
		ECC_Visibility,
		Params);

	return !bBlocked;
}
