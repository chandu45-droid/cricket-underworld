# Cricket Underworld

Cricket auction + card strategy game with a mafia/corruption alignment system.

**Live demo:** https://chandu45-droid.github.io/cricket-underworld/

---

## What it is

A strategy-first (not reflex-based) cricket card game built for Indian mobile gamers. Players bid on cricket cards in IPL-style auctions, build a squad, set match strategy, and watch auto-simulated matches play out — every interaction is a decision, never a reaction-time test.

The unique hook is the **mafia/corruption alignment system**: alongside the on-field game, players build an "Underworld" reputation track, tilting their empire between clean sporting success and underworld influence, which shapes the economy and events around their club.

Built solo, AI-assisted, with a full progressive game loop: onboarding → auction → squad building → match simulation → club/economy progression → cloud save.

## Tech Stack

| Layer | Technology |
|---|---|
| **Platform** | HTML5 / PWA (installable, offline-capable) |
| **Architecture** | Single-file vanilla JS (`prototype/index.html`) — no framework, no build step |
| **Testing** | Playwright end-to-end test suite (`tests/`) covering the full game loop |
| **Analytics** | Lightweight in-game beacon + free Google Apps Script collector |
| **Hosting** | GitHub Pages |

## Running Locally

```bash
# Serve the game
npx serve prototype -l 8080

# Run the full test suite (server must be running)
npx playwright test

# Run a specific group
npx playwright test --grep "Match Engine"
```

## Design Principles

- **Strategy over reflexes** — every screen is built around decisions, not twitch timing
- **F2P competitive** — free players can reach every tier; spending buys speed and style, not power
- **India-first** — pricing, UX, and cultural references tuned for the Indian mobile audience
- **No default styling** — angular, sharp-cornered visual system designed to look premium on a budget Android screen
