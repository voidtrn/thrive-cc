# Editor Work Checklist — hal yang gak bisa dieksekusi dari sesi code-only

Semua item di sini butuh Unreal Editor (asset creation, import, platform SDK).
Environment penulisan kode ini gak punya editor sama sekali (lihat ground
truth di `CLAUDE.md`) — jadi ini panduan actionable, bukan hasil kerjaan.

---

## 1. Wiring konten prolog baru (StarterContentLibrary/CutsceneActor)

Kode di `System/StarterContentLibrary.h` + `World/CutsceneActor.h` sudah
selesai, `AOpenWorldGameMode::BeginPlay` sudah auto-register 2 quest prolog.
Sisa kerja editor:

- [ ] `BP_NPC_Yukine` (turunan `BP_NPC` existing) di ruins Duskvale:
      interact prompt → `DialogueManager->StartDialogue(UStarterContentLibrary::BuildYukineIntroDialogue(this), "Start")`
- [ ] `BP_NPC_Shiden` sama pola, panggil `BuildShidenIntroDialogue`
- [ ] Trigger volume `Prologue_TremorSite` → `ReportObjective(GoToLocation, "Prologue_TremorSite")`
- [ ] 3× `BP_Hilichurl` (row `Hilichurl_Melee`) di jalur menuju ruins
- [ ] Pickup `Item_CrackedVisionShard` → `ReportObjective(CollectItem, "Item_CrackedVisionShard")`
- [ ] Reposisi `FQuestStep::TargetLocation` di `StarterContentLibrary.cpp`
      (placeholder `(2000,1500,200)`) sesuai koordinat level asli
- [ ] Opsional: `ACutsceneActor` di titik masuk ruins — isi `Shots` (2-3 shot:
      wide establishing → push-in ke reruntuhan), assign `DialogueTable` =
      hasil `BuildYukineIntroDialogue` biar auto-play pas cutscene selesai

## 2. Gamepad Input Mapping Context

Enhanced Input sudah dipasang (arsitektur gamepad-ready), tapi belum ada
IMC gamepad aktual:

- [ ] `Content/Input/IMC_Gamepad` — mapping tiap `UInputConfig` action ke
      gamepad (stick kiri=move, kanan=look, RT=normal attack/charged hold,
      LT=aim/dodge-alt, face buttons=dodge/interact/skill/burst)
- [ ] `AOpenWorldPlayerController`: tambah logic deteksi input device
      (`FSlateApplication::Get().GetPlatformApplication()->GetLastInputDeviceType()`
      atau bind ke `FCoreDelegates::OnUserActivityDeviceInput`) → swap
      IMC_Default↔IMC_Gamepad otomatis, bukan cuma KB/M
- [ ] UI navigation: pastikan semua widget (`WBP_QuestJournal`, `WBP_Dialogue`,
      dll) punya focus-navigation gamepad-friendly (UMG Focus system), bukan
      cursor-only
- [ ] Icon prompt kontekstual (F / A / Cross) — butuh data table icon per
      device type di UI

## 3. Platform build — Steam PC (Win/Mac/Linux)

Config sudah PC-oriented dan sudah benar utk target ini (lihat audit
sebelumnya): `SteamNetDriver` + `IpNetDriver` fallback, Nanite on, VSM off,
ray tracing off (cocok GTX1660/RTX2060 minspec). Yang masih perlu:

- [ ] **First compile** (prioritas #1 project ini, dari BUILD_NOTES.md) —
      belum bisa dilewati apa pun sampai ini selesai
- [ ] `SteamDevAppId=480` di `DefaultEngine.ini` → ganti App ID production
      sebelum build Shipping (sudah dikomentari di file, jangan lupa)
- [ ] Mac: belum pernah dicoba. Cek Nanite/Lumen-off combo jalan di Metal
      RHI (UE5.4 support ada, tapi minspec GPU Mac beda dari GTX1660 — perlu
      scalability pass terpisah kalau target Mac beneran, bukan cuma
      "compile berhasil")
- [ ] Linux: sama, belum pernah dicoba — Vulkan RHI default, cross-check
      Water/Niagara plugin compat
- [ ] Kalau nanti perlu override per-platform (resolusi default, RHI
      preference eksplisit): tambah `WindowsEngine.ini`/`MacEngine.ini`/
      `LinuxEngine.ini` overlay — jangan taruh semua di `DefaultEngine.ini`

## 4. Android / iOS — bukan "port", ini scope proyek baru

**Rekomendasi: jangan kejar ini utk versi 1.** Kontrol combo/dodge/lock-on
action combat (spec Phase 3) dirancang around KB/M + gamepad; touch-only
butuh redesain kontrol total (virtual joystick + auto-target + simplified
combo input — pattern beda, bukan remap). Render budget juga beda jauh
(GTX1660 minspec vs mobile GPU tier). Kalau tetap mau dikejar suatu saat:
treat sebagai proyek kontrol/UI terpisah, bukan checklist tambahan di sini.

## 5. Sound & VFX asset priority (ART_B/ART_C sudah spec, tinggal eksekusi)

Hook C++ semua sudah ada (`SFXManager`/`VFXManager`/footstep/music manager/
hit stop) — 0 kerjaan kode. Urutan bikin asset yang paling kepakai duluan:

- [ ] SFX reaction 7 elemen (dipakai `SFXManager` auto-play tiap reaction —
      paling sering ke-trigger di gameplay loop)
- [ ] Weapon swing/impact per `EWeaponType` (5 tipe) — `OnDamageDealt` hook
      sudah nunggu di BP
- [ ] VO placeholder utk 3 dialogue node baru (Yukine intro 3 baris, Shiden
      intro 2 baris) — `FDialogueNode::VoiceLine` slot udah ada, sekarang
      null
- [ ] Music manager: 1 track exploration Duskvale + 1 track combat (state
      switch sudah C++, tinggal assign `USoundBase`)
- [ ] Niagara reaction VFX 7 elemen — paling terlihat, tapi paling mahal;
      prioritas setelah SFX kalau waktu terbatas
