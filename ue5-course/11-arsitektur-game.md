# Modul 11 — Arsitektur Game: Framework, Data, Save

**Target:** paham "kerangka" tiap game UE — GameMode dkk, DataTable, SaveGame, Subsystem.

## 1. Gameplay Framework — siapa ngurus apa

```
GameInstance  (hidup selama game nyala — antar level)
   │
   └─ Level dimuat:
        GameMode      (ATURAN: siapa spawn di mana, menang/kalah — server only)
        GameState     (PAPAN SKOR dunia: waktu, cuaca — semua orang lihat)
        PlayerController (JIWA player: input, kamera, UI)
        PlayerState   (DATA player: nama, skor — semua orang lihat)
        Pawn/Character (BADAN player di dunia)
        HUD/Widget    (LAYAR)
```

Analogi pertandingan bola: GameMode = wasit, GameState = papan skor,
PlayerController = pemain (orangnya), Pawn = seragam+badan di lapangan,
PlayerState = statistik pemain, GameInstance = turnamen (lintas pertandingan).

| Butuh nyimpan... | Taruh di |
|---|---|
| Aturan spawn/respawn | GameMode |
| Jam dunia, cuaca | GameState |
| HP/posisi karakter aktif | Pawn/Character |
| Skor, nama, party pilihan | PlayerState |
| Data antar level (inventory, settings) | **GameInstance** |

Set milik project: `Edit → Project Settings → Maps & Modes` atau per-level
di World Settings.

## 2. DataTable — data terpisah dari logika

Musuh 20 jenis ≠ 20 blueprint beda angka. **1 BP + 1 tabel data.**

1. C++ struct row (atau BP struct):
```cpp
USTRUCT(BlueprintType)
struct FMusuhRow : public FTableRowBase
{
	GENERATED_BODY()
	UPROPERTY(EditAnywhere, BlueprintReadOnly) float HP = 100.f;
	UPROPERTY(EditAnywhere, BlueprintReadOnly) float Damage = 10.f;
	UPROPERTY(EditAnywhere, BlueprintReadOnly) float Kecepatan = 400.f;
};
```
2. Content Drawer → klik kanan → Miscellaneous → **Data Table** → pilih
   struct → isi row: `Goblin`, `GoblinElite`, `Boss`.
3. BP musuh: variabel `RowName` (Name) → BeginPlay → node **Get Data Table
   Row** → set HP dkk dari row. Ganti musuh = ganti 1 dropdown.

Kembar: **Data Asset** (1 file = 1 objek data, enak untuk quest/ability)
dan **Curve** (grafik nilai, untuk damage-per-level).

> aether-realm: `DT_EnemyStats`, `DT_Characters`, `DT_Banners`,
> `QA_*` quest asset — persis pattern ini.

## 3. SaveGame

1. BP class parent **SaveGame** → `SG_Simpanan` → variabel: `Skor`,
   `PosisiPlayer` (Transform), `LevelTerakhir`.
2. Simpan:
```
[Create Save Game Object] class SG_Simpanan
  → [Set Skor, dst] → [Save Game to Slot] SlotName "Slot1"
```
3. Muat:
```
[Does Save Game Exist?] → [Load Game from Slot] → [Cast To SG_Simpanan]
  → baca variabel → terapkan
```

Trigger yang lazim: auto-save saat checkpoint/pindah level; load di menu.

## 4. GameInstance & Subsystem

- **GameInstance**: BP class parent GameInstance → set di Project Settings.
  Akses dari mana pun: node **Get Game Instance** → Cast. Simpan: inventory,
  settings, data yang harus selamat saat pindah level.
- **Subsystem** (C++): "singleton otomatis" nempel di GameInstance/World —
  tanpa perlu bikin & set class:
```cpp
UCLASS()
class UManagerSkor : public UGameInstanceSubsystem
{
	GENERATED_BODY()
public:
	UFUNCTION(BlueprintCallable) void Tambah(int32 N) { Skor += N; }
	UPROPERTY(BlueprintReadOnly) int32 Skor = 0;
};
```
  Di BP langsung: node **ManagerSkor → Tambah**. (aether-realm: WishSystem,
  QuestManager, DialogueManager = subsystem semua.)

## 5. 🔨 PRAKTIK — rakit jadi game kecil

1. `BP_GameModeKu`: override **OnPostLogin** → print "Player masuk".
   Set di World Settings.
2. `DT_Musuh` 3 row → BP_Musuh baca stats dari tabel.
3. Save/load: `IA_Save` (F5) simpan posisi + skor; `IA_Load` (F9) muat &
   teleport balik (node **Set Actor Transform**).
4. GameInstance BP: variabel `TotalKoinSepanjangMasa` — bertambah tiap
   ambil koin, tidak reset saat ganti level (buktikan: Open Level lalu cek).

## ✅ CHECKPOINT

- [ ] Bisa jawab "data X taruh di class apa?" untuk 6 framework class
- [ ] Musuh data-driven via DataTable
- [ ] Save/load posisi + skor jalan

📖 [Gameplay Framework (docs)](https://dev.epicgames.com/documentation/en-us/unreal-engine/gameplay-framework-in-unreal-engine)

➡️ [Modul 12 — Audio & VFX](12-audio-vfx.md)
