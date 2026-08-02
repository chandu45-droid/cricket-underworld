# Investor/Buyer Outreach — Copy-Paste Templates

## Short Version (WhatsApp / DM)

Hey! I've built a working prototype of **Cricket Underworld** — a cricket strategy game where you build squads, rig auctions, and choose between corruption and clean play. Think Football Manager meets GTA, for India's 600M cricket fans.

46 game systems running, 167 automated tests passing. Playable right now: https://cricket-underworld.netlify.app/

Looking for investment or acquisition interest. 5 min to play, pitch page here: https://chandu45-droid.github.io/cricket-underworld/pitch.html

---

## Email Version

**Subject:** Cricket strategy game — working prototype, looking for partners

Hi,

I'm a solo developer who's built **Cricket Underworld** — the first cricket strategy game with real depth. IPL-style auctions, squad management, auto-sim matches, and a unique corruption/alignment system where your off-pitch choices shape your path.

**Why now:** India's gaming market is $5.91B today, projected to hit $16.72B by 2034. 600M+ cricket fans. Yet there's zero cricket strategy/manager games on the Play Store. Fantasy apps are gambling wrappers. Batting games are reflex tests. This category is wide open — and the PROG Act 2026 just banned real-money gaming, wiping out fantasy apps overnight. Cricket Underworld uses zero real money, so it's regulation-proof while competitors die.

**What's built:** 46 interconnected game systems, 50 player cards, 9 AI rival managers, 167 automated E2E tests. A 5-faction Power Web (Syndicate, Thana, Neta, Bhai, Rival Bosses) drives an underworld influence layer no other cricket game has. Solo-built with AI-assisted development in under 3 months.

**Play it now:** https://cricket-underworld.netlify.app/
**Full pitch:** https://chandu45-droid.github.io/cricket-underworld/pitch.html

I'm looking for the right partner — investment or acquisition — to take this from prototype to production. Happy to walk you through the game and roadmap.

Best,
Chandu
chanduyeswanth45@gmail.com

---

## Marketplace Listing Draft (Flippa / Acquire.com / IndieGameBusiness — asset-sale format)

Cold marketplace listings get judged on different criteria than a warm DM — buyers there want scope, proof-of-build, and a clear price anchor up front. Use this shape, not the pitch-deck framing above.

**Title:** Cricket Underworld — complete HTML5/PWA cricket strategy game, 46 systems, 167 tests, zero real-money mechanics

**One-line pitch:** A fully playable IPL-style cricket manager game (auctions, squad strategy, auto-sim matches, a unique corruption/alignment layer) for India's 600M-fan cricket audience — built solo, AI-assisted, source + all assets included.

**Asking price:** Listing at **$1,500–$2,500** (mid-point of the honest pre-revenue code-asset comp range for a project this size — see note below). Open to offers; will consider a lower floor for a fast, clean sale.
> *Why this number, not higher:* this is a pre-revenue prototype — no installs, no users, no MRR. Comparable sale mechanisms (Empire Flippers, Flippa app multiples) require real cash flow to price above a few thousand dollars; a code-only asset at this stage prices as **build effort + design IP**, not as a revenue multiple. (Priced 2026-07-11 by an internal viability pass researching exactly this asset — reused here rather than re-estimated, so the number doesn't drift between documents.)

**What's included in a sale:**
- Full source (`prototype/index.html`, single-file vanilla JS/CSS, ~10k lines, well-commented)
- 167 Playwright E2E tests (4 spec files) — green as of 2026-07-27
- Live playable build + design docs (architecture, GDD, visual design system)
- Demo reel (60s gameplay video) + this pitch page
- Full IP transfer: no third-party licensed assets, no real player names/likenesses (uses fictional archetypes — Google Play/App Store safe out of the box)
- 30 days of founder Q&A/handover support after sale (email)

**What's NOT included / honest caveats:**
- Zero users, zero revenue, zero App/Play Store listing yet (web-only PWA, no store presence)
- No mobile-store billing wired in yet (`BILLING_LIVE=false` flag — store UI exists, real payments were deliberately deferred)
- Solo-built, not team-audited; buyer should budget their own QA pass before a public relaunch

**Reason for selling:** Founder is reprioritizing across a solo portfolio of India-market projects and would rather hand this to someone who can dedicate real distribution/marketing effort to it than let it sit unshipped.

**Tech stack:** HTML5/vanilla JS/CSS, PWA (installable, offline-capable), Playwright test suite, GitHub Pages hosting (portable to any static host).
