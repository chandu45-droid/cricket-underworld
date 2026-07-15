# Demo reel — first 60 seconds (Pillar 3 · P4)

`cricket-underworld-60s-reel.webm` — 43s, 390×844 (mobile portrait), light theme, real gameplay:

| Beat | ~Time | What's on screen |
|---|---|---|
| Splash | 0–5s | CRICKET UNDERWORLD wordmark + ball, loading flavor lines |
| Hub + onboarding | 5–14s | Hub reveal, 6-step tutorial walked through |
| Auction | 14–24s | START AUCTION → live bidding (3 bids placed) |
| Playing XI → Pre-match | 24–31s | Squad confirm, pre-match screen |
| Live match sim | 31–38s | Ball-by-ball, powerplay banner, commentary feed |
| **Victory** | 38–43s | Gold VICTORY, score line, MATCH PAYOUT hero, Grey-Zone rewards |

## Regenerate

The reel is recorded from real gameplay by a Playwright script (no mocks —
the win is made deterministic by seeding a max-stat squad vs a min-stat
scouted opponent XI, the same technique the L5 verification used).
Ask a Claude session to "re-record the demo reel" — the script pattern is:
warm the server → record 390×844 → splash → tutorial clicks → auction +
3 bids → end auction → seed squads → XI confirm → start match → 12s live
sim → skip to result → hold Victory 5s.

## Sharing formats

- **WebM plays everywhere in-browser** (and on Telegram/X directly).
- WhatsApp/Instagram want MP4 — one command on any machine with ffmpeg:
  `ffmpeg -i cricket-underworld-60s-reel.webm -c:v libx264 -pix_fmt yuv420p reel.mp4`
  (or any online converter; the file has no audio track).
- For `pitch.html`, embed with `<video src="..." muted autoplay loop playsinline>`.
