// Copyright StickmanImpact Project.

#include "MoralitySubsystem.h"

void UMoralitySubsystem::RecordAction(EMoralityAction Action)
{
	if (const FVector2D* Deltas = ActionDeltas.Find(Action))
	{
		AddMorality(Deltas->X, Deltas->Y);
	}
}

void UMoralitySubsystem::AddMorality(float CompassionDelta, float OrderDelta)
{
	Compassion = FMath::Clamp(Compassion + CompassionDelta, -100.f, 100.f);
	Order = FMath::Clamp(Order + OrderDelta, -100.f, 100.f);
	OnMoralityChanged.Broadcast(Compassion, Order);

	const EMoralityQuadrant NewQuadrant = GetQuadrant();
	if (NewQuadrant != LastQuadrant)
	{
		LastQuadrant = NewQuadrant;
		OnQuadrantChanged.Broadcast(NewQuadrant);
	}
}

EMoralityQuadrant UMoralitySubsystem::GetQuadrant() const
{
	if (FMath::Abs(Compassion) < NeutralBand && FMath::Abs(Order) < NeutralBand)
	{
		return EMoralityQuadrant::Neutral;
	}
	if (Compassion >= 0.f)
	{
		return Order >= 0.f ? EMoralityQuadrant::Paragon : EMoralityQuadrant::Rebel;
	}
	return Order >= 0.f ? EMoralityQuadrant::Judge : EMoralityQuadrant::Anarchist;
}

float UMoralitySubsystem::GetTransformIntensity() const
{
	// Distance from center normalized to the corner (100,100).
	return FMath::Clamp(FVector2D(Compassion, Order).Size() / FVector2D(100.f, 100.f).Size(), 0.f, 1.f);
}

bool UMoralitySubsystem::MeetsRequirement(EMoralityQuadrant RequiredQuadrant, float MinIntensity) const
{
	return GetQuadrant() == RequiredQuadrant && GetTransformIntensity() >= MinIntensity;
}

void UMoralitySubsystem::ImportSaveState(float InCompassion, float InOrder)
{
	Compassion = InCompassion;
	Order = InOrder;
	LastQuadrant = GetQuadrant();
}
