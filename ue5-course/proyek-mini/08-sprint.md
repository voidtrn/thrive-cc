# Bagian 08 — Input Sprint

Karakter baru bisa jalan & lompat. Tambah: **Shift = lari**.

## 8A. Bikin Input Action

1. Content Browser → folder `Content/ThirdPerson/Input/Actions`
   (tidak ada? bikin folder sendiri).
2. Klik kanan → **Input → Input Action** → nama `IA_Sprint`.
3. Double-click → **Value Type: Digital (bool)** (default) → Save.

## 8B. Mapping ke Tombol Shift

1. Buka `Content/ThirdPerson/Input/IMC_Default` (Input Mapping Context).
2. **+ Mappings** → dropdown pilih `IA_Sprint`.
3. Kolom key: klik ikon **keyboard kecil** → tekan `Left Shift`
   (otomatis terisi). Save.

## 8C. Logic di Blueprint

1. Buka `BP_ThirdPersonCharacter` → **Event Graph**.
2. Klik kanan area kosong → ketik `IA_Sprint` → pilih
   **EnhancedInputAction IA_Sprint**.

> ⚠️ Nama pin Enhanced Input: **Started** (baru ditekan) dan
> **Completed** (dilepas) — bukan Pressed/Released seperti sistem lama.

3. Susun:

```
[EnhancedInputAction IA_Sprint]
   Started ───▶ [Get Character Movement] ─▶ [Set Max Walk Speed]  600
   Completed ─▶ [Get Character Movement] ─▶ [Set Max Walk Speed]  400
```

Step detail:
1. Drag dari pin **Started** → lepas → search `Get Character Movement` —
   eh, itu bukan exec node. Cara benar: drag **Started** → search
   `Set Max Walk Speed` → node muncul dengan pin Target → drag pin
   **Target** → search `Get Character Movement` → sambung.
2. Isi Max Walk Speed = `600`.
3. Ulangi dari **Completed** → `400`.

4. **Compile → Save → Play.** Shift = lari! 🏃

## Tuning rasa

| Mau | Ubah |
|---|---|
| Sprint lebih ngebut | 600 → 750 |
| Akselerasi berat (realistis) | Character Movement → Max Acceleration 1000 |
| Kamera "mundur" saat sprint (keren) | Started → juga Set Target Arm Length 500; Completed → 400 (pakai node **Timeline** biar halus — bonus) |

## ✅ CHECKPOINT

- [ ] Shift tahan = cepat, lepas = normal
- [ ] Paham alur IA → IMC → Event (kalau lupa: [Modul 06](../06-karakter-dan-input.md))

➡️ [Bagian 09 — Stamina](09-stamina.md)
