# Modul 10 — C++ untuk Pemula Blueprint

**Target:** setup tools, bikin class C++ pertama, paham jembatan C++ ↔ Blueprint.

> Jangan takut. Pola pikirnya: **C++ = bikin "LEGO brick" baru,
> Blueprint = menyusun brick-nya.** Kamu sudah jago menyusun; sekarang
> belajar mencetak brick.

## 1. Setup (Windows)

1. Install **Visual Studio 2022 Community** (gratis):
   https://visualstudio.microsoft.com/
2. Saat install centang workload: **Game development with C++** ✓
   (otomatis bawa komponen Unreal).
3. Bikin project baru: Unreal Project Browser → Third Person → pilih **C++**
   (bukan Blueprint) → `BelajarCpp`.
4. Editor + Visual Studio kebuka. Kalau error: Epic Launcher → Engine 5.4 →
   Options → centang semua komponen editor, verify.

## 2. Class C++ pertama

1. Di editor UE: `Tools → New C++ Class` → parent **Actor** → nama
   `KotakBerputar` → Create Class. Tunggu compile.
2. VS kebuka dengan 2 file. Isi seperti ini:

**KotakBerputar.h** — "daftar isi" class:
```cpp
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "KotakBerputar.generated.h"   // wajib paling bawah dari include

UCLASS()
class BELAJARCPP_API AKotakBerputar : public AActor
{
	GENERATED_BODY()   // makro wajib

public:
	AKotakBerputar();

	// UPROPERTY = variabel terlihat di editor/BP.
	// EditAnywhere = bisa diubah di Details panel.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Putaran")
	float KecepatanPutar = 90.f;   // derajat per detik

	// UFUNCTION BlueprintCallable = bisa dipanggil dari Blueprint
	UFUNCTION(BlueprintCallable, Category = "Putaran")
	void GandakanKecepatan();

protected:
	virtual void Tick(float DeltaTime) override;

	UPROPERTY(VisibleAnywhere)
	TObjectPtr<UStaticMeshComponent> Mesh;
};
```

**KotakBerputar.cpp** — isi logikanya:
```cpp
#include "KotakBerputar.h"
#include "Components/StaticMeshComponent.h"

AKotakBerputar::AKotakBerputar()
{
	PrimaryActorTick.bCanEverTick = true;   // aktifkan Tick

	Mesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Mesh"));
	SetRootComponent(Mesh);
}

void AKotakBerputar::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);
	// DeltaTime = detik sejak frame lalu -> gerakan konsisten di semua FPS
	AddActorLocalRotation(FRotator(0.f, KecepatanPutar * DeltaTime, 0.f));
}

void AKotakBerputar::GandakanKecepatan()
{
	KecepatanPutar *= 2.f;
}
```

3. Compile: di editor klik ikon **Recompile** (kotak kecil kanan bawah) atau
   di VS `Ctrl+B`. Sukses → class muncul di Content Drawer (C++ Classes folder).
4. Drag `KotakBerputar` ke level → Details → set Static Mesh + ubah
   `KecepatanPutar` → Play. Kotak muter. 🎉

## 3. Kamus terjemahan BP ↔ C++

| Blueprint | C++ |
|---|---|
| Variabel | `UPROPERTY(...) float X;` |
| Function | `UFUNCTION(...) void F();` |
| Event BeginPlay | `virtual void BeginPlay() override;` |
| Event Tick | `virtual void Tick(float DeltaTime) override;` |
| Branch | `if (...) { } else { }` |
| Cast To X | `Cast<AX>(Objek)` |
| Print String | `UE_LOG(LogTemp, Warning, TEXT("Halo %f"), Angka);` |
| Add Component | `CreateDefaultSubobject<U...>()` di constructor |
| Event Dispatcher | `DECLARE_DYNAMIC_MULTICAST_DELEGATE` + `.Broadcast()` |

Specifier penting:

| Specifier | Arti |
|---|---|
| `EditAnywhere` | Bisa diedit di Details |
| `VisibleAnywhere` | Kelihatan tapi tidak bisa diedit |
| `BlueprintReadWrite` | BP boleh get + set |
| `BlueprintCallable` | Function bisa dipanggil BP |
| `BlueprintPure` | Function tanpa exec pin (getter hijau) |
| `BlueprintImplementableEvent` | C++ deklarasi, **BP yang isi** ← pattern favorit |

## 4. Pattern paling penting: C++ base, BP child

Cara kerja semua project profesional (termasuk `aether-realm-ue5`):

```
C++ class (logika inti, performa, data)
   └── Blueprint child (assign mesh/suara/VFX, tweak angka, wiring)
```

Bikin BP child: klik kanan class C++ di Content Drawer →
**Create Blueprint class based on...**

## 5. 🔨 PRAKTIK

1. Tambah `UPROPERTY` `bool bBolehMuter = true;` + wrap isi Tick dengan `if`.
2. Bikin BP child `BP_KotakEmas` → assign mesh + material emas modul 05.
3. Dari karakter BP: trace ke kotak → Cast → panggil `GandakanKecepatan()`
   (muncul sebagai node karena `BlueprintCallable`).
4. **Tantangan**: tambah `UFUNCTION(BlueprintImplementableEvent) void
   OnKecepatanBerubah();` — panggil di akhir `GandakanKecepatan()` C++,
   lalu implement di BP child (spawn partikel/suara). Rasakan pattern-nya:
   **C++ kapan, BP apa.**

## ✅ CHECKPOINT

- [ ] Class compile + muncul + jalan di level
- [ ] Hafal UPROPERTY/UFUNCTION specifier dasar
- [ ] Paham pattern C++ base → BP child

📖 [C++ Programming Guide (docs)](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-cpp-programming-tutorials)

➡️ [Modul 11 — Arsitektur Game](11-arsitektur-game.md)
