# Findings Log — Cricket Underworld

> **Living document. Append, don't rewrite.** Every session that finds a real bug, discrepancy,
> dead code path, or design gap — during a `/design-review`, a testing pass, a code audit, or just
> incidentally while building something else — logs it here before the session ends. Newest entries
> go at the top of their status section. Never delete a closed entry; move it to ✅ Fixed with the
> commit hash instead, so this file stays the one place that answers "have we seen this before."
>
> **Status legend:**
> - 🔴 **Open** — confirmed real, not yet decided or fixed. Needs a founder call or a build session.
> - 🟡 **Flagged, not fixed** — confirmed real, deliberately left alone (out of scope for the pass
>   that found it, low priority, or needs a design decision rather than a code fix).
> - ✅ **Fixed** — shipped, commit hash included.
>
> Each entry: what/where, how it was confirmed (not assumed), why it matters, current status.

---

## 🔴 Open — needs a founder decision

### 2026-09-11 — Deep SYSTEMS audit (balance · economy · cricket authenticity): 21 🔴 open
Run after the UI audit closed, on the founder's call for "another deep pass". Three parallel
specialist audits of the **systems underneath** the interface. Calibrated against the locked-lineup
over-cap bug (2 bowlers × 10 overs, 2.5× the T20 legal cap) that the UI pass only found by accident.

**Full evidence with line citations is preserved in three permanent docs — read these before fixing
anything, they contain traced numbers, not assertions:**
- `docs/audit-2026-09-11-balance.md` — 6 🔴 · 14 🟡 · 6 🟢 + 18 confirmed-healthy.
  Method: the auditor re-implemented the real engine functions in a Monte-Carlo harness seeded from
  the actual `ALL_PLAYERS` table, 700–5,000 matches per cell, so balance claims are **measured**.
- `docs/audit-2026-09-11-economy.md` — 7 🔴 · 10 🟡 · 3 🟢 + full coin/gem/black-money source-sink
  table + 15 confirmed-healthy.
- `docs/audit-2026-09-11-cricket.md` — 8 🔴 · 12 🟡 · 5 🟢 + 18 confirmed-authentic.

**Independently verified by the orchestrator before being recorded here** (each re-checked against
live code//browser rather than relayed on trust):

1. 🔴 **The Standard Pack is an unbounded coin printer.** 500 coins buys 3 cards; instant market
   resale averages **1,124** (verified against the real 50-card pool: avg price 599, uncommon+
   sub-pool 675, sell rate 0.6×). **Net +624 per pack, repeatable forever.** Nullifies every coin
   sink and all three coin IAP tiers. *Found independently by BOTH the economy and balance audits.*
   Sharp detail: the 2026-08-03 audit closed this exact exploit for the **auction** (floor moved to
   0.6× `getPlayerPrice`) but nobody checked packs. `index.html:11856`, `:12194`.
2. 🔴 **Your locked bowling lineup bowls for the opposition.** `pickBowler()`'s lineup branch never
   checks which side is bowling and ignores its own `bowlers` argument; `switchInnings()` resets
   `bowlers`/`curBowler`/`lastBowler` but never `bowlerLineup`. Verified in-browser: locked lineup
   `MINE_2, MINE_4…`, opposition squad `Ravi Nair, Nitish Agarwal…`, and the bowlers who actually
   bowled at me were `MINE_2, MINE_4, MINE_2, MINE_4…`. Your players appear in the opponent's bowling
   figures. **Pre-existing** (git-checked: the original `.find()` version had no side-guard either) —
   but the 2026-09-11 rotation fix rewrote that branch and inherited it, scoping the fix to *which
   bowler, in what order* without asking *whose bowler*. `:9187`, `:10222`, `:10720`.
3. 🔴 **Opponent strength is generated from YOUR squad average, so hoarding junk makes the game
   easier.** `generateRivalXI()` does `base = getTeamStrength() + rand(-3..+4)` — and
   `getTeamStrength()` averages the whole **squad** while your XI comes from `selectedXI`. Measured:
   adding 4 never-picked junk cards moved an elite squad **85.8% → 98.2%** win rate, a mid squad
   **78.3% → 90.4%**. It punishes collecting — the core loop of a card game — and makes the pre-match
   "STR" readout fiction. Needs a **design decision**, not a patch. `:9123`.
4. ✅ **FIXED 2026-09-12 (`798d665`)** — 🔴 **Morale is a null stat that also buffs your opponent.** `moraleMod = 0.9 + GS.morale/500` is
   applied to whoever is batting with **no `isYourBatting` gate**, unlike every other side-scoped
   modifier in the same function. Measured win rate is flat across morale 20/50/75/100, so the
   150-coin Pep Talk buys nothing. *Found independently by BOTH the balance and cricket audits.*
   `:9236`, `:9252`.
5. 🔴 **`skipMatch()` never assigns `match.lastBowler`**, so the no-consecutive-overs rule dies on the
   **default fast-forward path**. Traced: a one-fast-bowler XI bowls him overs 0,1,2,3 back-to-back
   until the 24-ball cap pulls him. Illegal in cricket, and skip is how most players will play.
   `:10778` (live path correctly sets it at `:10355`, `:10301`).
6. ✅ **FIXED 2026-09-12 (`3aa21dd` + purse commit)** — 🔴 **Three more scout-bug-class dishonest purchases.** (a) `media_contact` (60 B$ Fixer) has
   **zero implementation** — verified: exactly one grep hit in 13,000 lines, its own definition at
   `:9613`. (b) Academy graduates are **silently deleted** when the squad is full, yet `endSeason`
   still prints "Academy Grad — <name>" after 300 coins and 2–3 seasons (`:11516` vs `:11806`).
   (c) The **entire sponsor `purseBonus` ladder is dead code** (+500 Tata … −200 No Sponsor):
   `endSeason` computes `auctionPurse = basePurse + sp.purseBonus` (`:11776`) and the UI displays it
   (`:8283`), then `startAuction` overwrites with `GS.auctionPurse = GS.coins` (`:8836`) — wiping the
   sponsor bonus AND the tribunal −20% penalty. That ladder is the alignment system's main economic
   payoff, and it has never once applied.
7. 🔴 **Aggressive batting is STILL strictly dominant** despite the 2026-08-03 fix: +13.0 runs for
   +0.48 wickets, in an innings that only loses 4.7. The intended trade-off cannot exist while
   wickets are non-binding. Plus **"Contain" field is a free, unlimited dominant button** (opponent
   176 → 158, +12–14pp win rate; every `field=defensive` row beat every row without it).
8. 🔴 **`cleanStreak` never resets across seasons** — verified absent from `endSeason`'s reset list
   (which does reset wins/losses/matchNum/seasonStats/rivalWins/winStreak/streakShield). Compounds to
   **+1,960 coins/win by season 14**. `:10893`.
9. 🔴 **The design brief's archetypes don't exist in the simulation.** `calcBallOutcome` reads `role`
   only to pick a pitch modifier, so Top-Order / Middle-Order / Wicket-Keeper with equal `bat` are
   **byte-identical** in play, and `fld` is never read by the match engine at all. Anchor, power
   hitter, finisher, death bowler, powerplay specialist — all currently cosmetic.
10. 🔴 **DRS has no recency gate** (`:9424`) — `batIdx` is derived from the wicket count, so it's a
    "delete one wicket" button that can resurrect a batter dismissed 10 overs ago.
11. 🔴 **Nothing in XI validation requires a wicket-keeper or a bowler** (`:10105-10109` checks only
    size and the overseas cap), so a legal XI can have one man bowl all 20 overs consecutively.

**Also flagged, lower severity but cheap:** daily login pays ~7× more than winning a match (4,900
coins/week passive vs 80/win — ~68% of all coin inflow); the premium pass refunds 120 of its 150 gems
making it permanently self-funding; the ₹199 pass SKU is strictly dominated by the ₹199/300-gem pack;
the +300 rewarded-ad purse boost can drive `GS.coins` negative (purse is aliased to coins, no clamp,
`:9028`); and the auction can never offer a common or uncommon card (`slice(0,12)` off a rarity-desc
sort — **58% of the player pool is auction-invisible**).

**Status: 5 of 21 red fixed (3 on 2026-09-11, +2 on 2026-09-12) — 16 still open**, plus one sub-item
of the bundled misc finding (coins going negative) closed as a side effect of the purse decision.
See `SESSION-HANDOFF.md` for the prioritised resume list and the two design decisions the founder
has already made but which aren't implemented yet.

| Fixed | Commit |
|---|---|
| #6 Three dishonest purchases — **(a)** `media_contact` wired to its own advertised effect (blocks the single most damaging negative post, `neg` declared by the generators rather than sniffed from text; visible "story pulled" post so the 60 B$ buys something you can see); **(b)** squad-full academy graduates are now HELD in their slot (`ready` + cached `gradCard`) and sign once space is freed, instead of being silently destroyed while the season screen congratulated you; **(c)** purse — see below. 3 regression tests. **Not yet run — founder-gated** | `3aa21dd`, `86f5503` |
| #6(c) + misc sub-item — **founder decision 2026-09-12: purse = coins + seasonal sponsor bonus.** `startAuction`'s `GS.auctionPurse = GS.coins` no longer wipes the ladder; the tribunal's −20% became a one-season `pursePenalty` flag consumed at the next auction (a multiplier, not a cut to the bonus, because the bottom of the ladder is −200 and scaling that by 0.8 would have made a suspension a *reward*); the season-end screen now previews the number that will actually apply; `resolveCard` clamps coins at 0, which closes the **"rewarded-ad +300 can drive `GS.coins` negative"** misc finding. Dead `basePurse` (`2000 + idx*500`) dropped — it had never applied either. 2 regression tests. **Not yet run — founder-gated** | `86f5503` |
| #4 Morale null-stat — `moraleMod` is now side-scoped (`batMoraleMod`/`bwlMoraleMod`): your batting when you bat, your bowling when you bowl. GDD 7.5 formula unchanged; only the side it applies to was wrong. Super-over call's hardcoded `70` corrected to `GS.morale` (that parameter now reaches YOUR bowler). Regression test at 40k balls/cell in `tests/systems-2026-09-12.spec.js`. **Not yet run — founder-gated** | `798d665` |
| #1 Pack coin-printer — `acqCost` provenance + `getSellPrice()`; verified +624/flip → **−207** over 40 real cycles; 2 permanent regression tests added so a third rediscovery isn't possible | `b3d27e3` |
| #2 Locked lineup bowled for the OPPOSITION — verified in-browser both directions. Pre-existing (git-checked), but inherited by this session's own rotation fix, which asked "which bowler, in what order" and never "whose bowler" | `a332db7` |
| #5 `skipMatch()` never set `lastBowler` → consecutive overs (illegal) on the DEFAULT fast-forward path | `a332db7` |

**Original triage note (still applies to the remaining 18):** 21 red findings across three systems is too
much to act on blind, and at least two (rubber-banded rival generation, archetypes-don't-exist)
are design decisions rather than patches. Suggested order if acting: the pack loop first (cheapest
fix, largest blast radius), then the bowling side-leak and `skipMatch` lastBowler (both are
correctness bugs with small diffs), then the morale gate, then the design calls.

---

## 📋 Reference — 2026-09-11 full-game UI/UX audit (context for the entries below)

> Kept as a record of *how* the audit was run and what it covered. Every finding it produced --
> red, yellow and green -- is now in ✅ Fixed. This section is background, not an open-work list.

Founder ask, verbatim: *"I still didn't feel satisfied with the way the game is designed. I want a
rigorous review of each and every screen... For example while selecting bowlers during match
lineup... after clicking one option unable to understand which is selected."* Confirmed that exact
bug in code first, then ran 3 parallel static-code audits (no browser available — every
finding is read from actual markup + click-handler code, not inferred), split by screen group:
match-flow, collection/progression, underworld/corruption. **37 findings total** (18 🔴, 12 🟡, 7 🟢),
plus ~25 "confirmed working correctly" call-outs across all three passes — this is not a
uniformly-broken game, several patterns (DRS/Impact Player's `.used` state, Field Setting's 3-way
active class, XI-picker's selection/captain/unavailable tags, Customise screen, Tutorial, Store &
Rewards' badge mirroring, Power Web, Syndicate/Neta/Bhai's lock-reason and stacking-prevention logic)
are genuinely well executed and explicitly verified, not just assumed fine by omission.

**Combined priority ranking across all 3 audits, most consequential first:**

1. 🔴 **Case File overlay (and identically, Debt overlay) go stale after the underlying state
   resolves — the same calibration bug, but on a full destination screen, not one button.**
   `updateHub()` only calls `renderCaseFile()` / rebuilds `#debt-list` inside their respective
   `if (GS.investigation)` / `if (GS.debts.length > 0)` branches; the `else` branches never clear the
   overlay content. A player who successfully bribes an inspector or pays their last debt keeps
   seeing the resolved case/debt indefinitely (stage-track pills, a still-CSS-animating "now" pip,
   live-looking Bribe/Pay buttons) until they back out and notice the Hub band changed behind it.
   Re-tapping the stale Debt overlay's Pay button reports **"Not enough B$"** — factually wrong; the
   real reason is the debt no longer exists. `prototype/index.html:7123-7148` (`renderCaseFile()`),
   `7949-8051` / `8056-8076` (`updateHub()`'s two branches), markup `4173-4194`.
2. 🔴 **Two of five "scout your opponent" purchases in the same Club Management panel are
   cosmetic-only — they show randomly-regenerated data that's discarded, not real intel.**
   "Basic Scout" (100C) and "Detailed Report" (250C) both call `generateRivalXI(rival)` — which
   re-rolls every name AND stat with `Math.random()` on every call — display it once, then throw it
   away. Only Facilities' "Scout" (200C, cheaper, same panel) writes `GS.scoutedXI`, which is read
   back verbatim at the real match's kickoff. "Weakness Analysis" (300C) is also real. A player has
   no way to tell, from the UI, which of the four purchases actually affects their next match — this
   reads as a monetization-integrity problem, not a copy nit. `prototype/index.html:4126-4129`
   (markup), `9310-9368` (`updateScoutPanel`/`executeScout`), `8753-8775` (`generateRivalXI`),
   compare `12086-12108` (the real Facilities Scout).
3. 🔴 **League's promotion/relegation zone coloring doesn't match the actual promotion/relegation
   rule.** Top-4/bottom-2 rows are painted green/red by table RANK (`t < 4` / `t >= teams.length-2`,
   `prototype/index.html:8422`); the real rule in `endSeason()` (`11242-11253`) is a flat win-rate
   threshold on your own results only (`wins/14 >= 0.57` promoted, `< 0.29` relegated) — rank is
   never read. A player could finish 1st in the "promotion zone" at 55% win rate and NOT be promoted,
   or finish 6th with 60% and get promoted anyway. This actively teaches the wrong mental model of a
   core progression mechanic, every time the screen opens — worse than the calibration bug (which
   fails to *confirm* a state); this *asserts a wrong rule*.
4. 🔴 **The bowler-lineup panel is 3 compounding bugs in the same 8 lines, not just the missing
   `.selected` class the founder's example named.** (a) `#bowler-auto-btn`/`#bowler-lock-btn` — zero
   persistent visual state on either button after tap (the named bug — confirmed, both handlers only
   `toast()` + update internal `match.*` state, no `classList` call, no `.selected`/`.active` CSS
   variant even exists for them to use). (b) The two labels ("Auto (ask each over)" / "Lock Lineup")
   describe near-opposite behaviors using confusingly similar phrasing — "Auto" here means "I'll be
   interrupted every over," the opposite of what "Auto" normally implies. (c) The panel's own copy
   ("Set preferred bowling order. You can change mid-match.") is a false promise — the bowler rows
   are styled clickable (`cursor:pointer`, bordered) but have **zero click handler anywhere in the
   file** (`data-lineup` appears exactly once, in the markup-generation line, `9412`); there is no
   actual reordering mechanism. Markup `3751-3758`, handlers `11952-11960`, `lockBowlerLineup()`
   `9420-9427`, row markup `9404-9418`.
5. 🔴 **Pack-opening screen's own instruction is false** — "Tap to reveal" is shown directly under
   the pack title, but the flip is 100% timer-driven (`setTimeout(..., 600 + f*500)`); neither
   `.pack-flip-container` nor `.pack-flip-inner` has any click listener anywhere in the file. A player
   who taps exactly as told gets no reaction at all. `prototype/index.html:11376` (copy), `11380`
   (markup), `11385-11398` (`openPack()`'s reveal loop).
6. 🔴 **Every Squad row shows a hardcoded green "playing" status dot — even for banned/injured/held
   players**, directly contradicting the correctly-rendered red BANNED/INJ/HELD text tag on the same
   row. `renderPlayerMini()` appends `'<div class="status-dot playing"></div>'` unconditionally; only
   one `.status-dot` CSS variant exists in the whole stylesheet. `prototype/index.html:7735-7739`
   (JS), `655-656` (CSS, no `.injured`/`.banned` variant defined).
7. 🔴 **Auction's "‹ Hub" back button silently forfeits an in-progress winning bid, zero confirmation.**
   Styled/labeled exactly like harmless navigation (same pattern as `#prematch-back-btn`), but while
   an auction is active it force-terminates via `clearInterval` + `endAuction()` without resolving
   the card on the block — even if the player is the current highest bidder. `prototype/index.html:3621`
   (markup), `11949` (handler), `8674-8691` (`endAuction()`, never calls `resolveCard()`).
8. 🔴 **Squad Selection (XI-picker) overlay has no back/cancel/close control at all** — only
   `#ss-auto-btn`/`#ss-confirm-btn` in the footer. It's excluded from both the generic
   `.overlay`-backdrop-tap-to-dismiss handler (wrong CSS class, `squad-select-overlay` not `overlay`)
   and the drag-to-dismiss gesture system. The only exit, `confirmSquadSelect()`, unconditionally
   saves `GS.selectedXI`/`GS.captainId` and navigates to Pre-Match — a mis-tap into this overlay
   forces a real state mutation + unwanted navigation before the player can get back out.
   `prototype/index.html:3991-4006` (markup), `9461-9478` (`showSquadSelect`), `9622-9645`
   (`confirmSquadSelect`, forces `startPreMatch()` at `9644`).
9. 🔴 **Case File's Bribe / Political Pressure buttons show zero afford/eligibility state before
   tap** — the exact item the founder asked to specifically check. `bribeInspector()` needs
   `GS.blackMoney >= cost`; `applyPoliticalPressure()` needs an allied MLA in power AND 30+ favor —
   neither requirement shows on the button (Political Pressure's label is literally just the words
   "Political Pressure," no cost, no requirement). Compare the Mafia Offer screen and Rival Profile's
   "Bribe to Throw" button, both of which correctly `.disabled` + print an inline reason before tap —
   the right pattern already exists twice elsewhere in this file. `prototype/index.html:7138-7147`.
10. 🔴 **Toast-overwrite bug silently destroys the more important of two messages, in two places,
    because `toast()` is a single global element with no queue** (`6284-6293`, confirmed no queue
    exists). (a) Paying off a debt that held a player: `payDebt()` toasts "X released from mafia
    hold" (the actually important news), then the Pay button's own `onclick` immediately toasts
    "Debt paid," overwriting it before it paints — 100% reproducible. `6470-6491`, `8067`.
    (b) Accepting a Mafia Offer: the favor-effect toast is immediately followed by an evidence toast
    if `addEvidence()` returns truthy — which happens at documented odds per offer type (5-65%) and
    **unconditionally (100%) for "Evidence Destruction"** — so that offer's actual outcome message is
    never once visible to a player. `11471-11525`, odds table `6814-6840`.
11. 🔴 **Facilities cards (Pep Talk / Scout / Media Bribe) have the least visual state feedback of
    anything audited** — no cost-based styling at all, and none of their three real per-button gating
    conditions (already-used-today, morale-maxed, heat-zero) show before tap; all three are
    toast-only. Contrast with the Staff panel one section over, which correctly swaps a hired button
    for a HIRED/COOLING badge — the better pattern exists in the same overlay. `prototype/index.html:4097-4119`
    (markup), CSS `1642-1665` (no `.used`/`.disabled`/`.maxed` variant), handlers `12077-12116`.

**🟡 minor-friction findings (12 total, grouped by theme) — STILL OPEN, see the 🟡 section below;
listed here only to keep the audit's own tally intact:**
- **Systemic afford-state gap** — ~10 spend controls across the whole game (pack purchases, training,
  Transfer Market buy + refresh, staff hires, Academy recruit, Bhai's Arrange-it/Pay-Respects/Pay-Hafta)
  all follow the identical pattern: button renders in one visual state regardless of `GS.coins`/
  `GS.gems`/`GS.blackMoney`, afford-check lives entirely inside the click handler, failure surfaces
  only via a fading toast. Same root cause as the calibration bug, applied to affordability instead
  of mode-selection. A single shared helper (e.g. `bindAffordable(el, costFn, currencyFn)`) would fix
  all ~10 at once.
- Bowler-lineup lock/auto choice silently carries over stale across matches (`startPreMatch()` never
  resets `match.bowlerLineup`/`bowlerSelected`) — flagged for **component-architect**, it's a
  data-flow bug under the visual one. `prototype/index.html:9662-9718`, `9738`.
- Pack card count silently shrinks near a full squad (`count > slotsLeft`) with zero on-screen notice.
- Squad row's single bare stat number has no BAT/BWL label, and All-Rounders lose their bowling stat
  entirely on this screen (only `p.bat` shown regardless of role).
- Release-player / Sell-player buttons stay tappable even when the squad is at the hard 3-player
  minimum — always fails via toast, never pre-disabled. Duplicated in 2 places.
- Two entry points to the same daily Sponsor Pack (Cards screen vs Rewards overlay) don't fully
  refresh each other — a narrow, self-correcting sync gap, not a real player-facing bug in practice.
- Academy shows an explicit "Need alignment 30+" locked-state message; Mentorship (same alignment-gate
  mechanic) just silently hides instead — inconsistent treatment of the same pattern in the same
  overlay.
- Bhai screen's favor/court/hafta buttons check relationship-gates inline correctly but never
  currency — half-applied version of the game's own better pattern one line away.
- Drop-rates overlay shows identical percentages under all 3 packs (technically correct — one pool,
  one distribution — explained in a legal footnote) but is easy to misread as a bug since the
  explanation is visually distant from the numbers.
- No confirm step before irreversible high-stakes taps (mafia favors, rival bribes) vs. the two-step
  confirm IAP purchases get — inconsistent friction weighting, not a comprehension issue (consequence
  text is shown beforehand).

**🟢 polish findings (7 total):** Boost button gives no upfront explanation before first use (reveals
effect only after activating, in the moments feed) · Mafia Intel auction panel is fully dead
code/never shown · Hub's Auction-tile subtitle is hardcoded and never updates (unlike its sibling
Match-tile) · Season Stats icon-only button relies on a hover-only `title` tooltip, inert on mobile
touch · `.tribunal-overlay` CSS class has no matching HTML element anywhere, dead code · a stale code
comment about DRS's `.unavailable` state claiming a `pointer-events:none` that isn't actually there
(zero player-facing effect).

**Full detail with complete evidence/citations for every finding** (written by the 3 audit agents,
not yet merged verbatim into this summary to keep it scannable): the source files were
`docs/_audit-match-flow.md`, `docs/_audit-collection-progression.md`, `docs/_audit-underworld.md` —
deleted after this merge per the project's temp-file convention; re-run `/design-review`-style audits
again if deeper re-verification is ever needed rather than expecting these to still exist.

**Status: ALL 11 🔴 items FIXED 2026-09-11** (founder: "work through the red ones"). See the
✅ Fixed section below for the commit-by-commit record, including three founder decisions taken
before any code was written (scouting: make-them-real vs cut; League: fix-UI vs change-rule;
exits: confirm-dialog vs auto-resolve) and two bugs discovered *while* fixing that the static audit
could not have seen. 🟡 and 🟢 items remain open and unactioned.

---

## 🟡 Flagged, not fixed

*(Empty as of 2026-09-11 — every 🟡 and 🟢 finding from the audit has been fixed. See ✅ Fixed.)*

<details>
<summary>Resolved items previously in this section (kept for the "have we seen this before" record)</summary>

### ⭐ Systemic: ~10 spend buttons never show affordability before you tap (2026-09-11 audit)
- **What:** Pack purchases, training, Transfer Market buy + refresh, staff hires, Academy recruit,
  and Bhai's Arrange-it / Pay-Respects / Pay-Hafta all share one anti-pattern: the button renders
  identically regardless of `GS.coins` / `GS.gems` / `GS.blackMoney`, the afford check lives entirely
  inside the click handler, and failure surfaces only as a toast that fades in 2.5s.
- **Why it matters:** this is the same root cause as the founder's original calibration bug (state
  exists in `GS`, the control that represents it never reflects that state) — just applied to
  affordability instead of mode-selection.
- **Why it's the highest-value remaining item:** one shared helper (e.g.
  `bindAffordable(el, costFn, currencyFn)`) fixes all ~10 at once, rather than 10 separate patches.
  The Facilities fix shipped in `1c5838f` is effectively a hand-rolled instance of this for 3
  buttons — that pattern could be generalised.
- **Status:** open, not started.

### Other 🟡 items from the 2026-09-11 audit (open, not started)
- Bowler-lineup lock/auto choice carried over stale across matches (`startPreMatch()` never reset
  `match.bowlerLineup`/`bowlerSelected`). **Partially mitigated** by the `825f149` fix — the mode is
  now visible, and `promoteBowler()` re-syncs a locked lineup — but the underlying reset-on-new-match
  question was flagged for component-architect and hasn't been separately addressed.
- Pack card count silently shrinks near a full squad (`count > slotsLeft`) with no on-screen notice.
- Squad row's single bare stat number has no BAT/BWL label; All-Rounders lose their bowling stat
  entirely on that screen.
- Release-player / Sell-player stay tappable at the hard 3-player minimum — always fails via toast,
  never pre-disabled. Duplicated in 2 places.
- Two entry points to the same daily Sponsor Pack (Cards screen vs Rewards overlay) don't fully
  refresh each other — narrow, self-correcting in practice.
- Academy shows an explicit "Need alignment 30+" locked message; Mentorship (same alignment-gate
  mechanic, same overlay) just silently hides instead.
- Drop-rates overlay shows identical percentages under all 3 packs — technically correct (one pool,
  one distribution) but easy to misread as a bug; the explanation sits far below the numbers.
- No confirm step before irreversible mafia favors / rival bribes, vs. the two-step confirm IAP
  purchases get. **Note:** the `confirmAction()` helper added in `25415e6` now exists and could be
  reused here cheaply if the founder wants that consistency.

### 🟢 polish items from the 2026-09-11 audit (open, not started)
Boost button gives no upfront explanation before first use · Mafia Intel auction panel is fully dead
code, never shown · Hub's Auction-tile subtitle is hardcoded and never updates (unlike its sibling
Match-tile) · Season Stats icon-only button relies on a hover-only `title` tooltip, inert on mobile
touch · `.tribunal-overlay` CSS has no matching element anywhere · stale code comment claiming DRS's
`.unavailable` sets `pointer-events:none` when it doesn't (zero player-facing effect).

### Facilities' Scout Report buried 3 levels deep with no discovery hint
- **Found:** 2026-09-10, `/design-review` (game-designer agent).
- **What:** Scout Report ("See Rival XI") is a pre-match-timing-sensitive action, useful only right
  before a specific match — it now sits inside Club Management's overlay, after Sponsor, ahead of 8
  other mostly-non-urgent panels (Staff/Mentorship/Academy/Social-feed/Season-progress), with zero
  hint from the Hub that it's in there.
- **Why not fixed:** placement is a product decision (should it move to a Play-tab quick-tile near
  match-prep?), not a bug fix — needs a founder call on where it should live.

### Debt "Owed" count is a bare integer, not a status hint
- **Found:** 2026-09-10, `/design-review` (economy-architect agent).
- **What:** The Ledger tile shows only a debt count ("2") — no next-due-date or amount hint — three
  navigation layers from the actual pay-debt action (Club tab → Underworld tile → Power Web →
  Syndicate screen).
- **Why not fixed:** flagged by the same reviewer as "none required urgently" — low priority, left
  alone.

### `getAcademyHtml()` has an unreachable hint message (dead code)
- **Found:** 2026-09-11, while writing Academy System tests.
- **What:** `index.html:10954` early-returns `''` when `academySlots.length===0 && alignment<30`.
  The "Need alignment 30+" amber hint text coded a few lines later (`:10961`) can only be reached
  when slots===0 **and** alignment≥30 already holds — a contradiction with its own gate. A player
  below alignment 30 with no academy slots sees a completely blank panel, not the intended hint.
- **How confirmed:** wrote a test asserting the hint text would show, watched it fail with an empty
  string, traced the early-return logic directly.
- **Why not fixed:** minor cosmetic gap, out of scope for a test-coverage pass — flagged for a future
  small fix.

### `simKnockoutMatch()`'s player-favoring boost only applies when the player is bracket slot `a`
- **Found:** 2026-09-11, while writing Knockout Tournament tests.
- **What:** `aChance = a.str/(a.str+b.str); if(a.isPlayer){aChance+=0.05; aChance=min(0.75,aChance)}`
  (`index.html:10751-10753`) — there's no equivalent branch checking `b.isPlayer`. If the random
  bracket seeding puts the player in slot `b`, they get no +5% boost and no 75% cap at all (their
  effective win chance is just `1 - aChance`, uncapped either direction).
- **Why not fixed:** minor, asymmetric but not obviously unfair to the player (uncapped can help or
  hurt), not touched to keep the test-coverage pass scoped to writing tests, not redesigning game math.

### `rollInjury()` treats `fit: 0` as "no data" instead of "worst fitness"
- **Found:** 2026-09-11, while writing Injury System tests (this actually broke the test's first
  draft).
- **What:** `if (!player || !player.fit) return null;` (`index.html:9079`) — `0` is falsy in JS, so
  an exact-zero fitness value short-circuits to "never injured" instead of maximizing injury chance
  as the formula (`(100-fit)/800`) would otherwise imply.
- **Why not fixed:** harmless in practice — real players in this game never have `fit: 0` (the
  generation/training systems don't produce it) — but worth knowing if this function is ever touched
  again.

---

</details>

---

## ✅ Fixed

### Final polish pass + 2 test-suite flakes (2026-09-11, founder: "fix the remaining ones too")
Closes every remaining audit finding. All 37 are now resolved.

- **BOOST** is a one-per-match resource but the button said only "BOOST"; its effect was revealed
  only in the moments feed *after* it had been spent, so first use was necessarily blind. Effect now
  on the button (a `title=` alone is hover-only — inert on touch, the primary target).
- **Hub's Auction tile subtitle** was hardcoded and referenced nowhere in JS, so it could never
  change — unlike the sibling Match tile directly above it that updates every render. Now reflects
  real squad state.
- **Season Stats** was emoji-only with a hover-only `title=`. Added a visible label.
- **Removed the dead Mafia Intel auction panel** — and corrected *two* stale comments that listed it
  among "wired hooks this screen's tests depend on". Grep proved no test and no JS ever referenced
  it: the comments asserted a dependency that never existed.
- **Removed dead `.tribunal-overlay` CSS** (no matching element anywhere).
- **Corrected the DRS comment** claiming `.unavailable` sets `pointer-events:none`. It doesn't —
  only `.used` does. `.unavailable` is deliberately tappable so the tap reaches `useDRS()`'s guard
  and explains itself. The comment described the opposite of the actual design.
- **Scout Report placement** (the last 🟡, previously flagged as needing a founder decision): it's
  the one facility whose value is entirely timing-dependent, yet it sat behind 8 non-urgent panels
  with nothing hinting it existed. Added a second entry point on **Pre-Match**, where that decision
  is actually made. Extracted `scoutNextRival()` so both entry points share one implementation and
  can't drift in cost, guards or output; the row dims when unaffordable and hides once the XI is
  already locked, so you can't pay twice for the same intel.

**Two test-suite flakes fixed — both were mislabelled as "environmental".**
The `LOGIC FIX 1` test had been failing intermittently since 2026-08-03 and was repeatedly written
off. It was actually statistically under-powered: its narrowest assertion (balanced vs defensive
wickets) had a standard deviation comparable to the effect being measured at n=3000, flipping the
ordering roughly 1 run in 3 (observed this session: 185v179, 168v164, 157v160, plus passes). Raised
to 40,000 samples — 6/6 clean, still ~6s. Same defect and same fix as the Weather System test
corrected earlier the same day.

**Why this mattered beyond the tests:** with two intermittent failures, *every* full regression run
produced an ambiguous result needing manual triage — which is exactly how a real regression could
have been waved through as "just the known flake".

**One flake deliberately NOT chased:** `field placement setting appears in bowler picker`
(smoke.spec.js) is genuinely toss-dependent by design — it loops up to 6 real matches hoping to bowl
first, and `test.skip()`s safely rather than hard-failing. It passes reliably in isolation. Forcing
the toss would require stubbing `Math.random` mid-`startMatch`, where it is not the only consumer —
a real risk of destabilising a working smoke test for zero coverage gain. Left as-is, by choice.

### Yellow + code-quality pass (2026-09-11, founder: "initiate next set of fixes")
Worked straight after the red pass. 11 of 12 🟡 items plus 3 code-quality items closed; the one
remaining 🟡 (Scout Report placement) is a product decision, not a fix.

| Finding | Commit |
|---|---|
| **⭐ Systemic afford-state gap** — every spend control in the game rendered identically whether or not you could afford it; the check lived only in the click handler and failure surfaced only as a fading toast. Fixed with one shared helper (`canAfford`/`affordClass`/`markAffordable`) applied at 10 sites, rather than 10 patches | `ed67eb1` |
| Squad row's bare unlabelled stat number (meaning depended on invisible role logic; All-Rounders' bowling stat was invisible entirely) · Mentorship hid itself below its gate while Academy explained itself · pack count silently capped near a full squad · Release/Sell dead-end taps at the 3-player minimum · mafia favour accepted on a single tap despite being irreversible | `cdb1c12` |
| Drop-rates' three identical percentage blocks read as a bug · Sponsor Pack's two entry points could disagree about one shared boolean · `getAcademyHtml()`'s unreachable "Need alignment 30+" hint · `rollInjury()`'s `fit:0` falsy trap · `simKnockoutMatch()`'s slot-`a`-only player boost | `3731666` |


**A real bug found in my own fix work, worth recording:** the new generic confirm sheet inherited
`.store-confirm`'s `z-index:216`, but it gets summoned from `#mafia-overlay` (`z-index:300`) — so it
was present in the DOM and would pass a naive "is it visible" class check, while being completely
unreachable by an actual tap. Caught by `elementFromPoint` returning a mafia-overlay child at the
sheet's own coordinates. Raised to 350 (clears every overlay at max 301, stays under the toast layer
at 400). Worth remembering: *a class-presence assertion is not proof a control is tappable.*

**Knockout fairness fix verified numerically** rather than by reading: 40,000 sims per case showed
slot-a vs slot-b player win rates now agree within 0.6% (sampling noise) at even, favoured and
underdog strengths, with the 75% cap correctly applying from both slots. Before the fix, a player
drawn into slot `b` got neither the +5% boost nor the cap.

**Three tests updated deliberately** (pinning new intent, not weakened): Mentorship and Academy gates
now assert their explanatory messages instead of hidden/empty panels, and the mafia real-click test
now goes through the confirm sheet.

### All 11 🔴 findings from the full-game UI/UX audit (2026-09-11)
Worked in severity order, WIP=1, one commit each, tests run after every fix.

| # | Finding | Commit |
|---|---|---|
| 1, 9, 10a | Case File + Debt overlays went stale after the underlying state resolved (a successful bribe/last debt payment left the screen showing the resolved case/debt with live-looking buttons); Case File's Bribe/Political Pressure showed no afford-or-eligibility state; Pay button's generic "Debt paid" toast destroyed `payDebt()`'s more important "X released from mafia hold" message, and its failure branch claimed "Not enough B$" even when the real cause was a debt that no longer existed | `2282651` |
| 2 | Two of four scouting purchases sold fake intel — `generateRivalXI()` re-rolls names *and* stats on every call, so Basic Scout and Detailed Report displayed a roster with zero relationship to the team you'd actually face. Now all route through a shared `getOrLockRivalXI()` that locks `GS.scoutedXI`; Market Intel now reads real market listings instead of the whole unowned pool; "top 3" now actually sorts by OVR; all four descriptions rewritten into one coherent price ladder | `d18874d` |
| 3 | League painted promotion/relegation zones by table **rank**, while `endSeason()` uses a flat win-rate threshold that never reads rank. Now derived from win rate — specifically from *projected pace*, because applying the raw end-of-season fraction mid-season would paint every team relegation-red at match 3. Added a one-line rule/standing readout | `a6397fc` |
| 4 | Bowler-lineup panel (**the founder's original report**) — see the gameplay-bug note below | `825f149` |
| 5, 6 | Pack screen said "Tap to reveal" but no card had any click listener (tap now works, idempotent so timers still run); every squad row showed a hardcoded green "available" dot even for banned/injured/held players, contradicting its own adjacent red tag | `c100e90` |
| 7, 8 | Auction's back button silently forfeited an in-progress winning bid with no warning; XI-picker overlay had no exit except "Confirm XI", which force-saves and navigates. Both now use a shared `confirmAction()` built on the existing `.store-confirm` sheet | `25415e6` |
| 10b, 11 | Mafia-offer accept fired two toasts synchronously, so the outcome message was destroyed before painting — never once visible for "Evidence Destruction" (100% evidence rate); Facilities' three cards showed none of their real gating conditions until after a tap | `1c5838f` |

**Two bugs found while fixing that the static audit could not have seen:**
1. **`pickBowler()`'s locked-lineup branch broke the T20 over cap.** It used `.find()`, which always
   returns the earliest match, so a "locked lineup" just alternated the first two bowlers forever —
   and because it searched the raw lineup instead of the cap-filtered list, it bypassed the 4-over
   cap entirely. Measured on the old code: a locked 5-bowler lineup used **2 bowlers for 10 overs
   each** in a 20-over innings, 2.5× the legal cap the 2026-08-03 balance audit deliberately added.
   The founder's UI complaint was sitting directly on top of a real gameplay bug. Fixed and verified:
   all 5 bowlers, exactly 4 overs each.
2. **A flaky test I had authored earlier the same day.** The Weather System test used 1500 samples,
   where the wicket count's standard deviation (~9) was as large as the 10% effect being measured —
   it failed roughly 1 run in 3 (observed 96v95, then 100v83). Raised to 40,000 samples; 5/5 clean
   re-runs, still ~6s.

**Also corrected mid-fix, before shipping:** a reference to `auction.card`, which doesn't exist —
the current lot is `auction.pool[auction.idx]`. Caught by checking the real object shape rather than
trusting the property name I'd assumed.

**Test strengthened as part of #3:** the League test was named "promotion zone highlighted for top
2" and only asserted `>=1 .promotion` row existed with a 14-0 record injected — which passed under
*both* the old wrong rule and the corrected one, while its name documented the rule the game never
implemented. It now pins UI thresholds against `endSeason()` across all 15 possible win counts and
asserts rank-independence, so reverting to rank-based zones would fail loudly.

### Hub overflowed under simultaneous investigation + debt (founder-requested fix, 2026-09-11)
- **What it was:** `#hub-screen` (both Play and Club tabs) exceeded the zero-vertical-scroll
  invariant when a player was under investigation **and** had an active debt at the same time — a
  fully plausible real state, since both systems are heat/alignment-driven and can coexist. League/
  Cards/Squad stayed at genuine 0px even under the same stress state, so the gap was Hub-specific.
  Isolating each condition independently had found: investigation alone added ~60-133px, debt alone
  ~38-110px, both together ~198-271px. Confirmed NOT caused by the 2026-09-10/11 sessions' other
  work — the clean baseline (no investigation, no debt) already hit true 0px.
- **Root cause:** `#investigation-panel` and `#debt-panel` rendered their FULL detail inline in the
  always-visible persistent band — stage-track pills, inspector narration, bribe/pressure buttons,
  and full per-debt payable cards. The original redesign's verification passes apparently tested
  investigation and debt as separate cases, never combined.
- **Fix:** moved the full detail into 2 new destination overlays (`#case-file-overlay` /
  `#debt-overlay`), reusing the exact `.hub-drawer-overlay` pattern + `showHubDrawerOverlay()`/
  `hideHubDrawerOverlay()` functions already proven for Club Management/Store/Underworld — zero new
  JS functions needed. Kept the exact same `#case-stage-track`/`#case-actions`/`#debt-list` element
  ids so the existing render functions (which do global `$()` lookups, not container-scoped ones)
  needed zero code changes — relocated, not rebuilt, same discipline as the original redesign.
  Compact glanceable summaries stayed inline (investigation: icon+title+matches-left+evidence count;
  debt: ribbon+count+nearest-due-amount), each with a corner-chevron tap affordance (zero flow-height
  cost, same technique already used for the Hub drawer tiles).
- **A second real bug found and fixed along the way:** closing the last ~90% of the gap via CSS
  padding trims appeared to have ZERO effect for a while, which turned out to be a real cascade-
  specificity bug, not a caching issue (verified via direct file diff and forced no-cache headers
  before concluding this) — `#hub-persistent-band .glass{padding:9px 12px;margin-bottom:6px}`
  (ID+class, specificity 1,1,0) was silently beating a plain `#investigation-panel{padding:...}`
  override (ID alone, 1,0,0). This is the exact same bug class already documented twice in this file
  from the original redesign session (compound-class rules beating plain-ID rules). Fixed by matching
  specificity with `#hub-persistent-band #investigation-panel` instead.
- **Result:** 271px/198px → 0px/0px, verified at all 3 widths (320/375/390) via direct
  scrollHeight/clientHeight measurement, and locked in as a real assertion (not a regression ceiling)
  in `tests/zero-scroll.spec.js`. Also fixed a debt-object schema bug in that test file along the way
  (`{amount,type}` instead of the real `{source,principal,stage,heldPlayer}` — same bug class already
  caught once in `persona-regression.spec.js`).

### Design-review pass (2026-09-10, `/design-review` on the no-vertical-scroll redesign)

- **Club Management overlay reopens at a stale scroll position** — `showHubDrawerOverlay()` never
  reset `scrollTop`; found independently by 2 of 5 review agents. Fixed `efec8bf`.
- **3 converted Hub drawer tiles lost their subtitle preview and chevron affordance entirely** —
  `.hub-drawer.open`-gated CSS never fired once tiles switched from expand to navigate. Fixed
  `77ec704`.
- **Several tap targets under the ~44px mobile guideline** — XI-picker pager (fixed via invisible
  hit-slop, zero visual change) and Play-tab quick-tiles/claim button (fixed via a conservative
  direct size bump). Fixed `f2ad16b`.
- **Dead `.hub-drawer.open` CSS** left over from the drawer→overlay conversion. Removed `0777045`.
- **Squad screen lost its aggregate role-count view** in the 2026-09-09 pagination redesign (the
  commit message claimed "no info lost," which was only true per-row, not in aggregate). Restored
  via the XI-picker's existing `#ss-roles` pattern. Fixed `3590342`.
- **Sponsor Break (the game's only rewarded-ad surface) had no "reward ready" signal** on its
  collapsed tile — checking availability cost a full-screen navigation for nothing. Added a badge.
  Fixed `a53e966`.
- **XI-picker's 5-per-page pagination can split a role cluster across a page boundary** — added
  role-group divider labels as a partial mitigation (did not restructure the pagination mechanism
  itself, which is load-bearing for selection-state-survives-page-flips). Fixed `3ca1fa6`.
- **Season Pass tier/XP had the same discoverability regression as Sponsor Break** — surfaced the
  live tier on the collapsed tile's subtitle instead of restructuring the Hub desk-row. Fixed
  `e973040`.

### Test-coverage pass (2026-09-11, whole-game test-case matrix + implementation)

- **`feature_list.json` had 7 stale "manual — no automated tests yet" markers** — DRS, Impact
  Player, and Staff already had real coverage added during earlier bugfix passes without the
  tracker being updated; Academy/Mentorship/Bans/Knockout/player-pool genuinely had zero coverage
  and now do. All corrected/added `52c59c3` through `5a3f89d` (see `docs/TEST-CASES.md` for the
  full commit-by-commit breakdown).
- **`feature_list.json`'s F38 Knockout evidence described the trigger as one combined condition**
  ("winRate >= 0.35 at matchNum > 14") when it's actually 2 separate gates in 2 separate places —
  `startKnockout()` only checks win rate; the match-count gate lives at the call site
  (`index.html:10582`). Corrected `5a3f89d`.
- **A viewport-height methodology bug in this session's own throwaway verification script** —
  height:700 showed false "overflow" on Hub/Squad/League that didn't exist at a realistic height:844
  (a real modern-phone height). Would have made the permanent zero-scroll test false-fail on day one
  had it not been caught. Resolved before `tests/zero-scroll.spec.js` was written, `ae71279`.
- **My own persona-regression test fixture used the wrong debt object schema**
  (`{amount,type}` instead of the real `{source,principal,stage,heldPlayer}`), which rendered
  literal "undefined" text in the Active Debts panel for 2 of 4 personas — caught by the exact class
  of check the suite exists to run, on my own test data rather than the game. Fixed `a34b26d`.
