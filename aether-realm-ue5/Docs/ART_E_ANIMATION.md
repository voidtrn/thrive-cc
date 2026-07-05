# SECTION E — Animasi

## E1. Sumber Animasi

| Tool | Kapan pakai |
|---|---|
| **Mixamo** (gratis) | Locomotion base, basic attack, enemy anims — cepat, tapi generik + perlu retarget |
| **Cascadeur** (free tier) | Combat & akrobatik — physics-assist bikin natural; learning curve sedang |
| **Blender** | Anim spesifik: skill, burst, cutscene — full control |
| **Marketplace** (Fab) | Anim pack sword/magic combat — beli, retarget, modifikasi timing |

Strategi solo dev: Mixamo untuk 70% (locomotion/enemy), marketplace combat
pack untuk attack feel, Blender/Cascadeur hanya untuk signature moves
(skill & burst per karakter — ini yang bikin karakter terasa unik).

### Retarget Mixamo → VRoid skeleton (UE5 IK Retargeter)

1. Download dari Mixamo: FBX Binary, **With Skin** (sekali saja untuk
   skeleton), sisanya Without Skin ok; 30fps.
2. Import ke UE: skeletal mesh Mixamo (skeleton baru `SK_Mixamo`).
3. Buat **IK Rig** untuk kedua skeleton: `IKR_Mixamo`, `IKR_VRoid` —
   definisikan Retarget Chains: Spine, Head, LeftArm/RightArm (clavicle→hand),
   LeftLeg/RightLeg (thigh→foot), Root.
4. Buat **IK Retargeter** `RTG_MixamoToVRoid`: source IKR_Mixamo, target
   IKR_VRoid. Cek pose alignment (A-pose vs T-pose — adjust retarget pose).
5. Pilih semua anim Mixamo → Retarget Animations → batch export.
6. Per anim: set loop ✓ untuk cycle, **Enable Root Motion** untuk dodge/
   attack lunge, root motion extract dari hips kalau Mixamo in-place tidak ada.

## E2. Animation List

### Player (per karakter; share via Anim Layer, override signature saja)

**Locomotion (BS_Locomotion + turn):** idle ×3 (random via BS_IdlePose),
walk F (0-200), run F (200-450), sprint F (450-800), walk B/L/R (0-150),
strafe run L/R (150-400), turn in place 90/180 L+R (root motion).

**Air:** jump start, apex loop, fall, land soft/medium/hard (pilih by
`bHardLanding` C++), glide deploy, glide loop, glide fold+land, plunge
(descend loop + impact).

**Combat:** attack 1-4 (chain — timing notify `AN_ComboHit/Window/End`
Phase 3), charged (loop + release), skill cast (unik per karakter), burst
cast (unik + cinematic), dodge F/B/L/R (root motion), hit light/medium/heavy/
knockdown, get up.

**Interaction:** climb start/loop/end, swim start/loop/end, open chest,
pick up, activate mechanism, teleport dissolve/reform.

Total ±45 anim per karakter; ±30 shareable antar karakter (locomotion/air/
interaction), ±15 unik (combat feel + signature).

### Enemy

**Hilichurl:** idle ×2, patrol walk, chase run, swing 1-2, charged swing,
throw rock (varian ranged), hit light/heavy, stagger, knockdown+getup,
death ×2, shield block (hold/hit/break).

**Slime:** idle bounce, jump lunge, squish (hit), explode (death) —
elemental varian cukup material + VFX (ART_A).

**Abyss Mage:** float idle (hover sine dari AnimBP, bukan baked), teleport
vanish/reappear, cast, shield up, shield break stagger, death dramatis,
taunt laugh.

## E3. Animation Polish (status implementasi)

| Fitur | Status |
|---|---|
| Blend space locomotion | ✅ variabel C++ (`UCharacterAnimInstance`), asset BS di editor |
| Layered blend per bone (upper/lower) | Setup ABP Phase 2 docs — slot `UpperBody`, bone `spine_01` |
| Foot IK slope | Control Rig steps Phase 2 docs |
| Hand IK weapon grip | Control Rig + socket `weapon_r` (ART_A bone) |
| Head look-at | ✅ C++ feed `LookAtTarget` dari lock-on → Aim node |
| Turn in place | Root motion anim + kondisi `!bIsAccelerating && controller yaw delta` |
| Additive lean strafe | Lean AimOffset additive by `Direction` (sudah dihitung C++) |
| Jump anticipation & landing squash-stretch | Bake di anim asset (squash 2-3 frame sebelum lompat, stretch saat land) — jangan procedural, anime feel dari pose |
| **Hit stop** | ✅ C++ (CombatComponent, 0.05s) |
| **Motion warping** | ✅ plugin enabled — di montage attack: tambah `Motion Warping` anim notify state + `UMotionWarpingComponent` di BP karakter, warp target = lock-on enemy (`LockOn->GetTarget()`), attack lunge nempel otomatis |
| Anim sharing | Anim Layer Interface: `ALI_Character` — locomotion layer share, combat layer per karakter |
