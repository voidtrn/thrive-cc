# PHASE 2 — Anime Character & Rendering (langkah editor)

C++ sudah di repo: `ACharacterBase`, `UOpenWorldMovementComponent`,
`ULockOnComponent`, `UCharacterAnimInstance`, `CombatTypes.h`.
Dokumen ini = bagian yang wajib dibuat di editor.

---

## 2A. Cel Shading / Anime Rendering

### PP_AnimeStyle (Post-Process Material)

1. Buat Material `Content/Materials/PostProcess/PP_AnimeStyle`
   - Material Domain: **Post Process**
   - Blendable Location: **Before Tonemapping** (agar banding konsisten sebelum tone curve)
2. Node graph inti — ambil scene lighting lalu posterize. Custom node (HLSL), input:
   `SceneColor` (SceneTexture:PostProcessInput0), `Bands` (scalar param = 4):

```hlsl
// Posterize luminance, jaga hue — banded lighting 3-4 step
float3 c = SceneColor;
float lum = dot(c, float3(0.299, 0.587, 0.114));
float banded = floor(lum * Bands) / Bands + (0.5 / Bands);
float3 tinted = c * (banded / max(lum, 0.0001));
return tinted;
```

3. Shadow tint biru/ungu: lerp berdasarkan band paling gelap:

```hlsl
// ShadowTint = vector param (0.55, 0.5, 0.75)
float shadowMask = 1.0 - smoothstep(0.0, 0.35, banded);
return lerp(tinted, tinted * ShadowTint, shadowMask * ShadowStrength);
```

4. Tambahkan di Post Process Volume (Infinite Extent ✓) di `L_OpenWorld`.

> Alternatif per-material (lebih presisi per karakter): pakai MF_CelShading di
> material karakter, PP hanya untuk grading global. Dua-duanya disiapkan di bawah.

### Material Functions (Content/Materials/Functions/)

**MF_CelShading** — input: `BaseColor (V3)`, `Roughness (S)`, `Normal (V3)`, `LightDirection (V3)`.
Custom node:

```hlsl
// N dot L → banded
float NdotL = dot(normalize(Normal), normalize(-LightDirection));
float lit = saturate(NdotL * 0.5 + 0.5);          // half-lambert biar lembut
float band = floor(lit * Bands) / (Bands - 1);     // Bands = 3 atau 4
band = saturate(band);

// Specular anime: cutoff keras, bukan smooth PBR
float3 H = normalize(-LightDirection + CameraVector);
float spec = pow(saturate(dot(Normal, H)), (1.0 - Roughness) * 128.0);
float hardSpec = step(0.7, spec);                  // hard cutoff

// Rim: fresnel + hard cutoff
float rim = 1.0 - saturate(dot(Normal, CameraVector));
float hardRim = step(RimCutoff, rim);              // RimCutoff ≈ 0.72

float3 shaded = BaseColor * lerp(ShadowColor, 1.0, band);
shaded += hardSpec * SpecColor + hardRim * RimColor * band;
return shaded;
```

- `LightDirection`: pakai node **SkyAtmosphereLightDirection** (index 0 = directional light utama).
- `ShadowColor` default (0.6, 0.55, 0.8) → shadow kebiruan anime style.

**MF_Outline** — metode inverted hull:
1. Di Blueprint karakter: duplikat `SkeletalMesh` component → `OutlineMesh`.
2. `OutlineMesh` pakai material `M_Outline`:
   - Shading Model: **Unlit**, warna hitam (atau param `OutlineColor`)
   - **Two Sided: OFF**, tapi centang **Reverse Culling** via material: World Position Offset =
     `VertexNormalWS * OutlineThickness` (param, default 1.5), dan di detail mesh set
     **Reverse Culling ✓** (render backface saja).
3. `OutlineMesh` → Leader Pose Component = mesh utama (ikut animasi gratis).
4. Ketebalan konstan di layar: kalikan thickness dengan
   `PixelDepth / 1000` di-clamp — outline tidak menebal saat kamera jauh.

**MF_AnimeHair** — anisotropic highlight (Kajiya-Kay disederhanakan):

```hlsl
// T = tangent rambut (V3), H = half vector
float TdotH = dot(normalize(Tangent), normalize(H));
float sinTH = sqrt(1.0 - TdotH * TdotH);
float aniso = pow(sinTH, HairSpecPower);           // 64-128
float hardAniso = smoothstep(0.85, 0.95, aniso);   // band tipis khas anime
return BaseColor + hardAniso * HairSpecColor;
```

Geser posisi highlight dengan `ShiftTexture` (scroll UV.y) untuk "angel ring".

**MF_AnimeEye** — fake depth parallax:
1. **BumpOffset** node: Height = tekstur iris depth (grayscale), HeightRatio 0.03,
   ReferencePlane 0.5 → iris terasa dalam saat kamera bergerak.
2. Highlight: tekstur sparkle di UV layer terpisah, **Unlit emissive**, tidak kena shadow —
   plug ke Emissive lewat Lerp dengan mask.

### Master Materials

| Material | Base | Catatan |
|---|---|---|
| `M_Character_Anime` | Lit, pakai MF_CelShading | Param: Albedo, Bands, ShadowColor, RimColor/Cutoff, SpecColor. Semua karakter = Material Instance dari ini |
| `M_Prop_Anime` | Sama, tanpa rim | Senjata & props |
| `M_Terrain_Anime` | Landscape blend (Phase 1) + posterize subtle | Bands = 6-8, ShadowStrength 0.3 — jangan seflat karakter |
| `M_VFX_Anime` | **Unlit**, emissive only | Niagara: erosi via `DynamicParameter.x`, depth fade, warna dari curve |

---

## 2B. Character Setup

### Blueprint

1. `Content/Characters/Player/BP_PlayerCharacter` — parent: **CharacterBase**.
   - Assign SkeletalMesh + `ABP_CharacterBase` (di bawah).
   - `HitReactionMontages`: isi map per EHitReaction setelah montage dibuat.
   - `HitShakeClass` / `BurstShakeClass`: buat BP dari **CameraShakeBase**
     (pattern: Perlin Noise; Hit = amplitude 3/duration 0.2, Burst = amplitude 8/duration 0.6).
2. Set `BP_OpenWorldGameMode → DefaultPawnClass = BP_PlayerCharacter`.

### ABP_CharacterBase (parent class: `CharacterAnimInstance`)

Semua variabel sudah dihitung C++ — AnimGraph tinggal baca
(`Speed`, `Direction`, `bIsInAir`, `bIsGliding`, `VerticalVelocity`, `bHardLanding`,
`bIsSwimming`, `bIsClimbing`, `bHasLookAtTarget`, `LookAtTarget`).

State Machine `Locomotion`:

```
Ground ──(bIsInAir)──────────────→ Air
Air ────(!bIsInAir)──────────────→ Land → Ground
Air ────(bIsGliding)─────────────→ Glide
Glide ──(!bIsGliding && bIsInAir)→ Air
Glide ──(!bIsInAir)──────────────→ Land
Any ────(bIsSwimming)────────────→ Swim
Any ────(bIsClimbing)────────────→ Climb
```

- **Ground**: BS_Locomotion (Idle→Walk→Run→Sprint by Speed 0/250/500/800).
  Idle pakai BS_IdlePose random variation (Random Sequence Player).
- **Air**: Jump Start → Loop (blend by VerticalVelocity) → menuju Land.
- **Land**: pilih Hard/Soft montage by `bHardLanding`.
- **Glide**: loop; lean pitch/roll dari input (Transform Bone / AimOffset).
- **Swim**: idle / forward / dive sub-states.
- **Climb**: start / loop / end (Phase 3 aktif penuh).

Combat & Reaction = **Montage slots**, bukan state:
- Slot `DefaultSlot` untuk Attack1-4, ChargedAttack, Skill, Burst.
- Slot `UpperBody` + **Layered blend per bone** (bone: `spine_01`) —
  upper body attack sambil lower body jalan.
- Hit/Stagger/Knockback/Launch/KnockedDown/GetUp: montage `FullBody` slot,
  dipicu `ApplyDamage()` C++ via `HitReactionMontages` map.

### Blend Spaces

| Asset | Axis | Range |
|---|---|---|
| `BS_Locomotion` | X=Direction, Y=Speed | -180..180 / 0..800 |
| `BS_IdlePose` | X=Random seed | idle variations |
| `AO_Glide` (AimOffset) | X=Roll input, Y=Pitch input | -1..1 |

### IK (Control Rig `CR_CharacterBase`)

1. **Foot placement**: Basic IK per kaki (`foot_l/r`), sphere trace ke tanah,
   offset pelvis = min(kedua kaki), rotasi foot mengikuti normal terrain → slope OK.
2. **Hand IK**: FABRIK/TwoBone untuk `hand_l` ke socket senjata
   (claymore 2 tangan, bow saat aim).
3. **Look At**: Aim node — bone `head`, target dari `LookAtTarget`
   (sudah di-feed lock-on C++), weight 0 kalau `!bHasLookAtTarget`,
   clamp yaw ±70°, pitch ±30°.

---

## 2C. Camera — sudah di C++, tinggal binding

| Fitur | Implementasi | Status |
|---|---|---|
| Orbit | SpringArm `bUsePawnControlRotation` + IA_Look → AddYaw/PitchInput | ✓ C++ |
| Zoom 150-600 | `ZoomCamera()` — bind mouse wheel, interp halus | ✓ C++ |
| Auto-adjust dinding | SpringArm `bDoCollisionTest`, probe 12 | ✓ C++ |
| Lock-on | `LockOn->ToggleLockOn()` — bind middle mouse | ✓ C++ |
| Aim mode | `SetAimMode(true)` saat hold ChargedAttack/skill aim → FOV 80→65 | ✓ C++ |
| Shake | `PlayHitShake()/PlayBurstShake()` — assign BP shake class | ✓ C++, asset BP |
| Lag 3 / RotLag 5 / FOV 80 | Default di konstruktor CharacterBase | ✓ C++ |

Binding input (di BP_PlayerCharacter atau PC, pakai `DA_InputConfig`):
- `IA_Look` → `AddControllerYawInput` / `AddControllerPitchInput`
- Mouse Wheel Axis → `ZoomCamera`
- Middle Mouse (tambah `IA_LockOn` ke IMC_Default) → `LockOn->ToggleLockOn`
- `IA_ChargedAttack` Started → `SetAimMode(true)`, Completed → `SetAimMode(false)`

## Checklist Phase 2

- [ ] PP_AnimeStyle aktif di Post Process Volume, banding kelihatan
- [ ] M_Character_Anime + 4 MF selesai, karakter pakai Material Instance
- [ ] Outline inverted hull muncul, ketebalan stabil di semua jarak kamera
- [ ] BP_PlayerCharacter possess, jalan/lari/sprint sesuai blend space
- [ ] Jump → fall → glide (tahan Space) → land, hard landing saat jatuh tinggi
- [ ] Foot IK nempel di slope, head tracking ngikutin lock-on target
- [ ] Zoom scroll, lock-on middle mouse, aim mode FOV, camera shake jalan
