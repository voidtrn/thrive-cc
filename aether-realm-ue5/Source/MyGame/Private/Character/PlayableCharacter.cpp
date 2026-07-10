#include "Character/PlayableCharacter.h"
#include "MyGame.h"

APlayableCharacter::APlayableCharacter(const FObjectInitializer& ObjectInitializer)
	: Super(ObjectInitializer)
{
}

void APlayableCharacter::BeginPlay()
{
	// Load dulu sebelum Super — sama urutan dengan AEnemyBase::BeginPlay
	// (CurrentHP = MaxHP dari table saat ACharacterBase::BeginPlay jalan).
	LoadCharacterDefinition();
	Super::BeginPlay();
}

void APlayableCharacter::LoadCharacterDefinition()
{
	if (!StatsTable || CharacterRowName.IsNone())
	{
		return;
	}

	const FCharacterDefinitionRow* Row = StatsTable->FindRow<FCharacterDefinitionRow>(
		CharacterRowName, TEXT("CharacterStats"));
	if (!Row)
	{
		UE_LOG(LogAetherRealm, Warning, TEXT("Character definition row '%s' not found"), *CharacterRowName.ToString());
		return;
	}

	CachedDefinition = *Row;
	CharacterID = CharacterRowName;
	Element = Row->Element;
	WeaponType = Row->WeaponType;
	MaxHP = Row->BaseHP;
	ATK = Row->BaseATK;
	DEF = Row->BaseDEF;
	ElementalMastery = Row->BaseElementalMastery;
}
