# Discovery System — Level Design Guidelines

The C++ side (`UDiscoveryManager`, `ADiscoverySite`, `AClueActor`,
`UDetectiveModeComponent`) tracks, gates, highlights, and rewards secrets. What makes
discovery *feel* good is placement. These are the rules for placing it.

## The five layers

Tag every `ADiscoverySite` with its `EDiscoveryLayer`. The layer is a promise about how
hard it was to find, and the `EDiscoveryTier` reward must match:

| Layer | What qualifies | Expected tier |
|---|---|---|
| Surface | Visible landmark, waypoint, roadside chest | Tier 1 |
| Hidden | Behind a waterfall, breakable wall, puzzle room | Tier 2-3 |
| Deep | Lore tablet chain end, ghost NPC, hidden boss arena | Tier 3-4 |
| TimeLocked | Night-only ruins glow, rain-only puddle reflection path | Tier 3-4 |
| AbilityGated | Ice wall (Pyro), thorn wall (burn), crystallized bridge | Tier 2-5 |

Rule of thumb per region: ~60% Surface, ~25% Hidden, ~10% Deep, ~5% Time/Ability locked.
If a player wanders for 90 seconds and finds nothing, density is too low.

- **Never put Tier 4-5 rewards on Surface sites** — it teaches players that looking harder
  doesn't pay.
- Time-locked sites: place a *daytime hint* (scorch marks, empty pedestal) so returning at
  night is a plan, not luck. `bOnlyAtNight` / `bRequireWeather` on the site handle the gate.
- Ability-gated sites: `bStartSealed` + `RequiredElement`, and the gate prop (ice wall,
  thorns) calls `NotifyElementApplied` when the matching element hits it. The existing
  elemental environment interactions (melt/burn/crystallize) are the keys — don't invent
  new ones per site.

## Designed "a-ha" moments (clue sets)

A clue set is 3-5 `AClueActor`s sharing a `ClueSetID` + the same `UnlockedQuest` asset.
The design contract:

1. **Clue 1 is impossible to miss** — on the main path, `bDetectiveModeOnly = false`.
   It exists to teach that this thread exists.
2. **Middle clues need one deliberate act each** — a detective pulse, reading a note,
   following footprints. Each clue's `ClueText` must point *toward* the next one
   ("the tracks lead toward the river"), never just be flavor.
3. **The last clue is where the answer is obvious in hindsight** — the quest unlocking at
   that instant (automatic via `UDiscoveryManager::RecordClue`) is the a-ha payoff.
   The unlocked quest's first objective should be within sight of the final clue.

Detective mode reveals and outlines clues (stencil 1) and unsealed sites (stencil 2). The
outline itself is a standard custom-depth post-process material: `SceneTexture:CustomDepth`
+ `CustomStencil`, one material in the global PostProcessVolume, stencil 1 tinted cyan,
stencil 2 gold. Keep pulses meaningful: if every third rock is highlighted, nothing is.

## Vertical exploration

All level content on existing mechanics — no new code:

- **Underground**: cave entrances are Hidden-layer sites; light shafts guide toward exits.
  One cave network per region minimum, with a vertical shortcut (climbable wall or updraft)
  back to the surface so exit ≠ backtrack.
- **Sky islands**: reachable via Anemo updraft (wind-current interaction) + glide. Place the
  updraft source visibly below the island — the route should be readable from the ground.
- **Multi-level structures**: bottom = Surface site, middle = Hidden, rooftop = Deep. Reward
  climbing stamina spent with sightlines to 2-3 *other* secrets from the top.
- **Underwater ruins**: out of scope until a breath/swim-depth mechanic exists. Do not fake
  it with walkable "underwater" rooms — it reads as broken, not mysterious.

## Reward preview / remaining counts

`GetSecretsRemaining(Area)` powers "There are N secrets remaining in this area" — surface it
on the map screen per region, not as a live HUD counter (a live counter turns exploration
into checklist-clearing). `GetAreaDiscoveryPercent` is the "Area Discovery: 45%" map stat.

## Community features — scope

Implemented: the **Traveler's Journal** (`UDiscoveryManager::GetJournal()` — auto-recorded
entries with area, layer, tier, location, in-game hour; feed it to a UMG list).

Out of scope (all require an online backend this project doesn't have): photo-mode geotags,
Dark-Souls-style player messages, discovery leaderboards, shared map markers. If/when a
backend exists, the journal entry struct (`FDiscoveryJournalEntry`) is already the payload
you'd upload — location + layer + tier is enough for all four features.
