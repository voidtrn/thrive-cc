# Bagian 21 — Polish & Quality of Life

Lima hal kecil yang membuat game terasa "mahal": hit stop, camera shake,
damage flash, auto-save, settings.

## 21A. Hit Stop (freeze-frame saat pukulan kena)

Function `DoHitStop` di karakter:

```
[DoHitStop] (Input: Duration = 0.05)
   [Set Global Time Dilation = 0.05]
   [Delay]  Duration × 0.05        ← PENTING: Delay ikut melambat juga!
   [Set Global Time Dilation = 1.0]     durasi real = Duration → kali dilation
```

Panggil di `DoAttackTrace` setelah damage kena (Bagian 13D) & di skill.
Efeknya tak terlihat tapi TERASA — coba on/off, beda banget.

## 21B. Camera Shake

1. Blueprint Class → parent **Camera Shake Base** → `CS_AttackImpact`.
2. Buka → Details → **Root Shake Pattern → Wave Oscillator Camera Shake
   Pattern** ← langkah yang sering kelewat di UE5 (tanpa pattern = tidak
   ada apa-apa).
3. Isi di pattern:
   - Duration 0.2
   - Rotation: Pitch Amplitude 0.5 / Frequency 20; Yaw 0.3
   - Location: Z Amplitude 2 / Frequency 15
4. Panggil setelah hit:

```
[Get Player Controller] ─▶ [Client Start Camera Shake] CS_AttackImpact
```

Bikin `CS_SkillImpact` kedua (amplitude 2×) untuk skill. Jangan berlebihan —
shake halus > shake mual.

## 21C. Damage Vignette (layar merah saat kena hit)

1. `W_DamageVignette`: **Image** full screen (Anchor: stretch penuh,
   offset 0 semua) → warna merah → **Render Opacity 0** → penting:
   Visibility **Not Hit-Testable** (biar tidak blokir klik).
2. Animation `FlashRed`: Render Opacity `0 → 0.35 → 0` (0 → 0.05 → 0.4s).
3. Add to Viewport di BeginPlay (bareng W_HUD), simpan referensi.
4. Di event `TerimaDamage` player → `Play Animation FlashRed`.

Bonus: HP < 30% → vignette merah tipis permanen berdenyut
(loop animation, stop saat heal).

## 21D. Auto-Save

1. Blueprint Class → parent **Save Game** → `SG_GameData`. Variables —
   semua yang perlu bertahan:
   `PlayerLocation` (Vector), `PlayerRotation` (Rotator), `CurrentPartyIndex`,
   `CharacterStates` (array — struct HP/cooldown per karakter),
   `CompletedQuestIDs`, `ActiveQuestIDs` (Name array) + `QuestStepIndex` &
   `QuestStepCount` (Map), `OculiCollected`, `Gold`, `XP`, `PlayTime`.

   > Quest disimpan sebagai **ID (Name)**, bukan reference Data Asset —
   > saat load, cari Data Asset-nya lagi by ID. (Alasan yang sama dengan
   > Bagian 17: asset ≠ progress.)

2. Function `SimpanGame` (di Game Instance BP — [Modul 11](../11-arsitektur-game.md)):

```
[Create Save Game Object SG_GameData]
   → isi semua field dari state sekarang
   → [Save Game to Slot] "Slot1"
```

3. Function `MuatGame`: `Does Save Game Exist` → Load → Cast → terapkan
   semua → `Set Actor Location & Rotation` player.
4. **Trigger auto-save**:
   - Selesai quest (`CompleteQuest` → SimpanGame)
   - Ambil oculus / buka chest
   - Timer 5 menit di Game Instance (`Set Timer by Event`, Looping)
   - Toast kecil "Menyimpan…" pojok layar (biar pemain tahu)

## 21E. Settings Menu

1. `W_Settings` (buka dari tombol gear / Esc):

| Kelompok | Widget | Apply |
|---|---|---|
| Quality preset | ComboBox Low/Med/High/Ultra | Console command: `sg.PostProcessQuality 0-3` dst — atau 1 command `scalability 0-3` |
| Resolusi | ComboBox | `r.SetRes 1920x1080f` (f=fullscreen, w=window) |
| FPS Cap | ComboBox 30/60/120/0 | `t.MaxFPS 60` |
| VSync | CheckBox | `r.VSync 1` / `0` |
| Master/Music/SFX Volume | Slider 0-1 | **Set Sound Mix Class Override** (butuh Sound Class + Sound Mix — buat `SC_Master`, `SC_Music`, `SC_SFX`, assign ke asset suara; node override per class) |
| Mouse Sensitivity | Slider | variabel multiplier di input Look (kalikan Action Value) |
| Invert Y | CheckBox | kalikan -1 pitch input |

2. Console command dari BP: node **Execute Console Command**.
3. Simpan settings ke `SG_GameData` (atau slot terpisah `SG_Settings`) +
   apply ulang saat BeginPlay Game Instance.

## 🏁 TRACK PROYEK-MINI TAMAT

Yang kamu punya sekarang (bagian 7-21): karakter anime berfisika, sprint/
stamina, glide, chest, oculi, combo buffer, damage interface, enemy AI,
skill elemen + cooldown, quest + NPC + marker, party swap 4 karakter,
minimap bulat berputar, hit stop, camera shake, vignette, auto-save,
settings. **Itu fondasi lengkap action RPG open world.**

Langkah berikutnya, pilih:
1. **Konten**: pulau lebih besar (Modul 09), 5 quest, 3 jenis musuh
2. **Naik kelas**: [Modul 10-11 C++](../10-cpp-dasar.md) → lalu
   [Modul 14 Capstone](../14-capstone-aether-realm.md) — bandingkan semua
   yang kamu buat dengan versi produksi `aether-realm-ue5` (tiap sistem
   track ini ada padanan C++-nya di sana)
3. **Rilis**: [Modul 13](../13-optimasi-packaging.md) — package & bagikan

## ✅ CHECKPOINT FINAL

- [ ] Hit stop + shake + vignette aktif — combat terasa "berat"
- [ ] Quit game → buka lagi → Load → posisi/quest/party/oculi utuh
- [ ] Settings kepakai & tersimpan antar sesi
