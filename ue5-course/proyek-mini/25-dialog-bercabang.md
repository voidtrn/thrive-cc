# Bagian 25 — Dialog Bercabang (Branching Dialogue)

NPC ngobrol dengan pilihan jawaban → cabang cerita → aksi (kasih quest,
item). Sistem visual novel ala Genshin/RPG.

## 25A. Struktur Node Dialog

Pakai **Data Table** — 1 tabel = 1 percakapan. Row = node.

**Structure** `S_DialogNode` (Row Struct):
| Field | Type | Guna |
|---|---|---|
| `SpeakerName` | Text | nama yang bicara |
| `DialogText` | Text | isi ucapan |
| `PortraitLeft` | Bool | posisi potret |
| `Portrait` | Texture2D (soft) | gambar wajah |
| `NextNodeID` | Name | node lanjut (kalau tanpa pilihan) |
| `Choices` | Array of `S_DialogChoice` | pilihan jawaban |
| `ActionType` | Name | "GiveQuest"/"GiveItem"/"None" |
| `ActionTarget` | Name | ID quest/item |

**Structure** `S_DialogChoice`:
| Field | Type |
|---|---|
| `ChoiceText` | Text |
| `NextNodeID` | Name |
| `ConditionQuestDone` | Name (opsional — pilihan muncul kalau quest selesai) |

`DT_Dialog_PakTani` — Row "Start", "TanyaQuest", "Tolak", "Terima", dst.
`NextNodeID` kosong + Choices kosong = dialog selesai.

## 25B. Dialog Manager (Actor Component / atau di karakter)

```
[MulaiDialog] (Input: DialogTable, StartNodeID)
   [Set ActiveTable, CurrentNodeID = StartNodeID]
   [MasukNode(StartNodeID)]
   [Set Input Mode UI Only + Show Cursor]

[MasukNode] (Input: NodeID)
   [Get Data Table Row (NodeID)]  → Break struct
   [Jalankan Action] (ActionType: GiveQuest → QuestManager.AddQuest, dll)
   [Update W_Dialog widget]: speaker, text, portrait
   [Branch: Choices kosong?]
     True  → tampilkan tombol "Lanjut" (→ NextNodeID; kalau None → Selesai)
     False → tampilkan tombol per Choice (yang lolos kondisi)

[PilihChoice] (Input: ChoiceIndex)
   [MasukNode(Choices[Index].NextNodeID)]

[SelesaiDialog]
   [Remove W_Dialog] [Set Input Mode Game Only + Hide Cursor]
```

## 25C. Kondisi Pilihan

Choice hanya muncul kalau syarat lolos (mis. "Aku sudah bunuh hilichurl" cuma
muncul kalau quest selesai):

```
[Saat build tombol choice]
   [Branch: ConditionQuestDone kosong? ATAU ada di CompletedQuestIDs?]
     True → tampilkan tombol
     False → skip (jangan bikin tombol)
```

Sama seperti `CheckCondition` di project C++ (`UDialogueManager`).

## 25D. Widget Visual Novel

`W_Dialog`:

```
┌──────────────────────────────────────────┐
│  🖼️Kiri                          Kanan🖼️ │  ← 2 potret, aktif terang
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ Pak Tani                             │ │  ← nama (warna aksen)
│  │ "Tolong, hilichurl mengganggu       │ │  ← DialogText (typewriter)
│  │  ladangku..."                        │ │
│  │           [Terima]  [Nanti dulu]     │ │  ← tombol choice / Lanjut
│  └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
   background: BackgroundBlur (blur dunia)
```

**Typewriter effect** (huruf muncul satu-satu — bikin hidup):

```
[SetDialogText] (Input: FullText)
   [Set FullText, VisibleChars = 0]
   [Set Timer] 0.02s Looping → [TickTypewriter]

[TickTypewriter]
   VisibleChars += 1
   [Set Text] = Left(FullText, VisibleChars)   (node "Left" substring)
   [Branch: VisibleChars >= Len(FullText)]
     True → [Clear Timer]  (selesai ngetik)

// Klik saat ngetik = langsung penuh:
[OnClick]
   [Branch: masih ngetik?] True → tampilkan penuh, clear timer
                            False → Lanjut/pilih
```

Potret: yang bicara `Opacity 1.0`, lawan `0.4` (redup) — by `PortraitLeft`.

## 25E. Trigger dari NPC

`BP_NPC` (Bagian 17 quest giver, atau NPC ngobrol biasa):

```
[Interact]
   [MulaiDialog] (DT_Dialog_PakTani, "Start")
```

## ✅ CHECKPOINT

- [ ] Dialog jalan node ke node, typewriter effect
- [ ] Pilihan bercabang ke node berbeda
- [ ] Choice kondisional muncul/hilang by quest state
- [ ] Action jalan (node kasih quest/item saat tampil)
- [ ] Input mode balik ke game saat selesai

> Versi produksi: `UDialogueManager` + `FDialogueNode` (kondisi
> QuestCompleted/HasItem, action GiveItem/StartQuest/ReportTalkObjective) —
> `aether-realm-ue5/Docs/PHASE6_SETUP.md`. Struktur identik.

➡️ [Bagian 26 — Isi Pulau Lengkap](26-isi-pulau-lengkap.md)
