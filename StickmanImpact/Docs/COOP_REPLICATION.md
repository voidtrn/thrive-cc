# Co-op — What Exists vs. What Real Networking Requires

Honest state: StickmanImpact was built single-player-first. The `Coop/` module adds the
pieces that are *correct in both solo and networked play* (session state, revive,
ping, HP scaling), but a real 2-player session needs the refactor below. Nothing in this
doc is started-and-abandoned code — it's the checklist for the day co-op becomes a
priority.

## What works today

- `UCoopSessionSubsystem` — Solo/Hosting/Joined state machine, direct-IP listen-server
  travel (`?listen` reopen + `ClientTravel`), `GetEnemyHPScale()` (+50%/extra player,
  already multiplied into `AEnemySpawner` spawns), player-count delegates. No online
  subsystem: LAN/direct IP only, no matchmaking/invites/NAT traversal.
- `UReviveComponent` — downed state, bleed-out, ally hold-to-revive (faster than the
  optional solo second wind), health restore through the AttributeSet. Solo-correct now;
  co-op-correct after the RPC pass.
- `UPingComponent` — camera-trace ping with auto-classification (enemy/item/location) +
  danger ping, marker VFX/sound, `OnPingIssued` for HUD/minimap. Local-only until
  multicast.

## The refactor checklist (in dependency order)

1. **Authority model.** Host = server, authoritative for combat/world; guest progression
   (EXP, bonds, items) stays in the guest's own GameInstance and travels home. Decided,
   just not enforced anywhere yet.
2. **Damage funnel to the server.** `UStickmanGameplayAbility::ApplyDamageToTarget` runs
   wherever the ability activates. Under networking every damage-adjacent subsystem call
   inside it (reactions, combo meter, juice, adaptive difficulty) must run server-side and
   fan results out. GAS does the heavy lifting *if* abilities activate server-authoritative:
   set ASC `ReplicationMode` (Mixed for players, Minimal for AI), ensure
   `NetExecutionPolicy = ServerInitiated` or local-predicted per ability.
3. **Subsystem state audit.** GameInstance subsystems exist per-machine and DO NOT
   replicate. Split each into: server-truth (aura/reaction state, enemy juggle — move to
   replicated actor components or the GameState), per-player (combo meter, mastery — fine
   as-is, keyed per controller), and cosmetic (juice, damage numbers — fine as-is, driven
   by replicated events).
4. **RPC pass on the new co-op pieces.** `bDowned` → `ReplicatedUsing`; `StartRevive`/
   `CancelRevive` → server RPCs validating range; ping → server RPC + NetMulticast.
5. **Movement/locomotion.** CharacterMovement replicates natively, but the custom
   locomotion (wall run, slide, vault, wave dash) mutates movement properties directly —
   each needs a replicated state flag + simulated-proxy handling, or guests will glitch.
6. **World systems.** Weather/day-night/world events: host simulates, guests receive
   (seed or state replication via GameState). Save/load stays host-only.

## Co-op design layered on top (content, once the above lands)

- **Team reactions**: two players applying elements within a window = amplified reaction —
  a server-side check in the reaction manager (it already sees both applications; add an
  instigator comparison + multiplier).
- **Synergy attacks / combo link**: proximity + timing window checks server-side,
  buff via the existing tag-combo bonus pattern in the combo meter.
- **Shared energy regen aura**: proximity check on the server, energy delta through the
  AttributeSet like every other regen.
- **Co-op puzzles**: `AStickmanPressurePlate` already exists — two-plate doors are level
  wiring; elemental combination puzzles reuse `NotifyElementApplied` gates from the
  discovery system. Solo fallback: puzzles that require two agents get an
  "AI companion" — out of scope until a companion AI exists; design puzzles with a slower
  solo path instead (timed plate → sprint) so no content hard-requires co-op.
- **No tether**: nothing to build — World Partition streams around each player on the
  server; just don't add a tether.
