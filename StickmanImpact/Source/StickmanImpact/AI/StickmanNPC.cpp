// Copyright StickmanImpact Project.

#include "StickmanNPC.h"
#include "StickmanScheduleComponent.h"
#include "StickmanDialogueTriggerComponent.h"
#include "Enemies/StickmanEnemyCharacter.h"
#include "StickmanVisuals/StickmanBodyComponent.h"
#include "Kismet/GameplayStatics.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "EngineUtils.h"

AStickmanNPC::AStickmanNPC()
{
	PrimaryActorTick.bCanEverTick = true;

	ScheduleComponent = CreateDefaultSubobject<UStickmanScheduleComponent>(TEXT("ScheduleComponent"));
	DialogueComponent = CreateDefaultSubobject<UStickmanDialogueTriggerComponent>(TEXT("DialogueComponent"));

	// Procedural stickman silhouette (green = civilian), distinct from blue player / red enemy.
	NPCBody = CreateDefaultSubobject<UStickmanBodyComponent>(TEXT("NPCBody"));
	NPCBody->SetupAttachment(RootComponent);
	NPCBody->BodyColor = FLinearColor(0.25f, 0.75f, 0.35f);

	GetCharacterMovement()->MaxWalkSpeed = WalkSpeed;
}

void AStickmanNPC::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);

	UpdateGreeting();
	UpdateCombatFlee(DeltaSeconds);
}

void AStickmanNPC::UpdateGreeting()
{
	if (bIsFleeingCombat)
	{
		return;
	}

	const APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0);
	if (!PlayerPawn)
	{
		return;
	}

	const float Distance = FVector::Dist(GetActorLocation(), PlayerPawn->GetActorLocation());

	if (Distance <= GreetRadius && !bHasGreetedPlayer)
	{
		bHasGreetedPlayer = true;
		SetEmotion(EStickmanCutsceneEmotion::Happy);
		if (GreetMontage && GetMesh() && GetMesh()->GetAnimInstance())
		{
			GetMesh()->GetAnimInstance()->Montage_Play(GreetMontage);
		}
	}
	else if (Distance > GreetRadius * 1.5f && bHasGreetedPlayer)
	{
		bHasGreetedPlayer = false;
		SetEmotion(EStickmanCutsceneEmotion::Neutral);
	}
}

void AStickmanNPC::UpdateCombatFlee(float DeltaSeconds)
{
	// Throttled — scanning all enemies every frame for every NPC in town would add up fast.
	TimeSinceFleeCheck += DeltaSeconds;
	if (TimeSinceFleeCheck < 0.5f)
	{
		if (bIsFleeingCombat)
		{
			GetCharacterMovement()->MaxWalkSpeed = FleeSpeed;
		}
		return;
	}
	TimeSinceFleeCheck = 0.f;

	bool bCombatNearby = false;
	for (TActorIterator<AStickmanEnemyCharacter> It(GetWorld()); It; ++It)
	{
		if (It->GetCombatState() != EEnemyCombatState::Combat)
		{
			continue;
		}
		if (FVector::Dist(GetActorLocation(), It->GetActorLocation()) <= FleeFromCombatRadius)
		{
			bCombatNearby = true;
			break;
		}
	}

	if (bCombatNearby && !bIsFleeingCombat)
	{
		bIsFleeingCombat = true;
		SetEmotion(EStickmanCutsceneEmotion::Surprised);
		GetCharacterMovement()->MaxWalkSpeed = FleeSpeed;
	}
	else if (!bCombatNearby && bIsFleeingCombat)
	{
		bIsFleeingCombat = false;
		SetEmotion(EStickmanCutsceneEmotion::Neutral);
		GetCharacterMovement()->MaxWalkSpeed = WalkSpeed;
	}
}
