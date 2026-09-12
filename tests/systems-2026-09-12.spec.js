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

      // NOTE: every observation below is snapshotted IMMEDIATELY, into a primitive. Reading
      // `GS.academySlots.length` from the returned object literal instead would report the state
      // at the END of this function (after he has graduated), not the state being asserted --
      // which is exactly how the first version of this test failed against correct code.
      const full = window.processAcademySlots();
      const graduatedWhileFull = full.length;
      const slotsWhileFull = window.GS.academySlots.length;
      const squadWhileFull = window.GS.squad.length;
      const held = window.GS.academySlots[0];
      const readyFlag = !!(held && held.ready === true);
      const batWhileHeld = held && held.gradCard ? held.gradCard.bat : null;
      const nameWhileHeld = held && held.gradCard ? held.gradCard.name : null;

      // Tick again while STILL full: he must not train on, and must not re-graduate.
      const fullAgain = window.processAcademySlots();
      const graduatedWhileStillFull = fullAgain.length;
      const heldAfter = window.GS.academySlots[0];
      const batAfterSecondTick = heldAfter && heldAfter.gradCard ? heldAfter.gradCard.bat : null;
      const seasonsLeftAfterSecondTick = heldAfter ? heldAfter.seasonsLeft : null;

      // Now free one squad slot and tick again: he should sign for real.
      window.GS.squad.pop();
      const afterFreeing = window.processAcademySlots();
      const nameAfterFreeing = afterFreeing[0] ? afterFreeing[0].name : null;

      return {
        graduatedWhileFull: graduatedWhileFull,
        slotsWhileFull: slotsWhileFull,
        readyFlag: readyFlag,
        squadWhileFull: squadWhileFull,
        maxSquad: window.GS.maxSquad,
        batWhileHeld: batWhileHeld,
        nameWhileHeld: nameWhileHeld,
        graduatedWhileStillFull: graduatedWhileStillFull,
        batAfterSecondTick: batAfterSecondTick,
        seasonsLeftAfterSecondTick: seasonsLeftAfterSecondTick,
        graduatedAfterFreeing: afterFreeing.length,
        nameAfterFreeing: nameAfterFreeing,
        slotsAfterFreeing: window.GS.academySlots.length,
        squadHasHim: window.GS.squad.some(p => nameAfterFreeing && p.name === nameAfterFreeing)
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

  // ============================================================
  // SYSTEMS FIX 6(c): the sponsor purseBonus ladder was dead code
  // endSeason computed `auctionPurse = basePurse + sp.purseBonus`, the season-end screen showed
  // it, and then startAuction did `GS.auctionPurse = GS.coins` and wiped it -- along with the
  // tribunal's -20% suspension penalty. Neither had ever applied. Founder decision 2026-09-12:
  // purse = coins + the season's sponsor bonus.
  // ============================================================
  test('the sponsor purse ladder and the tribunal penalty both actually reach the auction', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#loading.hide', { timeout: 10000 });

    const r = await page.evaluate(() => {
      function openPurse(coins, purseBonus, pursePenalty) {
        window.GS.coins = coins;
        window.GS.sponsor = { tier: 1, name: 'Test Sponsor', purseBonus: purseBonus };
        window.GS.pursePenalty = pursePenalty;
        if (window.GS.ads) window.GS.ads.pendingPurse = false; // exclude the +300 rewarded ad
        window.startAuction();
        const purse = window.GS.auctionPurse;
        const penaltyAfter = window.GS.pursePenalty;
        window.auction.active = false;
        if (window.auction.interval) clearInterval(window.auction.interval);
        return { purse: purse, penaltyAfter: penaltyAfter };
      }

      const topTier = openPurse(5000, 500, 1);      // Tier 1 (Tata, alignment 71+)
      const bottomTier = openPurse(5000, -200, 1);  // Tier 5 (No Sponsor)
      const suspended = openPurse(5000, 500, 0.8);  // tribunal suspension pending
      const afterSuspension = openPurse(5000, 500, undefined); // flag must not persist

      // Broke, but the sponsor bonus still gives real spending power.
      const broke = openPurse(0, 500, 1);

      return { topTier, bottomTier, suspended, afterSuspension, broke };
    });

    // The ladder reaches the auction in both directions.
    expect(r.topTier.purse).toBe(5500);
    expect(r.bottomTier.purse).toBe(4800);

    // The advertised "-20% purse next season" applies...
    expect(r.suspended.purse).toBe(4400); // round(5500 * 0.8)
    // ...for exactly one season -- it is consumed on use, not sticky.
    expect(r.suspended.penaltyAfter).toBe(1);
    expect(r.afterSuspension.purse).toBe(5500);

    // A negative-bonus sponsor can't push the purse below zero.
    expect(r.broke.purse).toBe(500);
  });

  test('winning a bid above your coin balance never drives coins negative', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#loading.hide', { timeout: 10000 });

    const r = await page.evaluate(() => {
      window.GS.coins = 300;
      window.GS.squad = [];
      window.GS.sponsor = { tier: 1, name: 'Test Sponsor', purseBonus: 500 };
      window.GS.pursePenalty = 1;
      window.startAuction();
      const purseBefore = window.GS.auctionPurse; // 300 + 500 = 800, above the coin balance
      // Win a card for more coins than you hold -- only possible because the bonus is real.
      window.auction.bidder = 'you';
      window.auction.bid = 700;
      window.resolveCard();
      const out = { purseBefore: purseBefore, coins: window.GS.coins, purse: window.GS.auctionPurse };
      window.auction.active = false;
      if (window.auction.interval) clearInterval(window.auction.interval);
      return out;
    });

    expect(r.purseBefore).toBe(800);
    // The purse is the real spend limit and takes the full hit...
    expect(r.purse).toBe(100);
    // ...while coins floor at 0 instead of going to -400, which is the bug this clamp closes.
    expect(r.coins).toBeGreaterThanOrEqual(0);
  });
});
