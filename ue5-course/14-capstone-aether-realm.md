# Modul 14 — 🏆 CAPSTONE: Membedah Project `aether-realm-ue5`

**Target:** membaca project open world RPG sungguhan di repo ini, menjalankannya,
dan memodifikasinya. Semua modul 1-13 dipakai di sini.

## 1. Peta: modul course → kode project

| Kamu belajar di modul | Di project jadi |
|---|---|
| 03-04 BP & komunikasi | Delegate/dispatcher di semua sistem (`OnDamageDealt`, `OnReactionTriggered`) |
| 05 Material | `MF_CelShading`, `M_Character_Anime` ([PHASE2](../aether-realm-ue5/Docs/PHASE2_SETUP.md)) |
| 06 Enhanced Input | 22 IA + 5 IMC + switch context (`OpenWorldPlayerController`) |
| 07 Animasi | `UCharacterAnimInstance` + montage combo + anim notify |
| 08 Trace & damage & UMG | `UCombatComponent::DoHitTrace` + `DealDamage` + `UDamageNumberWidget` |
| 09 Landscape & WP | Landscape 1km² 128m cell ([PHASE1](../aether-realm-ue5/Docs/PHASE1_SETUP.md)) |
| 10 C++ | Seluruh `Source/MyGame/` (~75 class) |
| 11 Framework/Data/Save | GameMode dkk + `DT_*` + `UOpenWorldSaveGame` + subsystem |
| 12 Niagara & audio | `AVFXManager`, `UFootstepComponent`, `UMusicManagerSubsystem` |
| 13 Optimasi & build | Config renderer + `Scripts/BuildSteam.bat` |

## 2. Menjalankan project

1. Butuh: UE 5.4 + Visual Studio (modul 10).
2. Clone repo → klik kanan `aether-realm-ue5/MyGame.uproject` →
   **Generate Visual Studio project files**.
3. Buka `MyGame.sln` → configuration `Development Editor` → `Ctrl+B` (build)
   → buka `.uproject`.
4. Ikuti `Docs/PHASE1_SETUP.md` bagian editor (bikin level, input assets) —
   sekarang kamu paham SEMUA istilahnya.

## 3. Tur kode — urutan baca yang disarankan

```
Source/MyGame/Public/
1. System/OpenWorldGameMode.h      ← mulai: framework (modul 11)
2. Character/CharacterBase.h       ← karakter: stats, kamera (modul 6)
3. Character/OpenWorldMovementComponent.h  ← sprint/glide/climb
4. Combat/CombatComponent.h        ← combo/dodge/damage pipeline (modul 8)
5. Combat/ElementalReactionSubsystem.h     ← sistem reaksi elemen
6. System/QuestManager.h           ← quest engine (modul 11 pattern)
7. System/WishSystem.h             ← gacha math
```

Cara baca class C++ (resep):
1. Baca komentar atas class (semua class project ini ada penjelasannya)
2. Scan `UPROPERTY` — "data apa yang dia punya"
3. Scan `UFUNCTION` — "dia bisa apa"
4. Baru buka `.cpp` untuk function yang bikin penasaran

## 4. 🔨 MISI — dari mudah ke berat

**Misi 1 (mudah): tweak angka.**
Buka `OpenWorldMovementComponent.h` → ubah `SprintSpeed` 800 → 1200,
`JumpZVelocity` di cpp 620 → 900. Build, rasakan. Balikin via BP child
(cara benar: jangan edit C++ untuk tuning — override di BP).

**Misi 2 (mudah): tambah reaction color.**
`UDamageNumberWidget::GetElementColor` — ganti warna Pyro jadi lebih merah.
Kamu baru saja edit C++ project sungguhan.

**Misi 3 (sedang): elemen di combo.**
`UCombatComponent` constructor: combo hit ke-4 pakai `EHitTraceShape::Line`.
Ubah jadi Sphere radius 150 → build → hit terakhir jadi AOE kecil.

**Misi 4 (sedang): ability BP pertama.**
Ikuti `Docs/PHASE3_SETUP.md` — bikin `BA_TestFireball` (child `UAbilityBase`),
implement `OnActivate`: spawn projectile BP sederhana (sphere + ProjectileMovement
+ overlap → `DealDamage` dengan `FAttackParams` Pyro). Skill E pertamamu.

**Misi 5 (berat): sistem baru — Dash Attack.**
Desain sendiri: dodge + attack dalam 0.2s = dash attack (damage 2×, maju 500).
Petunjuk: `UCombatComponent` — simpan `LastDodgeTime`, cek di `TryNormalAttack`.
Ini level "super hero": memperluas sistem orang lain tanpa merusaknya.

**Misi 6 (berat): fitur milikmu.**
Pilih satu dari `Docs/` yang belum ada C++-nya (mis. talent level-up,
fishing, mount) → desain → tulis → PR ke repo-mu sendiri.

## 5. Setelah course ini

- Ulangi misi 4-6 sampai nyaman — kemampuan **membaca kode orang** adalah
  pembeda junior/senior
- Ikuti timeline produksi [PHASE9_PRODUCTION.md](../aether-realm-ue5/Docs/PHASE9_PRODUCTION.md)
- Komunitas: r/unrealengine, Unreal Source Discord, forum Epic
- Rilis game kecil dulu (1 mekanik, 1 level, itch.io) sebelum RPG besar —
  menyelesaikan > memulai

## ✅ CHECKPOINT FINAL — "Super Hero" berarti kamu bisa:

- [ ] Build project C++ UE dari repo tanpa panik
- [ ] Baca class asing dan jelaskan fungsinya dalam 5 menit
- [ ] Tuning gameplay lewat BP child, bukan edit C++ core
- [ ] Nambah ability/fitur baru mengikuti pattern yang ada
- [ ] Ukur & perbaiki performa
- [ ] Package build yang bisa dimainkan orang lain

Selamat. 🎓 Dari sini bukan lagi soal tutorial — soal jam terbang.
