# Bestiary — Enemy Roster Authoring

The 50+ enemy roster is **data**, not 50 hand-written C++ classes. Each entry is a
`FEnemyArchetype` DataTable row; `UEnemyFactory::SpawnArchetype(ID, transform, level)` builds
and configures a base `AStickmanEnemyCharacter` (or a native subclass for bosses) from it.
This doc is the catalog + the per-row authoring recipe.

## Row schema (`FEnemyArchetype`)

`ArchetypeID`, `DisplayName`, `Faction`, `Element`, `BaseStats`, `Personality`,
`WeightedAttacks`, `Abilities`, `ElementResistances` (weakness = >1, resist = <1, immune = 0),
`OptimalCombatDistance`, `bIsLeader`, `MechanicComponentClass` (the signature mechanic),
`MechanicDescription`, `RecommendedLevelMin/Max`, `LootTable` (weighted `FEnemyLootEntry`).

## Signature mechanics

Common mechanics are **reusable components** dropped on via `MechanicComponentClass`:

- `UEnrageComponent` — buffs speed + attack below an HP% (Berserker, Champion, Thorn Boar).
- `USummonerComponent` — periodic minion waves from archetype IDs (Shaman, Chieftain,
  Corruptor, Abyss Weaver).
- More ship as needed following the same one-file pattern; bespoke one-offs are BP
  components on the same hook. The factory attaches whatever class the row names — no
  factory edit per enemy.

Mechanics that are just **stat/data shapes** need no component at all — a "tank" is high
DEF + slow; a "swarm" is low HP + high count in the spawn pool; "elemental shield" reuses
the boss weak-point shield; "resistant to element X" is an `ElementResistances` entry.

## The roster (author these rows)

### Hilichurl Tribe
Fighter (+shield var), Berserker (`Enrage`), Shooter (Pyro/Cryo/Electro bolt variants =
3 rows differing only by `Element`+ability), Grenadier (throws Pyro slime = summon of a
1-HP explosive archetype), Shaman (`Summoner` + heal ability), Champion (dual-axe elite,
charge attack), Chieftain (mini-boss = `AStickmanBossCharacter` + `Summoner` + war-cry buff).

### Abyss Order
Mage (teleport ability + elemental shield weak-point), Herald (fast melee + corrosion debuff
ability), Lector (ranged + energy-drain ability), Knight (heavy + unblockable grab = red
telegraph), Weaver (`Summoner` of spider mines + root ability), Corruptor (`Summoner` +
faction-convert ability).

### Elemental Entities (7 elements × 3 tiers)
Per element a small/flying/tank trio, e.g. Pyro: Flame Spirit / Ember Bat / Inferno Golem.
All share `Element` + own-element resist; tiers differ by `BaseStats` +
`OptimalCombatDistance` + one signature ability. Titans/Colossi/Behemoth/Dragon tier =
`AStickmanBossCharacter` rows.

### Humanoid
Treasure Hoarder (basic / Marksman / Bruiser), Fatui (Skirmisher / Agent stealth-backstab /
Pyroslinger / Cryogunner / Electrohammer). Formation tactics = `bIsLeader` + the group-AI
attack-token system already in place.

### Wildlife
Shadow Wolf (`bIsLeader` howl buff, pack), Thorn Boar (`Enrage` charge + bleed),
Venom Basilisk (petrify cone ability), Storm Eagle (aerial knockback), Magma Turtle (defensive
+ fire trail terrain zone), Phantom Stag (teleport + moonlight heal), Void Serpent (burrow
ambush = despawn/reposition ability).

### Special
Mimic (chest actor that spawns the enemy on open), Doppelganger (copies the active
character — spawns a mirror of the player's current archetype), Time Wraith (local time
dilation via the Chrono system's per-actor dilation), Gravity Revenant (gravity-zone
volume), Mirror Knight (reflect = boss projectile-reflect hook, back-only weak point),
Soul Eater (energy-drain + grows via `Enrage`-style buff on drain), Death Mark Assassin
(targets one character, ignores others — a blackboard target lock).

## Journal

`UBestiarySubsystem` records first sightings + kill counts; the journal reveals
weakness/loot after `KillsToRevealWeakness` kills, and `GetSpeciesCatalogued` feeds a
"catalogued N species" completion/achievement. Kill counts also drive material-farm
milestones. Save hooks exist; not yet in the binary save format.
