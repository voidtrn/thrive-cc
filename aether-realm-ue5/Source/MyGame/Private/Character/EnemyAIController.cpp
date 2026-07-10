#include "Character/EnemyAIController.h"
#include "Character/EnemyBase.h"
#include "Perception/AIPerceptionComponent.h"
#include "Perception/AISenseConfig_Sight.h"
#include "Perception/AISenseConfig_Hearing.h"
#include "BehaviorTree/BehaviorTree.h"
#include "BehaviorTree/BlackboardComponent.h"
#include "System/PacingDirectorSubsystem.h"
#include "Kismet/GameplayStatics.h"

namespace
{
	const FName BBKey_TargetActor = TEXT("TargetActor");
	const FName BBKey_LastKnownLocation = TEXT("LastKnownLocation");
	const FName BBKey_HasTarget = TEXT("HasTarget");
}

AEnemyAIController::AEnemyAIController()
{
	Perception = CreateDefaultSubobject<UAIPerceptionComponent>(TEXT("Perception"));

	// Sight: 1500 unit, cone 90° (peripheral = setengah sudut = 45°)
	UAISenseConfig_Sight* SightConfig = CreateDefaultSubobject<UAISenseConfig_Sight>(TEXT("SightConfig"));
	SightConfig->SightRadius = 1500.f;
	SightConfig->LoseSightRadius = 1800.f;
	SightConfig->PeripheralVisionAngleDegrees = 45.f;
	SightConfig->DetectionByAffiliation.bDetectEnemies = true;
	SightConfig->DetectionByAffiliation.bDetectNeutrals = true;
	SightConfig->DetectionByAffiliation.bDetectFriendlies = false;
	Perception->ConfigureSense(*SightConfig);

	// Hearing: 500 unit
	UAISenseConfig_Hearing* HearingConfig = CreateDefaultSubobject<UAISenseConfig_Hearing>(TEXT("HearingConfig"));
	HearingConfig->HearingRange = 500.f;
	HearingConfig->DetectionByAffiliation.bDetectEnemies = true;
	HearingConfig->DetectionByAffiliation.bDetectNeutrals = true;
	Perception->ConfigureSense(*HearingConfig);

	Perception->SetDominantSense(SightConfig->GetSenseImplementation());
	SetPerceptionComponent(*Perception);
}

void AEnemyAIController::OnPossess(APawn* InPawn)
{
	Super::OnPossess(InPawn);

	if (BehaviorTreeAsset)
	{
		RunBehaviorTree(BehaviorTreeAsset);
	}

	Perception->OnTargetPerceptionUpdated.AddDynamic(this, &AEnemyAIController::OnPerceptionUpdated);
}

void AEnemyAIController::OnPerceptionUpdated(AActor* Actor, FAIStimulus Stimulus)
{
	// Hanya react ke player (pawn ber-controller player)
	const APawn* SensedPawn = Cast<APawn>(Actor);
	if (!SensedPawn || !SensedPawn->IsPlayerControlled())
	{
		return;
	}

	if (Stimulus.WasSuccessfullySensed())
	{
		SetCombatTarget(Actor);
		if (!bHasAggro)
		{
			bHasAggro = true;
			AlertNearbyAllies(Actor);

			// Pacing director: aggro baru = input stress
			if (UPacingDirectorSubsystem* Pacing = GetWorld()->GetSubsystem<UPacingDirectorSubsystem>())
			{
				Pacing->ReportEnemyAggro(+1);
			}
		}
	}
	else
	{
		// Hilang dari pandangan → investigate posisi terakhir
		if (UBlackboardComponent* BB = GetBlackboardComponent())
		{
			BB->SetValueAsVector(BBKey_LastKnownLocation, Stimulus.StimulusLocation);
			BB->ClearValue(BBKey_TargetActor);
			BB->SetValueAsBool(BBKey_HasTarget, false);
		}
	}
}

void AEnemyAIController::SetCombatTarget(AActor* Target)
{
	if (UBlackboardComponent* BB = GetBlackboardComponent())
	{
		BB->SetValueAsObject(BBKey_TargetActor, Target);
		BB->SetValueAsBool(BBKey_HasTarget, Target != nullptr);
		if (Target)
		{
			BB->SetValueAsVector(BBKey_LastKnownLocation, Target->GetActorLocation());
		}
	}
}

void AEnemyAIController::AlertNearbyAllies(AActor* Target)
{
	TArray<AActor*> Allies;
	UGameplayStatics::GetAllActorsOfClass(GetWorld(), AEnemyBase::StaticClass(), Allies);

	const FVector MyLocation = GetPawn() ? GetPawn()->GetActorLocation() : FVector::ZeroVector;

	for (AActor* Ally : Allies)
	{
		if (Ally == GetPawn() || FVector::Dist(Ally->GetActorLocation(), MyLocation) > TeamAggroRadius)
		{
			continue;
		}
		if (AEnemyAIController* AllyController =
			Cast<AEnemyAIController>(Cast<APawn>(Ally)->GetController()))
		{
			AllyController->SetCombatTarget(Target);
		}
	}
}
