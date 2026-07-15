# StickmanImpact — Narrative Design

The systems side of story (dialogue, cutscenes, quests, flags, choices, consequences,
banter, echoes) is code. What makes it a *memorable experience* is how it's authored.
This is the authoring contract.

## Multi-perspective structure

Five layers, each mapped to a system that already exists:

| Perspective | Delivery | System |
|---|---|---|
| Main story (player arc) | Quests + cutscenes + dialogue | UQuestManager / CutsceneManager / UDialogueManager |
| Side stories (other characters) | Playable flashback = a quest with a forced party of one + a story flag scope | UQuestManager + UPartyManager |
| Enemy perspective | Villain-motivation cutscene at arc midpoints — never at the end, sympathy needs time to sit | CutsceneManager |
| NPC lore | Context dialogue variants + clue sets | FNPCDialogueVariant / AClueActor |
| Environmental history | Ghost echoes, lore tablets, ruins | AGhostEchoActor / ADiscoverySite (Deep layer) |

**Connection rule**: every side layer must reference the main story at least once, and the
main story must reference at least one thing the player *may* have found in a side layer
(gate the line on the flag; the story works without it, resonates with it). That is what
"layers that connect" means in practice — flags, not lore bibles.

## Choice & consequence

All choice state lives in `UConsequenceTrackerSubsystem`. Authoring rules:

- **Three major branches** minimum for the main arc: branch = one recorded choice
  (`RecordChoice("MainArc_Act2", ...)`) that later acts check via `GetChosenOption`.
  Branches reconverge on *events* but not on *relationships* — same finale location,
  different allies standing next to you.
- **Permanent NPC death**: `MarkNPCDead` is a one-way door. Every killable-by-story NPC
  needs: a death variant for each NPC that knew them (context dialogue), a quest-line
  fallback (their quests transfer or fail visibly — never silently vanish), and one world
  change (their stall closes, a grave appears).
- **Faction alignment**: raising one faction should usually cost its rival
  (`AddFactionAlignment(A, +10)` + `AddFactionAlignment(B, -5)` at the same call site).
  Standing bands gate quest lines; never gate main-story progress on Allied — factions
  color the path, they don't block it.
- **Butterfly effect**: `FDeferredConsequence` rules fire a flag hours later. The craft
  rule: the player must be able to trace it back ("the merchant you stiffed in Act 1
  won't sell you the map in Act 3") — delayed, not random. One untraceable consequence
  reads as a bug, not depth.
- **Reputation impact**: dialogue choices that insult/honor a region call
  `UReputationSubsystem::AddReputation` — small amounts; reputation is earned by deeds,
  choices only nudge.

## Character-driven writing

Per playable character, before writing any quest: backstory in one paragraph, a
*relatable* motivation (a debt, a sibling, a promise — not "save the world"), one flaw
that costs them something on-screen, one growth beat per act, and a defined relationship
to every other party member (banter mines these).

- **Banter** (`UPartyBanterComponent`): 60/25/15 split — 60% flavor (region, weather),
  25% relationship (two-character dynamics, gate on both in party via paired lines),
  15% arc-reactive (gated on story flags). Bond-gated lines (`MinBondLevel`) are where
  characters admit things — bond 7+ lines should recontextualize earlier flavor lines.
- **Bond quests**: unlock via `UCharacterBondSubsystem::OnBondUnlock` (Lv1 story quest);
  each reveals backstory in thirds, never all at once.

## Emotional pacing

Beat budget per act: 1 quiet (campfire/stargazing scene = a dialogue sequence with
`bPauseGameDuringDialogue` and no stakes), 1 comedic (timing: directly *after* a tense
beat, never during), 1 loss or setback (earned: the thing lost must have been playable/
usable, not mentioned), 1 rally/inspiring beat (before the act boss). Shock twists need
two foreshadow plants minimum — one in a side layer is ideal (rewards the curious,
fair to everyone).

Rhythm rule: never two hype beats back-to-back; the quiet scene is what makes the finale
loud.

## Delivery variety

Already-built channels and when to use them:

- **Cutscene**: act boundaries + the 4 emotional beats. Nothing else — scarcity keeps weight.
- **Dialogue**: default. Choices only where `RecordChoice` will actually be read later.
- **Playable sequence**: revelations (walk through the burned village; control > watching).
- **Vision/dream**: `AGhostEchoActor` with the player as the "figure" location — surreal
  framing via `OnEchoStarted` post-process hook.
- **Items**: letters/diaries = `AClueActor` singles (no set); wanted posters foreshadow bounties.
- **Ghost echoes**: history the living can't tell. Best placed at Deep-layer discovery sites.
- **Song/bard**: a bard NPC whose `FNPCDialogueVariant` lines are verses; new verses unlock
  by story flag — lore through music without an audio-sync system.

## Scope honesty

No dedicated systems were added for: playable-flashback scaffolding (it's a quest +
party-of-one convention), crime-scene investigation (it's a clue set), or branching
cinematic trees (branches are flags read by linear cutscenes). If a future arc needs a
true branching cutscene graph, that's a CutsceneManager rework — flagged now, not
half-built.
