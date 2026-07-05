# Bagian 15 — Enemy Sederhana (Hilichurl-ku)

Musuh yang patroli, ngejar, nyerang, dan bisa mati. State machine manual —
cara terbaik memahami AI sebelum pakai Behavior Tree.

## ⚠️ Syarat mutlak duluan: NavMesh

**AI MoveTo tidak jalan tanpa Nav Mesh** (kesalahan #1 pemula):

1. Place Actors (`Window → Place Actors`) → cari **Nav Mesh Bounds Volume**
   → drag ke level → scale sampai menutupi SELURUH area main
   (Details → Brush Settings → X/Y/Z besar, mis. 10000).
2. Tekan `P` di viewport → area hijau muncul = area yang bisa dijalani AI.
   Tidak hijau = AI diam membisu.

## 15A. Blueprint Enemy

1. Blueprint Class → parent **Character** → `BP_Enemy_Hilichurl`.
2. Components:
   - **Mesh**: Mannequin (`SKM_Quinn`) dulu + ABP template (biar ada animasi
     jalan) — model goblin dari Fab belakangan
   - **Sphere Collision** → rename `DetectionRange` → radius **1000**
   - **Widget Component** → rename `HealthBarWidget` → Space: **Screen**,
     posisi Z +120 (atas kepala), Draw at Desired Size ✓
3. **AI**: Class Defaults → Pawn → **Auto Possess AI: Placed in World or
   Spawned** ← wajib, tanpa ini AI MoveTo mati.
4. Variables:

| Nama | Type | Default |
|---|---|---|
| `CurrentHP` / `MaxHP` | Float | 50 |
| `Damage` | Float | 10 |
| `AttackRange` | Float | 150 |
| `PlayerRef` | Object (Character) | — |
| `CurrentState` | `EEnemyState` ↓ | Idle |
| `bIsDead` | Boolean | false |

5. **Enumeration**: klik kanan → Blueprints → **Enumeration** →
   `EEnemyState` → isi: `Idle`, `Chase`, `Attack`, `Dead`.

### Health bar

1. Widget `W_EnemyHealthBar`: Progress Bar merah (200×12).
2. Bind Percent: `Get Owning Player Pawn`? **BUKAN** — ini widget milik
   enemy: pakai **Event Construct → Get Owning ... ✗**. Cara benar untuk
   widget component: di `BP_Enemy` BeginPlay →
   `[HealthBarWidget → Get Widget] → [Cast To W_EnemyHealthBar] → simpan
   referensi`, lalu tiap HP berubah panggil function `UpdateBar(HP/MaxHP)`
   di widget (Set Percent). Lebih efisien dari binding per-frame.

## 15B. AI State Machine (Event Tick + Switch)

```
[Event Tick]
   ─▶ [Branch: bIsDead] True → (berhenti — tidak proses apa pun)
   ─▶ [Switch on EEnemyState (CurrentState)]
        │
        ├─ Idle:
        │    (diam; deteksi via overlap ↓ yang mengubah state)
        │
        ├─ Chase:
        │    [AI MoveTo]  Pawn: self, Target Actor: PlayerRef,
        │                 Acceptance Radius: 100
        │    [Branch: Get Distance To (PlayerRef) < AttackRange]
        │       True ─▶ [Set CurrentState = Attack]
        │    [Branch: Distance > 2000] True ─▶ [Set CurrentState = Idle]
        │
        ├─ Attack:
        │    [Set CurrentState = Idle sementara? TIDAK — pakai gate ↓]
        │
        └─ Dead: (kosong — ditangani event Mati)
```

**Attack yang benar (jangan spam per-frame!)** — pakai custom event +
cooldown, Tick cuma memicu sekali:

1. Variabel `bBolehSerang` (bool, true).
2. Di case Attack:

```
[Branch: bBolehSerang]
   True:
     [Set bBolehSerang = false]
     [Play Montage serangan] (atau langsung)
     [Delay 0.4]                      ← timing pukulan
     [Sphere Trace] depan 150 → kena player?
        ─▶ [TerimaDamage (Message)] Target: player, Amount: Damage
     [Delay 1.5]                      ← cooldown
     [Set bBolehSerang = true]
     [Branch: jarak masih < AttackRange?] False → [Set CurrentState = Chase]
```

### Deteksi player (masuk Chase)

```
[DetectionRange: On Component Begin Overlap]
   Other Actor ─▶ [Cast To BP_ThirdPersonCharacter]
      sukses ─▶ [Set PlayerRef] ─▶ [Set CurrentState = Chase]
```

## 15C. Enemy Bisa Mati

1. Class Settings → Implemented Interfaces → **BPI_Damageable** (Bagian 14).
2. Event **TerimaDamage**:

```
[Set CurrentHP -= DamageAmount] → [UpdateBar]
[Branch: CurrentHP <= 0]
   True:
     [Set bIsDead = true] [Set CurrentState = Dead]
     [Set Actor Enable Collision: false]
     [Stop Movement Immediately] (Character Movement)
     (opsional: play death montage / ragdoll: Mesh → Set Simulate Physics ✓)
     [Spawn Actor BP_Oculus]  ← loot! (atau koin)
     [Delay 3.0] → [DestroyActor]
   False:
     (opsional hit reaction montage)
```

## 15D. Uji Coba

1. Taruh 3-4 enemy tersebar. **Cek `P` — lantai hijau?**
2. Play: dekati → enemy ngejar → dekat → mukul (HP-mu turun, bar HUD
   bagian 09 kepake lagi) → balas serang (bagian 13) → HP bar enemy turun,
   damage number muncul (bagian 14) → mati → drop loot. **Semua sistem
   nyambung.** 🎉

## ✅ CHECKPOINT

- [ ] NavMesh hijau, enemy ngejar
- [ ] Enemy nyerang dengan cooldown (bukan tiap frame!)
- [ ] Mati → collision off → loot → hilang
- [ ] Health bar di kepala akurat

> AI produksi (sight cone, hearing, team aggro, Behavior Tree):
> `aether-realm-ue5` `AEnemyAIController` + `Docs/PHASE3_SETUP.md`.

➡️ [Bagian 16 — Skill Element](16-skill-element.md)
