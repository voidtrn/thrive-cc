# Bagian 10 — Sistem Gliding

Yang bikin rasa Genshin: lompat dari bukit, buka glider, melayang. 🪂

## 10A. Visual Glider

1. **BP_Glider** (Blueprint Actor):
   - Static Mesh: `Shape_Plane` dari StarterContent (atau model sayap
     gratis dari Fab) — scale melebar `(2.5, 1.2, 1)`, posisikan di atas kepala
   - Material: bikin `MI` warna favorit; mau transparan → master material
     Blend Mode Translucent + Opacity 0.7
2. Attach ke karakter — `BP_ThirdPersonCharacter`:
   - Components → **+ Add → Child Actor** → rename `GliderMesh`
   - Details → **Child Actor Class: BP_Glider**
   - Posisikan di atas punggung (drag di viewport BP)
   - Details → Rendering → **Visible: ✗** (tersembunyi default)

## 10B. Input & Logic

1. `IA_Glide` (Digital) + mapping **Space Bar** di IMC_Default.
   (Space sudah dipakai Jump? Tidak apa — kita cek "sedang di udara".)
2. Variabel baru di karakter: `bSedangGlide` (bool).

**Logic buka glider** (tekan Space saat di udara):

```
[EnhancedInputAction IA_Glide: Started]
   │
   ▼
[Branch] Condition: [Get Character Movement → Is Falling] AND [NOT bSedangGlide]
   │
   └─ True:
        [Set bSedangGlide = true]
        [Set GliderMesh Visibility = true]           (target: GliderMesh)
        [Get Character Movement] ─▶ [Set Gravity Scale = 0.15]
        [Get Character Movement] ─▶ [Set Air Control = 1.0]   ← bisa belok penuh
```

**Logic tutup glider** — dua pintu keluar:

```
(1) Tekan Space lagi saat glide:
[IA_Glide: Started] → Branch [bSedangGlide == true] → TutupGlider

(2) Mendarat:
[Event On Landed]  (klik kanan → search "Landed")  → TutupGlider
```

Bikin **Custom Event** `TutupGlider` biar tidak dobel:

```
[TutupGlider]
   [Set bSedangGlide = false]
   [Set GliderMesh Visibility = false]
   [Set Gravity Scale = 1.0]
   [Set Air Control = 0.35]
```

> ⚠️ Susun Branch buka/tutup di satu event `IA_Glide Started`:
> cek `bSedangGlide` DULU (true → tutup), baru cek Is Falling (buka).

**Batasi kecepatan jatuh** (biar melayang stabil) — di **Event Tick**,
setelah logika stamina:

```
[Branch: bSedangGlide]
   True ─▶ [Get Velocity] → Break Vector → Z
            [Branch: Z < -200]
               True ─▶ [Launch Character]  Velocity (0, 0, -200)
                        XY Override ✗ , Z Override ✓
```

(= kalau jatuh lebih cepat dari 200, paksa kembali ke 200. Versi C++
di project: `PhysFalling` di `OpenWorldMovementComponent`.)

**Drain stamina saat glide** — gabung ke Branch stamina bagian 09:
kondisi drain jadi `(bSedangSprint AND Stamina>0) OR (bSedangGlide AND Stamina>0)`,
drain glide lebih kecil (kali 5, bukan 20). Stamina habis saat glide →
panggil `TutupGlider` (jatuh beneran — ala Genshin 😈).

## 10C. Play Test

Naik bukit (atau taruh cube tinggi) → lompat → tekan Space lagi →
melayang turun pelan, bisa belok. Space lagi/mendarat → glider hilang. 🎉

## Polish opsional

- Animasi pose glide: [Modul 07](../07-animasi.md) — state machine, kondisi
  `bSedangGlide` (bikin variabel yang sama di ABP, baca dari karakter)
- Kamera menjauh saat glide: TutupGlider/buka → Set Target Arm Length 400/550
- Angin: suara loop wind saat glide (Audio Component play/stop)

## ✅ CHECKPOINT

- [ ] Lompat → Space = glide; Space/landing = normal
- [ ] Belok saat glide, kecepatan jatuh stabil
- [ ] Stamina drain saat glide, habis = jatuh

➡️ [Bagian 11 — Chest Interaksi](11-chest-interaksi.md)
