# Cricket Authenticity Audit — 2026-09-11

**Scope:** does the cricket underneath `prototype/index.html` behave like cricket? Lens: would a
cricket fan nod or cringe. Read-only pass — nothing edited, no tests run, no browser.

**Method:** grepped anchors from `docs/CODEBASE-MAP.md`, then read the actual regions:
`calcBallOutcome` (9218-9327), `pickBowler`/`getBowlersAtOversCap` (9159-9216), `simBall`
(10330-10445), `skipMatch` (10764-10806), `startMatch`/`switchInnings` (10202-10259 / 10720-10762),
`showBowlerPicker` (10261-10310), DRS (9390-9435), Impact Player (9440-9503), super over
(9508-9542), weather/rain (9332-9370), squad selection (10087-10141), auction (8825-9058),
`getPlayerPrice` (12087-12091), `ALL_PLAYERS`/`RIVALS` (5330-5398), scorecard + result margin
(10498-10534, 11026-11036).

Every finding below is **VERIFIED** (traced in code) unless explicitly marked INFERRED.

**Counts:** 8 × 🔴 · 12 × 🟡 · 5 × 🟢

---

## 🔴 Rule is wrong / a fan would cringe

### Your locked bowling lineup also bowls for the opposition
- **System:** Bowler rotation
- **Location:** `prototype/index.html:9187`, `:10222`, `:10720`
- **What:** Once the player locks a bowling lineup, `pickBowler()` returns players from
  `match.bowlerLineup` regardless of which side is bowling. The opposition's attack becomes your
  own squad.
- **Evidence:** `startMatch()` sets `match.bowlerLineup = lockedLineup` (`:10222`), where
  `lockedLineup` comes from `lockBowlerLineup()` → `getOrderedBowlers()` (`:9903`, `:9841`) which
  reads `GS.selectedXI` — **your** players only. `pickBowler()`'s lineup branch (`:9187`) is
  `if (match.bowlerLineup && match.bowlerLineup.length > 0) { … return best; }` with **no check of
  which side is bowling**, and it ignores the `bowlers` argument (`match.bowlers =
  extractBowlers(match.bwlXI)`) entirely. `switchInnings()` (`:10720-10762`) resets `bowlers`,
  `curBowler`, `lastBowler`, `bowlerSelected` — but **never `bowlerLineup`**.
  Concrete path: lock a lineup → win the toss-equivalent and bat first → the entire opposition
  bowling innings is bowled by your own players, and `match.scorecard.you.bowlers` (the array
  `showScorecard()` renders under the opponent's innings, `:10516`) fills with your squad's names.
  Same thing again in the 2nd innings of any match where you bowl first.
- **Real cricket:** a team bowls with its own eleven. This is the same class of bug as the
  `.find()` rotation defect — the lineup path was fixed for *ordering* but never scoped to a side.
- **Severity:** 🔴

### `skipMatch()` never updates `match.lastBowler` — consecutive overs become legal
- **System:** Bowling rules
- **Location:** `prototype/index.html:10778`, `:10796-10803`
- **What:** In skip mode a bowler can bowl consecutive overs, which is illegal in every form of
  cricket.
- **Evidence:** the live path sets it explicitly — `simBall():10355` is
  `if (!match.bowlerSelected) { match.lastBowler = match.curBowler; match.curBowler = pickBowler(...) }`,
  and `showBowlerPicker()`'s click handler does the same (`:10301`). `skipMatch()`'s loop only has
  `if (bIO === 0) match.curBowler = pickBowler(match.bowlers, phase, ov);` (`:10778`) — `lastBowler`
  is **never assigned**, so it stays frozen at whatever value it held when Skip was tapped (and
  `skipMatch()`'s inline innings switch at `:10797-10803` doesn't reset it either, unlike
  `switchInnings():10732`). `pickBowler()`'s only anti-consecutive guard is
  `bowlers.filter(b => !match.lastBowler || b.name !== match.lastBowler.name)` (`:9176`) plus the
  same filter inside the lineup branch (`:9194`) — both now compare against a stale name.
  Worst traced case: an XI with exactly one Fast Bowler. Phase 0 (overs 0-5) takes the
  `pace.length > 0` branch at `:9212` and returns `pace[overNum % 1]` — the **same man for overs
  0,1,2,3** until the 24-ball cap pulls him out at `:9170`. Four consecutive overs.
- **Severity:** 🔴 (and this is the *default* fast-forward path most players use)

### Your team's morale makes the opposition bat better
- **System:** Ball-by-ball sim
- **Location:** `prototype/index.html:9236`, `:9252`, `:10360`
- **What:** `moraleMod` is derived from `GS.morale` (your team) and applied to `batStr` for whoever
  is batting — including the opponent.
- **Evidence:** `var moraleMod = 0.9 + morale / 500;` (`:9236`) then
  `batStr = batter.bat * formMod(batter.form) * phaseBat * moraleMod * pm.bat * capBatMod;`
  (`:9252`) — **no `isYourBatting` guard**, unlike every other side-scoped modifier in the same
  function (`stratBatMod` at `:9234`, weather dew, field setting at `:9310`). `simBall()` always
  passes `GS.morale` (`:10360`); `skipMatch()` likewise (`:10780`).
  Traced magnitude: `GS.morale` is clamped 20-100 (`endMatch():10911`), so `moraleMod` ranges
  0.94 → 1.10. A winning streak that pushes morale to 100 hands the opposition a **+17%
  batting-strength swing** relative to a demoralised squad.
- **Real cricket:** dressing-room morale is yours, not shared. A fan watching their form team get
  hit around *because* they're in form would call it backwards.
- **Severity:** 🔴

### Blitz (5-over) and rain-reduced innings still compute the chase off 120 balls
- **System:** Chase pressure + on-screen equation
- **Location:** `prototype/index.html:9287`, `:10377`, `:10433`
- **What:** Three separate places hardcode a 120-ball innings. In the 5-over Blitz format
  (`#format-opts`, `:3786-3787`) and after any rain reduction, the required rate is computed wrong
  by a factor of ~4, **inverting** the pressure modifier, and the UI prints an impossible equation.
- **Evidence:** `calcBallOutcome()` `:9287-9291`:
  ```
  var ballsLeft = 120 - ball;
  var rpo = ballsLeft > 0 ? (needed / ballsLeft) * 6 : 12;
  if (rpo < 8) ratio *= 1.05; else if (rpo > 10) ratio *= 0.90;
  ```
  Blitz ends the innings at `over >= 4 && ballInOver === 5` (`:10442`) = 30 balls. Chasing 60 off
  30: at ball 1 the code computes `rpo = 60/119*6 = 3.0` → takes the `< 8` branch → **+5% batting
  bonus**. The real required rate is `60/29*6 = 12.4`, which should take the `> 10` branch and
  apply a −10% penalty. The chasing side gets a bonus exactly when it should be choking.
  Same inversion after rain: chasing 120 in 6 reduced overs, `rpo = 120/120*6 = 6` → bonus.
  Fan-visible: the chase line (`:10377`, `:10380`) renders `'Need <strong>60</strong> off
  <strong>119</strong> balls'` in a 30-ball game, and the end-of-over summary (`:10433-10434`)
  prints the same nonsense.
- **Severity:** 🔴

### Rain can cut a match to fewer overs than the first innings already batted — no DLS
- **System:** Weather / rain rules
- **Location:** `prototype/index.html:9356-9370`, `:10333-10336`
- **What:** The revised over-limit is drawn independently of how many overs have already been
  bowled, and the chasing side gets the *unreduced* target.
- **Evidence:** `checkRainInterrupt()` fires only between overs 6 and 14 (`:9360`) and sets
  `match.rainOver = Math.floor(6 + Math.random()*4) * 6` — i.e. **6 to 9 overs**, chosen with no
  reference to `match.ball`. `simBall():10333` then ends the innings as soon as
  `match.ball >= match.rainOver`.
  Traced worst case: rain fires at over 12 (`match.ball ≈ 73`) and rolls `reducedOvers = 6`
  (`rainOver = 36`). Team A's innings ends immediately having batted **12 overs**. `rainOver` is
  never reset by `switchInnings()` (`:10720-10762`), so Team B gets **6 overs** — and
  `switchInnings():10722` sets `match.target` to Team A's full 12-over score with no par
  adjustment.
- **Real cricket:** this is precisely what Duckworth-Lewis-Stern exists to prevent. A fan would
  call a 12-over-vs-6-over chase for the same target a broken game, not a rain rule.
  (Secondary: `skipMatch()`'s loop never reads `rainOver` at all — a rain-reduced match played via
  Skip silently runs the full 20 overs.)
- **Severity:** 🔴

### No wicket-keeper requirement, and no minimum-bowlers requirement, in XI selection
- **System:** Squad composition
- **Location:** `prototype/index.html:10103-10126`, `:9144-9152`, `:9170-9177`
- **What:** `confirmSquadSelect()` validates exactly three things — size ≥ 3, size ≤ 11, overseas
  ≤ 4. There is no keeper check and no bowler check anywhere in the selection path.
- **Evidence:** `:10105` `if (sel.length < 3)`, `:10106` `if (sel.length > 11)`, `:10109`
  `if (osCount > 4)` — that is the whole validation. `buildSelectedXI():10128` and
  `buildPlayingXI():9107` both just sort by role and slice; neither requires a `Wicket-Keeper`.
  With an XI of 11 batters, `extractBowlers()` finds no Fast/Spin/All-Rounder and falls back to
  `for (var j = xi.length - 1; j >= 0; j--) { if (xi[j]) return [xi[j]]; }` (`:9150`) — a **single**
  bowler. `pickBowler()` then: `underCap` is empty after 4 overs so the cap filter is skipped
  (`:9175`), `eligible` is empty so it resets to `bowlers` (`:9177`), and `:9215` returns
  `eligible[overNum % 1]` — **the same man bowls all 20 overs, consecutively, 5× the legal cap.**
- **Real cricket:** an XI without a keeper cannot take the field. And no bowler bowls more than 4
  of 20 overs. The min-squad-3 allowance is deliberate, but nothing stops a *full legal 11* from
  having zero keepers and zero bowlers.
- **Severity:** 🔴

### DRS is a "delete one wicket" button — no recency gate, resurrects long-dismissed batters
- **System:** DRS
- **Location:** `prototype/index.html:9402-9435`, `:10344`
- **What:** `useDRS()` can be tapped at any moment and simply decrements the wicket count, with no
  link to the ball just bowled. Because the batter on strike is derived from the wicket count, a
  batter dismissed ten overs earlier walks back out.
- **Evidence:** the entire gate is `if (match.drsUsed) return;` (`:9403`) +
  `if (match.batting !== 'you')` (`:9410`). The outcome is
  `if (cWkts > 0 && Math.random() < 0.40) { match.wkts = Math.max(0, match.wkts - 1); … }`
  (`:9424-9426`) — the only condition is that *some* wicket has ever fallen. `simBall():10344` is
  `var batIdx = Math.min(cWkts, match.batXI.length - 1); match.curBatter = match.batXI[batIdx];`
  so dropping `match.wkts` from 8 to 7 puts batter index 7 — out since over 12 — back on strike.
  His scorecard entry still carries `out: true` from `:10410`, so `showScorecard():10510` renders
  him without the not-out `*` while he keeps accumulating runs on the same row, and the team line
  shows one fewer wicket than the number of batters marked out.
- **Real cricket:** a review must be called within ~15 seconds of the decision, against that
  delivery. Reviewing over 3's LBW in over 18 is not a thing.
- **Severity:** 🔴

### A dismissed batter bats again whenever the XI is smaller than 11
- **System:** Batting order
- **Location:** `prototype/index.html:10344`, `:10776`, `:10442`
- **What:** `batIdx = Math.min(cWkts, match.batXI.length - 1)` clamps to the last batter, so once
  the XI is exhausted the last man is re-sent to the crease repeatedly until 10 wickets fall.
- **Evidence:** with a 3-player squad (explicitly legal — `startPreMatch():10144` and
  `confirmSquadSelect():10105` both allow 3), `batXI.length = 3`. At `cWkts = 3` the clamp yields
  index 2 — the man who was batting when the 3rd wicket fell. He bats on, gets out again, and
  repeats until the `cWkts >= 10` check at `:10442` finally ends the innings. `skipMatch():10776`
  has the identical clamp. This is not only the min-squad-3 edge case: `buildSelectedXI():10130`
  filters out `banned` players, so bans can silently shrink a nominally-11 XI to 9 and produce the
  same double-dismissal.
- **Real cricket:** an innings ends when the batting side runs out of batters. A short side is
  "all out" at `players − 1` wickets, not 10.
- **Severity:** 🔴

---

## 🟡 Feels off

### One batter at a time — no non-striker, no strike rotation, no partnerships
- **System:** Ball-by-ball sim
- **Location:** `prototype/index.html:10344-10346`
- **What:** The batter is purely a function of wickets fallen. Batter #2 does not face a single
  ball until #1 is dismissed; strike never changes on odd runs or at the end of an over.
- **Evidence:** `var batIdx = Math.min(cWkts, match.batXI.length - 1); match.curBatter =
  match.batXI[batIdx];` — that is the complete batter model. Nothing in `simBall()` or
  `calcBallOutcome()` references a non-striker, and there is no strike-rotation logic anywhere.
- **Real cricket:** knock-on effects a fan will notice — a scorecard at 190/4 shows **5** batters
  having batted with **one** not-out (real cricket: 6 batted, 2 not out); no partnership figures
  are possible; a new batter never "gets set" and a settled batter never "farms the strike"; and
  there is no non-striker for the sim to pair with the strike-rotation commentary it already
  writes ("{ba} rotates the strike. Smart cricket." — `:10462`).
- **Severity:** 🟡 (defensible card-game abstraction, but it is the root cause of #8 above and
  makes partnerships/anchor play impossible to ever model)

### No extras at all — no wides, no-balls, free hits, byes or leg-byes
- **System:** Over/ball counting
- **Location:** `prototype/index.html:9312-9326`, `:10338`
- **What:** `calcBallOutcome()` returns exactly one of `{0,1,2,3,4,6}` runs plus a wicket flag.
  Every over is exactly 6 legal deliveries.
- **Evidence:** the outcome ladder at `:9315-9326` has six branches and no extras branch;
  `simBall()` increments `match.ball` unconditionally (`:10337`) and derives the over as
  `(match.ball - 1) / 6` (`:10339`). A `grep` for `no-ball`/`free hit`/`wide`/`extras`/`byes`
  across the whole file returns only commentary strings ("Wide yorker…"), never a mechanic.
- **Real cricket:** a T20 innings averages roughly 8-10 extras, and free hits off no-balls are one
  of the format's signature moments. A scorecard with a permanent `Extras 0` and every innings
  exactly 120 balls is the first thing a fan checks.
- **Severity:** 🟡

### Impact Player only exists if you bat second
- **System:** Impact Player
- **Location:** `prototype/index.html:10758-10760`, `:9441`, `:12577`
- **What:** The IMPACT button is only ever unhidden at the innings break, and only when *you* are
  the side that bats second. Bat first (a 50/50 coin flip at `:10207`) and the mechanic never
  appears for the whole match.
- **Evidence:** `$('impact-btn').style.display = 'none'` in `startMatch():10229`; the only place
  it is shown is `switchInnings():10758` —
  `if (match.batting === 'you' && !match.impactUsed && GS.squad.length > match.yourXI.length)`.
  Both entry points additionally hard-gate on `match.innings !== 2` (`:9441`, `:12577`).
- **Real cricket (IPL):** every team names 5 substitutes and can introduce the Impact Player at the
  fall of a wicket, at the end of an over, or at the innings break, up to the 14th over of either
  innings. The single most common real use — a side that batted first swapping a batter out for an
  extra bowler — is exactly the case this code makes impossible.
  *(Credit where due: the overseas guard at `:9446`/`:9457` — an overseas Impact Player is blocked
  once the XI already has 4 — matches the real rule exactly.)*
- **Severity:** 🟡

### Super over: ends on 1 wicket, resolved on boundary count, and pollutes the match score
- **System:** Super over
- **Location:** `prototype/index.html:9508-9542`, `:10883`, `:11030-11035`
- **What:** Three separate rule errors in 35 lines.
- **Evidence:**
  1. `for (var i = 0; i < 6; i++) { … if (o.wicket) break; … }` (`:9518-9522`, mirrored `:9523`) —
     **one** wicket ends the super over. Real rule: a super-over innings ends after **two**
     wickets (each side nominates three batters).
  2. `match.runs += 1; addMoment('milestone', 'Super Over tied — … win on boundary count!');`
     (`:9539-9540`) — the boundary-count tiebreak was **abolished by the ICC in October 2019**
     after the 2019 World Cup final; ties are now resolved by repeated super overs. It also always
     awards the tie to the player.
  3. `match.runs += yourSO; match.oppRuns += oppSO;` (`:9531`, `:9535`) — super-over runs are added
     to the **match** totals. `endMatch()` then flips `tied = false` (`:10883`) and the result
     margin block (`:11030-11035`) prints e.g. "Won by 6 runs" for what was a tied match decided in
     a super over. The scorecard header (`:10527`) shows the polluted totals too.
- **Severity:** 🟡

### Boundary and dot frequencies run hot for good batters
- **System:** Ball-by-ball sim probabilities
- **Location:** `prototype/index.html:9293-9296`, `:9221-9222`
- **What:** For a top-order card the powerplay and death phases produce roughly a six every 7.5
  balls and only 23% dots.
- **Evidence:** traced with real values from `ALL_PLAYERS` — Rajesh Sharma (`:5332`, bat 87, form
  72) vs a `generateRivalXI` fast bowler (bwl ≈ 70, form 55), FLAT pitch, morale 50, balanced,
  standard field, no captain:
  - powerplay: `batStr = 87 × 1.176 × 1.3 × 1.0 × 1.10 = 146.3`, `bwlStr = 70 × 1.04 × 0.9 = 65.5`,
    `ratio = 2.23`. Feeding `:9293-9296`: `wktP 0.027`, `dotP 0.234`, `sixP 0.133`, `fourP 0.164`,
    `sglP 0.321`. **E[runs]/ball = 2.05 → 12.3 rpo**, boundaries on **29.7%** of balls.
  - death (`phaseBat 1.4`): `ratio = 2.17` → `sixP 0.130`, `dotP 0.238`, **12.1 rpo**.
  - middle (`phaseBat 1.0`, `phaseBwl 1.1`, spin bwl 78): `ratio = 1.15` → **9.1 rpo**.
  - **Full innings ≈ 216/5.** For a mid-tier squad (bat 70, form 55) the same trace gives
    ~63 + 69 + 52 ≈ **185/6.5**, which is fine.
- **Real cricket:** IPL sits around 13-14% fours, 5-6% sixes and 33-35% dots. 13.3% sixes is
  roughly 2.5× real, and 23% dots is well under. The *totals* are believable (185 average side,
  216 strong side is only slightly hot); it's the **texture** that reads wrong — a fan watching a
  powerplay with a six every 1.25 overs and almost no dots will feel it before they check the
  score.
- **Severity:** 🟡

### Batting role archetypes are cosmetic — TOB, MOB and WK are identical in the sim
- **System:** Player archetypes
- **Location:** `prototype/index.html:9218-9327`, `:5330-5387`
- **What:** `calcBallOutcome()` reads `role` in exactly one place and only to pick a pitch
  modifier. Three of the six roles are indistinguishable.
- **Evidence:** the only `role` reads in the whole function are
  `var isSpin = bowler.role==='Spin Bowler'; var isPace = bowler.role==='Fast Bowler';` (`:9230-9231`).
  A `Top-Order Batter`, a `Middle-Order Batter` and a `Wicket-Keeper` with the same `bat`/`form`
  produce **byte-identical** probability distributions. Role affects only (a) batting-order
  position via the sort table at `:10133`, (b) whether `extractBowlers():9147` picks you up.
  There is also no per-player aggression, strike-rate, or phase-preference attribute anywhere in
  `ALL_PLAYERS` (`:5332-5386`): the schema is `bat / bwl / fld / fit / form / loyalty / greed`.
- **Real cricket:** the brief's archetypes — anchor, power hitter, finisher, powerplay specialist,
  death bowler — **do not exist in this sim**, not even as flavour. A "Top-Order Batter" is not
  better in the powerplay; a finisher is not better at the death; a death bowler is not better in
  overs 16-20 (see also the "Pace favored" finding below).
- **Severity:** 🟡 (this is the single biggest gap between the game's card fantasy and its sim)

### `fld` does nothing in a match — no catches, drops or run-outs
- **System:** Player stats
- **Location:** `prototype/index.html:9218-9327`, `:6440-6443`
- **What:** Fielding is one of four headline stats on every card (`:7971`) and a trainable stat
  (`:9919`), but is never read by the match engine.
- **Evidence:** `calcBallOutcome()` references `batter.bat`, `bowler.bwl`, `.form`, `.role` and
  nothing else. A full-file grep for `.fld` returns only `getOVR()` (`:6440-6443`), the card UI
  (`:7971`), training (`:9919`), academy growth (`:11501`), `getPlayerPrice()` (`:12088`) and the
  market row (`:12145`). Same for `.fit` — used only by `rollInjury():9554`, `getOVR`,
  `rollBanEvents():10568` and pricing.
  Concrete consequence: Dinesh Kulkarni (`:5352`, `fld: 88`) and Farhan Khan (`:5348`, `fld: 48`)
  field identically. The `wkt` outcome has no dismissal *mode*, so there are no catches to drop.
- **Real cricket:** fielding decides maybe 15-20 runs a T20 innings, and the keeper is the most
  involved fielder on the park. A keeper card whose keeping stat is decorative is a cringe.
- **Severity:** 🟡

### All-Rounders have no bowling type
- **System:** Pitch × bowler interaction
- **Location:** `prototype/index.html:9232`
- **What:** Any bowler who isn't tagged Fast or Spin gets the **average** of the pitch's pace and
  spin modifiers.
- **Evidence:** `var pitchBwlMod = isPace ? pm.pace : isSpin ? pm.spin : (pm.pace+pm.spin)/2;`
  On a TURNING track (`pace 0.75`, `spin 1.30`, `:9225`) a spin-bowling all-rounder gets
  **1.025** instead of 1.30 — he performs like a medium-pacer on a Chepauk raging turner. All ten
  All-Rounders in `ALL_PLAYERS` (`:5377-5386`) are affected, including the game's only legendary
  card (Suresh Venkatesh, `:5377`).
- **Real cricket:** there is no such thing as a bowler who is neither pace nor spin. Every
  all-rounder in the IPL is a seam-bowling or spin-bowling all-rounder, and which one he is is the
  whole reason you pick him for a given pitch.
- **Severity:** 🟡

### Field-restriction banner promises phase effects the sim doesn't implement
- **System:** Phase modifiers vs UI copy
- **Location:** `prototype/index.html:9086-9105`, `:9221-9222`
- **What:** The banner tells the player "Powerplay — … Pace favored", "Middle Overs — … Spin
  dominant", "Death Overs — … Yorkers & pace". No role×phase modifier exists.
- **Evidence:** the only phase inputs to the outcome are the scalar arrays
  `phaseBat = [1.3, 1.0, 1.4]` and `phaseBwl = [0.9, 1.1, 1.0]` (`:9221-9222`) — neither is
  conditioned on `isPace`/`isSpin`. A spinner in the middle overs gets exactly the same `phaseBwl`
  1.1 a quick does. The only place phase and role actually meet is bowler *selection*
  (`pickBowler():9208-9214`), which picks spin in the middle and pace otherwise — correct
  captaincy, but it changes who bowls, not how well.
- **Real cricket:** the fielding restrictions the banner quotes are themselves **correct** (max 2
  outside the circle in the powerplay, max 5 thereafter). It's the "favored/dominant" claims that
  the engine doesn't back.
- **Severity:** 🟡

### Blitz (5 overs) keeps the 4-over cap and has no death phase
- **System:** Format rules
- **Location:** `prototype/index.html:3786-3787`, `:10442`, `:10343`, `:9163`
- **What:** In a 5-over game one bowler may legally bowl 3 of the 5 overs, and every over is
  treated as powerplay.
- **Evidence:** Blitz ends at `over >= 4 && ballInOver === 5` (`:10442`) = 5 overs. `phase` is
  `over < 6 ? 0 : over < 15 ? 1 : 2` (`:10343`) — overs 0-4 are **all phase 0**, so `phaseBat` is
  1.3 for the whole game and the death phase (1.4) never occurs. `getBowlersAtOversCap():9163`
  caps at `balls >= 24` = 4 overs, so only the anti-consecutive filter limits repetition: with 2
  eligible bowlers the rotation is A-B-A-B-A, i.e. **3 overs for A**.
- **Real cricket:** the standing rule is that no bowler bowls more than 20% of the innings — one
  over each in a 5-over match. And a 5-over game is all death, not all powerplay.
- **Severity:** 🟡

### Auction AI ceilings are rarity-flat and were never re-tuned to the new base prices
- **System:** Auction / `aiBid`
- **Location:** `prototype/index.html:8927-8932`, `:8868`, `:12087-12091`
- **What:** `aiBid()`'s per-rarity maximums still correspond to the old flat base-price table that
  the 2026-08-03 fix replaced. Base prices roughly doubled; the ceilings didn't move. The better
  the card, the **less** the AI fights for it.
- **Evidence:** `showNextCard():8868` sets `base = Math.max(20, Math.round(getPlayerPrice(p)*0.6))`
  where `getPlayerPrice = (bat*3 + bwl*3 + fld + fit) × rarityMult` (`:12088-12090`). `aiBid():8927`
  still uses a hardcoded `{common:200, uncommon:300, rare:450, epic:600, legendary:800}` and caps
  at `maxB = baseMax × rival.bidMult`, returning immediately if `newB > maxB` (`:8930`).
  Traced against the game's only legendary, Suresh Venkatesh (`:5377`, bat 72 / bwl 70 / fld 75 /
  fit 82): `getPlayerPrice = 583 × 2.5 = 1458` → **base 875**, `step = round(875 × 0.15) = 131`, so
  the first legal bid is **1006**. Rival ceilings (`RIVALS`, `:5390-5398`): Dilip Chadha
  `1.05 → 840`, Manoj Desai `1.1 → 880`, Gopal Reddy `1.2 → 960`. **Three of nine rivals can never
  place a single bid on the game's best card** — two of them can't even reach its base price.
  Same pattern for the epic all-rounder Mark Stevens (`:5384`): base 676, first bid 777, but epic
  ceiling × 1.1 = 660 and × 1.2 = 720. Meanwhile the epic *pace* bowler Andre Nortman (`:5365`,
  bat 5) prices at base 476 against the same 600-rarity ceiling — so the AI will chase a
  mid-tier pace card to 2.3× its base but the marquee all-rounder to only 1.6×.
- **Real cricket:** IPL auctions are defined by the marquee set triggering the fiercest bidding
  wars. Here the marquee lot is the one that goes quietly.
- **Severity:** 🟡

### Auction has no unsold lots, no rival purses, and no escalating increments
- **System:** Auction authenticity
- **Location:** `prototype/index.html:8870`, `:8924-8938`, `:9009-9015`
- **What:** Four separate departures from how an IPL auction actually runs.
- **Evidence:**
  1. **Nothing ever goes unsold.** `passBid():9013` — `if (!auction.bidder) auction.bidder =
     RIVALS[0].name;` — a lot with **zero** bids is still "sold" to Rajan Mehra at base price.
     Real auctions have an UNSOLD outcome and accelerated re-entry rounds.
  2. **Rivals have infinite money and no squad needs.** `aiBid()` (`:8924-8938`) reads only
     `rival.bidMult`, `rival.personality` and the rarity ceiling. No purse is tracked, no slots, no
     "this team already has four overseas quicks". A rival can win all 12 lots.
  3. **No head-to-head duel.** `var rival = RIVALS[Math.floor(Math.random() * RIVALS.length)];`
     (`:8925`) picks a fresh random franchise for *every single bid*, so the bid log reads as nine
     teams taking turns rather than two teams going toe-to-toe — the thing that makes an auction
     watchable.
  4. **Flat increment.** `auction.step = Math.max(20, Math.round(base * 0.15))` (`:8870`) is fixed
     for the whole lot. At base 875 the step stays 131 whether the bid is 1006 or 3000. Real IPL
     increments *escalate* in absolute terms (₹5L → ₹10L → ₹20L bands) as the price climbs.
- **Severity:** 🟡

### `getPlayerPrice` undervalues specialist fast bowlers
- **System:** Card valuation
- **Location:** `prototype/index.html:12088`
- **What:** `bat*3 + bwl*3 + fld + fit` weights batting and bowling equally and additively, so a
  gun quick with a single-digit bat rating is priced below a merely-good all-rounder.
- **Evidence:** Andre Nortman (`:5365`, epic, bwl **86**) → `15 + 258 + 44 + 80 = 397 × 2.0 = 794`.
  Mark Stevens (`:5384`, epic, bwl 65) → `222 + 195 + 68 + 78 = 563 × 2.0 = 1126`. The
  86-rated strike bowler is valued **29% below** a 65-rated all-rounder. The formula also weights
  `fld`, which the match engine never reads (see above).
- **Real cricket:** elite T20 quicks are the most expensive commodity in the IPL auction —
  Starc ₹24.75cr, Cummins ₹20.5cr in 2024. Wicket-taking pace is what teams overpay for.
- **Severity:** 🟡

---

## 🟢 Flavour nits

### Threes are ~7× too common
- **Location:** `prototype/index.html:9308` — `var triP = 0.03, dblP = 0.09;`. `triP` is never
  modified by pitch, phase, strategy or field. 3% of 120 balls = **~3.6 threes per innings**. Real
  T20 innings see 0-2, frequently zero — grounds are small and running three is rare. (`dblP` at
  9% is fine.)

### No toss
- **Location:** `prototype/index.html:10207` — `match.batting = Math.random() < 0.5 ? 'you' : 'opp';`
  and `match.youBatFirst` on the next line. There is no toss moment, no call, and no bat-or-bowl
  decision. In India the toss *is* part of the ritual, and "chose to bowl first, chasing under
  lights" is a real strategic lever this game already has the dew mechanic (`:9281`) to support.

### SEAMING and GREEN TOP are the same pitch
- **Location:** `prototype/index.html:9223-9228` — `'SEAMING': {pace:1.25, spin:0.65, bat:0.95}`
  and `'GREEN TOP': {pace:1.20, spin:0.80, bat:0.95}` are near-duplicates of one another. In
  cricket a green top *is* a seaming pitch. Four distinct surfaces would be better served by
  something like FLAT / TURNING / GREEN / TWO-PACED (slow, low, holds up) — the last of which is a
  genuine Indian-conditions archetype the game currently has no equivalent for.

### Squad cap of 15
- **Location:** `prototype/index.html:4505` — `maxSquad: 15`. IPL squads are 18-25. Harmless, but a
  fan knows the number.

### Auction order is budget-lots-first, IPL is marquee-first
- **Location:** `prototype/index.html:8829-8834`. The pool is the 12 rarest available cards
  (`:8829-8830`), then re-sorted **cheapest-first** (`:8834`). The inline comment says this is a
  deliberate playtest-driven fix for a day-one purse trap (2026-07-15), which is a fair call — but
  it is the inverse of a real IPL auction, which opens with the marquee set and *ends* with
  accelerated budget rounds. If authenticity is wanted back without reintroducing the trap, the
  real-world answer is the IPL's own: a small marquee set first, then budget lots, then an
  accelerated round.

---

## Confirmed authentic — checked and found genuinely cricket-true

These were read against the real rules and are correct. The founder should know they don't need
touching.

- **4-overs-per-bowler cap, live path.** `getBowlersAtOversCap():9159-9165` reads the real
  `scorecard[side].bowlers[].balls` tally and excludes anyone at `>= 24` balls. Enforced in
  `pickBowler():9169-9175` **and** greyed out with a "(4 overs bowled)" tag in
  `showBowlerPicker():9263-9274`. The thin-squad fallback (`if (underCap.length > 0)`) is a
  reasonable "restrict choice, don't break the match" call. The recently-fixed lineup branch
  (`:9187-9207`) now correctly picks the eligible lineup bowler with the **fewest balls bowled**,
  tie-broken by the player's chosen order — that rotates the whole lineup in order and cannot
  exceed the cap. ✅ (the *separate* bugs are the missing side-scoping and the skip path, above)
- **No consecutive overs, live path.** `simBall():10355` advances `match.lastBowler` before every
  auto-pick; `showBowlerPicker()`'s handler does the same (`:10301`) and disables the previous
  bowler with a "(just bowled)" tag (`:10269`, `:10274`). `switchInnings():10732` correctly clears
  `lastBowler` at the innings break so the new innings can open with anyone. ✅
- **Overseas cap of 4.** Enforced in three independent places and all three agree:
  `buildPlayingXI():9112`, `confirmSquadSelect():10109`, and the Impact Player picker
  (`:9446`, `:9457`). The Impact variant even matches the real IPL sub-rule (an overseas Impact
  Player only if the XI already has ≤ 3). ✅
- **Fielding restrictions copy.** `updateFieldRestriction():9088-9099` — "Powerplay — Max 2
  fielders outside ring" and "Max 5 fielders outside" for middle and death are exactly the T20
  laws. ✅
- **Over and ball notation.** `simBall():10367-10368` renders `over + '.' + (ballInOver + 1)`, and
  flips to `(over + 1) + '.0'` on the sixth ball — so the display runs 0.1 … 0.5, 1.0 … 20.0.
  Correct cricket notation, and 6 legal balls per over holds everywhere. ✅
- **Result margin.** `endMatch()`'s margin block (`:11030-11035`) says **runs** when you batted
  first and **wickets** (`10 - match.wkts`) when you chased. That's the right convention and a
  surprising number of games get it wrong. ✅ (caveat: super-over pollution, above)
- **Chase termination.** `simBall():10438-10441` ends the match the instant the chasing side passes
  the target (`runs > target`, not `>=`), and `switchInnings():10722` sets `target` to the first
  innings total with the display showing `target + 1` (`:10738`, `:10747`). Correct — you need one
  more than they made. Tie at the end of the chase correctly routes to the super over
  (`:10882-10883`). ✅
- **Innings termination.** `cWkts >= 10 || (over >= 19 && ballInOver === 5)` (`:10442`) — all out at
  10 wickets, or 20 overs completed. Correct. ✅
- **Strategy risk/reward.** `:9303-9307` applies `stratWktRisk` to `wktP` and `stratRunRisk` to
  `sixP`/`fourP` in the same direction for whichever side chose the strategy. Aggressive batting
  scores faster **and** gets out more; aggressive bowling takes more wickets **and** leaks more.
  The 2026-08-03 fix landed correctly and it's genuinely the right cricket trade-off. ✅
- **Field settings are bowling-side only.** `:9310-9311` guards both branches with
  `!isYourBatting` — you only set a field when you're bowling. Attacking = more wickets and more
  boundaries, defensive = fewer wickets, fewer boundaries, more twos (`dblP *= 1.20`). That's
  slips-vs-sweepers modelled correctly. ✅
- **Weather effects point the right way.** Overcast boosts **pace only** (`:9280`,
  `if (isPace) bwlStr *= 1.10`) — swing under cloud cover. Dew boosts batting in the **second
  innings only** (`:9281`) — a wet ball is harder to grip. Both are real, both are correctly
  scoped. ✅
- **Pitch types favour the right bowlers.** `:9223-9228` — SEAMING pace 1.25 / spin 0.65, TURNING
  pace 0.75 / spin 1.30, FLAT bat 1.10. Directionally exactly right. ✅
- **Phase shape.** `phaseBat = [1.3, 1.0, 1.4]` / `phaseBwl = [0.9, 1.1, 1.0]` (`:9221-9222`)
  produces a fast powerplay, a squeezed middle and an explosive death — traced at 12.3 / 9.1 / 12.1
  rpo for a strong side. That is the correct T20 shape. ✅
- **Innings totals land in a believable band.** Traced end-to-end: mid-tier squad ≈ **185/6**,
  strong squad ≈ **216/5**. Slightly hot at the top end but well inside "believable T20". ✅
- **Scorecard format.** `showScorecard():10505-10521` — batters as R/B/4s/6s/SR with a `*` for not
  out and a `(C)` captain tag, bowlers as O/R/W/Econ with overs rendered
  `Math.floor(balls/6) + '.' + (balls%6)`. Exactly how a real scorecard reads. ✅
- **Maiden detection.** `:10431` — `match.overRuns === 0` prints "MAIDEN!". Correctly tracked
  per-over via the `ballInOver === 0` reset at `:10404`. ✅
- **Commentary.** `COMM` (`:10460-10467`) is phase-aware and chase-aware, and the dismissal pool
  correctly names real modes — bowled, caught, edged-and-taken, LBW, **stumped**. No terminology
  errors found. ✅
- **Captain bonus.** `:9242-9243` now gates on the `captaincy` trait and scales with `leadership`
  (`leadership/2000` = 0-5%), falling back to 1.0 when there's no eligible captain. Matches GDD and
  is a sane size. ✅

---

## If only one thing gets fixed

**Scope `match.bowlerLineup` to your own side, and clear it at the innings break**
(`prototype/index.html:9187` and `:10720`).

It's the same family as the bug that motivated this audit, it's a handful of lines, and it's the
only finding here where a fan looking at the scorecard sees **their own players listed in the
opposition's bowling figures**. Every other 🔴 is a wrong rule; this one is the game contradicting
itself on screen. A minimal fix: add a side guard to the lineup branch
(`match.batting !== 'you'` means *you* are bowling, so the lineup applies; otherwise fall through
to the phase logic), and reset `match.bowlerLineup` alongside `match.lastBowler` in
`switchInnings():10732` — restoring it only for the innings in which you bowl.

**Runner-up, if a second slot exists:** assign `match.lastBowler` in `skipMatch()` at `:10778`
(one line). Skip is the path most players actually use, and right now the consecutive-over law
simply doesn't exist there.
