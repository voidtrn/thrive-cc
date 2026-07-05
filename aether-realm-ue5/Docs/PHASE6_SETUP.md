# PHASE 6 — Quest & Dialogue System (langkah editor)

C++ selesai: `UQuestManager` + `UQuestDataAsset` (quest engine),
`UDialogueManager` + `FDialogueNode` (dialogue engine), persistence penuh.

---

## 6A. Quest System

### Bikin quest

1. `Content/Data/Quests/` → klik kanan → Miscellaneous → **Data Asset** →
   pilih `QuestDataAsset`. Satu asset per quest (`QA_Archon_01`, `QA_Daily_KillHilichurl` dst).
2. Isi: QuestID, nama, deskripsi, tipe, prerequisites, AR requirement,
   steps, rewards, bAutoStart.
3. Register: `BP_OpenWorldGameMode` BeginPlay →
   `QuestManager->RegisterQuests(ArrayOfAllQuestAssets)` (array variable, isi semua asset).

### Objective wiring — panggil `ReportObjective` dari gameplay

| Objective | Dari mana |
|---|---|
| KillEnemy | `AEnemyBase` BP: event `OnDied` → `ReportObjective(KillEnemy, StatsRowName)` |
| CollectItem | pickup BP → `ReportObjective(CollectItem, ItemId)` |
| TalkToNPC | dialogue action `ReportTalkObjective` (otomatis dari node) |
| InteractObject | interact BP → `ReportObjective(InteractObject, ObjectId)` |
| GoToLocation | trigger volume BP di lokasi → `ReportObjective(GoToLocation, StepID)` |
| CompleteDomain | domain clear logic → `ReportObjective(CompleteDomain, DomainId)` |
| Wait | otomatis (timer C++ dari `WaitSeconds`) |

AR level-up otomatis saat reward ARExp masuk (threshold 1000 × rank).
Daily commission: `GetTodayCommissions()` roll 4 random tiap hari (UTC),
repeatable — panggil dari UI daily / login.

### Quest Journal UI (`WBP_QuestJournal`)

- List: `GetActiveQuests()` → nama + tipe (warna per EQuestType: Archon emas,
  World biru, Daily hijau, Story ungu)
- Detail: deskripsi + `GetCurrentStep()` → StepDescription + progress
  `State.CurrentCount / Step.RequiredCount` + reward preview
- Update realtime: bind `OnObjectiveProgress`, `OnQuestStepAdvanced`,
  `OnQuestCompleted` (toast "Quest Completed" + reward popup)
- **Quest marker**: `Step.TargetLocation` → widget marker di screen
  (ProjectWorldToScreen) + icon di minimap. Navigate: garis path di map
  (Phase advanced: NavMesh FindPath → polyline di map widget)

## 6B. Dialogue System

### Bikin percakapan

1. `Content/Data/Dialogues/DT_NPC_Katheryne` — Row Struct: **DialogueNode**.
   Satu DataTable per NPC/percakapan.
2. Row = node. `NextNodeID` chain linear; `Choices` = branching;
   dua-duanya kosong = dialog selesai.
3. Kondisi choice: QuestCompleted / QuestActive / HasItem → choice
   tersembunyi kalau gagal (filter otomatis C++).
4. Actions per node: GiveItem, TakeItem, StartQuest, ReportTalkObjective,
   GivePrimogems, GiveMora — jalan otomatis saat node tampil.

### Dialogue UI (`WBP_Dialogue`) — visual novel style

1. Layout:
   - Portrait kiri/kanan (`Node.bPortraitLeft`), aktif = full color,
     lawan bicara = dim 40%
   - Text box bawah: nama speaker (accent color) + `DialogueText`
   - Background: `BackgroundBlur` widget (blur 8) di atas game screen
2. **Typewriter effect**: timer 0.02s/karakter append ke TextBlock;
   klik saat mengetik = tampilkan penuh; klik lagi = `Advance()`
3. Choices: muncul setelah teks selesai — `GetAvailableChoices()` →
   tombol vertikal di atas text box → `SelectChoice(index)`
4. Auto-play toggle: timer `Advance()` 2s setelah teks penuh (+ durasi voice line)
5. Skip: tahan tombol → `EndDialogue()`
6. Voice line: `Node.VoiceLine` → PlaySound2D saat node tampil
7. Input: saat `StartDialogue` → `PC->SetInputContextMode(Dialog)`;
   bind `OnDialogueEnded` → balik `Default`. IMC_Dialog: IA_Interact = advance.

### NPC interaksi

`BP_NPC`: sphere trigger + prompt "F" → `DialogueManager->StartDialogue(DT_Saya, "Start")`.
Node "Start" bisa branching by condition (quest state beda = sapaan beda).

## Checklist Phase 6

- [ ] Quest auto-start jalan saat prerequisite selesai
- [ ] Kill 3 hilichurl → step maju → dialog → reward masuk (primogems/mora/AR)
- [ ] AR naik saat exp threshold, quest ke-lock AR requirement
- [ ] Daily commission: 4 random per hari, reset UTC midnight, repeatable
- [ ] Journal: list aktif, progress realtime, marker di world
- [ ] Dialogue: typewriter, choice conditional muncul/hilang, action GiveItem jalan
- [ ] TalkToNPC objective selesai via dialogue action
- [ ] Quest & dialogue state persist setelah save/load
