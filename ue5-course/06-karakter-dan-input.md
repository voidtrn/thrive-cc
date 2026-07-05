# Modul 06 — Karakter & Enhanced Input

**Target:** paham anatomi Character BP, bikin input sendiri (Enhanced Input), atur kamera.

## 1. Anatomi Character Blueprint

Buka `Content/ThirdPerson/Blueprints/BP_ThirdPersonCharacter`:

```
BP_ThirdPersonCharacter (parent class: Character)
├─ Capsule Component      ← "badan" collision (silinder)
│   ├─ Mesh (Skeletal)    ← model 3D karakter + skeleton
│   ├─ Spring Arm         ← "gagang selfie" kamera (panjang, collision test)
│   │   └─ Camera         ← kamera nempel di ujung spring arm
└─ Character Movement     ← komponen ajaib: jalan, lompat, gravitasi, kecepatan
```

**Character Movement** = 90% rasa gerakan game. Coba ubah di Details:
- `Max Walk Speed` 500 → 800 (lari cepat)
- `Jump Z Velocity` 420 → 700 (lompat tinggi)
- `Air Control` 0.35 → 1.0 (belok penuh di udara)
- `Gravity Scale` 1.0 → 0.5 (bulan!)

Play → rasakan. Balikin lagi.

## 2. Enhanced Input — sistem input UE5

3 lapis (hafalkan alurnya):

```
Keyboard/Gamepad ─▶ IMC (Input Mapping Context)     ─▶ IA (Input Action) ─▶ Event di BP
                    "tombol W = aksi Move"              "aksi abstrak Move"    "gerakkan karakter"
```

Kenapa ribet? Supaya: rebind gampang, context bisa ditukar (jalan vs nyetir
vs menu), gamepad+keyboard otomatis.

**🔨 PRAKTIK — tambah aksi "Dash":**

1. Content Drawer, folder `Content/ThirdPerson/Input/Actions`:
   klik kanan → Input → **Input Action** → `IA_Dash`.
   Value Type: `Digital (bool)` (default).
2. Buka `Content/ThirdPerson/Input/IMC_Default` → **+ Mappings** →
   pilih `IA_Dash` → klik ikon keyboard → tekan `Left Shift`.
3. Buka `BP_ThirdPersonCharacter` → Event Graph → klik kanan →
   search `IA_Dash` → pilih **EnhancedInputAction IA_Dash**:

```
[IA_Dash: Started] ──▶ [Launch Character]
                          Launch Velocity: [Get Actor Forward Vector] × 1500
                          XY Override ✓
```

4. Compile → Play → `Shift` = dash ke depan. 🎉

Trigger event yang penting: `Started` (baru ditekan), `Triggered` (tiap
frame selama ditekan), `Completed` (dilepas).

## 3. Kamera: Spring Arm

Klik komponen **Spring Arm** (CameraBoom) → Details:

| Properti | Efek |
|---|---|
| Target Arm Length | Jarak kamera (400 default; 150=dekat, 800=jauh) |
| Enable Camera Lag ✓ + Lag Speed 3 | Kamera "nyusul" halus — cinematic |
| Do Collision Test ✓ | Kamera tidak nembus dinding |
| Socket Offset Z 60 | Kamera agak ke atas bahu |

**Zoom pakai scroll:**
1. `IA_Zoom` (Value Type: **Axis1D float**) → IMC: mapping Mouse Wheel Axis.
2. Event Graph:

```
[IA_Zoom: Triggered]
   Action Value (float) ──▶ [× -40] ─▶ [+ Target Arm Length sekarang]
   ──▶ [Clamp 150..800] ──▶ [Set Target Arm Length (SpringArm)]
```

## 4. Pawn vs Character vs Controller (peta konsep)

| Class | Peran |
|---|---|
| **Pawn** | Apa pun yang bisa "dirasuki" player/AI |
| **Character** | Pawn + kaki (CharacterMovement) — humanoid |
| **PlayerController** | "Jiwa" player — terima input, bisa pindah pawn |
| **Possess** | Controller merasuki pawn (ini cara kerja party swap di aether-realm!) |

## 5. 🔨 PRAKTIK gabungan

1. Tambah `IA_Sprint`: `Started` → Set Max Walk Speed 800;
   `Completed` → balikin 500.
2. Tambah stamina: variabel `Stamina` float 100; saat sprint, kurangi
   tiap tick (`Event Tick` → Branch sedang sprint? → Stamina -= Delta×15);
   habis → paksa berhenti sprint.
3. **Tantangan**: double jump — `Jump Max Count` = 2 di Character Movement.
   Gratis. Sekarang bikin dash cuma boleh 1× di udara (variabel bool reset
   saat `Event On Landed`).

## ✅ CHECKPOINT

- [ ] Paham rantai IMC → IA → Event
- [ ] Dash + sprint + zoom buatan sendiri jalan
- [ ] Paham Possess (penting untuk modul 14)

📖 [Enhanced Input (docs)](https://dev.epicgames.com/documentation/en-us/unreal-engine/enhanced-input-in-unreal-engine)

➡️ [Modul 07 — Animasi](07-animasi.md)
