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

    // Store & Rewards drawer holds all monetization surfaces (demoted into it)
    await page.click('#drawer-rewards-toggle');

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

    await page.click('#drawer-rewards-toggle');
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

    await page.click('#drawer-rewards-toggle');
    await page.click('#hub-sponsor-tile');
    await expect(page.locator('#ad-overlay')).toHaveClass(/show/);
    await page.waitForSelector('#ad-claim-btn.ready', { timeout: 6000 });
    await page.click('#ad-claim-btn');
    await page.waitForTimeout(400);

    const after = await page.evaluate(() => window.GS.squad.length);
    expect(after).toBeGreaterThan(before); // free pack added cards
  });

  test('SAFETY: Vault store grants NO currency while billing is not live', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 2000, gems: 50 });

    const before = await page.evaluate(() => ({ c: window.GS.coins, g: window.GS.gems }));

    // Real UI path: open the Vault and tap a real coin pack tile.
    await page.click('#drawer-rewards-toggle');
    await page.click('#hub-vault-tile');
    await expect(page.locator('#store-overlay')).toHaveClass(/show/);
    await page.locator('#store-coins-grid .vault-pack').first().click();

    // Tapping a pack must NOT open the confirm dialog while billing is off.
    await expect(page.locator('#store-confirm')).not.toHaveClass(/show/);

    // Hard exploit-site guard: even reaching completePurchase directly grants nothing.
    const guarded = await page.evaluate(() => {
      if (typeof window.completePurchase !== 'function') return false; // fail loudly if not reachable
      window.pendingPurchase = 'gems_l'; // 800-gem pack
      window.completePurchase();
      return true;
    });
    expect(guarded).toBe(true); // proves the guard function was actually exercised

    const after = await page.evaluate(() => ({ c: window.GS.coins, g: window.GS.gems }));
    expect(after.c).toBe(before.c); // no free coins granted
    expect(after.g).toBe(before.g); // no free gems granted
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

// ============================================================
// P3 — REMOTE SINK + ACQUISITION (fleet D1/D7 pipeline)
// BUILD-SHEET-10K §5. Beacon POSTs the queued events to a pluggable
// endpoint; UTM/referrer land in the event stream (P2 done-criterion).
// ============================================================
test.describe('P3 — Remote analytics sink', () => {
  test('beacon POSTs queued events to the configured endpoint and advances the cursor', async ({ page }) => {
    const posts = [];
    await page.route('**/collect-test**', async route => {
      posts.push(JSON.parse(route.request().postData()));
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await page.goto('/');
    await injectState(page, {});
    await page.evaluate(() => {
      localStorage.setItem('cu_analytics_endpoint', 'https://sink.example/collect-test');
    });
    await page.reload();
    await page.waitForSelector('#loading.hide', { timeout: 10000 });
    await page.waitForTimeout(1500); // boot flush is async
    expect(posts.length).toBeGreaterThan(0);
    expect(posts[0].uid).toMatch(/^u_/);
    expect(Array.isArray(posts[0].events)).toBe(true);
    expect(posts[0].events.length).toBeGreaterThan(0);
    // cursor advanced: immediate re-flush has nothing to send
    const postCount = posts.length;
    await page.evaluate(() => window.flushAnalytics());
    await page.waitForTimeout(800);
    expect(posts.length).toBe(postCount);
    // a new event flows through the debounced flush
    await page.evaluate(() => window.trackEvent('purchase_stub', { sku: 'test' }));
    await page.waitForTimeout(5200);
    const flat = [].concat(...posts.map(p => p.events.map(e => e.n)));
    expect(flat).toContain('purchase_stub');
  });

  test('no endpoint configured -> zero network sends (local-only default)', async ({ page }) => {
    let outbound = 0;
    await page.route('**/collect-test**', async route => { outbound++; await route.fulfill({ status: 200, body: '{}' }); });
    await page.goto('/');
    await injectState(page, {});
    await page.evaluate(() => window.flushAnalytics());
    await page.waitForTimeout(600);
    expect(outbound).toBe(0);
    const an = await page.evaluate(() => window.getAnalytics());
    expect(an.sentIdx || 0).toBe(0);
  });

  test('UTM params + referrer are captured as acquisition first-touch', async ({ page }) => {
    await page.goto('/?utm_source=reddit&utm_medium=post&utm_campaign=wave1');
    await page.waitForSelector('#loading.hide', { timeout: 10000 });
    const an = await page.evaluate(() => window.getAnalytics());
    const acq = an.events.find(e => e.n === 'acquisition');
    expect(acq).toBeTruthy();
    expect(acq.p.source).toBe('reddit');
    expect(acq.p.campaign).toBe('wave1');
    expect(an.firstTouch).toBeTruthy();
    expect(an.firstTouch.source).toBe('reddit');
    // first-touch is sticky: a later visit with different UTM must not overwrite it
    await page.goto('/?utm_source=twitter&utm_campaign=wave2');
    await page.waitForSelector('#loading.hide', { timeout: 10000 });
    const an2 = await page.evaluate(() => window.getAnalytics());
    expect(an2.firstTouch.source).toBe('reddit');
  });
});

// ============================================================
// P0 — DEMO BLOCKER: tutorial-overlay pointer-block
// BUILD-SHEET-10K §6 P0. Done-criterion: fresh load → tap nav → screen switches.
// The onboarding scrim (#tut-overlay.show) must NEVER swallow nav taps.
// ============================================================
async function bootFresh(page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('#loading.hide', { timeout: 10000 });
  // onboarding fires ~600ms after loading hides on a first install
  await page.waitForSelector('#tut-overlay.show', { timeout: 8000 });
}

test.describe('P0 — Tutorial overlay must not block navigation', () => {
  test('fresh install: a single nav tap switches screen AND auto-dismisses the tutorial', async ({ page }) => {
    await bootFresh(page);
    await assertNoBootError(page);

    // start state: on hub, onboarding scrim up
    await expect(page.locator('#hub-screen')).toHaveClass(/active/);
    await expect(page.locator('#tut-overlay')).toHaveClass(/show/);

    // the fix: ONE tap on a nav item must switch screens (not be eaten by the scrim)
    await page.locator('.nav-item[data-screen="squad"]').click();

    await expect(page.locator('#squad-screen')).toHaveClass(/active/);
    await expect(page.locator('#tut-overlay')).not.toHaveClass(/show/);
    await assertNoBootError(page);

    // onboarding is marked done so it does not re-trigger next boot
    const done = await page.evaluate(() => JSON.parse(localStorage.getItem('cu_save_v3') || '{}').tutorialDone);
    expect(done).toBe(true);
  });

  test('the onboarding scrim is pointer-transparent while shown; only the card is interactive', async ({ page }) => {
    await bootFresh(page);
    const pe = await page.evaluate(() => ({
      overlay: getComputedStyle(document.getElementById('tut-overlay')).pointerEvents,
      card: getComputedStyle(document.getElementById('tut-card')).pointerEvents,
    }));
    expect(pe.overlay).toBe('none'); // scrim never blocks underlying taps
    expect(pe.card).toBe('auto');    // Next/Skip + swipe still work
  });

  test('the in-card Skip button still dismisses the tutorial', async ({ page }) => {
    await bootFresh(page);
    await page.locator('#tut-skip-btn').click();
    await expect(page.locator('#tut-overlay')).not.toHaveClass(/show/);
    const done = await page.evaluate(() => JSON.parse(localStorage.getItem('cu_save_v3') || '{}').tutorialDone);
    expect(done).toBe(true);
  });
});

// ============================================================
// CLOUD SAVE & BACKUP (playtest #4 — progress survives a new phone /
// cleared cache; prerequisite for real billing). Backup-code layer works
// with no infra; cloud layer is endpoint-pluggable like the analytics sink.
// ============================================================
test.describe('Cloud Save & Backup', () => {
  test('backup code round-trips the full save (coins, unicode name, squad)', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 4321, teamName: 'Śívá XI' });
    const r = await page.evaluate(() => {
      const code = window.exportSaveString();
      window.GS.coins = 1; window.GS.teamName = 'Wiped'; window.GS.squad = [];
      const ok = window.importSaveString(code);
      return { prefix: code.slice(0, 8), ok, coins: window.GS.coins, name: window.GS.teamName, squad: window.GS.squad.length };
    });
    expect(r.prefix).toBe('CUSAVE1:');
    expect(r.ok).toBe(true);
    expect(r.coins).toBe(4321);
    expect(r.name).toBe('Śívá XI');
    expect(r.squad).toBeGreaterThan(0);
  });

  test('a corrupt or garbage backup code is rejected, not applied', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 999 });
    const r = await page.evaluate(() => {
      const good = window.exportSaveString();
      return {
        corrupt: window.importSaveString(good.slice(0, -3) + 'zzz'),
        garbage: window.importSaveString('totally not a code'),
        empty: window.importSaveString(''),
        coinsIntact: window.GS.coins
      };
    });
    expect(r.corrupt).toBe(false);
    expect(r.garbage).toBe(false);
    expect(r.empty).toBe(false);
    expect(r.coinsIntact).toBe(999); // a rejected restore never touches live state
  });

  test('cloud backup + restore round-trips through a configured endpoint', async ({ page }) => {
    const store = {};
    await page.route('**/cloudsave-test**', async route => {
      const body = JSON.parse(route.request().postData());
      if (body.op === 'put') { store[body.code] = body.save; await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, code: body.code }) }); }
      else if (body.op === 'get') { const s = store[body.code]; await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(s ? { ok: true, save: s } : { ok: false, error: 'not-found' }) }); }
      else await route.fulfill({ status: 400, body: '{}' });
    });
    await page.goto('/');
    await injectState(page, { coins: 5150 });
    await page.evaluate(() => localStorage.setItem('cu_cloudsave_endpoint', 'https://cloud.example/cloudsave-test'));
    // back up, capture the code, wipe, restore
    const code = await page.evaluate(() => new Promise(res => {
      window.cloudBackup(function(ok) { res(ok ? window.GS.saveCode : null); });
    }));
    expect(code).toBeTruthy();
    await page.evaluate(() => { window.GS.coins = 7; });
    const restored = await page.evaluate((c) => new Promise(res => {
      window.cloudRestore(c, function(ok) { res({ ok: ok, coins: window.GS.coins }); });
    }), code);
    expect(restored.ok).toBe(true);
    expect(restored.coins).toBe(5150);
  });

  test('cloud restore reports not-found for an unknown code', async ({ page }) => {
    await page.route('**/cloudsave-test**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'not-found' }) });
    });
    await page.goto('/');
    await injectState(page, {});
    await page.evaluate(() => localStorage.setItem('cu_cloudsave_endpoint', 'https://cloud.example/cloudsave-test'));
    const r = await page.evaluate(() => new Promise(res => {
      window.cloudRestore('ZZZZZZ', function(ok, err) { res({ ok: ok, err: err }); });
    }));
    expect(r.ok).toBe(false);
    expect(r.err).toBe('not-found');
  });

  test('with no endpoint configured, cloud ops no-op and the backup section still works', async ({ page }) => {
    await page.goto('/');
    await injectState(page, {});
    const r = await page.evaluate(() => new Promise(res => {
      const enabled = window.cloudSaveEnabled();
      window.cloudBackup(function(ok, err) { res({ enabled: enabled, ok: ok, err: err, canExport: !!window.exportSaveString() }); });
    }));
    expect(r.enabled).toBe(false);
    expect(r.ok).toBe(false);
    expect(r.err).toBe('no-endpoint');
    expect(r.canExport).toBe(true); // offline backup code always available
  });
});
