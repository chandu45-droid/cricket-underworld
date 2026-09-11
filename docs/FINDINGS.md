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

### 2026-09-11 — Full-game UI/UX audit (every screen, every button, every text)
Founder ask, verbatim: *"I still didn't feel satisfied with the way the game is designed. I want a
rigorous review of each and every screen... For example while selecting bowlers during match
lineup... after clicking one option unable to understand which is selected."* Confirmed that exact
bug in code first (see below), then ran 3 parallel static-code audits (no browser available — every
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

**🟡 minor-friction findings (12 total, grouped by theme):**
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

**Status: awaiting founder triage.** Nothing here has been fixed or scoped into commits yet — 37
findings is too much to fix blind. Recommend the founder picks from the top-11 🔴 list above (in
severity order, or by whatever subset matters most for the next milestone) rather than a blanket
"fix everything."

---

## 🟡 Flagged, not fixed

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

## ✅ Fixed

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
