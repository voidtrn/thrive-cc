#include "System/OpenWorldPlayerState.h"
#include "Net/UnrealNetwork.h"
#include "MyGame.h"

void AOpenWorldPlayerState::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
	Super::GetLifetimeReplicatedProps(OutLifetimeProps);
	DOREPLIFETIME(AOpenWorldPlayerState, PartyCharacterIds);
	DOREPLIFETIME(AOpenWorldPlayerState, ActiveCharacterIndex);
}

FName AOpenWorldPlayerState::GetActiveCharacterId() const
{
	return PartyCharacterIds.IsValidIndex(ActiveCharacterIndex)
		? PartyCharacterIds[ActiveCharacterIndex]
		: NAME_None;
}

void AOpenWorldPlayerState::ServerSetActiveCharacter_Implementation(int32 NewIndex)
{
	if (!PartyCharacterIds.IsValidIndex(NewIndex) || NewIndex == ActiveCharacterIndex)
	{
		return;
	}

	// Phase 2: cek cooldown swap & karakter tidak mati di sini.
	ActiveCharacterIndex = NewIndex;
	OnRep_ActiveCharacterIndex(); // server broadcast juga
}

void AOpenWorldPlayerState::SetPartyCharacterIds(const TArray<FName>& NewParty)
{
	if (!HasAuthority())
	{
		UE_LOG(LogAetherRealm, Warning, TEXT("SetPartyCharacterIds called without authority"));
		return;
	}

	PartyCharacterIds = NewParty;
	ActiveCharacterIndex = FMath::Clamp(ActiveCharacterIndex, 0, FMath::Max(0, PartyCharacterIds.Num() - 1));
}

void AOpenWorldPlayerState::OnRep_ActiveCharacterIndex()
{
	OnActiveCharacterChanged.Broadcast(ActiveCharacterIndex);
}
