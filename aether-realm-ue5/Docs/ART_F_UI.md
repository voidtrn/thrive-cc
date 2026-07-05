# SECTION F — UI Art & Motion Design

C++ tersedia: **`UUITweenSubsystem`** — animasi UI tanpa UMG Animation asset:
```
// dari BP mana pun:
GetWorld → SubsystemUITween → Play(TargetWidget, PopIn, 0.3)
// preset: PopIn (overshoot elastis), PopOut, FadeIn/Out, SlideInRight (toast), Pulse
```
UMG Animation asset tetap dipakai untuk sequence kompleks (wish reveal).

## F1. UI Art Style

- **Style**: fantasy + clean modern, ornate frame tipis (jangan berat)
- **Warna**: emas `#FFD700` + biru gelap `#0A1128`; premium = emas
- Background panel: dark 80% opacity + `BackgroundBlur` widget (blur game world)
- **Font**: serif untuk heading (cinematic), sans-serif body; pastikan
  support glyph EN+JP+ID (Noto family aman)
- Icons: hand-drawn feel, line weight konsisten

**Element icons** (SVG → 256 PNG): Pyro flame teardrop · Cryo snowflake ·
Electro bolt · Hydro drop · Anemo swirl · Geo diamond · Dendro leaf —
satu set, silhouette jelas di 24px.

**Item icons**: 128×128, perspektif konsisten (3/4 top), background
gradient by rarity + border: 3★ biru, 4★ ungu, 5★ emas + glow
(warna sudah C++ `UUIStatics::GetRarityColor` — pakai untuk border tint).

**Komponen**: button rounded + gold border + subtle gradient; panel filigree
corner (9-slice texture); scrollbar gold tipis; slider gold track + crystal
knob; tab gold underline aktif; tooltip dark + gold border + `PopIn` tween.

## F2. UI Animations

| Event | Animasi | Implementasi |
|---|---|---|
| Open menu | scale up + fade 0.3s ease-out | `Play(Panel, PopIn, 0.3)` ✅ |
| Close menu | scale down + fade 0.2s | `Play(Panel, PopOut, 0.2)` ✅ |
| Tab switch | crossfade 0.15s | `FadeOut` lama + `FadeIn` baru ✅ |
| Popup/dialog | elastic from center 0.25s | `PopIn` (ease-out-back built-in) ✅ |
| Toast notification | slide dari kanan + auto dismiss | `SlideInRight` + timer → `FadeOut` ✅ |
| HP bar | smooth decrement | progress bar: interp value di Tick BP (`FInterpTo` speed 5) — jangan instant |
| Skill cooldown | radial fill + angka countdown | material radial mask, param dari `GetSkillCooldownFraction` (Phase 7) |
| Energy full | glow pulse | `Play(BurstIcon, Pulse, 0.8)` loop selama `IsBurstReady` ✅ |
| Damage number | pop + float + fade | WBP_DamageNumber (Phase 3) |
| Quest update | slide in + glow + idle | `SlideInRight` + UMG anim glow |
| Wish 5★ | golden glow + screen shake dikit | UMG Animation asset + `PlayHitShake` |
| Loading | bar fill + glow pulse, tips fade cycle, artwork slow pan | UMG anim; transisi fade black in/out |

## F3. Character Screen (3D + UI)

Layout (spec):
```
[Back]                    [Nama] [Lv/Asc]
 ┌──────────┐   Stats: HP/ATK/DEF/EM/Crit/ER
 │ 3D Model │   (baca langsung properti ACharacterBase)
 │  rotate  │
 └──────────┘
 [Weapon]  [Fl][Pl][Sa][Go][Ci]  ← artifact slots (EArtifactSlot)
 [Talents NA/E/Q]  [Constellations]
```

3D render:
1. `BP_CharPreviewStage`: SkeletalMesh + SceneCapture2D → `RT_CharPreview`
   1024², spawn di sublevel tersembunyi / jauh di bawah map
2. Lighting rig: key light kiri-atas (hangat), **rim light belakang**
   (warna elemen karakter), fill lemah — dramatis anime
3. Background: gradient material by element (`Pyro` merah dst — ambil dari
   `AVFXManager::ElementColors` konsisten)
4. Interaksi: mouse drag X → yaw mesh; scroll → capture FOV/distance;
   idle auto-rotate 5°/s setelah 3s tanpa input
5. Anim: idle personality (BS_IdlePose), weapon socket visible
6. Ganti karakter: swap SkeletalMesh + anim dari `FCharacterDefRow`

## Referensi row F ke sistem yang ada

- Stats panel ← `ACharacterBase` (HP/ATK/DEF/EM/Crit/ER — Phase 2)
- Artifact slots ← `GI->OwnedArtifacts` filter `EquippedCharacter` (Phase 7)
- Talents/Constellation ← data ada di `FCharacterSaveData` (level/ascension);
  talent level up & constellation = sistem Phase konten (post-scaffold)
