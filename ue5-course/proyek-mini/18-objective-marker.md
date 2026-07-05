# Bagian 18 — Objective Marker (Penunjuk Quest)

Ikon di dunia + jarak "50m" — pemain selalu tahu harus ke mana.

## 18A. Marker Actor

`BP_QuestMarker` (Blueprint Actor):

1. Components:
   - **Widget Component** → Space: **Screen** ← kunci: selalu menghadap
     kamera & ukuran stabil (lebih baik dari Billboard untuk ini)
   - Widget class: bikin `W_Marker` — Image panah/bintang kuning +
     Text Block jarak, susun vertikal
2. Variable: `TargetLocation` (Vector, Instance Editable).
3. Event Graph — update jarak:

```
[Event Tick]
   [Get Distance To (Player Pawn)] ÷ 100    ← unit → meter
   ─▶ [Format Text "{jarak} m"] (bulatkan: Floor)
   ─▶ [Set Text] di W_Marker (simpan referensi widget di BeginPlay:
       WidgetComponent → Get Widget → Cast → simpan)
```

> Hemat: Tick interval 0.2s cukup (Class Defaults → Actor Tick →
> Tick Interval 0.2). Jarak tidak perlu update 60×/detik.

## 18B. Spawn dari Quest Manager

Di `AC_QuestManager`, function `UpdateQuestMarker`:

```
[UpdateQuestMarker]
   [Branch: MarkerSekarang valid?] True → [DestroyActor MarkerSekarang]
   [Branch: ada quest aktif?]
     True:
       step aktif = QuestSteps[StepIndex]
       [Branch: step.TargetLocation != (0,0,0)]
         True → [Spawn Actor BP_QuestMarker] di TargetLocation
                [Set MarkerSekarang = hasil spawn]
```

Variabel: `MarkerSekarang` (BP_QuestMarker reference).
Panggil `UpdateQuestMarker` di: `AddQuest`, `StepSelesai`, `CompleteQuest`.

Warna per tipe (opsional): tambah variabel `MarkerColor` di marker →
main quest kuning, side quest biru → set saat spawn (Expose on Spawn ✓).

## 18C. Isi TargetLocation di quest

Balik ke `DA_Quest_BunuhHilichurl` → Step 1 → `TargetLocation` = koordinat
camp hilichurl (cara ambil: taruh actor apa pun di titik itu → copy
Location dari Details → paste → hapus actor).

Play: terima quest → marker + jarak muncul di camp → step selesai →
marker pindah ke NPC. 🧭

## Polish opsional

- Marker mengecil saat dekat (< 5m): scale widget by jarak
- Marker "nempel tepi layar" saat target di belakang — matematika lumayan;
  versi produksi pakai `Project World to Screen` + clamp ke edge. Simpan
  untuk nanti.
- Garis path di tanah = Spline + NavMesh `Find Path to Location
  Synchronously` — advanced, opsional.

## ✅ CHECKPOINT

- [ ] Marker muncul di lokasi step aktif, jarak akurat dalam meter
- [ ] Ganti step = marker pindah; quest selesai = marker hilang
- [ ] Tick interval 0.2s (bukan default) — kebiasaan hemat performa

➡️ [Bagian 19 — Party Swap](19-party-swap.md)
