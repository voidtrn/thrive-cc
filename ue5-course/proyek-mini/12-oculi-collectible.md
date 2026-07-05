# Bagian 12 — Collectible: Oculi

Orb emas melayang tersebar di dunia. Sentuh = ambil, counter naik.
Reward eksplorasi — alasan pemain manjat bukit.

## 12A. Bikin Oculus

**BP_Oculus** (Blueprint Actor), Components:

1. **Sphere Collision** (root) — radius 100 (area pickup)
2. **Static Mesh** — Sphere, scale 0.3
3. Material glowing: bikin `M_Oculus`:
   ```
   [Constant3Vector emas (1, 0.8, 0.2)] ──▶ Base Color
   [sama, dikali 20] ────────────────────▶ Emissive Color   ← >1 = NYALA
   ```
   (kali pakai node Multiply × Constant 20 → glow kena bloom)
4. **Rotating Movement** component → Rotation Rate Z = 90 (muter sendiri)
5. Bonus melayang naik-turun — Event Graph:
   ```
   [Event Tick] ─▶ [AddActorWorldOffset]
      Delta Location Z = [Sin(Time × 2)] × 0.3
      (node: Get Game Time in Seconds → × 2 → SIN → × 0.3)
   ```

## 12B. Pickup + Counter

1. **Variabel di karakter**: `OculiCollected` (Integer, 0) dan
   `OculiTotal` (Integer, 20).
2. `BP_Oculus` Event Graph:

```
[On Component Begin Overlap (Sphere)]
   Other Actor ─▶ [Cast To BP_ThirdPersonCharacter]
      sukses:
        ─▶ [Set OculiCollected] = OculiCollected + 1   (target: hasil cast)
        ─▶ [Spawn Sound at Location] "ting!"           (opsional, modul 12 course)
        ─▶ [DestroyActor]
```

## 12C. Counter di HUD

1. Buka `W_HUD` → drag **Text Block** ke kanan atas (Anchor kanan-atas!)
   → rename `TxtOculi`, ukuran font 24, warna emas.
2. Pilih TxtOculi → Details → **Text → Bind → Create Binding**:

```
[Get Owning Player Pawn] ─▶ [Cast To BP_ThirdPersonCharacter]
   ─▶ [Format Text]  "Oculi: {jumlah}/{total}"
        jumlah = OculiCollected, total = OculiTotal
   ─▶ [Return]
```

(Node **Format Text**: ketik `Oculi: {jumlah}/{total}` di kotak Format —
pin input muncul otomatis.)

3. Taruh **20 oculus** di dunia: di tempat susah — puncak bukit, atap,
   butuh glide dari bagian 10 untuk ambil. **Itu poinnya.** 🗺️

## 12D. Hadiah komplit (opsional manis)

Di karakter, setelah increment:

```
[Branch: OculiCollected >= OculiTotal]
   True ─▶ [Print String "SEMUA OCULI TERKUMPUL! Max stamina +50"]
        ─▶ [Set MaxStamina = MaxStamina + 50]
```

Loop gameplay pertamamu resmi lengkap:
**eksplorasi → glide → kumpul → reward → eksplorasi lebih jauh.** Persis
formula Genshin.

## 🏁 Selesai track proyek-mini — kamu sekarang punya:

- Karakter anime dengan rambut fisika ✓
- Sprint + stamina + HUD ✓
- Gliding ✓
- Chest interaktif ✓
- Collectible + counter + reward ✓

## Selanjutnya

1. Course utama [Modul 09](../09-world-building.md) — bikin pulau untuk
   diisi semua ini
2. [Modul 10-11](../10-cpp-dasar.md) — naik ke C++
3. [Modul 14](../14-capstone-aether-realm.md) — bandingkan buatanmu dengan
   versi produksi di `aether-realm-ue5` (stamina → `TickStamina`, glide →
   `StartGliding`, chest → `AChest`, oculi → `AOculusCollectible`).
   Kamu akan kaget betapa miripnya — bedanya cuma bahasa & kerapian.

## ✅ CHECKPOINT FINAL

- [ ] 20 oculi tersebar, counter akurat
- [ ] Minimal 5 oculi butuh glide untuk dicapai
- [ ] Reward komplit jalan
