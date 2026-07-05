# Bagian 11 — Sistem Interaksi: Buka Chest

Tekan **F** dekat peti = harta keluar. Pola interaksi ini nanti dipakai
untuk NPC, pintu, tombol — belajar sekali, pakai selamanya.

## 11A. Bikin Chest

1. **BP_Chest** (Blueprint Actor), Components:
   - **Static Mesh**: `SM_Crate`/kotak dari StarterContent (Props)
   - **Box Collision** — scale lebih besar dari peti (area deteksi ±150 unit)
     → rename `AreaDeteksi`
   - **Text Render** → Text: `[F] Buka`, hadapkan ke depan, warna kuning,
     Details → Rendering → **Visible ✗** → rename `Prompt`
2. Variabel: `bSudahDibuka` (bool, false).

## 11B. Tampilkan prompt saat dekat

Event Graph `BP_Chest`:

```
[On Component Begin Overlap (AreaDeteksi)]
   Other Actor ─▶ [Cast To BP_ThirdPersonCharacter]
      sukses ─▶ [Branch: NOT bSudahDibuka]
                  True ─▶ [Set Prompt Visibility = true]

[On Component End Overlap (AreaDeteksi)]
   ─▶ [Set Prompt Visibility = false]
```

## 11C. Input Interact + panggil chest

1. `IA_Interact` (Digital) + mapping **F** di IMC_Default.
2. **Custom Event di BP_Chest** — `BukaChest`:

```
[BukaChest]
   ─▶ [Branch: bSudahDibuka] True → (return, sudah pernah)
   ─▶ [Set bSudahDibuka = true]
   ─▶ [Set Prompt Visibility = false]
   ─▶ [Add Actor Local Rotation] tutup peti kebuka — atau simple:
       [Set Actor Scale 3D ×1.2] + [Spawn Emitter/Niagara kilau] (modul 12 course)
   ─▶ [Print String "Dapat 5 Primogem!"]
   ─▶ [Delay 2.0] ─▶ [DestroyActor]   (atau biarkan terbuka — lebih bagus)
```

3. **Di karakter** — cara pemula yang jujur & jalan (deteksi via overlap
   chest yang lagi dekat):

Cara paling sederhana: chest yang menyimpan referensi player? Balik arah —
**karakter simpan chest terdekat**:

- Variabel di karakter: `ChestDidekat` (Object Reference → BP_Chest)
- Di `BP_Chest` Begin Overlap (setelah cast sukses):
  `[Set ChestDidekat = self]` (target: hasil cast)
- End Overlap: `[Set ChestDidekat = null]` (kosongkan)
- Di karakter:

```
[EnhancedInputAction IA_Interact: Started]
   ─▶ [Branch: Is Valid (ChestDidekat)]
        True ─▶ [BukaChest] (target: ChestDidekat)
```

4. Taruh 3-5 chest di dunia → Play → dekati (prompt muncul) → F → harta! 🎁

## Level up (nanti, setelah nyaman)

- **Blueprint Interface** `BPI_Interaksi` ([Modul 04](../04-blueprint-lanjutan.md))
  → F bisa untuk chest, NPC, pintu tanpa cast satu-satu — variabel jadi
  `ActorDidekat` generik
- Isi chest data-driven (DataTable — [Modul 11](../11-arsitektur-game.md))
- Versi produksi: `aether-realm-ue5` `AChest` — 4 tier, locked, save state

## ✅ CHECKPOINT

- [ ] Prompt muncul/hilang saat mendekat/menjauh
- [ ] F cuma jalan saat dekat chest
- [ ] Chest tidak bisa dibuka 2×

➡️ [Bagian 12 — Oculi Collectible](12-oculi-collectible.md)
