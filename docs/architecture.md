# Architecture — Cricket Underworld

## Tech Stack

- **Runtime:** Vanilla JS, HTML5 Canvas, CSS3 (no framework)
- **Platform:** PWA (browser-playable, installable)
- **State:** `localStorage` key `cu_save_v3` (JSON blob)
- **Fonts:** Teko (display), Rajdhani (body) via Google Fonts
- **Tests:** Playwright E2E (`@playwright/test ^1.60`)
- **Dev server:** Any static server on port 8080 (e.g. `npx serve prototype -l 8080`)

## File Structure

```
cricket-underworld/
  prototype/
    index.html          # THE game — all HTML, CSS, JS in one file (~6865 lines)
  tests/
    smoke.spec.js       # 7 quick smoke tests
    comprehensive.spec.js  # ~60 tests covering all systems
    p15-visual.spec.js  # ~28 tests for P1.5 visual rebuild
  docs/
    core-systems-gdd.md    # Full game design document (10 systems)
    visual-design-system.md # Design tokens, color palette, typography
    architecture.md        # This file
    testing-guide.md       # Verification commands and test patterns
  feature_list.json     # Machine-readable feature tracker
  PROGRESS.md           # Cross-session state persistence
  CLAUDE.md             # Agent entry file (router)
  playwright.config.js  # Test config (baseURL: localhost:8080)
```

## Conventions

- **Game state global:** `window.GS` — the live game state object, serialised to localStorage on every mutation
- **Screen switching:** `.screen.active` class pattern — one active screen at a time
- **Overlays:** `.show` class toggles visibility (mafia, pack, scorecard, settings, etc.)
- **CSS variables:** All colors/spacing in `:root` — see `visual-design-system.md`
- **Angular design:** Sharp corners (3-4px max radius), clip-path polygons, no rounded cards
- **Naming:** Kebab-case for CSS IDs/classes, camelCase for JS variables

## Key Globals (exposed on window for testability)

- `window.GS` — game state
- `window.calcBallOutcome()` — match ball simulation
- `window.getAlignmentZone()` — alignment zone lookup
- `window.applyAlignShift()` — alignment change with inertia
- `window.processDebts()` — debt escalation
- `window.payDebt()` — debt payment
- `window.checkInvestigation()` — investigation trigger
- `window.resolveTribunal()` — tribunal verdict
- `window.match` — live match state (fieldSetting, boostBalls, etc.)
