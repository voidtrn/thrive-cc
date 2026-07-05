# Modul 03 — Blueprint Dasar

**Target:** paham event, node, variabel, branch — bikin pintu otomatis & item pickup.

## 1. Apa itu Blueprint?

Coding **visual**: logika dibangun dari **node** (kotak) yang disambung
**kabel**. Sama kuatnya dengan menulis kode untuk kebanyakan gameplay.

```
  ┌──────────────┐        ┌─────────────────┐
  │ Event BeginPlay ─────▶│ Print String     │
  │ (saat game mulai)     │ Text: "Halo UE!" │
  └──────────────┘        └─────────────────┘
        node  ── kabel putih (EXEC/urutan eksekusi) ──▶  node
```

Dua jenis kabel:
- **Putih (exec)**: urutan eksekusi — "lalu kerjakan ini"
- **Berwarna (data)**: nilai — merah=bool, hijau=float, pink=string,
  biru=object, kuning=vector

## 2. Bikin Blueprint pertama

1. Content Drawer → klik kanan area kosong → **Blueprint Class** →
   pilih **Actor** → beri nama `BP_PintuOtomatis`.
2. Double-click → **Blueprint Editor** kebuka:

```
┌───────────────────────────────────────────────────────────┐
│ [Compile] [Save]                    ← WAJIB Compile tiap edit
├────────────┬──────────────────────────────┬───────────────┤
│ COMPONENTS │   VIEWPORT / EVENT GRAPH     │   DETAILS     │
│ (bagian2   │   (tab atas: Viewport =      │               │
│  actor:    │    bentuk 3D, Event Graph =  │               │
│  mesh,     │    logika node)              │               │
│  collision)│                              │               │
├────────────┤                              │               │
│ MY BLUEPRINT                              │               │
│ (variabel, │                              │               │
│  function) │                              │               │
└────────────┴──────────────────────────────┴───────────────┘
```

## 3. Komponen + Event + Logika = Actor hidup

**🔨 PRAKTIK — Pintu otomatis:**

1. Tab **Viewport** → panel Components → **+ Add**:
   - `Static Mesh` → Details → Static Mesh pilih `SM_Cube`(1×), scale `(0.1, 2, 3)` → rename `Pintu`
   - `Box Collision` → scale sampai lebih besar dari pintu (area sensor) → rename `Sensor`
2. Klik komponen `Sensor` → panel Details → scroll ke **Events** (paling
   bawah) → klik `+` di **On Component Begin Overlap** → otomatis pindah ke
   Event Graph dengan node event baru.
3. Susun node (klik kanan di graph kosong = search node):

```
[On Component Begin Overlap (Sensor)]
        │ exec
        ▼
[Set Relative Location]  ← target: drag komponen "Pintu" dari panel kiri ke graph
   New Location: (0, 0, 300)      ← pintu "naik" (terbuka)

[On Component End Overlap (Sensor)]
        │
        ▼
[Set Relative Location]  target: Pintu
   New Location: (0, 0, 0)        ← pintu turun (tutup)
```

4. **Compile** (tombol kiri atas — harus hijau ✓) → **Save**.
5. Drag `BP_PintuOtomatis` dari Content Drawer ke level → Play →
   dekati pintu → pintu naik. Menjauh → turun. 🎉

## 4. Variabel & Branch

**Variabel** = kotak penyimpan nilai. Bikin: panel My Blueprint → Variables → `+`.

| Tipe | Warna | Contoh |
|---|---|---|
| Boolean | merah | `bTerbuka` (true/false) |
| Integer | biru-hijau | `JumlahKoin` |
| Float | hijau | `HP` = 100.0 |
| String/Text | pink | `NamaPemain` |
| Vector | kuning | posisi (X,Y,Z) |

- **Get** (baca): drag variabel ke graph → Get. **Set** (ubah): → Set.
- **Branch** (= if/else): klik kanan → "Branch". Input merah bool →
  keluar `True` atau `False`.

```
[Event] ──▶ [Branch]──True──▶ [Print "Pintu terkunci!"]
              ▲   └──False─▶ [buka pintu]
        (bTerkunci)
```

## 5. 🔨 PRAKTIK — Koin pickup

1. Blueprint Class → Actor → `BP_Koin`.
2. Components: Static Mesh (pilih bentuk, kasih material kuning),
   Sphere Collision.
3. Event Graph:

```
[Event BeginPlay]                        (koin muter terus:)
[Event Tick] ──▶ [Add Actor Local Rotation]  Delta Rotation Z: 2.0

[On Component Begin Overlap (Sphere)]
   ──▶ [Print String "Koin +1"] ──▶ [DestroyActor]
```

4. Taruh 10 koin di arena modul 02 → Play → kumpulkan.
5. **Tantangan**: tambah variabel `Nilai` (int, default 10), print nilainya
   pakai node **Append** / format text.

## ✅ CHECKPOINT

- [ ] Paham beda kabel exec vs data
- [ ] Bisa bikin komponen + event overlap sendiri
- [ ] Pintu otomatis & koin jalan
- [ ] Paham Get/Set variabel & Branch

📖 Bergambar: [Introduction to Blueprints (docs)](https://dev.epicgames.com/documentation/en-us/unreal-engine/introduction-to-blueprints-visual-scripting-in-unreal-engine)

➡️ [Modul 04 — Blueprint Lanjutan](04-blueprint-lanjutan.md)
