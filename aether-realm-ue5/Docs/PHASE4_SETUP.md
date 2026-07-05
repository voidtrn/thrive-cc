# PHASE 4 — Open World Systems (langkah editor)

C++ selesai: climbing (custom movement mode), glide upgrade (wind current +
auto-fold), swim + drowning, stamina lengkap, `AWaypoint`, `AStatueOfTheSeven`,
`AChest`, `AOculusCollectible`, `AWindCurrent`, `ADayNightController`,
`AWeatherController`, save system penuh (`UOpenWorldSaveGame`).

---

## 4A. Exploration

### Climbing — wiring input

| Input | Call |
|---|---|
| IA_Jump saat menghadap dinding (grounded/falling) | `Move->TryStartClimbing()` |
| IA_Jump saat climbing | `Character->TryJumpClimb()` (25 stamina, boost 200) |
| IA_Dodge / IA_Jump ke belakang saat climbing | `Move->StopClimbing()` |
| IA_Sprint saat climbing | `Move->SetSprinting(true)` → drain 25/s |

Stamina drain otomatis di C++ (`TickStamina`): climb 15/s, sprint climb 25/s,
habis = slide (keluar climb → falling; AnimBP mainkan slide anim saat
`bIsInAir && velocity.Z < 0` dekat dinding).

**Wall material licin**: buat PhysicalMaterial `PM_Slippery` (SurfaceType1),
assign ke material dinding licin, lalu di BP_PlayerCharacter →
MovementComponent → `ClimbCostMultiplierPerSurface`: SurfaceType1 = 1.5.

AnimBP: state Climb sudah dapat `bIsClimbing` dari `CharacterAnimInstance`.

### Gliding

- Trigger: IA_Glide / IA_Jump di udara → `Move->StartGliding()` (sudah Phase 2)
- Stamina 5/s otomatis; dalam `AWindCurrent` = gratis + updraft 900
- Auto-fold dekat ground (trace 150cm) — C++
- Deploy anim: transisi state Air→Glide di AnimBP (play deploy montage sekali)
- Place `AWindCurrent` di level, atur box extent + `UpdraftSpeed`

### Swimming

- Engine `MOVE_Swimming` otomatis via Water plugin (sudah enabled) — buat
  Water Body di level, karakter masuk → swim
- Speed 200 (`MaxSwimSpeed` di movement), stamina 15/s otomatis
- Drowning: stamina 0 di air → HP drain 10%/s — C++
- Underwater: di-skip sesuai spec

### Stamina summary (semua C++, tuning di BP)

| Aksi | Cost |
|---|---|
| Sprint | 15/s |
| Climb / Sprint climb | 15/s / 25/s (× surface multiplier) |
| Jump climb | 25 instant |
| Glide | 5/s (wind current = 0) |
| Swim | 15/s |
| Charged attack | 25/s (Phase 3) |
| Dodge | 20 (Phase 3) |
| Regen | 25/s, delay 0.5s |
| Cap | 100 + 10/upgrade statue, max 240 |

### Waypoint & Statue

1. `BP_Waypoint` (parent `AWaypoint`): mesh + Niagara glow; unlock radius 500
   sudah C++. Teleport dari map UI → `TeleportHere(PC)` = heal + auto-save.
   Loading screen: streaming World Partition biasanya cukup cepat — kalau perlu,
   fade-in/out UMG di sekitar `TeleportHere`.
2. `BP_Statue` (parent `AStatueOfTheSeven`): interact F → `Worship(PC)`;
   UI offer oculi → `OfferOculi(PC)`. Set `OculiItemId` + `RegionName`.
   Map reveal: bind event di map widget (Phase 5).

---

## 4B. Day/Night & Weather

### Day/Night

1. Place `ADayNightController` di L_OpenWorld, assign:
   - `SunLight` = DirectionalLight level (movable ✓)
   - `SkyLight` = SkyLight (Real Time Capture ✓)
2. Siklus 24 menit = default `TimeScale` GameState (1/60). Ubah di
   BP_OpenWorldGameState kalau mau beda.
3. Sky Atmosphere + Volumetric Cloud: place standar, sun rotation otomatis
   menggerakkan atmosfer. Star visibility malam: material skybox param
   `StarVisibility` — bind `OnDayPhaseChanged` (Night → 1, lainnya → 0).
4. NPC schedule: bind `OnDayPhaseChanged` di BP NPC (buka toko pagi, tidur malam).

### Weather

1. Buat MPC `Content/Materials/MPC_Weather` dengan scalar `Wetness`.
   Master material (M_Character/Prop/Terrain_Anime): tambah lerp roughness
   turun + specular naik berdasarkan `Wetness` (Collection Parameter node).
   Puddle: decal material dengan opacity × Wetness.
2. Place `AWeatherController`, assign `WeatherMPC`, `HeightFog`
   (ExponentialHeightFog movable), `RainParticles` (Niagara rain, attach ke
   pawn/camera di BP).
3. Implement event `OnLightningStrike(Location, ThunderDelay)` di BP child:
   spawn flash (point light 0.1s) + bolt Niagara di Location, `Delay(ThunderDelay)`
   → play thunder sound. Delay dihitung C++ dari jarak (kecepatan suara).
4. Weather cycle random 3-8 menit sudah C++ (server only). Scripted quest:
   set `bRandomWeatherCycle = false`, panggil `GameState->SetWeather()` manual.
5. Enemy per weather: di BP spawner, cek `GameState->GetCurrentWeather()`
   sebelum spawn (mis. Electro slime hanya saat Thunderstorm).

---

## 4C. Chest & Collectible

### Chest

1. `BP_Chest` (parent `AChest`): mesh per tier (material instance wood/silver/
   gold/glow), implement `OnOpeningStarted` → play open animasi → `FinishOpening()`.
2. Tier & primogem roll sudah C++: Common 2-5, Exquisite 5-10, Precious 10-20,
   Luxurious 20-40. `BonusLoot` map utk material/artifact (roll 4* di Phase 5
   loot table).
3. Locked chest: `bStartLocked ✓` + `EnemyCheckRadius` 800 → auto-unlock saat
   semua `AEnemyBase` radius itu mati. Puzzle: panggil `UnlockChest()` dari BP puzzle.
4. Persistence sudah C++ (ID = nama actor level, disimpan di save).
   **Nama actor harus unik & stabil** — jangan rename setelah rilis save.
   Event chest: `bEventChest ✓` = tidak disimpan (respawn ok).

### Oculus

1. `BP_Oculus` (parent `AOculusCollectible`): Niagara glow warna
   `RegionElement`, set `ItemId` (Oculus_Anemo dst).
2. Float bobbing + auto-pickup + persistence sudah C++.
3. Counter UI: bind `OnCollected(ItemId, Total)`. Minimap indicator saat
   dekat: map widget Phase 5 query aktor radius.
4. Tebar 20-30 per region (tinggi/tersembunyi — reward eksplorasi glide/climb).

---

## 4D. Save Game

Struktur `FSaveGameData` lengkap di `UOpenWorldSaveGame` (posisi, region,
party, inventory, chests, oculi, waypoints, quests, primogems, mora, AR,
playtime, stamina bonus, settings, timestamp).

Trigger:
- Manual: menu pause → `GameInstance->SaveToSlot()`
- Auto: teleport waypoint ✓ (C++), worship/upgrade statue ✓ (C++);
  masuk domain & selesai quest → panggil `AutoSave()` dari BP transisi/quest.

### Steam Cloud

Steamworks App Admin → Cloud:
- Byte quota per user: 1 MB cukup (save < 100 KB)
- Root: `Saved/SaveGames` (path relative `%GameInstall%`), OS: All
- Enable "Cloud support" + auto-cloud — tanpa kode tambahan, Steam sync otomatis.

## Checklist Phase 4

- [ ] Climb dinding >45°, stamina drain, licin lebih mahal, jump climb, habis = slide
- [ ] Glide 5/s, wind current naik gratis, auto-fold dekat tanah
- [ ] Swim 200 speed, stamina habis = HP drain 10%/s
- [ ] Stamina cap naik +10 per offer oculi di statue (max 240)
- [ ] Waypoint unlock 500 unit, teleport = heal + auto-save
- [ ] Siang-malam 24 menit, dawn/dusk/night phase event, malam biru gelap
- [ ] Hujan = surface wet (material), thunderstorm = kilat + delayed thunder
- [ ] Chest 4 tier, locked auto-unlock saat enemy mati, tidak respawn setelah save
- [ ] Oculus float, auto-pickup, counter, persist
- [ ] Save/load slot penuh; Steam Cloud sync
