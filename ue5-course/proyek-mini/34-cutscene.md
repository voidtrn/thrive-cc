# Bagian 34 — Cutscene System (Level Sequencer) · *lanjutan*

Sinematik: kamera bergerak, karakter beraksi, dialog — pakai **Level
Sequencer** bawaan UE5 (tool film-grade, gratis).

## 34A. Bikin Sequence

1. Toolbar **Cinematics → Add Level Sequence** → `SEQ_IntroCutscene`.
   (Actor `LevelSequenceActor` otomatis ditaruh di level.)
2. Sequencer Editor kebuka (panel timeline di bawah).
3. **+ Track** → tambah objek yang mau dianimasi:
   - **Camera** (Cine Camera Actor): posisi, rotasi, FOV, focus distance
   - **Character**: Transform + Animation track (drag anim/montage)
   - **Light**, **Post Process**, **Audio**, **Fade** (hitam), **Event**

Contoh intro (keyframe di timeline):
```
0:00  Fade track: hitam → clear
0:02  Camera: pan dari langit ke dunia (2 keyframe transform)
0:05  Text widget muncul (Event track → BP tampil judul)
0:08  Karakter: play anim "jalan"
0:12  Camera cut ke NPC (Camera Cuts track)
0:20  Fade → gameplay; Event track → SelesaiCutscene
```

**Camera Cuts track** = wajib supaya sequence mengambil alih kamera game.
Klik + di track Camera Cuts → pilih Cine Camera.

## 34B. Trigger dari Gameplay

`BP_CutsceneTrigger` (Actor) atau panggil langsung:

```
[PlayCutscene] (LevelSequence)
   [Get Player Controller] → [Disable Input] (target: PC)
   [Set HUD Visibility Hidden]
   [Create Level Sequence Player] (atau pakai LevelSequenceActor di level):
      node "Create Level Sequence Player" → Play
   [Bind On Finished] → [SelesaiCutscene]

[SelesaiCutscene]
   [Enable Input] (PC)
   [Set HUD Visible]
   (resume gameplay)
```

> **Disable Input**: node `Disable Input`/`Enable Input` (target PC). Atau
> `Set Ignore Move Input` + `Set Ignore Look Input`. Jangan lupa enable lagi
> di On Finished — kalau lupa, karakter beku selamanya (bug klasik).

Trigger points: quest start/selesai, boss encounter, masuk region pertama
kali (flag `bSudahLihat` di save biar gak berulang), domain entrance (first
time).

## 34C. Dialog dalam Cutscene

Dua cara:
1. **Subtitle**: Text track / Widget track di Sequencer — muncul-hilang
   sesuai timeline
2. **Pause untuk dialog**: Event track di tengah sequence → panggil
   `MulaiDialog` ([Bagian 25](25-dialog-bercabang.md)) → pause sequence →
   resume saat dialog selesai (bind OnDialogueEnded → Sequence Player Play)

## Skip cutscene

Wajib ada (pemain benci cutscene gak bisa di-skip):
```
[Input apapun saat cutscene] → [Sequence Player → Set Playback Position ke akhir]
   atau [Stop] → SelesaiCutscene
```
Tampilkan prompt "Tekan [Esc] untuk skip" pojok bawah.

## ✅ CHECKPOINT

- [ ] Sequence main: kamera gerak, karakter beraksi
- [ ] Input disabled saat cutscene, enable lagi setelah selesai
- [ ] Cutscene sekali-jalan tidak berulang (flag save)
- [ ] Bisa di-skip
- [ ] Dialog muncul di cutscene (subtitle atau pause-dialog)

➡️ [Bagian 35 — Controller Support](35-controller-support.md)
