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

  // ============================================================
  // SYSTEMS FIX 8: cleanStreak never reset across seasons
  // `cleanBonus = cleanStreak * 10` is added to every win, uncapped, and the streak reset ONLY on
  // a fixed match -- endSeason reset winStreak and streakShield but not this one. It compounded to
  // +1,960/win by season 14 (16x the 80-120 base), making late-game coin income unlimited and
  // inverting the game's central tension: the clean path out-earned the corrupt one forever.
  // ============================================================
  test('the clean-streak bonus resets each season and cannot compound across them', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#loading.hide', { timeout: 10000 });

    const r = await page.evaluate(() => {
      window.GS.cleanStreak = 40;   // a season-14-scale streak under the old behaviour
      window.GS.bestCleanStreak = 40;
      window.GS.season = 14;
      window.GS.matchNum = 15;
      window.GS.wins = 8;
      window.GS.losses = 6;
      window.GS.league = 'gully';
      window.GS.alignment = 0;
      window.endSeason();
      const afterSeason = {
        cleanStreak: window.GS.cleanStreak,
        bestCleanStreak: window.GS.bestCleanStreak,
        winStreak: window.GS.winStreak
      };
      // The badge must still read as earned -- an achievement must not un-earn on rollover.
      const badgeEarned = window.GS.bestCleanStreak >= 5;
      // And the bonus a win would now pay, vs what it paid at streak 40.
      const bonusNow = window.GS.cleanStreak >= 3 ? window.GS.cleanStreak * 10 : 0;
      return { afterSeason: afterSeason, badgeEarned: badgeEarned, bonusNow: bonusNow, bonusBefore: 40 * 10 };
    });

    // The streak itself is cleared, exactly like the other two streaks on that line.
    expect(r.afterSeason.cleanStreak).toBe(0);
    expect(r.afterSeason.winStreak).toBe(0);
    // The +400/win it was paying is gone...
    expect(r.bonusBefore).toBe(400);
    expect(r.bonusNow).toBe(0);
    // ...but the career best survives, so the Clean Run badge does not un-earn.
    expect(r.afterSeason.bestCleanStreak).toBe(40);
    expect(r.badgeEarned).toBe(true);
  });

  // ============================================================
  // SYSTEMS FIX 10: DRS was a "delete one wicket" button
  // useDRS() could be tapped at any moment and just decremented the wicket count. The striker is
  // derived from that count (`batIdx = Math.min(cWkts, ...)`), so dropping wkts 8 -> 7 put batter
  // index 7 -- out since over 12 -- back on strike, still flagged out:true on the scorecard while
  // he accumulated runs on the same row. Now gated to the dismissal just given, as in real cricket.
  // ============================================================
  test('DRS only reviews the wicket just given, and a mistimed tap costs nothing', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#loading.hide', { timeout: 10000 });

    const r = await page.evaluate(() => {
      // Mid-innings, batting, several wickets down, NO wicket on the last ball.
      window.match.active = true;
      window.match.batting = 'you';
      window.match.innings = 1;
      window.match.wkts = 8;
      window.match.drsUsed = false;
      window.match.drsWindow = null;

      window.useDRS();
      const stale = { wkts: window.match.wkts, drsUsed: window.match.drsUsed };

      // Now a wicket falls this ball: the window opens and the review becomes legal.
      const batEntry = { name: 'Given Out', runs: 41, balls: 30, fours: 4, sixes: 1, out: true };
      const bwlEntry = { name: 'The Bowler', runs: 28, balls: 18, wkts: 3 };
      window.match.drsWindow = { side: 'you', batEntry: batEntry, bwlEntry: bwlEntry, batterName: 'Given Out' };

      // Force the 40% overturn to land so the success path is what's under test.
      const realRandom = Math.random;
      Math.random = () => 0.01;
      window.useDRS();
      Math.random = realRandom;

      return {
        stale: stale,
        afterWkts: window.match.wkts,
        batterOut: batEntry.out,
        bowlerWkts: bwlEntry.wkts,
        windowClosed: window.match.drsWindow === null
      };
    });

    // A tap with no live decision is a no-op WITH the review intact -- it must not be burned.
    expect(r.stale.wkts).toBe(8);
    expect(r.stale.drsUsed).toBe(false);

    // A review of the live decision overturns it...
    expect(r.afterWkts).toBe(7);
    // ...and undoes BOTH scorecard rows, which decrementing the count alone never did.
    expect(r.batterOut).toBe(false);
    expect(r.bowlerWkts).toBe(2);
    // One decision, one review.
    expect(r.windowClosed).toBe(true);
  });

  // ============================================================
  // SYSTEMS FIX 11: XI validation required neither a keeper nor a bowler
  // Size (>=3, <=11) and the overseas cap were the whole validation, so an XI of 11 batters was
  // legal -- extractBowlers() then fell through to its last-man fallback and returned ONE bowler,
  // who bowled all 20 overs consecutively at 5x the legal 4-over cap.
  // ============================================================
  test('XI selection requires a keeper and 2 bowlers, without soft-locking a squad that has none', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#loading.hide', { timeout: 10000 });

    const r = await page.evaluate(() => {
      function mk(id, role) {
        return { id: id, name: 'P' + id, role: role, bat: 60, bwl: 60, fld: 50, fit: 80,
                 form: 60, loyalty: 50, greed: 50, rarity: 'common', overseas: false, stars: 2 };
      }
      // Stub the picker's selection source so confirmSquadSelect() reads what we set.
      let selection = [];
      window.getCurrentSSSelection = () => selection;
      const toasts = [];
      const realToast = window.toast;
      window.toast = (msg, kind) => { toasts.push(msg); };

      function attempt(squad, sel) {
        window.GS.squad = squad;
        window.GS.selectedXI = [];
        selection = sel;
        toasts.length = 0;
        window.confirmSquadSelect();
        return { accepted: window.GS.selectedXI.length === sel.length, toast: toasts[0] || null };
      }

      // 1. An all-batter XI, with keepers and bowlers available on the bench -> rejected.
      const fullSquad = [];
      for (let i = 1; i <= 11; i++) fullSquad.push(mk(i, 'Top-Order Batter'));
      fullSquad.push(mk(12, 'Wicket-Keeper'), mk(13, 'Fast Bowler'), mk(14, 'Spin Bowler'));
      const allBatters = attempt(fullSquad, [1,2,3,4,5,6,7,8,9,10,11]);

      // 2. Keeper in, but only ONE bowler -> still rejected (can't bowl consecutive overs legally).
      const oneBowler = attempt(fullSquad, [1,2,3,4,5,6,7,8,9,12,13]);

      // 3. Keeper + two bowlers -> accepted.
      const legal = attempt(fullSquad, [1,2,3,4,5,6,7,8,12,13,14]);

      // 4. SOFT-LOCK GUARD: a squad that owns no keeper and no bowlers at all must still be able
      //    to field a side, or the player can never confirm an XI again.
      const poorSquad = [];
      for (let i = 1; i <= 11; i++) poorSquad.push(mk(i, 'Top-Order Batter'));
      const noneOwned = attempt(poorSquad, [1,2,3,4,5,6,7,8,9,10,11]);

      window.toast = realToast;
      return { allBatters, oneBowler, legal, noneOwned };
    });

    expect(r.allBatters.accepted).toBe(false);
    expect(r.allBatters.toast).toMatch(/wicket-keeper/i);

    expect(r.oneBowler.accepted).toBe(false);
    expect(r.oneBowler.toast).toMatch(/2 bowlers/i);

    expect(r.legal.accepted).toBe(true);

    // The requirement is capped by what the player owns -- it must never make the game unplayable.
    expect(r.noneOwned.accepted).toBe(true);
  });

  // ============================================================
  // SYSTEMS FIX: 58% of the card pool was auction-invisible
  // `sort(rarity DESC).slice(0, 12)` meant the pool was always the 12 rarest unowned cards, so the
  // 29 common/uncommon cards could never appear at an auction. The cheapest possible lot in the
  // game was a rare at 339 coins.
  // ============================================================
  test('the auction can offer common and uncommon cards, not just the 12 rarest', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#loading.hide', { timeout: 10000 });

    const r = await page.evaluate(() => {
      const seen = {};
      let poolSize = 0;
      for (let i = 0; i < 40; i++) {          // 40 auctions is far more than enough to expose a filter
        window.GS.squad = [];
        window.GS.coins = 50000;
        window.startAuction();
        poolSize = window.auction.pool.length;
        window.auction.pool.forEach(p => { seen[p.rarity] = (seen[p.rarity] || 0) + 1; });
        window.auction.active = false;
        if (window.auction.interval) clearInterval(window.auction.interval);
      }
      return { seen: seen, poolSize: poolSize };
    });

    expect(r.poolSize).toBe(12);
    // The two tiers that were structurally unreachable before.
    expect(r.seen['common'] || 0).toBeGreaterThan(0);
    expect(r.seen['uncommon'] || 0).toBeGreaterThan(0);
    // ...without losing the marquee end of the pool, which the price sort still closes the show on.
    expect((r.seen['epic'] || 0) + (r.seen['legendary'] || 0)).toBeGreaterThan(0);
  });

  // ============================================================
  // SYSTEMS FIX 7: aggressive batting and the "Contain" field were both strictly dominant
  // Root cause of BOTH: a T20 innings ends on overs, not wickets, so every lever that traded
  // wickets for runs was free in one direction. Fixed by giving a wicket an intrinsic price --
  // the incoming batter needs a few balls to get his eye in -- plus a re-tune of the strategy
  // and field modifiers measured at n=6000 rather than taken from the GDD's spec numbers.
  //
  // These tests pin the EXPLOITS, not the tuning constants: they assert that aggression can't buy
  // runs for free and that Contain can't buy run-suppression for free. That lets the numbers be
  // re-tuned later without the tests turning into busywork, while still failing loudly if either
  // dominance comes back.
  // ============================================================
  test('a new batter is genuinely un-set: fewer boundaries, more wickets than a settled one', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#loading.hide', { timeout: 10000 });

    const r = await page.evaluate(() => {
      const batter = { id: 1, name: 'B', bat: 70, bwl: 20, form: 70, fld: 60, role: 'Top-Order Batter' };
      const bowler = { id: 2, name: 'W', bat: 20, bwl: 70, form: 70, fld: 60, role: 'Fast Bowler' };
      window.match.fieldSetting = 'standard';
      window.match.boostBalls = 0;
      function run(balls, n) {
        let wkts = 0, boundaries = 0, runs = 0;
        for (let i = 0; i < n; i++) {
          window.match.batterBalls = balls;
          const o = window.calcBallOutcome(batter, bowler, 'FLAT', 1, 'balanced', 75, true, 1, 0, 0, i);
          if (o.wicket) wkts++; else { runs += o.runs; if (o.runs === 4 || o.runs === 6) boundaries++; }
        }
        return { wkts, boundaries, runs };
      }
      const N = 30000;
      return { fresh: run(0, N), settled: run(8, N) };
    });

    // A batter who has just walked in must score slower and be easier to remove.
    expect(r.fresh.boundaries).toBeLessThan(r.settled.boundaries);
    expect(r.fresh.runs).toBeLessThan(r.settled.runs);
    expect(r.fresh.wkts).toBeGreaterThan(r.settled.wkts);
  });

  test('aggressive batting buys risk, not free runs; Contain buys wickets, not free silence', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#loading.hide', { timeout: 10000 });

    const r = await page.evaluate(() => {
      const order = {'Top-Order Batter':0,'Wicket-Keeper':1,'Middle-Order Batter':2,'All-Rounder':3,'Spin Bowler':4,'Fast Bowler':5};
      function midXI(shift) {
        const pool = window.ALL_PLAYERS.slice().sort((a,b) => (a.bat+a.bwl) - (b.bat+b.bwl));
        const band = pool.slice(12 + shift, 12 + shift + 11).map(p => JSON.parse(JSON.stringify(p)));
        band.forEach(p => { p.form = 65; p.fit = 80; });
        return band.sort((a,b) => (order[a.role]||9) - (order[b.role]||9));
      }
      // Mirrors simBall's loop: striker derived from the wicket count, settling tracked per batter.
      function innings(batXI, bwlXI, strategy, field, isYours) {
        window.match.fieldSetting = field;
        window.match.boostBalls = 0; window.match.bhaiCrowd = false; window.match.bhaiTamper = false;
        window.match.weather = 'clear'; window.match.opponent = null;
        const bowlers = window.extractBowlers(bwlXI);
        let runs = 0, wkts = 0, lastIdx = -1;
        for (let ball = 0; ball < 120 && wkts < 10; ball++) {
          const over = Math.floor(ball / 6);
          const idx = Math.min(wkts, batXI.length - 1);
          if (idx !== lastIdx) { window.match.batterBalls = 0; lastIdx = idx; }
          else { window.match.batterBalls++; }
          const o = window.calcBallOutcome(batXI[idx], bowlers[over % bowlers.length], 'FLAT',
                      over < 6 ? 0 : over < 15 ? 1 : 2, strategy, 75, isYours, 1, 0, runs, ball);
          if (o.wicket) wkts++; else runs += o.runs;
        }
        return { runs, wkts };
      }
      function avg(strategy, field, isYours, n) {
        const you = midXI(0), opp = midXI(3);
        let r = 0, w = 0;
        for (let i = 0; i < n; i++) {
          const s = isYours ? innings(you, opp, strategy, field, true) : innings(opp, you, strategy, field, false);
          r += s.runs; w += s.wkts;
        }
        return { runs: r / n, wkts: w / n };
      }
      const N = 900;
      return {
        bat: { def: avg('defensive','standard',true,N), bal: avg('balanced','standard',true,N), agg: avg('aggressive','standard',true,N) },
        field: { standard: avg('balanced','standard',false,N), contain: avg('balanced','defensive',false,N) }
      };
    });

    // 1. The risk ordering must be real and monotonic -- that IS the trade-off.
    expect(r.bat.agg.wkts).toBeGreaterThan(r.bat.bal.wkts);
    expect(r.bat.bal.wkts).toBeGreaterThan(r.bat.def.wkts);

    // 2. ...and aggression must NOT also hand you a big run premium. Pre-fix this gap was +8.5
    //    runs for +0.40 wickets, which is why it was strictly dominant. Generous tolerance so this
    //    pins the exploit rather than the exact tuning (innings SD ~25 runs, n=900 -> SE ~0.8).
    expect(r.bat.agg.runs - r.bat.bal.runs).toBeLessThan(5);

    // 3. Contain must not be free silence. Pre-fix it suppressed the opponent by 8.2 runs while
    //    costing nothing; it now concedes strike rotation in exchange for the boundary cut.
    expect(r.field.standard.runs - r.field.contain.runs).toBeLessThan(5);
    // And it genuinely gives up wickets, which is the price that makes it situational.
    expect(r.field.contain.wkts).toBeLessThan(r.field.standard.wkts);
  });

});
