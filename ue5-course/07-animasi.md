# Modul 07 — Animasi

**Target:** paham skeleton → anim → blend space → Animation Blueprint → montage.

## 1. Rantai animasi (peta besar)

```
Skeletal Mesh (model + tulang)
   └─ Skeleton asset (hierarki tulang — bisa dishare antar mesh)
        ├─ Animation Sequence (1 gerakan: lari, lompat...)
        ├─ Blend Space (campuran anim by parameter: idle↔jalan↔lari by Speed)
        ├─ Animation Montage (anim sekali jalan + kontrol dari BP: serangan)
        └─ Animation Blueprint (OTAK: pilih anim mana kapan)
              ├─ Event Graph (hitung variabel: Speed, bInAir...)
              └─ Anim Graph (State Machine → pose akhir)
```

Template Third Person sudah punya semuanya — kita bedah, bukan bikin dari nol.

## 2. Bedah ABP template

Buka `Content/Characters/Mannequins/Animations/ABP_Manny`:

**Event Graph** — tiap frame ambil data dari karakter:
```
[Event Blueprint Update Animation]
   ─▶ ambil velocity karakter → [Set Speed]
   ─▶ ambil IsFalling dari CharacterMovement → [Set bInAir]
```

**Anim Graph** → double-click state machine **Locomotion**:

```
   ┌────────┐  Speed > 3   ┌──────────────┐
   │  Idle  │─────────────▶│  Walk / Run  │  ← di dalamnya Blend Space
   │        │◀─────────────│ (BS by Speed)│
   └────────┘  Speed < 3   └──────────────┘
        │  bInAir                 │ bInAir
        ▼                         ▼
   ┌─────────────────────────────────┐
   │ Jump (start → loop → land)      │
   └─────────────────────────────────┘
```

Kotak = **State** (isi: anim/blend space). Panah = **Transition** (isi:
kondisi bool). Klik panah → lihat rule-nya.

## 3. Blend Space

Buka `BS_MF_Unarmed_WalkRun` (atau sejenis): grid dengan sumbu **Speed** —
titik-titik = anim (idle di 0, walk di 200, run di 500). Engine otomatis
blend di antaranya. Geser preview (Ctrl+drag) → lihat transisi halus.

Bikin sendiri: klik kanan → Animation → **Blend Space 1D** → pilih skeleton
→ set Axis (nama `Speed`, 0-800) → drag anim ke grid.

## 4. Animation Montage — serangan

Anim biasa dikontrol state machine. **Montage** dikontrol manual dari BP —
cocok untuk attack/skill:

1. Klik kanan anim serangan (cari gratis: modul ini pakai anim pack
   marketplace/Mixamo — lihat `aether-realm-ue5/Docs/ART_E_ANIMATION.md`) →
   **Create → Create AnimMontage**.
2. Di karakter BP:

```
[IA_Attack: Started] ──▶ [Play Montage]  (pilih montage, mesh = Mesh)
```

3. Supaya montage jalan, Anim Graph harus punya **Slot 'DefaultSlot'** node
   (template sudah ada — di jalur sebelum Output Pose).

**Anim Notify** = penanda di frame tertentu montage → memicu event di BP:
buka montage → klik kanan di track Notifies → Add Notify → New Notify →
`AN_Hit`. Di ABP Event Graph muncul event `AnimNotify_AN_Hit` → dipakai untuk
"frame ini pedang kena" (project aether-realm pakai pattern ini persis —
`AN_ComboHit`).

## 5. Retarget singkat (anim orang lain → karakter kamu)

UE 5.4: klik kanan anim → **Retarget Animations** → pilih Source/Target
IK Rig → duplicate & retarget. Detail lengkap per-langkah: modul 14 +
`Docs/ART_E_ANIMATION.md` di project.

## 6. 🔨 PRAKTIK

1. Ubah kondisi transisi Idle→Walk jadi Speed > 100 → rasakan telatnya.
   Balikin.
2. Download 1 anim attack dari Mixamo (gratis) → import → retarget ke
   mannequin → bikin montage → mainkan dengan `IA_Attack` (bikin IA-nya,
   modul 06 skill).
3. Tambah Anim Notify `AN_Hit` di frame impact → di ABP print string
   "KENA!" → perhatikan timing-nya pas ayunan.
4. **Tantangan**: variabel `bSedangNyerang` di karakter — set true saat
   montage main, false saat selesai (node Play Montage punya output
   `On Completed`) → blokir gerakan saat menyerang (Branch di input Move).

## ✅ CHECKPOINT

- [ ] Bisa gambar rantai: SkelMesh → Skeleton → Anim/BS/Montage → ABP
- [ ] Paham state machine + transition rule
- [ ] Montage + notify jalan dari input sendiri

📖 [Animation Blueprints (docs)](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-blueprints-in-unreal-engine)

➡️ [Modul 08 — Gameplay: Collision, Damage, UI](08-gameplay-collision-ui.md)
