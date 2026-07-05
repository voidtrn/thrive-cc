# Bagian 17 — Quest System Sederhana

NPC kasih misi → kerjakan → lapor → hadiah. Tulang punggung RPG.

## ⚠️ Pelajaran desain penting duluan

**Status quest JANGAN disimpan di Data Asset.** Data Asset = template
yang dibagi semua orang (seperti master dokumen). Kalau `QuestStatus`
ditaruh di situ: new game kedua statusnya masih "Completed" — bug klasik.

Aturan: **Data Asset = data tetap** (nama, deskripsi, langkah, reward).
**Progress = variabel di Quest Manager** (yang ikut save game).

## 17A. Struktur Data

1. **Enumeration** `EQuestStatus`: `NotStarted`, `Active`, `Completed`.
2. **Structure** `S_QuestStep`:
   - `StepDescription` (Text)
   - `ObjectiveType` (Name): "GoToLocation" / "KillEnemy" / "CollectItem" / "TalkToNPC"
   - `TargetID` (Name) — nama musuh/item/NPC yang dihitung
   - `TargetLocation` (Vector)
   - `RequiredCount` (Integer)
   *(CurrentCount TIDAK di sini — progress, bukan data)*
3. **Data Asset class**: Blueprint Class → parent **PrimaryDataAsset** →
   `QuestDataAsset`. Variables:
   - `QuestID` (Name), `QuestName` (Text), `QuestDescription` (Text)
   - `QuestGiver` (Name), `PrerequisiteQuest` (Name)
   - `QuestSteps` (Array of S_QuestStep)
   - `RewardXP`, `RewardGold` (Integer), `RewardItems` (Array of Name)
4. Bikin quest pertama: klik kanan → Miscellaneous → **Data Asset** →
   pilih `QuestDataAsset` → `DA_Quest_BunuhHilichurl`:
   - Step 1: KillEnemy, TargetID `Hilichurl`, RequiredCount 3
   - Step 2: TalkToNPC, TargetID `PakTani`
   - Reward: 100 XP, 500 Gold

## 17B. Quest Manager (Actor Component)

1. Klik kanan → Blueprint Class → **Actor Component** → `AC_QuestManager`
   → Add Component ke `BP_ThirdPersonCharacter`.
2. Variables (progress hidup DI SINI):
   - `ActiveQuests` (Array of QuestDataAsset)
   - `CompletedQuestIDs` (Array of Name)
   - `QuestStepIndex` (**Map**: Name → Integer) ← step ke berapa per quest
   - `QuestStepCount` (**Map**: Name → Integer) ← counter step aktif
3. Functions:

```
[AddQuest] (Input: QuestData)
   [Branch: PrerequisiteQuest ada di CompletedQuestIDs? (atau kosong)]
     True:
       [Add ActiveQuests] [Map Add: StepIndex=0, StepCount=0]
       [Print "Quest Diterima: {QuestName}"]  ← nanti ganti toast widget

[LaporProgress] (Input: ObjectiveType Name, TargetID Name)
   [For Each ActiveQuests]
     step aktif = QuestSteps[StepIndex quest ini]
     [Branch: step.ObjectiveType == ObjectiveType AND step.TargetID == TargetID]
       True: StepCount += 1
             [Branch: StepCount >= RequiredCount]
               True → [StepSelesai quest]

[StepSelesai] (Input: QuestData)
   StepIndex += 1, StepCount = 0
   [Branch: StepIndex >= jumlah QuestSteps] True → [CompleteQuest]

[CompleteQuest] (Input: QuestData)
   [Remove ActiveQuests] [Add CompletedQuestIDs ← QuestID]
   XP += RewardXP, Gold += RewardGold (variabel di karakter)
   [Print "Quest Selesai! +{XP} XP"]
```

4. **Sambungkan ke dunia**: di `BP_Enemy_Hilichurl` event mati (Bagian 15C),
   sebelum destroy:
   `player → AC_QuestManager → LaporProgress("KillEnemy", "Hilichurl")`.
   (Pattern satu pintu — sama dengan `ReportObjective` C++ di project besar.)

## 17C. NPC Quest Giver

1. `BP_NPC_QuestGiver` (Actor): Static Mesh (capsule/karakter), Sphere
   Collision (trigger), **Widget Component** (tanda seru), Text Render (nama).
2. Variable: `QuestUntukDiberikan` (QuestDataAsset — Instance Editable ✓
   biar tiap NPC di level bisa dikasih quest beda).
3. Tanda seru — BeginPlay:

```
[Branch: QuestID ada di CompletedQuestIDs player?]
   True  → tanda ✓ hijau (atau hide)
   False → [Branch: ada di ActiveQuests?]  True → "?" abu  False → "!" kuning
```

4. Interact (pakai pola `ChestDidekat` Bagian 11 — generalisasi jadi
   `ActorDidekat` + interface `BPI_Interaksi` kalau sudah berani):

```
[Interact]
   NotStarted → tampilkan W_DialogBox "Tolong basmi 3 hilichurl!"
                  [Terima] → AddQuest → tutup
   Active     → step terakhir TalkToNPC & count terpenuhi?
                  Ya → LaporProgress("TalkToNPC", "PakTani") → dialog terima kasih
                  Belum → dialog pengingat "Masih ada {sisa} hilichurl"
```

5. **W_DialogBox**: Text nama NPC + Text isi + Button Terima/Tutup +
   background blur. Saat buka: `Set Input Mode UI Only` + `Show Mouse
   Cursor ✓`; saat tutup: `Set Input Mode Game Only` + cursor ✗.
   *(Lupa balikin input mode = karakter gak bisa gerak — bug klasik #2.)*

## ✅ CHECKPOINT

- [ ] Terima quest dari NPC → bunuh 3 hilichurl → counter jalan → balik lapor → reward
- [ ] Quest kedua dengan prerequisite quest pertama — terkunci sampai selesai
- [ ] Paham kenapa progress dipisah dari Data Asset

➡️ [Bagian 18 — Objective Marker](18-objective-marker.md)
