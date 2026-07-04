# PHASE 3 — Combat System (langkah editor)

C++ selesai: `UCombatComponent`, `UAbilityBase`, `UElementalReactionSubsystem`,
`UDamageCalculator`, `AEnemyBase`, `AEnemyAIController`, `UDamageNumberWidget`.
Berikut asset editor + cara wiring.

---

## 3A. Combo & Attack

### Wiring input (BP_PlayerCharacter)

Tambahkan `CombatComponent` ke BP_PlayerCharacter, lalu bind via `DA_InputConfig`:

| Input | Call |
|---|---|
| IA_NormalAttack (Triggered) | `CombatComponent->TryNormalAttack()` |
| IA_ChargedAttack (Started) | `StartCharging()` |
| IA_ChargedAttack (Completed/Canceled) | `ReleaseCharged()` |
| IA_Dodge (Triggered) | `TryDodge()` |
| IA_ElementalSkill | `TryElementalSkill()` |
| IA_ElementalBurst | `TryElementalBurst()` |
| Event Landed (Character) | `OnPlungeLand()` kalau `IsPlunging()` |

### Anim Notify (pasang di tiap montage attack)

| Notify | Frame | Call |
|---|---|---|
| `AN_ComboHit` | frame impact | `PerformComboHit()` |
| `AN_ComboWindow` | mulai recovery | `OnComboWindowOpen()` |
| `AN_ComboEnd` | akhir montage | `OnComboEnd()` |

Buat 3 AnimNotify BP (parent AnimNotify), event `Received_Notify` →
cast owner → panggil fungsi CombatComponent.

### Montage yang dibutuhkan per karakter

Attack1-4 (assign ke `ComboChain[i].Montage`), Charged, Plunge, Dodge
(assign ke properti CombatComponent di BP child per karakter — dash beda per karakter).

### Collision

Enemy mesh: set object response ke channel `CombatTrace` (sudah didefinisikan
di DefaultGame.ini) = **Block**. Karakter player ignore channel itu.

---

## 3B. Ability

1. Buat BP subclass `UAbilityBase` per karakter per slot, contoh:
   - `BA_Hero_FireSlash` (Skill: cooldown 8s, mult 2.5, particles 3, gauge 1U)
   - `BA_Hero_FlameBurst` (Burst: cost 60, cooldown 15s, mult 6.0)
2. Implement `OnActivate` di BP: spawn projectile / AOE trace / buff / heal.
   Damage dari ability → panggil `CombatComponent->DealDamage()` dengan
   `FAttackParams` (ICDTag unik per skill, mis. `Skill_FireSlash`).
3. Assign ke `CombatComponent → ElementalSkill / ElementalBurst` (instanced,
   langsung edit inline di BP karakter).
4. **Energy orb** (drop kill): buat `BP_EnergyOrb` — sphere collision, on overlap
   player → `CombatComponent->GainEnergyParticles(2)` → destroy. Assign ke
   `AEnemyBase → EnergyOrbClass`.

## 3C. Elemental Reactions — sudah full C++

Tidak ada asset wajib. Optional VFX: bind `OnReactionTriggered` delegate
(subsystem) di BP GameMode/Manager → spawn Niagara per reaction di lokasi.
Bind `OnCrystallizeShield` → BP shield pickup.

Matrix (trigger → aura):

| Trigger ↓ / Aura → | Pyro | Hydro | Cryo | Electro | Dendro |
|---|---|---|---|---|---|
| **Pyro** | — | Vape 1.5x | Melt 2.0x | Overload | Burning |
| **Hydro** | Vape 2.0x | — | Freeze | ElectroCharged | Bloom |
| **Cryo** | Melt 1.5x | Freeze | — | Superconduct | — |
| **Electro** | Overload | ElectroCharged | Superconduct | — | Quicken |
| **Dendro** | Burning | Bloom | — | Quicken | — |
| **Anemo** | Swirl (semua kecuali Geo/Dendro) | | | | |
| **Geo** | Crystallize (semua kecuali Anemo/Dendro) | | | | |

Quicken aura aktif: Dendro hit = Spread, Electro hit = Aggravate.
Dendro core: meledak 6s (Bloom), +Electro = Hyperbloom, +Pyro = Burgeon.
Frozen + blunt/Geo = Shatter.

---

## 3D. Enemy AI

### DataTable

1. `Content/Data/DT_EnemyStats` — Row Struct: **EnemyStatsRow**.
2. Row contoh:

| RowName | Type | HP | ATK | DEF | Lvl | InnateElement |
|---|---|---|---|---|---|---|
| Hilichurl | Hilichurl | 500 | 50 | 30 | 5 | None |
| HilichurlArcher | HilichurlArcher | 350 | 65 | 20 | 5 | None |
| Mitachurl | Mitachurl | 2000 | 120 | 80 | 10 | None |
| AbyssMage_Pyro | AbyssMage | 800 | 90 | 40 | 10 | None |
| Slime_Pyro | Slime | 400 | 45 | 25 | 5 | **Pyro** (immune) |

### Blackboard (BB_Enemy)

| Key | Type |
|---|---|
| TargetActor | Object (Actor) |
| LastKnownLocation | Vector |
| HasTarget | Bool |
| PatrolLocation | Vector |

(Nama key harus persis — C++ AIController menulis ke key ini.)

### Behavior Tree (BT_Enemy) — layout sesuai spec

```
Root Selector
├─ [Decorator: IsDead] → Death sequence (disable, ragdoll)
├─ [Decorator: HasTarget == true] Combat Selector
│   ├─ [Mitachurl/AbyssMage: HasShield?] → Cast Shield task
│   ├─ [Decorator: distance < AttackRange] Attack Sequence
│   │   └─ Selector (weighted random via Task pilih index)
│   │       ├─ Task: Melee Attack (play montage + trace)
│   │       ├─ Task: Ranged Attack (spawn projectile)
│   │       └─ Task: Special Ability
│   ├─ [distance > AttackRange] → MoveTo TargetActor (Chase)
│   └─ (fallback) → MoveTo LastKnownLocation (Investigate)
└─ Patrol Selector (idle)
    ├─ Task: MoveTo PatrolLocation (waypoint dari BP spawner)
    ├─ Task: Wait random 2-5s
    └─ Task: Investigate (rotate scan)
```

BP enemy: parent `AEnemyBase`, AI Controller Class = `EnemyAIController`,
assign `BehaviorTreeAsset` + `StatsTable` + `StatsRowName` + mesh/anim per type.

Perception sudah C++: sight 1500/90°, hearing 500, team aggro radius 800.

---

## 3E. Damage Numbers

1. `Content/UI/WBP_DamageNumber` — parent class: **DamageNumberWidget**.
2. Layout: satu `TextBlock` di canvas.
3. Event `OnDamageInfoSet`:
   - Set text = `DisplayText`, color = `DisplayColor`, font size = 22 * `FontScale`
   - Play animation `PopFade`: scale 0.6→1.1→1.0 (0.15s) + translate Y -60 + fade out (1s)
4. Assign `WBP_DamageNumber` ke `CombatComponent → DamageNumberWidgetClass`.

Warna sudah dihitung C++: putih normal, kuning crit (font 1.35x), warna elemen,
warna reaction (Melt/Vape merah 1.5x), heal hijau via `SetHealInfo`.

## Checklist Phase 3

- [ ] Combo 4 hit chain jalan, buffer 0.3s terasa (spam klik = chain lanjut)
- [ ] Charged: hold 0.5s+, stamina drain, aim mode untuk bow/catalyst
- [ ] Plunge dari glide/jump, damage scale ketinggian, AOE landing
- [ ] Dodge i-frame 0.3s, perfect dodge kasih energy, spam sampai stamina habis
- [ ] Skill cooldown & burst energy cost jalan, slow-mo burst 0.2s
- [ ] Vaporize/Melt angka membesar merah; Freeze menghentikan enemy; Overload knockback
- [ ] Hilichurl patrol → lihat player → aggro + teman ikut → chase → attack
- [ ] Slime Pyro immune ke Pyro
- [ ] Damage number: putih/kuning/elemen/reaction/heal semua bener
