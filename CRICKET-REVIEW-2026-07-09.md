# Cricket Underworld — Review & Action Plan (2026-07-09)

**Requested by founder:** *"give me clear suggestions, improvements and bugs… I am not satisfied with the entire UI and screens and colors being used. These are too basic and not showing any kind of trigger to make the user stick to the game and make the user feel rich."*

**Reviewed by (Chanakya orchestration):** ui-designer, user-researcher, component-architect (all delivered) + general-purpose bug-hunt (still running at write time — see NEXT STEPS). Grounded in **live screenshots** of all 5 screens (390×844, DPR 2) captured this session.

---

## 0. The one-line diagnosis (read this first)

Your instinct is right, but the cause is the opposite of what it looks like.

**The game is NOT technically basic. It is *under-differentiated*.**

Under the hood there are 80+ design tokens, glass-morphism, holographic cards, per-screen animated backdrops, 70+ animations. The problem: **every single element wears the same costume** — the same dark-blue translucent glass panel, the same thin 3px colored border, the same faint gold tint at 8-15% opacity. When everything looks equally "designed," nothing looks *expensive*. 

> **Rich is a contrast phenomenon, not an effects phenomenon.** You don't feel rich because there is no cheap thing next to an expensive thing. It's all one flat mid-tone.

The screenshots prove it: on **every** screen the single best-looking element is the one **solid-gold button** (START AUCTION / GO TO AUCTION / the gold PREMIUM PACK hexagon). That's the whole thesis in one object — gold used *sparingly and solidly* reads as premium; gold *sprayed everywhere at 10%* reads as cheap.

**Second finding (the "stickiness" gap):** there is **zero reason to come back tomorrow.** No daily login reward, no streak, no "your empire is worth ₹X and rank #Y" progress line. The GDD *designed* a daily-login system — it was **never built**. That's the single highest-leverage retention fix.

---

## ⚠️ Record correction (admit-wrong-in-writing)

Memory note dated **2026-07-06** says: *"UI redesign PAUSED; ship-and-measure (D7 > 15% tripwire)."* This review **reverses that pause** — on the founder's direct live instruction (2026-07-09). The pause was a reasonable call at the time (don't polish an unvalidated game), but the founder has now explicitly prioritized the premium-feel + retention work. Naming it here so the reversal is on the record, not buried.

---

## 1. SUGGESTIONS & IMPROVEMENTS — ranked by leverage

Each item is **priced**: effort to build + what happens if you do nothing.

### 🥇 TIER 1 — Do these first (highest feel-rich / stickiness per hour)

| # | Change | Why it matters | Effort | Do-nothing cost |
|---|---|---|---|---|
| 1 | **Make money look like money.** The core-loop headline number (current bid, line 547) is plain 46px white Teko. Make it **solid gold, bigger, with a ₹ symbol**, in a proper number font. Add a global `.money` class so *every* currency value uses it. | Money is currently the *quietest* thing on screen. This is the #1 "feel rich" lever. | **Small** | Game keeps feeling cheap no matter what else you fix |
| 2 | **Gold austerity pass.** Strip gold OFF the 40 panels that use it at 8-15%. Reserve gold for ONE hero element per screen (the number that matters + the primary CTA). | Creates the contrast that makes gold read as valuable. | **Small** | Everything stays flat mid-tone; no hero |
| 3 | **Build the Daily Login Streak.** It's already GDD-specced — just not coded. Day 1→7 escalating rewards, visible streak counter, "don't break your streak" nudge. | The single biggest reason-to-return. Right now there is none. | **Small–Med** | ~0% cross-session return; the retention hole stays open |
| 4 | **Add an "Empire Net-Worth + Rank" line to the Hub.** One big number: *"Your empire: ₹4,20,000 · Rank #1 · Gully Cricket"* with a title that escalates as you grow. | "Feel rich" = *seeing* your wealth grow over time. Progression visibility + loss-aversion. | **Small–Med** | No sense of getting richer = no pull |

### 🥈 TIER 2 — Strong second wave

| # | Change | Why | Effort | Do-nothing cost |
|---|---|---|---|---|
| 5 | **One real number font.** Load a proper numeric face (spec calls for Space Grotesk) and route all money/stats through it. Teko is a condensed *poster* face — it makes numbers read cheap. | Numbers are 80% of what a card/auction game shows. | Small | Numbers keep looking like a placeholder |
| 6 | **Give each screen a distinct signature, not just a text label.** Right now the theme lives only in the heading text; the panels are identical everywhere. League already leans green, Cards leans gold — lean INTO that per-screen. | Hard-rule #9: every screen distinct & premium. | Medium | Screens blur together |
| 7 | **Kill the dead-zones — real empty states.** Squad, Cards, Collection all show huge blank voids with one tiny line ("No cards in this category"). Fill with an illustrated prompt + a CTA that pushes the core loop. | Empty screens feel broken/unfinished = opposite of rich. | Medium | New players see a "broken" game on first open |
| 8 | **Cliffhanger with a stake.** The next-opponent tease exists but carries no *stake*. Add "beat them or drop to rank #4" — a reason the next match matters. | Turns idle curiosity into a return trigger. | Small | Matches feel consequence-free |
| 9 | **"Who fears you now" social-status beat.** As you climb, surface which rivals you've overtaken. | Status is the emotional core of "feel rich." | Medium | Progression feels private/flat |

### 🥉 TIER 3 — Performance (component-architect findings; do alongside)

| # | Change | Why | Effort |
|---|---|---|---|
| 10 | **`display:none` inactive screens.** All 5 screens stay in the DOM; inactive ones are `opacity:0` but still painting. | Full-viewport repaints on a budget Android. | Small |
| 11 | **Gate the two never-terminating rAF loops** (particleLoop, matchCanvas loop) so they stop when off-screen. | Two animation loops run forever, draining battery. | Small |
| 12 | **Strip the 51 permanent `will-change`.** They force GPU layers that never release. | Memory pressure on 360–390px budget phones. | Small |
| 13 | Reduce 40+ simultaneous `backdrop-blur` (blur28–32) surfaces. | Blur is the most expensive mobile paint. | Medium |

**PRESERVE (do not touch during redesign):** the alignment theming cascade at **lines 126–133** (`#app.align-spotless`→`.align-deep`, 5 custom props). It's the game's core visual-identity system.

---

## 2. BUGS (confirmed this session)

| Severity | Bug | Evidence / location |
|---|---|---|
| **High** | **Tutorial overlay blocks all navigation on fresh load.** `#tut-overlay.show` intercepts pointer events — nav clicks do nothing until it's dismissed. Broke the screenshot run until force-cleared. | Confirmed live via Playwright pointer-interception error |
| **Medium** | **Font inconsistency / spec drift.** `visual-design-system.md` specs **Space Grotesk** (numbers) + **Cinzel** (drama). **Neither is loaded** — only Teko + Rajdhani. All money renders in Teko. | index.html font-face vs docs/visual-design-system.md |
| **Medium** | **UI-AUDIT.md keyframe count wrong** (says 34; actual 70+, 51 infinite). Doc understates animation load — relevant to the perf work above. | UI-AUDIT.md vs index.html |
| **Low** | **Duplicate nav loop** in swipe handlers (lines 8471–8481). | index.html |
| **Low** | **Win-streak resets to 0** with no recovery/grace — punishing, works against retention. `processWinStreak` line 6815. | index.html |
| **Low** | **Pack open dead-end on dupes** — no dupe→shard conversion (line 7686–7688); GDD-designed fragment/pity system missing entirely. | index.html |
| — | **UI-AUDIT §5.2 known issues** still open: unlabeled "50", thin empty states, overlay screens hiding the top bar. | UI-AUDIT.md |

**Missing systems** (GDD-designed, never built): `loginReward` / `lastLogin` / `dailyLogin`, gacha `pity`, dupe→`fragment` conversion. These are the retention scaffolding — their absence is why the game doesn't stick.

---

## 3. Screenshot evidence (all 5 screens read this session)

- **Hub / Squad / Auction:** tiny bare-integer money ("2,000 / 50 / 30", no ₹), everything dark-blue glass with low-intensity gold, no hero element, theme only in text labels. Big empty dead-zones. The one solid-gold CTA is the best-looking thing on screen.
- **Cards:** thin collection progress bar; huge "No cards in this category" void; the gold PREMIUM PACK hexagon is the most premium element — validates gold-austerity/hero thesis.
- **League:** actually one of the stronger screens (green accent, gold highlight on "Your Team", crest badges) — but everything reads "0W 0L / 0 PTS" (empty state), and its green accent is inconsistent with the blue-glass elsewhere (supports item #6).

---

## ✅ NEXT STEPS (start here next session)

1. **Read the bug-hunt agent output** — general-purpose "Bug and broken-flow hunt" (id `a99bcfd880f12f72e`) was still running when this doc was written. Its output file: `…/tasks/a99bcfd880f12f72e.output`. Fold its findings into §2 above. **Do NOT spawn a duplicate** — resume via SendMessage or read the file.
2. **Ship Tier 1 as one batch** (items 1–4): gold `.money` class + gold austerity pass + Daily Login Streak + Empire Net-Worth/Rank line. This is the whole "feel rich + come back tomorrow" fix. Est. a focused session or two.
3. **Fix the High bug** (tutorial overlay pointer-block) before anything else ships — it can silently break navigation for real users.
4. **Load Space Grotesk**, add `.money` class, route all currency/stats through it (item 5) — pairs naturally with item 1.
5. **Per hard-rule #10:** after each change, `npx serve prototype -l 8080` + `npx playwright test`, and eyeball in browser before claiming done.
6. **Update the record:** reflect the 2026-07-06 pause reversal in the memory file / PROGRESS.md; log the font-spec drift as a known issue.
7. **Commit & push** this doc and each change immediately (cross-project rule).

**Suggested first PR title:** `Feel-rich + retention batch 1: gold money hero, gold austerity, daily streak, empire net-worth`

---

*Agents used: ui-designer (a24835b2da23b581a), user-researcher (a90d5d9de27655475), component-architect (a8228d474b4f61c74), general-purpose bug-hunt (a99bcfd880f12f72e — pending). Screenshots: review-shots/{hub,squad,auction,cards,league}.png.*
