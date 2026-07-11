# Build Sheet — Cricket Underworld → $10k Sellable Asset

**Owner of record:** Chanakya (orchestrator) · **Goal:** raise the defensible sale value from ~$1.5k (cold code asset) to **$10k** · **Written:** 2026-07-11

> This sheet **sequences and assigns** the founder-approved FINALIZED ROADMAP in `PROGRESS.md`. It does not replace it. Every item below has an **owner agent**, a **done-criterion** (binary, testable), an **effort** tag, and the **buyer-rationale** (why this specific work moves the price). Work top-to-bottom, WIP=1, `npx playwright test` + browser eyeball before each next item, commit each. Continues on PR #1 branch until merge.

---

## 1. The $10k math (so we build the right things)

| State | Price basis | Realistic value |
|---|---|---|
| Polished code, **zero** traction | "nice niche template" | ~$1.5k–3k (ceiling) |
| Polished + monetization-ready + **small real signal** (few-k installs, ₹8k–25k/mo or even less at a multiple) | revenue-ready product at a 20–35× monthly multiple | **$10k reachable** |

**Conclusion:** $10k is **not** a polish target — it is a *"revenue-ready + lightly proven"* target. Look and features are the price of entry to earn the traction signal that actually closes $10k. Three pillars, in order: **LOOK → FEATURE (monetization + retention) → PROOF.**

---

## 2. What already exists (de-risks the target)

Good news that changes the plan — a lot of the expensive pillar is **already built**:

- ✅ **Monetization plumbing exists as stubs:** The Vault (IAP, test-mode) · Sponsor Break (rewarded ads, daily caps) · Syndicate Contract (10-tier battle pass). *Real billing is launch-blocking for stores, NOT for a sale/pitch.*
- ✅ **Core-loop screens are premium** (Hub, Auction, Squad, Player, Pre-Match, Match Sim) · secondary screens carry zone palettes.
- ✅ **Depth is done:** 42/42 tracked features, Underworld Core (5-faction Power Web) complete, 135 E2E tests green, PWA installable, light/dark theme.

**So the real remaining work is narrow:** a *contrast* look-pass (not new screens), a retention hook, analytics, and a distribution push. The build below is tighter than a from-scratch plan.

---

## 3. Pillar 1 — LOOK (make it read "expensive" in the first 30 seconds)

Finding from `CRICKET-REVIEW-2026-07-09.md`: **not under-built, under-differentiated** — every element wears the same dark-glass + 8–15% gold costume, so nothing reads premium. The fix is **contrast**, not more screens.

| ID | Task | Owner agent | Done-criterion | Effort | Why a buyer pays |
|---|---|---|---|---|---|
| L1 ✅ | **Global `.money` hero class** — headline currency solid gold, bigger, coin unit (`C`), proper number font; route every currency value through it. Use `var(--gold-bright)` (works both themes). | ui-designer | **SHIPPED 2026-07-11** — `.money`/`.m-cur`/`.m-val` + `.hero`/`.mid` modifiers routed through hub net-worth (`#empire-value`), auction purse (`#auction-purse`), match payout (new `.match-payout` hero); one dominant gold number per screen; verified solid visible gold on BOTH themes (light `rgb(176,141,10)` / dark `rgb(218,165,32)`, never transparent); suite green (150/150, 2 unrelated flakies pass on re-run). Note: spec said "₹ symbol" but in-game currency is coins (`C`) — `₹` stays reserved for the real-money store (compliance). | S | First thing a buyer notices; "money looks like money" = perceived value |
| L2 ✅ | **Gold austerity pass** — strip gold off the ~40 low-opacity panels; reserve gold for ONE hero + primary CTA per screen. | ui-designer | **SHIPPED 2026-07-11** — audited ~50 low-opacity gold instances (2 shades). Classification: gold that DUPLICATES an on-screen gold hero OR stands ALONE as decoration/hover/over-glow = **STRIP** (7 panels/states de-golded → neutral `rgba(var(--hl-rgb),0.xx)`: auction-purse-zone, strategy-opt.selected, pd-train-opt:hover, hub Season-Progress panel, hub-win-streak tile bg, season-complete panel, card-filter.active). Gold in a **multi-hue parallel** (each item = its own category hue) = SEMANTIC → **KEEP**; also kept: monetization wayfinding, rarity/achievement, atmospheric stage-lighting, "your row" wayfinding, and the one hero + btn-gold CTA per screen. Verified both themes (hub/auction/squad/league shots in `docs/l2-evidence/`): each core screen now has exactly one focal gold — hub=empire value, auction=purse (mid-auction)/money CTA, squad=hue-coded stat tiles, league="your row". Suite green (152/152, prior flakies p15-visual+smoke both passed). | S–M | Rich is a contrast phenomenon; makes the whole game look designed, not templated |
| L3 ✅ | **Font pass — decide: re-add or drop the specced fonts (Space Grotesk + Cinzel).** | ui-designer | **DECIDED 2026-07-11 → DROP (do not re-add).** Reconciled a live conflict: v2 depth-recipe port already cut Space Grotesk/Cinzel (`visual-design-system.md` §3.1, ~100-150KB saved, tier-2/3 India), while `CRICKET-REVIEW-2026-07-09` #5 said "Teko numbers read cheap → load a proper number face." Both **agree numbers shouldn't be Teko**; they only differ on the fix. Chose the ratified prescription: **already-loaded Rajdhani tabular** solves it at zero network cost — adding Space Grotesk (fintech face) + Cinzel (serif) would cost render-blocking weight AND push the game off its Indian-cricket-broadcast identity. Captured the real defect the review named: routed dense stat-grid values (`.player-card .stat-val`, `.pd-stat-row .stat-val`) from Teko `--font-d` → **Rajdhani `--font-b` + `tabular-nums`** (now matches doc §3.1/§3.2). Hero/dramatic numbers (`.money`, scores) stay Teko by deliberate L1 choice = intentional two-tier numeric system. Verified both themes (`docs/l3-evidence/`): stat grids read data-grade, no layout break; suite green (152/152). | S | Typography is 50% of "premium feel" for near-zero effort |
| L4 ✅ | **Juice pass** — card-reveal, win/loss celebration moment, screen transitions, SFX/haptic on key taps. | player-experience | **SHIPPED 2026-07-12.** Audit-first (game already heavily juiced): 4 named moments verified/closed — card-reveal (packBurst/cardFlip/revealRing already animate; +haptic), screen transitions (staggerIn already re-fires on `.active`; SFX.tap already fires), **win** already celebrates (+haptic), **loss** was SFX-only → added `#outcome-flash.loss` red radial burst + `screenShake()`. Real gaps closed: **haptics** (`navigator.vibrate` was absent) → `buzz()` layer wired into 15 SFX methods with distinct patterns; **`prefers-reduced-motion`** was absent → media query kills animation + `_reduceMotion` guards on buzz/screenShake/spawnCelebration (a11y + 60fps-budget-Android valve). **purseShimmer restored** (L1-parked) with L1 case-law mitigations: saturated-gold stops + light-theme peak override + solid fallback + `.m-cur` pinned → screenshot-verified `C 5,000` legible on BOTH themes. Suite **152/152** green. | S–M | Perceived value per rupee is highest here; makes the demo feel alive |
| L5 ✅ | **First-60-seconds reel polish** — splash → onboarding → first match win path is flawless. | player-experience | **VERIFIED 2026-07-12 (audit-first, no fix needed — reel already clean).** Drove the FULL live chain (not parts, per CORE-MEMORY #13) on both themes at 390×844: **splash** SETTLED wordmark = rich legible gold on ivory / pale-gold on near-black (earlier "washout" was a FALSE ALARM — captured at 400ms before `.t2 fadeUp 0.5s` delay had started; re-shot at 1500ms settled = clean, so per evidence-before-diagnosis #8 NO override applied); **hub reveal** clean crossfade; **6-step tutorial** all advance, zero dead taps, auto-dismiss, 0 errors; **auction** landing+live clean/premium; **win celebration** = real match driven to a deterministic **"Victory"** via god-squad (99) vs seeded trash `GS.scoutedXI` (1) injected at prematch — screenshot-verified Victory overlay on BOTH themes (letterspaced gold wordmark, full score line + margin, MATCH PAYOUT hero, complete Grey-Zone rewards panel, angular panels, no clipped/overlapping text), **0 console/page errors** both runs. Temp specs removed; suite green **152/152**. | S | The sale is won in the first minute; this IS the trailer |

**Gate:** balance-tester + player-advocate eyeball the core loop in both themes before moving to Pillar 2.
**LOOK PILLAR COMPLETE (L1–L5 ✅, 2026-07-12).** The first-30/60-seconds premium pass is done end-to-end. Next: gate eyeball, then Pillar 2 (FEATURE — retention + revenue-ready).

---

## 4. Pillar 2 — FEATURE (retention + revenue-ready)

This is what generates the Pillar 3 signal. Monetization plumbing exists — the gaps are **retention** and **surfacing** what's already there.

| ID | Task | Owner agent | Done-criterion | Effort | Why it moves the price |
|---|---|---|---|---|---|
| F1 | **Daily Login Streak** — GDD-specced, never built (`loginReward`/`lastLogin`/`dailyLogin` absent). Streak counter + escalating reward row on hub; persists in GS; feeds retention data. | game-designer + economy-architect | New E2E: day-2 return increments streak + grants reward; persists across reload; balance-tester signs off on reward curve | M | The #1 "reason to return" lever; directly lifts D1/D7 = the multiple |
| F2 | **Empire Net-Worth + Rank line on hub** — "Your empire: ₹X · Rank #Y of 10" (squad value + coins + assets). | game-designer | Line renders live, updates after auction/match; E2E asserts value recompute | S | The feel-rich progress pull; gives a long-term goal so players don't quit day 3 |
| F3 | **Surface + polish existing monetization** — make Vault / Sponsor Break / Syndicate Contract visible and demoable in the core loop (entry points, not buried). Confirm rewarded-ad loop *feels* real end-to-end. | economy-architect | A buyer can reach each of the 3 monetization surfaces within 2 taps of the hub; rewarded-ad stub grants reward; gacha rates page visible (Play policy) | S–M | Buyers pay a **premium** for revenue infrastructure that's visibly ready to scale — even at tiny current revenue |
| F4 | **Analytics** — anonymous localStorage user ID + event log (session_start, match_completed, return_visit, tutorial_done, purchase_stub) → computable D1/D7 cohorts. Free tier (PostHog/Plausible) or self-owned endpoint; must not break offline PWA. | in-session build (events defined by economy-architect) | Events fire and are queryable; D1/D7 computable from real data; offline PWA still loads | M | You literally cannot sell at a multiple without showing the numbers |

**Gate:** balance-tester runs an exploit/fairness pass on F1+F3 (reward loops are the classic exploit surface) before ship.

---

## 5. Pillar 3 — PROOF (the multiplier — this closes $10k)

Everything above exists to earn this. Without it: ~$3k ceiling. With it: real multiple.

| ID | Task | Owner agent | Done-criterion | Effort | Why |
|---|---|---|---|---|---|
| ✅ P0 | **DONE** — Fixed demo blocker: tutorial-overlay pointer-block. Scrim now `pointer-events:none` even when shown (nav taps pass through); `.tut-card` re-enabled only via `.show .tut-card`; `goScreen()` auto-dismisses onboarding on any nav; swipe handlers moved to the card. 3 new E2E tests (fresh-install → 1 nav tap switches screen + dismisses; scrim pointer-transparent; Skip still works). Full suite **152 green**. | in-session build | ✅ E2E: fresh load → tap nav → screen switches; scrim never swallows taps | S | A buyer's first click must work or the deal dies in 5 seconds |
| P1 | **Verify live deployment + real-device QA** — confirm `chandu45-droid.github.io/.../prototype/` serves the CURRENT build (needs PR #1 merged to master); check theme + toggle on a real budget Android. | founder-assisted | Public URL shows current build; screenshots from a real device attached | S | The link IS the pitch; it must be the polished build, not a stale one |
| P2 | **Distribution** — itch.io listing + Reddit (r/WebGames, r/incremental_games, cricket subs) + X; time a wave to a cricket moment. | sanjaya (channel research) + founder | Listed on itch.io; ≥3 seed posts live; UTM/referrer visible in analytics | S (founder-assisted) | Turns "zero users" into a retention curve you can price |
| P3 | **Collect the signal** — freeze new systems until ~200 organic users produce D7 data. | Chanakya (tracking) | ≥200 users OR 2 weeks of data, whichever first; D7 computed | — | The number that reprices the whole asset |
| P4 | **30–60s demo video/GIF** — what actually gets forwarded inside a studio. | player-experience + founder | Video renders the first-60s reel + one underworld decision + a win; <60s | S | The artifact that travels; sits atop `pitch.html` |
| P5 | **Wire live metrics into `pitch.html`** once ~2 weeks of data exist; refresh `outreach.md` with real numbers. | in-session build | pitch.html shows live D1/D7 + install count; outreach.md numbers match reality | S | Data-backed pitch = the difference between $3k and $10k |

---

## 6. Sequencing & calendar

```
P0 (blocker) → L1 L2 L3 (look, ~1wk) → L4 L5 (juice/reel) → F1 F2 (retention)
→ F3 (surface money) → F4 (analytics) → [balance-tester gate] → P1 (deploy+QA)
→ P2 (distribute) → P3 (collect ~2wks) → P4 P5 (video + live pitch) → LIST
```

- **Build phase (P0 → F4):** ~4–6 focused weeks, AI-assisted + founder review.
- **Proof phase (P1 → P3):** ~2–8 weeks of live traction to have a signal worth showing.
- **Honest total to a *defensible* $10k listing:** ~6–14 weeks, front-loaded on build, back-loaded on waiting for the number.

---

## 7. Decision gate (from the roadmap — kept)

- **D7 > 15%** → lead every pitch with the retention number; list at the top of the $10k band; approach Indian studios (Nazara / JetSynthesys / Gametion-type) + micro-VCs.
- **D7 < 15%** → diagnose funnel drop-off via events, fix only that, re-measure; meanwhile pitch as a tech/IP acquisition, not a growth asset.

---

## 8. Do-NOT list (protects the timeline)

- ❌ Don't redo all 16 screens. Core loop is already premium; secondary screens carry zone palettes. The look fix is a **contrast pass**, not new screens.
- ❌ Don't build real billing integration — it's launch-blocking for stores, **not** for a sale/pitch. Stubs are enough to demo "revenue-ready."
- ❌ Don't add new systems during P3 (the freeze). More depth ≠ more price; the signal does.
- ❌ Don't cold-sell before P3. Selling pre-signal caps you at ~$3k.
- ❌ Don't break the PWA offline path with analytics.

---

## 9. Pre-commit validation (before spending the 6 weeks)

Two agents pressure-test the **target**, not the plan, on the founder's say-so:

- **vidura** — verdict on "$10k is achievable via this exit" against live comps + realistic buyer pool. PROCEED/PIVOT/KILL + salvage.
- **sanjaya** — live comps: recent Flippa/Codester HTML5 + cricket/strategy-game sale prices, itch.io traction benchmarks, Indian gaming-studio acquisition signals.

Run these **first** if the founder wants the number de-risked before the build weeks begin.

---

## 10. Agent roster (who owns what)

| Agent | Owns |
|---|---|
| **ui-designer** | L1 L2 L3 (look/contrast/typography) |
| **player-experience** | L4 L5 P4 (juice, first-60s reel, demo video) |
| **game-designer** | F1 F2 (retention mechanics) |
| **economy-architect** | F1 reward curve, F3 monetization surfacing, F4 event schema |
| **balance-tester** | Gate after Pillar 1 and after F1/F3 (exploit/fairness) |
| **player-advocate** | Core-loop QA sweep; find broken/dead flows before demo |
| **sanjaya** | P2 channel research; §9 comps |
| **vidura** | §9 target verdict |
| **Chanakya** | Sequencing, done-criteria verification, P3 tracking |
| **in-session build** | P0, F4, P5 (engineering with schema from the design owner) |
```

---

## 11. DECISION — Path C (revenue-business build) · locked 2026-07-11

**Pre-commit validation ran (§9). Verdict: Vidura = PIVOT; Sanjaya comps confirmed it.** At ₹0 revenue this asset prices as *code* (~$600–$3k); every route to $10k runs through a documented revenue multiple that ₹0 can't feed. **The founder chose Path C anyway, with full information** — build a real revenue business, then sell at a multiple. Cricket is now **portfolio priority #1** (see CORE-MEMORY §4).

**What the audit changed in this sheet:**
- ❌ **D7 > 15% gate RETIRED.** Sanjaya: 2025 D7 median ~3.4%, top-quartile 7–8% → 15% was ~2× reality. Use realistic reads, not a fantasy tripwire.
- ⚠️ **Moat is thematic only.** Hitwicket (Hyderabad) already owns cricket manager+auction+PvP at 18M+ players. Our unoccupied ground = the **underworld/corruption theme** — lean into it hard; it's the whole differentiation.
- ⚠️ **itch.io is the wrong channel** (Western/PC audience). C1 distribution is India-first, mobile-first, timed to real cricket moments.
- ✅ **Real billing is now REQUIRED** (the old §8 "don't build billing" applied to the flip path; Path C needs settleable cash flow) — but **only after Gate 1** (below).

**Sequenced & gated (validate acquisition BEFORE building billing — distribution > production):**

| Stage | Work | Time | Gate |
|---|---|---|---|
| **C0 — Ship-ready** | P0 blocker fix → LOOK pass (L1–L5) → analytics (real D1/D7 cohorts, F4) → retention hooks (F1 streak, F2 net-worth/rank). Monetization STAYS stubbed. | ~1–2 wks | Installable + measurable |
| **C1 — Acquisition test** | Distribution waves timed to cricket moments, India-first channels. | ~3–4 wks | **GATE 1:** organic installs clear a real weekly rate **AND** D1 ≥ ~15%. Fail → engine broken; diagnose or abort before billing |
| **C2 — Real billing** | Replace IAP stubs with real billing; monetize. *Only if Gate 1 passed.* | ~2–3 wks | Real ₹ settling in a statement |
| **C3 — Revenue proof** | Sustain ~₹20–30k/mo, documented 3–6 months. | 3–6 mo | **GATE 2 (month 3):** MRR on a credible ramp to ₹20k+. Fail → revert to Path A flip |

**Hard review at day 90.** Not on a believable path to ~₹20–30k/mo → stop and flip the polished asset (~$1–3k).

**OPEN DECISION blocking C1 (not C0):** storefront/billing = **Play Store (TWA + Play Billing)** *[Chanakya's rec — Indian gamers + discovery + money live there]* **vs Web PWA + Razorpay**.
