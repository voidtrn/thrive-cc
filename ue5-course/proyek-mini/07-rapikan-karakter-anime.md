# Bagian 07 — Rapikan Karakter Anime

Karakter VRoid biasanya masih kaku: rambut & baju tidak bergerak. Kita perbaiki.

## 7A. Physics Rambut & Baju

### Cara A — Physics Asset (bawaan UE)

1. Content Browser → folder karakter VRoid → cari **Physics Asset**
   (ikon tulang, nama biasanya `..._PhysicsAsset`) → double-click.
2. Yang kamu lihat: **bola/kapsul menutupi tulang** = "physics bodies" —
   bagian yang bisa digerakkan fisika.

```
   kepala ●
   hair_01 ○      ← klik body di tulang rambut
   hair_02 ○
   hair_03 ○      ← ujung: paling perlu Simulated
```

3. **Rambut**: panel kiri (Skeleton Tree) cari tulang `hair_*` →
   klik body-nya → panel Details → **Physics Type: Default → Simulated**.
   Ulangi untuk tiap tulang rambut (minimal 2-3 segmen ujung).
   - Tulang rambut belum punya body? Klik kanan tulang → **Add Shape → Capsule**.
4. **Rok/baju**: sama — tulang `skirt_*`/`coat_*` → Simulated.
5. **Tes**: tombol **Simulate** di toolbar → rambut & rok jatuh kena gravitasi.
6. Terlalu lembek/kaku? Pilih body → Details:
   - **Linear Damping** 0.5-1.0 (redam gerak)
   - **Angular Damping** 1.0-3.0 (redam putaran) — makin besar makin kalem
   - Masih tembus badan? Tambah body di badan + atur collision antar body
7. Save → close.

### Cara B — KawaiiPhysics (lebih bagus untuk anime, gratis)

Plugin **KawaiiPhysics** (GitHub/Fab, gratis) = node di Anim Blueprint khusus
rambut/rok anime — lebih stabil & gampang dari Physics Asset. Kalau hasil
Cara A kurang memuaskan, ini upgrade-nya:
AnimGraph → node `KawaiiPhysics` → Root Bone = `hair_root` → selesai.
(Rekomendasi produksi: `aether-realm-ue5/Docs/ART_A_CHARACTERS.md`.)

## 7B. Animasi (Mixamo — gratis)

**Jalur realistis untuk pemula:**

1. **Pakai dulu animasi bawaan template Third Person** — jalan, lari, lompat
   sudah ada dan sudah jalan. Cukup untuk semua bagian track ini. ✅
2. Nanti kalau mau animasi tambahan (attack, dance):
   - mixamo.com → login Adobe (gratis) → pilih karakter default mereka
     (X Bot) → cari animasi → Download **FBX Binary, Without Skin, 30fps**
   - UE: Import FBX → saat dialog, Skeleton: **buat/pilih skeleton Mixamo**
   - **Retarget** ke karakter VRoid: klik kanan animasi → **Retarget
     Animations** → set Source (Mixamo) & Target (VRoid) IK Rig → Retarget
   - Detail IK Rig step-by-step: course utama
     [Modul 07](../07-animasi.md) + `Docs/ART_E_ANIMATION.md`

> Jujur: retargeting agak teknis. Jangan biarkan ini menghentikanmu —
> animasi template dulu, retarget belakangan.

Karakter VRoid mau pakai animasi template? Buka `BP_ThirdPersonCharacter` →
komponen Mesh → ganti Skeletal Mesh ke VRoid → Anim Class tetap `ABP_Manny`
**hanya kalau skeleton sama** — biasanya beda, jadi: retarget `ABP` via
IK Retargeter, ATAU pakai plugin VRM4U yang menyediakan retarget otomatis.

## 7C. Perbaiki Posisi Karakter

Karakter melayang / kepotong tanah:

1. `BP_ThirdPersonCharacter` → klik komponen **Mesh**.
2. Details → Transform → **Location Z**:
   - Melayang → turunkan (coba `-90`)
   - Kepotong → naikkan (coba `-80`)
3. Kaki harus pas di bawah lingkaran capsule (lihat viewport BP dari samping):

```
   ┌─────┐
   │ ● ● │  ← capsule (collision)
   │ /|\ │  ← mesh di dalamnya
   │ / \ │
   └──┴──┘  ← telapak kaki = dasar capsule ✓
```

4. Karakter menghadap samping? **Rotation Z = -90** (mesh harus hadap
   sumbu X panah biru).
5. Compile → Save → Play → ulangi sampai pas.

## ✅ CHECKPOINT

- [ ] Rambut/rok bergerak saat lari & berhenti
- [ ] Karakter tidak melayang/tenggelam
- [ ] Jalan-lompat pakai animasi template lancar

➡️ [Bagian 08 — Sprint](08-sprint.md)
