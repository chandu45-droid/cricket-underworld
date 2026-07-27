# LOOK DIRECTION V2 — Cricket Underworld

**Status:** ACTIVE (started 2026-07-26). Founder reopened the look-rethink (previously paused).
**Decision of record (2026-07-26):** **Path A — sharpen the existing noir/angular "Stadium meets
Underworld" identity.** Path B (replace the identity with a generic glossy kit) was REJECTED —
research shows every winning sports/strategy reskin of the 2025–26 cycle (FM26, Soccer Manager 2026)
re-executed layout+navigation+polish while KEEPING its identity. We do the same.
**Hero screen (prove-it-first):** the **Hub**. No other screen is touched until the Hub clearly wins.

> This is a DIRECTION doc, not a token spec. Authoritative token values stay in
> `docs/visual-design-system.md`. Nothing here overrides a hard constraint in `CLAUDE.md`.

---

## Non-negotiables carried forward (do NOT break)
- Angular only — chamfered corners (clip-14/10/6), NO rounded cards (CLAUDE.md #8).
- Two fonts only: Teko (display) + Rajdhani (body/numbers, tabular figures). No new fonts.
- Theme-aware: must render in BOTH light (enforced default) and dark-noir.
- Reuse existing design tokens (`--glass-bg`, `--cta-red`, `--gold-grad`, `--clip-*`, etc.).
- Mobile-first 360–390px, single column, 44px min tap target, thumb-zone actions.
- Perf budget: CSS transforms only, ≤1 heavy gradient/screen, no bitmap textures.

## The five moves (what "rethink" means, concretely)
1. **Navigation as a broadcast command bar.** Consolidate top identity (season/day/league +
   currency) into one cohesive broadcast-style header instead of stacked strips. Trend: FM26
   moved sidebar→top; sports UIs are going header-led.
2. **Diegetic framing.** Screens read as objects in the world, not app panels floating on a
   background. Hub = the manager's desk / control room, not a card list.
3. **Motion is the premium layer.** The identity is already strong; the *feel* reads dated.
   Tactile press states, number roll-ups, staggered entrance, one signature transition.
   This is where 2026 "premium" is won — not more panels.
4. **Progressive reveal, consistently.** Extend the hub-drawer pattern already shipped: ONE
   primary action always visible above the fold; secondary/monetization/detail on demand.
5. **One signature treatment for cohesion.** A single repeatable "spotlight" motif (radial
   grade + gold hairline) so every module reads as one product, not assembled parts.

## Hub-specific brief (real elements, from prototype/index.html #hub-screen)
Current modules (keep all, RE-COMPOSE for hierarchy + cohesion):
- stadium backdrop + skyline SVG · header (crest + power-ring) · empire line ·
  meters (align/heat/fans) · action tiles (Auction/Match) · next-rival battle card ·
  daily-login panel · quick-tiles (Squad/League/Cards/Market) · rewards drawer ·
  money strip · odds link · season-pass panel.
Hierarchy target (top→bottom): identity/status → primary loop (Auction/Match) → retention
(login/streak) → navigation (quick-tiles) → monetization (drawer/pass, disclosure-gated).

## Deliverable for the prototype step
A SELF-CONTAINED scratch file `prototype/_scratch/hub-v2.html`:
- Renders the Hub in the V2 direction, standalone (inline CSS/SVG, mock data).
- MUST NOT edit `prototype/index.html`. MUST NOT couple to Playwright tests.
- Both themes shown (a toggle or two side-by-side frames).
- Uses the real design tokens/fonts. Angular geometry preserved.
- Goal: a side-by-side "does the new look clearly beat the current Hub?" decision.

## Review gate
Founder eyeballs scratch-Hub vs current Hub. Clear win → `/design-review` → roll screen-by-screen,
WIP=1, tests green. Not a clear win → stop, cheap exit (nothing shipped to live file).
