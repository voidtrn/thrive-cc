# Modul 07 — Karakter & Animasi

> **Target modul:** paham pipeline karakter dari mesh sampai gerak, bisa memakai Animation Blueprint, dan membuat karakter capstone terasa hidup.

## 7.1 Anatomi Karakter Game

```
Skeletal Mesh (kulit/model 3D)
    └── Skeleton (rangka tulang/bones)
            └── Animation (data gerak tulang per-frame)
                    └── Animation Blueprint (otak: pilih & campur animasi)
```

- ***Skeletal Mesh*** — model 3D yang "dikuliti" (*skinning*) ke rangka: tiap vertex mengikuti tulang tertentu.
- ***Skeleton*** — hierarki tulang (pelvis → spine → ... → hand_r). Animasi bisa **dibagi antar-karakter yang rangkanya kompatibel**.
- ***Animation Sequence*** — satu klip gerak (lari, lompat, tebasan).
- ***Animation Blueprint (ABP)*** — logika yang memutuskan animasi mana diputar kapan dan bagaimana dicampur.

**Sumber karakter & animasi tanpa jago 3D:**
- **Mannequin UE5 (Manny/Quinn)** — bawaan template, sempurna untuk prototype.
- **MetaHuman** — manusia fotorealistik gratis (MetaHuman Creator di browser).
- **Fab/Marketplace** — karakter + paket animasi.
- **Mixamo** (Adobe, gratis) — auto-rig + ratusan animasi (perlu *retarget* ke skeleton UE).
- Rekam sendiri: plugin capture via kamera HP semakin layak dipakai untuk indie.

## 7.2 Animation Blueprint: Otak Gerakan

Dobel-klik `ABP_Manny` (bawaan template) — dua bagian utama:

**1. Event Graph** — kumpulkan data tiap frame:
```
Event Blueprint Update Animation
→ ambil kecepatan karakter (GetVelocity → VectorLength) → simpan ke var Speed
→ ambil status jatuh (CharacterMovement → IsFalling) → var IsFalling
```

**2. AnimGraph** — putuskan pose akhir lewat node:
- **State Machine** — kotak berisi state (Idle/Walk/Run, Jump, Fall, Land) dan **transition rule** (panah dengan kondisi: `Speed > 10` → jalan).
- **Blend Space** — mencampur animasi berdasar parameter kontinu. Contoh klasik: sumbu X = arah, sumbu Y = kecepatan → jalan-serong-lari mulus. Buat: klik kanan → Animation → Blend Space; drag klip ke grid.
- **Slot** (mis. `UpperBody`) — jalur untuk *Animation Montage*.

**Alur mental:** Event Graph = sensor. State Machine = keputusan besar (sedang apa?). Blend Space = kehalusan dalam state. 

## 7.3 Animation Montage: Aksi Sekali Jalan

*Montage* = wadah animasi untuk aksi yang DIPICU (bukan siklus): serangan, minum potion, roll, finisher.

**Setup serangan melee (step by step):**
1. Klik kanan animasi tebasan → **Create → AnimMontage** → `AM_Serang1`.
2. Di ABP AnimGraph, pastikan ada node **Slot 'DefaultSlot'** (atau `UpperBody` agar kaki tetap berjalan).
3. Di Character Blueprint: Input serang → node **Play Montage** `AM_Serang1`.
4. **Anim Notify** — penanda di timeline montage: klik kanan di track notify → Add Notify → `AN_HitCheck` pada frame pukulan mengenai. Di ABP/karakter, event notify itu → lakukan trace → apply damage.
   - 💡 Notify = jembatan animasi ↔ gameplay: langkah kaki → suara, frame tebas → damage, akhir reload → isi peluru.
5. **Combo:** montage punya **Section** (Serang1, Serang2, Serang3). Input saat *combo window* terbuka → `Montage Jump To Section`.

## 7.4 Retargeting: Pinjam Animasi Antar-Karakter

Punya animasi untuk skeleton A, karakter ber-skeleton B (mis. Mixamo → UE5)? **IK Retargeter** memindahkannya:
1. Buat **IK Rig** untuk tiap skeleton (definisikan chain: spine, arm_l, leg_r...).
2. Buat **IK Retargeter** source→target → preview → **Export Retargeted Animations**.
3. UE 5.4+ juga bisa retarget instan: klik kanan animasi → Retarget Animations. Duplikat + retarget bila hasil auto kurang rapi.

## 7.5 Membuat Gerakan Terasa Enak (Game Feel)

Nilai default = rasa "mengambang". Tuning `CharacterMovementComponent`:

| Properti | Efek |
|----------|------|
| Max Walk Speed | Kecepatan lari (600 default; coba 450–500 untuk berat) |
| Braking / Ground Friction | Berhenti tajam vs meluncur |
| Jump Z Velocity + **Gravity Scale** | Lompatan. 🔥 Gravity 1.0 terasa "bulan" — game aksi bagus sering pakai 1.5–2.5 + JumpZ dinaikkan |
| Air Control | Kendali saat melayang |
| Rotation Rate | Kecepatan karakter berbalik |

Tambahan rasa: **camera lag** (di SpringArm), sedikit **FOV kick** saat sprint, *hit stop* mikro saat pukulan kena (set global time dilation 0.05 selama 0.05 dtk), *screen shake* halus (Camera Shake). Kecil-kecil ini yang membedakan "prototype" dari "game".

## 7.6 Sekilas Rigging & Control Rig

- *Rigging* = memasang tulang + kontrol pada model (dilakukan di Blender/Maya; auto-rig: Mixamo, AccuRig).
- **Control Rig** UE = rig & animasi langsung DALAM engine — plus **IK** runtime: kaki menapak akurat di tangga (foot placement), tangan meraih gagang pintu. Untuk capstone: cukup tahu ini ada; dalami bila jalur animasimu.

## Latihan Modul 07 — Karakter Capstone Hidup

1. Telusuri `ABP_Manny`: buka state machine locomotion, baca tiap transition rule. Tulis ulang alurnya dengan kata-kata sendiri.
2. Ganti/atur karakter: pakai Manny/Quinn atau import karakter Fab/Mixamo + retarget.
3. Tuning CharacterMovement sampai gerakan terasa "milikmu" (catat nilai sebelum/sesudah).
4. Buat serangan melee: montage + notify hit check + damage ke `HealthComponent` (Modul 05). 
5. Tantangan: combo 3-hit dengan section + combo window.
6. Tambah 1 blend space (idle→walk→run) bila belum ada, sambungkan ke Speed.

## Checklist Paham

- [ ] Aku paham rantai SkeletalMesh → Skeleton → Animation → ABP.
- [ ] Aku bisa membaca & mengubah state machine + blend space.
- [ ] Aku bisa membuat montage + anim notify untuk gameplay.
- [ ] Aku bisa retarget animasi antar skeleton.
- [ ] Aku sudah tuning movement — karakterku tidak terasa default.

➡️ Lanjut: [Modul 08 — Gameplay Systems](08-gameplay-systems.md)
