#pragma once

#include "CoreMinimal.h"
#include "Subsystems/WorldSubsystem.h"
#include "EnemyRegistrySubsystem.generated.h"

class AEnemyBase;

/**
 * Enemy self-register di BeginPlay / unregister di EndPlay — pengganti
 * `GetAllActorsOfClass(AEnemyBase)`/`GetAllActorsWithTag("Enemy")` yang
 * dipanggil di banyak tempat (reaction AOE, plunge landing, lock-on, aggro
 * alert, cheat KillNearby). ANTISIPASI #5 di CODE_REVIEW.md: kedua fungsi
 * itu iterate SELURUH actor di world tiap panggil (filter tag/class terjadi
 * SETELAH scan penuh, bukan sebelum) — mahal kalau dipanggil sering
 * (plunge AOE, reaction tiap hit) & musuh/actor banyak. Registry ini O(1)
 * append/remove, list musuh hidup+mati-belum-destroyed langsung tersedia.
 *
 * Bukan soal tag hilang — `AEnemyBase` sudah auto-`Tags.Add("Enemy")` di
 * constructor (reliable), jadi ini murni optimisasi akses, bukan fix
 * korektnes.
 */
UCLASS()
class MYGAME_API UEnemyRegistrySubsystem : public UWorldSubsystem
{
	GENERATED_BODY()

public:
	void RegisterEnemy(AEnemyBase* Enemy);
	void UnregisterEnemy(AEnemyBase* Enemy);

	const TArray<TObjectPtr<AEnemyBase>>& GetAllEnemies() const { return Enemies; }

private:
	UPROPERTY()
	TArray<TObjectPtr<AEnemyBase>> Enemies;
};
