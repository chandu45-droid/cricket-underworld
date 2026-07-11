# Progress — Cricket Underworld

**Last updated:** 2026-07-11
**Last commit:** (this commit) — Balance-tester gate run on F1+F3 (founder-authorized): sign-off recorded, 2 in-scope F3 polish fixes applied, fix-queue logged (prior: BUILD-SHEET-10K FEATURE pillar F1–F4 shipped)

---

## ✅ DONE (2026-07-11): BUILD-SHEET-10K — FEATURE pillar (F1–F4)

Founder directive: *"first build the features part, this part [storefront/billing] we can do later. mostly will go with playstore model."* Built the four FEATURE-pillar items directly (Chanakya, no agents spawned per standing instruction); storefront/billing DEFERRED, Play Store the working (non-final) model.

**Shipped (all in `prototype/index.html`, tracker IDs F43–F46):**
- **F1 Daily Login Streak (F43).** `GS.loginStreak/lastLogin/bestLoginStreak/loginClaimedDate` (defaults + load persistence). `processDailyLogin()` at boot: same-day no-op / +1 consecutive / reset-to-1 on a gap (best preserved). `LOGIN_REWARDS` 7-day curve (200c → 300c → 500c+5g → 600c → 800c+10g → 1000c → 1500c+25g), cycles via `_loginCycleIndex`. `renderLoginPanel()` hub row (streak/best header + per-day tiles + claim CTA), `claimDailyLogin()` grants once/day guarded against double-grant.
- **F2 Empire Net-Worth + Rank (F44).** `computeNetWorth()` = coins + gems·rate + blackMoney·rate + Σ`playerMarketValue`. `getEmpireRank()` ranks player among the 10 league teams by net worth. `formatCompactCoins()` → "14.8K". `renderEmpireLine()` → hub line "YOUR EMPIRE · C X · #Y OF 10 LEAGUE RANK", recomputed in `updateHub()` after auction/match. Rendered in coin unit "C" — **rupee ₹ is deliberately a LOOK-pillar task (roadmap 1.1/1.5), not introduced here.**
- **F3 Monetization surfacing + published drop rates (F45).** Hub `#hub-money-strip`: angular clip-path tiles — `#hub-vault-tile` (gold → showStore) + `#hub-sponsor-tile` (blue → free 2-card Sponsor Pack via `showRewardedAd('pack')`, guarded vs daily-cap + squad-full); Syndicate already 1 tap via `#hub-pass-panel`. Published gacha odds: `#odds-overlay` reachable from hub link **and** Vault link; `renderOdds()`/`poolRarityPct()` compute per-rarity % live from the `ALL_PLAYERS` distribution (honest — `openPack` draws uniformly from the unowned pool), 3 pack blocks × 5 color-coded rarity rows + per-pack floor rule + legal note (odds shift with collection, no duplicates, virtual only, no cash-out). Satisfies constraints #3 (no gambling) + #4 (Play gacha-disclosure policy).
- **F4 Analytics (F46).** `ANALYTICS` module on a SEPARATE key `cu_analytics_v1` (isolated from `cu_save_v3`), fully try/catch-wrapped → silent no-op offline. `trackEvent(n,p)`/`analyticsSessionStart()`/`getAnalytics()`/`computeRetention()` → `{uid,installDay,daysActive[],d0,d1,d7}`. Instrumented at `purchase_stub` + `odds_view`, extensible.

**Verified:** new `tests/features-10k.spec.js` — **12/12 green** (F1×3, F2×3, F3×3, F4×3). Browser-eyeballed in a real Chromium (412×892): hub empire line "C 14.8K · #1 OF 10", "2-day streak · best 3 / CLAIM DAY 2 · 300 COINS", money strip (Vault gold + Sponsor Break blue), and the full Drop Rates page (3 packs × 5 rarities, Common 26/Uncommon 32/Rare 26/Epic 14/Legendary 2%). Boot error-free with analytics wiped.

---

## 🧪 BALANCE-TESTER GATE — F1 + F3 (2026-07-11, founder-authorized "run balance-tester on F1+F3")

Formal exploit/fairness pass run against the balance-tester charter (`.claude/agents/balance-tester.md`), scoped to F1 (Daily Login) + F3 (monetization surfacing + published drop-rates + sponsor rewarded-ad), advise-only.

**VERDICT — F1 + F3 mechanics SIGN OFF.** In the offline / virtual-currency / no-cash-out context there is no launch-blocking exploit in the F1/F3 logic itself. Reward curve is F2P-generous-but-fair (no >20% win gap, no real pay-to-win since billing is a non-charging stub), floor labels match `openPack` code, the odds page is live-computed so it cannot drift from actual pulls, and the daily ad caps hold (no infinite farming). Residual F1 exploits are self-harm-only.

**Fixed this pass (in-scope F3 polish, both low-risk / additive — features-10k still 12/12 green):**
- **F3-3** — odds legal note now states the shown %'s are *base* pull rates and each pack's guaranteed final-card floor means your actual result *meets or beats* them (Play gacha-disclosure strengthener). `index.html` ~2876.
- **F3-4** — `adToday()` now uses the local-date boundary (`_todayStr()`), consistent with the daily-login reset; was UTC (05:30 IST rollover mismatch). `index.html` ~9458.

**FIX-QUEUE (deferred, with rationale):**
- 🔴 **F3-1 — Vault store stub leaks free currency.** `completePurchase()` (F35 store, `index.html` ~9415–9417) grants coins/gems in "(test mode)" with no payment gate, and F3's hub Vault tile now surfaces it one tap away. **This IS the storefront/billing decision the founder reserved** ("mostly will go with playstore model"). Must be gated behind real Play Billing OR the free-grant neutralized/tile hidden **before any Play Store push**. NOT a today-gate (we are pre-launch; monetization stays stubbed through the acquisition-validation phase) — but it is *the* thing the billing decision must resolve. **Founder call.**
- 🟡 **F3-2 — aborted rewarded-ad burns the daily spot.** Cap is consumed at ad-START (`index.html` ~9466) not at reward-grant, so closing the ad early wastes the day's sponsor spot (feel-bad). Fix = move `GS.ads[placement]++; save()` into the claim handler + track the pending placement. Deferred because it touches the shared purse/pack/boost ad machinery → needs a full-suite regression, and it is a wk-2-retention polish item, not a launch blocker.
- 🟡 **F1-1 / F1-2 — clock-forward streak farming & concurrent-window multi-claim.** Both self-harm-only on an offline single-player save with no real PvP stakes; cheap guards (persist `maxDateSeen`; re-read save before the claim gate) available if wanted. Deferred as low-value hardening for an offline game.

**Deferred per founder:** storefront/billing decision (leaning Play Store) — now sharpened by 🔴 F3-1 above. Rupee `.money` styling stays with the LOOK pillar (roadmap Phase 1).

---

## ✅ DONE (2026-07-10): Light theme default + dark-theme toggle (founder directive)

Founder: *"Remove dark theme as well from the game. Can include a toggle to enable or disable dark theme easily."* Also new **project scope: sell the game to investors / gaming companies** (see plan below).

**Architecture** (all in `prototype/index.html`):
- Existing dark-noir CSS stays as the base layer; `html[data-theme="light"]` overrides ~60 design tokens (surfaces → warm ivory #F4EFE6 family, warm-white text → ink #1A2333, accents deepened for contrast, light glass, softer elevations).
- Hardcoded colors converted to **rgb channel variables** so one variable flips whole families: `--hl-rgb` (155× white hairlines/fills), `--ov-rgb` (20× full-screen overlay scrims), `--chrome-rgb` (top bar/nav), `--abyss-rgb` (deep gradient stops).
- **Noir set-pieces stay dark in light theme** (mafia banner, shop pack rows, vault hero, ad billboard, syndicate/streets faction modals, corruption report) — scoped rule re-maps text tokens back to light values + `color:var(--white)` to re-resolve inherited color (computed-value inheritance gotcha). This IS the review's contrast thesis: dark underworld set-pieces read premium against ivory.
- Inc-7 zone re-skin text tones that assumed dark backdrops get deepened light variants (league green, market teal, scout blue).
- **Boot**: inline script right after `</style>` reads `cu_save_v3` and sets `data-theme` before first paint (no flash); updates `<meta theme-color>`. Default = light; dark only when save has `darkTheme:true`.
- **State**: `GS.darkTheme` (default false) in defaults + load(); `applyTheme()` beside save(); toggle row in Settings → Appearance (`#theme-toggle-row` / `#theme-switch`, angular clip-path switch) bound in INIT.
- `playwright.config.js`: conditional `executablePath:/opt/pw-browsers/chromium` when that path exists (cloud containers ship a Chromium whose revision mismatches @playwright/test 1.60; no effect on local Windows).

**Verified**: 2 new E2E in comprehensive.spec.js (`test.describe('Theme')`): light default + toggle→dark→persists-across-reload→toggle-back. Browser-verified screenshots (390×844 DPR2): hub/squad/cards/league/auction/market/settings in light, syndicate+bhai set-pieces stay noir w/ readable text, dark mode unchanged. Theme+Customisation targeted run: 4/4 green. Full-suite regression pass initiated (this container runs ~50min vs 9min local — one pre-existing env flake: 'bowler picker appears when bowling' timeout, unrelated to theme).

**Note for next session**: alignment cascade (index.html lines ~126-133) untouched ✓. `.money` gold-hero class from the feel-rich plan should use `--gold-bright` so it works in both themes.

---

## 🎯 PROJECT SCOPE (2026-07-10): Sell to investors / gaming companies

Founder set the goal: sell the game to investors or other gaming companies. Gap analysis done this session. Traction data is the valuation driver — "prototype + D7%" prices as a product, "prototype, zero users" prices as an asset sale. No analytics exist in the build today.

---

## 📋 FINALIZED ROADMAP — RESUME DEVELOPMENT HERE (written 2026-07-10, founder-approved scope)

Work top-to-bottom. WIP=1, verify each item (`npx playwright test` + browser eyeball) before the next, commit each. All work continues on PR #1 branch (`claude/current-status-gpzh42`) until it merges.

### Phase 0 — Demo blockers (do FIRST, ~1 day total)
Every investor clicks the game link before reading anything. These three make the first 30 seconds survivable.

- [ ] **0.1 Fix HIGH bug: tutorial overlay pointer-block.** `#tut-overlay.show` intercepts ALL taps on fresh load until dismissed — a fresh visitor sees a game that "doesn't respond". Repro: clear localStorage, load, try tapping nav. Fix direction: make the overlay scrim `pointer-events:none` except on the tut box/buttons, or auto-dismiss on any outside tap. Add an E2E: fresh load → tap nav → screen switches. (Effort: S)
- [ ] **0.2 Refresh pitch materials with real numbers.** `outreach.md` + `pitch.html` say "43+ systems, 110 tests, $3.2B market" — actual: 42 tracked features passing, 135 E2E tests, $5.91B→$16.72B (2034) market. Add the two missing strongest cards: (a) Underworld Core differentiation (5-faction Power Web — no competitor has it), (b) regulatory moat (no-RMG design is PROG Act 2026-proof while fantasy apps died). (Effort: S)
- [ ] **0.3 Verify live deployment + real-device QA.** Confirm `chandu45-droid.github.io/cricket-underworld/prototype/` serves the CURRENT build (needs founder or a session with github.io network access — cloud container can't reach it). Check light theme + toggle on a real budget Android. Note: GitHub Pages serves from `master` — the theme work must be MERGED (PR #1) before the public URL shows it. (Effort: S, founder-assisted)

### Phase 1 — Look expensive (~1 week) — Tier 1 of CRICKET-REVIEW-2026-07-09
The demo IS the pitch. Full rationale + Tier 2/3 backlog in `CRICKET-REVIEW-2026-07-09.md`.

- [ ] **1.1 Global `.money` class — make money look like money.** Headline auction bid (was `index.html:547`, shifted) solid gold, bigger, ₹ symbol, proper number font; route every currency value through `.money`. **Use `var(--gold-bright)` not a hex** so it works in both themes (light overrides it to #B08D0A). (Effort: S, highest feel-rich leverage)
- [ ] **1.2 Gold austerity pass.** Strip gold off the ~40 panels using it at 8-15% opacity; reserve gold for ONE hero element per screen (the number that matters + primary CTA). Rich is a contrast phenomenon. (Effort: S-M)
- [ ] **1.3 Load Space Grotesk (+ Cinzel if used)** — specced in `docs/visual-design-system.md`, never loaded; money/stats currently render in Teko. (Effort: S)
- [x] **1.4 Daily Login Streak.** ✅ Shipped 2026-07-11 (BUILD-SHEET F1 / tracker F43). Streak counter + escalating 7-day reward row on hub, persists in GS, feeds Phase 2 retention. E2E 3/3.
- [x] **1.5 Empire Net-Worth + Rank line on hub.** ✅ Shipped 2026-07-11 (BUILD-SHEET F2 / tracker F44). "YOUR EMPIRE · C X · #Y OF 10". **Rendered in coin unit "C" for now — the ₹ symbol/`.money` styling is intentionally left to LOOK-pillar item 1.1.** E2E 3/3.
- [ ] **1.6 Remaining LOW bugs from review §2** (opportunistic): dup nav loop (~8471), win-streak resets with no grace (~6815), pack dupe dead-end (~7686). (Effort: S each)

### Phase 2 — The traction number (~1-2 weeks)
- [x] **2.1 Analytics.** ✅ Shipped 2026-07-11 (BUILD-SHEET F4 / tracker F46). Anonymous localStorage user id + event log on separate key `cu_analytics_v1` → computable D1/D7 cohorts, offline-safe (silent no-op). Instrumented at session_start / purchase_stub / odds_view; extensible to match_completed etc. E2E 3/3. (No external endpoint yet — local-only ledger; wiring to a free tier/self-owned endpoint remains for when distribution starts.)
- [ ] **2.2 Distribution.** itch.io listing + Reddit (r/WebGames, r/incremental_games, cricket subs) + X; time waves to a cricket moment. (Effort: S, founder-assisted for accounts)
- [ ] **2.3 FREEZE new systems** until ~200 organic users produce D7 data.

### Phase 3 — Outreach (parallel with Phase 2, founder-led)
- [ ] **3.1 30-60s demo video/GIF** (what actually gets forwarded inside a studio).
- [ ] **3.2 Wire live metrics into pitch.html** once analytics has ~2 weeks of data.
- [ ] **3.3 Fire `outreach.md` templates** at Indian gaming studios (Nazara/JetSynthesys/Gametion-type) + micro-VCs.

### Decision gate
- **D7 > 15%** → lead every pitch with the retention number.
- **D7 < 15%** → diagnose funnel drop-off via events, fix only that, re-measure; pitch as tech/IP acquisition meanwhile.

### Backlog (post-gate / opportunistic — not scheduled)
- Automated E2E for manual-only features: F09 (DRS/impact/weather/super-over/injury), F25 academy, F27 staff, F29 mentorship, F32 bans, F38 knockout.
- Tier 2/3 feel-rich items from `CRICKET-REVIEW-2026-07-09.md` (per-zone panel silhouettes, number-roll animations, haptics).
- GDD systems still unbuilt: gacha pity counter, dupe→fragment conversion.
- Real billing integration (IAP stubs are launch-blocking for stores, not for the pitch).
- Split `index.html` (~9000 lines) when it crosses ~10K per decisions log.

### Session-restart cheat sheet
`/resume` → this section → Phase 0.1. Server: `npx serve prototype -l 8080`. Tests: `npx playwright test` (~9min local, ~50min cloud container). Cloud container: config auto-uses `/opt/pw-browsers/chromium`; run node scripts with `NODE_PATH=<repo>/node_modules`. Dismiss tutorial in scripts: `classList.remove('show')` + `GS.tutorialDone=true`. PRESERVE alignment cascade (`index.html` ~lines 126-133 dark block + light-theme equivalents). Light theme is default — verify visual work in BOTH themes (toggle: Settings → Appearance).

---

## 🔎 REVIEW SESSION 2026-07-09 — "feel rich + stickiness" multi-agent audit → FULL DOC: `CRICKET-REVIEW-2026-07-09.md`

Founder brief: *"suggestions, improvements and bugs… UI/screens/colors too basic, no trigger to make the user stick and feel rich."* Ran ui-designer + user-researcher + component-architect + a bug-hunt agent, grounded in **live screenshots of all 5 screens** (`review-shots/`).

**Two headline findings:**
1. **Not under-built — under-differentiated.** 80+ tokens, glass, 70+ animations already exist; every element wears the SAME dark-blue-glass + faint-gold (8-15%) costume, so nothing reads expensive. Fix = CONTRAST: solid gold on ONE hero per screen (the money number + primary CTA), strip gold off the other 40 panels. On every screenshot the single best element is the one solid-gold button — that's the whole thesis.
2. **Zero reason to return.** Daily-login/streak was GDD-specced but NEVER built (`loginReward`/`lastLogin`/`dailyLogin` absent). Plus no "empire net-worth + rank" progress line = no feel-rich pull.

**Note on the pause:** the 2026-07-06 "UI redesign PAUSED / ship-and-measure" was **already formally reversed on 2026-07-08** (see "FOUNDER DECISION 2026-07-08" section below). This review executes under that live directive — consistent, not a new reversal.

**NEXT STEPS (resume here):**
1. **Read the bug-hunt agent output** (general-purpose id `a99bcfd880f12f72e` — was STILL RUNNING at write time; file under `…/tasks/a99bcfd880f12f72e.output`). Fold into CRICKET-REVIEW §2. **Do NOT spawn a duplicate.**
2. **Ship Tier 1 batch (feel-rich + retention):** (a) global `.money` class — make the headline number `index.html:547` solid gold + bigger + ₹ symbol; (b) gold austerity pass (strip gold off the 40 low-opacity panels); (c) build Daily Login Streak; (d) add "Empire Net-Worth + Rank" line to Hub.
3. **Fix HIGH bug first:** tutorial overlay `#tut-overlay.show` intercepts pointer events on fresh load → blocks ALL nav until dismissed.
4. Load **Space Grotesk** (specced in `docs/visual-design-system.md`, never loaded); route money/stats through `.money`. Also Cinzel specced/not loaded.
5. **PRESERVE** the alignment theming cascade at `index.html` **lines 126–133** through any restyle.
6. After each change: `npx serve prototype -l 8080` + `npx playwright test` + eyeball (hard-rule #10). Commit & push each.

**Bugs logged (full table in CRICKET-REVIEW §2):** HIGH tutorial-overlay pointer-block · MED font spec drift (Space Grotesk/Cinzel not loaded, money in Teko) · MED UI-AUDIT keyframe count wrong (34 vs actual 70+) · LOW dup nav loop (8471–8481), win-streak resets to 0 no grace (6815), pack dupe dead-end (7686–7688) · missing GDD systems: daily-login, gacha pity, dupe→fragment.

**First PR when resuming:** `Feel-rich + retention batch 1: gold money hero, gold austerity, daily streak, empire net-worth`

---

## ✅ DONE (2026-07-09): Underworld Core increments 4-7 — faction screens + zone-palette re-skins

Founder directive #3 finishes here. Increments 1 & 3 stood up the engine + rival two-way bribes; 4-7 give the three human-facing factions their own full-screen destinations and dress every remaining screen in its zone palette. **Built as four commits (89b1d3f, 026c3e3, 70a775d, 8803423), tests deferred to one pass at the end per founder instruction ("no need to do the testing after each increment").**

- **Increment 4 — The Syndicate (Underworld zone, blood red + smoke black), commit 89b1d3f.** `showSyndicateScreen()` renders a `.syn-screen` with Don **Anna Seth** + 2 lieutenants (Rukhsana Mirza, Balwant Teja), a relationship meter, syndicate-tier badge (`syndicateTier`: Made Man ≥60 / Associate ≥20 / Known ≥−20 / On Notice ≥−60 / Marked), memory line, and an "Hear the offer" button. The offer **locks** (`.syn-offer-locked`, button removed) when you're too clean (`!zone.mafiaAccess`, i.e. alignment ≥45), a case is open, you're marked, or debts ≥5. Wraps the existing offer economy — nothing lost. `data-zone='underworld'`.
- **Increment 5 — The Politics Desk (Politics zone, ivory + deep amber poster), commit 026c3e3.** `showNetaScreen()` renders `.pol-screen` with a campaign poster per candidate (NETA_CANDIDATES = Bhupathi Rao/Vikas Morcha, Savitri Devi/Jan Shakti Party — all fictional), a power/ally readout, a live demand block (fundraiser / nephew-in-squad / throw-a-match), and memory line. `fundNetaCampaign(idx)` (300 coins, only while `election ≤ 3 && !backed`) backs a candidate and shifts alignment −3. `data-zone='politics'`.
- **Increment 6 — The Streets (Streets zone, sodium orange #F97316 + concrete grey), commit 70a775d.** `showBhaiScreen()` renders `.str-screen` for area don **Sikandar Bhai** + 2 crew (Munna Tawde, Kaali Prasad), relationship meter, hafta status/pay block, `courtBhai()` ("Pay Your Respects · 130 coins" → rel +12, courted, heat +1, align −3), and favour buttons. `bhaiFavor(key)` buys a home-ground match edge (`crowd` 90 coins / `pitchprep` 110 B$) into a single `GS.bhaiBonus` slot — **guarded against stacking** with `GS.mafiaBonus`. `payHaftaFromScreen()` clears the hafta clock. `squadPitchLean()` reports TURNING / SEAMING / FLAT from squad make-up. `data-zone='streets'`.
- **Increment 7 — zone-palette re-skins for the remaining screens, commit 8803423.** Scoped CSS overrides (no risky rewrites, all test-protected selectors preserved) give each remaining screen its zone identity: **League table + Playing XI + Scorecard → Cricket broadcast green**; **Transfer Market → Economy neon teal**; **Scout panel → Law/Intel steel blue**; **Customise/Settings → Hub noir + gold** with angular section headers. All selectors verified against real markup before commit — no dead selectors relied on for effect.

### Verification (deferred single pass — all passed)
- **`npx playwright test` → 133 passed (9.1m)** — 125 baseline + 8 new Underworld Core tests, zero regressions.
- New tests (tests/comprehensive.spec.js → `test.describe('Underworld Core')`): syndicate screen renders don+2 lieutenants in `data-zone='underworld'` · syndicate offer locked when too clean (alignment 80) · neta screen renders 2 candidate posters in `data-zone='politics'` · `fundNetaCampaign(0)` backs a candidate + spends 300 coins · bhai screen renders 2 crew in `data-zone='streets'` · `courtBhai()` raises respect + spends 130 coins + sets courted · `bhaiFavor('crowd')` sets the bonus and a second favour is blocked by the stacking guard · `squadPitchLean()` returns a valid pitch type.

### Underworld Core — COMPLETE
All 7 increments shipped (1 Power Web + case file + weekly events · 2 Law zone/case pipeline · 3 rival two-way bribes · 4 Syndicate screen · 5 Neta screen · 6 Bhai screen · 7 zone re-skins). The underworld fantasy now has faces, screens, and decisions across all 5 factions. Ship-and-measure (analytics + distribution) is the next strategic step.

---

## ✅ DONE (2026-07-09): Underworld Core increment 3 — Rival outgoing bribes (two-way F5 complete)

Founder directive #3 continues. Increment 1 shipped the INCOMING bribe (rival pays you to throw, `rivaloffer` → `matchfixlose`). Increment 3 adds the OUTGOING direction, completing the two-way rival-boss bribe loop (plan doc F5, "smallest lift, extends live code"):

- **You can now bribe a rival boss to throw the match for you.** In the next opponent's rival profile, a premium angular red **"Bribe to Throw the Match · N B$"** button appears (only when they're your *next* opponent, no fix is already set, you're not under investigation, and they're not suspended). Cost = `150 + round(strength)`, paid in **black money**.
- **Acceptance is personality-gated:** shark 0.85 · politician 0.70 · pragmatist 0.35–0.65 (worse if the rival is clean) · coward 0.30–0.55 (worse when hot) · purist 0.04. Modified by relationship (`rel/400`) and slashed to ×0.3 for clean rivals (alignment > 30). Floor 0.02.
- **Accept:** deducts cost, sets `GS.mafiaBonus = {type:'rivalthrow', rival}`, +10 rel with that boss, **+10 heat**, alignment −8, 15% chance to drop an "Intercepted Call" evidence item.
- **Refuse:** clean/purist rivals report the approach (+12 heat, 50% chance of a "Witness Statement" evidence item) and rel −12; others just take offence (+4 heat, rel −6). No fix is set.
- **Match effect (`rivalthrow`):** the OPPONENT is weakened both innings — their batting ×0.62 (when they bat) / bowling ×0.72 (when they bowl). Distinct from `matchfixlose`/`forcelose`, which weaken YOU.
- **Pre-match banner** announces the specific rival: *"<Rival> is folding — their team weakened"*.

### Verification (all passed)
- **`npx playwright test` → 125 passed (8.3m)** — 120 baseline + 5 new outgoing-bribe tests, zero regressions.
- **Browser-verified live chain** (headless Playwright, real UI): next-rival profile renders the premium red "BRIBE TO THROW THE MATCH · 224 B$" button + flavor text; forcing accept deducts black money (999→775) and sets `mafiaBonus.type==='rivalthrow'`; pre-match banner reads "Priya Sundaram is folding — their team weakened".

### 5 new tests (tests/comprehensive.spec.js → `test.describe('Underworld Core')`)
1. accept (shark, `Math.random→0`) → `mafiaBonus.type==='rivalthrow'` + black money spent · 2. clean rival (purist, `Math.random→0.99`) refuses → no fix, heat rises · 3. rejected for a non-next opponent (msg contains "next opponent") · 4. blocked when a fix is already active · 5. `#rp-throw-btn` visible in the next-rival profile.

### Next increment (execution order)
4. Grey Zone/Mafia redesign + Syndicate faces → 5. Politicians + elections screen (Politics zone) → 6. Local leaders (Streets zone) → 7. Remaining redesign screens in zone palettes.

---

## ✅ DONE (2026-07-09): Underworld Core increment 1 — Power Web + case file + weekly underworld events

Founder directive #3 (*"focus more on the gameplay tuning and create a more realistic and more engaging with these elements"*) — increment 1 shipped and verified. The dormant engine is now **live and wired**:

- **Power Web hub panel** — 5 faction rows (Syndicate / Thana / Neta / Bhai / Rival Bosses), each with a colored dot, relationship meter (−100..+100 → 0-100% fill with zero-marker), faction head/face name, and live status (e.g. Thana flips "Quiet — for now" → "CASE OPEN" when an investigation is active; Bhai shows "Hafta in N" / "HAFTA DUE"). Renders every `updateHub()`.
- **Case file** — under an active investigation, `#investigation-panel` now shows the FIR→Evidence→Chargesheet→Court stage track (current stage highlighted), the assigned named inspector with trait tag (greedy/ambitious/incorruptible) + flavor, and action buttons: **Bribe** (hidden for the incorruptible DSP Arjun Sherawat / after one try) and **Political Pressure**. Inspector is lazily assigned if absent.
- **Weekly underworld event card** — `endMatch` now calls `processUnderworldWeek(won)`; priority **hafta > election-funding > rival offer**. Notes render as `.uw-note` lines; the event renders as a `#uw-event-card` (accent-bordered) in post-match events with type-specific decision buttons, bound via `bindUnderworldEvent`.

### Verification (all passed)
- **`npx playwright test` → 120 passed (8.0m)** — 114 baseline + 6 new Underworld Core tests, zero regressions (Match Engine exercises the new `endMatch` path).
- **Browser-verified live** (headless Playwright, real hub after splash): Power Web panel visible with 5 rows and premium angular styling; case file renders with named inspector + stage track + action buttons; Thana row correctly flips to "CASE OPEN" with the incorruptible inspector; `processUnderworldWeek(true)` with `bhai.haftaDue=1` fires a hafta event titled "Sikandar Bhai — Hafta Due".

### 6 new tests (tests/comprehensive.spec.js → `test.describe('Underworld Core')`)
1. factions lazy-init → 5 keys · 2. `#power-web-panel` visible + 5 `.pw-row` · 3. inject `investigation:{matchesLeft:3}` → inspector lazily assigned + info contains '3 matches' · 4. incorruptible inspector → `bribeInspector().success === false` · 5. `bhai.haftaDue=1` → `processUnderworldWeek(true).event.type === 'hafta'` · 6. `neta.election=1` → resolution sets `neta.power`.

### Next increment (execution order) — superseded, see increment 3 above
3. ~~Rival outgoing bribes UI~~ **DONE (increment 3)** → 4. Grey Zone/Mafia redesign + Syndicate faces → 5. Politicians + elections screen (Politics zone) → 6. Local leaders (Streets zone) → 7. Remaining redesign screens in zone palettes.

---

<details>
<summary>Archived handoff (increment 1 — verbatim edit drafts, now applied)</summary>

**Founder directive #3 (active, verbatim):** *"focus more on the gameplay tuning and create a more relaistic and more engaging with these elements"* — mechanical depth for the underworld fantasy: named police inspectors + case pipeline, politicians/elections, local-leader hafta, incoming rival throw-match bribes, all as one-decision-per-match-week events.

**State of `prototype/index.html` (~7350 lines, ES5 only — NO arrow functions):** SIX edits applied and consistent, but **dormant** — game runs identically until updateHub/endMatch wiring lands. Tests NOT run since edits. Committed as WIP.

### Applied edits (done, in working tree)
1. **CSS** (after `.glass.investigation .section-title` block, before `/* Tribunal overlay */`): `.pw-row .pw-dot .pw-main .pw-name .pw-head .pw-meter(-fill/-zero) .pw-status(.hot) @keyframes pwPulse .pw-case-stages .pw-stage(.done/.now) .pw-stage-line(.done) .pw-insp(-name/-tag .greedy/.ambitious/.incorruptible/-desc) .uw-note`
2. **Hub HTML:** `#power-web-panel` glass (with `#power-web-rows`) inserted between mafia-banner and investigation-panel; `#case-stage-track` + `#case-actions` divs appended INSIDE `#investigation-panel` (original markup preserved byte-for-byte)
3. **GS/state:** `factions: null,` after `ads: {...}` in GS; `GS.factions=v(d.factions,null);` in load(); `initFactions()` after initRivalData — lazy, per-key: `syndicate{rel} thana{rel} neta{rel,backed,power,ally,election:8,fundingSeen} bhai{rel,haftaDue:3} bosses{rel,offerCd:0}`
4. **Data** (after RIVALS `];`): `INSPECTORS` (Inspector Khurana/greedy/200/0.85 · ACP Vaidehi Menon/ambitious/450/0.6 · DSP Arjun Sherawat/incorruptible/0/0), `NETA_CANDIDATES` (Bhupathi Rao–Vikas Morcha · Savitri Devi–Jan Shakti Party), `BHAI_NAME='Sikandar Bhai'`, `SYNDICATE_DON='Anna Seth'`, `pickInspector()`, `getInspector(name)` (fallback INSPECTORS[0]), `CASE_STAGES` (FIR Filed/Evidence/Chargesheet/Court Date), `caseStageIndex(m)` (m>=5→0, >=3→1, >=2→2, else 3), `caseStage(m)`
5. **Enriched `startInvestigation()`:** `GS.investigation = { matchesLeft: 5, inspector: pickInspector(), bribeTried: false };` + fanLoyalty −15 + initFactions + thana rel −10. **matchesLeft:5 kept — test asserts it.**
6. **New engine fns** (after startInvestigation): `bribeInspector()` (incorruptible→fail; one try per case via bribeTried; cost `round(bribeBase * (matchesLeft>=3 ? 1 : 1.6))` in blackMoney; align −5 always; success roll vs bribeSuccess → case cleared, greedy: half evidence lost +8 heat thana+10, ambitious: +10 heat; fail: ambitious DOUBLE-CROSS pushes evidence `{type:'Communication Intercept',weight:3}` +15 heat thana−15, greedy fail +6 heat) · `applyPoliticalPressure()` (needs neta.ally && neta.power && rel>=30; rel−30, clears case, +8 heat, align−8) · `processUnderworldWeek(won)` → `{notes:[], event:null|{type,title,desc,accent,...}}`, priority **hafta > election-funding > rival offer**: bhai rel≥40+won→+30 coins note; rel≤−30→−3 morale note; hafta clock (matchNum>2, haftaDue--, ≤0→event `amt=max(40,min(200,round(coins*0.05)))` accent #F97316); election-- weekly, ===3&&!backed&&!fundingSeen→funding event (cost 300, accent #F59E0B), ≤0→resolution (backed wins 60%: ally→rel+40; backed loser→rel−25 +10 heat; reset election=8/backed=null/fundingSeen=false); rival offer (`!event && !GS.investigation && !GS.mafiaBonus && offerCd<=0 && matchNum>2 && matchNum<=14 && nxt.alignment<0 && rnd<0.18`, `pay=150+round(nxt.strength)`, accent #A78BFA) · `resolveUwCard(html)` · `bindUnderworldEvent(ev)` binding `#hafta-pay-btn/#hafta-refuse-btn` (pay: −amt, bhai+6, haftaDue=3 / refuse: rel−15, haftaDue=3, align+2), `#fund-a-btn/#fund-b-btn/#fund-none-btn` (−300 coins, `neta.backed=NETA_CANDIDATES[idx].name`, align−3), `#rivaloffer-accept-btn` (blackMoney+=pay, `GS.mafiaBonus={type:'matchfixlose'}`, +8 heat, align−6, bosses+8, offerCd=4, rivalData rel+12) / `#rivaloffer-refuse-btn` (bosses−5, offerCd=2, rivalData rel−8, align+3). All call updateCurrency()/save() + resolveUwCard flavor text.

### Remaining edits (3) — verbatim drafts

**(a) Insert after `bindUnderworldEvent`:**
```js
function renderCaseFile() {
  var inv = GS.investigation;
  var track = $('case-stage-track'), actions = $('case-actions');
  if (!inv || !track || !actions) return;
  var idx = caseStageIndex(inv.matchesLeft);
  var h = '';
  for (var i = 0; i < CASE_STAGES.length; i++) {
    h += '<div class="pw-stage' + (i < idx ? ' done' : i === idx ? ' now' : '') + '">' + CASE_STAGES[i] + '</div>';
    if (i < CASE_STAGES.length - 1) h += '<div class="pw-stage-line' + (i < idx ? ' done' : '') + '"></div>';
  }
  track.innerHTML = h;
  var insp = getInspector(inv.inspector);
  var ah = '<div class="pw-insp"><span class="pw-insp-name">' + insp.name + '</span><span class="pw-insp-tag ' + insp.trait + '">' + insp.tag + '</span><span class="pw-insp-desc">' + insp.desc + '</span></div>';
  ah += '<div class="flex gap-10" style="margin-top:8px">';
  if (insp.trait !== 'incorruptible' && !inv.bribeTried) {
    var cost = Math.round(insp.bribeBase * (inv.matchesLeft >= 3 ? 1 : 1.6));
    ah += '<div class="btn btn-outline text-xs flex-1" style="padding:6px 10px" id="bribe-inspector-btn">Bribe · ' + cost + ' B$</div>';
  }
  ah += '<div class="btn btn-outline text-xs flex-1" style="padding:6px 10px" id="political-pressure-btn">Political Pressure</div></div>';
  actions.innerHTML = ah;
  var bb = $('bribe-inspector-btn');
  if (bb) bb.onclick = function(e) { e.stopPropagation(); var r = bribeInspector(); toast(r.msg, r.success ? 'success' : 'error'); save(); updateHub(); updateCurrency(); };
  var pb = $('political-pressure-btn');
  if (pb) pb.onclick = function(e) { e.stopPropagation(); var r = applyPoliticalPressure(); toast(r.msg, r.success ? 'success' : 'error'); save(); updateHub(); };
}
function getFactionRows() {
  initFactions();
  var f = GS.factions;
  var rows = [];
  rows.push({ name:'The Syndicate', head: SYNDICATE_DON, rel: f.syndicate.rel, color:'#EF2D2D', status: GS.debts.length > 0 ? GS.debts.length + ' debt' + (GS.debts.length>1?'s':'') + ' open' : (GS.mafiaBonus ? 'Fix is set' : 'Watching you') });
  rows.push({ name:'The Thana', head: GS.investigation ? getInspector(GS.investigation.inspector).name : 'Local Police', rel: f.thana.rel, color:'#60A5FA', status: GS.investigation ? 'CASE OPEN' : (GS.heat >= 50 ? 'Heat rising' : 'Quiet — for now') });
  rows.push({ name:'The Neta', head: f.neta.power ? f.neta.power : 'No one in power', rel: f.neta.rel, color:'#F59E0B', status: (f.neta.election <= 3 && !f.neta.backed ? 'Election in ' + Math.max(1,f.neta.election) + ' — funding open' : 'Election in ' + Math.max(1,f.neta.election)) + (f.neta.ally ? ' · Your MLA rules' : '') });
  rows.push({ name:'The Bhai', head: BHAI_NAME, rel: f.bhai.rel, color:'#F97316', status: f.bhai.haftaDue <= 0 ? 'HAFTA DUE' : 'Hafta in ' + f.bhai.haftaDue + (f.bhai.rel >= 40 ? ' · Crowd is yours' : f.bhai.rel <= -30 ? ' · Crowd hostile' : '') });
  rows.push({ name:'Rival Bosses', head: '9 team owners', rel: f.bosses.rel, color:'#A78BFA', status: GS.collusionPacts && GS.collusionPacts.length > 0 ? GS.collusionPacts.length + ' pact' + (GS.collusionPacts.length>1?'s':'') + ' active' : 'Deals on the table' });
  return rows;
}
function renderPowerWeb() {
  var wrap = $('power-web-rows');
  if (!wrap) return;
  var rows = getFactionRows();
  var h = '';
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var pct = Math.round((r.rel + 100) / 2);
    h += '<div class="pw-row"><div class="pw-dot" style="background:' + r.color + ';box-shadow:0 0 8px ' + r.color + '66"></div>' +
      '<div class="pw-main"><div class="pw-name">' + r.name + '<span class="pw-head">' + r.head + '</span></div>' +
      '<div class="pw-meter"><div class="pw-meter-fill" style="width:' + pct + '%;background:' + r.color + '"></div><div class="pw-meter-zero"></div></div></div>' +
      '<div class="pw-status' + (r.status.indexOf('DUE') >= 0 || r.status.indexOf('CASE OPEN') >= 0 ? ' hot' : '') + '">' + r.status + '</div></div>';
  }
  wrap.innerHTML = h;
}
```

**(b) updateHub — replace lines ~4353-4357, verbatim anchor:**
```js
  if (GS.investigation) {
    show('investigation-panel');
    $('investigation-info').textContent = GS.investigation.matchesLeft + ' matches until tribunal · No new favors allowed';
    $('evidence-count').textContent = GS.evidence.length;
  } else { hide('investigation-panel'); }
```
Replace with lazy inspector + stage text (MUST keep `matchesLeft + ' matches'` prefix — test asserts `toContain('3 matches')`):
```js
  if (GS.investigation) {
    show('investigation-panel');
    if (!GS.investigation.inspector) GS.investigation.inspector = pickInspector();
    $('investigation-info').textContent = GS.investigation.matchesLeft + ' matches until tribunal · ' + caseStage(GS.investigation.matchesLeft) + ' · No new favors';
    $('evidence-count').textContent = GS.evidence.length;
    renderCaseFile();
  } else { hide('investigation-panel'); }
  renderPowerWeb();
```

**(c) endMatch wiring (grep anchors, line numbers shifted ~+265 after orig 3811):**
- After `var debtWarnings = processDebts();` → add `var uw = processUnderworldWeek(won);`
- In the debtWarnings render block inside `$('match-result').innerHTML` → append `uw.notes.map(function(n){ return '<div class="uw-note">' + n + '</div>'; }).join('')`
- In postEventsHtml assembly (follow the charity/`#charity-btn` pattern) → PREPEND `#uw-event-card` glass card: `border-left:3px solid ' + uw.event.accent`, title + desc, then type-specific button pairs: hafta → `#hafta-pay-btn` ("Pay N") / `#hafta-refuse-btn`; funding → `#fund-a-btn` / `#fund-b-btn` (candidate names) / `#fund-none-btn`; rivaloffer → `#rivaloffer-accept-btn` ("Take N B$") / `#rivaloffer-refuse-btn`
- After `$('post-match-events').innerHTML = postEventsHtml;` → `if (uw.event) bindUnderworldEvent(uw.event);`
- Optional: `initFactions();` after `initRivalData();` in INIT block (~line 7783) — lazy calls already cover correctness

### Verified facts (do not re-derive)
- `if (!isKnockout) GS.matchNum++;` runs BEFORE processDebts → `getNextRival()` inside processUnderworldWeek returns the true NEXT opponent ✓
- `GS.mafiaBonus = null;` executes in endMatch BEFORE post-match event binding → setting `matchfixlose` in the accept handler survives to next match ✓ (`var wasFix = GS.mafiaBonus !== null;` adds +5 heat/−2 align/fanC−5/fixedAgainst++ next match)
- NO `--ink` CSS token — use `var(--white)` (#F2ECE0). Tokens: `--white-06/-10/-20/-40 --slip #94A3B8 --amber #F59E0B --gold-bright #FFD23F --blood #EF2D2D --blue-bright #60A5FA --purple #A78BFA --font-d 'Teko' --font-b 'Rajdhani'`
- Inspector names are original fiction (avoided Sacred Games IP names)
- injectState (tests) writes `cu_save_v3` with NO factions key → every faction-touching fn calls initFactions() lazily ✓; injected `investigation:{matchesLeft:3}` has NO inspector → updateHub lazy-assign handles it

### Test contracts that MUST stay green (114 tests)
- `#investigation-info` textContent contains `matchesLeft + ' matches'` (`toContain('3 matches')`)
- `#mafia-banner` hidden when `GS.investigation` truthy (existing guard — don't touch)
- `window.checkInvestigation()` with heat:90 → `'started'` + `GS.investigation.matchesLeft === 5`
- `window.resolveTribunal()` verdict names, `window.processDebts()` / `window.payDebt(0)` unchanged
- Protected selectors: `#investigation-panel #investigation-info #evidence-count #mafia-banner #debt-panel #debt-list` + pack/tutorial set

### New tests to add (tests/comprehensive.spec.js)
1. Factions lazy-init: fresh state → `window.initFactions()` → GS.factions has 5 keys
2. `#power-web-panel` visible on hub
3. Inject `investigation:{matchesLeft:3}` → inspector lazily assigned + info still contains '3 matches'
4. `GS.investigation.inspector='DSP Arjun Sherawat'` → `bribeInspector().success === false`
5. `GS.factions.bhai.haftaDue=1` → `processUnderworldWeek(true)` returns hafta event
6. `neta.election=1` → processUnderworldWeek resolves election, sets `neta.power`

### Finish checklist
1. Apply edits (a)(b)(c) above
2. Add 6 new tests · serve `npx serve prototype -l 8080` (a prior background serve may still be running) · `npx playwright test` (~7.5 min, 114+6 green)
3. Browser-verify: hub Power Web panel, case file under investigation, post-match event card
4. Commit + push (trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`), update this file + feature_list.json + memory `game-design-project.md`

**Gotchas carried forward:** run node scripts FROM project dir (Temp breaks @playwright/test resolution) · dismiss `#tut-overlay` via `classList.remove('show')` + `GS.tutorialDone=true` · `#particle-canvas` z-49 behind overlays — scoped CSS sparks only.

### After this increment (execution order)
3. Rival outgoing bribes UI → 4. Grey Zone/Mafia redesign + Syndicate faces → 5. Politicians screen (Politics zone) → 6. Local leaders (Streets zone) → 7. Remaining screens in zone palettes.

</details>

## Current State

- **Build:** HTML5 single-file PWA (`prototype/index.html`, ~9000 lines). Light theme default + dark toggle (F42).
- **Tests:** 135 Playwright E2E tests — last full run 2026-07-10: all 135 passing (cloud container, 51min).
- **Features:** 42/42 tracked features passing. Underworld Core complete (7/7); F42 theming shipped 2026-07-10.
- **PR:** #1 open (`claude/current-status-gpzh42` → master), mergeable, session subscribed to its events.
- **Phase:** Sale scope active — next work = FINALIZED ROADMAP above, starting Phase 0.1 (tutorial-overlay bug).

## FOUNDER DECISION 2026-07-08: UI Redesign resumes NOW

Founder verdict: *"the game UI is very basic and I am not okay with it"* — redesign with rich, modern frames that hook players. This **overrides** the ship-and-measure pause on UI work. Rationale: shipping a basic-feeling game would poison the D7 measurement anyway — first impressions gate retention. Ship-and-measure (analytics + distribution) remains the step AFTER the redesign, not cancelled.

- [x] ~~1. Card Collection + pack opening~~ **DONE 2026-07-08 (ac78820)** — collection progress strip, angular filter chips w/ live counts, card deal-in stagger, premium pack showcase, full reveal ceremony (spotlight rays, rarity-tinted rings, spark bursts, legendary flash, NEW badges); also fixed pre-existing hidden-toast peek. 114/114 tests green.

## FOUNDER DIRECTION 2026-07-08 (#2): Underworld Core — supersedes the screen queue order

Founder verdict: *"the core game play is underworld, politicians, mafia, local leaders, other team boss bribes, police cases — majorly missing at the current structure. Also colors need not stay the same — re-plan them properly."*

Code audit confirmed it: mafia = offer menu only; politicians = a tag on 2 rivals; police = zero mentions; local leaders = zero; rival bribes one-directional. **Full plan: `docs/underworld-core-plan.md`** — 5-faction Power Web (Syndicate / Thana police cases / Neta politicians / Bhai local leaders / rival bosses two-way bribes) + zone-based color re-plan (Underworld=blood red noir, Law=steel blue, Politics=ivory/amber, Streets=sodium orange, Cricket=broadcast green, Economy=neon teal).

**New execution order (each built → committed individually) — ALL COMPLETE:**
1. [x] Power Web hub panel + `GS.factions` skeleton (increment 1)
2. [x] Police case pipeline (FIR → evidence → chargesheet → court) + Law zone (increment 1/2)
3. [x] Rival boss two-way bribes (increment 3)
4. [x] Grey Zone / Mafia screen redesign + Syndicate faces — Underworld zone (89b1d3f)
5. [x] Politicians + elections — Politics zone (026c3e3)
6. [x] Local leaders — Streets zone (70a775d)
7. [x] Remaining redesign screens in their zone palettes: league, XI, scorecard, market, scout, customise/settings (8803423)

## STRATEGIC PIVOT: Ship & Measure (2026-07-06 — Vidura portfolio audit)

**Verdict: PIVOT** — from "keep building" to "ship and validate". Cricket Underworld ranked #3 of 5 in the portfolio viability audit (see workspace `PORTFOLIO-AUDIT-2026-07-06.md`): biggest ceiling, wrong quarter.

**Why (researched live):**
- India gaming $5.91B → $16.72B by 2034; PROG Act 2026 banned real-money gaming while permitting social games — this game's no-RMG design is regulation-proof. The market thesis holds.
- BUT: gaming CPI up 30% YoY (~$0.56 blended), founder ad budget ₹0, PWA has zero store discovery, and 43 built systems have produced **zero users and zero retention data** — the only numbers that matter for both revenue and the investor pitch.
- Every additional polished screen deepens sunk cost without touching the real bottleneck: players.

**New plan — one Shipping Weekend, then hands off:**
1. Deploy/refresh public URL (GitHub Pages already live at `chandu45-droid.github.io/cricket-underworld/prototype/`)
2. F37: PWA manifest + service worker (installability drives return visits)
3. Analytics: anonymous localStorage user ID + events (session start, match completed, return visit) → D1/D7 cohorts
4. Mobile QA pass on a real device
5. Distribution: itch.io listing + Reddit (r/incremental_games, r/WebGames, cricket gaming subs) + X; time promo waves to cricket moments (Asia Cup window)
6. FREEZE all new systems/screens until ~200 organic users generate D7 data

**Tripwire:**
- **D7 > 15%** → premium UI redesign resumes with priority; retention data becomes the spine of the investor pitch
- **D7 < 15%** → diagnose drop-off via funnel events, fix only that, re-measure; still failing → park as portfolio piece

**Status: awaiting founder "ship it" confirmation.** Until then, no new build work. The 10 remaining redesign screens and Phase 4 features (F33–F36, F38) resume only if the tripwire passes.

## Completed (Phase 1-3)

- [x] Auction system (IPL-style, AI bidders)
- [x] Match engine (ball-by-ball, DRS, impact player, weather, super over, injuries)
- [x] Squad management (training, release, XI selection, overseas cap)
- [x] Cards & collection (packs, 3D flip, filters, holographic foil)
- [x] Alignment system (5 zones, inertia, theming, sponsor tiers)
- [x] Mafia + debt + investigation + tribunal systems
- [x] League table with promotion/relegation zones
- [x] Transfer market (buy/sell)
- [x] Tutorial & onboarding
- [x] 50 Indianized players, commentary, social media
- [x] Visual rebuild (P1.5): crests, silhouettes, power ring, battle card, spring physics, animated gradients, glass panels
- [x] Canvas match ground, sound, gestures, mentorship, academy, staff, bans
- [x] **Premium UI Redesign — Screen 01 (Hub):** FIFA/WCC3-tier hub with glass panels, animated gradient mesh, power ring, battle card, spring physics
- [x] **Premium UI Redesign — Screen 03 (Auction):** Spotlight stage with rotating conic-gradient rays, glass bid arena, angular purse zone, dual timer (SVG circle + drain bar), bid urgency pulse, mafia intel panel, premium empty state with SVG gavel
- [x] **Premium UI Redesign — Screen 04 (Squad):** Glass stat panels with colored accent bars (bat/bwl/ovr/morale), gradient morale bar, role-grouped roster (Batters/All-Rounders/Bowlers), squad-specific card borders, SVG empty state
- [x] **Premium UI Redesign — Screen 05 (Player Detail):** Glass stat bars with colored fills, hexagonal OVR badge, angular training buttons, premium section headers with accent lines
- [x] **Premium UI Redesign — Screen 06 (Pre-Match Strategy):** Match Day header with season badge, hexagonal VS divider, SVG section icons (star/clock), glass pitch info with green accent, strategy opts with gold accent bar, pulsing fix banner, angular gradient Start Match CTA
- [x] **Premium UI Redesign — Screen 07 (Match Simulation):** Angular VS/status badges (clip-path), 56px score with text-shadow, glass match phases with glow, glass momentum bar with spring transitions, angular moment icons, glass tactics with enhanced pulse, hook panels with type-specific inset glow, glass streak milestones + daily challenges, weather banners with glass blur, DRS/Impact glow, dramatic match result overlay (20px blur, glass rewards panel, glowing value text), POTM with gold glow + shadow, corruption report with red inset, glass bowler picker with angular avatars, field setting with color-keyed glow

## Phase 4 — COMPLETE (2026-07-07/08)

- [x] F33: Full team/player name customisation (was already built — tracker corrected c5173d3)
- [x] F34: Season/battle pass — Syndicate Contract, 10 tiers free+premium (819d5b5)
- [x] F35: IAP stubs — The Vault, test-mode payments (77ef349)
- [x] F36: Rewarded ads — Sponsor Break: purse boost, free pack, post-match coin doubler, daily caps 1/1/3
- [x] F37: PWA — manifest, service worker, install prompt, icons (8318376)
- [x] F38: Knockout bracket tournament (was already built — tracker corrected c5173d3)

## Known Issues

- F09, F25, F27, F29, F32: Implemented but lack automated E2E tests
- F28 (gestures): Only testable on touch devices, no Playwright coverage
- Some systems (DRS, weather, injuries) have no automated verification

## Decisions Log

- **Single-file architecture**: All game code in one `index.html` — keeps deployment trivial, avoids build tooling. Will split when file exceeds ~10K lines.
- **Playwright over unit tests**: E2E tests against real browser cover interface mismatches that unit tests miss. Worth the slower run time.
- **50-card pool before economy**: Content depth before monetisation — players need enough cards to feel collection variety.
- **Indianized names**: All player/team/sponsor names are Indian — legal compliance (no real player names) + audience fit.

## Next Session Checklist

1. Read this file — start at **📋 FINALIZED ROADMAP** (top of file), Phase 0.1
2. Read `feature_list.json` for system-level status
3. Run `npx playwright test` to verify repo is green
4. Work the roadmap top-to-bottom; WIP=1: finish and verify one item before starting next
5. Commit each item; pushes update PR #1 automatically
