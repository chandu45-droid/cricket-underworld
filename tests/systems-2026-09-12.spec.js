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

  // ============================================================
  // SYSTEMS FIX 6(b): academy graduates were silently deleted when the squad was full
  // 300 coins + 2-3 seasons of waiting, then `if(squad.length<maxSquad) push(card)` -- but the
  // slot was spliced and the reward row printed UNCONDITIONALLY, so the season-end screen
  // congratulated you on a player that had just been destroyed.
  // ============================================================
  test('a squad-full academy graduate is held, not destroyed, and signs once space is freed', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#loading.hide', { timeout: 10000 });

    const r = await page.evaluate(() => {
      // Fill the squad to exactly maxSquad so the graduate has nowhere to go.
      window.GS.squad = [];
      for (let i = 0; i < window.GS.maxSquad; i++) {
        window.GS.squad.push({ id: 500 + i, name: 'Filler ' + i, role: 'All-Rounder', bat: 50, bwl: 50, fld: 50, fit: 80, form: 60, loyalty: 50, greed: 50, rarity: 'common', overseas: false, stars: 2 });
      }
      const prospect = window.generateAcademyProspect();
      prospect.seasonsLeft = 1; // graduates on the very next tick
      window.GS.academySlots = [prospect];

      const full = window.processAcademySlots();
      const held = window.GS.academySlots[0];
      const batWhileHeld = held.gradCard ? held.gradCard.bat : null;
      const nameWhileHeld = held.gradCard ? held.gradCard.name : null;

      // Tick again while STILL full: he must not train on, and must not re-graduate.
      const fullAgain = window.processAcademySlots();
      const heldAfter = window.GS.academySlots[0];

      // Now free one squad slot and tick again: he should sign for real.
      window.GS.squad.pop();
      const afterFreeing = window.processAcademySlots();

      return {
        graduatedWhileFull: full.length,
        slotsWhileFull: window.GS.academySlots.length,
        readyFlag: held.ready === true,
        squadWhileFull: window.GS.squad.length,
        maxSquad: window.GS.maxSquad,
        batWhileHeld: batWhileHeld,
        nameWhileHeld: nameWhileHeld,
        graduatedWhileStillFull: fullAgain.length,
        batAfterSecondTick: heldAfter && heldAfter.gradCard ? heldAfter.gradCard.bat : null,
        seasonsLeftAfterSecondTick: heldAfter ? heldAfter.seasonsLeft : null,
        graduatedAfterFreeing: afterFreeing.length,
        nameAfterFreeing: afterFreeing[0] ? afterFreeing[0].name : null,
        slotsAfterFreeing: window.GS.academySlots.length,
        squadHasHim: window.GS.squad.some(p => afterFreeing[0] && p.name === afterFreeing[0].name)
      };
    });

    // While the squad is full: nobody graduates, nobody is destroyed, the slot is HELD.
    expect(r.graduatedWhileFull).toBe(0);
    expect(r.slotsWhileFull).toBe(1);
    expect(r.readyFlag).toBe(true);
    expect(r.squadWhileFull).toBe(r.maxSquad);

    // A held prospect must not keep training (free stats) or drive seasonsLeft negative.
    expect(r.graduatedWhileStillFull).toBe(0);
    expect(r.batAfterSecondTick).toBe(r.batWhileHeld);
    expect(r.seasonsLeftAfterSecondTick).toBe(0);

    // Free a squad slot and he signs -- as the SAME player whose card was cached at graduation.
    expect(r.graduatedAfterFreeing).toBe(1);
    expect(r.nameAfterFreeing).toBe(r.nameWhileHeld);
    expect(r.slotsAfterFreeing).toBe(0);
    expect(r.squadHasHim).toBe(true);
  });

  // ============================================================
  // SYSTEMS FIX 6(a): media_contact (60 B$) had zero implementation
  // One grep hit in 13,000 lines -- its own STAFF_TYPES definition. It took the black money,
  // marked the row HIRED, and never blocked anything.
  // ============================================================
  test('a hired Media Contact actually blocks a negative social post, and respects its cooldown', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#loading.hide', { timeout: 10000 });

    const r = await page.evaluate(() => {
      const opponent = { name: 'Rivals XI' };
      // Conditions that make the negative branches reachable: high heat unlocks the journalist
      // scrutiny lines, deep-negative alignment makes the sponsor publicly review the deal, and
      // losing makes the rival taunt. `won:false` for every generation.
      function reset(withFixer) {
        window.GS.heat = 80;
        window.GS.alignment = -50;
        window.GS.socialFeed = [];
        window.GS.staff = withFixer ? { media_contact: { active: true, cooldownLeft: 0 } } : {};
      }
      function countNeg(batch) { return batch.filter(p => p.neg).length; }

      const N = 200;
      let withoutNeg = 0, withNeg = 0, pressRoom = 0;

      reset(false);
      for (let i = 0; i < N; i++) withoutNeg += countNeg(window.generateSocialPosts(false, opponent));

      reset(true);
      for (let i = 0; i < N; i++) {
        window.GS.staff.media_contact.cooldownLeft = 0; // simulate 3 matches passing each time
        const batch = window.generateSocialPosts(false, opponent);
        withNeg += countNeg(batch);
        if (batch.some(p => p.user === '@PressRoom')) pressRoom++;
      }

      // Cooldown: after a real block fires, the very next generation must NOT block again.
      reset(true);
      let blocks = 0, secondBlockAfterFirst = null;
      for (let i = 0; i < 60 && secondBlockAfterFirst === null; i++) {
        const batch = window.generateSocialPosts(false, opponent);
        const blocked = batch.some(p => p.user === '@PressRoom');
        if (blocked) blocks++;
        // The generation immediately after the first successful block, with NO cooldown reset.
        if (blocks === 1 && !blocked) continue;
        if (blocks === 1) {
          const next = window.generateSocialPosts(false, opponent);
          secondBlockAfterFirst = next.some(p => p.user === '@PressRoom');
        }
      }

      return { withoutNeg, withNeg, pressRoom, blocks, secondBlockAfterFirst };
    });

    // The fixer must measurably reduce negative coverage -- this is the whole advertised effect.
    expect(r.withNeg).toBeLessThan(r.withoutNeg);
    // And it must be visible: a blocked story leaves a "story pulled" post behind.
    expect(r.pressRoom).toBeGreaterThan(0);
    // Cooldown is real: it cannot block twice back-to-back.
    expect(r.secondBlockAfterFirst).toBe(false);
  });
});
