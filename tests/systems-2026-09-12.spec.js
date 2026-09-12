// Regression coverage for the SYSTEMS-audit fixes shipped 2026-09-12.
// Source findings: docs/audit-2026-09-11-balance.md and docs/audit-2026-09-11-cricket.md
// (both found finding #1 independently, which is the strongest signal in the set).
//
// These tests drive calcBallOutcome directly -- it is pure arithmetic with no DOM work, so a
// 40,000-ball sample per cell still runs in well under a second. Sample size is deliberate:
// this repo has already been bitten twice by statistically UNDER-POWERED balance tests that
// were written off as "environmental flakes" for weeks (see the note on LOGIC FIX 1 in
// tests/bugfix-2026-08-03.spec.js). Do not lower these numbers.
const { test, expect } = require('@playwright/test');

const BATTER = { id: 101, name: 'B', bat: 70, bwl: 20, form: 70, fld: 60, role: 'Top-Order Batter' };
const BOWLER = { id: 102, name: 'W', bat: 20, bwl: 70, form: 70, fld: 60, role: 'Fast Bowler' };

// ============================================================
// SYSTEMS FIX 1: morale was a null stat that buffed the OPPONENT
// `moraleMod` multiplied into batStr with no isYourBatting gate, so it boosted whoever happened
// to be batting. Every caller passes GS.morale (YOUR team's morale) for BOTH innings, so the
// buff was handed to the opposition in the innings they batted and never touched your bowling
// at all -- perfectly symmetric, measured win rate flat across morale 20/50/75/100, and the
// 150-coin Pep Talk bought nothing. Morale is now side-scoped to your team like every other
// modifier in that function. GDD 7.5's formula is unchanged.
// ============================================================
test.describe('Systems Integrity 2026-09-12', () => {
  test('morale helps YOUR batting and YOUR bowling, never the opponent', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#loading.hide', { timeout: 10000 });

    const stats = await page.evaluate(({ batter, bowler }) => {
      function run(morale, isYourBatting, n) {
        let runs = 0, wkts = 0;
        for (let i = 0; i < n; i++) {
          const o = window.calcBallOutcome(batter, bowler, 'FLAT', 1, 'balanced', morale, isYourBatting, 1, 0, 0, i);
          if (o.wicket) wkts++;
          runs += o.runs;
        }
        return { runs, wkts };
      }
      const N = 40000;
      return {
        // isYourBatting = true  -> BATTER is yours, morale must help it
        youBatLow: run(20, true, N),
        youBatHigh: run(100, true, N),
        // isYourBatting = false -> BOWLER is yours, opponent is batting.
        // Morale must now help your bowling (fewer runs conceded). Before the fix it did the
        // exact opposite: it buffed the opposition's batStr, so high morale conceded MORE.
        youBowlLow: run(20, false, N),
        youBowlHigh: run(100, false, N)
      };
    }, { batter: BATTER, bowler: BOWLER });

    // 1. Your batting: morale 100 must out-score morale 20.
    expect(stats.youBatHigh.runs).toBeGreaterThan(stats.youBatLow.runs);

    // 2. Your bowling: morale 100 must CONCEDE FEWER runs than morale 20.
    //    This is the assertion that would have caught the original bug -- it failed in reverse.
    expect(stats.youBowlHigh.runs).toBeLessThan(stats.youBowlLow.runs);

    // 3. And take more wickets while doing it.
    expect(stats.youBowlHigh.wkts).toBeGreaterThan(stats.youBowlLow.wkts);
  });
});
