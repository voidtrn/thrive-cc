# Bagian 22 — Boss Fight (Multi-Phase + Telegraph)

Musuh biasa = health karung tinju. **Boss** = pertarungan yang diingat.
Kuncinya 3 hal: **telegraph** (aba-aba serangan), **phase** (berubah pola),
**health gate** (momen dramatis).

## Beda boss vs enemy biasa

| Enemy (Bagian 15) | Boss |
|---|---|
| 1 serangan | 4-6 serangan berpola |
| Reaktif | Punya "AI intent" — pilih serangan by jarak/HP |
| Mati diam | Phase transition (invincible + cutscene singkat) |
| Health bar kecil | Health bar besar + nama + phase pips |

## 22A. Struktur Boss

`BP_Boss_Ronin` (parent Character, atau child dari `BP_Enemy` biar reuse):

Variables:
| Nama | Type | Default |
|---|---|---|
| `MaxHP` | Float | 3000 |
| `CurrentHP` | Float | 3000 |
| `CurrentPhase` | Integer | 1 |
| `bIsInvincible` | Boolean | false |
| `bIsTelegraphing` | Boolean | false |
| `CurrentState` | `EEnemyState` (reuse Bagian 15) | Idle |

**Health gate** = HP% pemicu phase:
- Phase 1: 100%-66%
- Phase 2: 66%-33% (lebih cepat, +1 serangan)
- Phase 3: 33%-0% (desperation: serangan AOE)

## 22B. Serangan dengan Telegraph

**Telegraph** = jeda + tanda visual sebelum serangan kena. Ini yang bikin
boss "adil" — pemain bisa baca & dodge. Tanpa telegraph = frustasi.

Pola tiap serangan (custom event, mis. `Attack_SlashCombo`):

```
[Attack_SlashCombo]
   [Set bIsTelegraphing = true]
   │
   ▼ — TELEGRAPH (0.6 detik) —
   [Play Montage] anim "wind up" (angkat pedang, kaki kuda-kuda)
   [Spawn Decal] area bahaya di tanah (merah, di depan boss)  ← aba-aba visual
   [Play Sound] "grunt" tanda mau nyerang
   [Delay 0.6]
   │
   ▼ — SERANGAN —
   [Set bIsTelegraphing = false]
   [Play Montage] anim serangan cepat
   [Sphere Trace] area decal tadi → kena player?
      ─▶ [TerimaDamage (Message)] Amount: 30
   [Destroy Decal]
   │
   ▼ — RECOVERY (0.8 detik, boss "terbuka" — pemain bisa balas) —
   [Delay 0.8]
   [Set CurrentState = Idle]  → AI pilih serangan berikutnya
```

Buat 3-4 serangan beda:
- `Attack_SlashCombo` — jarak dekat, kerucut depan
- `Attack_GroundSlam` — AOE lingkaran (decal lingkaran), telegraph 0.8s
- `Attack_Dash` — menerjang ke posisi player (telegraph: garis lurus)
- `Attack_Projectile` (phase 2+) — lempar proyektil

## 22C. AI Intent (pilih serangan)

Ganti Tick state Attack (Bagian 15) dengan **pemilih berbobot**:

```
[Case Attack]  (bBolehSerang == true)
   [Set bBolehSerang = false]
   [Jarak ke player?]
     < 200  → weighted random {SlashCombo 60%, GroundSlam 40%}
     200-600 → {Dash 70%, Projectile 30% (phase≥2)}
     > 600  → Dash (nutup jarak)
   [Delay total serangan]
   [Set bBolehSerang = true]
```

> Node "weighted random": Random Float 0-1 → Branch bertingkat. Atau array
> serangan + Random Integer in Range.

## 22D. Phase Transition (Health Gate)

Di event `TerimaDamage`:

```
[TerimaDamage]
   [Branch: bIsInvincible] True → return (fase transisi, kebal)
   [Set CurrentHP -= Damage] → [UpdateBossBar]
   │
   [Branch: CurrentPhase == 1 AND HP% <= 0.66]  → [MasukPhase 2]
   [Branch: CurrentPhase == 2 AND HP% <= 0.33]  → [MasukPhase 3]
   [Branch: HP <= 0] → [BossMati]
```

Custom event `MasukPhase` (Input: NewPhase):

```
[MasukPhase]
   [Set CurrentPhase = NewPhase]
   [Set bIsInvincible = true]       ← kebal selama transisi
   [Stop semua serangan]
   [Play Montage] "phase change" (boss teriak, aura menyala) — MOMEN dramatis
   [Spawn VFX] ledakan elemen sekeliling boss
   [Camera Shake] besar
   [Set MoveSpeed ×1.3]  (phase 2 lebih agresif)
   [Delay 2.0]
   [Set bIsInvincible = false]
   [Set CurrentState = Chase]
```

Efek per phase (contoh):
- Phase 2: gerak lebih cepat, buka serangan Projectile
- Phase 3: tiap serangan tinggalkan area api (DOT), HP < 33% = desperate

## 22E. Boss Health Bar (UI)

`W_BossBar` (widget besar, tengah-bawah layar, muncul saat boss aggro):

```
┌──────────────────────────────────────┐
│  RONIN SANG PENGEMBARA        [Phase]│
│  ██████████████████░░░░░░  ● ● ○     │  ← pips = phase (2 lewat, 1 sisa)
└──────────────────────────────────────┘
```

- Progress Bar HP (bind CurrentHP/MaxHP)
- Text nama
- 3 titik phase (nyala/mati by CurrentPhase)
- Muncul: boss BeginPlay overlap player pertama → Add to Viewport;
  hilang saat boss mati

## 22F. Boss Mati (bukan sekadar Destroy)

```
[BossMati]
   [Set bIsDead = true] [Stop Movement] [Disable Collision]
   [Play Montage] death dramatis (jatuh perlahan)
   [Global Time Dilation 0.3, Delay 0.5, balik 1.0]  ← slow-mo momen kill
   [Camera: focus ke boss] (opsional Set View Target)
   [Spawn Chest_Luxurious] (Bagian 11) — hadiah besar
   [Remove W_BossBar]
   [Delay 4.0] → [Destroy / dissolve]
   [LaporProgress quest "KillBoss"]  (Bagian 17)
```

## ✅ CHECKPOINT

- [ ] 3-4 serangan, tiap serangan ada telegraph (decal + jeda) → bisa di-dodge
- [ ] 3 phase, transisi kebal + dramatis di 66% & 33%
- [ ] AI pilih serangan by jarak + phase (bukan random buta)
- [ ] Boss bar besar + phase pips
- [ ] Mati = slow-mo + loot + quest complete

> Boss fight bagus = 70% telegraph & recovery timing, 30% angka damage.
> Playtest: apakah pemain merasa "salahku, bukan salah game" saat kena?

➡️ [Bagian 23 — Inventory UI](23-inventory-ui.md)
