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

## 🆕 GAMEPLAY DEPTH — pass baru (enemy combat)

Enemy AI/combat sebelumnya cuma punya 1 jalur serangan (melee-style, generic
stagger). Pass ini nambah 4 sistem C++ baru — **belum di-compile**, sama
seperti sisa codebase, jadi harapkan error kecil first-compile:

1. **Poise/stagger simetris.** Dulu cuma `EnemyBase::AttackTarget` auto-stun
   *player* kena CC berat — musuh sendiri tak pernah ke-stagger balik oleh
   player. Sekarang di-pindah ke `ACharacterBase::ApplyDamage` (poin sentral,
   dua arah). Enemy biasa tetap 1-hit-stagger (`GetPoiseThreshold()`
   default 0, perilaku lama tak berubah); elite (`FEnemyStatsRow::PoiseThreshold
   > 0`) butuh beberapa hit CC-tier sebelum break.
2. **Elite shield data-driven.** `AEnemyBase` sekarang selalu punya
   `UShieldComponent` bawaan (no-op kalau `ShieldAmount == 0`), auto-regen
   setelah pecah. Mitachurl-style shield tanpa perlu BP wiring — cukup isi
   DataTable.
3. **Ranged attack path.** `AEnemyBase::FireProjectileAt` + `AEnemyProjectile`
   (class baru) — HilichurlArcher/AbyssMage sekarang punya jalur serangan
   jarak jauh, reuse `AttackTarget` buat damage (tak duplikat formula).
4. **Boss phase transition.** `AEnemyBoss` (turunan `AEnemyBase`) — phase
   berbasis HP% threshold, enrage ATK opsional, invuln singkat + poise reset
   saat transisi. Index phase itu fungsi statik murni (`ComputePhaseIndex`),
   ada automation test-nya (`BossPhaseTest.cpp`) — testable tanpa World,
   sama filosofi dengan `DamageCalculatorTest`.

Detail wiring lengkap: `COMBAT_COMPONENTS.md` (bagian Poise / Enemy shield /
Ranged attack / Boss phase). Direview `ue5-reviewer` subagent sebelum commit —
5 finding (0🔴 2🟡 3❓), semua sudah di-fix kecuali 1 didokumentasikan sebagai
known limitation:

| Finding | Fix |
|---|---|
| `AttackTarget`/`FireProjectileAt` tak ada `HasAuthority()` guard — anim notify jalan di tiap mesin, bukan cuma server | Ditambah guard di keduanya |
| `AEnemyProjectile` tak `bReplicates` — invisible buat client co-op | Ditambah `bReplicates=true` + `SetReplicateMovement(true)` |
| `CurrentHP` replicated tanpa `OnRep` — `OnHealthChanged` (dipakai trigger boss phase) tak pernah fire di client | Ditambah `ReplicatedUsing=OnRep_CurrentHP` |
| `AEnemyBoss::GetPoiseThreshold` buang `FEnemyStatsRow::PoiseThreshold` dari DataTable | DataTable menang kalau diisi, `BossPoiseThreshold` jadi fallback |
| `bInvulnerable` bool tunggal (bukan counter) — phase-transition invuln bisa clobber sumber invuln lain | **Belum di-fix** — didokumentasikan sebagai known limitation di kode (risiko rendah, cuma god-mode cheat yang share bool ini sekarang) |

**Pass tambahan (presentation layer)** — 2 class baru, 0 finding di review:
- `APlayableCharacter` + `FCharacterDefinitionRow` — identitas Kagari/Yukine/
  Shiden (sebelumnya cuma di ART_A_CHARACTERS.md) sekarang punya representasi
  kode, pola sama `AEnemyBase`/`FEnemyStatsRow`.
- `ASFXManager` — pasangan audio `AVFXManager`, auto-play reaction SFX. Weapon
  swing/impact tetap BP-hook per `OnDamageDealt` (di luar scope, sama kayak
  VFXManager).

**Belum dikerjakan** (di luar scope pass ini, butuh asset/editor):
- BP child buat HilichurlArcher/AbyssMage (assign `ProjectileClass`, animasi
  ranged, mesh proyektil).
- BP boss child (assign `PhaseHPThresholds`/`PhaseATKMultipliers`, moveset
  per phase lewat `OnBossPhaseChanged`, DT_EnemyStats row buat boss).
- Behavior Tree task "keep distance & reposition" buat archer (kiting AI) —
  C++ cuma nyediain hook serangannya, logic jarak/reposition tetap BT/BP
  per arsitektur project (lihat `EnemyAIController` — perception/blackboard
  di C++, keputusan taktis di BT).

## 🆕 LONGEVITY PASS — AI Director (pacing)

`UPacingDirectorSubsystem` — riset & rasional di `GAME_LONGEVITY_PATTERNS.md`.
Review `ue5-reviewer`: 4 finding (0🔴 2🟡 1🔵 1❓), status:

| Finding | Status |
|---|---|
| Aggro leak — `bHasAggro` tak pernah reset saat musuh kehilangan pemain → `AggroCount` director menggelembung permanen | ✅ Fixed — lost-sight branch reset flag + `ReportEnemyAggro(-1)` |
| Pacing input bisa ke-feed dari mesin non-authoritative (lihat baris ANTISIPASI baru di bawah) | ✅ Mitigated — semua report call di-gate `HasAuthority()`; director efektif server-only |
| `GetPlayerHPFraction` cuma baca player 0 — anggota co-op sekarat tak terhitung stress | ✅ Fixed — pakai HP fraction terendah semua player controller |
| `AlertNearbyAllies` pakai `GetAllActorsOfClass` per aggro pertama | 📋 Pre-existing, sudah tercatat di ANTISIPASI #5 (threshold >50 musuh) |

## ⚠️ ANTISIPASI — yang akan menggigit nanti

1. **Belum pernah di-compile.** Harapkan error kecil build pertama
   (BUILD_NOTES). Ini risiko #1 — sisihkan sehari untuk first-compile fixing.

2. **Stat float polos, bukan GAS AttributeSet.** Sekarang OK. Tapi kalau
   buff/debuff makin banyak & stacking kompleks (shield, DOT, RES shred,
   conditional bonus) → float manual jadi kusut. Migrasi ke GAS
   AttributeSet + GameplayEffect saat itu terasa. ASC sudah terpasang =
   migrasi mulus.

3. **Climb custom movement tanpa `FSavedMove`.** Single-player mulus.
   Co-op: climb akan "karet"/desync di client. Wajib tambah SavedMove
   sebelum co-op serius.

4. **Damage number spawn actor + widget component per hit.** Kalau ratusan
   hit/detik (AOE besar, banyak musuh) → banyak alokasi. Pertimbangkan
   object pool damage number saat profiling nanti.

5. **`GetAllActorsWithTag("Enemy")` / `GetAllActorsOfClass`** dipakai di
   reaction AOE, plunge, cheat, minimap. Mahal kalau musuh banyak & dipanggil
   sering. Ganti ke overlap query / spatial grid saat musuh > 50.

6. **Timestamp save tidak dimuat** (sengaja) — tapi kalau nanti bikin UI
   "save slot list dengan tanggal", pastikan baca `Save->Timestamp` langsung
   dari file, bukan dari GameInstance.

7. **Wish 50/50 & pity antar-banner-tipe.** Sudah benar, tapi belum ada
   test untuk pity soft/hard (thresholds protected). Tambah friend test atau
   expose untuk validasi statistik sebelum rilis (gacha wajib benar — legal).

8. **Localization**: kalau text sudah terlanjur di-hardcode di BP yang dibuat
   nanti, retrofit mahal. Disiplin FText + String Table dari awal (course
   Bagian 36).

9. **`UCombatComponent::DealDamage` belum server-gated** (player→enemy path).
   Enemy→player sudah di-gate `HasAuthority()` (`AttackTarget`/
   `FireProjectileAt`), tapi arah sebaliknya — combo hit player →
   `Victim->ApplyDamage` — tak ada `HasAuthority()` check dan `TryNormalAttack`
   belum dibungkus Server RPC. Single-player/listen-host aman; co-op client
   akan resolve damage lokal yang tak sinkron dengan server. Fix benar =
   Server RPC untuk seluruh jalur serangan player (refactor sedang, garap
   bareng `FSavedMove` climb di ANTISIPASI #3 saat co-op serius). Dampak ke
   pacing director sudah dimitigasi (report call di-gate authority).

---

## Ringkasan angka

| | Jumlah |
|---|---|
| C++ class | 55 |
| Source file | 122 |
| Setup/review docs | 23 |
| Automation test | 5 file (8 test) |
| Gap fungsional fixed | 3 + P1 (3) + P2 (3) + P3 (3) |
| Gap tersisa | 0 (semua P1-P3 selesai) |
| Gameplay depth pass | poise/shield/ranged/boss — 2 class baru (`EnemyProjectile`, `EnemyBoss`) |
| Presentation pass | character catalog + reaction SFX — 2 class baru (`PlayableCharacter`, `SFXManager`) |
| Longevity pass | AI Director (`PacingDirectorSubsystem`) — riset + pola di `GAME_LONGEVITY_PATTERNS.md` |
| Psychology pass | Session Chronicle / memoar (`SessionChronicleSubsystem`) — teori lintas ilmu di `GAME_PSYCHOLOGY_FOUNDATIONS.md` |

## Rekomendasi urutan garap berikutnya

1. **First-compile** di UE (fix error kecil) — sebelum apa pun
2. ~~**P1 gap** (enemy elemen, talent auto, off-field energy)~~ ✅ selesai
3. ~~**P2 gap** (set/const hook, superconduct shred, per-elemen DMG)~~ ✅ selesai
4. ~~**P3 gap** (ascension/talent/artifact leveling material)~~ ✅ selesai
5. **First region playable** (course Bagian 26 flow) pakai cheat manager buat test
6. **Isi DataTable**: DT_CharacterAscension / DT_WeaponAscension / DT_TalentCost
   (row + material cost) — sistem kode siap, tinggal data.
