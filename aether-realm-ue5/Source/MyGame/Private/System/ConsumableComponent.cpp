#include "System/ConsumableComponent.h"
#include "System/ConsumableTypes.h"
#include "System/OpenWorldGameInstance.h"
#include "Character/CharacterBase.h"
#include "Combat/BuffComponent.h"
#include "Engine/DataTable.h"
#include "MyGame.h"

void UConsumableComponent::BeginPlay()
{
	Super::BeginPlay();
	OwnerChar = Cast<ACharacterBase>(GetOwner());
}

UOpenWorldGameInstance* UConsumableComponent::GetGI() const
{
	return GetOwner() ? GetOwner()->GetGameInstance<UOpenWorldGameInstance>() : nullptr;
}

bool UConsumableComponent::UseConsumable(FName ItemId)
{
	UOpenWorldGameInstance* GI = GetGI();
	if (!GI || !ConsumableTable || !OwnerChar)
	{
		return false;
	}

	// Punya barangnya?
	int32* Count = GI->InventoryItems.Find(ItemId);
	if (!Count || *Count <= 0)
	{
		return false;
	}

	const FConsumableDefRow* Def = ConsumableTable->FindRow<FConsumableDefRow>(ItemId, TEXT("Consumable"));
	if (!Def)
	{
		return false;
	}

	// Terapkan efek
	switch (Def->Effect)
	{
	case EConsumableEffect::Heal:
		if (!OwnerChar->IsAlive()) return false;
		OwnerChar->Heal(Def->Magnitude);
		break;

	case EConsumableEffect::HealPercent:
		if (!OwnerChar->IsAlive()) return false;
		OwnerChar->Heal(OwnerChar->MaxHP * Def->Magnitude);
		break;

	case EConsumableEffect::Revive:
		// Revive hanya untuk karakter mati
		if (OwnerChar->IsAlive()) return false;
		OwnerChar->CurrentHP = OwnerChar->MaxHP * FMath::Max(0.1f, Def->Magnitude);
		OwnerChar->OnHealthChanged.Broadcast(OwnerChar->CurrentHP, OwnerChar->MaxHP);
		break;

	case EConsumableEffect::StatBuff:
		if (!OwnerChar->IsAlive()) return false;
		if (UBuffComponent* Buff = OwnerChar->FindComponentByClass<UBuffComponent>())
		{
			Buff->ApplyBuff(ItemId, Def->BuffStat, Def->BuffDelta, Def->BuffDuration);
		}
		break;
	}

	// Kurangi 1
	*Count -= 1;
	if (*Count <= 0)
	{
		GI->InventoryItems.Remove(ItemId);
	}

	UE_LOG(LogAetherRealm, Log, TEXT("Consumed %s"), *ItemId.ToString());
	return true;
}

bool UConsumableComponent::CanCook(FName ItemId) const
{
	const UOpenWorldGameInstance* GI = GetGI();
	if (!GI || !ConsumableTable)
	{
		return false;
	}

	const FConsumableDefRow* Def = ConsumableTable->FindRow<FConsumableDefRow>(ItemId, TEXT("Cook"));
	if (!Def || Def->Recipe.IsEmpty())
	{
		return false;
	}

	for (const auto& Ingredient : Def->Recipe)
	{
		const int32* Have = GI->InventoryItems.Find(Ingredient.Key);
		if (!Have || *Have < Ingredient.Value)
		{
			return false;
		}
	}
	return true;
}

bool UConsumableComponent::CookItem(FName ItemId)
{
	if (!CanCook(ItemId))
	{
		OnItemCooked.Broadcast(ItemId, false);
		return false;
	}

	UOpenWorldGameInstance* GI = GetGI();
	const FConsumableDefRow* Def = ConsumableTable->FindRow<FConsumableDefRow>(ItemId, TEXT("Cook"));

	// Kurangi bahan
	for (const auto& Ingredient : Def->Recipe)
	{
		int32& Have = GI->InventoryItems.FindChecked(Ingredient.Key);
		Have -= Ingredient.Value;
		if (Have <= 0)
		{
			GI->InventoryItems.Remove(Ingredient.Key);
		}
	}

	// Tambah hasil
	GI->InventoryItems.FindOrAdd(ItemId) += 1;

	OnItemCooked.Broadcast(ItemId, true);
	UE_LOG(LogAetherRealm, Log, TEXT("Cooked %s"), *ItemId.ToString());
	return true;
}
