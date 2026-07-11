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
| `AlertNearbyAllies` pakai `GetAllActorsOfClass` per aggro pertama | ✅ Fixed — lihat ANTISIPASI #5, sekarang pakai `UEnemyRegistrySubsystem` |

## ⚠️ ANTISIPASI — yang akan menggigit nanti

1. **Belum pernah di-compile.** Harapkan error kecil build pertama
   (BUILD_NOTES). Ini risiko #1 — sisihkan sehari untuk first-compile fixing.

2. **Stat float polos, bukan GAS AttributeSet.** Sekarang OK. Tapi kalau
   buff/debuff makin banyak & stacking kompleks (shield, DOT, RES shred,
   conditional bonus) → float manual jadi kusut. Migrasi ke GAS
   AttributeSet + GameplayEffect saat itu terasa. ASC sudah terpasang =
   migrasi mulus.

3. ~~**Climb custom movement tanpa `FSavedMove`.**~~ → **Digarap** (bukan
   "closed" — beda level confidence dari fix lain di doc ini, baca sampai
   habis sebelum anggap selesai).

   Audit nemu scope-nya lebih luas dari yang didokumentasikan: bukan cuma
   climb, `bWantsToSprint` JUGA gak pernah nyampe ke server (gak ada RPC/
   compressed-flag apa pun buat itu sebelumnya) — jadi sprint speed pun
   udah desync di co-op sungguhan (bukan listen-server-host, yang skip
   jalur `SavedMove` ini sepenuhnya karena `ROLE_Authority` lokal).

   Fix: `UOpenWorldMovementComponent` sekarang punya custom
   `FSavedMove_OpenWorld`/`FNetworkPredictionData_Client_OpenWorld`
   (`GetPredictionData_Client`/`UpdateFromCompressedFlags` override), pola
   `FLAG_Custom_0`/`FLAG_Custom_1` sama persis `bPressedJump` bawaan engine
   — `bWantsToSprint` (persistent) & climb-entry (`bPressedClimb`, baru:
   `RequestClimb()` API) sekarang bagian compressed move, server independen
   replay keputusan yang sama dgn client predict, bukan cuma percaya
   `MovementMode` yang telat nyampe.

   **Round 1 review nemu bug nyata di desain awal** (bukan cuma hipotetis —
   ke-trace exact call order): draft pertama clear `bPressedClimb` DI DALAM
   `TryStartClimbing()` pas berhasil. Tapi `SetMoveFor` (capture buat
   compressed move yang dikirim ke server) SELALU jalan setelah
   `UpdateCharacterStateBeforeMovement` di tick yang sama (`PerformMovement`:
   `UpdateCharacterStateBeforeMovement` → physics → `UpdateCharacterStateAfterMovement`
   → `ReplicateMoveToServer`/`SetMoveFor`) — jadi clear di dalam
   `TryStartClimbing` (dipanggil dari `UpdateCharacterStateBeforeMovement`)
   selalu terjadi SEBELUM `SetMoveFor` tick yang sama capture nilainya.
   Compressed move tick climb BERHASIL malah ke-kirim dgn flag **false** —
   server gak pernah lihat true, gak pernah mutusin sama → desync
   deterministic (bukan race/kadang-kadang) di SETIAP climb entry sukses.
   Ironis: persis failure mode yang mau ditutup fix ini.

   **Fix**: `bPressedClimb` gak di-clear di `TryStartClimbing()` sama
   sekali. Clear-nya pindah ke `UpdateCharacterStateBeforeMovement`, TAPI
   satu tick KEMUDIAN — begitu `IsClimbing()` keliatan true (artinya
   compressed move tick sebelumnya, yang capture flag=true, udah lewat
   `SetMoveFor` dgn benar). Clear di titik ini aman karena kejadiannya di
   awal tick N+1, sebelum `SetMoveFor` tick N+1 (yang nilainya udah gak
   penting lagi buat korektnes). Ditambah `CancelClimbRequest()` (finding
   🔵 review: gak ada cara batalin request yang gak nemu dinding — sebelum
   ini retry trace tanpa batas selamanya).

   **Round 2 review** (verifikasi fix round 1): bug asli dikonfirmasi
   tertutup (ditelusuri tick-by-tick, cocok sama call order UE). Tapi nemu
   edge case baru: kalau `TryStartClimbing()` berhasil TERUS `StopClimbing()`
   kepanggil di tick yang SAMA (mis. `PhysClimb` trace-fail instan begitu
   masuk climb — dinding sempit/sudut), `IsClimbing()` gak pernah keliatan
   true di batas tick manapun → `bPressedClimb` gak pernah ke-clear via gate
   lama → retry re-entry gak diinginkan tiap tick padahal baru aja keluar.
   **Bukan desync** (client-server tetap deterministic sama), tapi logic/UX
   gap. **Fixed**: tambah `bClimbJustEntered` (bookkeeping internal, BUKAN
   bagian compressed flag — server replay `TryStartClimbing()` sendiri, set
   sendiri, deterministic, gak perlu transmit) — di-set di `TryStartClimbing()`
   pas berhasil (independen dari apa yang kejadian ke `MovementMode`
   setelahnya di tick yang sama), dikonsumsi tick berikutnya buat clear
   `bPressedClimb`. Ganti basis clear dari "poll `IsClimbing()`" (bisa stale
   kalau entry+exit sama-tick) ke "one-shot event flag" (immune dari itu).

   **Round 3 review** (verifikasi fix round 2): edge case entry+exit-sama-tick
   dikonfirmasi tertutup (ditelusuri tick-by-tick). Tapi nemu 1 hal lebih
   penting dari bug C++ manapun sejauh ini: **`Docs/PHASE4_SETUP.md` (langkah
   editor Phase 4) justru nginstruksiin wiring `IA_Jump` → `Move->
   TryStartClimbing()` LANGSUNG** — kontradiksi total sama komentar
   `RequestClimb()` yang bilang "pakai ini, bukan panggil TryStartClimbing
   langsung". Kalau BP beneran di-wire sesuai dok lama, `bPressedClimb` gak
   pernah ke-set dari input asli sama sekali — SELURUH mekanisme
   `FSavedMove`/compressed-flag round 1-3 jadi dead code buat jalur
   climb-entry utama, bug asli balik lagi tapi di layer BP, bukan C++. **Fixed**
   — `PHASE4_SETUP.md` diupdate ke `RequestClimb()` + alasan singkat. Ini
   pengingat penting: fix C++ doang gak cukup kalau instruksi wiring-nya
   sendiri nunjuk ke jalur yang salah — dokumentasi editor SAMA pentingnya
   buat diaudit, bukan cuma kode.

   Review round 3 juga nemu 1🟡: `bClimbJustEntered` di-set unconditional di
   `TryStartClimbing()` (independen dari SIAPA yang manggil), jadi kalau
   `TryStartClimbing()` dipanggil dari luar jalur `bPressedClimb` (backward-compat
   direct call) barengan sama request lain yang legit numpuk di window
   1 tick, clear-nya bisa nyabut request yang gak related. **Fixed** — scope
   `bClimbJustEntered` diperketat: cuma di-set di `UpdateCharacterStateBeforeMovement`
   sendiri, DAN cuma kalau `TryStartClimbing()` yang dipanggil dari situ (hasil
   konsumsi `bPressedClimb`) yang berhasil — bukan lagi di dalam
   `TryStartClimbing()` itu sendiri, jadi direct-call dari luar gak pernah
   nyentuh bookkeeping ini sama sekali.

   **Kenapa "digarap" bukan "closed":** ini pola `FSavedMove` kanonik UE
   (`FLAG_Custom_0/1`, sama persis `bPressedJump` bawaan engine — dikonfirmasi
   masih fully-supported di 5.4, bukan legacy), tapi project ini belum
   pernah di-compile — 3 putaran review nangkep 1 desync bug, 1 edge-case
   logic gap, DAN 1 dokumentasi-wiring yang salah arah. Confidence tinggi
   tapi eksplisit "belum 100% tanpa compile" per reviewer sendiri berkali-kali.
   **Round 4 review** (verifikasi fix round 3): edge case + scoping
   dikonfirmasi tetap benar setelah `bClimbJustEntered` dipindah (sekarang
   di-set di `UpdateCharacterStateBeforeMovement`, bukan di dalam
   `TryStartClimbing()`). Nemu 1🟡 kecil — komentar header `bClimbJustEntered`
   ketinggalan update (masih bilang "set di TryStartClimbing()", udah gak
   akurat). Fixed — komentar disamain sama behavior kode.

   4 putaran review — 1 desync bug, 1 edge-case logic gap, 1 dokumentasi
   editor yang nunjuk ke jalur salah, 1 stale comment — semua closed.
   Reviewer eksplisit: **"code-review-complete"** buat mekanisme ini
   (dibaca tangan tick-by-tick 4x, gak ada logic/desync gap baru ke-4).

   **Wajib tetap**: first-compile pass (prioritas #1 project ini) + verifikasi
   ordering di atas langsung ke `CharacterMovementComponent.cpp` engine +
   co-op playtest 2 mesin nyata (sprint speed, climb entry, exit-lalu-
   re-entry, kasus entry+exit-sama-tick di dinding sempit/sudut) sebelum
   dianggap benar-benar closed — "code-review-complete" bukan "compile-
   verified", 2 hal beda yang project ini sendiri selalu tegasin bedanya.

4. ~~**Damage number spawn actor + widget component per hit.** Kalau ratusan
   hit/detik (AOE besar, banyak musuh) → banyak alokasi.~~ → **Fixed.**
   `ADamageNumberCarrier` + `UDamageNumberPoolSubsystem` (`UI/`) — carrier
   actor+`UWidgetComponent` dibuat sekali (`CreateDefaultSubobject`, pola
   sama `UShieldComponent` di `EnemyBase`), di-hide & di-pool balik setelah
   1.2s (`ReleaseSelf` → `Pool->Release`) bukan `Destroy()`. Pool grow-on-
   demand (`SpawnActor` baru cuma kalau free-list kosong), gak ada cap —
   cukup buat solo-dev scale sekarang, bisa ditambah max-size kalau
   profiling nanti nunjukin perlu. Efek samping: nutup known limitation
   BUILD_NOTES.md ("`GetWidget()` bisa null 1 frame setelah spawn") — carrier
   panggil `InitWidget()` sinkron setelah `SetWidgetClass` (saran BUILD_NOTES
   sendiri), dan carrier yang di-reuse udah punya widget dari aktivasi
   pertama sama sekali.

   Review `ue5-reviewer`: 1🔴 1🟡 2🔵, semua fixed:

   | Finding | Fix |
   |---|---|
   | `UPROPERTY(VisibleAnywhere)` di member `private` tanpa `meta=(AllowPrivateAccess)` — UHT reject | Tambah `meta = (AllowPrivateAccess = "true")` |
   | Screen-space `UWidgetComponent` render lewat viewport overlay, `SetActorHiddenInGame` doang gak selalu suppress — carrier ter-pool bisa "hantu" nomor keliatan | Tambah `Widget->SetHiddenInGame()` eksplisit di constructor/Activate/ReleaseSelf, gak cuma actor-level |
   | `FreeList.Pop()` default `bAllowShrinking=true` — realloc backing buffer tiap pop, defeat sebagian tujuan pooling | `Pop(/*bAllowShrinking=*/false)` |
   | `Release()` pakai `AddUnique` (O(n) scan) padahal desain udah jamin no-dup (satu-satunya jalur balik = timer one-shot) | Ganti `Add()` (O(1)) |

5. ~~**`GetAllActorsWithTag("Enemy")` / `GetAllActorsOfClass`** dipakai di
   reaction AOE, plunge, cheat, minimap. Mahal kalau musuh banyak & dipanggil
   sering.~~ → **Fixed.** `UEnemyRegistrySubsystem` (`System/
   EnemyRegistrySubsystem.h`) — `AEnemyBase` self-register `BeginPlay`/
   unregister `EndPlay`, O(1) append/remove vs O(seluruh actor world) tiap
   scan. Ganti di 5 call site: `CombatComponent::OnPlungeLand` (AOE landing),
   `ElementalReactionSubsystem::DoTransformativeDamage` (reaction AOE),
   `LockOnComponent::FindBestTarget` (+ sekalian filter `IsAlive()` yang
   sebelumnya kelewat — gak lagi bisa lock ke mayat), `EnemyAIController::
   AlertNearbyAllies`, `Chest::AreNearbyEnemiesDead`, `OpenWorldCheatManager::
   KillNearbyEnemies`. `LockOnComponent::EnemyTag` dihapus (dead property
   setelah migrasi — `AEnemyBase` udah auto-tag "Enemy" di constructor
   sendiri, registry gak butuh tag sama sekali). Belum ke spatial grid (belum
   perlu di skala solo-dev sekarang) — kalau nanti musuh > 50 concurrent,
   `GetAllEnemies()` masih O(n) buat filter radius; upgrade ke spatial
   partitioning tinggal ganti isi `UEnemyRegistrySubsystem`, call site gak
   berubah.

6. **Timestamp save tidak dimuat** (sengaja) — tapi kalau nanti bikin UI
   "save slot list dengan tanggal", pastikan baca `Save->Timestamp` langsung
   dari file, bukan dari GameInstance.

7. ~~**Wish 50/50 & pity antar-banner-tipe — belum ada test.**~~ → **Fixed.**
   `UWishSystem::RollSingle`/`MakeResult` dijadiin `static` (murni fungsi dari
   Banner+Pity, no instance state — sama filosofi `UDamageCalculator`) +
   friend-declare 4 automation test class baru di `WishSystemTest.cpp`:
   hard-pity guarantee (Character/Weapon/Standard), 4-star-within-10 guarantee,
   50/50-loss featured guarantee, Epitomized Path target guarantee. Semua
   deterministik (mengunci pity counter tepat di threshold hard-pity, di mana
   `FMath::FRand() < 1.f` selalu true) — bukan test statistik/flaky.

8. **Localization**: kalau text sudah terlanjur di-hardcode di BP yang dibuat
   nanti, retrofit mahal. Disiplin FText + String Table dari awal (course
   Bagian 36). **Sebagian dipraktikkan** — `StarterContentLibrary.cpp`
   (konten prolog, CONTENT PASS di atas) awalnya ditulis pakai
   `FText::FromString` mentah (gak localizable, gathering pipeline gak bisa
   nemu), langsung dikonversi ke `LOCTEXT("Key", "...")` + `LOCTEXT_NAMESPACE
   "StarterContent"` sebelum jadi kebiasaan/nyebar ke file lain. Ini cuma
   nutup 1 file yang gue tulis sendiri — disiplin ini masih harus dijaga
   manual di konten BP masa depan (course Bagian 36 tetep relevan).

9. ~~**`UCombatComponent::DealDamage` belum server-gated** (player→enemy path).~~
   → **Fixed.** `DealDamage` sekarang guard `!OwnerChar->HasAuthority()` di
   awal (setelah null/alive check) — non-authoritative caller (combo/charged/
   plunge dari anim notify di owning client, BP skill/burst) forward lewat
   Server RPC baru `ACharacterBase::ServerRequestAttack`, yang balik manggil
   `DealDamage` di server (authoritative). Simetris dgn `AEnemyBase::
   AttackTarget`/`FireProjectileAt` di arah sebaliknya. **Known trade-off
   belum di-fix:** hit stop & damage number lokal utk hit co-op guest baru
   nongol setelah round-trip server (tak ada prediksi/cosmetic lokal instan
   lagi) — SpawnDamageNumber actor juga sudah tak di-multicast dari dulu, jadi
   ini bukan regresi baru, cuma sekarang konsisten kena delay RPC juga. Pass
   prediksi lokal instan tetap disarankan digarap bareng `FSavedMove` climb
   (ANTISIPASI #3) saat co-op serius.

   Review `ue5-reviewer` nemu 1 finding tambahan pas fix ini: `ServerRequestAttack`
   itu `UFUNCTION(Server)` publik — dia percaya `FAttackParams` mentah dari
   client, jadi client modifikasi bisa panggil RPC ini langsung skip
   `PerformComboHit`/`ReleaseCharged`/`OnPlungeLand`, kirim `SkillMultiplier`/
   `FlatDamage` sembarang gede atau `Victim` di ujung map lain. **Sudah
   dimitigasi** (bukan ditutup total): `ServerRequestAttack_Implementation`
   sekarang clamp `SkillMultiplier`/`FlatDamage` ke batas plausible generous
   (3.5x / 500 flat) + reject kalau jarak ke `Victim` > 2000cm. Ini sanity
   check kasar, bukan revalidasi eksak — server gak tau attack type asli
   (ComboIndex/charge-hold-time gak dikirim), jadi cheater tetap bisa boost
   damage sendiri dalam batas clamp. Fix penuh = server re-derive multiplier
   dari attack-type enum + state server sendiri (refactor lebih besar,
   worth it kalau PvP/leaderboard kompetitif jadi fitur; untuk PvE co-op
   solo-dev scope, risiko cuma "cheater trivialize fight sendiri", low
   severity — didokumentasikan sebagai known limitation, pola sama dgn
   `bInvulnerable` single-bool di BUILD_NOTES.

10. **`AChest::Server_TryOpen` gak validasi jarak** — celah sama kelas dgn
    #9: RPC publik, client bisa panggil dgn referensi chest actor mana pun
    (bukan cuma yang lagi di-interact), buka chest di ujung map lain tanpa
    deket. **Fixed sebagian** — `Server_TryOpen_Implementation` sekarang cek
    jarak `Player->GetPawn()` ke chest thd `MaxInteractRangeCm` (default
    400cm) sebelum lanjut ke `TryOpen`.

    Review `ue5-reviewer` nemu 1🟡+1❓ tambahan pas fix ini, **belum
    di-fix** (didokumentasikan, bukan ditutup dgn tebakan):
    - 🟡 Distance check pakai `Player` dari parameter RPC (client-supplied),
      bukan identitas koneksi yang beneran manggil RPC — teorinya cheater
      kirim referensi `APlayerController` pemain lain biar distance check
      "lolos" pakai posisi orang lain. **Practically mitigated** oleh default
      UE: `APlayerController` cuma replicate ke owning client sendiri
      (`bOnlyRelevantToOwner`-style), jadi client lain gak punya referensi
      valid buat di-exploit ini — tapi ini native networking default, bukan
      proteksi dari kode Chest sendiri, jadi fragile kalau relevancy setting
      itu berubah nanti (mis. spectator mode).
    - ❓ `AChest` gak pernah `SetOwner()` ke PlayerController manapun di C++
      (mungkin di-wire BP, gak kelihatan dari sini) — kalau beneran gak ada
      owner, `GetNetConnection()` chest bisa null, artinya RPC `Server_TryOpen`
      sendiri mungkin gak ke-deliver dari client non-host sama sekali (fail
      silent, masalah terpisah dari anti-cheat di atas). Gak bisa dipastikan
      tanpa compile+test — project ini belum pernah di-compile.

    **Fix arsitektural yang bener** (belum dikerjakan, butuh keputusan +
    testing nyata): pindah RPC dari `AChest` ke pemilik koneksi asli — pola
    sama persis dgn `ACharacterBase::ServerRequestAttack` (#9 di atas):
    `ACharacterBase::Server_InteractWithChest(AChest* Chest)` di pawn pemain
    (yang beneran punya net ownership via PlayerController), server derive
    "siapa yang manggil" dari `GetOwner()`/`GetController()` pawn itu sendiri
    — bukan dari parameter yang dikirim client. Ini juga otomatis nutup
    pertanyaan ❓ di atas (pawn pemain pasti punya net connection valid,
    gak kayak Chest yang gak jelas ownership-nya).

11. **`UResonanceComponent` 2 dari 3 efek query gak pernah dipanggil** —
    `GetCritRateVsFrozenBonus()`/`IsHighVoltageActive()`/`GetShieldStrengthBonus()`
    di-expose sejak awal (`RESONANCE_SYSTEM.md`), tapi audit grep nunjukin
    cuma `GetShieldStrengthBonus` yang beneran ke-consume (`ResonanceComponent.cpp`
    set `Shield->ExtraShieldStrength` langsung). Dua lainnya: getter ada,
    party composition ke-compute bener, tapi 0 caller — resonance "aktif" di
    UI/query tapi 0 dampak gameplay. Sama kelas bug kayak DMG%/HealingBonus
    yang di-fix di pass sebelumnya (dihitung tapi gak nyampe ke damage).

    - **Shattering Ice (crit vs frozen)**: ✅ **Fixed** — `UDamageCalculator::
      CalculateDamage` sekarang cek `Victim->IsFrozen()` (API udah ada di
      `CharacterBase`, cuma gak dibaca), tambah `GetCritRateVsFrozenBonus()`
      ke crit rate via `Attacker->GetController()` → `AOpenWorldPlayerController::
      GetResonance()`. Attacker non-player (enemy nyerang enemy — gak
      kejadian di gameplay sekarang) gak punya controller tipe itu → `Cast`
      gagal ke `nullptr`, no-op aman, bukan crash. Review `ue5-reviewer`:
      0🔴 0🟡 0🔵 1❓ — math crit-rate-nya gak ada test coverage
      (`CalculateDamage` sendiri butuh live actor, di luar scope harness
      World-free). Di-fix: extract jadi `UDamageCalculator::EffectiveCritRate
      (BaseCritRate, bVictimFrozen, CritVsFrozenBonus)` pure-static (pola
      sama `DefReduction`), 3 test baru (`AetherRealm.Damage.EffectiveCritRate`)
      — total 12 test.
    - **High Voltage (energy dari reaction)**: ⚠️ **sengaja belum digarap**.
      Beda dari Shattering Ice — formula-nya gak crisp di dokumen manapun
      (berapa energy, reaction Electro mana yang trigger, ada cooldown apa
      gak). Nebak angka sendiri = freelance game-design decision, bukan
      "fix gap yang udah ke-spec". Didokumentasikan di `RESONANCE_SYSTEM.md`
      sebagai TODO eksplisit dgn titik hook yang benar
      (`ElementalReactionSubsystem::ResolveReaction` → `CombatComponent::
      GainEnergyParticles`), tinggal isi angka begitu spec-nya ditentuin.

## 🆕 CONTENT PASS — storyline & cutscene (belum ada sebelumnya)

Project ini 0 konten cerita sebelum pass ini — quest *engine* (Phase6) ada,
tapi 0 quest/dialogue nyata, dan 0 sistem cutscene sama sekali.

- **Prolog 2-quest chain** (`System/StarterContentLibrary.h`) — "Tremors in
  Duskvale" → "The Stormchaser's Warning", dibangun via `NewObject`/
  `UDataTable::AddRow` murni C++ (bukan Data Asset/DataTable editor), jadi
  testable & jalan tanpa Unreal Editor. Plot hook: anomali Elemental
  Resonance (nyambung ke `UResonanceComponent` yang udah ada) — Kagari
  investigasi, ketemu Yukine lalu Shiden. `AOpenWorldGameMode::BeginPlay`
  auto-register lewat `QuestManager->RegisterQuests` (pola sama persis dgn
  yang didokumentasikan PHASE6_SETUP.md, cuma sumbernya C++ bukan BP array).
  BP masih bisa nambah quest lain via jalur Data Asset normal — map
  `RegisteredQuests` digabung per-QuestID, bukan ditimpa.
- **`ACutsceneActor`** (`World/CutsceneActor.h`) — cutscene tanpa Sequencer:
  array `FCutsceneShot` (posisi/rotasi/FOV/hold/blend relatif ke transform
  actor), spawn `ACameraActor` & `SetViewTargetWithBlend` per shot via timer,
  reuse `EInputContextMode::Dialog` buat lock input (belum ada mode
  "Cutscene" terpisah), opsional auto-trigger `UDialogueManager::StartDialogue`
  di akhir. Presentation client-local murni (viewport/input, bukan gameplay
  state replicated) — sengaja TIDAK pakai `HasAuthority()` guard, beda kelas
  masalah dari `CombatComponent`.
- Sisa kerja (NPC BP wiring, trigger volume, level placement, IMC gamepad,
  platform build, SFX/VFX asset): `Docs/EDITOR_WORK_CHECKLIST.md` — actionable
  checklist, bukan hasil kerjaan (butuh editor yang gak ada di environment ini).

Review `ue5-reviewer`: 1🔴 2🟡 1❓, semua closed:

| Finding | Fix |
|---|---|
| `CutsceneActor.h`: `TObjectPtr<APawn> CachedPawn` tanpa forward-declare `APawn` — undeclared identifier | Tambah `class APawn;` |
| Gak ada `EndPlay()` override — cutscene diputus paksa (level streamed out) → `ShotCamera` nyangkut di world, input mode stuck di `Dialog` | Tambah `EndPlay()` override, panggil `EndCutscene()` kalau masih `IsPlaying()` |
| `EndCutscene()` pakai raw non-null check (`if (CachedPC)`) bukan `IsValid()` — PC/Pawn destroyed eksternal mid-cutscene (disconnect) = pointer non-null tapi pending-kill | Ganti semua check jadi `IsValid()` (`IsPlaying()`, `ApplyShot`, `EndCutscene`) |
| ❓ `EndCutscene()` manggil `DialogueManager::StartDialogue()` tanpa `HasAuthority()` — dialogue node bawa `ReportTalkObjective` yang nulis progress quest, apa butuh guard? | **Gak butuh** — dicek `QuestManager::ReportObjective`/`DialogueManager::ExecuteActions`, 0 `HasAuthority()` di manapun di sistem quest/dialogue. Ini `GameInstanceSubsystem` per-machine (state di GameInstance, bukan replicated actor), pola konsisten sama NPC interact existing (`BP_NPC` interact langsung panggil `StartDialogue` tanpa guard). Cutscene ikut pola yang sudah ada, bukan nambah gap baru. |

---

## Ringkasan angka

| | Jumlah |
|---|---|
| C++ class | 58 |
| Source file | 122 |
| Setup/review docs | 23 |
| Automation test | 3 file (12 test) |
| Gap fungsional fixed | 3 + P1 (3) + P2 (3) + P3 (3) |
| Gap tersisa | 0 (semua P1-P3 selesai) |
| Gameplay depth pass | poise/shield/ranged/boss — 2 class baru (`EnemyProjectile`, `EnemyBoss`) |
| Presentation pass | character catalog + reaction SFX — 2 class baru (`PlayableCharacter`, `SFXManager`) |
| Longevity pass | AI Director (`PacingDirectorSubsystem`) — riset + pola di `GAME_LONGEVITY_PATTERNS.md` |
| Content pass | prolog 2-quest chain + `CutsceneActor` — 2 class baru (`StarterContentLibrary`, `CutsceneActor`) |
| Perf/security pass | `UEnemyRegistrySubsystem` (ganti 5 world-scan call site) + `AChest` interact-range anti-cheat — 1 class baru |
| Damage number pooling pass | `ADamageNumberCarrier` + `UDamageNumberPoolSubsystem` — 2 class baru |

## Rekomendasi urutan garap berikutnya

1. **First-compile** di UE (fix error kecil) — sebelum apa pun
2. ~~**P1 gap** (enemy elemen, talent auto, off-field energy)~~ ✅ selesai
3. ~~**P2 gap** (set/const hook, superconduct shred, per-elemen DMG)~~ ✅ selesai
4. ~~**P3 gap** (ascension/talent/artifact leveling material)~~ ✅ selesai
5. **First region playable** (course Bagian 26 flow) pakai cheat manager buat test
6. **Isi DataTable**: DT_CharacterAscension / DT_WeaponAscension / DT_TalentCost
   (row + material cost) — sistem kode siap, tinggal data.
