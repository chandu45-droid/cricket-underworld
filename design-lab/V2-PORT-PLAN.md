# Cricket Underworld — v2 Design Port Plan

**Source:** `Cricket Underworld v2 (standalone).html` (a static React "design_doc_mode" canvas — 3 presentation mockups: Home Hub / Squad / Auction, on device frames with placeholder art)
**Target:** `prototype/index.html` (the shipped, functional game)
**Date:** 2026-07-10
**Status:** PLAN ONLY — no implementation until founder says "build it"

---

## 0. Headline verdict (reframed with evidence)

The shipped game is **not** missing a design system. It already has a rich one:
token layer (`:root` with ~90 vars), an elevation ladder (`--elevation-1..4`),
glow tokens, align-state theming, spring easings, a global vignette, and even a
localized auction spotlight.

So the "generic / soulless" feeling is **not** absence of design — it's **three
specific, fixable choices** that fight the premium look v2 proves is possible:

| # | Root cause | Evidence (shipped code) | What v2 does instead |
|---|---|---|---|
| **A** | **Base is near-pure black; panels barely lift off it.** | `html,body{background:var(--void)}` where `--void:#020408`; panels `--dugout:#0B1222`. Δ between bg and panel ≈ nothing → screens read as black voids. | Base `#0D1117`, panels lift to `#161B26`/`#1E2536`. Visible elevation everywhere. |
| **B** | **Panels use glassmorphism** (translucent white + blur). Over near-black, frosted glass reads washy/grey/cliché. | `--glass-bg` = translucent-white gradient; **44× `backdrop-filter:blur`**; **20× `var(--glass-*)`**. | Solid gradient panels `linear-gradient(160deg,#1E2536,#10141D)` + **asymmetric top-lit border** (the bevel-as-border trick) + hard drop shadow. Tactile, console-grade. |
| **C** | **No screen-level radial spotlight; grading is piecemeal.** | 67 `radial-gradient`s exist but they're tiny decorative glows; the screen backdrop is flat `--void` + 0.035 noise + one global vignette. Only `.auction-stage` has a real spotlight. | Every screen graded: `radial-gradient(circle at 50% 0-15%, lifted-tint, base)`. Hub cool, Auction red-tension. |

Secondary (real but smaller): **timid lemon gold** (`--gold-bright:#FFD23F` vs v2's
burnished `#D4AF6A`/`#DAA520`), **red under-used as hero CTA**, and **empty-states
that render as dead black voids**.

**Bottom line:** This is a **retune + panel-treatment swap + gap-fill**, not a
rebuild. The angular geometry is already correct on both sides (see §4). Estimated
surface area: the `:root` token block + ~4 shared panel/button classes + per-screen
background rules + empty-state components. High confidence, contained blast radius.

---

## 1. Constraint check — is v2 safe to port?

| Constraint | Verdict |
|---|---|
| #8 Angular (3–4px max, clip-path, no rounded cards) | ✅ **v2 already honors it.** v2 uses clip-path chamfers (6/10/14/16px cuts) + tiny 3–6px radii. The "rounded" impression came from the phone-frame chrome (30px/8px) and friendly nav icons — **not** the UI cards. **No de-rounding step needed.** (Correcting an earlier misdiagnosis, per evidence.) |
| #9 No generic styling | ✅ The port makes it *more* distinct, not less. |
| #2 No real names/likenesses | ✅ v2 uses fictional names (M. Fernandes, R. Deshmukh…) and `image-slot` placeholders. |
| #1 Strategy over reflexes | ✅ Visual only — no mechanic change. |

**One tightening for full #8 compliance:** v2 has a few 5–6px radii; the shipped
constitution says 3–4px max. Normalize v2's 5–6px → 4px on port. Trivial.

---

## 2. Token layer — extracted v2 values, mapped to shipped tokens

Retune the existing `:root` vars (roughly lines 35–122). **Old → New:**

### Surfaces (the biggest fix — lift the greys)
| Token | Shipped (old) | v2 (new) | Note |
|---|---|---|---|
| `--void` | `#020408` | `#080B11` | pull off pure black |
| `--pitch` (base bg) | `#060A16` | `#0D1117` | the screen floor |
| `--dugout` (panel) | `#0B1222` | `#161B26` | **must visibly lift off base** |
| `--pavilion` | `#141E34` | `#1E2536` | raised panel |
| `--sight` | `#1C2E4A` | `#2A3247` | highest surface / active |
| (new) `--panel-lo` | — | `#10141D` | gradient dark stop |
| (new) `--panel-grad` | — | `linear-gradient(160deg,#1E2536,#10141D)` | default solid panel |

### Gold — burnished, not lemon
| Token | Old | New |
|---|---|---|
| `--gold` | `#C49A15` | `#B8862F` |
| `--gold-bright` | `#FFD23F` | `#DAA520` (burnished) |
| (new) `--gold-grad` | — | `linear-gradient(160deg,#D4AF6A,#8C6B32)` |
| (new) `--gold-badge` | — | `radial-gradient(circle at 35% 30%,#FFE9A8,#C9A44C 70%)` |
| (new) `--gold-ink` | — | `#241A08` (text on gold) |

### Red — deeper blood, gradient hero
| Token | Old | New |
|---|---|---|
| `--blood` | `#EF2D2D` | `#CC1100` |
| `--crimson` | `#7A0F22` | `#8B0000` |
| (new) `--cta-red` | — | `linear-gradient(160deg,#E43A1F,#8B0000)` |

### Text & lines
| Token | Old | New | Note |
|---|---|---|---|
| `--white` | `#F2ECE0` | `#E8E0D4` | warmer off-white |
| `--slip` (muted) | `#94A3B8` | `#7A8299` | most-used text (73× in v2) |
| `--border` | `rgba(148,163,184,.10)` | `#3D4A63` @ 1px | v2's default border (solid, 58×) |
| `--border-strong` | `rgba(148,163,184,.20)` | `#4A5A78` | |
| (new) `--border-lit` | — | `#7A8299` | top edge of bevel |

### Accents (keep — already close)
green `#2FBE6E` (was `#34D399`), blue `#2268D1`, purple `#5B4A8A`.

### Shadows — ladder already matches; add the two signatures
Keep `--elevation-1..4` (they already equal v2's `0 4/14/16/30px … rgba(0,0,0,.5–.6)`). **Add:**
```
--bevel-top:  inset 0 1px 0 rgba(232,224,212,0.12);   /* panel top highlight */
--cta-red-shadow: inset 0 1.5px 0 rgba(255,255,255,0.35), 0 8px 18px rgba(204,17,0,0.4);
--glow-gold: 0 0 16px rgba(218,165,32,0.45);
--vignette-strong: inset 0 0 90px 20px rgba(7,12,13,0.65);
```

### Geometry — standardize the chamfer
v2's signature is the **two-opposite-corner cut** (top-left + bottom-right):
```
--clip-14: polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px);
--clip-10: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
--clip-6:  polygon(6px  0, 100% 0, 100% calc(100% - 6px),  calc(100% - 6px)  100%, 0 100%, 0 6px);
```
Keep the existing `--clip-hex`/`--clip-diamond` for special badges. Cards migrate
from single-corner `--clip-card-tl` → the two-corner `--clip-14/10/6`.

### Type — already correct
Teko (display) + Rajdhani (body). Keep. v2 confirms sizes 8–13px labels / 15–22px /
30px display, letter-spacing 0.5–2px. No font change needed.

---

## 3. The "depth recipe" — 6 techniques to port

These are what separate v2's premium feel from the shipped flat look:

1. **Lifted base + graded screens.** Replace flat `--void` backdrop with per-screen
   `radial-gradient(circle at 50% Y%, tint, base)`.
   - Hub / Squad / most: `radial-gradient(circle at 50% 0%, #1A2130 0%, #0D1117 65%)`
   - Auction (tension): `radial-gradient(circle at 50% 15%, #241318 0%, #0D1117 60%)`
   - Match/prematch: green-tinted; corrupt-alignment: red-tinted (reuse existing align tokens).
2. **Solid gradient panels, not glass.** Swap `--glass-bg`/`backdrop-filter` panels →
   `background:var(--panel-grad)` + `box-shadow:var(--elevation-2), var(--bevel-top)`.
   Keep glass ONLY for true overlays (toasts, modals) where blur reads correctly.
3. **Bevel-as-border (asymmetric top-lit border).** The v2 tell:
   `border-width:1.5px 1px 1px; border-color:#7A8299 #3D4A63 #3D4A63;` — a lit top edge,
   darker sides/bottom. Cheap, huge tactility gain.
4. **Red hero CTA.** Primary action buttons (PLAY MATCH, BID) →
   `background:var(--cta-red); box-shadow:var(--cta-red-shadow); clip-path:var(--clip-10)`,
   Teko 16px, letter-spacing 1.5px, white. This is the single highest-impact visual change.
5. **Colored glows on active/premium elements.** Gold tier badge → `--glow-gold`; live/urgent
   red dot; positive stat → green glow. Sparingly, on state — not everywhere.
6. **Vignette + grain, tuned.** Keep the noise (0.035) and vignette; strengthen vignette to
   `--vignette-strong` so screen edges fall into shadow and the spotlight center pops.

---

## 4. Component recipes (extracted from v2 DOM — build targets)

**Match card (hub):**
`background:linear-gradient(160deg,#1B2D30,#131826); border-width:1.5px 1px 1px;
border-color:#7A8299 #3D4A63 #3D4A63; clip-path:var(--clip-14); box-shadow:var(--elevation-2);
padding:12px 14px.` Crests = 44px image-slots. Countdown in `#CC1100` Teko.

**PLAY MATCH / primary CTA:** see depth-recipe #4. `linear-gradient(160deg,#E43A1F,#8B0000)`
+ `--cta-red-shadow` + `--clip-10` + Teko 16px / +1.5px / white.

**Auction hero lot:** `linear-gradient(160deg,#1B2D30,#131826); border:1.5px solid #D4AF6A;
clip-path:var(--clip-16); box-shadow:0 16px 34px rgba(0,0,0,.55); padding:14px.`
Portrait 120×150, 4px radius, 2px gold border, OVR badge (gold bg / `--gold-ink` / Teko 11px).
Name Rajdhani 15px `--white`; role·tier Rajdhani 10px `--slip` +0.5px; "CURRENT BID" 9px `--slip`
+1px; price **Teko 30px** with "Cr" in gold. Countdown = 40px **conic-gradient ring**
(`#CC1100` fill to fraction, `#2A3247` track) + inner disc + Teko red timer.

**Bid-activity row:** `background:#161B26; border:1px solid #3D4A63; border-radius:4px;
padding:6px 8px; gap:8px.` Crest 22px (4px radius). Team Rajdhani 11px/700 `--white`; bid Teko 12px.

**Stat bar (squad/team):** track `#0D1117`, fill `linear-gradient(90deg,#2FBE6E,#2FAE87)`,
height ~4px, optional `--glow-green` when high.

**Quest / objective row:** panel `#161B26`, 1px `#3D4A63`, 4px radius, 4px progress bar,
22px emoji reward chip.

**Empty-states (the silent killer):** every empty screen must render a *designed* empty
state — graded background + centered angular icon tile + one-line prompt + a CTA — never a
bare black void. (This is why fresh saves looked worst in review shots.)

---

## 5. Port plan — phased, prioritized by impact ÷ effort

> WIP=1. Verify each phase in-browser (constitution #10 / hard-learned #13) before the next.
> Commit after each phase.

### Phase 1 — Token retune (½ day, ~40 lines) — **highest ROI**
- Edit the `:root` block: surfaces, gold, red, text/borders, new shadow/geometry vars (§2).
- No structural HTML changes. The whole app shifts warmer/lifted/more premium instantly.
- **Done when:** hub/squad/auction render with visible panel-off-base separation and burnished
  gold; screenshot diff vs current shows lift, not regression.

### Phase 2 — Screen grading + vignette (½ day)
- Add per-screen radial spotlight backgrounds (depth #1) keyed off the current screen class.
- Strengthen vignette to `--vignette-strong`.
- **Done when:** each screen has a visible center-lift and shadowed edges; auction reads red-tense.

### Phase 3 — Panel treatment swap (1 day) — **biggest structural change**
- Replace glassmorphism on content panels with `--panel-grad` + `--elevation-2` + `--bevel-top`
  + bevel-as-border. Keep glass only for toasts/modals.
- Migrate card clip-paths → `--clip-14/10/6`; normalize stray 5–6px radii → 4px.
- **Done when:** panels look solid/tactile (not frosted); `backdrop-filter` count drops from 44
  to only true overlays; playwright suite still green.

### Phase 4 — Red hero CTAs + gold badges + glows (½ day)
- Promote primary actions (PLAY MATCH, BID, confirm) to the red-CTA recipe.
- Gold OVR/tier badges + `--glow-gold`; live/urgent red dots; stat-bar green glow.
- **Done when:** the primary action on every screen is unmistakably the red button.

### Phase 5 — Empty-states (½ day) — **fixes the "void" first impression**
- Design empty-states for squad (no players), auction (none live), market, cards, league.
- **Done when:** a brand-new save has zero dead-black screens.

### Phase 6 — Verify + document (½ day)
- `npx playwright test` green; re-shoot `review-shots/` (hub/auction/squad/cards/league) and
  eyeball against v2.
- Update `docs/visual-design-system.md` with the new token values (single source of truth).
- Commit + push.

**Total: ~3.5–4 focused days.** Phases 1–2 alone (1 day) deliver ~60% of the perceived jump.

---

## 6. Guardrails & non-goals

- **Angular identity is already satisfied** — do not round anything; the port keeps/strengthens sharp corners.
- **Do not touch game logic** — this is skin-deep (CSS/tokens/components), zero mechanic change.
- **Test before "done"** — run the live app in-browser each phase; the suite must stay green (#10, #13).
- **NOT doing:** rebuilding from the v2 React file (it's a static mockup, not a game); adding new
  screens; changing fonts; importing v2's placeholder art. v2 is a **reference**, the shipped game
  stays the codebase.
- **Placeholder art:** v2's `image-slot` crests/portraits are placeholders — the shipped game's
  existing art/generation stays; only the framing/treatment around it changes.

---

## 7. Reuse note (portfolio)

The extracted "depth recipe" (lifted base + solid gradient panels + bevel-as-border + graded
spotlight + restrained colored glows) is a reusable premium-dark-UI pattern. Candidates:
Financial Wellness App (dark mode), Katha Cheppana story cards, TaskFlow. Capture in CORE-MEMORY
if it proves out on the Cricket port.
