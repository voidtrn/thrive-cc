# Bagian 13 — Combat: Serangan Dasar (Combo 3-Hit)

Klik kiri = serang. Klik beruntun = combo 3 hit. Ini bagian paling seru.

## 13A. Input Attack

1. `IA_Attack` (Input Action, Digital) — folder Input/Actions.
2. `IMC_Default` → + Mapping → `IA_Attack` → key **Left Mouse Button**. Save.

## 13B. Animation Montage Combo

### Ambil animasi (Mixamo, gratis)

1. mixamo.com → pilih karakter default (X Bot).
2. Cari & download **3 animasi serangan** (mis. "Sword Slash", "Punching",
   "Roundhouse Kick"):
   - Format **FBX Binary**, Skin: **Without Skin**, 30 FPS, Keyframe
     Reduction: None
3. Import ke UE (folder `Animations/Combat`) → dialog: pilih **Skeleton**
   karakter kamu.
   > Skeleton beda (VRoid vs Mixamo)? Retarget dulu —
   > [Bagian 07](07-rapikan-karakter-anime.md) / [Modul 07](../07-animasi.md).
   > Mau cepat: pakai mesh Mannequin dulu untuk belajar combat, ganti
   > karakter belakangan.

### Rakit Montage

1. Klik kanan folder → Animation → **Animation Montage** → pilih skeleton →
   `AM_Combo3Hit` → buka.
2. Drag 3 animasi dari Asset Browser (panel bawah) ke track **DefaultSlot**,
   berurutan:

```
DefaultSlot: [Slash1      ][Slash2      ][Slash3           ]
Sections:    ▲Attack1      ▲Attack2      ▲Attack3
             0s            ~0.7s          ~1.4s
```

3. **Section** (kunci combo system): klik kanan di timeline tepat di awal
   tiap animasi → **New Montage Section** → nama `Attack1`, `Attack2`, `Attack3`.
4. Panel Sections (kanan/atas): klik **Clear** pada chain antar section —
   supaya tiap section **berhenti sendiri** (tidak otomatis lanjut).
   Ini penting: combo lanjut hanya kalau pemain klik lagi.
5. Save.

## 13C. Combo System di Blueprint

`BP_ThirdPersonCharacter` → Variables:

| Nama | Type | Default |
|---|---|---|
| `ComboCount` | Integer | 0 |
| `MaxCombo` | Integer | 3 |
| `bIsAttacking` | Boolean | false |
| `bAttackBuffer` | Boolean | false |

### Input handler

```
[EnhancedInputAction IA_Attack: Started]
   │
   ▼
[Branch: bIsAttacking]
   ├─ False ─▶ [MulaiCombo]                 ← custom event
   └─ True  ─▶ [Set bAttackBuffer = true]   ← klik disimpan, diproses nanti
```

### Custom event `MulaiCombo`

```
[MulaiCombo]
   [Set bIsAttacking = true]
   [Set ComboCount = 1]
   [Play Montage]  Montage: AM_Combo3Hit, Starting Section: "Attack1"
        │
        ├─ On Blend Out ──▶ [CekComboLanjut]
        └─ On Completed ──▶ [ResetCombo]
```

> **Play Montage** (node async dengan pin On Completed/On Blend Out/
> On Interrupted) — bukan "Play Anim Montage" biasa. Search: `Play Montage`.

### Custom event `CekComboLanjut`

```
[CekComboLanjut]
   │
   ▼
[Branch: bAttackBuffer AND (ComboCount < MaxCombo)]
   ├─ True:
   │    [Set bAttackBuffer = false]
   │    [Set ComboCount = ComboCount + 1]
   │    [Play Montage] AM_Combo3Hit,
   │       Starting Section: [Select] by ComboCount   ← node Select (Name):
   │                          2 → "Attack2", 3 → "Attack3"
   │       (chain On Blend Out → CekComboLanjut lagi, On Completed → ResetCombo)
   └─ False ─▶ [ResetCombo]
```

### Function `ResetCombo`

`ComboCount=0, bIsAttacking=false, bAttackBuffer=false`.
Panggil juga nanti saat: kena hit, dodge, mati.

Compile → Play → klik-klik-klik = 3 serangan beruntun; klik sekali = 1 saja. 🗡️

## 13D. Hit Detection

### Anim Notify di frame impact

1. Buka `AM_Combo3Hit` → posisikan playhead di frame tangan/pedang paling
   maju (per section).
2. Track Notifies → klik kanan → **Add Notify → New Notify** → `AN_Hit`.
   Ulangi untuk 3 section (3 notify).
3. Di **ABP** karakter (Event Graph): klik kanan → search
   `AnimNotify_AN_Hit` → dari event itu:

```
[AnimNotify_AN_Hit] ─▶ [Get Pawn Owner] ─▶ [Cast To BP_ThirdPersonCharacter]
   ─▶ [DoAttackTrace]   ← custom event di karakter
```

### Custom event `DoAttackTrace` (di karakter)

```
[DoAttackTrace]
   │
   ▼
[Sphere Trace By Channel]
   Start: [GetActorLocation]
   End:   Start + [GetActorForwardVector] × 150
   Radius: 60
   Trace Channel: Visibility
   Draw Debug Type: For Duration   ← lihat bolanya; matikan (None) kalau sudah oke
   │
   ▼
[Branch: Return Value]  ← kena sesuatu?
   True ─▶ [Break Hit Result] → Hit Actor
        ─▶ (Bagian 14: kirim damage lewat interface)
        ─▶ [Print String "KENA!"]  ← placeholder dulu
```

Test: berdiri dekat cube/enemy → serang → "KENA!" muncul pas frame impact.

## ✅ CHECKPOINT

- [ ] Klik 1× = 1 serangan, spam klik = combo 3, berhenti = reset
- [ ] Buffer jalan: klik saat animasi masih main → combo lanjut mulus
- [ ] Debug sphere muncul pas frame pukulan (bukan awal animasi)

➡️ [Bagian 14 — Damage System](14-damage-system.md)
