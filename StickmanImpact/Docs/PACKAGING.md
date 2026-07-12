# StickmanImpact — Packaging & Distribution Guide

Everything here is editor/config/tooling work — no game code changes required. Written for
UE 5.4.

## 1. Build configurations

| Config | Use | Notes |
|---|---|---|
| Development | internal testing | Full logging, console, `UStickmanCheatManager` active, `stat` commands work |
| Shipping | distribution | Logging minimal, console + cheat manager stripped automatically, faster |

Always test a **Shipping** package before release — code that only ever ran in Development
hides Shipping-only issues (stripped ensure/log side effects, cook-only asset bugs).
`Test` config is the middle ground when you need Shipping behavior + some stats.

**Platform targets**: Win64 is the primary target. Console targets (PS/Xbox/Switch) each need
the platform's confidential SDK + Unreal platform extension from the respective dev portal —
they replace this guide's file-IO save path with their `ISaveGameSystem` and add TRC/XR
certification requirements far beyond this doc's scope. Plan a dedicated cert pass per console.

**Spec targets** (validate on real hardware, these are goals not measurements):
- Minimum: quad-core CPU (~2015 i5), 8 GB RAM, GTX 960/4GB, SSD recommended, ~15 GB — targets
  30 FPS at 1080p Low (which `UPerformanceManager`'s dynamic quality defends).
- Recommended: 6-core CPU, 16 GB RAM, RTX 2060 — 60 FPS at 1080p High.
- Set `TargetFPS` and default scalability per bucket in `DefaultGameUserSettings.ini`.

## 2. Asset cooking

Project Settings → Packaging:
- **Use Pak File**: on (already set in `DefaultGame.ini`).
- **Cook only maps + referenced content**: list your maps in "List of maps to include in a
  packaged build". Everything referenced by them cooks; nothing else does. Audit with
  `ProjectLauncher`'s cook report or `-CookOnTheFly` testing.
- **Exclude debug content**: keep test maps/dev-only assets under a folder listed in
  "Directories to never cook" (e.g. `Content/Dev/`). Editor-only assets (the input debug
  widget's WBP if you made one) go there too.
- **Texture compression**: leave per-asset defaults (BC7 for high-quality color, BC5 normals);
  set a per-platform max texture size via `DefaultDeviceProfiles.ini`
  (`r.Streaming.PoolSize`, `MaxTextureSize` per profile) rather than resizing sources.
- **Audio compression**: project-wide Stream Caching on (Project Settings → Audio); per-sound
  quality on the SoundWave assets (music ~0.4 quality Ogg/ADPCM per platform default, SFX
  higher). BGM must be "Streaming" so it never fully loads.

## 3. Packaging settings

- **Icon**: Project Settings → Platforms → Windows → Game Icon (`.ico`, 256px multi-res).
- **Splash**: same page → Splash screen (`Splash.bmp`) — editor + game splashes separate.
- **Version**: Project Settings → Description → Project Version (`1.0.0`); mirror it in
  `DefaultGame.ini` `[/Script/EngineSettings.GeneralProjectSettings] ProjectVersion` so
  builds are identifiable. Surface it on the title screen from
  `GetDefault<UGeneralProjectSettings>()->ProjectVersion`.
- **Build automation** (RunUAT — put in CI or a `Scripts/package.bat`):

```bat
call "%UE_ROOT%\Engine\Build\BatchFiles\RunUAT.bat" BuildCookRun ^
  -project="%CD%\StickmanImpact.uproject" ^
  -platform=Win64 -clientconfig=Shipping ^
  -build -cook -stage -pak -archive ^
  -archivedirectory="%CD%\Builds\%date:~-4%%date:~4,2%%date:~7,2%"
```

Add `-nodebuginfo` for smaller archives, keep symbols (`.pdb`) archived separately for crash
symbolication.

## 4. Distribution checklist

- [ ] **References**: Right-click `Content/` → Fix Up Redirectors; then `Audit Assets` /
      Reference Viewer for anything unexpectedly referenced by shipped maps.
- [ ] **Redirectors**: zero remaining after fix-up (search `.` for ObjectRedirector in the
      Content Browser filter).
- [ ] **Save system**: on the Shipping package — new game, save all 4 slots, quit, reload each;
      corrupt a file deliberately (hex-edit a byte) and confirm the `.bak` → auto-save fallback
      chain works; confirm `session.lock` crash detection by killing the process.
- [ ] **All maps load**: `open <mapname>` each shipped map in the package (Development build of
      the same cook), watch log for missing-asset warnings.
- [ ] **Performance floor**: min-spec hardware (or a constrained VM), full combat + weather +
      crowd scene ≥ 30 FPS after dynamic quality settles; `Stickman.ShowFPS` on a Test-config
      build.
- [ ] **First compile/run reality check**: this codebase has never been compiled against a real
      UE 5.4 install in the sessions that authored it — budget a fix pass for minor API
      mismatches *before* any of the above.

## 5. Post-launch

- **Updates/patches**: pak-file patching via the same BuildCookRun with
  `-basedonreleaseversion=1.0 -createreleaseversion=1.1 -generatepatch` — ships only changed
  chunks. Steam handles delta distribution on top automatically. Keep `SaveVersion` in
  `UStickmanSaveGame` bumped + a migration branch in `USaveManager::ReadSlotFile` whenever the
  save layout changes.
- **Crash/bug reports**: enable Crash Reporter (Project Settings → Packaging → Include Crash
  Reporter) pointed at a DataRouter endpoint (self-hosted or a service like Sentry/BugSplat via
  their UE plugins). In-game "report a bug" = a simple HTTPS POST (FHttpModule) of log tail +
  `session.lock` state + save-slot metadata to your endpoint — build only with user consent
  and a visible privacy note.
- **Analytics for balance**: UE's Analytics plugin interface (`IAnalyticsProvider`) with any
  backend; events worth tracking for THIS game's balance: reaction usage per type
  (`UElementalReactionManager::OnReactionTriggered`), skill cast counts per SkillTag, deaths
  per region, quest abandon points, gacha pity distribution. All are existing delegates — an
  analytics component just subscribes, same pattern as `UAchievementManager`. Ship analytics
  opt-in/opt-out in the settings screen; don't collect silently.

## 6. Platform save/achievement notes

- **Steam**: Auto-Cloud config on the partner site pointing at `Saved/SaveGames/` — zero code.
  Achievements: OnlineSubsystemSteam plugin + achievement IDs mirrored in the partner site,
  upload in `UAchievementManager::UnlockInternal` via `IOnlineAchievements::WriteAchievements`.
- **Consoles**: replace `USaveManager`'s direct file IO with `ISaveGameSystem` (the class is
  already isolated in `WriteSlotFile`/`ReadSlotFile` — that's the only seam to swap), and
  follow the platform's user-profile + save-data TRC requirements.
