// Copyright StickmanImpact Project.

#include "HousingBuildComponent.h"
#include "RealmSubsystem.h"

UHousingBuildComponent::UHousingBuildComponent()
{
	PrimaryComponentTick.bCanEverTick = false;
}

URealmSubsystem* UHousingBuildComponent::GetRealm() const
{
	const UGameInstance* GameInstance = GetOwner() ? GetOwner()->GetGameInstance() : nullptr;
	return GameInstance ? GameInstance->GetSubsystem<URealmSubsystem>() : nullptr;
}

void UHousingBuildComponent::SelectFurniture(FName FurnitureID)
{
	SelectedFurnitureID = FurnitureID;
	GhostTransform = FTransform::Identity;
}

FVector UHousingBuildComponent::SnapToGrid(const FVector& Location) const
{
	if (!bGridSnap)
	{
		return Location;
	}
	return FVector(
		FMath::GridSnap(Location.X, GridSize),
		FMath::GridSnap(Location.Y, GridSize),
		Location.Z);
}

void UHousingBuildComponent::SetGhostLocation(FVector WorldLocation)
{
	GhostTransform.SetLocation(SnapToGrid(WorldLocation));
}

void UHousingBuildComponent::RotateGhost(float DeltaYaw)
{
	const float Step = bGridSnap ? RotationStep : DeltaYaw;
	FRotator Rotation = GhostTransform.Rotator();
	Rotation.Yaw += (DeltaYaw >= 0.f ? Step : -Step);
	GhostTransform.SetRotation(Rotation.Quaternion());
}

void UHousingBuildComponent::ScaleGhost(float DeltaScale)
{
	const float NewScale = FMath::Clamp(GhostTransform.GetScale3D().X + DeltaScale, MinScale, MaxScale);
	GhostTransform.SetScale3D(FVector(NewScale));
}

void UHousingBuildComponent::ElevateGhost(float DeltaZ)
{
	FVector Location = GhostTransform.GetLocation();
	Location.Z += DeltaZ;
	GhostTransform.SetLocation(Location);
}

bool UHousingBuildComponent::OverlapsExisting(const FTransform& Transform) const
{
	const URealmSubsystem* Realm = GetRealm();
	if (!Realm)
	{
		return false;
	}
	for (const FPlacedFurniture& Piece : Realm->GetPlacedFurniture())
	{
		if (FVector::Dist(Piece.Transform.GetLocation(), Transform.GetLocation()) < CollisionCheckRadius)
		{
			return true;
		}
	}
	return false;
}

int32 UHousingBuildComponent::ConfirmPlacement()
{
	URealmSubsystem* Realm = GetRealm();
	if (!Realm || SelectedFurnitureID.IsNone() || OverlapsExisting(GhostTransform))
	{
		return -1;
	}

	FPlacedFurniture Piece;
	Piece.FurnitureID = SelectedFurnitureID;
	Piece.Transform = GhostTransform;

	const int32 Index = Realm->AddPlacedFurniture(Piece);

	UndoStack.Add({ true, Piece });
	if (UndoStack.Num() > HistoryLimit)
	{
		UndoStack.RemoveAt(0);
	}
	RedoStack.Empty();

	OnPlacementChanged.Broadcast(Realm->GetPlacedFurniture().Num());
	return Index;
}

bool UHousingBuildComponent::Undo()
{
	URealmSubsystem* Realm = GetRealm();
	if (!Realm || UndoStack.Num() == 0)
	{
		return false;
	}

	FBuildAction Action = UndoStack.Pop();
	if (Action.bWasAdd)
	{
		// Undo an add = remove the last matching placement.
		const TArray<FPlacedFurniture>& Placed = Realm->GetPlacedFurniture();
		for (int32 Index = Placed.Num() - 1; Index >= 0; --Index)
		{
			if (Placed[Index].FurnitureID == Action.Piece.FurnitureID
				&& Placed[Index].Transform.GetLocation().Equals(Action.Piece.Transform.GetLocation()))
			{
				Realm->RemovePlacedFurniture(Index);
				break;
			}
		}
	}
	RedoStack.Add(Action);
	OnPlacementChanged.Broadcast(Realm->GetPlacedFurniture().Num());
	return true;
}

bool UHousingBuildComponent::Redo()
{
	URealmSubsystem* Realm = GetRealm();
	if (!Realm || RedoStack.Num() == 0)
	{
		return false;
	}

	FBuildAction Action = RedoStack.Pop();
	if (Action.bWasAdd)
	{
		Realm->AddPlacedFurniture(Action.Piece);
	}
	UndoStack.Add(Action);
	OnPlacementChanged.Broadcast(Realm->GetPlacedFurniture().Num());
	return true;
}
