# Modul 05 — C++ untuk UE5: Membuka Kekuatan Penuh

> **Target modul:** paham C++ khas Unreal (bukan C++ akademik), bisa membuat class C++ yang di-extend Blueprint, dan tahu kapan memakai apa.

## 5.1 Kenapa Perlu C++ Kalau Blueprint Sudah Bisa?

- **Performa:** logika berat per-frame (Tick) 10–100× lebih cepat di C++.
- **Akses penuh:** sebagian API engine hanya tersedia di C++.
- **Skala:** diff/merge di git, refactor, unit test — teks kode unggul untuk sistem besar.
- **Karier:** lowongan "Unreal Developer" hampir selalu minta C++.

**Pola produksi (hafalkan):** *C++ base class → expose ke Blueprint → desainer extend di Blueprint.* Kamu menulis fondasi, Blueprint jadi permukaannya.

## 5.2 C++ Unreal ≠ C++ Standar

Unreal membungkus C++ dengan sistemnya sendiri. Yang WAJIB kamu pakai:

| Standar C++ | Versi Unreal | Kenapa |
|-------------|--------------|--------|
| `std::string` | `FString`, `FName`, `FText` | FName (ID cepat), FText (teks UI + lokalisasi), FString (manipulasi) |
| `std::vector` | `TArray<T>` | Terintegrasi GC & serialisasi |
| `std::map` | `TMap<K,V>` | idem |
| `new` / `delete` | `NewObject<T>()`, `SpawnActor<T>()` — TANPA delete manual | *Garbage collector* engine yang membersihkan |
| raw pointer member | `UPROPERTY()` pointer / `TObjectPtr<T>` | Tanpa UPROPERTY, GC tidak tahu → *dangling pointer* → crash |
| class biasa | `UCLASS()` + generated body | Masuk *reflection system* |

**Kerangka class khas Unreal:**

```cpp
// BootcampCharacter.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "BootcampCharacter.generated.h"   // WAJIB include TERAKHIR

UCLASS()
class MYGAME_API ABootcampCharacter : public ACharacter
{
    GENERATED_BODY()

public:
    ABootcampCharacter();

    // Terlihat & bisa diedit di editor/Blueprint
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats")
    float MaxHealth = 100.f;

    UPROPERTY(BlueprintReadOnly, Category = "Stats")
    float Health = 100.f;

    // Bisa dipanggil dari Blueprint
    UFUNCTION(BlueprintCallable, Category = "Stats")
    void ApplyDamage(float Amount);

    // Didefinisikan DI Blueprint, dipanggil dari C++ (untuk efek/feedback)
    UFUNCTION(BlueprintImplementableEvent, Category = "Stats")
    void OnDamaged(float NewHealth);

protected:
    virtual void BeginPlay() override;
};
```

```cpp
// BootcampCharacter.cpp
#include "BootcampCharacter.h"

ABootcampCharacter::ABootcampCharacter()
{
    PrimaryActorTick.bCanEverTick = false;  // matikan Tick jika tak perlu — gratis performa
}

void ABootcampCharacter::BeginPlay()
{
    Super::BeginPlay();          // JANGAN lupa Super:: — jebakan klasik
    Health = MaxHealth;
}

void ABootcampCharacter::ApplyDamage(float Amount)
{
    Health = FMath::Clamp(Health - Amount, 0.f, MaxHealth);
    OnDamaged(Health);           // Blueprint yang menangani efek visual/suara
    if (Health <= 0.f)
    {
        UE_LOG(LogTemp, Warning, TEXT("%s mati"), *GetName());
    }
}
```

**Makro kunci:**
- `UCLASS()` / `USTRUCT()` / `UENUM()` — daftarkan tipe ke *reflection* (agar editor, Blueprint, GC, save system mengenalnya).
- `UPROPERTY(...)` — daftarkan variabel. Specifier penting: `EditAnywhere` (edit di editor), `BlueprintReadWrite/ReadOnly`, `VisibleAnywhere`, `Replicated` (multiplayer).
- `UFUNCTION(...)` — daftarkan fungsi. `BlueprintCallable` (BP boleh panggil), `BlueprintImplementableEvent` (BP yang isi), `BlueprintNativeEvent` (C++ default, BP boleh override).

## 5.3 Workflow Harian C++

1. **Tools → New C++ Class** di editor (atau langsung dari Project Browser pilih C++). Pilih parent (Actor/Character/ActorComponent...).
2. Edit di Visual Studio/Rider.
3. Kompilasi: **build dari IDE** (target `<NamaProyek> Editor`, konfigurasi `Development Editor`) atau **Live Coding** (Ctrl+Alt+F11 di editor) untuk perubahan isi fungsi.
   - ⚠️ Live Coding TIDAK bisa untuk perubahan header (tambah UPROPERTY/UFUNCTION) — tutup editor, build penuh dari IDE, buka lagi.
4. Buat **Blueprint child** dari class C++ (klik kanan class di Content Browser → Create Blueprint class based on...). Assign mesh/efek/nilai di child.

**File proyek C++:**
```
Source/MyGame/
├── MyGame.Build.cs      ← daftar module dependency (tambah "UMG", "AIModule" dll di sini)
├── MyGameCharacter.h/.cpp
└── ...
```

## 5.4 Konsep Wajib: Pointer & Null Check

Crash #1 pemula C++ Unreal: memanggil fungsi pada pointer kosong.

```cpp
// ❌ Crash kalau Target kosong
Target->ApplyDamage(10.f);

// ✅ Selalu cek
if (IsValid(Target))
{
    Target->ApplyDamage(10.f);
}
```

`IsValid()` mengecek null DAN objek yang sedang dihancurkan. Jadikan refleks.

## 5.5 Log & Debug C++

```cpp
// Log ke Output Log (buka: Window → Output Log)
UE_LOG(LogTemp, Warning, TEXT("Health: %f, Nama: %s"), Health, *GetName());

// Cetak ke layar (seperti Print String)
GEngine->AddOnScreenDebugMessage(-1, 5.f, FColor::Green, TEXT("Halo dari C++"));
```

- Breakpoint di IDE: jalankan editor dengan debugger *attach* (F5 dari VS/Rider) → eksekusi berhenti di baris, inspect variabel.
- Crash? Baca **call stack** — baris teratas milik kodemu biasanya pelakunya.

## 5.6 Belajar C++ Itu Maraton — Peta 4 Minggu

| Minggu | Fokus |
|--------|-------|
| 1 | Sintaks dasar: variabel, if, loop, function, class (kursus C++ umum mana pun) |
| 2 | Pointer & reference (pahami, jangan hafal), header vs cpp |
| 3 | Pola Unreal: UCLASS/UPROPERTY/UFUNCTION, TArray, spawn actor, komponen |
| 4 | Port latihan Modul 04 (pintu, lampu, koin) ke C++ base + BP child |

🔥 **Unpopular opinion:** kamu TIDAK perlu menguasai template metaprogramming, STL dalam, atau C++ modern penuh untuk jadi Unreal developer produktif. C++ Unreal adalah dialek — pelajari dialeknya, bukan seluruh bahasanya.

## Latihan Modul 05

1. Tambahkan class C++ `ABootcampCharacter` (kode di atas) ke proyek capstone; buat BP child; pindahkan karaktermu ke parent baru ini.
2. Implement `OnDamaged` di Blueprint: flash material merah + suara.
3. Buat `UActorComponent` C++ bernama `HealthComponent` — pindahkan logika health ke sana (komposisi! komponen bisa dipasang ke musuh juga).
4. Buat volume `ADamageZone` (Actor C++ + BoxComponent) — overlap → panggil ApplyDamage tiap detik (pakai `FTimerManager`).

## Checklist Paham

- [ ] Aku paham UCLASS/UPROPERTY/UFUNCTION dan kenapa wajib.
- [ ] Aku pakai TArray/FString, bukan std::vector/std::string.
- [ ] Aku tidak pernah `delete` UObject manual dan selalu `IsValid()` sebelum akses pointer.
- [ ] Aku bisa build dari IDE dan tahu batas Live Coding.
- [ ] Aku paham pola C++ base + Blueprint child.

➡️ Lanjut: [Modul 06 — Level Design & World Building](06-level-design-world-building.md)
