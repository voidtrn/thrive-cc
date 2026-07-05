# Modul 08 — Gameplay: Collision, Trace, Damage, & UI (UMG)

**Target:** sistem HP + serangan kena musuh + HP bar di layar. Mini combat loop!

## 1. Collision — 3 konsep

| Konsep | Arti | Event |
|---|---|---|
| **Block** | Menghalangi (dinding) | Event Hit |
| **Overlap** | Tembus tapi terdeteksi (sensor) | Begin/End Overlap |
| **Ignore** | Tidak ada interaksi | — |

Diatur per objek: Details → Collision → **Collision Presets**
(`BlockAll`, `OverlapAllDynamic`, `Pawn`, custom...).

## 2. Trace — "sinar peraba"

Cara mendeteksi apa yang ada di arah tertentu (serangan melee, tembakan,
deteksi tanah):

```
[Line Trace By Channel]
   Start: [Get Actor Location]
   End:   Start + [Get Actor Forward Vector] × 200
   ─▶ Out Hit → [Break Hit Result] → Hit Actor  ← siapa yang kena
   ─▶ Return Value (bool: kena/nggak) → [Branch]
```

Varian: **Sphere Trace** (lebih "tebal", enak buat melee), **Multi**
(kena banyak). Debug: set `Draw Debug Type = For Duration` → garis merah
kelihatan. (aether-realm pakai sphere/box/line per hit combo — pattern sama.)

## 3. Sistem Damage bawaan UE

```
Penyerang:  [Apply Damage]  (Damaged Actor: hasil trace, Base Damage: 25)
Korban:     [Event AnyDamage] → kurangi HP
```

**🔨 PRAKTIK — Musuh dummy:**

1. `BP_Musuh` (Character): kasih mesh mannequin, variabel `HP` float = 100.
2. Event Graph BP_Musuh:

```
[Event AnyDamage]
   ─▶ [HP - Damage] → [Set HP]
   ─▶ [Branch: HP <= 0]
        True ──▶ [DestroyActor]
        False ─▶ [Print HP]
```

3. Di karakter player, saat montage attack notify `AN_Hit` (modul 07):

```
[AnimNotify AN_Hit] (di ABP → panggil event di karakter via Get Pawn Owner + Cast)
atau langsung di karakter:
[IA_Attack] → [Play Montage] → (delay ke frame hit) →
[Sphere Trace] depan 150 → Hit Actor → [Apply Damage 25]
```

4. Taruh 3 musuh → Play → pukul sampai hancur. Combat loop pertama! 🎉

## 4. UMG — bikin UI

**Widget Blueprint** = layar UI. Content Drawer → klik kanan →
User Interface → **Widget Blueprint** → `WBP_HUD`:

```
┌─ WBP_HUD (Designer tab) ──────────────────────────┐
│ Palette (kiri): Text, Button, ProgressBar, Image  │
│ Hierarchy: Canvas Panel → drag widget ke sini     │
│ Canvas (tengah): susun visual                     │
│ Details (kanan): posisi (Anchor!), warna, font    │
└───────────────────────────────────────────────────┘
```

1. Drag **Progress Bar** ke kiri atas → Details → **Anchor: kiri-atas**
   (penting! anchor = titik acuan saat resolusi berubah), Fill Color hijau.
2. **Binding HP**: pilih ProgressBar → Details → Percent → **Bind →
   Create Binding** → di graph:

```
[Get Owning Player Pawn] → [Cast To BP_ThirdPersonCharacter]
   → HP / MaxHP → Return
```

3. Tampilkan HUD — di karakter BeginPlay:

```
[Event BeginPlay] ─▶ [Create Widget] class: WBP_HUD ─▶ [Add to Viewport]
```

4. Kasih player variabel `HP`/`MaxHP` + terima damage dari musuh
   (musuh: trace/overlap → Apply Damage ke player) → bar turun.

## 5. 🔨 PRAKTIK gabungan — mini arena combat

1. Musuh mengejar: `BP_Musuh` → **Event Tick** → [AI Move To] (target:
   player) — atau Simple Move To Actor. (AI beneran pakai Behavior Tree —
   intro di modul 14/project.)
2. Musuh nyerang: jarak < 150 (node Get Distance To) → Apply Damage ke
   player tiap 1 detik (pakai timer).
3. Damage number ala RPG: saat musuh kena → **Spawn Widget** text angka di
   posisi musuh (Create Widget + Add to Viewport + Set Position in Viewport
   ← node **Project World to Screen**), animasi naik + hilang (Delay +
   Remove from Parent).
4. Player mati → tampilkan text "GAME OVER" + node **Open Level** (restart).

## ✅ CHECKPOINT

- [ ] Paham Block vs Overlap vs Trace — kapan pakai apa
- [ ] Loop: serang → musuh HP turun → mati; musuh balas → HP bar turun
- [ ] Paham Anchor di UMG + binding

📖 [UMG UI Designer (docs)](https://dev.epicgames.com/documentation/en-us/unreal-engine/umg-ui-designer-for-unreal-engine)

➡️ [Modul 09 — World Building](09-world-building.md)
