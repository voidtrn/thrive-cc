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
- Enemy `AttackTarget` dengan reaction Knockback/Launch/KnockedDown auto-stun 1.5s.

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
