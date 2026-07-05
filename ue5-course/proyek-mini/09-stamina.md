# Bagian 09 — Sistem Stamina

Biar tidak sprint selamanya: stamina berkurang saat lari, isi ulang saat berhenti.

## 9A. Variabel

`BP_ThirdPersonCharacter` → My Blueprint → Variables → `+` empat kali:

| Nama | Type | Default |
|---|---|---|
| `Stamina` | Float | 100 |
| `MaxStamina` | Float | 100 |
| `StaminaRegenRate` | Float | 10 |
| `StaminaDrainRate` | Float | 20 |
| `bSedangSprint` | Boolean | false ← **penting: pengganti "cek Shift ditekan"** |

## 9B. Logic

**Langkah 1 — tandai kapan sprint** (ubah node bagian 08):

```
[IA_Sprint: Started]   ─▶ [Set bSedangSprint = true]
[IA_Sprint: Completed] ─▶ [Set bSedangSprint = false] ─▶ [Set Max Walk Speed 400]
```

(Set Max Walk Speed 600 yang lama dari Started **hapus** — pindah ke Tick
supaya bisa dipaksa berhenti saat stamina habis.)

**Langkah 2 — Event Tick:**

```
[Event Tick (Delta Seconds)]
   │
   ▼
[Branch]  Condition: [bSedangSprint] AND [Stamina > 0]
   │
   ├── True:
   │     [Set Stamina] = Stamina - (StaminaDrainRate × Delta Seconds)
   │     [Set Max Walk Speed] 600
   │
   └── False:
         [Set Stamina] = [Clamp(float)] (Stamina + StaminaRegenRate × Delta,
                                          Min 0, Max MaxStamina)
         [Set Max Walk Speed] 400
```

Node yang dipakai: `AND` (Boolean), `>` (float), `-`, `+`, `×`,
**Clamp (float)**. Delta Seconds = pin output Event Tick — WAJIB dikali
supaya kecepatan drain konsisten di semua FPS.

**Langkah 3 — stamina habis paksa berhenti** (sudah otomatis! kondisi
`Stamina > 0` bikin Branch jatuh ke False saat habis → speed balik 400).
Bonus polish: stamina harus regen sampai >20 dulu baru boleh sprint lagi —
tambah Branch `Stamina > 20` di jalur Started.

## 9C. Tampilkan di Layar (HUD)

1. Content Browser → klik kanan → **User Interface → Widget Blueprint** →
   `W_HUD` → double-click.
2. Palette (kiri) → drag **Progress Bar** ke canvas:
   - Details → posisi kiri atas, **Anchor: kiri-atas** (ikon bunga — pilih
     pojok kiri atas), Size X=200 Y=20
   - **Fill Color**: kuning/oranye
3. Pilih Progress Bar → Details → **Percent → Bind → Create Binding**:

```
[Get Owning Player Pawn] ─▶ [Cast To BP_ThirdPersonCharacter]
   ─▶ Stamina ÷ MaxStamina ─▶ [Return Node]
```

4. Tampilkan HUD — `BP_ThirdPersonCharacter` Event Graph:

```
[Event BeginPlay] ─▶ [Create Widget] Class: W_HUD ─▶ [Add to Viewport]
```

5. Compile semua → Play: bar turun saat sprint, naik saat berhenti. 🔋

## Polish opsional (ala Genshin)

- Bar hanya muncul saat tidak penuh: binding **Visibility** →
  `Stamina < MaxStamina ? Visible : Hidden`
- Bar merah kalau < 20: binding Fill Color → **Select (LinearColor)** by Branch

## ✅ CHECKPOINT

- [ ] Sprint drain, berhenti regen, habis = otomatis jalan biasa
- [ ] Bar akurat (habis = kosong, penuh = penuh)
- [ ] Paham kenapa pakai `bSedangSprint` bukan "cek tombol" (state di data, bukan hardware)

➡️ [Bagian 10 — Gliding](10-gliding.md)
