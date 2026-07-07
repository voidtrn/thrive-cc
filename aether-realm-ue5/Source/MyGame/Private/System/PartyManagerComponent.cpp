#include "System/PartyManagerComponent.h"
#include "System/OpenWorldGameInstance.h"
#include "System/OpenWorldPlayerState.h"
#include "Character/CharacterBase.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Engine/DataTable.h"
#include "GameFramework/PlayerController.h"
#include "MyGame.h"

APlayerController* UPartyManagerComponent::GetPC() const
{
	return Cast<APlayerController>(GetOwner());
}

int32 UPartyManagerComponent::GetPartySize() const
{
	const UOpenWorldGameInstance* GI = GetOwner()->GetGameInstance<UOpenWorldGameInstance>();
	return GI ? GI->SavedPartyCharacterIds.Num() : 0;
}

FName UPartyManagerComponent::GetSlotCharacterId(int32 Index) const
{
	const UOpenWorldGameInstance* GI = GetOwner()->GetGameInstance<UOpenWorldGameInstance>();
	return (GI && GI->SavedPartyCharacterIds.IsValidIndex(Index))
		? GI->SavedPartyCharacterIds[Index]
		: NAME_None;
}

bool UPartyManagerComponent::GetSlotDef(int32 Index, FCharacterDefRow& OutDef) const
{
	const FName CharacterId = GetSlotCharacterId(Index);
	if (!CharacterTable || CharacterId.IsNone())
	{
		return false;
	}
	if (const FCharacterDefRow* Row = CharacterTable->FindRow<FCharacterDefRow>(CharacterId, TEXT("Party")))
	{
		OutDef = *Row;
		return true;
	}
	return false;
}

void UPartyManagerComponent::InitializeParty()
{
	UOpenWorldGameInstance* GI = GetOwner()->GetGameInstance<UOpenWorldGameInstance>();
	APlayerController* PC = GetPC();
	if (!GI || !PC)
	{
		return;
	}

	ActiveSlot = FMath::Clamp(GI->SavedActiveCharacterIndex, 0, FMath::Max(0, GetPartySize() - 1));

	// Pakai transform pawn default (dari PlayerStart) kalau ada
	FTransform SpawnTransform = PC->GetPawn()
		? PC->GetPawn()->GetActorTransform()
		: GI->LastOpenWorldTransform;

	if (ACharacterBase* NewCharacter = SpawnCharacterForSlot(ActiveSlot, SpawnTransform))
	{
		APawn* OldPawn = PC->GetPawn();
		PC->Possess(NewCharacter);
		if (OldPawn)
		{
			OldPawn->Destroy();
		}
		RestoreCharacterState(NewCharacter, GetSlotCharacterId(ActiveSlot));
		OnPartySwapped.Broadcast(ActiveSlot, NewCharacter);
	}
}

bool UPartyManagerComponent::SwapToSlot(int32 Index)
{
	APlayerController* PC = GetPC();
	UOpenWorldGameInstance* GI = GetOwner()->GetGameInstance<UOpenWorldGameInstance>();
	if (!PC || !GI || Index == ActiveSlot || !GI->SavedPartyCharacterIds.IsValidIndex(Index))
	{
		return false;
	}

	const double Now = GetWorld()->GetTimeSeconds();
	if (Now - LastSwapTime < SwapCooldown)
	{
		return false;
	}

	// Karakter target mati? (HP tersimpan 0)
	const FName TargetId = GetSlotCharacterId(Index);
	for (const FCharacterSaveData& Data : GI->PartyCharacterData)
	{
		if (Data.CharacterId == TargetId && Data.CurrentHP == 0.f)
		{
			return false; // mati — revive dulu di statue
		}
	}

	ACharacterBase* OldCharacter = Cast<ACharacterBase>(PC->GetPawn());
	if (!OldCharacter)
	{
		return false;
	}

	const FTransform Transform = OldCharacter->GetActorTransform();
	const FVector Velocity = OldCharacter->GetVelocity();

	ACharacterBase* NewCharacter = SpawnCharacterForSlot(Index, Transform);
	if (!NewCharacter)
	{
		return false;
	}

	SaveCurrentCharacterState(OldCharacter);

	PC->Possess(NewCharacter);
	NewCharacter->GetCharacterMovement()->Velocity = Velocity; // swap di udara tetap smooth
	OldCharacter->Destroy();

	RestoreCharacterState(NewCharacter, TargetId);

	ActiveSlot = Index;
	LastSwapTime = Now;
	GI->SavedActiveCharacterIndex = Index;

	// Replikasi ke server (co-op ready)
	if (AOpenWorldPlayerState* PS = PC->GetPlayerState<AOpenWorldPlayerState>())
	{
		PS->ServerSetActiveCharacter(Index);
	}

	OnPartySwapped.Broadcast(Index, NewCharacter);
	return true;
}

ACharacterBase* UPartyManagerComponent::SpawnCharacterForSlot(int32 Index, const FTransform& Transform)
{
	FCharacterDefRow Def;
	if (!GetSlotDef(Index, Def) || !Def.CharacterClass)
	{
		UE_LOG(LogAetherRealm, Warning, TEXT("Party slot %d: character class missing"), Index);
		return nullptr;
	}

	FActorSpawnParameters Params;
	Params.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
	return GetWorld()->SpawnActor<ACharacterBase>(Def.CharacterClass, Transform, Params);
}

void UPartyManagerComponent::SaveCurrentCharacterState(ACharacterBase* Character)
{
	UOpenWorldGameInstance* GI = GetOwner()->GetGameInstance<UOpenWorldGameInstance>();
	if (!GI || !Character)
	{
		return;
	}

	FCharacterSaveData* Data = GI->PartyCharacterData.FindByPredicate(
		[&](const FCharacterSaveData& D) { return D.CharacterId == Character->CharacterID; });
	if (!Data)
	{
		Data = &GI->PartyCharacterData.AddDefaulted_GetRef();
		Data->CharacterId = Character->CharacterID;
	}

	Data->CurrentHP = Character->CurrentHP;
	Data->CurrentEnergy = Character->CurrentEnergy;
	Data->Level = Character->Level;
	Data->Ascension = Character->Ascension;
}

void UPartyManagerComponent::RestoreCharacterState(ACharacterBase* Character, FName CharacterId)
{
	const UOpenWorldGameInstance* GI = GetOwner()->GetGameInstance<UOpenWorldGameInstance>();
	if (!GI || !Character)
	{
		return;
	}

	const FCharacterSaveData* Data = GI->PartyCharacterData.FindByPredicate(
		[&](const FCharacterSaveData& D) { return D.CharacterId == CharacterId; });
	if (!Data)
	{
		return; // pertama kali — pakai default (full HP dari BeginPlay)
	}

	if (Data->CurrentHP >= 0.f)
	{
		Character->CurrentHP = FMath::Min(Data->CurrentHP, Character->MaxHP);
	}
	// Clamp: off-field energy (60% gain) bisa melebihi MaxEnergy karakter
	Character->CurrentEnergy = FMath::Min(Data->CurrentEnergy, Character->MaxEnergy);
	Character->Level = Data->Level;
	Character->Ascension = Data->Ascension;
}
