# Bagian 35 — Controller Support · *lanjutan*

Gamepad + navigasi UI + button prompt. Enhanced Input bikin ini jauh lebih
gampang dari sistem lama.

## Koreksi penting duluan

Outline umum bilang "bikin IMC_Gamepad terpisah". **Sebenarnya tidak perlu.**
Enhanced Input: satu Input Action bisa di-map ke **keyboard DAN gamepad
sekaligus** di IMC yang sama. `IA_Jump` = Space **dan** Gamepad Face Button
Bottom. Otomatis dua-duanya jalan.

Bikin IMC terpisah cuma kalau layout tombol beda drastis (jarang).

## 35A. Tambah Gamepad Key ke IMC

Buka `IMC_Default` → tiap mapping, klik **+** key kedua → pilih tombol gamepad:

| Action | Keyboard | Gamepad (Xbox) |
|---|---|---|
| Move | WASD | **Gamepad Left Thumbstick 2D** (pakai modifier) |
| Look | Mouse XY | **Gamepad Right Thumbstick 2D** |
| Jump | Space | Face Button Bottom (A) |
| Sprint | L-Shift | Left Thumbstick Button |
| Dodge | RMB | Face Button Right (B) |
| Attack | LMB | Right Shoulder (RB) |
| Skill | E | Right Trigger (RT) |
| Burst | Q | Left Shoulder (LB) |
| Interact | F | Face Button Left (X) |
| Map/Inventory/Pause | M/I/Esc | View / Y / Menu |
| Swap 1-4 | 1-4 | D-Pad Up/Right/Down/Left |

> Stick 2D untuk Move: 1 mapping `Gamepad Left Thumbstick` (Axis2D). Kalau
> keyboard pakai 4 tombol WASD dengan modifier, biarkan — Enhanced Input
> gabung outputnya. Stick otomatis Axis2D.

## 35B. Navigasi UI dengan Gamepad

UMG mendukung navigasi D-pad/stick bawaan, tapi harus di-setup:

1. Tiap **Button** → Details → **Is Focusable ✓**.
2. **Set default focus** saat widget dibuka:
   ```
   [Event Construct] → [Set Keyboard Focus] (target: tombol pertama)
   ```
3. Navigasi antar tombol: Details tombol → **Navigation** → set Up/Down/
   Left/Right (Explicit ke tombol tertentu, atau biarkan Auto).
4. Tombol "confirm" gamepad (A) otomatis meng-klik tombol yang fokus.

## 35C. Cursor Auto Hide/Show

```
[Event Tick / atau input event]
   [Branch: input terakhir dari gamepad?]
     True → Hide Mouse Cursor
     False (mouse gerak) → Show Mouse Cursor
```

Deteksi device: bind ke event input, atau pakai plugin **Common UI**
(`GetCurrentInputType`) — cara UE5 resmi.

## 35D. Button Prompt Dinamis

Prompt "Tekan F" harus jadi "Tekan Ⓧ" saat pakai gamepad:

1. Deteksi device aktif (keyboard vs gamepad) — Common UI atau cek input
   terakhir.
2. Widget prompt: Image icon + Text. Switch icon by device:
   - Keyboard → gambar tombol "F"
   - Xbox → gambar "X" button, PlayStation → "□"
3. Simpan set icon per platform (texture atlas tombol).

> **Common UI plugin** (bawaan UE5) punya `CommonActionWidget` yang otomatis
> ganti icon prompt sesuai device — **sangat direkomendasikan**, hemat kerja
> manual banyak.

## 35E. Getar (Force Feedback)

Bonus juice: `Client Play Force Feedback` (target PC) saat hit/burst.
Buat `ForceFeedbackEffect` asset (kurva intensitas) → panggil di combat.

## ✅ CHECKPOINT

- [ ] Gamepad jalan tanpa IMC terpisah (key kedua di IMC_Default)
- [ ] Stick kiri gerak, stick kanan kamera, tombol sesuai tabel
- [ ] Menu bisa dinavigasi full gamepad (fokus + confirm A)
- [ ] Cursor auto hide saat gamepad
- [ ] Prompt ganti icon keyboard ↔ gamepad

➡️ [Bagian 36 — Localization](36-localization.md)
