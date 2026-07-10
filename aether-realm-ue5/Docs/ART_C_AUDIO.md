# SECTION C — Sound Design

C++ tersedia: `UFootstepComponent` (surface detection + volume by speed +
pitch ±5%), `UMusicManagerSubsystem` (state machine + crossfade + exit-combat
delay 5s), `ASFXManager` (auto-play reaction SFX, lihat C2 Elemental),
delayed thunder (Phase 4), hit stop (CombatComponent).

## C1. Middleware

**Rekomendasi solo dev: MetaSounds** (built-in UE5).
- Zero external tool, zero licensing, versioned bareng project
- Cukup untuk: layered footsteps, random containers, RTPC-style params, music layers
- Wwise dipilih kalau: tim ada sound designer dedicated yang sudah biasa Wwise
  (free < 200 aset), butuh profiling audio berat
- FMOD: middle ground, integrasi UE bagus — opsi kedua

Struktur folder (`Content/Audio/`, berlaku apapun middleware-nya):
```
Audio/
├─ Music/        Exploration (per region + day/night), Combat, Boss, Menu, Cinematic
├─ SFX/
│  ├─ Character/ Footsteps (per surface), Skills, VoiceGrunts, Foley
│  ├─ Combat/    WeaponSwing, Impact (per weapon), Reactions, HitHurt
│  ├─ Environment/ Ambience, Weather, Interactive (chest/door/teleport)
│  └─ UI/        Menu, Buttons, Wish, Notifications
└─ Voice/        Player, NPC, Enemy
```

## C2. SFX Specs

### Footsteps — sudah C++ (`UFootstepComponent`)

1. Buat PhysicalMaterial per surface, daftarkan SurfaceType di
   Project Settings → Physics: Grass(1), Dirt(2), Stone(3), Wood(4),
   Water(5), Snow(6), Sand(7), Metal(8). Assign ke material landscape
   layer & mesh.
2. Sound per surface = **MetaSound Source** dengan random selector 4-6
   sample + layer (grass = thud + rustle; stone = tap + reverb tail).
3. Pasang komponen di BP karakter, isi `SurfaceSounds` map, buat
   AnimNotify `AN_Footstep` → `PlayFootstep(foot_l / foot_r)` di frame
   foot plant tiap anim locomotion.
4. Volume by speed & pitch ±5% otomatis C++.

### Combat

| Senjata | Swing | Impact |
|---|---|---|
| Sword | whoosh 3-4 var; pitch per combo naik (+0/+2/+5/+10%) — set dari BP notify pakai combo index; layer blade + cloth | 3 var: flesh/armor/shield; volume scale damage (pakai `Result.FinalDamage` normalized); low-pass by distance (attenuation curve) |
| Claymore | whoosh lambat bassy | thud besar, sync `PlayHitShake` |
| Polearm | whistle tajam + ring metalik | pierce + thud |
| Bow | draw = string tension pitch naik (loop + pitch param dari charge time); release whoosh directional | thud/ting by surface |
| Catalyst | chime/whoosh per elemen | magical burst |

Hook: `OnDamageDealt` → play impact by weapon+surface; anim notify → swing.

### Elemental — sudah C++ (`ASFXManager`)

Pasangan audio dari `AVFXManager` (ART_B_VFX.md) — pola sama persis: place
SATU `ASFXManager` di `L_OpenWorld`, isi `ReactionSFX` map (per `EReactionType`)
+ `CrystallizeShieldSFX` di detail panel. Auto-bind
`ElementalReactionSubsystem::OnReactionTriggered`/`OnCrystallizeShield` saat
`BeginPlay` — tak perlu BP wiring manual, tinggal isi asset. Skill/burst
`OnActivate` (non-reaction, mis. cast sound) tetap di-hook manual per ability
BP — di luar scope reaction-only manager ini.

| Elemen | Karakter suara |
|---|---|
| Pyro | crackle, roar; skill = burst whoosh + flame rumble; burst = roar besar + bass |
| Cryo | glassy, crystalline; skill = ice forming ring; burst = cracking + shatter |
| Electro | buzz, zap; skill = lightning crack + sizzle; burst = thunder + discharge |
| Hydro | splash, flow; burst = surge roar |
| Anemo | wind howl, vacuum pull |
| Geo | rumble, crystal chime, deep thud |

### Ambience

- **Audio Volume sphere** per area + crossfade antar region
- Layer: base loop + spot sounds (random interval MetaSound: burung, ranting)
- Day/night: bind `OnDayPhaseChanged` → swap layer (burung ↔ jangkrik)
- Weather override: `OnWeatherChanged` → duck ambience, play rain loop
- Region: Forest (birds/wind/river/crickets), Mountain (howl/eagle),
  Lake (lap/gulls/frogs), Town (chatter/bells/chimes)
- Water: river loop by size, waterfall roar + mist layer, ocean crash, lake lap
- Interior: low-pass semua exterior (Audio Volume ambient zone settings)

### UI

Menu: open whoosh+chime, close reversed, tab click, hover tick, confirm
chime, cancel blip. **Wish**: start starry wind-up → meteor whoosh+rumble →
reveal 3★ pop / 4★ chime ungu / 5★ **orchestral hit + fanfare emas** (jangan
pelit di sini — momen paling penting). Notif: quest fanfare mini, achievement
chime, level up ascending, item sparkle, low HP pulse beep.

## C3. Music — sudah C++ (`UMusicManagerSubsystem`)

Wiring:
1. BP GameMode BeginPlay: `SetStateTrack(Exploration, MS_Forest_Day)` dst
   semua state.
2. Day/night: `OnDayPhaseChanged` → `SetStateTrack(Exploration, day? MS_Day : MS_Night)`
   — crossfade in-place otomatis.
3. Enemy aggro (`EnemyAIController.SetCombatTarget` atau BT service) →
   `SetMusicState(Combat)`. Boss BP → `SetMusicState(Boss)`.
4. Enemy terakhir mati → `RequestExitCombat()` (delay 5s built-in, batal
   otomatis kalau re-aggro).
5. Intensity: BP hitung enemy aggro count → `SetCombatIntensity(count/4)`.

Komposisi target:
- Exploration: 3-5 menit seamless loop, orchestral anime OST; day = major
  cerah, night = piano calm
- Combat: layered (percussion → strings → full); tempo 120/140/160
- Boss: intro build-up → main loop → desperation variant (low HP, trigger
  dari `OnHealthChanged` boss < 30%) → victory sting
- Adaptive layering penuh (stem terpisah aktif per intensity) = MetaSounds
  (satu source, N wave player, volume per layer dari input param) — struktur
  subsystem sudah kompatibel, ganti `SetCombatIntensity` implementasi

## C4. Voice Over

Prioritas solo dev (VO mahal): **combat barks dulu**, dialogue text-only.

Per karakter (±25 line): skill ×3-5, burst ×2-3, attack grunt ×3-5, heavy,
hit ×3, low HP, death, swap in/out, sprint, glide, climb, stamina habis,
teleport, chest, weather ×2, sunset, idle personality ×2, select/levelup/ascend.

Implementasi:
- `DT_VoiceLines`: RowName = `<CharId>_<Event>_<Index>`, kolom: SoundBase,
  subtitle FText per bahasa
- Play dari event yang sudah ada: ability `OnActivate`, `OnPartySwapped`,
  `OnChestOpened`, glide start dst — helper BP `PlayVoiceLine(CharId, Event)`
  pilih random index + cooldown per event (jangan spam)
- Bahasa: JP original + EN sub; kolom subtitle per locale, voice folder per
  locale (`Audio/Voice/JP/…`), pilih via `GameSettings`
- NPC: greeting bark 1-2 kata, shop welcome/thanks, hurt/death cry —
  generic pool shared antar NPC
