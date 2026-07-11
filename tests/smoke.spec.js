const { test, expect } = require('@playwright/test');

async function dismissOverlays(page) {
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => {
      ['tut-overlay','mafia-overlay','scorecard-overlay'].forEach(id => {
        var el = document.getElementById(id);
        if (el) el.classList.remove('show');
      });
    });
    await page.waitForTimeout(500);
  }
}
async function dismissTutorial(page) { await dismissOverlays(page); }

async function setupGameState(page) {
  await page.evaluate(() => {
    const squad = [
      {id:'p1',name:'The Wall',role:'Top-Order Batter',bat:87,bwl:12,fld:65,fit:78,form:72,loyalty:82,greed:28,rarity:'epic',overseas:false},
      {id:'p2',name:'Quick Gun',role:'Top-Order Batter',bat:82,bwl:15,fld:58,fit:75,form:65,loyalty:45,greed:55,rarity:'rare',overseas:false},
      {id:'p3',name:'The Anchor',role:'Middle-Order Batter',bat:75,bwl:20,fld:60,fit:70,form:68,loyalty:70,greed:35,rarity:'uncommon',overseas:false},
      {id:'p4',name:'Power Hitter',role:'Middle-Order Batter',bat:78,bwl:10,fld:55,fit:72,form:70,loyalty:50,greed:45,rarity:'rare',overseas:true},
      {id:'p5',name:'Captain Cool',role:'All-Rounder',bat:68,bwl:65,fld:70,fit:80,form:74,loyalty:85,greed:20,rarity:'epic',overseas:false},
      {id:'p6',name:'Spin King',role:'Spin Bowler',bat:25,bwl:88,fld:55,fit:68,form:78,loyalty:75,greed:30,rarity:'epic',overseas:false},
      {id:'p7',name:'Speed Demon',role:'Fast Bowler',bat:15,bwl:85,fld:50,fit:82,form:72,loyalty:60,greed:40,rarity:'rare',overseas:true},
      {id:'p8',name:'The Keeper',role:'Wicket-Keeper',bat:62,bwl:8,fld:85,fit:76,form:66,loyalty:72,greed:32,rarity:'uncommon',overseas:false},
      {id:'p9',name:'Swing Master',role:'Fast Bowler',bat:20,bwl:80,fld:45,fit:75,form:70,loyalty:55,greed:38,rarity:'uncommon',overseas:true},
      {id:'p10',name:'The Finisher',role:'All-Rounder',bat:72,bwl:55,fld:65,fit:74,form:69,loyalty:48,greed:50,rarity:'rare',overseas:false},
      {id:'p11',name:'Mystery Man',role:'Spin Bowler',bat:18,bwl:78,fld:52,fit:70,form:67,loyalty:65,greed:35,rarity:'uncommon',overseas:true},
    ];
    const gs = {
      coins:5000,gems:50,blackMoney:30,alignment:0,heat:0,fans:50,
      season:1,matchNum:3,wins:1,losses:1,squad:squad,maxSquad:15,
      morale:75,auctionPurse:2000,strategy:'balanced',league:'gully',
      mafiaBonus:null,fanLoyalty:50,cleanStreak:0,
      sponsor:{tier:3,name:'Local Brand',purseBonus:0},
      rivalData:{},debts:[],noAlignMatches:0,
      evidence:[],investigation:null,tribunalBonus:0,
      captainId:'p5',selectedXI:['p1','p2','p3','p4','p5','p6','p7','p8','p9','p10','p11'],
      teamName:'Test XI',managerName:'Tester',teamColor:'gold',tutorialDone:true,
      seasonStats:{}
    };
    localStorage.setItem('cu_save_v3', JSON.stringify(gs));
  });
  await page.reload();
  await page.waitForSelector('#loading.hide', { timeout: 10000 });
}

test('game loads and shows hub', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#loading.hide', { timeout: 10000 });
  await dismissTutorial(page);
  const hub = page.locator('#hub-screen');
  await expect(hub).toBeVisible();
});

test('hub has cricket SVG icons', async ({ page }) => {
  await page.goto('/');
  await setupGameState(page);
  await expect(page.locator('#hub-auction-btn .tile-icon svg')).toBeVisible();
  await expect(page.locator('#hub-match-btn .tile-icon svg')).toBeVisible();
});

test('score display uses animated digit spans', async ({ page }) => {
  await page.goto('/');
  await setupGameState(page);
  await page.click('#hub-match-btn');
  await page.waitForTimeout(600);
  const ssOverlay = page.locator('.squad-select-overlay.show');
  if (await ssOverlay.count() > 0) {
    await page.click('#ss-auto-btn');
    await page.waitForTimeout(300);
    await page.click('#ss-confirm-btn');
  }
  await page.waitForSelector('#prematch-screen.active', { timeout: 5000 });
  await page.click('#start-match-btn');
  await page.waitForSelector('#match-screen.active', { timeout: 5000 });
  await page.waitForTimeout(2000);
  const scoreChars = page.locator('#match-score .score-char');
  expect(await scoreChars.count()).toBeGreaterThan(0);
});

test('bowler picker appears when bowling', async ({ page }) => {
  await page.goto('/');
  await setupGameState(page);

  for (let attempt = 0; attempt < 6; attempt++) {
    await dismissOverlays(page);
    await page.waitForTimeout(500);
    await dismissOverlays(page);
    await page.click('#hub-match-btn');
    await page.waitForTimeout(800);
    await dismissOverlays(page);
    const ssOverlay2 = page.locator('.squad-select-overlay.show');
    if (await ssOverlay2.count() > 0) {
      await page.click('#ss-auto-btn');
      await page.waitForTimeout(300);
      await page.click('#ss-confirm-btn');
    }
    await page.waitForSelector('#prematch-screen.active', { timeout: 5000 });
    await page.click('#start-match-btn');
    await page.waitForSelector('#match-screen.active', { timeout: 5000 });

    const statusText = await page.locator('#you-status').textContent();
    if (statusText.includes('BOWLING')) {
      await page.waitForSelector('#bowler-picker', { state: 'visible', timeout: 15000 });
      await expect(page.locator('#bowler-picker')).toBeVisible();
      expect(await page.locator('.bowler-opt').count()).toBeGreaterThan(0);
      return;
    }
    await page.click('#skip-btn');
    await page.waitForSelector('.match-result-overlay.show', { timeout: 10000 });
    await page.click('#match-continue-btn');
    await page.waitForSelector('#hub-screen.active', { timeout: 5000 });
    await page.waitForTimeout(500);
    await dismissOverlays(page);
  }
  test.skip();
});

test('pack opening has 3D card flip', async ({ page }) => {
  await page.goto('/');
  await setupGameState(page);
  await page.click('#hub-cards-btn');
  await page.waitForSelector('#cards-screen.active', { timeout: 5000 });
  await page.click('#pack-standard');
  await page.waitForTimeout(500);
  expect(await page.locator('.pack-flip-container').count()).toBeGreaterThan(0);
  await page.waitForTimeout(3000);
  expect(await page.locator('.pack-flip-inner.flipped').count()).toBeGreaterThan(0);
});

test('match engine produces valid scores', async ({ page }) => {
  await page.goto('/');
  await setupGameState(page);
  await dismissOverlays(page);
  await page.click('#hub-match-btn');
  await page.waitForTimeout(600);
  await dismissOverlays(page);
  const ssOverlay = page.locator('.squad-select-overlay.show');
  if (await ssOverlay.count() > 0) {
    await page.click('#ss-auto-btn');
    await page.waitForTimeout(300);
    await page.click('#ss-confirm-btn');
  }
  await page.waitForSelector('#prematch-screen.active', { timeout: 5000 });
  await page.click('#start-match-btn');
  await page.waitForSelector('#match-screen.active', { timeout: 5000 });
  await page.click('#skip-btn');
  await page.waitForSelector('.match-result-overlay.show', { timeout: 10000 });
  const scores = await page.locator('.result-scores').textContent();
  const hasRuns = /\d+\/\d+/.test(scores);
  expect(hasRuns).toBe(true);
  expect(scores).not.toMatch(/0\/0.*0\/0/);
});

test('Season Pass: hub panel, tier progression, claim + premium flow', async ({ page }) => {
  await page.goto('/');
  await setupGameState(page);
  await dismissOverlays(page);

  // Hub panel present
  await expect(page.locator('#hub-pass-panel')).toBeVisible();

  // Inject XP worth 2 tiers, refresh hub
  await page.evaluate(() => {
    GS.seasonPass = { xp: 150, premium: false, claimedFree: [], claimedPremium: [] };
    save(); updateHub();
  });
  await expect(page.locator('#hub-pass-tier')).toHaveText('2');

  // Open overlay → 10 tier rows render
  await page.click('#hub-pass-panel');
  await expect(page.locator('#pass-overlay')).toHaveClass(/show/);
  expect(await page.locator('.pass-tier-row').count()).toBe(10);

  // Claim free tier 1 → +100 coins, marked TAKEN
  const coinsBefore = await page.evaluate(() => GS.coins);
  await page.click('.pc-claim[data-track="free"][data-tier="0"]');
  const coinsAfterFree = await page.evaluate(() => GS.coins);
  expect(coinsAfterFree).toBe(coinsBefore + 100);
  await expect(page.locator('.pass-tier-row').first().locator('.pc-done')).toHaveText('TAKEN');

  // Premium cells locked until unlocked; unlock costs 150 gems
  await page.evaluate(() => { GS.gems = 200; updateCurrency(); });
  await page.click('#pass-premium-btn');
  await expect(page.locator('#pass-premium-btn')).toHaveClass(/owned/);
  expect(await page.evaluate(() => GS.gems)).toBe(50);

  // Claim premium tier 1 → +250 coins
  await page.click('.pc-claim[data-track="prem"][data-tier="0"]');
  expect(await page.evaluate(() => GS.coins)).toBe(coinsAfterFree + 250);

  // Unreached tier stays locked (no claim button on tier 3+)
  expect(await page.locator('.pc-claim[data-tier="4"]').count()).toBe(0);

  // Back closes overlay; claims persist in save
  await page.click('#pass-back-btn');
  await expect(page.locator('#pass-overlay')).not.toHaveClass(/show/);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('cu_save_v3')).seasonPass);
  expect(saved.claimedFree).toContain(0);
  expect(saved.claimedPremium).toContain(0);
  expect(saved.premium).toBe(true);
});

test('Vault store: opens & browses, but grants NOTHING while billing is off (BILLING_LIVE=false)', async ({ page }) => {
  await page.goto('/');
  await setupGameState(page);
  await dismissOverlays(page);

  // Tap coins chip → Vault opens with packs + "opens at launch" badge (payments not live)
  await page.click('#top-bar .currency.coins');
  await expect(page.locator('#store-overlay')).toHaveClass(/show/);
  await expect(page.locator('.store-testmode')).toContainText(/opens at launch/i);
  expect(await page.locator('#store-coins-grid .vault-pack').count()).toBe(3);
  expect(await page.locator('#store-gems-grid .vault-pack').count()).toBe(3);

  const coinsBefore = await page.evaluate(() => GS.coins);
  const gemsBefore = await page.evaluate(() => GS.gems);
  const purchasesBefore = await page.evaluate(() => GS.purchases.length);

  // Tapping a coin pack must NOT open the confirm sheet and must grant nothing
  await page.click('.vault-pack[data-pack="coins_m"]');
  await expect(page.locator('#store-confirm')).not.toHaveClass(/show/);
  expect(await page.evaluate(() => GS.coins)).toBe(coinsBefore);
  expect(await page.evaluate(() => GS.purchases.length)).toBe(purchasesBefore);

  // Defense-in-depth: even force-completing a purchase grants nothing
  const guarded = await page.evaluate(() => {
    if (typeof window.completePurchase !== 'function') return false;
    window.pendingPurchase = 'coins_m';
    window.completePurchase();
    return true;
  });
  expect(guarded).toBe(true);
  expect(await page.evaluate(() => GS.coins)).toBe(coinsBefore);
  expect(await page.evaluate(() => GS.purchases.length)).toBe(purchasesBefore);

  // Premium Contract must NOT flip season pass premium while billing is off
  await page.click('#store-pass-card');
  await expect(page.locator('#store-confirm')).not.toHaveClass(/show/);
  expect(await page.evaluate(() => GS.seasonPass.premium)).toBe(false);

  // Back closes; nothing was granted and nothing persisted to save
  await page.click('#store-back-btn');
  await expect(page.locator('#store-overlay')).not.toHaveClass(/show/);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('cu_save_v3')));
  expect(saved.purchases.length).toBe(purchasesBefore);
  expect(saved.gems).toBe(gemsBefore);
  expect(saved.seasonPass.premium).toBe(false);
});

test('PWA: manifest + service worker + app shell cache', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#loading.hide', { timeout: 10000 });

  // Manifest is linked and valid
  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(manifestHref).toBe('manifest.json');
  const manifest = await page.evaluate(() => fetch('manifest.json').then(r => r.json()));
  expect(manifest.name).toBe('Cricket Underworld');
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons.length).toBeGreaterThanOrEqual(3);

  // Service worker registers and activates
  const swActive = await page.evaluate(() =>
    navigator.serviceWorker.ready.then(reg => !!reg.active)
  );
  expect(swActive).toBe(true);

  // App shell precached (offline-capable)
  await page.waitForTimeout(1500);
  const cached = await page.evaluate(async () => {
    const keys = await caches.keys();
    if (!keys.length) return [];
    const cache = await caches.open(keys[0]);
    const reqs = await cache.keys();
    return reqs.map(r => new URL(r.url).pathname);
  });
  expect(cached).toContain('/index.html');
  expect(cached).toContain('/manifest.json');
});

test('Sponsor Break: rewarded ads — free pack, purse boost, post-match doubler, daily caps', async ({ page }) => {
  await page.goto('/');
  await setupGameState(page); // seed has no ads key — load() defaults it
  await dismissOverlays(page);

  async function watchAd() {
    await expect(page.locator('#ad-overlay')).toHaveClass(/show/);
    await expect(page.locator('#ad-brand')).not.toBeEmpty();
    await page.waitForSelector('#ad-claim-btn.ready', { timeout: 6000 });
    await page.click('#ad-claim-btn');
    await expect(page.locator('#ad-overlay')).not.toHaveClass(/show/);
  }

  // --- Free Sponsor Pack (Cards screen): +2 cards, zero cost ---
  await page.click('.nav-item[data-screen="cards"]');
  await page.waitForSelector('#cards-screen.active', { timeout: 5000 });
  await expect(page.locator('#pack-ad-btn')).toBeVisible();
  const before = await page.evaluate(() => ({ coins: GS.coins, gems: GS.gems, squad: GS.squad.length }));
  await page.click('#pack-ad-btn');
  await watchAd();
  await expect(page.locator('#pack-overlay')).toHaveClass(/show/);
  const afterPack = await page.evaluate(() => ({ coins: GS.coins, gems: GS.gems, squad: GS.squad.length, used: GS.ads.pack }));
  expect(afterPack.squad).toBe(before.squad + 2);
  expect(afterPack.coins).toBe(before.coins);
  expect(afterPack.gems).toBe(before.gems);
  expect(afterPack.used).toBe(1);
  await page.evaluate(() => $('pack-overlay').classList.remove('show'));
  await expect(page.locator('#pack-ad-btn')).toHaveClass(/used/); // cap 1/day

  // --- Purse boost (Auction screen): arm via ad, consumed on auction start ---
  await page.click('.nav-item[data-screen="auction"]');
  await page.waitForSelector('#auction-screen.active', { timeout: 5000 });
  await expect(page.locator('#ad-purse-btn')).toBeVisible();
  await page.click('#ad-purse-btn');
  await watchAd();
  expect(await page.evaluate(() => GS.ads.pendingPurse)).toBe(true);
  await expect(page.locator('#ad-purse-btn')).toHaveClass(/used/);
  await page.click('#start-auction-btn');
  const auctionState = await page.evaluate(() => ({ purse: GS.auctionPurse, coins: GS.coins, pending: GS.ads.pendingPurse }));
  expect(auctionState.purse).toBe(auctionState.coins + 300);
  expect(auctionState.pending).toBe(false);

  // --- Post-match coin doubler ---
  await page.click('.nav-item[data-screen="hub"]');
  await page.waitForSelector('#hub-screen.active', { timeout: 5000 });
  await dismissOverlays(page);
  await page.click('#hub-match-btn');
  await page.waitForTimeout(600);
  await dismissOverlays(page);
  const ssOverlay = page.locator('.squad-select-overlay.show');
  if (await ssOverlay.count() > 0) {
    await page.click('#ss-auto-btn');
    await page.waitForTimeout(300);
    await page.click('#ss-confirm-btn');
  }
  await page.waitForSelector('#prematch-screen.active', { timeout: 5000 });
  await page.click('#start-match-btn');
  await page.waitForSelector('#match-screen.active', { timeout: 5000 });
  await page.click('#skip-btn');
  await page.waitForSelector('.match-result-overlay.show', { timeout: 10000 });
  await expect(page.locator('#ad-boost-btn')).toBeVisible(); // coinR is always >= 30
  const coinsBeforeBoost = await page.evaluate(() => GS.coins);
  await page.click('#ad-boost-btn');
  await watchAd();
  const afterBoost = await page.evaluate(() => ({ coins: GS.coins, boost: GS.ads.boost }));
  expect(afterBoost.coins).toBeGreaterThan(coinsBeforeBoost);
  expect(afterBoost.boost).toBe(1); // cap is 3/day — 2 left
  await expect(page.locator('#ad-boost-btn')).toHaveClass(/used/);

  // --- Daily caps persist in save ---
  const savedAds = await page.evaluate(() => JSON.parse(localStorage.getItem('cu_save_v3')).ads);
  expect(savedAds.purse).toBe(1);
  expect(savedAds.pack).toBe(1);
  expect(savedAds.boost).toBe(1);
});

test('field placement setting appears in bowler picker', async ({ page }) => {
  await page.goto('/');
  await setupGameState(page);

  for (let attempt = 0; attempt < 6; attempt++) {
    await dismissTutorial(page);
    await page.click('#hub-match-btn');
    await page.waitForTimeout(600);
    await dismissTutorial(page);
    const ssOvl = page.locator('.squad-select-overlay.show');
    if (await ssOvl.count() > 0) {
      await page.click('#ss-auto-btn');
      await page.waitForTimeout(300);
      await page.click('#ss-confirm-btn');
    }
    await page.waitForSelector('#prematch-screen.active', { timeout: 5000 });
    await page.click('#start-match-btn');
    await page.waitForSelector('#match-screen.active', { timeout: 5000 });

    const statusText = await page.locator('#you-status').textContent();
    if (statusText.includes('BOWLING')) {
      await page.waitForSelector('#bowler-picker', { state: 'visible', timeout: 15000 });
      await expect(page.locator('.field-setting')).toBeVisible();
      await expect(page.locator('#fs-std')).toBeVisible();
      await page.click('#fs-atk');
      await expect(page.locator('#fs-atk.active-atk')).toBeVisible();
      await page.locator('.bowler-opt').first().click();
      const badge = page.locator('.fs-badge.atk');
      await expect(badge).toBeVisible({ timeout: 3000 });
      return;
    }
    await page.click('#skip-btn');
    await page.waitForSelector('.match-result-overlay.show', { timeout: 10000 });
    await page.click('#match-continue-btn');
    await page.waitForSelector('#hub-screen.active', { timeout: 5000 });
    await dismissTutorial(page);
  }
  test.skip();
});
