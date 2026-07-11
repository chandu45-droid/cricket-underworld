const { test, expect } = require('@playwright/test');

// ============================================================
// BUILD-SHEET-10K — Pillar 2 (FEATURES) verification
// F1 Daily Login Streak · F2 Empire Net-Worth+Rank ·
// F3 Monetization surfacing + published drop rates · F4 Analytics
// ============================================================

function makeSquad(n) {
  const all = [
    {id:1,name:'The Wall',role:'Top-Order Batter',bat:87,bwl:12,fld:65,fit:78,form:72,loyalty:82,greed:28,rarity:'epic',overseas:false,stars:4},
    {id:2,name:'Quick Gun',role:'Top-Order Batter',bat:82,bwl:15,fld:58,fit:75,form:65,loyalty:45,greed:55,rarity:'rare',overseas:false,stars:3},
    {id:3,name:'The Anchor',role:'Middle-Order Batter',bat:75,bwl:20,fld:60,fit:70,form:68,loyalty:70,greed:35,rarity:'uncommon',overseas:false,stars:3},
    {id:4,name:'Power Hitter',role:'Middle-Order Batter',bat:78,bwl:10,fld:55,fit:72,form:70,loyalty:50,greed:45,rarity:'rare',overseas:true,stars:3},
    {id:15,name:'Captain Cool',role:'All-Rounder',bat:72,bwl:70,fld:75,fit:82,form:76,loyalty:90,greed:15,rarity:'legendary',overseas:false,stars:5},
    {id:12,name:'The Wizard',role:'Spin Bowler',bat:30,bwl:85,fld:55,fit:65,form:80,loyalty:78,greed:25,rarity:'rare',overseas:false,stars:3},
    {id:8,name:'Thunder Arm',role:'Fast Bowler',bat:18,bwl:88,fld:50,fit:85,form:75,loyalty:72,greed:30,rarity:'epic',overseas:true,stars:4},
    {id:6,name:'Glove Master',role:'Wicket-Keeper',bat:68,bwl:3,fld:88,fit:70,form:55,loyalty:85,greed:20,rarity:'uncommon',overseas:false,stars:3},
    {id:9,name:'Swing King',role:'Fast Bowler',bat:22,bwl:82,fld:45,fit:78,form:68,loyalty:65,greed:40,rarity:'rare',overseas:false,stars:3},
    {id:5,name:'The Finisher',role:'Middle-Order Batter',bat:78,bwl:25,fld:62,fit:75,form:70,loyalty:55,greed:50,rarity:'epic',overseas:false,stars:4},
    {id:14,name:'Mystery Man',role:'Spin Bowler',bat:20,bwl:80,fld:50,fit:62,form:74,loyalty:30,greed:75,rarity:'rare',overseas:true,stars:3},
  ];
  return n ? all.slice(0, n) : all;
}

async function dismissOverlays(page) {
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => {
      ['tut-overlay','mafia-overlay','scorecard-overlay','pack-overlay','odds-overlay','store-overlay','ad-overlay'].forEach(id => {
        var el = document.getElementById(id); if (el) el.classList.remove('show');
      });
      var mr = document.getElementById('match-result'); if (mr) mr.classList.remove('show');
    });
    await page.waitForTimeout(300);
  }
}

async function injectState(page, overrides = {}) {
  const squad = overrides.squad || makeSquad();
  const defaults = {
    coins:5000,gems:50,blackMoney:30,alignment:0,heat:0,fans:50,
    season:1,matchNum:3,wins:1,losses:1,squad:squad,maxSquad:15,
    morale:75,auctionPurse:2000,strategy:'balanced',league:'gully',
    mafiaBonus:null,fanLoyalty:50,cleanStreak:0,
    sponsor:{tier:3,name:'Local Brand',purseBonus:0},
    rivalData:{},debts:[],noAlignMatches:0,evidence:[],investigation:null,tribunalBonus:0,
    captainId:15,selectedXI:[1,2,3,4,15,12,8,6,9,5,14],
    teamName:'Test XI',managerName:'Tester',teamColor:'gold',tutorialDone:true,seasonStats:{}
  };
  const gs = { ...defaults, ...overrides, squad };
  await page.evaluate((state) => { localStorage.setItem('cu_save_v3', JSON.stringify(state)); }, gs);
  await page.reload();
  await page.waitForSelector('#loading.hide', { timeout: 10000 });
  await dismissOverlays(page);
}

function localDayStr(offsetDays) {
  return (page) => page.evaluate((off) => {
    var d = new Date(); d.setDate(d.getDate() + off);
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
  }, offsetDays);
}

// Fail the test if the boot error banner is showing.
async function assertNoBootError(page) {
  const shown = await page.evaluate(() => {
    var e = document.getElementById('error-display');
    return e ? e.classList.contains('show') : false;
  });
  expect(shown, 'boot error banner should not be visible').toBe(false);
}

// ============================================================
// F1 — DAILY LOGIN STREAK
// ============================================================
test.describe('F1 — Daily Login Streak', () => {
  test('day-2 return increments streak, grants reward, persists across reload', async ({ page }) => {
    await page.goto('/');
    const yesterday = await localDayStr(-1)(page);
    await injectState(page, { lastLogin: yesterday, loginStreak: 1, bestLoginStreak: 1, loginClaimedDate: null, coins: 1000 });
    await assertNoBootError(page);

    // processDailyLogin at boot must have advanced the streak to 2
    const streak = await page.evaluate(() => window.GS.loginStreak);
    expect(streak).toBe(2);

    // Claim grants the day-2 reward (+300 coins)
    const before = await page.evaluate(() => window.GS.coins);
    await page.click('#login-claim-btn');
    const after = await page.evaluate(() => window.GS.coins);
    expect(after - before).toBe(300);

    // Persists across reload; no double-grant on re-open same day
    const today = await localDayStr(0)(page);
    await page.reload();
    await page.waitForSelector('#loading.hide');
    const st = await page.evaluate(() => ({ streak: window.GS.loginStreak, claimed: window.GS.loginClaimedDate, coins: window.GS.coins }));
    expect(st.streak).toBe(2);
    expect(st.claimed).toBe(today);
    expect(st.coins).toBe(after);
  });

  test('same-day re-open does not re-increment streak or re-grant', async ({ page }) => {
    await page.goto('/');
    const today = await localDayStr(0)(page);
    await injectState(page, { lastLogin: today, loginStreak: 3, bestLoginStreak: 5, loginClaimedDate: today, coins: 1000 });
    // boot processDailyLogin is a no-op when lastLogin === today
    const streak = await page.evaluate(() => window.GS.loginStreak);
    expect(streak).toBe(3);
    // claim button should be in "done" state; clicking must not grant
    const before = await page.evaluate(() => window.GS.coins);
    await page.click('#login-claim-btn');
    const after = await page.evaluate(() => window.GS.coins);
    expect(after).toBe(before);
  });

  test('missed day resets streak to 1', async ({ page }) => {
    await page.goto('/');
    const threeAgo = await localDayStr(-3)(page);
    await injectState(page, { lastLogin: threeAgo, loginStreak: 6, bestLoginStreak: 6, loginClaimedDate: null });
    const streak = await page.evaluate(() => window.GS.loginStreak);
    expect(streak).toBe(1);
    // best streak preserved
    const best = await page.evaluate(() => window.GS.bestLoginStreak);
    expect(best).toBe(6);
  });
});

// ============================================================
// F2 — EMPIRE NET-WORTH + RANK
// ============================================================
test.describe('F2 — Empire Net-Worth + Rank', () => {
  test('empire line renders live with coin value and league rank', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 5000, gems: 50, blackMoney: 30 });
    await assertNoBootError(page);

    const nw = await page.evaluate(() => window.computeNetWorth());
    expect(nw).toBeGreaterThan(0);

    const valueTxt = await page.textContent('#empire-value');
    expect(valueTxt).toContain('C'); // rendered in coins ("C"), not ₹

    const rank = await page.evaluate(() => window.getEmpireRank());
    expect(rank.total).toBe(10);
    expect(rank.rank).toBeGreaterThanOrEqual(1);
    expect(rank.rank).toBeLessThanOrEqual(10);

    const rankTxt = await page.textContent('#empire-rank-lbl');
    expect(rankTxt).toContain('10');
  });

  test('net worth recomputes after balance change', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 5000, gems: 50, blackMoney: 30 });
    const before = await page.evaluate(() => window.computeNetWorth());
    await page.evaluate(() => { window.GS.coins += 100000; window.renderEmpireLine(); });
    const after = await page.evaluate(() => window.computeNetWorth());
    expect(after).toBe(before + 100000);
  });

  test('adding a player increases net worth by that player market value', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { squad: makeSquad(5) });
    const before = await page.evaluate(() => window.computeNetWorth());
    const delta = await page.evaluate(() => {
      var p = {id:99,name:'New Star',role:'All-Rounder',bat:80,bwl:80,fld:80,fit:80,form:80,loyalty:50,greed:50,rarity:'legendary',overseas:false,stars:5};
      var mv = window.playerMarketValue(p);
      window.GS.squad.push(p);
      window.renderEmpireLine();
      return mv;
    });
    const after = await page.evaluate(() => window.computeNetWorth());
    expect(after - before).toBe(delta);
    expect(delta).toBeGreaterThan(0);
  });
});

// ============================================================
// F3 — MONETIZATION SURFACING + PUBLISHED DROP RATES
// ============================================================
test.describe('F3 — Monetization surfaces & drop rates', () => {
  test('all 3 monetization surfaces are reachable from the hub in <=2 taps', async ({ page }) => {
    await page.goto('/');
    await injectState(page, {});
    await assertNoBootError(page);

    // Vault — 1 tap on hub tile opens the store overlay
    await expect(page.locator('#hub-vault-tile')).toBeVisible();
    await page.click('#hub-vault-tile');
    await expect(page.locator('#store-overlay')).toHaveClass(/show/);
    await page.click('#store-back-btn');
    await expect(page.locator('#store-overlay')).not.toHaveClass(/show/);

    // Sponsor Break — hub tile present (1 tap arms the reward flow)
    await expect(page.locator('#hub-sponsor-tile')).toBeVisible();

    // Syndicate Contract — pass panel present on the hub (1 tap)
    await expect(page.locator('#hub-pass-panel')).toBeVisible();
  });

  test('published drop-rates page shows per-rarity odds that sum to ~100% per pack', async ({ page }) => {
    await page.goto('/');
    await injectState(page, {});

    await page.click('#hub-odds-link');
    await expect(page.locator('#odds-overlay')).toHaveClass(/show/);

    const blocks = await page.locator('.odds-pack-block').count();
    expect(blocks).toBe(3);

    const firstRows = await page.locator('.odds-pack-block').first().locator('.odds-row').count();
    expect(firstRows).toBe(5); // common..legendary

    // rates are computed from the real pool and sum to ~100
    const sum = await page.evaluate(() => window.poolRarityPct().reduce((a, r) => a + r.pct, 0));
    expect(sum).toBeGreaterThan(99.5);
    expect(sum).toBeLessThan(100.5);

    // reachable from the Vault too
    await page.click('#odds-back-btn');
    await page.click('#hub-vault-tile');
    await expect(page.locator('#store-odds-link')).toBeVisible();
  });

  test('sponsor break rewarded-ad stub grants a reward (free pack)', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { squad: makeSquad(5), maxSquad: 15 });
    const before = await page.evaluate(() => window.GS.squad.length);

    await page.click('#hub-sponsor-tile');
    await expect(page.locator('#ad-overlay')).toHaveClass(/show/);
    await page.waitForSelector('#ad-claim-btn.ready', { timeout: 6000 });
    await page.click('#ad-claim-btn');
    await page.waitForTimeout(400);

    const after = await page.evaluate(() => window.GS.squad.length);
    expect(after).toBeGreaterThan(before); // free pack added cards
  });
});

// ============================================================
// F4 — ANALYTICS (offline-safe cohorts)
// ============================================================
test.describe('F4 — Analytics', () => {
  test('session_start fires at boot and events are queryable', async ({ page }) => {
    await page.goto('/');
    await injectState(page, {});
    const an = await page.evaluate(() => window.getAnalytics());
    expect(an).not.toBeNull();
    expect(an.uid).toBeTruthy();
    expect(Array.isArray(an.events)).toBe(true);
    const hasSession = an.events.some(e => e.n === 'session_start');
    expect(hasSession).toBe(true);
  });

  test('custom events log and D1/D7 retention is computable', async ({ page }) => {
    await page.goto('/');
    await injectState(page, {});
    await page.evaluate(() => window.trackEvent('match_completed', { test: true }));
    const an = await page.evaluate(() => window.getAnalytics());
    expect(an.events.some(e => e.n === 'match_completed')).toBe(true);

    const ret = await page.evaluate(() => window.computeRetention());
    expect(ret).not.toBeNull();
    expect(typeof ret.d1).toBe('boolean');
    expect(typeof ret.d7).toBe('boolean');
    expect(Array.isArray(ret.daysActive)).toBe(true);
    expect(ret.d0).toBe(true); // active on install day
  });

  test('analytics store is separate from the game save (offline-safe)', async ({ page }) => {
    await page.goto('/');
    await injectState(page, {});
    const keys = await page.evaluate(() => ({
      save: localStorage.getItem('cu_save_v3') != null,
      analytics: localStorage.getItem('cu_analytics_v1') != null
    }));
    expect(keys.save).toBe(true);
    expect(keys.analytics).toBe(true);
    // game still boots with analytics wiped
    await page.evaluate(() => localStorage.removeItem('cu_analytics_v1'));
    await page.reload();
    await page.waitForSelector('#loading.hide', { timeout: 10000 });
    await assertNoBootError(page);
  });
});
