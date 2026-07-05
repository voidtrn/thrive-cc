# SECTION B — VFX (Niagara)

Hook C++ yang sudah tersedia (tinggal bind di BP):
- `UElementalReactionSubsystem::OnReactionTriggered(Reaction, Target, Instigator, Location)` → spawn VFX reaction
- `UCombatComponent::OnDamageDealt(Victim, Result)` → hit impact + crit
- `AChest::Multicast_PlayOpenEffect` → chest VFX
- `AWaypoint::OnUnlocked`, `ADayNightController::OnDayPhaseChanged` (fireflies), `AWeatherController::OnLightningStrike`
- `UCombatComponent::OnPerfectDodge` → afterimage flash

Semua system taruh `Content/VFX/<Element>/NS_*`. Material dasar: `M_VFX_Anime` (Phase 2, unlit).
**Semua combat VFX set Pooling: AutoRelease** (Phase 9 budget).

## B1. Elemental VFX

### PYRO
| System | Emitters | Detail |
|---|---|---|
| `NS_Pyro_Aura` | 3 | ① embers naik: sprite kecil, velocity Z 30-60, lifetime 1.2s, fade; ② fire wisps: **Ribbon** renderer, spiral velocity, additive; ③ heat distortion: sprite besar material refraction (scene color offset) |
| `NS_Pyro_SwordTrail` | 1 | Ribbon ikut socket weapon (attach `weapon_r`), width 15-20, lifetime 0.3s, color gradient `#FF4400 → #FFAA00 → alpha 0`, additive |
| `NS_Pyro_SkillImpact` | 4 | burst sphere outward (sprite + mesh shockwave), ground scorch **decal** (spawn dari BP, fade 5s), sparks 20-30 **Collision GPU** enabled (bounce), point light spike 5000→0 dalam 0.5s |
| `NS_Pyro_Burst` | 5 | fire tornado eskalasi (ribbon spiral + mesh cone), ground rune decal berputar (material panner), ledakan besar, lingering fire field 10s (loop emitter + damage area dari ability BP), post-process overlay merah 0.5s (Camera Manager) + `PlayBurstShake()` sudah C++ |

### CRYO
- `NS_Cryo_Aura`: kristal es floating (mesh renderer, material refraksi translucent), cold mist ground-level (sprite soft, velocity rendah), `#B8E8FF → #FFFFFF`
- `NS_Cryo_Skill`: proyektil ice shard (mesh kristal spin + trail), impact shatter (fragment mesh burst), frost decal
- Freeze (bind `OnReactionTriggered: Freeze`): frost overlay material di enemy (dynamic material instance, param `FrostAmount` 0→1) — enemy jadi patung es
- `NS_Cryo_Burst`: expanding ice ring, ice spikes tumbuh dari ground (static mesh scale-up animation via emitter), screen edge frost (post-process material), snow heavy + mist lingering

### ELECTRO
- `NS_Electro_Aura`: arc listrik (**ribbon jagged** — jitter position curve), spark pop random, core `#AA00FF` glow `#00FFFF`
- `NS_Electro_Skill`: lightning strike dari atas (ribbon beam, spawn instan), ground crackle spread, screen flash putih 0.1s
- `NS_Electro_Burst`: karakter levitate (anim + loop VFX kaki), orbiting electro rings (mesh torus ×3 rotasi beda axis), massive strike area, lingering charged field (ground crack decal + emissive), shake intense

### HYDRO
- `NS_Hydro_Aura`: droplet orbit + water ribbon flow, `#3388FF / #00CCFF`
- `NS_Hydro_Skill`: splash impact + ripple ring decal; wet effect enemy = dynamic material param `Wetness` (darken + spec boost — konsisten dengan MPC weather)

### ANEMO — `NS_Anemo_Swirl`
Wind line ribbons melengkung, leaf/debris terangkat (sprite atlas daun), absorption: partikel warna elemen source tertarik ke pusat lalu menyebar AOE. `#80FFCC`. Bind `OnReactionTriggered: Swirl` — warna via User Parameter `ElementColor`.

### GEO — `NS_Geo_Crystallize`
Rock shard muncul dari ground (mesh), crystal drop melayang ke karakter (bind `OnCrystallizeShield`), shield visual: geo diamonds orbit translucent amber `#FFB800`.

### DENDRO
- Dendro Core: seed hijau glow pulsing (scale sine) — spawn/despawn ikut `DendroCores` subsystem (bind reaction Bloom)
- Bloom: green burst + leaf particles `#66CC00/#99FF33`
- Hyperbloom: core → infus electro → **homing projectile** (emitter dengan Point Attraction Force ke enemy terdekat, trail hijau+ungu)
- Burgeon: core → infus pyro → ledakan besar oranye-hijau

## B2. Environment VFX

| VFX | Implementasi |
|---|---|
| Rain | `NS_Rain`: tiling sheet camera-relative (spawn di depan kamera, kill di belakang), ground splash emitter kedua (spawn rate ikut rain); wetness sudah via `MPC_Weather` C++ Phase 4; puddle decal di depression manual placement |
| Thunderstorm | Lightning + delayed thunder **sudah C++** (`OnLightningStrike(Location, ThunderDelay)`) — BP: spawn `NS_LightningBolt` (ribbon + point light 100k intensity 0.1s) + `Delay(ThunderDelay)` → thunder sound. Foliage bend: naikkan Wind Directional Source strength saat Thunderstorm |
| Falling leaves | `NS_AmbientLeaves`: spawn box besar, sprite atlas (petal/autumn/snow varian via User Param), drift + rotasi; place per biome |
| Fireflies | `NS_Fireflies`: dot glow `#CCFF88`, curl noise drift lambat; BP: bind `OnDayPhaseChanged` → activate saat Night, deactivate Dawn |
| Campfire/torch | `NS_Campfire`: fire kecil + smoke wisps translucent + point light **flicker** (light intensity curve noise) |
| Waypoint | Idle: partikel biru float + glow; teleport: dissolve material karakter (param `Dissolve` 0→1) + partikel converge; destination: expand + materialize (dissolve 1→0). Panggil sekitar `TeleportHere()` |
| Chest open | Bind `Multicast_PlayOpenEffect`: gold/white burst + light beam ke atas 2s + star particles (Precious/Luxurious saja — cek `Tier`) |

## B3. Combat Polish

| Efek | Implementasi |
|---|---|
| Hit impact | Bind `OnDamageDealt`: `NS_HitSpark` (putih-kuning additive, directional dari hit normal) + **hit stop sudah C++** (`HitStopSeconds` di CombatComponent — lihat kode) |
| Crit | `Result.bCrit` → spark lebih besar + shake subtle (`PlayHitShake` sudah C++); teks CRIT = damage number kuning (sudah C++) |
| Reaction trigger | Bind `OnReactionTriggered` → `NS_Reaction_<Type>` + floating text nama reaction (widget, warna dari `UDamageNumberWidget::GetReactionColor`) |
| Damage number | Sudah C++ Phase 3 — font: cari "impact/anime bold" (mis. asset font rounded-bold), anim pop-scale + float + fade di WBP |
| Dodge | `NS_DashDissolve`: partikel arah dash + dust puff start point; afterimage: **Pose snapshot** — spawn Static Mesh dari `GetAnimInstance->SnapshotPose` alternatif murah: ghost mesh translucent 0.2s ×3 interval |
| Enemy death | `NS_Disintegrate`: partikel naik dari bawah + dissolve material (param animate via timeline); energy orb spawn sudah C++ (`EnergyOrbClass`); loot: item mesh + physics impulse bounce |
| Shield break | `NS_ShieldShatter`: fragment glass mesh burst + partikel elemen shield + enemy stagger (montage `EHitReaction::Stagger` sudah C++) |
