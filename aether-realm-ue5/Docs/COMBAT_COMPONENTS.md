# Combat Components — Wiring Guide

Komponen combat di-*add manual* ke Blueprint karakter (`BP_CharacterBase` /
child), sama seperti `CombatComponent`, `BuffComponent`, `CharacterProgressionComponent`.
Semua opsional: kode yang memakainya `FindComponentByClass` → no-op kalau absen.

## Komponen & fungsi

| Komponen | Fungsi | Butuh |
|---|---|---|
| `UShieldComponent` | Absorb damage sebelum HP, elemental 2.5× | — |
| `UStatusEffectComponent` | Slow / stun / DOT | — |
| `UArtifactSetEffectComponent` | Efek 4pc set + crystallize shield | Progression, Buff, Combat, Shield |

## Urutan add di BP karakter (rekomendasi)

1. `CharacterProgressionComponent`
2. `BuffComponent`
3. `CombatComponent`
4. `ShieldComponent`
5. `StatusEffectComponent`
6. `ArtifactSetEffectComponent`  ← paling akhir (baca yang lain saat BeginPlay)

## Shield

```
Shield->ApplyShield("SkillShield", EElement::Geo, 800.f, 12.f);
```
- Elemen cocok damage → shield 2.5× efektif.
- `ExtraShieldStrength` di-set otomatis oleh Enduring Rock resonance.
- `OnShieldBroken` untuk VFX pecah.

## Status

```
Status->ApplyStatus("Frostslime_Slow", EStatusType::MoveSpeedMultiplier, 0.5f, 4.f);
Status->ApplyStatus("Lava_Burn", EStatusType::DamageOverTime, 15.f, 6.f, 1.f, EElement::Pyro);
Status->ApplyStatus("BossSlam_Stun", EStatusType::Stun, 0.f, 2.f);
```
- Stun hormati frozen (tidak un-freeze saat stun lepas).
- DOT lewat shield, tanpa hit-react spam.
- CC berat (Stagger/Knockback/Launch/KnockedDown) auto-stun lewat poise system — lihat bagian Poise di bawah.

## Poise (stagger)

`ACharacterBase::ApplyDamage` sekarang panggil `RegisterPoiseDamage(Reaction)` sendiri
setiap kali korban masih hidup — simetris untuk player **dan** enemy (dulu cuma
`AEnemyBase::AttackTarget` yang auto-stun target, jadi musuh tak pernah ke-stagger
balik oleh player; sekarang dua arah).

- `GetPoiseThreshold()` (virtual di `ACharacterBase`) default `0.f` → reaction
  berat langsung stagger, sama seperti perilaku lama.
- `AEnemyBase` override, baca dari `FEnemyStatsRow::PoiseThreshold` (DataTable).
  `0` = musuh biasa (Hilichurl/Slime/Archer, langsung ke-stagger 1 hit berat).
  `>0` = elite (Mitachurl/AbyssMage), damage poise dari tiap hit CC-tier
  (`Stagger`=40, `Knockback`=70, `Launch`=100, `KnockedDown`=140) accumulate
  sampai lewat threshold baru stun — reset kalau tak kena hit CC lagi dalam
  `PoiseResetWindow` (default 2s).
- Poise break → `UStatusEffectComponent::ApplyStatus("PoiseBreak", Stun, ...)`
  + broadcast `OnPoiseBroken` (hook VFX/SFX "stagger" di BP).
- `ResetPoise()` dipanggil `AEnemyBoss` tiap ganti phase, supaya transisi
  boss gak keburu ke-interrupt combo yang udah nyangkut poise dari phase lama.

## Enemy shield (elite)

Beda dari shield player (BP-added manual), `AEnemyBase` **selalu** punya
`UShieldComponent` bawaan (`EnemyShield`, `CreateDefaultSubobject` di constructor)
— no-op kalau `FEnemyStatsRow::ShieldAmount == 0`. Kalau > 0 (Mitachurl):
shield di-apply otomatis `BeginPlay`, regen otomatis `ShieldRegenDelay` detik
(default 8s) setelah pecah (`OnShieldBroken` → timer → `ReapplyElementalShield`).
Data-driven murni dari DataTable, tak butuh BP wiring tambahan.

## Ranged attack (enemy)

`AEnemyBase::FireProjectileAt(Target, ...)` spawn `ProjectileClass`
(`TSubclassOf<AEnemyProjectile>`, assign di BP enemy ranged — asset belum ada
di repo ini) yang meluncur lurus ke target lalu, saat overlap character valid,
panggil balik `Instigator->AttackTarget(...)` — jadi damage/reaksi elemental
tetap satu jalur formula, proyektil sendiri tak menghitung apa-apa. Cocok
buat HilichurlArcher/AbyssMage; panggil dari anim notify serangan ranged BP
sama seperti `AttackTarget` dipanggil dari anim notify melee.

## Boss phase

`AEnemyBoss` (turunan `AEnemyBase`) transisi phase berbasis HP% menurun
(`PhaseHPThresholds`, mis. `{0.7, 0.4}` = phase 1 @70%, phase 2 @40%).
Index phase dihitung fungsi statik murni `AEnemyBoss::ComputePhaseIndex`
(testable tanpa World, lihat `Private/Tests/BossPhaseTest.cpp`). Tiap
transisi: opsional enrage ATK (`PhaseATKMultipliers`), invulnerable singkat
(`PhaseTransitionInvulnerability`, default 1.5s) supaya gak ke-interrupt,
poise di-reset, broadcast `OnBossPhaseChanged` (BP hook: ganti moveset/spawn
add). Poise threshold boss default 300 (lebih tinggi dari elite biasa).

## Artifact 4pc set

Set effect dibaca dari `FourPieceEffectId` di `DT_ArtifactSets`. ID di-handle:

| FourPieceEffectId | Trigger | Efek |
|---|---|---|
| `NoblesseOblige` | Elemental Burst | +20% ATK 12s |
| `CrimsonWitch` | Elemental Skill | +7.5% Pyro DMG / stack (max 3) 10s |
| `Instructor` | trigger reaksi apa pun | +120 EM 8s |

Crystallize shield selalu aktif (bukan set) — pemicu crystallize dapat shield.

Tambah set baru: extend switch/HasSetEffect di `ArtifactSetEffectComponent.cpp`.

## Console test

```
TestStatus 5      # slow + burn 5s
ShowResonance     # log resonance aktif
```
