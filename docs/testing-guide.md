# Testing Guide — Cricket Underworld

## Verification Commands

```bash
# Full test suite (requires dev server running on :8080)
npx playwright test

# Individual spec files
npx playwright test tests/smoke.spec.js
npx playwright test tests/comprehensive.spec.js
npx playwright test tests/p15-visual.spec.js

# Run specific test by name
npx playwright test --grep "match engine"

# Start dev server (run in separate terminal)
npx serve prototype -l 8080
```

## Definition of Done (per feature)

A feature is "passing" ONLY when:

1. The behavior works in a real browser (not just "code looks right")
2. Automated Playwright test exists and passes (or explicit "manual" reason documented)
3. No JS console errors during the flow
4. `feature_list.json` state updated to `passing` with commit hash evidence

## Test Patterns

All tests use the same structure:

1. **`injectState(page, overrides)`** — seeds localStorage with known game state, reloads, dismisses overlays
2. **Direct UI interaction** — clicks, navigation, form fills via Playwright locators
3. **Assertion on visible state** — text content, visibility, CSS classes, element counts
4. **`page.evaluate()`** — for testing internal game logic (alignment zones, debt escalation, match outcomes)

## Adding New Tests

1. Add to the appropriate spec file (or create a new one for a new system)
2. Use `injectState()` with overrides to set up the exact state you need
3. Test the golden path first, then edge cases
4. Prefer visible assertions over internal state checks
5. Use `--grep` to run just your new tests during development

## What's NOT Tested (Known Gaps)

- DRS, Impact Player, weather, super over, injuries (F09) — implemented, no E2E tests
- Academy (F25), Staff (F27), Mentorship (F29), Bans (F32) — implemented, no E2E tests
- Gestures (F28) — requires touch device, Playwright doesn't cover well
- Sound (F26) — requires audio context, not testable in headless browser
- Commentary quality (F24) — subjective, manual verification only
