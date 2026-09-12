# Session Handoff — 2026-09-11

> Written at session end (context limit). Everything below is committed and pushed to `master`.
> Working tree was clean at handoff. **Read `docs/FINDINGS.md` first** — it is the living bug log
> and the authoritative list of what's open.

## What happened this session (in order)

1. **Resumed Cricket Underworld** — cleaned up leftover `_scratch/` files (turned out to be
   *tracked* in git, not untracked as the prior note claimed).
2. **Ran `/design-review`** on the completed no-vertical-scroll redesign → 5 agents, verdict REVISE.
   Fixed all findings.
3. **Fixed the Hub investigation+debt overflow** (271px/198px → true 0px, verified at 320/375/390).
4. **Built `docs/FINDINGS.md`** as a permanent living bug log, wired into `CLAUDE.md`'s Topic Docs
   table and the Session Protocol's end-of-session checklist.
5. **Whole-game UI/UX audit** (3 parallel agents, founder-requested): 37 findings (18🔴 12🟡 7🟢).
   **All 37 fixed** across ~10 commits.
6. **Deep SYSTEMS audit** (3 parallel agents: balance / economy / cricket): **21 🔴 open**, plus
   yellows/greens. Full evidence preserved in three permanent docs (see below).
7. **Started fixing the systems findings** — got through 3 of them before the session ended.

## Test status: GREEN

Full suite **232/232** at last full run. Both long-standing "environmental" flakes were fixed this
session — they were actually statistically under-powered tests (`LOGIC FIX 1` had been failing
intermittently since 2026-08-03 and was repeatedly written off). This is the first session where a
full run is unambiguously clean, which matters: with 2 intermittent failures, every regression run
needed manual triage — exactly how a real regression gets waved through as "just the known flake".

One flake deliberately NOT chased: `field placement setting appears in bowler picker` is genuinely
toss-dependent, `test.skip()`s safely, passes in isolation. Forcing the toss would mean stubbing
`Math.random` mid-`startMatch` where it isn't the only consumer — real risk, zero coverage gain.

## ⚠️ START HERE NEXT SESSION: 17 of 21 red systems findings still open

> **Update 2026-09-12 — items 1 and 2 of the "Still open" list below are DONE.**
> - **Morale gate** (`798d665`): `moraleMod` is now side-scoped to your team (`batMoraleMod` /
>   `bwlMoraleMod`); the super-over's hardcoded `70` became `GS.morale`.
> - **Three dishonest purchases** (`3aa21dd` + the purse commit): `media_contact` wired to its own
>   advertised effect; squad-full academy graduates are HELD instead of destroyed; and the purse
>   question went to the founder, who chose **purse = coins + seasonal sponsor bonus** — so the
>   sponsor ladder and the tribunal −20% now actually reach the auction, and `resolveCard` clamps
>   coins at 0 (which also closes the "rewarded ad can drive coins negative" misc finding).
>
> **TESTED — founder asked for a run. FULL SUITE GREEN: 240/240** (was 232; +6 new systems tests,
> +2 from earlier work). Re-run clean after the cleanStreak fix. Run in chunks by spec file, as
> this file recommends: comprehensive 132 (12.7m) · features-10k + zero-scroll + bugfix-09-09 40 ·
> p15-visual 28 · smoke + persona + bugfix-08-03 34 · systems-2026-09-12 6.
>
> **Infra gotcha that cost a full 14-min run:** a comprehensive run reported 74/132 with
> `ERR_CONNECTION_REFUSED` on every test after the first failure. That was the **dev server dying
> mid-run**, not a regression — it had been started with a backgrounded `&` inside a foreground
> command, which doesn't survive. Start it as a genuinely detached background task and `curl` it
> before trusting a long run.
>
> The 5 new tests were **verified non-vacuous**: each fix was temporarily reverted and all 5 failed
> against the old code, then passed again once restored. Worth keeping as the default bar — a
> regression test that has never been seen to fail is not yet evidence.
>
> Two smoke failures on the first run, neither a regression:
> - `Sponsor Break` encoded the OLD purse contract (`purse === coins + 300`), true only while
>   `startAuction` was wiping the ladder. Updated to `coins + purseBonus + 300`, plus a guard that
>   the bonus is non-zero so it can't degrade into testing a 0 no-op.
> - `bowler picker appears when bowling` passes in isolation — the known flake already in case law.
>
> **Correction banked:** `GS.sponsor` is NOT a per-season snapshot. `updateHub()` recomputes it from
> current alignment on every hub render, so the ladder bites from season 1 and the purse tracks
> alignment at the moment the auction opens. See finding 0 in `docs/FINDINGS.md` — founder call.
>
> Next up is item 3: `cleanStreak` never resetting across seasons.

**Read these three docs — they contain traced numbers and line citations, not assertions:**
- `docs/audit-2026-09-11-balance.md` (Monte-Carlo harness, 700–5,000 matches per cell — measured)
- `docs/audit-2026-09-11-economy.md` (full coin/gem/black-money source-sink table)
- `docs/audit-2026-09-11-cricket.md`

### Done this session (3 of 21)
| # | Finding | Commit |
|---|---|---|
| 1 | **Pack coin-printer** — 500 coins → ~1,124 resale, +624/flip forever. Fixed via `acqCost` provenance + `getSellPrice()`. Verified +624 → **−207** over 40 real cycles. 2 permanent regression tests added | `b3d27e3` |
| 2 | **Locked lineup bowled for the OPPOSITION** (verified in-browser both directions) | `a332db7` |
| 5 | **`skipMatch()` never set `lastBowler`** → consecutive overs on the default play path | `a332db7` |


### Still open — suggested order
1. ✅ **DONE 2026-09-12 (`798d665`, needs testing)** — 🔴 **Morale is a null stat that buffs your opponent.** `moraleMod = 0.9 + GS.morale/500` applied
   to whoever is batting with **no `isYourBatting` gate**, unlike every other side-scoped modifier in
   the same function. Measured win rate flat across morale 20/50/75/100 → the 150-coin Pep Talk buys
   nothing. Found independently by BOTH balance and cricket audits. `~:9236`, `~:9252`.
   *(Small diff, clearly correct — do this first.)*
2. ✅ **DONE 2026-09-12 (`3aa21dd` + purse commit, needs testing)** — 🔴 **Three dishonest purchases** (same class as the already-fixed scout bug):
   - `media_contact` (60 B$) has **zero implementation** — verified: one grep hit, its own definition.
   - Academy graduates **silently deleted** when squad is full, yet `endSeason` still prints
     "Academy Grad — <name>" after 300 coins and 2–3 seasons.
   - **Entire sponsor `purseBonus` ladder is dead code**: `endSeason` computes
     `auctionPurse = basePurse + sp.purseBonus` and the UI displays it, then `startAuction` does
     `GS.auctionPurse = GS.coins` and wipes it — along with the tribunal −20% penalty. That ladder is
     the alignment system's main economic payoff and has **never once applied**.
3. ✅ **DONE 2026-09-12 (`26b4b90`)** — 🔴 **`cleanStreak` never resets across seasons** — verified absent from `endSeason`'s reset list.
   Compounds to **+1,960 coins/win by season 14**. Fixed by adding it to the reset list (bounds the
   bonus at +150/win in a 15-match season). Added `GS.bestCleanStreak` so the "Clean Run" badge
   doesn't un-earn at rollover — mirrors the `GS.bestStreak` pattern "Hot Streak" already uses.
   Deliberately did NOT add a separate cap: the reset bounds it, and a ceiling would be an
   economy-balance call, not a correctness fix.
4. 🔴 **Aggressive batting still strictly dominant** despite the 2026-08-03 fix (+13.0 runs for +0.48
   wickets in an innings that only loses 4.7 — the trade-off can't exist while wickets are
   non-binding). Plus **"Contain" field is a free unlimited dominant button** (opponent 176 → 158,
   +12–14pp win rate).
5. ✅ **DONE 2026-09-12 (`47ff8a9`)** — 🔴 **DRS has no recency gate** — `batIdx` derives from wicket count, so it can resurrect a batter
   dismissed 10 overs ago. It's a "delete one wicket" button.
6. ✅ **DONE 2026-09-12 (`3cf284c`)** — 🔴 **XI validation requires neither a wicket-keeper nor a bowler** — a legal XI can have one man
   bowl all 20 overs.
7. 🔴 Misc: ~~rewarded-ad +300 purse boost can drive `GS.coins` **negative**~~ ✅ **FIXED 2026-09-12
   (`86f5503`)** — closed as a side effect of the purse decision, `resolveCard` now clamps coins at 0;
   ~~auction can **never offer a common or uncommon card**~~ ✅ **FIXED (`784460c`)**; (`slice(0,12)` off a rarity-desc
   sort → **58% of the pool is auction-invisible**); daily login pays ~7× more than winning a match;
   premium pass refunds 120 of its 150 gems (permanently self-funding).

### Two DESIGN decisions already made by the founder — not yet implemented
- **Rival strength**: base it on the **XI you actually field**, not the whole squad. Currently
  `generateRivalXI()` uses `getTeamStrength()` (squad average), so hoarding junk cards you never play
  makes the game easier — measured **85.8% → 98.2%** win rate by adding 4 junk cards. It punishes
  collecting, in a card-collection game. `~:9123`.
- **Archetypes**: make roles matter in `calcBallOutcome` (top-order strong in powerplay, middle-order
  under pressure, finishers at death, keepers get `fld` value). Currently `role` is read *only* for a
  pitch modifier, so Top-Order / Middle-Order / Keeper with equal `bat` are **byte-identical**, and
  `fld` is never read by the match engine at all.

## Useful context for whoever picks this up

- **Testing is founder-gated** per `CLAUDE.md` — don't run Playwright unless asked. (It was asked for
  repeatedly this session, hence the green suite.)
- **Dev server**: `npx serve prototype -l 8080`. Long full-suite runs can be killed by the
  environment (~8–12 min); run in chunks by spec file, as documented in `PROGRESS.md`.
- **Two recurring bug classes in this codebase — check for them by default:**
  1. *CSS cascade conflicts resolve per-property.* A compound selector beating a plain ID rule on
     just `padding` has now bitten three separate times. When an edit doesn't produce the height
     change you expect, read `getComputedStyle()` on the real element before trimming harder.
  2. *Comments, function names, `feature_list.json` and the GDD have each been caught asserting
     things the code doesn't do.* Verify against actual code, always.
- **A class-presence assertion is not proof a control is tappable** — learned when the new confirm
  sheet sat in the DOM at `z-index:216` under a `z-index:300` overlay, invisible to a class check but
  unreachable by a real finger. Use `elementFromPoint`.
