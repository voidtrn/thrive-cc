#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "System/DialogueTypes.h"
#include "DialogueManager.generated.h"

class UDataTable;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnDialogueNodeChanged, FName, NodeID, const FDialogueNode&, Node);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnDialogueEnded);

/**
 * Dialogue engine — jalan di atas DataTable FDialogueNode.
 * UI (WBP_Dialogue) bind OnDialogueNodeChanged: render portrait/text/choices,
 * lalu panggil Advance() (klik/auto-play) atau SelectChoice(index).
 * Input context Dialog: UI yang set PC->SetInputContextMode saat start/end.
 */
UCLASS()
class MYGAME_API UDialogueManager : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	/** Mulai percakapan dari node. Return false kalau node tidak ada. */
	UFUNCTION(BlueprintCallable, Category = "Dialogue")
	bool StartDialogue(UDataTable* DialogueTable, FName StartNodeID);

	/** Lanjut via NextNodeID. Node tanpa next & tanpa choice = selesai. */
	UFUNCTION(BlueprintCallable, Category = "Dialogue")
	void Advance();

	/** Pilih choice (index dari GetAvailableChoices). */
	UFUNCTION(BlueprintCallable, Category = "Dialogue")
	void SelectChoice(int32 ChoiceIndex);

	/** Skip: langsung akhiri percakapan (actions node berjalan tetap dihormati). */
	UFUNCTION(BlueprintCallable, Category = "Dialogue")
	void EndDialogue();

	/** Choices node sekarang yang lolos condition. */
	UFUNCTION(BlueprintPure, Category = "Dialogue")
	TArray<FDialogueChoice> GetAvailableChoices() const;

	UFUNCTION(BlueprintPure, Category = "Dialogue")
	bool IsDialogueActive() const { return ActiveTable != nullptr; }

	UFUNCTION(BlueprintPure, Category = "Dialogue")
	FDialogueNode GetCurrentNode() const { return CurrentNode; }

	UPROPERTY(BlueprintAssignable, Category = "Dialogue")
	FOnDialogueNodeChanged OnDialogueNodeChanged;

	UPROPERTY(BlueprintAssignable, Category = "Dialogue")
	FOnDialogueEnded OnDialogueEnded;

protected:
	bool EnterNode(FName NodeID);
	bool CheckCondition(const FDialogueCondition& Condition) const;
	void ExecuteActions(const TArray<FDialogueAction>& Actions);

private:
	UPROPERTY()
	TObjectPtr<UDataTable> ActiveTable;

	FName CurrentNodeID;
	FDialogueNode CurrentNode;
};
