# The Plot Spine — Cricket Underworld

**Author:** game-designer · **Date:** 2026-08-01
**Brief:** Founder verdict — "the main plotpoint of underworld is missing." The game has a rich
systems layer (5-faction Power Web, alignment spectrum, police case pipeline, bribes, debt/heat)
but zero narrative spine. This doc wraps DRAMA around that existing state. **No new mechanics.**
Every beat below names the exact existing variable/function that fires it.

Verified against code before writing (not assumed): `GS` defaults (`coins:2000, gems:50,
blackMoney:30, debts:[]`), `LEAGUE_NAMES` (4 tiers: gully → sma → challenger → champions),
`syndicateTier()` thresholds, `CASE_STAGES`, `INSPECTORS`, `NETA_CANDIDATES`, `BHAI_*`,
`SYNDICATE_DON`/`SYNDICATE_LIEUTENANTS`, `RIVALS`, and the live rival verbs `bribeRivalToThrow()`,
`exposeRival()`, `proposeCollusion()`. `TUT_STEPS` (6 steps, `prototype/index.html:9758`) is
confirmed to be the entirety of current narrative content.

---

## 1. The Premise

You didn't build this club — you **inherited** it. A relative, a debt, a stroke of bad luck at
cards: however it happened, the ledger came to you with money already in it that isn't clean, and
a name already known to people you've never met. You are a small-time team manager in the Gully
Cricket League with a real cricket problem (win matches, build a squad, climb four tiers to the
Champions League) sitting on top of a criminal one (the club owes, the club is watched, the club
is *known*). The fantasy is not "become a crime boss" — it's **the slow-motion choice of what kind
of owner you become while everyone who matters is watching**: the Don who wants an heir, the
inspector who wants a case, the local don who wants respect, the politician who wants a favour,
the rival who wants a partner in the dirt. Every match you win makes you more visible to all five
of them at once. Underworld is not a menu screen. It's the weather.

## 2. The Inciting Incident — "The Ledger Isn't Clean"

**The trigger:** new-game state, read-only. `GS.blackMoney` starts at **30** and `GS.debts` starts
empty — today that's just an unexplained starting balance with zero story attached. Reframe it:
**that 30 black money is not yours. It's what's left of an arrangement the previous owner made
with the Syndicate to keep the club alive.** You inherited the club and, without doing anything
yet, you inherited a name in Anna Seth's book.

**The beat:** fires once, at the close of the player's first auction (`prototype/index.html`
tutorial flow already gates onto squad-build completion) — before the first ball is bowled. A
one-time card, styled like the existing Grey Zone offer card, delivered by **Rukhsana "Ruby"
Mirza** (the Fixer lieutenant, already a named character — `SYNDICATE_LIEUTENANTS[0]`), not Anna
Seth himself (he doesn't do first meetings):

> *"Relax. Nobody's collecting today. Anna Seth just wants you to know he remembers [previous
> owner]'s arrangement — and that the club's books are already 30 black money `deep`. He's not
> your enemy. He's patient. That's worse."*

This is the single most important design move in this doc: **the player never chose corruption —
they were born into it, before the first bid.** That answers "why can't I just stay clean" without
inventing a forced-choice mechanic. The debt already exists in the numbers; the story just names
it. The player's very first decision in the game — accept Ruby's card (acknowledge, no cost) or
dismiss it (same, no cost) — is symbolic, not mechanical. The REAL first compromise still happens
exactly where it does today (first Grey Zone offer with a coin/B$ cost) — but now it lands as the
second beat of a story, not the first thing a stranger asks of you.

## 3. The Protagonist Arc

The player doesn't want an empire for its own sake — the systems already reward empire-building
(coins, tiers, cards). What the **story** wants, layered on top, is narrower and more personal:
**make the club yours.** Prove — to Anna Seth, to the inspectors, to the street, to your own
scoreboard — that the name on the trophy is the player's, not a line item in someone else's
ledger. That want stays constant across all four acts; what changes is what "yours" comes to mean,
and that's exactly where the alignment score does the talking (Section 7). A high-alignment player
ends up meaning "clean of the debt." A low-alignment player ends up meaning "owner of the debt."
Either way, by the Champions League the club is unmistakably theirs — the question the whole game
asks is *what did it cost*.

## 4. Chapter Structure — Four Acts, Four Tiers

| Act | Tier (`GS.league`) | Trigger to open the act | Emotional register |
|---|---|---|---|
| I — **The Debt** | `gully` (Gully Cricket) | New game / end of first auction (Section 2) | Survival. Small, personal, nobody famous is watching yet. |
| II — **The Web** | `sma` (SMA League) | First promotion: `GS.league` flips `gully → sma` | Entanglement. Names start recurring; favours start compounding. |
| III — **The Ledger** | `challenger` (IPL Challenger) | Promotion: `GS.league` flips `sma → challenger` | Exposure. It's public now — rivals, press-equivalent, case pipeline all sharpen. |
| IV — **The Reckoning** | `champions` (Champions League) | Promotion: `GS.league` flips `challenger → champions` | Consequence. The alignment score stops being a stat and becomes an ending. |

### Act I — The Debt (Gully Cricket)
- **Opening beat:** the inciting incident (Section 2).
- **Beat — first faction contact:** Sikandar Bhai's hafta demand, which already fires today
  (`f.bhai.haftaDue <= 0` → `'hafta'` event, `prototype/index.html:5683`). Reframed as your first
  face-to-face with a man who runs the ground you play on and doesn't care that you're new — the
  club's reputation, not yours, is what buys you in.
- **Beat — first Thana brush:** the first time `GS.evidence` gets a push from any source (mafia
  offer, rival bribe) — no case opens yet, this is just Ruby or the tutorial-style copy noting
  *"someone is keeping a file."* Purely narrative; the mechanical case pipeline (`CASE_STAGES`)
  doesn't need to fire yet.
- **Stakes:** whether this specific club survives Gully Cricket at all. Nobody outside your own
  four walls (Anna Seth, Ruby, Sikandar Bhai) knows your name yet.

### Act II — The Web (SMA League)
- **Opening beat:** promotion card on `gully → sma`. Anna Seth speaks for the first time in his
  own voice (previously only Ruby/Teja) — a short line congratulating the promotion and noting the
  club is "worth watching more closely now." Uses `syndicateTier(rel)` — if `rel` is still `Known`
  (`-20..20`, the default band), his tone is measuring, not warm.
- **Beat — election intro:** first Neta election cycle (`NETA_CANDIDATES`, fires per the existing
  ~8-match cycle). First time the player is asked to back **Bhupathi Rao** (Vikas Morcha) or
  **Savitri Devi** (Jan Shakti Party) — or stay out. This is the first faction that asks for a
  *public* commitment, not a private payment.
- **Beat — rival probes:** the first live use of the existing rival verbs
  (`bribeRivalToThrow`/`proposeCollusion`) against **Rajan Mehra** ("the shark" — `alignment:-58`,
  `trait: doubles down when cornered`). Framed as Mehra testing whether you're a mark or a
  potential partner.
- **Stakes:** reputation inside the league. Other owners (rivals) start reacting to your alignment
  — purist rivals like **Arvind Patil** (`alignment:65`) get colder if `GS.alignment` drops; sharks
  like Mehra get friendlier.

### Act III — The Ledger (IPL Challenger)
- **Opening beat:** promotion card on `sma → challenger`. This is where the Thana pipeline should
  start meaning something if heat has accumulated — first real progression through `CASE_STAGES`
  (`'FIR Filed' → 'Evidence' → 'Chargesheet' → 'Court Date'`), narrated with whichever inspector
  `pickInspector()` assigned: **Inspector Khurana** (greedy, bribable-cheap), **ACP Vaidehi Menon**
  (ambitious, bribable-expensive, may double-cross), or **DSP Arjun Sherawat** (incorruptible —
  court only).
- **Beat — Mehra's offer:** if the player's Syndicate `rel` and alignment have been trending low,
  Rajan Mehra proposes going further than a one-off throw — the story names this "a working
  arrangement" (mechanically: repeated use of the same live collusion/throw verbs, no new state).
  If alignment is trending high, Mehra instead escalates as a genuine rival threat (uses
  `exposeRival`-adjacent pressure narratively — "he knows about you too").
- **Beat — Neta demand intensifies:** one of `NETA_DEMANDS` — most dramatically `throwmatch`
  ("Lose in the Constituency") — reframed as the moment political pressure and match integrity
  collide in public view for the first time.
- **Stakes:** this is no longer a private matter between the player and Anna Seth. Case stage,
  election outcome, and rival standing are now all visible in the Power Web hub at once — the
  player *feels* watched from every faction simultaneously, which is the underworld fantasy the
  founder is asking for.

### Act IV — The Reckoning (Champions League)
- **Opening beat:** promotion card on `challenger → champions`. This is where the four-faction
  pressure resolves into the climax (Section 6). Season 4 feels different from Season 1 because
  every faction head now has a *memory* of the player — Anna Seth isn't meeting a stranger, Sikandar
  Bhai isn't testing a rookie, Sherawat isn't opening a cold file. The same UI patterns (offer
  cards, faction rows) carry three tiers of accumulated relationship instead of a blank slate.
- **Stakes:** the club's final identity. Everything converges into one choice.

## 5. Character Throughlines

Each of these already exists as data in code (`INSPECTORS`, `SYNDICATE_DON`,
`SYNDICATE_LIEUTENANTS`, `BHAI_NAME`, `RIVALS`). None of them need new fields — their "arc" is
existing relationship state re-read at each act boundary and given a line of dialogue, not a new
tracked variable.

- **Anna Seth (the Don).** Act I: a name in a ledger, spoken through Ruby. Act II: speaks for
  himself for the first time, measuring. Act III: if `syndicateTier(rel)` has climbed to
  `Associate`/`Made Man`, he starts talking succession — testing whether the player wants the
  chair one day. If it's fallen to `On Notice`/`Marked`, Teja (the Enforcer) starts showing up
  instead of Ruby — the softness is gone. Act IV: the throne is either handed over (low-alignment
  path) or exposed (high-alignment path) — see Section 6. Anna Seth is the only character whose
  *tone*, not just his offers, is gated by the existing `rel` thresholds (60/20/-20/-60).
- **DSP Arjun Sherawat (the Incorruptible).** The clean-path deuteragonist. Act I: doesn't appear —
  too small a fish. Act II: a background mention if any evidence exists (`GS.evidence.length > 0`)
  — "there's a new officer transferred in, and she doesn't take calls." Act III: if a case
  reaches `Court Date` on his watch (`getInspector(name).trait === 'incorruptible'`), he becomes
  personal — the one figure in the game who cannot be bribed, only out-played or joined. Act IV: he
  is the partner in the clean-path climax — the person the player brings the evidence to.
  (Khurana and Menon stay transactional side-characters throughout — that asymmetry is
  intentional: two inspectors are obstacles, one is a conscience.)
- **Sikandar Bhai (the Bhai).** Arc is about respect, not money — read straight off `f.bhai.rel`.
  Act I: tests the player like any new tenant. Act II: at `rel >= 40` ("Crowd is yours" state,
  already in code at `prototype/index.html:5848`) he becomes a public backer — his crew (Munna
  Tawde, Kaali Prasad) start getting name-checked as the player's own muscle. At `rel <= -30`
  ("Crowd hostile", also already in code) he's an open enemy inside the player's own ground — the
  worst kind. Act III: tested again — does the player still make time for the street level now
  that city-wide factions (Neta, Syndicate) are pulling attention upward? Act IV: in the clean
  climax he's the one who can shut a hostile crowd down for the player one last time; in the
  corrupt climax he's the first ally who has to be told the club is bigger than the neighbourhood
  now — a small, human loss inside the bigger win.
- **Rajan Mehra (the rival, dark mirror).** The only rival built for this role — `alignment:-58`,
  `personality:'shark'`, `trait: doubles down when cornered`. He is what the player becomes if they
  take every corrupt option available. Act I: just another name on the ladder. Act II: first
  contact via the *existing* live rival verbs (bribe-to-throw / propose collusion) — same UI, but
  narrated as Mehra sizing the player up as a potential partner, not a random opponent. Act III: he
  escalates in lockstep with the Syndicate `rel` and `GS.alignment` — if the player is trending
  corrupt, he pushes for a standing arrangement; if the player is trending clean, he turns hostile,
  because a clean rival threatens his own arrangement. Act IV: in the corrupt-path climax he is the
  other claimant to Anna Seth's chair — succession is a fight, not a gift, if Mehra's own
  Syndicate `rel` has also been rising. In the clean-path climax he's the loudest voice trying to
  discredit the player's evidence before it lands. (**Arvind Patil**, the purist rival
  `alignment:65`, is the quiet foil on the other side — no built arc needed, just occasional
  reactive flavour text keyed off `GS.alignment`, e.g. warmer at high alignment, colder at low.)

## 6. The Climax — "Whose Name Is On the Club"

**Trigger:** the promotion event `challenger → champions` (`GS.league` flips to `'champions'`) —
the single moment every act has been built to reach. At that exact moment, read `GS.alignment`
(existing -100..100 spectrum, no new tracking) and branch:

| `GS.alignment` at trigger | Path | The choice card |
|---|---|---|
| **≥ +40** | **Clean — "Burn the Ledger"** | DSP Sherawat and Ruby's world collide: the player is offered the chance to hand over everything they've accumulated — evidence pushed to `GS.evidence` across the whole run, plus their own clean record — and walk the club out from under Anna Seth's book for good. Costs: the Syndicate relationship (whatever `rel` currently is) is forfeited instantly; if `rel` was still positive, this is a real sacrifice, not a freebie. |
| **≤ -40** | **Corrupt — "Take the Chair"** | Anna Seth, now speaking as an old man tired of the business, offers the player his chair outright — the club stops being a debtor to the Syndicate and becomes its new head. If Rajan Mehra's own standing has also risen, this is contested — a succession beat, not a coronation. Costs: the club's public name (any residual goodwill with purist rivals/clean sponsors) is spent. |
| **-40 to +40 (undecided)** | **The Last Chance — "Pick, Now"** | Neither faction fully trusts a fence-sitter. Both Ruby and Sherawat send word the same week — the story's way of saying the spectrum has to resolve *now*, using the exact same mechanical levers the player has had the whole game (pay down debt / cut ties vs. take one more offer / go all-in). No new UI: this is just the existing offer-card pattern firing twice in the same beat instead of once. |

The climax does not require a new ending screen, new state, or new tracking variable — it requires
reading `GS.alignment` and `f.syndicate.rel` (and optionally `rival.alignment` for Mehra) at one
specific, already-existing promotion event and routing to one of three existing card/copy sets.

## 7. The Alignment-Branched Telling

The player never sees a "story menu" — the same beats read differently because the same existing
state (`GS.alignment`, faction `rel`) is checked at render time and swaps flavour text only.
Examples, all reusing state that already exists:

- **Sikandar Bhai's hafta demand (Act I–III, same trigger every time):** at high alignment, his
  copy leans resentful — *"Clean money's slower money. Pay up anyway."* At low alignment, it leans
  familiar — *"You're one of mine now. Pay up, like family does."* Same cost, same button, two
  copy blocks gated on `GS.alignment > 0`.
- **The Thana case stages (Act II–III, same `CASE_STAGES` progression):** at high alignment, the
  framing is "a clean man caught in one moment of weakness" — the inspector is almost apologetic.
  At low alignment, it's "one more name on a long list" — routine, businesslike. Two copy sets per
  stage, gated the same way.
- **Anna Seth's promotion-line dialogue (Act II–IV, same `syndicateTier(rel)` read):** already
  partially copy-differentiated in code (`syndicateTier()` descriptions per band) — this doc simply
  extends that existing pattern to the four act-open beats instead of inventing a parallel system.
- **Rival reactions (Arvind Patil vs Rajan Mehra, same act triggers):** Patil's flavour text warms
  as `GS.alignment` rises, Mehra's warms as it falls — a single shared read of one existing number,
  routed to two already-existing named rivals.

No new tracking is introduced anywhere in this section — every branch is a read of `GS.alignment`
or an existing faction `rel` value at a moment the game already renders something.

## 8. Thin-Build Feasibility Note

| Build surface | What it touches | Test/selector risk | #124 light-default risk | Size |
|---|---|---|---|---|
| **(a) New-game inciting-incident intro** (Section 2) | Extend `TUT_STEPS` (`prototype/index.html:9758`) with one additional step, OR fire a one-time card using the existing Grey-Zone/offer-card component after squad-build completes. | **Prefer extending `TUT_STEPS`** — reuses tested `#tut-icon`/`#tut-title`/`#tut-body` selectors and the existing skip/next flow; appending a step only changes `TUT_STEPS.length`, which any test asserting exact step count would need re-checking (verify before shipping). A standalone new overlay is higher risk — new selectors, new component to theme-check. | Low if extending `TUT_STEPS` (inherits the already-#124-compliant tutorial overlay CSS). Higher if a new overlay component is built from scratch — must explicitly verify light-mode default. | **S** |
| **(b) Chapter beat-cards at tier transitions** (Section 4) | Hook into the existing promotion-detection path (the code that already swaps `LEAGUE_NAMES` label / fires promotion UI) to insert one dismissible, non-blocking card per `gully→sma→challenger→champions` transition, using the existing offer-card / `resolveUwCard`-style component. | Must not alter or gate the existing promotion flow itself — insert additively, never blocking. If Playwright has promotion-flow assertions, re-run them after wiring. Four cards × alignment-branch copy (Section 7) is more copy than logic. | Low — reuses an existing themed card component; just needs a copy-content review per card. | **M** |
| **(c) Story-driven tutorial rewrite** | Rewrite the `body` strings of the existing 6 `TUT_STEPS` entries (`prototype/index.html:9758-9783`) to foreshadow the inheritance hook from step 1, and to name Anna Seth/Ruby/Sikandar Bhai explicitly in step 5 instead of generic "the mafia." | Pure innerHTML string edits — same selectors (`#tut-body` etc.), same step count, same buttons. Verify no test asserts exact copy text (unlikely but check) before shipping. | None — no structural or CSS change. | **S** |

**Overall:** all three surfaces are additive copy/wiring on top of components and state that
already exist and already pass the light/dark and test-selector bars. The one item flagged for
founder/build-time verification before implementation: confirm no Playwright test hard-asserts
`TUT_STEPS.length === 6` or exact tutorial body text, since (a) and (c) both touch that array.

---

## Appendix — Named Cast Used (no new characters invented)

| Character | Existing source | Role in spine |
|---|---|---|
| Anna Seth | `SYNDICATE_DON` | The Don — patron/threat, succession offer |
| Rukhsana "Ruby" Mirza | `SYNDICATE_LIEUTENANTS[0]` | First contact, inciting incident messenger |
| Balwant "Teja" Teja | `SYNDICATE_LIEUTENANTS[1]` | Enforcer — appears when `rel` drops |
| Sikandar Bhai | `BHAI_NAME` | Area don — respect arc, hafta, crowd |
| Munna Tawde, Kaali Prasad | `BHAI_CREW` | Bhai's crew — named muscle in Act IV |
| Inspector Khurana | `INSPECTORS[0]` (greedy) | Transactional Thana obstacle |
| ACP Vaidehi Menon | `INSPECTORS[1]` (ambitious) | Transactional Thana obstacle, may double-cross |
| DSP Arjun Sherawat | `INSPECTORS[2]` (incorruptible) | Clean-path deuteragonist |
| Bhupathi Rao / Savitri Devi | `NETA_CANDIDATES` | Election-cycle public-commitment beat |
| Rajan Mehra | `RIVALS[0]` (shark) | Dark mirror rival, succession contest |
| Arvind Patil | `RIVALS[1]` (purist) | Clean-path foil, reactive only |

---

## Addendum (2026-08-02) — The Climax becomes a real choice, not a narrative payoff card

**Trigger for this addendum:** founder verdict — the shipped climax (`uwClimaxCard()`, commit `3915f76`) is pure prose behind a single "Dismiss" button. The three endings *describe* costs ("forfeits everything with the Syndicate," "costs the name over the door") that nothing in code actually applies. Upgrading it to a real choice-with-consequences, using the game's own established pattern instead of inventing new UI.

**The existing pattern being reused** (already live for hafta/election/rival-offer/neta-demand, `prototype/index.html` ~5680-5811 + ~8762-8811): an event object with `type`, real buttons rendered with stable `id`s, a `bindXxx(ev)` function wiring `.onclick` handlers that mutate `GS` state directly, then swap the card's own innerHTML to a resolution line so a choice can't be re-clicked. The climax needs the same *shape*, adapted to fire inside `endSeason()`'s season-complete render (not the post-match render) since that's where it already lives.

### Overview

Each of the three alignment-gated endings gets two buttons (three for the undecided middle) instead of one Dismiss. Clicking one applies real, permanent `GS` state changes and swaps the card to a resolution line. The card **blocks "Start Season N+1"** until resolved — justified below (Open Question 1).

### Player experience

The player reaches Champions League, sees the Season Complete screen as today, and the Reckoning card renders in the same visual slot — but now with two buttons instead of "Dismiss," and the "Start Season" button greyed out beneath it until they pick one. This is the one moment in the whole spine where the game stops and makes the player actually spend the identity they've been building for three acts, instead of just narrating it at them. It should feel like the heaviest single click in the game — which is also the argument for blocking (Open Question 1).

### Mechanics

**New state (one field, justified below in Open Question 3):** `GS.reckoningResolved` — boolean, default `false`. Add to the defaults object and `hydrateGS()`/`load()` alongside other persisted flags (same precedent as `GS.darkTheme`, `GS.loginStreak`). Set `true` the instant any climax button is clicked, in every branch, no exceptions.

**Guard at the call site.** In `endSeason()`, change the trigger condition from `else if (leagueOrder[idx]==='challenger' && GS.league==='champions') promoBeat = uwClimaxCard();` to also require `!GS.reckoningResolved`. Without this, a relegation from `champions` back to `challenger` followed by re-promotion re-fires the card — harmless when it was flavor text, a real farm exploit now (repeat "Take the Chair" for a repeated 500-blackMoney windfall + rel reset, or repeat "Burn the Ledger" for a repeated debt wipe). This guard is the single most important line in this addendum — do not ship the mechanical version without it.

**Blocking mechanic.** In the season-complete render, hide or disable `#season-continue-btn` while a climax card is showing AND `!GS.reckoningResolved`. Re-enable it the moment any climax button resolves (no artificial delay — matches the immediacy of every other `resolveUwCard`-style swap in the codebase).

#### Branch 1 — "Burn the Ledger" (`GS.alignment >= 40`)

| Button | id | State deltas | Resolution copy |
|---|---|---|---|
| **"Hand Over the Evidence"** (primary, `btn-gold`, green accent to match the branch's `--green-bright`) | `reckon-clean-accept-btn` | `GS.blackMoney = 0`; `GS.debts = []`; `f.syndicate.rel = -100`; `f.syndicate.betrayed = (f.syndicate.betrayed\|\|0)+1`; `applyAlignShift(20)`; `GS.heat = Math.max(0, GS.heat-15)`; `GS.reckoningResolved = true` | *"Done. Sherawat's people move fast — three seasons of paper, filed and signed in an afternoon. Anna Seth doesn't call. He doesn't need to; you already know what his silence means now. The ledger's gone. So is he."* |
| **"Not Yet"** (secondary, `btn-outline`) | `reckon-clean-decline-btn` | No blackMoney/debts change; `applyAlignShift(-8)`; `GS.reckoningResolved = true` | *"You don't hand it over. Ruby doesn't sound surprised. 'Smart. Keep it as insurance.' Sherawat doesn't call again — some doors only open once."* |

Why balanced: Accept is a real, large, permanent cost (100% of Syndicate relationship, gone for the rest of the run) for a real permanent gain (debt zeroed, heat drops, alignment locks toward the ceiling) — not a freebie. Decline isn't a safe no-op either — it costs 8 alignment (a real if smaller step back toward the corrupt end) for keeping optionality, so "just dismiss and keep both" is not on the table.

#### Branch 2 — "Take the Chair" (`GS.alignment <= -40`)

| Button | id | State deltas | Resolution copy |
|---|---|---|---|
| **"Take the Chair"** (primary, `btn-gold`, blood/red accent to match `--blood`) | `reckon-corrupt-accept-btn` | `f.syndicate.rel = 100`; `f.syndicate.favorsDone = (f.syndicate.favorsDone\|\|0)+1`; `GS.blackMoney += 500`; `GS.debts = []`; `applyAlignShift(-20)`; `GS.fanLoyalty = Math.max(0, GS.fanLoyalty-25)`; if `GS.rivalData['Rajan Mehra'] \|\| {}).rel >= 20` also `GS.heat = Math.min(100, GS.heat+10)` (the succession fight gets noticed); `GS.reckoningResolved = true` | Contested (mehraRel>=20): *"Mehra doesn't go quietly — word of the fight gets around, and for a week your name is in every mouth in the league for the wrong reason. But the chair is yours."* Uncontested: *"No one else in the room has the standing to argue. The chair is yours, and the debts on the books get rewritten as assets overnight."* |
| **"Walk Away"** (secondary, `btn-outline`) | `reckon-corrupt-decline-btn` | `applyAlignShift(6)`; `f.syndicate.rel = Math.max(-100, f.syndicate.rel-10)`; `GS.reckoningResolved = true` | *"You say no. ' + SYNDICATE_DON + ' doesn't raise his voice — he never does — but the offer, once refused, does not come back. Some doors only open once, from his side too."* |

Why balanced: Accept trades the club's public name (25 fan loyalty, a real ongoing-relationship cost) and a further alignment slide for a large one-time coin windfall + a maxed, but now terminal, Syndicate relationship — not a no-cost power grab. Refusing the single most corrupt offer in the game is the one moment a deeply corrupt run can claw back alignment, but Anna Seth punishes the refusal (-10 rel) so it isn't a free redemption button either.

#### Branch 3 — "Pick, Now" (`-40 < GS.alignment < 40`)

Per Section 6, this branch uses "the exact same mechanical levers the player has had the whole game" rather than granting either full decided-branch ending — the player is forcing a resolution, not retroactively having played three acts of one path.

| Button | id | State deltas | Resolution copy |
|---|---|---|---|
| **"Cut Ties — Go Clean"** | `reckon-pick-clean-btn` | `var pay = Math.min(GS.coins, 400); GS.coins -= pay;` (never a hard gate — deducts whatever is affordable, down to 0, so this button is always clickable, see Open Question 2); `GS.blackMoney = Math.max(0, GS.blackMoney-15)`; `applyAlignShift(25)`; `GS.reckoningResolved = true` | *"You pay down what you can and tell Ruby the rest waits. It isn't the clean break Sherawat offered the others — but it's a direction, finally, and everyone who's been watching notices which way you leaned."* |
| **"Go All In"** | `reckon-pick-corrupt-btn` | `GS.blackMoney += 200`; `f.syndicate.rel = Math.min(100, f.syndicate.rel+20)`; `applyAlignShift(-25)`; `GS.reckoningResolved = true` | *"You take the last offer on the table. Ruby doesn't smile, exactly, but she doesn't have to talk you into the next one either. That part's done now."* |

Why balanced: neither button reaches the ±40 threshold needed for the "real" decided endings on its own (a 25-point swing from mid-band, after `applyAlignShift`'s inertia damping, lands short of the ±40 gate at the extremes it's dampened against) — this branch resolves the fence-sitting into a lean, it doesn't retroactively hand out either full ending. "Cut Ties" costs real coins (or all remaining coins if poor) for a smaller debt paydown than the full "Burn the Ledger" wipe; "Go All In" grants a smaller windfall than "Take the Chair" for the same reason — this branch is deliberately the lesser version of both, matching the doc's own framing of it as indecision finally forced to resolve, not a stealth-third ending.

### Edge cases

- **Zero test coupling risk, verified:** grepped `tests/*.spec.js` for `uw-promo-beat`, `uwClimaxCard`, `endSeason`, `season-continue-btn` — zero matches. All existing `#match-result` test assertions target the single-match win/loss flow (`#match-continue-btn`), never the 14-match season-complete/`#season-continue-btn` path. This card and the button changes below it are entirely outside current suite coverage — safe to restructure freely, but a future test pass should probably add coverage for it now that it's stateful, not just decorative.
- **Never a soft-lock:** every branch has at least one always-free, always-clickable button (Decline/Walk-Away/Go-All-In cost nothing; "Cut Ties" deducts `min(coins,400)` rather than gating on a minimum) — a player with 0 coins and 0 black money can still resolve every branch and unblock "Start Season."
- **`GS.evidence` may be empty on a squeaky-clean run** (a player who never triggered a mafia/rival-bribe offer has nothing in the array) even though the "Burn the Ledger" copy says "three seasons of it, sitting untouched." Not gating the button on `GS.evidence.length` — matches the existing Act II pattern (`prototype/index.html`, the `GS.evidence.length > 0` check already degrades gracefully to generic phrasing elsewhere). Flavor text stays as-is; this is a narrative white lie the doc already accepts elsewhere, not a new problem.
- **Relegation out of Champions League after resolving:** once `GS.reckoningResolved` is true, the card never fires again regardless of future promotion/relegation cycling (see Guard above) — the player's ending stands for the rest of the run.

### Open questions (resolved here, flagging the reasoning)

1. **Should this block "Start Season N+1"?** — **Yes.** Every other promo beat in this doc is explicitly non-blocking (Section 8's whole feasibility case rested on "additive, never gates flow"), but the climax is different in kind: it's the one moment the doc calls "the payoff," and a payoff you can shrug past with Dismiss isn't a payoff. The cost is small and contained — zero test coupling (verified above), and every branch guarantees an always-free resolution path, so blocking can't soft-lock or break any existing assertion. If this is ever found to feel punitive in practice, the fix is a one-line revert (drop the button-disable, keep everything else) — flagging that low-risk reversibility rather than treating this as a permanent architectural commitment.
2. **Coin-gating "Cut Ties":** deliberately NOT a hard minimum (unlike hafta/election, which do hard-gate and `toast('Not enough coins')` on failure) — a hard gate here risks a genuine soft-lock at exactly the moment the game must not soft-lock. `Math.min(GS.coins, 400)` was chosen over a hard gate specifically for this reason; flag if a future balance pass wants stricter parity with the hafta/election pattern.
3. **Is `GS.reckoningResolved` an acceptable "new mechanic"** given the doc's Section 6 explicitly says "no new state/mechanics"? — Judged yes, on narrow grounds: it is not new *narrative* mechanics (no new factions, no new screens, no new currencies) — it is the minimum state needed to make a real choice a real choice (preventing the farm-exploit on relegation/re-promotion cycling, per Edge cases above). A stateless version of this addendum is not safely buildable. If a future pass wants zero new fields at any cost, the fallback is gating on `GS.league === 'champions' && <some existing high-water-mark field>` — none currently exists cleanly, so this was not pursued as the primary recommendation.

### Build handoff scope

One function edit (`uwClimaxCard()` → returns per-branch button configs, not just prose), one new small render/bind pair mirroring `uwPromoBeatHtml`/its dismiss-wiring (~9283-9372) adapted for real buttons + `GS` mutation + resolve-in-place, one `endSeason()` call-site guard (`!GS.reckoningResolved`), one `#season-continue-btn` disable/enable toggle, one new persisted boolean added to defaults + `hydrateGS()`. No new CSS beyond existing `.glass`/`.btn`/`.btn-outline`/`.btn-gold`/accent-var classes already in the file. No new screens, currencies, or components.
