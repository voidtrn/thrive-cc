# Modul 04 — Blueprint Lanjutan

**Target:** BP saling bicara: function, cast, interface, event dispatcher, spawn.

## 1. Function & Macro (rapikan spaghetti)

- **Function**: My Blueprint → Functions → `+`. Punya Input/Output.
  Logika yang dipakai berulang → jadikan function.
- Contoh: function `TambahSkor(int Jumlah)` — dipanggil dari koin, chest, dll.
- **Event Custom**: klik kanan graph → "Add Custom Event" — seperti function
  tapi bisa dipanggil dari event lain & tidak return nilai.

Aturan rapi: Event Graph cuma berisi event → panggil function. Logika detail
di dalam function.

## 2. Komunikasi Antar Blueprint — 3 cara (PENTING)

### Cara 1: Direct Reference + Cast

Koin mau kasih skor ke karakter yang nyentuh:

```
[On Component Begin Overlap]
   Other Actor ──▶ [Cast To BP_ThirdPersonCharacter]
                        │ sukses ──▶ [TambahSkor]  ← function di karakter
                        │ As BP_ThirdPerson... ──── target
                        └ Cast Failed ──▶ (bukan player, abaikan)
```

**Cast** = "coba anggap objek ini sebagai tipe X". Gagal = bukan tipe itu.

### Cara 2: Blueprint Interface (BPI) — tanpa saling kenal

1. Content Drawer → klik kanan → Blueprints → **Blueprint Interface** →
   `BPI_Interaksi`, tambah function `Interact`.
2. Di BP mana pun: Class Settings → **Implemented Interfaces** → add
   `BPI_Interaksi` → implement event `Interact`.
3. Pemanggil: node **Interact (Message)** ke actor apa pun — kalau actor
   implement, jalan; kalau tidak, diam. **Tanpa cast!**

> Dipakai di project besar: tombol F bisa buka chest, bicara NPC, aktifkan
> mekanisme — semua lewat 1 interface. (aether-realm: pattern yang sama.)

### Cara 3: Event Dispatcher — "siaran"

Anak siaran, siapa pun boleh dengar:

1. Di `BP_Koin`: My Blueprint → Event Dispatchers → `+` → `OnKoinDiambil`.
2. Saat diambil: node **Call OnKoinDiambil**.
3. Di BP lain (mis. UI): dapatkan referensi koin → node **Bind Event to
   OnKoinDiambil** → sambungkan ke custom event.

```
BP_Koin  ──(siaran: OnKoinDiambil)──▶  siapa pun yang Bind akan menerima
```

| Situasi | Pakai |
|---|---|
| Tahu persis targetnya | Direct + Cast |
| Banyak tipe objek, 1 aksi (interact) | Interface |
| 1 kejadian, banyak pendengar (UI update) | Dispatcher |

## 3. Spawn & Destroy saat runtime

```
[SpawnActor from Class]
   Class: BP_Koin
   Spawn Transform: [Make Transform] Location (0,0,100)
```

`DestroyActor` = hapus. `Get All Actors of Class` = cari semua actor tipe
tertentu (mahal — jangan di Tick).

## 4. Timer & Delay

- **Delay**: tunda eksekusi (hanya di event graph, bukan function).
- **Set Timer by Event**: panggil custom event tiap X detik (looping ✓)
  — untuk spawner, DOT damage, dll.

## 5. 🔨 PRAKTIK — Spawner koin + skor UI sederhana

1. `BP_KoinSpawner` (Actor): BeginPlay → **Set Timer by Event** (2 detik,
   looping) → custom event `SpawnKoin` → SpawnActor BP_Koin di lokasi
   random: node **Random Point in Bounding Box** (center = lokasi spawner).
2. Di `BP_ThirdPersonCharacter`: variabel `Skor` (int) + function
   `TambahSkor` → Skor += input → **Print String** skor.
3. Koin: saat overlap → Cast ke karakter → `TambahSkor(10)` → Destroy.
4. **Tantangan interface**: ganti sistem koin jadi `BPI_Pickup` dengan
   function `Ambil` — biar nanti gampang nambah tipe pickup lain.

## ✅ CHECKPOINT

- [ ] Bisa jelaskan kapan pakai Cast vs Interface vs Dispatcher
- [ ] Spawner + skor jalan
- [ ] Event Graph kamu rapi (logika di function)

📖 [Blueprint Communication (docs)](https://dev.epicgames.com/documentation/en-us/unreal-engine/blueprint-communication-usage-in-unreal-engine)

➡️ [Modul 05 — Mesh & Material](05-material-dan-mesh.md)
