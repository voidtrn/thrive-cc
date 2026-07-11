#pragma once

#include "CoreMinimal.h"
#include "Kismet/BlueprintFunctionLibrary.h"
#include "StarterContentLibrary.generated.h"

class UQuestDataAsset;
class UDataTable;

/**
 * Konten prolog Aether Realm ("Tremors in Duskvale" → "The Stormchaser's
 * Warning") — dibangun murni via NewObject/AddRow di C++, bukan Data
 * Asset/DataTable editor. Tujuannya: quest+dialogue nyata yang testable dan
 * jalan tanpa Unreal Editor (lihat CLAUDE.md ground truth — repo ini belum
 * pernah di-compile, apalagi diedit di UE).
 *
 * BP masih bisa nambah quest/dialogue lain lewat jalur normal (Data Asset di
 * Content/Data/Quests, DataTable di Content/Data/Dialogues) — fungsi di sini
 * cuma nyuntik starter content, tidak menggantikan alur editor Phase 6.
 *
 * World-building ringan (belum ada dokumen lore project ini sebelumnya):
 * region starter = "Duskvale". Hook plot = anomali Elemental Resonance
 * (nyambung ke UResonanceComponent yang sudah ada) — Kagari investigasi,
 * ketemu Yukine (scholar) lalu Shiden (vanguard) yang udah lebih dulu
 * ngelacak gangguan serupa.
 */
UCLASS()
class MYGAME_API UStarterContentLibrary : public UBlueprintFunctionLibrary
{
	GENERATED_BODY()

public:
	/** Dua quest prolog, chained via Prerequisites + bAutoStart. */
	UFUNCTION(BlueprintCallable, Category = "Content|Starter")
	static TArray<UQuestDataAsset*> BuildPrologueQuests(UObject* Outer);

	/** Dialogue Yukine — dipicu step TalkToNPC quest 1 (TargetID "NPC_Yukine"). */
	UFUNCTION(BlueprintCallable, Category = "Content|Starter")
	static UDataTable* BuildYukineIntroDialogue(UObject* Outer);

	/** Dialogue Shiden — dipicu step TalkToNPC quest 2 (TargetID "NPC_Shiden"). */
	UFUNCTION(BlueprintCallable, Category = "Content|Starter")
	static UDataTable* BuildShidenIntroDialogue(UObject* Outer);

	static const FName Quest1_ID;
	static const FName Quest2_ID;
};
