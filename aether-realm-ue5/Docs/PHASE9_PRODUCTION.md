# PHASE 9 — Production Guide

Timeline realistis solo / 2-3 orang, 14 bulan ke Steam launch.
Kode semua phase sudah di repo — timeline ini untuk **konten & asset**.

## Timeline

| Bulan | Fokus | Milestone |
|---|---|---|
| 1-2 | **Foundation** | Project compile, World Partition landscape jadi, karakter jalan/lari/lompat/sprint/glide/climb, kamera enak, cel-shading first pass. *Kode: Phase 1-2 — tinggal asset* |
| 3-4 | **Combat Core** | 1 karakter komplit (anim + skill + burst), 2 enemy AI, damage numbers, 2-3 reaction dulu (Vaporize/Melt/Overload). *Kode: Phase 3* |
| 5-6 | **World Content** | 1 region 1km² populated: chest, oculi, waypoint, statue; day/night + weather; 5 quest (1 main, 2 world, 2 daily); NPC + dialogue. *Kode: Phase 4+6* |
| 7-8 | **Systems Polish** | Inventory/character/map UI, wish system live, save/load solid, karakter ke-2, 5 tipe enemy. *Kode: Phase 5+7* |
| 9-10 | **Content & Balance** | 10+ quest, enemy balancing pass, artifact & weapon basic, karakter ke-3 |
| 11-12 | **Steam Prep** | 10-15 achievement, cloud save, store assets, QA + bugfix + optimization pass. *Kode: Phase 8* |
| 13-14 | **Polish & Launch** | 60fps stabil, controller support, trailer, review build Valve, day-1 patch siap |

Aturan scope solo dev:
- 3 karakter playable, 5 enemy, 1 region — JANGAN tambah sebelum launch
- Reaction system sudah full di kode, tapi konten cukup pakai 4-5 reaction
- Battle Pass, multiplayer live, region ke-2 = post-launch

## Optimization Targets (GTX 1660 / RTX 2060 @1080p60)

| Metric | Budget |
|---|---|
| FPS | 60 stabil (frame 16.6ms: game 8ms, render 8ms) |
| Draw calls | < 2000 |
| Triangles visible | < 2M |
| Texture memory | < 3GB |
| RAM | < 8GB |

### Teknik (config dasar sudah di DefaultEngine.ini)

1. **LOD**: karakter LOD0-3 (100%/60%/30%/10%), building LOD0-4,
   foliage LOD0-2 + billboard. Auto-generate di Static Mesh editor.
2. **Culling**: distance culling volume per kategori (props kecil 50m,
   building 500m), occlusion default on, foliage cull start 40m.
3. **World Partition**: loading range 2 cell (25600) — jangan digedein
   sebelum profiling.
4. **Texture streaming**: pool 2GB (`r.Streaming.PoolSize=2000`),
   karakter 2K max, props 1K, terrain layer 2K shared.
5. **Niagara pooling**: semua VFX combat pakai `PoolMethod = AutoRelease` —
   hit spark/reaction burst di-spawn ratusan kali per menit.
6. **Animation budget**: URO (Update Rate Optimization) on untuk enemy —
   jauh dari kamera update 1/4 rate; `Budget Allocator` kalau party ramai.
7. **Blueprint**: logic per-tick pindah C++ (sudah — semua sistem core C++);
   BP nativization deprecated di UE5, tidak perlu.
8. **Profiling ritual**: `stat unit`, `stat gpu`, Unreal Insights tiap akhir
   milestone. Optimize yang terukur, bukan yang dikira.

## Konvensi (dipakai konsisten di seluruh repo)

- **C++**: core systems (combat, reaction, gacha, quest, save — done).
  **Blueprint**: gameplay scripting & wiring (montage notify, ability
  OnActivate, UI). **DataTable/DataAsset**: semua balance value
  (DT_Characters, DT_EnemyStats, DT_Banners, DT_Items, Quest assets).
- Prefix UE: `A`ctor, `U`Object, `F`Struct, `E`num, `I`nterface ✓
- Modular: sistem komunikasi via delegate/subsystem, tanpa hard cross-dependency ✓
- GAS terpasang (ASC di CharacterBase) — migrasi stat ke AttributeSet saat
  butuh buff/debuff stacking kompleks; Enhanced Input ✓; World Partition ✓

## Post-Launch Roadmap (kalau traction)

1. Patch stabilitas (minggu 1-2)
2. Konten: region baru / dungeon tambahan
3. Co-op aktivasi penuh (arsitektur sudah siap — sessions UI + FSavedMove climb + validasi damage)
4. Karakter baru per 2-3 bulan
