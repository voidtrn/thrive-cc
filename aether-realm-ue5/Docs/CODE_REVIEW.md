# Cross-Check Menyeluruh — Gap, Pengembangan, Antisipasi

Hasil audit seluruh codebase + course. Jujur & prioritas.

---

## ✅ Yang sudah SOLID (tidak perlu khawatir)

- **Save/load simetris** — 37 field disimpan = dimuat semua (cek otomatis
  lolos; Timestamp memang metadata write-only)
- **Semua delegate handler = UFUNCTION** (9/9), replikasi include lengkap
- **Cross-link course & docs valid** — 0 link rusak
- **Formula damage/gacha** — ada automation test, kebukti benar
- **Audit sebelumnya** — 3 bug compile/logic sudah fixed (BUILD_NOTES)

## 🆕 Sistem BARU (post-audit)

- **Elemental Resonance** (`UResonanceComponent` di PlayerController) — party-wide
  buff dari komposisi elemen. 8 resonance: stat (ATK%/HP%/EM/RES/stamina) folded
  ke progression + CharacterBase; kondisional (crit vs frozen, shield, EC energy)
  via query. Auto-refresh di `OnPossess`. Detail: `RESONANCE_SYSTEM.md`.
- **Shield system** (`UShieldComponent` di CharacterBase) — absorb damage sebelum
  HP, elemental shield 2.5× vs elemen cocok, stack + expire. `ApplyDamage` route
  lewat `AbsorbDamage`. Enduring Rock resonance feed `ExtraShieldStrength`.
- **Artifact 4pc gameplay** (`UArtifactSetEffectComponent`) — Noblesse (burst→ATK),
  Crimson Witch (skill→Pyro DMG stack), Instructor (reaksi→EM), + crystallize→shield
  core. Pakai delegate `OnElementalBurstUsed`/`OnElementalSkillUsed`/`OnReactionTriggered`.
  Komponen BP-added (seperti Combat/Buff/Progression).
- **Status/affliction** (`UStatusEffectComponent`) — slow (move-speed mult), stun
  (lock gerak, hormati frozen), DOT (`ApplyDamageOverTime`, kena shield). Enemy hit
  CC berat (Knockback/Launch/KnockedDown) → stun 1.5s. Cheat `TestStatus`.
  Detail wiring: `COMBAT_COMPONENTS.md`.

## 🔧 FIXED pass ini (3 gap fungsional)

| Gap | Dampak sebelum | Fix |
|---|---|---|
| **DMG% + HealingBonus tidak nyampe ke damage** | Artifact `ElementalDMGBonus`/`HealingBonus` **percuma** — dihitung progression tapi tidak ditulis ke CharacterBase, DamageCalculator hardcode DmgBonus=1 | CharacterBase +2 field, progression menulisnya, CalculateDamage baca `1+ElementalDMGBonus`, Heal kali `1+HealingBonus` |
| **Transformative reaction bypass RES** | Overload/Superconduct/Bloom/EC-DOT tidak kena elemental RES musuh (harusnya kena) | Kali `ResMultiplier(GetResistance)` sebelum ApplyDamage |

---

## 🚧 GAP — perlu DIKEMBANGKAN (prioritas)

### P1 — SUDAH DIKERJAKAN ✅ (pass ini)

1. ~~**Enemy tidak bisa apply elemen ke player.**~~ → `AEnemyBase::AttackTarget()`
   (header+cpp) apply `Element` enemy via `ApplyElement` sebelum damage.
   Reaksi sekarang dua arah (player↔enemy). Anim notify BP enemy panggil ini.

2. ~~**Talent multiplier tidak otomatis ke damage.**~~ → `ETalentSource` +
   `FAttackParams::TalentSource`. `DealDamage` baca `GetTalents()` dari
   `UCharacterProgressionComponent`, kali `GetTalentMultiplier(level)` otomatis.
   Normal/Charged/Plunge di-set `NormalAttack`; skill/burst BP set sendiri.

3. ~~**Off-field energy 60% belum jalan.**~~ → `GainEnergyParticles` loop
   `PartyCharacterData`, non-aktif dapat `Energy * 0.6`. `RestoreCharacterState`
   clamp ke `MaxEnergy` saat swap-in.

### P2 — SUDAH DIKERJAKAN ✅ (pass ini)

4. ~~**Set 4-piece & Constellation: gameplay belum baca hook.**~~ → Delegate
   event ditambah: `OnElementalSkillUsed` / `OnElementalBurstUsed` di
   `UCombatComponent` (broadcast saat skill/burst sukses), plus
   `OnReactionTriggered` (sudah ada) + `OnDamageDealt`. BP set/constellation
   subscribe event ini. Angka per-set tetap di BP/data (arsitektur benar).

5. ~~**Superconduct −40% Physical RES debuff.**~~ → Sistem RES-shred bertimer
   di `CharacterBase` (`ApplyResShred`/`GetResShred`, auto-expire di Tick).
   Superconduct panggil `ApplyResShred(None, 0.4, 12s)`. `GetResistance`
   sekarang = `GetBaseResistance − shred` (enemy override jadi
   `GetBaseResistance`). RES bisa negatif → `ResMultiplier` handle.

6. ~~**Elemental DMG bonus tidak per-elemen.**~~ → `DMGBonusPerElement`
   (`TMap<EElement,float>`) + `PhysicalDMGBonus` di `CharacterBase`.
   `GetDMGBonus(Element)` dipakai damage formula. **Bonus fix:** physical hit
   (`None`) tak lagi salah dapat elemental bonus (dulu bug).

### P3 — SUDAH DIKERJAKAN ✅ (pass ini)

7. ~~**Item ascension/level-up materials.**~~ → `ULevelingComponent`
   (di PlayerController). `AscendCharacter`/`AscendWeapon` (data-driven
   `FAscensionCostRow`, cek level cap), `LevelUpCharacter`/`LevelUpWeapon`
   (EXP item Hero's Wit/Mystic Ore + mora rasio EXP/5). Inventory helper
   `GetItemCount`/`HasItem`/`AddItem`/`RemoveItem` di GameInstance.
8. ~~**Talent level-up cost.**~~ → `LevelUpTalent` (data-driven `FTalentCostRow`
   key `<Char>_<Talent>_<Level>`), sync ke progression karakter aktif.
9. ~~**Artifact enhancement.**~~ → `EnhanceArtifact` (EXP fodder + mora), level
   naik via kurva per-rarity, substat baru/upgrade acak tiap +4, cap by rarity.

Cheat command test: `LevelUpChar <lvl>`, `AscendChar`, `LevelTalent <1-3>`.
Semua pakai `ELevelingResult` (UI tahu alasan gagal: mora/material/cap/data).

---

## ⚠️ ANTISIPASI — yang akan menggigit nanti

1. **Belum pernah di-compile.** Harapkan error kecil build pertama
   (BUILD_NOTES). Ini risiko #1 — sisihkan sehari untuk first-compile fixing.

2. **Stat float polos, bukan GAS AttributeSet.** Sekarang OK. Tapi kalau
   buff/debuff makin banyak & stacking kompleks (shield, DOT, RES shred,
   conditional bonus) → float manual jadi kusut. Migrasi ke GAS
   AttributeSet + GameplayEffect saat itu terasa. ASC sudah terpasang =
   migrasi mulus.

3. ~~**Climb custom movement tanpa `FSavedMove`.**~~ ✅ SELESAI —
   `FSavedMove_OpenWorld` bawa sprint/glide/climb via compressed flags
   (FLAG_Custom_0/1/2). Climb jadi desire-flag `bWantsToClimb`, transisi
   dieksekusi di `UpdateCharacterStateBeforeMovement` (identik client/server).
   Sisa kecil: `JumpClimb` (impulse one-shot) belum dibawa saved move —
   catatan di header, pindahkan ke Server RPC kalau terasa snap di co-op.

4. ~~**Damage number spawn actor + widget component per hit.**~~ ✅ SELESAI —
   `UDamageNumberPoolSubsystem` (world subsystem): pool max 64 actor, reuse
   hide/unhide, steal paling tua saat penuh. BP tidak berubah
   (`SpawnDamageNumber` delegasi ke pool).

5. ~~**`GetAllActorsWithTag("Enemy")` / `GetAllActorsOfClass`**~~ ✅ SELESAI
   (hot path) — helper `UElementalReactionSubsystem::GetEnemiesInRadius`
   (sphere overlap ECC_Pawn + filter tag). Dipakai: reaction AOE, plunge,
   lock-on, alert allies AI, chest. Cheat manager & minimap sengaja tetap
   scan (dev-only / jarang dipanggil).

6. **Timestamp save tidak dimuat** (sengaja) — tapi kalau nanti bikin UI
   "save slot list dengan tanggal", pastikan baca `Save->Timestamp` langsung
   dari file, bukan dari GameInstance.

7. ~~**Wish 50/50 & pity antar-banner-tipe.**~~ ✅ SELESAI — test seam
   `RollSingleForTest`/`GetPityThresholdsForTest` (gated
   `WITH_DEV_AUTOMATION_TESTS`) + 6 automation test baru di
   `WishSystemTest.cpp`: threshold (75/90, 65/80), hard pity invariant,
   interval 20k pull (gap 5* ≤ 90, guarantee 4*), 50/50 + guarantee flag,
   epitomized path (2 point → target, akumulasi/reset), soft pity ramp
   statistik (rate zona soft >> base).

8. **Localization**: kalau text sudah terlanjur di-hardcode di BP yang dibuat
   nanti, retrofit mahal. Disiplin FText + String Table dari awal (course
   Bagian 36).

---

## Ringkasan angka

| | Jumlah |
|---|---|
| C++ class | 46 |
| Source file | 100 |
| Setup/review docs | 21 |
| Automation test | 2 file (11 test) |
| Gap fungsional fixed | 3 + P1 (3) + P2 (3) + P3 (3) |
| Gap tersisa | 0 (semua P1-P3 selesai) |

## Rekomendasi urutan garap berikutnya

1. **First-compile** di UE (fix error kecil) — sebelum apa pun
2. ~~**P1 gap** (enemy elemen, talent auto, off-field energy)~~ ✅ selesai
3. ~~**P2 gap** (set/const hook, superconduct shred, per-elemen DMG)~~ ✅ selesai
4. ~~**P3 gap** (ascension/talent/artifact leveling material)~~ ✅ selesai
5. **First region playable** (course Bagian 26 flow) pakai cheat manager buat test
6. ~~**Isi DataTable**~~ ✅ SELESAI — 123 row JSON siap-import di
   `Content/Data/` (18 char ascension + 24 weapon ascension + 81 talent),
   digenerate `Scripts/generate_leveling_data.py`. Import + katalog material
   + kurva biaya: `Docs/DATA_TABLES.md`.
