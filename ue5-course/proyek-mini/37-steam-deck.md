# Bagian 37 — Steam Deck Optimization · *lanjutan*

Steam Deck = pasar besar untuk indie. Optimasi + UI + input untuk handheld.

## 37A. Target Performa

Steam Deck specs:
- Resolusi: **1280×800** (layar), atau dock ke TV
- GPU: setara ~GTX 1050 (APU custom)
- RAM: 16GB (shared)
- **Target: 30fps stabil** (atau 40fps di mode 40Hz)

> Steam Deck jalan game Windows via **Proton** (kompatibilitas layer). Test
> di Proton, bukan cuma Windows native. Ada tool `Steam Deck` verified
> checklist di Steamworks.

## 37B. Scalability Presets

Bikin preset kualitas (UE punya sistem Scalability bawaan: 0=Low..4=Cinematic):

| Setting | Low | Medium | High | Ultra |
|---|---|---|---|---|
| Resolution Scale | 70% | 85% | 100% | 100% |
| Shadows | Low | Medium | High | Epic |
| Post Process | Low | Medium | High | Epic |
| Textures | Medium | High | Epic | Epic |
| Effects | Low | Medium | High | Epic |
| View Distance | Near | Medium | Far | Epic |
| Anti-Aliasing | TAA | TAA | TSR | TSR |
| FPS Cap | 30 | 60 | 120 | ∞ |

Apply via console command / `UGameUserSettings` (sudah ada di project C++
`UUIStatics::ApplyGraphicsSettings`):
```
Set Overall Scalability Level (0-4)
r.ScreenPercentage 85
t.MaxFPS 30
```

## 37C. Deteksi Steam Deck

```
[IsSteamDeck]
   [Get Platform Name] → cek "SteamDeck"
   ATAU cek GPU name mengandung "Custom GPU 0405" (APU Deck)
   ATAU env var SteamDeck=1
   → True: auto-set preset Medium + resolusi 1280×800 + FPS 30
```

Node: `Get Gpu Driver Info` / platform check. Set default preset saat first
boot di Deck.

## 37D. UI Scaling (layar kecil 7")

- **DPI Scaling**: Project Settings → User Interface → DPI Scaling Rule =
  **Shortest Side**, kurva scale sesuai resolusi. UI otomatis membesar di
  layar kecil.
- Settings tambah **UI Scale slider** 0.8-1.5× (default 1.0 desktop, 1.2 Deck).
- Semua widget bungkus **Scale Box** atau anchor benar — teks & tombol harus
  kebaca & keteken di 7 inci. Tombol min 40×40px pada resolusi Deck.

## 37E. Input Steam Deck

- Default ke **gamepad** ([Bagian 35](35-controller-support.md)) — Deck
  punya kontrol built-in (stick, trackpad, gyro).
- **Gyro aiming**: opsional, di-config lewat Steam Input (bukan game) —
  cukup dukung gamepad, Steam handle gyro→stick.
- **Touchscreen**: support tap untuk menu/inventory (Button UMG sudah
  handle touch = klik).
- **On-screen keyboard**: input teks (nama, chat) → Steam overlay keyboard
  otomatis muncul di field text, atau panggil `ShowVirtualKeyboard`.

## 37F. Steam Deck Verified Checklist (target)

- [ ] Semua fungsi dengan gamepad (tanpa mouse/keyboard)
- [ ] Text kebaca di 1280×800 (font ≥ ukuran minimum)
- [ ] Default graphics preset cocok (30fps stabil)
- [ ] Glyph controller Steam Deck / Xbox ditampilkan benar
- [ ] Tidak butuh keyboard eksternal (on-screen keyboard untuk input)
- [ ] Jalan di Proton tanpa crash

## ✅ CHECKPOINT

- [ ] Preset Low-Ultra apply benar (cek `stat fps` tiap preset)
- [ ] Auto-detect Deck → preset Medium + 1280×800 + 30fps
- [ ] UI kebaca & keteken di resolusi kecil
- [ ] Full gamepad, on-screen keyboard untuk teks

## 🎓 Track proyek-mini: Bagian 7-37

37 bagian: dari nol sampai action RPG open world siap rilis multi-platform —
combat, elemental reaction, boss, quest, dialog, cutscene, inventory, gear,
party, minimap, domain, co-op-ready, battle pass, polish, controller,
localization, Steam Deck. **Blueprint lengkap sebuah game komersial.**

Sisanya: eksekusi + konten + rilis. Naik C++:
[Modul 14](../14-capstone-aether-realm.md) → bedah `aether-realm-ue5`.
