# SECTION A — Karakter & Model 3D

## A1. Pipeline VRoid → Blender → UE5

### VRoid Studio

**Proporsi & setup untuk action game:**
1. Body: pakai preset **adult proportion**, kurangi head size 1 notch dari
   default (default VRoid terlalu chibi untuk action). Leg length +5-10%
   supaya lari kelihatan dinamis.
2. Face: eyebrow & eye pakai layer terpisah (jangan bake ke face texture) —
   penting untuk blendshape control. Iris highlight terpisah.
3. Hair: **hindari procedural hair strand berlebihan** — tiap strand = bone
   chain. Target: 15-25 hair bone groups max. Pakai preset medium, edit
   silhouette. Bang (poni) boleh detail, back hair simplify.
4. Texture: set semua atlas **2048x2048** (Settings → Texture Resolution).
5. Outfit: maksimal **2 dangling parts** (scarf + coat tail misal). Tiap
   dangling part = physics bone chain = kerja rig + runtime cost.

**Export:** VRM 0.x format ✓ include blendshapes ✓ standard bone hierarchy ✓
(jangan reduce bone di VRoid — reduce di Blender biar terkontrol).

### Blender (pakai addon [VRM Add-on for Blender](https://vrm-addon-for-blender.info/))

**Cleanup:**
1. Import VRM → pose mode → cek bone list. Hapus: `*_end` leaf bones yang
   tidak dipakai, swaying bone berlebih di rambut (sisakan 2-3 per chain),
   bone jari kaki kalau tidak dipakai.
2. Merge material: VRoid export 8-15 material →
   gabung jadi **4: Body, Face, Hair, Outfit**. Material Properties →
   assign ulang faces, hapus slot kosong. Texture atlas: bake gabungan
   kalau perlu (Simple Bake addon).
3. Fix gap: cek leher, pergelangan, pinggang saat pose ekstrem —
   weld vertex (M → By Distance 0.001) atau tambah loop.
4. Polycount: target **< 50k tris**. VRoid biasa 70-120k. Decimate
   modifier per mesh: hair 0.6, outfit 0.7, body jangan (deform).
   Cek silhouette setelah decimate.

**Rigging enhancement:**
1. **IK/weapon grip**: tambah bone `weapon_r` child dari `hand_r`
   (posisi grip), `ik_hand_l` untuk two-hand weapon.
2. **Physics bones**: skirt 4-6 chain × 3 bone, cloak 3 chain × 4 bone.
   Naming: `skirt_01_01` (chain_segment) — memudahkan physics asset UE.
3. **Twist bones**: `upperarm_twist_01`, `lowerarm_twist_01` per lengan,
   weight 50% blend — anti candy-wrap saat rotasi wrist.
4. **Eye look-at**: bone `eye_l`/`eye_r` sudah ada dari VRM — pastikan
   weight ke iris mesh benar.

**Shape keys wajib** (VRM biasanya sudah bawa sebagian — lengkapi):
- Blink: `blink_l`, `blink_r`, `blink_both`
- Eye: `eye_wide`, `eye_angry`, `eye_sad`
- Mouth phoneme: `a`, `i`, `u`, `e`, `o`
- Mouth expresi: `smile`, `frown`, `mouth_open`, `grin`
- Brow: `brow_up`, `brow_down`, `brow_angry`, `brow_sad`

**Export FBX:**
```
Scale: 0.01 kali? TIDAK — set Unit Scale scene 0.01 ATAU export scale 1.0
  + Apply Transform ✓ (paling aman: scene unit Metric 0.01, export scale 1.0)
Forward: -Y Forward, Up: Z Up
Armature: Only Deform Bones ✓, Add Leaf Bones ✗
Bake Animation: hanya kalau ada anim
Geometry: Apply Modifiers ✓, Smoothing: Edge, Include Shape Keys ✓ (Export Morph)
```

### UE5 Import & Setup

1. Import FBX: Skeletal Mesh ✓, Create Physics Asset ✓, Import Morph Targets ✓,
   Skeleton: **buat baru untuk karakter pertama, reuse untuk berikutnya**
   (kalau hierarchy sama — VRoid konsisten).
2. Material: buat Material Instance dari `M_Character_Anime` (Phase 2)
   per slot (Body/Face/Hair/Outfit). Assign BaseColor; Normal opsional
   (anime style sering flat); MRAO packed kalau ada.
   Hair pakai `MF_AnimeHair`, Face + eye pakai `MF_AnimeEye`.
3. Physics Asset: hapus body auto-generate di rambut/rok → buat manual:
   - Rambut: capsule per bone, **Kinematic default**, simulasi via
     AnimBP `AnimDynamics` node ATAU `KawaiiPhysics` plugin (gratis, terbaik
     untuk anime hair/skirt — rekomendasi kuat)
   - Constraint: swing limit 30-45°, twist 10°, stiffness tinggi rok,
     rendah rambut ujung; damping 0.7+ biar tidak liar
4. Retarget (Mixamo/marketplace anim): UE5 **IK Retargeter** —
   buat IK Rig untuk skeleton VRoid + source, chain mapping
   (spine/arm/leg/head), retarget batch semua anim.

---

## A2. Spec Sheet 3 Karakter Starter

C++ tersedia: `APlayableCharacter` + `FCharacterDefinitionRow`
(`Public/Character/PlayableCharacter.h`) — load identitas & base stats dari
`DT_Characters`, pola sama persis dengan `AEnemyBase`/`FEnemyStatsRow`. Row
name di tabel di bawah ("Char_Kagari" dst) langsung dipakai sebagai
`CharacterRowName` di BP child. Model 3D/animasi tetap kerja editor (A1) —
ini cuma nyambungin identitas ke kode supaya party roster/UI bisa query data
karakter tanpa hardcode per BP.

### Karakter 1 — **KAGARI** · "Flamebound Wanderer"
| | |
|---|---|
| Element / Weapon / Role | Pyro / Sword / Main DPS on-field |
| Row name (DT_Characters) | `Char_Kagari` |
| Rambut | Merah-oranye, messy spiky, medium; 18 hair bones |
| Mata | Amber/gold, sharp; iris glow saat skill |
| Outfit | Jaket merah gold trim, celana hitam, boots; scarf merah (physics 1 chain), sarung tangan emblem pyro |
| Palette | `#CC2200` merah · `#FFD700` emas · `#1A1A1A` hitam · `#FFF8E7` cream |
| Kepribadian | Energetik, impulsif, loyal |
| Idle 3x | stretch lengan; mainkan api kecil di telapak; celingukan lihat sekitar |
| Combat feel | Cepat, forward momentum, trail api tiap slash |

### Karakter 2 — **YUKINE** · "Frostveil Scholar"
| | |
|---|---|
| Element / Weapon / Role | Cryo / Catalyst / Support-Healer |
| Row name | `Char_Yukine` |
| Rambut | Biru muda-silver, hime-cut panjang lurus; 22 hair bones (panjang = chain lebih) |
| Mata | Biru es, round soft |
| Outfit | Robe scholar biru-putih motif salju; buku melayang (socket `weapon_r`, floating offset); anting snowflake |
| Palette | `#B8D4E3` biru es · `#FFFFFF` putih · `#4A6FA5` biru tua · `#E8D5B7` cream |
| Kepribadian | Tenang, bijaksana, bookworm |
| Idle 3x | buka-baca buku; adjust kacamata; ciptakan snowflake di telapak |
| Combat feel | Graceful, cast dari jarak, buku terbuka saat skill |

### Karakter 3 — **SHIDEN** · "Stormchaser Vanguard"
| | |
|---|---|
| Element / Weapon / Role | Electro / Polearm / Sub-DPS off-field |
| Row name | `Char_Shiden` |
| Rambut | Ungu gelap, pendek undercut; 8 hair bones saja (pendek = murah) |
| Mata | Ungu elektrik, sharp + electro glow (emissive iris) |
| Outfit | Light armor motif petir ungu-hitam; vision electro di pinggang; polearm blade electro (emissive edge) |
| Palette | `#7B2D8E` ungu · `#1A0033` hitam-ungu · `#FFD700` emas · `#00FFFF` cyan |
| Kepribadian | Serius, pendiam, sangat terampil |
| Idle 3x | spin polearm sekali; inspeksi mata pisau; spark electro di jari |
| Combat feel | Presisi, thrust cepat, spark tiap hit |

---

## A3. Enemy Model Specs

### Hilichurl (melee basic)
- Style: goblin-like, masker kayu tribal, cloth loincloth
- **5-8k tris**, texture 1024², 1 material
- Varian (mesh share, ganti prop + mask tint): melee (club), ranged (crossbow), berserker (axe, mask merah)
- Anim set: idle, patrol walk, run, attack 1-2-3, hit reaction, death, shield block
- Rig: humanoid standar → bisa retarget dari anim pack marketplace

### Slime (elemental blob)
- Style: blob bulat lucu-berbahaya, wajah minimal (2 mata glow)
- **1-2k tris**, texture 512² + emissive
- Varian per elemen = **material instance saja** (Pyro merah-oranye + fire particle socket, Hydro biru translucent, Cryo kristal facet normal map)
- Jiggle: **bone jiggle** (3 bone: core, top, bottom + AnimDynamics) — lebih murah dari vertex anim
- Anim: idle bounce, jump, squish (landing), explode (death)
- `DT_EnemyStats`: `InnateElement` = immune (sudah C++ Phase 3)

### Abyss Mage (caster elite)
- Style: figur berjubah melayang, masker, ornamen elemen
- **8-12k tris**, texture 2048², 2 material (body + cloth)
- Shield bubble: **sphere mesh terpisah** — material translucent fresnel +
  panner elemental texture + depth fade; HP shield = scale down saat rusak
- Anim: float idle (sine hover di AnimBP, bukan baked), teleport
  (dissolve out/in), cast spell, shield broken (stagger), laugh taunt
- Root motion OFF — teleport via AI blueprint

## Budget ringkas

| Asset | Tris | Texture | Bones |
|---|---|---|---|
| Karakter playable | <50k | 2048² ×4 mat | ~120 (inc physics) |
| Hilichurl | 5-8k | 1024² | ~40 |
| Slime | 1-2k | 512² | ~6 |
| Abyss Mage | 8-12k | 2048² | ~50 |
