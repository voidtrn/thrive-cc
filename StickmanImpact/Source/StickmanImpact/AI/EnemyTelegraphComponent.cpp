// Copyright StickmanImpact Project.

#include "EnemyTelegraphComponent.h"
#include "Audio/StickmanAudioManager.h"
#include "Character/StickmanCharacter.h"
#include "Character/StickmanGameplayTags.h"
#include "VFX/GameFeelComponent.h"
#include "GameFramework/Character.h"
#include "Components/SkeletalMeshComponent.h"
#include "Kismet/GameplayStatics.h"

UEnemyTelegraphComponent::UEnemyTelegraphComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
}

void UEnemyTelegraphComponent::BeginTelegraph(float TellDuration, FOnTelegraphFinished OnFinished)
{
	BeginTelegraph(TellDuration, bDefaultAttackParryable, OnFinished);
}

void UEnemyTelegraphComponent::BeginTelegraph(float TellDuration, bool bParryable, FOnTelegraphFinished OnFinished)
{
	bTelegraphing = true;
	bIsFeint = FMath::FRand() < FeintChance;
	bCurrentAttackParryable = bParryable;
	TelegraphRemaining = TellDuration;
	TelegraphTotal = TellDuration;
	FinishedDelegate = OnFinished;

	OnTelegraphStarted.Broadcast(TellDuration);

	if (TellSound)
	{
		if (UStickmanAudioManager* Audio = GetWorld()->GetGameInstance()
				? GetWorld()->GetGameInstance()->GetSubsystem<UStickmanAudioManager>() : nullptr)
		{
			Audio->PlaySFX(TellSound, GetOwner()->GetActorLocation());
		}
	}
	if (GroundIndicatorDecal)
	{
		UGameplayStatics::SpawnDecalAtLocation(GetWorld(), GroundIndicatorDecal,
			FVector(GroundIndicatorRadius, GroundIndicatorRadius, 100.f),
			GetOwner()->GetActorLocation() - FVector(0.f, 0.f, 80.f), FRotator(-90.f, 0.f, 0.f), TellDuration);
	}
}

void UEnemyTelegraphComponent::SetMeshFlash(float Intensity)
{
	const ACharacter* OwnerCharacter = Cast<ACharacter>(GetOwner());
	USkeletalMeshComponent* Mesh = OwnerCharacter ? OwnerCharacter->GetMesh() : nullptr;
	if (!Mesh)
	{
		return;
	}
	// Parryable attacks flash white ("TellFlash"), unparryable ones flash red
	// ("TellUnparryable") so the player reads "parry" vs "must dodge" at a glance.
	const FName FlashParam = bCurrentAttackParryable ? FName(TEXT("TellFlash")) : FName(TEXT("TellUnparryable"));
	const FName OtherParam = bCurrentAttackParryable ? FName(TEXT("TellUnparryable")) : FName(TEXT("TellFlash"));
	for (int32 Index = 0; Index < Mesh->GetNumMaterials(); ++Index)
	{
		if (UMaterialInstanceDynamic* MID = Mesh->CreateDynamicMaterialInstance(Index))
		{
			MID->SetScalarParameterValue(FlashParam, Intensity);
			MID->SetScalarParameterValue(OtherParam, 0.f);
		}
	}
}

void UEnemyTelegraphComponent::TickComponent(float DeltaTime, ELevelTick TickType,
	FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	if (!bTelegraphing)
	{
		return;
	}

	TelegraphRemaining -= DeltaTime;

	// Flash ramps up as the attack nears (consistent, learnable curve).
	SetMeshFlash(1.f - FMath::Clamp(TelegraphRemaining / FMath::Max(TelegraphTotal, 0.01f), 0.f, 1.f));

	// Perfect-dodge / parry resolution is owned by UDefenseComponent when the attack actually
	// lands on the player (ApplyDamageToTarget), so the tell only needs to signal timing +
	// parryability here — no dash detection in the telegraph anymore.

	if (TelegraphRemaining <= 0.f)
	{
		FinishTelegraph();
	}
}

void UEnemyTelegraphComponent::FinishTelegraph()
{
	bTelegraphing = false;
	SetMeshFlash(0.f);
	FinishedDelegate.ExecuteIfBound(!bIsFeint); // Feints report false — no attack follows.
}
