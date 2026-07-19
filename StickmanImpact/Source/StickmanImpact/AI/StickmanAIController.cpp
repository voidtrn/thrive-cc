// Copyright StickmanImpact Project.

#include "StickmanAIController.h"
#include "StickmanAITypes.h"
#include "Enemies/StickmanEnemyCharacter.h"
#include "World/EnemySpawner.h"
#include "BehaviorTree/BehaviorTree.h"
#include "BehaviorTree/BlackboardComponent.h"
#include "Perception/AIPerceptionComponent.h"
#include "Perception/AISenseConfig_Sight.h"
#include "Perception/AISenseConfig_Hearing.h"
#include "Perception/AISense_Sight.h"
#include "Perception/AISense_Hearing.h"

AStickmanAIController::AStickmanAIController()
{
	AIPerception = CreateDefaultSubobject<UAIPerceptionComponent>(TEXT("PerceptionComponent"));

	SightConfig = CreateDefaultSubobject<UAISenseConfig_Sight>(TEXT("SightConfig"));
	SightConfig->SightRadius = SightRadius;
	SightConfig->LoseSightRadius = LoseSightRadius;
	SightConfig->PeripheralVisionAngleDegrees = SightAngleDegrees;
	SightConfig->DetectionByAffiliation.bDetectEnemies = true;
	SightConfig->DetectionByAffiliation.bDetectNeutrals = true;
	SightConfig->DetectionByAffiliation.bDetectFriendlies = true;

	UAISenseConfig_Hearing* HearingConfig = CreateDefaultSubobject<UAISenseConfig_Hearing>(TEXT("HearingConfig"));
	HearingConfig->HearingRange = 2500.f;
	HearingConfig->DetectionByAffiliation.bDetectEnemies = true;
	HearingConfig->DetectionByAffiliation.bDetectNeutrals = true;
	HearingConfig->DetectionByAffiliation.bDetectFriendlies = true;

	AIPerception->ConfigureSense(*SightConfig);
	AIPerception->ConfigureSense(*HearingConfig);
	AIPerception->SetDominantSense(SightConfig->GetSenseImplementation());
	SetPerceptionComponent(*AIPerception);
}

void AStickmanAIController::OnPossess(APawn* InPawn)
{
	Super::OnPossess(InPawn);

	if (!BehaviorTree)
	{
		return;
	}

	UBlackboardComponent* BlackboardComp = nullptr;
	UseBlackboard(BehaviorTree->BlackboardAsset, BlackboardComp);
	if (BlackboardComp)
	{
		BlackboardComp->SetValueAsEnum(StickmanBlackboardKeys::CurrentState, static_cast<uint8>(EEnemyCombatState::Patrol));
		BlackboardComp->SetValueAsFloat(StickmanBlackboardKeys::AlertLevel, 0.f);
	}
	RunBehaviorTree(BehaviorTree);

	AIPerception->OnTargetPerceptionUpdated.AddDynamic(this, &AStickmanAIController::HandlePerceptionUpdated);
}

void AStickmanAIController::HandlePerceptionUpdated(AActor* Actor, FAIStimulus Stimulus)
{
	if (!Blackboard || !Actor)
	{
		return;
	}

	// Hearing only makes the enemy Suspicious (investigate the noise) — sight escalates to Combat.
	if (Stimulus.Type == UAISense::GetSenseID<UAISense_Hearing>())
	{
		if (Stimulus.WasSuccessfullySensed()
			&& Blackboard->GetValueAsEnum(StickmanBlackboardKeys::CurrentState)
				== static_cast<uint8>(EEnemyCombatState::Patrol))
		{
			Blackboard->SetValueAsVector(StickmanBlackboardKeys::TargetLocation, Stimulus.StimulusLocation);
			Blackboard->SetValueAsEnum(StickmanBlackboardKeys::CurrentState,
				static_cast<uint8>(EEnemyCombatState::Suspicious));
			Blackboard->SetValueAsFloat(StickmanBlackboardKeys::AlertLevel, 0.5f);
		}
		return;
	}

	if (Stimulus.WasSuccessfullySensed())
	{
		Blackboard->SetValueAsObject(StickmanBlackboardKeys::TargetActor, Actor);
		Blackboard->SetValueAsVector(StickmanBlackboardKeys::TargetLocation, Actor->GetActorLocation());
		Blackboard->SetValueAsEnum(StickmanBlackboardKeys::CurrentState, static_cast<uint8>(EEnemyCombatState::Combat));
		Blackboard->SetValueAsFloat(StickmanBlackboardKeys::AlertLevel, 1.f);

		if (!bHasNotifiedCombatEntry)
		{
			bHasNotifiedCombatEntry = true;
			if (AStickmanEnemyCharacter* Enemy = Cast<AStickmanEnemyCharacter>(GetPawn()))
			{
				if (AEnemySpawner* Spawner = Cast<AEnemySpawner>(Enemy->SpawningSpawner))
				{
					Spawner->NotifyEnemyEnteredCombat(Enemy, Actor);
				}
			}
		}
	}
	else if (Blackboard->GetValueAsObject(StickmanBlackboardKeys::TargetActor) == Actor)
	{
		// Lost sight of our current target — drop back to Alert (investigate last known
		// location) rather than snapping straight back to Patrol.
		Blackboard->SetValueAsEnum(StickmanBlackboardKeys::CurrentState, static_cast<uint8>(EEnemyCombatState::Alert));
		bHasNotifiedCombatEntry = false;
	}
}
