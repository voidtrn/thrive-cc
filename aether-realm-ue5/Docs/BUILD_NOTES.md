# Build Notes & Code Audit

Catatan jujur soal kondisi kode + hasil audit. Baca sebelum build pertama.

## Status kode

- **~92 file C++, belum pernah di-compile** di UE (environment penulisan
  tidak punya Unreal Engine). Ditulis mengikuti API UE 5.4 dengan teliti +
  di-audit manual, tapi **harapkan beberapa error kecil di build pertama**
  (include lupa, signature minor). Normal untuk codebase sebesar ini.
- Asset (`.uasset`/`.umap`) belum ada — dibuat di editor per `Docs/PHASE*`.

## Module dependencies (`MyGame.Build.cs`)

Sudah terdaftar: Core, CoreUObject, Engine, InputCore, EnhancedInput,
GameplayTags, GameplayAbilities, GameplayTasks, UMG, Niagara, NetCore,
AnimGraphRuntime, AIModule, NavigationSystem, OnlineSubsystem,
OnlineSubsystemUtils, Slate, SlateCore.

Plugin (`.uproject`): EnhancedInput, Niagara, Water, GameplayAbilities,
ModelingTools, OnlineSubsystem(+Steam), MotionWarping.

## Audit yang sudah dilakukan (+ fix)

| Cek | Hasil |
|---|---|
| Semua `AddDynamic` handler = `UFUNCTION()` | ✅ 9/9 |
| File replikasi include `Net/UnrealNetwork.h` | ✅ 4/4 |
| `.generated.h` paling akhir di tiap header | ✅ semua |
| Module deps vs pemakaian | ✅ cocok |
| Struct tidak dobel-definisi (FTalentLevels/FDerivedStats) | ✅ |
| **Duplicate `const` di QuestManager** | 🔧 **FIXED** (compile error MSVC/Clang) |
| **AbilityBase `GetWorld()` null di instanced UObject** → cooldown diabaikan | 🔧 **FIXED** (override GetWorld via outer) |
| **Recalculate menimpa buff aktif** → stat jatuh saat buff expire | 🔧 **FIXED** (ReapplyActiveBuffs) |

## Known limitations (by design, bukan bug)

1. **Stat sebagai float polos, belum GAS AttributeSet.** ASC sudah terpasang
   di CharacterBase untuk migrasi mulus. Buff/debuff stacking kompleks →
   pindah ke AttributeSet nanti.
2. **Climb custom movement belum punya `FSavedMove`** untuk network
   prediction. Single-player OK; co-op penuh perlu tambahan ini.
3. **Damage number `WidgetComponent->GetWidget()`** bisa null 1 frame
   setelah spawn (di-guard, tidak crash). Kalau angka tidak muncul, panggil
   `InitWidget()` sebelum GetWidget.
4. **IAP Steam** butuh backend server (ISteamMicroTxn) — di luar scope client.

(Set bonus artifact 2/4-piece: SUDAH diimplementasi via `ApplySetBonuses` +
`DT_ArtifactSets` — lihat PHASE10.)

## Automation Tests

`Source/MyGame/Private/Tests/` — unit test formula murni (guard
`WITH_AUTOMATION_TESTS`, aktif di build editor/development):
- `DamageCalculatorTest.cpp` — DefReduction, ResMultiplier, EM bonus
- `WishSystemTest.cpp` — fate cost (beginner diskon), fate type per banner

Jalankan: Editor → **Tools → Session Frontend → Automation** → filter
`AetherRealm` → Start Tests. Ini memvalidasi math tanpa perlu main game —
berguna untuk memastikan formula benar setelah edit.

## Urutan build pertama

1. Generate VS project files (klik kanan `.uproject`)
2. Build **Development Editor** di VS
3. Error muncul → fix satu per satu (biasanya include atau forward-declare).
   Baca error PERTAMA dulu, sering menyelesaikan yang lain.
4. Editor kebuka → ikuti `Docs/PHASE1_SETUP.md` dst untuk asset.

## Kalau minta bantuan fix compile error

Sertakan: teks error lengkap dari Output Log + nama file:baris. Error UE
biasanya jelas (missing include, unresolved external, dll).
