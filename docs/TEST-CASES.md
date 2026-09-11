# Test Case Matrix — Cricket Underworld

> Built 2026-09-11, whole-game scope, at founder request following the no-vertical-scroll redesign +
> `/design-review` fix pass. Ground-truthed against the actual codebase (`feature_list.json`,
> `docs/core-systems-gdd.md`, `docs/CODEBASE-MAP.md`, all 6 `tests/*.spec.js` files, and direct
> function-name greps against `prototype/index.html`) — not written from memory or assumption, per
> workspace rule 12 (no hallucination).
>
> **Correction to the project's own tracker, found while building this doc:** `feature_list.json`
> marks F09 (DRS/Impact Player/weather/super over/injuries) and F27 (Staff) as "manual — no automated
> tests yet." That's stale for part of each: DRS (`bugfix-2026-09-09.spec.js:185`), Impact Player
> (`bugfix-2026-08-03.spec.js:176`), and Staff hiring (`comprehensive.spec.js:1473`, `:1488`) all
> already have real Playwright coverage — added later, during unrelated bugfix passes, without the
> tracker being updated. Verified by grepping `tests/` for the exact function names each system calls
> (`rollWeather`, `playSuperOver`, `rollInjury`, etc.) rather than trusting the tracker's prose.

## How to read this document

Each system below is marked:
- **✅ AUTOMATED** — already has real Playwright coverage. File:line cited from an actual run, not
  guessed. These are not re-specified in detail; the existing spec is the source of truth.
- **🆕 NEW** — zero automated coverage, confirmed via function-name grep (not just trusting the
  tracker's English-language claims, which were caught being wrong twice above). Full scenario/steps/
  expected-result given — these are what Task 3 (implementing missing specs) will turn into real
  `tests/*.spec.js` code.
- **⛔ NOT AUTOMATABLE HERE** — genuinely can't be meaningfully asserted in a headless Playwright run
  (audio context, touch gestures, subjective creative-writing quality). Left as manual/founder-review,
  not built.

## Personas (for the multi-persona regression pass, Task 4)

Grounded in the game's actual save-state shape (`cu_save_v3`) and the GDD's clean-vs-corrupt path
(§9), not invented from scratch:

| Persona | Squad | Currency | Alignment/Heat | Season | Purpose |
|---|---|---|---|---|---|
| **P1 — F2P Grinder** | 3-5 players, low rarity | ~500 coins, 0 gems, no purchases | 0 / 0 (neutral, clean) | matchNum 1-2 | Stresses onboarding, "can't afford X" failure paths, empty states |
| **P2 — Mid-Game** | 11-15 players, mixed rarity | ~5,000 coins, some gems | slightly negative / moderate heat, 1 active debt | matchNum 6-8 | Stresses the systems that only activate mid-game: mafia offers, debt, investigation risk |
| **P3 — Whale** | 15 players, high rarity | 50,000+ coins, 2,000+ gems, premium Season Pass owned | positive / low heat (clean path) | matchNum 4-6 | Stresses monetization surfaces, premium pass claim flow, "already owns everything" edge cases |
| **P4 — Endgame Corrupt** | 15 players | moderate currency, high black money | -60 alignment / 85+ heat, active investigation | matchNum 13-14 (pre-season-end) | Stresses tribunal, evidence, full Underworld faction system, knockout-eligibility edge, season-end transition |

`injectState()` (the existing test helper pattern, see `docs/testing-guide.md`) can seed all four
directly — no new test infrastructure needed, just new state objects.

---

## Core Loop

### F01 — Hub display (currencies, meters, season record, battle card)
✅ AUTOMATED — `comprehensive.spec.js:103,111,120,127,135,142,150,159,169,177`

### F02 — Bottom nav + no-JS-errors
✅ AUTOMATED — `comprehensive.spec.js:189,202`, `p15-visual.spec.js:319,328,342`

### F03 — Save/load (localStorage `cu_save_v3`)
✅ AUTOMATED — `comprehensive.spec.js:68,80,89`

---

## Auction

### F04 — IPL-style auction (bid/pass/won-players-join-squad)
✅ AUTOMATED — `comprehensive.spec.js:553,570,577,588,601,619`

---

## Match Engine

### F05 — Full match sim (select → prematch → ball-by-ball → result)
✅ AUTOMATED — `comprehensive.spec.js:440,473,491,511,528`

### F06 — Squad selection overlay (auto-select, overseas cap)
✅ AUTOMATED — `comprehensive.spec.js:307,321,335,351,367`

### F07 — Pre-match (opponent, pitch, fix banner)
✅ AUTOMATED — `comprehensive.spec.js:395,410,423`

### F08 — Match interactivity (bowler picker, field placement, boost)
✅ AUTOMATED — `comprehensive.spec.js:1308,1332`, `smoke.spec.js:83`

### F09a — DRS
✅ AUTOMATED (corrected from stale tracker) — `bugfix-2026-09-09.spec.js:185` (batting-only gating,
guarded even against a direct `useDRS()` call — thorough, no new work needed)

### F09b — Impact Player substitution
✅ AUTOMATED (corrected from stale tracker) — `bugfix-2026-08-03.spec.js:176` (cancel+reopen doesn't
double-fire)

### F09c — Weather 🆕 NEW
- **Function under test:** `rollWeather()`, `applyWeather()` (`prototype/index.html:8868,8876`)
- **Scenario 1:** Start a match; over enough simulated matches (or by forcing the RNG seed if one
  exists — check `rollWeather()`'s implementation first), confirm weather can roll to each of its
  possible states.
- **Scenario 2:** With a weather state active, confirm `applyWeather()`'s stated modifier (check the
  GDD §6 or the function body for the exact effect — e.g. overcast favoring seam bowling) actually
  changes ball-outcome probabilities, via `page.evaluate()` calling the match-calc function directly
  with and without the weather flag, same pattern as the existing field-placement test
  (`comprehensive.spec.js:1308`).
- **Scenario 3:** Weather banner/UI element is visible during a match when active (visible assertion,
  not just internal state — per `docs/testing-guide.md`'s "prefer visible assertions" rule).
- **Expected:** weather rolls to a valid state, UI reflects it, and it measurably shifts match-calc
  output the way the GDD describes.

### F09d — Super Over 🆕 NEW
- **Function under test:** `playSuperOver()` (`prototype/index.html:9039`)
- **Scenario:** Force a tied match result (inject state or manipulate scores via `page.evaluate()` so
  regulation ends level), confirm `playSuperOver()` triggers, produces a valid winner, and the result
  flows into season record the same way a normal match result does (reuse the assertion pattern from
  `comprehensive.spec.js:491` "match result updates season record").
- **Expected:** tie → super over → valid non-tied winner → season record updated correctly (no
  double-count, no missing match).

### F09e — Injuries 🆕 NEW
- **Functions under test:** `rollInjury(player)`, `processMatchInjuries()`, `processInjuryTick()`
  (`prototype/index.html:9078,9097,9113`)
- **Scenario 1:** Play/skip enough matches (or call `rollInjury()` directly with a forced-trigger
  state if the function supports it) to produce an injured player; confirm `player.injured` is set
  with a `type` and `matchesOut` count (referenced in the match-result injury banner markup,
  `index.html:10498`).
- **Scenario 2:** An injured player cannot be added to the XI — reuse the exact assertion pattern
  already proven for banned/held players (`bugfix-2026-08-03.spec.js:63`, "debt stage-2 held player
  cannot be added to the XI" — same `!p.banned && !p.injured && !p.debtHeld` guard at
  `index.html:9394,9399,9537`, just swap the precondition to `injured`).
- **Scenario 3:** `processInjuryTick()` counts an injured player's `matchesOut` down each match and
  clears `injured` when it hits 0 — confirm via `page.evaluate()` across simulated match advances.
- **Expected:** injury applied → surfaced in UI → blocks XI selection → recovers on schedule.

### F22 — Edge cases (min/max stats, 3-player squad, 0 coins)
✅ AUTOMATED — `comprehensive.spec.js:1382,1405,1413,1420,1427`

### F24 — Commentary quality
⛔ NOT AUTOMATABLE HERE — subjective creative-writing quality (per `docs/testing-guide.md`), no
pass/fail assertion makes sense. Leave as founder manual-review.

### F30 — Canvas match ground (ball trajectory, fielder positions)
✅ AUTOMATED — covered indirectly by `p15-visual.spec.js`'s "No JS Errors" suite (:328, :342 — starting
a match and navigating produce no console errors, which would catch a canvas-render crash) — no
dedicated visual-correctness test exists, but a canvas is inherently hard to assert on beyond
"didn't crash." Leave as-is; not worth new investment.

---

## Cards, Squad, League, Market

### F10 — Cards & Packs
✅ AUTOMATED — `comprehensive.spec.js:641,655,666,679,690`

### F11 — Squad Management
✅ AUTOMATED — `comprehensive.spec.js:214,228,238,245,253,263,275,287`

### F12 — League table + season end
✅ AUTOMATED — `comprehensive.spec.js:708,720,1358`

### F13 — Transfer Market
✅ AUTOMATED — `comprehensive.spec.js:733,741,750`

### F23 — 50-player pool diversity 🆕 NEW (easy — worth doing even though low-risk)
- **Scenario:** `page.evaluate(() => window.ALL_PLAYERS)` (confirm the actual global name first via
  grep — `docs/CODEBASE-MAP.md` should have it), assert: length === 50, all names unique, every role
  in `ROLE_SHORT`'s key set is represented at least once, rarity tiers all present, overseas flag has
  both true/false present.
- **Expected:** the pool is exactly as diverse as the design intends — this is a cheap regression
  guard against someone accidentally shrinking/duplicating the pool in a future edit, not a
  meaningful current risk. Low priority but trivial to add.

### F31 — Holographic foil (epic/legendary card tilt)
⛔ NOT AUTOMATABLE HERE — requires pointer-tilt interaction on a physical device to look right;
Playwright can dispatch synthetic pointer events but "does it look holographic" isn't a DOM assertion.
Leave as manual visual QA.

---

## Alignment, Mafia, Debt, Investigation (the corruption spine)

### F14 — Alignment System
✅ AUTOMATED — `comprehensive.spec.js:804,819,828`

### F15 — Mafia System
✅ AUTOMATED — `comprehensive.spec.js:840,847,853,859`

### F16 — Debt System
✅ AUTOMATED — `comprehensive.spec.js:878,888,899`, `bugfix-2026-08-03.spec.js:63` (held player XI
block)

### F17 — Investigation & Tribunal
✅ AUTOMATED — `comprehensive.spec.js:911,921` (note: :921's assertion at line 933 only checks the
verdict NAME is one of 7 valid strings — it does NOT verify each verdict's actual mechanical effect
fires correctly. See F32 below, which is the real gap this surfaces.)

### F18 — Facilities (pep talk, media bribe)
✅ AUTOMATED — `comprehensive.spec.js:766,777,788`

### F32 — Player Bans (doping/conduct/corruption/board, full lifecycle) 🆕 NEW
- **Gap, precisely scoped:** the tribunal test (`comprehensive.spec.js:921`) proves a `MATCH BAN`
  verdict *string* can occur, but nothing tests that a ban, once issued, actually behaves like a ban:
  duration counts down, the player is blocked from XI selection while banned, and the ban lifts on
  schedule.
- **Scenario 1:** Force a tribunal verdict of each ban-producing type (doping/conduct/corruption/board
  sanction — check the tribunal verdict table in `docs/core-systems-gdd.md` §3.6 for the exact list
  and per-type duration), confirm `player.banned = {type, matchesLeft}` is set correctly per type.
- **Scenario 2:** A banned player cannot be added to the XI — same guard pattern as F09e/injuries
  above (`!p.banned` check already exists at `index.html:9394` etc., just need the precondition).
- **Scenario 3:** Ban duration ticks down each match and clears on schedule (mirrors F09e Scenario 3's
  pattern for injuries — likely the same tick function handles both, worth checking
  `processInjuryTick()`'s neighborhood for a shared or parallel ban-tick function before writing a
  new one).
- **Expected:** each ban type applies its documented duration, blocks selection while active, clears
  correctly.

---

## Progression Systems

### F19 — Tutorial & Onboarding
✅ AUTOMATED — `comprehensive.spec.js:1281,1290`, `features-10k.spec.js:437,457,467`

### F20/F33 — Customisation
✅ AUTOMATED — `comprehensive.spec.js:1180,1188,1202`

### F25 — Academy 🆕 NEW
- **Functions under test:** `generateAcademyProspect()`, `processAcademySlots()`, `getAcademyHtml()`,
  `recruitAcademyProspect()` (`index.html:10907,10923,10953,10980`)
- **Scenario 1:** Academy panel renders with N prospect slots (read `processAcademySlots()` for the
  actual slot count/unlock condition — likely gated behind a facility/staff prerequisite, check
  before assuming it's always available).
  slots.
- **Scenario 2:** `recruitAcademyProspect()` — recruiting a prospect costs the documented
  currency/time and adds a new player to `GS.squad` with academy-appropriate (likely lower) starting
  stats. Confirm the currency deduction and squad addition, same assertion style as F04's "won players
  join squad."
- **Scenario 3:** Recruiting fails gracefully without enough currency/an open squad slot (mirror the
  existing "training fails without coins" pattern at `comprehensive.spec.js:275`).
- **Expected:** prospects generate on schedule, recruiting them costs the right amount and adds a real
  squad member, failure paths don't crash or silently succeed.

### F29 — Mentorship 🆕 NEW
- **Functions under test:** `canMentor()`, `showMentorPicker()`, `processMentorship()`,
  `updateMentorshipPanel()` (`index.html:10616,10624,10671,10694`)
- **Scenario 1:** `canMentor()` gates on `GS.alignment >= 40` (confirmed directly in the function body)
  — assert the mentor picker is inaccessible below that threshold and accessible above it. This is the
  exact same shape of test as `bugfix-2026-08-03.spec.js`'s captain-eligibility tests — reuse that
  pattern.
  it.
- **Scenario 2:** Picking a mentor+mentee pair via `showMentorPicker()` sets up `GS.mentorship`
  correctly (which stat gets boosted — check `pickMentorStats()` at `:10624` for the exact formula).
- **Scenario 3:** `processMentorship()` applies its stat boost to the mentee over the documented
  number of matches, and `updateMentorshipPanel()` reflects current progress in the UI (visible
  assertion, not just internal state).
- **Expected:** gated correctly by alignment, boosts the right stat by the right amount, UI tracks
  progress.

### F34/F35/F36/F45 — Season Pass, IAP stubs, Rewarded ads, monetization surfacing
✅ AUTOMATED — `smoke.spec.js:158,212,290`, `features-10k.spec.js:208,235,261,278`

### F37 — PWA
✅ AUTOMATED — `smoke.spec.js:259`

### F38 — Knockout bracket tournament 🆕 NEW
- **Function under test:** `startKnockout()` (`index.html:10734`)
- **Trigger condition (from feature_list.json):** `winRate >= 0.35 at matchNum > 14` — confirm this
  exact gate in the function body before writing the test (don't assume the tracker's prose is
  precisely right, per the corrections already found above).
- **Scenario 1:** Reach season end with win rate at/above the threshold → knockout starts with the
  documented 4-team bracket (player + top-3 eligible rivals + wild cards per the tracker's evidence
  text — verify against code).
- **Scenario 2:** Semi → final progression, each round playable or simmable (reuse the existing
  "skip produces valid non-zero scores" pattern from `comprehensive.spec.js:473`).
- **Scenario 3:** Reward payout formula (`300 × (leagueIdx+1)` per the tracker) is applied correctly
  on tournament win.
- **Scenario 4 (persona P4 territory):** Reaching season end while under active investigation or with
  unresolved debts — confirm knockout eligibility/behavior doesn't silently break interacting with
  those systems (this is exactly the kind of state-combination gap a single-persona suite would miss —
  the reason Task 4 exists).
- **Expected:** knockout triggers correctly on the real gate condition, bracket plays through cleanly,
  reward payout matches formula.

### F42 — Theming (light/dark)
✅ AUTOMATED — `comprehensive.spec.js:1220,1229,1252`

### F43/F44 — Daily Login Streak, Empire Net-Worth
✅ AUTOMATED — `features-10k.spec.js:79,105,119,135,155,164,180`

### F46 — Analytics
✅ AUTOMATED — `features-10k.spec.js:313,324,339`, plus `P3 — Remote analytics sink` group
(`:362,392,404`) and `Cloud Save & Backup` group (`:482,498,516,540,554`) which weren't in the
tracker's F-numbering at all but exist and pass in `features-10k.spec.js` — worth a `feature_list.json`
follow-up to give these their own F-ids, out of scope for this document.

---

## Underworld Core (factions, police, politics, streets)

### F39/F40/F41 — Power Web, police case pipeline, rival bribes, faction screens
✅ AUTOMATED — extensively covered, `comprehensive.spec.js:941` through `:1176` (18 tests across
factions/syndicate/neta/bhai/police). This is the best-covered system in the game relative to its
complexity — no new work needed.

---

## Visual System

### F21 — Procedural crests, power ring, battle card, silhouettes, spring physics, gradients
✅ AUTOMATED — `p15-visual.spec.js` (28 tests, entire file)

### F26 — Sound
⛔ NOT AUTOMATABLE HERE — headless Chromium has no audio output to assert against.

### F28 — Gestures (swipe nav, drag-dismiss, pull-to-refresh)
⛔ NOT AUTOMATABLE HERE — this project's own prior sessions already noted Playwright's touch/gesture
emulation doesn't reliably exercise these; requires a real touch device.

---

## No-Vertical-Scroll Redesign + 2026-09-10/11 Design-Review Fixes

Not separate F-numbers (the redesign was explicitly a layout pass, not new functionality — see
`PROGRESS.md`), but worth its own section since it's the most recently-changed code and the
zero-scroll invariant has no permanent regression test (confirmed via `grep scrollHeight tests/` —
zero matches, this session had to build a throwaway script to check it at all).

### 🆕 NEW — permanent zero-scroll regression test
The founder's redesign session and this session's fix-verification both relied on **throwaway**
measurement scripts, deleted after use each time. That means the exact same manual check will be
needed again next time someone touches Hub/League/Cards/Squad/XI-picker CSS, with no memory of how to
reproduce it precisely (this session already hit that gap — see `PROGRESS.md`'s "honest limit of this
verification" note, where the test state used didn't match whatever exact combo the original redesign
checked).
- **Recommendation:** promote the throwaway measurement pattern into a real, permanent
  `tests/zero-scroll.spec.js` — one test per nav screen (Hub Play tab, Hub Club tab, League, Cards,
  Squad, XI-picker per-page) asserting `scrollHeight <= clientHeight` at 320/375/390px, using a single
  **documented, fixed, worst-case `injectState()`** (long mafia-banner message, active investigation,
  active debt, full squad) so the "worst case" is pinned in code instead of re-derived from memory
  each time. This closes the exact gap this session's honest-limit caveat flagged.

---

## Summary counts

| Status | Count |
|---|---|
| ✅ Already automated (36 features + corrections) | 38 effective (F09 DRS+Impact, F27 recovered from stale gap markers) |
| ✅ Newly automated 2026-09-11 (Task 3, all 9 shipped) | Player-pool diversity (F23, `52c59c3`), Weather (F09c, `bfd6f01`), Super Over (F09d, `095a2ae`), Injuries (F09e, `a894136`), Academy (F25, `886363c`), Mentorship (F29, `77bf1a2`), Bans full-lifecycle (F32, `c686030`), Knockout (F38, `e60dfa1`), permanent zero-scroll regression (`ae71279`) |
| ⛔ Not automatable here | Sound (F26), Gestures (F28), Commentary quality (F24), holographic foil (F31) — 4 items, correctly left manual |

**Real bugs/discrepancies found while building this coverage (not fixed here — out of scope for a
test-coverage pass, flagged for founder triage):**
- `getAcademyHtml()` has unreachable dead code: the "Need alignment 30+" hint (index.html:10961) can
  never render because the function early-returns `''` for exactly that precondition one line earlier
  (`:10954`). A player below alignment 30 with no academy slots sees a blank panel, not a hint.
- `feature_list.json`'s F38 evidence describes the knockout trigger as one combined condition
  ("winRate >= 0.35 at matchNum > 14"); it's actually two separate gates in two separate places —
  `startKnockout()` only checks win rate, the match-count gate lives at its call site.
- `simKnockoutMatch()`'s player-favoring boost+cap only applies when the player occupies bracket slot
  `a`, not `b` — asymmetric, minor, not fixed.
- `rollInjury()`'s `if (!player.fit) return null` guard mistreats an exact `fit:0` as "no data" (0 is
  falsy in JS) rather than "worst fitness" — harmless in practice since real players never have fit:0.
- **The real one to weigh:** `tests/zero-scroll.spec.js` found the Hub screen overflows (not
  League/Cards/Squad, which stay at true 0) when a player is under investigation AND has an active
  debt simultaneously — a fully plausible combined game state the original redesign's verification
  passes apparently never tested together. Pinned as a regression ceiling, not fixed. Founder decision
  needed on whether it's worth a further Hub trim.

Task 3 (implementing missing Playwright specs) is complete — all 9 items shipped 2026-09-11, one
commit each, WIP=1. Full-suite count is now 194 (previous) + ~34 new assertions across 9 new
`test.describe` blocks. Next: Task 4, multi-persona/multi-pass regression.
