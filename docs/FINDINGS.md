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

### Hub overflows under simultaneous investigation + debt
- **Found:** 2026-09-11, while building the permanent zero-scroll regression test.
- **What:** `#hub-screen` (both Play and Club tabs) exceeds the zero-vertical-scroll invariant when
  a player is under investigation **and** has an active debt at the same time — a fully plausible
  real game state, since both systems are heat/alignment-driven and can coexist. League, Cards, and
  Squad all stay at genuine 0px even under the same stress state; this is Hub-specific.
- **How confirmed:** Isolated each condition independently at a correct 844px viewport height (see
  the height-methodology note below): full squad alone = 0px overflow (confirms the original
  redesign's "genuine 0px" claim holds); + investigation alone = +60 to +133px; + debt alone = +38 to
  +110px; + both together = +198 to +271px. Not caused by the 2026-09-10/11 sessions' work — the
  clean baseline state (no investigation, no debt) still hits true 0px on current code.
- **Likely cause:** the original redesign's verification passes tested investigation and debt as
  separate cases, never combined.
- **Current status:** pinned as a regression ceiling in `tests/zero-scroll.spec.js` (so a future
  change can't silently make it worse) — not fixed. **Needs a founder call:** further Hub trim, or
  accept as an edge case?

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
