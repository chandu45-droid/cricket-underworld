# Distribution Kit — Pillar 3 · P2 (India-first, cricket-moment timed)

Everything here is ready to copy-paste. **Every link carries UTM tags** — the game
now records first-touch UTM + referrer per install (`acquisition` event), so each
wave's D1/D7 is separable in the analytics sheet.

> **Before firing wave 1:** deploy the analytics collector (see `analytics/README.md`,
> ~3 min) and confirm a test event lands in the sheet. Distribution without the
> sink running = burned audience with no signal.

**Base URL:** `https://chandu45-droid.github.io/cricket-underworld/prototype/`

---

## Channel plan (per BUILD-SHEET §11: India-first, mobile-first — itch.io demoted)

| Wave | Channel | Link (UTM) | Timing |
|---|---|---|---|
| 1 | r/indiangaming | `?utm_source=reddit&utm_medium=post&utm_campaign=igaming1` | Any IPL/intl match day, post 2–3h before first ball |
| 1 | r/WebGames | `?utm_source=reddit&utm_medium=post&utm_campaign=webgames1` | Same day |
| 1 | X/Twitter | `?utm_source=x&utm_medium=post&utm_campaign=x1` | During the match, quote a live moment |
| 2 | WhatsApp groups (cricket/fantasy) | `?utm_source=whatsapp&utm_medium=share&utm_campaign=wa1` | Weekend match day |
| 2 | Telegram cricket channels | `?utm_source=telegram&utm_medium=share&utm_campaign=tg1` | Weekend match day |
| 3 | r/cricket (careful: read self-promo rules, use their weekly thread) | `?utm_source=reddit&utm_medium=post&utm_campaign=cricket1` | Only after waves 1–2 prove the funnel |

Rules of engagement: 1 channel = 1 campaign tag (never reuse) · space waves ≥3 days
apart so cohorts are readable · reply to every comment in the first 2 hours (Reddit's
algorithm rewards it) · never post the same text twice on the same platform.

---

## Ready-to-paste posts

### r/indiangaming (title + body)

**Title:** I built a cricket manager game where you can bribe the opposition, fund
politicians, and get raided by the police — free web game, no ads-wall, no login

**Body:**
Solo dev here. I got tired of cricket games being either reflex batting games or
fantasy-app gambling wrappers, so I built the game I wanted: an IPL-style auction +
squad manager where the *real* game is off the pitch — a five-faction underworld
(syndicate, police, politicians, local dadas, rival team owners) that reacts to how
dirty or clean you play.

- Runs in the browser, installs as an app (PWA), works offline
- No real-money anything, no login, drop rates published
- 3–5 min per match, built for phones

Play: [link with UTM]

It's a prototype I'm actively building — brutal feedback welcome, especially on
what would make you come back tomorrow.

### r/WebGames

**Title:** Cricket Underworld — manage a cricket team, negotiate with the mafia,
survive police investigations [free, mobile-friendly PWA]

**Body:** IPL-style player auction → build a squad → auto-simmed matches where you
make tactical calls → and a corruption/alignment system underneath: throw matches
for the syndicate, bribe your next opponent, fund a politician's campaign, or stay
clean and become a fan hero. Every save plays differently. Feedback wanted — solo
dev, active development. [link with UTM]

### X/Twitter (during a live match)

> That moment when the third umpire takes 4 minutes… anyway I built a cricket game
> where YOU are the one paying the umpire 🏏💰
>
> Auction. Squad. Matches. Mafia. Police cases. Elections.
> Free in your browser, made for 🇮🇳:
> [link with UTM]

### WhatsApp / Telegram forward

> 🏏 Bhai check this — cricket manager game jisme auction hai, match-fixing hai,
> police raid hai, sab kuch 😄 Free hai, browser me chalta hai, install bhi ho
> jata hai app jaisa. Try kar: [link with UTM]

---

## What to watch after each wave (analytics sheet / GET endpoint)

1. **Installs per campaign** — which channel actually converts.
2. **D1 per campaign** — a channel that brings players who return beats a bigger
   channel that doesn't.
3. **`tutorial_done` rate** — if <60% of installs finish onboarding, fix that
   before spending more audience.
4. **Gate 1 (§11):** organic installs at a real weekly rate AND **D1 ≥ ~15%** →
   proceed to C2 (real billing). Fail → funnel diagnosis, not more waves.

## Founder to-dos before wave 1 (in order)

- [ ] Deploy analytics collector + set `ANALYTICS_ENDPOINT` + push (3 min)
- [ ] Confirm live URL serves current build on your phone
- [ ] Convert the demo reel to MP4 for WhatsApp (`docs/demo/README.md`)
- [ ] Pick the cricket moment (any high-attention match day) and fire wave 1
