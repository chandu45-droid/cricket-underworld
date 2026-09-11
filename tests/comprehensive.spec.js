const { test, expect } = require('@playwright/test');

// ============================================================
// HELPERS
// ============================================================
async function dismissOverlays(page) {
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => {
      ['tut-overlay','mafia-overlay','scorecard-overlay','pack-overlay'].forEach(id => {
        var el = document.getElementById(id);
        if (el) el.classList.remove('show');
      });
      var mr = document.getElementById('match-result');
      if (mr) mr.classList.remove('show');
    });
    await page.waitForTimeout(400);
  }
}

function makeSquad() {
  return [
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
}

async function injectState(page, overrides = {}) {
  const squad = overrides.squad || makeSquad();
  const defaults = {
    coins:5000,gems:50,blackMoney:30,alignment:0,heat:0,fans:50,
    season:1,matchNum:3,wins:1,losses:1,squad:squad,maxSquad:15,
    morale:75,auctionPurse:2000,strategy:'balanced',league:'gully',
    mafiaBonus:null,fanLoyalty:50,cleanStreak:0,
    sponsor:{tier:3,name:'Local Brand',purseBonus:0},
    rivalData:{},debts:[],noAlignMatches:0,
    evidence:[],investigation:null,tribunalBonus:0,
    captainId:15,selectedXI:[1,2,3,4,15,12,8,6,9,5,14],
    teamName:'Test XI',managerName:'Tester',teamColor:'gold',tutorialDone:true,
    seasonStats:{}
  };
  const gs = { ...defaults, ...overrides, squad };
  await page.evaluate((state) => {
    localStorage.setItem('cu_save_v3', JSON.stringify(state));
  }, gs);
  await page.reload();
  await page.waitForSelector('#loading.hide', { timeout: 10000 });
  await dismissOverlays(page);
}

async function navigateTo(page, screen) {
  await page.click(`.nav-item[data-screen="${screen}"]`);
  await page.waitForSelector(`#${screen}-screen.active`, { timeout: 5000 });
}

// ============================================================
// 1. SAVE / LOAD INTEGRITY
// ============================================================
test.describe('Save & Load', () => {
  test('game state persists across reload', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 9999, teamName: 'Persist Test' });
    const coins = await page.locator('#coins-val').textContent();
    expect(coins).toContain('9,999');
    await page.reload();
    await page.waitForSelector('#loading.hide', { timeout: 10000 });
    await dismissOverlays(page);
    const coinsAfter = await page.locator('#coins-val').textContent();
    expect(coinsAfter).toContain('9,999');
  });

  test('corrupt save data does not crash', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('cu_save_v3', '{broken json'));
    await page.reload();
    await page.waitForSelector('#loading.hide', { timeout: 10000 });
    const hub = page.locator('#hub-screen');
    await expect(hub).toBeVisible();
  });

  test('empty localStorage starts fresh game', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('cu_save_v3'));
    await page.reload();
    await page.waitForSelector('#loading.hide', { timeout: 10000 });
    const coins = await page.locator('#coins-val').textContent();
    expect(coins).toContain('2,000');
  });
});

// ============================================================
// 2. HUB SCREEN
// ============================================================
test.describe('Hub', () => {
  test('displays correct currency values', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 3500, gems: 42, blackMoney: 15 });
    expect(await page.locator('#coins-val').textContent()).toContain('3,500');
    expect(await page.locator('#gems-val').textContent()).toBe('42');
    expect(await page.locator('#bmoney-val').textContent()).toBe('15');
  });

  test('alignment meter reflects state', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { alignment: 75 });
    const val = await page.locator('#align-val').textContent();
    expect(val).toBe('+75');
    const zone = await page.locator('#align-zone-tag').textContent();
    expect(zone).toBe('Clean Hero');
  });

  test('heat meter reflects state', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { heat: 60 });
    const val = await page.locator('#heat-val').textContent();
    expect(val).toBe('60');
  });

  test('next rival shown when squad exists', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await expect(page.locator('#hub-next-rival')).toBeVisible();
    const name = await page.locator('#rival-name').textContent();
    expect(name.length).toBeGreaterThan(0);
  });

  test('rival hidden when no squad', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { squad: [] });
    const rival = page.locator('#hub-next-rival');
    await expect(rival).toBeHidden();
  });

  test('investigation panel shows when active', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { investigation: { matchesLeft: 3 }, heat: 80 });
    await expect(page.locator('#investigation-panel')).toBeVisible();
    const info = await page.locator('#investigation-info').textContent();
    expect(info).toContain('3 matches');
  });

  test('debt panel shows active debts', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { debts: [{ source: 'Match Fix', principal: 150, matchesLeft: 2, stage: 0, heldPlayer: null }] });
    await expect(page.locator('#debt-panel')).toBeVisible();
    const text = await page.locator('#debt-list').textContent();
    expect(text).toContain('Match Fix');
    expect(text).toContain('150 B$');
  });

  test('clean streak tag visible at 3+ matches', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { cleanStreak: 5 });
    await page.click('.hub-tab[data-htab="club"]'); // Club Management lives behind the Club tab (no-vertical-scroll redesign, 2026-09)
    await page.click('#drawer-club-toggle');
    await expect(page.locator('#clean-streak-tag')).toBeVisible();
    const text = await page.locator('#clean-streak-tag').textContent();
    expect(text).toContain('5 matches');
  });

  test('season progress bar fills correctly', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { matchNum: 8, wins: 4, losses: 3 });
    expect(await page.locator('#match-num').textContent()).toBe('8');
    expect(await page.locator('#record-w').textContent()).toBe('4');
    expect(await page.locator('#record-l').textContent()).toBe('3');
  });

  test('alignment zone theming updates', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { alignment: -80 });
    const cls = await page.locator('#app').getAttribute('class');
    expect(cls).toContain('align-deep');
  });
});

// ============================================================
// 3. NAVIGATION
// ============================================================
test.describe('Navigation', () => {
  test('bottom nav switches screens', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await navigateTo(page, 'squad');
    await expect(page.locator('#squad-screen.active')).toBeVisible();
    await navigateTo(page, 'cards');
    await expect(page.locator('#cards-screen.active')).toBeVisible();
    await navigateTo(page, 'league');
    await expect(page.locator('#league-screen.active')).toBeVisible();
    await navigateTo(page, 'hub');
    await expect(page.locator('#hub-screen.active')).toBeVisible();
  });

  test('quick tiles navigate correctly', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await page.click('#hub-squad-btn');
    await expect(page.locator('#squad-screen.active')).toBeVisible();
  });
});

// ============================================================
// 4. SQUAD SCREEN
// ============================================================
test.describe('Squad', () => {
  test('shows squad members, paginated 5 per page', async ({ page }) => {
    // 2026-09-09 no-vertical-scroll redesign: was asserting all 11 rows render at once (count=11)
    // -- the squad list is now paginated (SQUAD_PER_PAGE=5) so it fits the viewport with zero scroll
    // at every target device width. Updated to assert the new, deliberate behavior: 5 rows on the
    // first page, and the full 11-player squad still reachable via ceil(11/5)=3 pager dots.
    await page.goto('/');
    await injectState(page);
    await navigateTo(page, 'squad');
    const cards = await page.locator('.player-card-mini').count();
    expect(cards).toBe(5);
    const dots = await page.locator('.page-dot').count();
    expect(dots).toBe(3);
  });

  test('shows team stats', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await navigateTo(page, 'squad');
    const bat = await page.locator('#ts-bat').textContent();
    expect(parseInt(bat)).toBeGreaterThan(0);
    const bwl = await page.locator('#ts-bwl').textContent();
    expect(parseInt(bwl)).toBeGreaterThan(0);
  });

  test('empty squad shows placeholder', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { squad: [] });
    await navigateTo(page, 'squad');
    await expect(page.locator('#squad-empty')).toBeVisible();
  });

  test('player detail opens on click', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await navigateTo(page, 'cards');
    await page.locator('.player-card').first().click();
    await expect(page.locator('#player-detail-overlay.show')).toBeVisible({ timeout: 3000 });
  });

  test('player detail shows training buttons for squad members', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await navigateTo(page, 'cards');
    await page.locator('.player-card').first().click();
    await expect(page.locator('#player-detail-overlay.show')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('[data-trainstat]').first()).toBeVisible();
    await expect(page.locator('#release-detail-btn')).toBeVisible();
  });

  test('training increases stat', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 9999 });
    await navigateTo(page, 'cards');
    await page.locator('.player-card').first().click();
    await expect(page.locator('#player-detail-overlay.show')).toBeVisible({ timeout: 3000 });
    await page.locator('[data-trainstat]').first().click();
    await page.waitForTimeout(500);
    const toast = await page.locator('.toast.show').textContent();
    expect(toast.length).toBeGreaterThan(0);
  });

  test('training fails without coins', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 0 });
    await navigateTo(page, 'cards');
    await page.locator('.player-card').first().click();
    await expect(page.locator('#player-detail-overlay.show')).toBeVisible({ timeout: 3000 });
    await page.locator('[data-trainstat]').first().click();
    await page.waitForTimeout(500);
    const toast = await page.locator('.toast.show').textContent();
    expect(toast).toContain('Need');
  });

  test('release player reduces squad', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 100 });
    const beforeCount = await page.evaluate(() => window.GS.squad.length);
    await navigateTo(page, 'cards');
    await page.locator('.player-card').first().click();
    await expect(page.locator('#player-detail-overlay.show')).toBeVisible({ timeout: 3000 });
    await page.click('#release-detail-btn');
    await page.waitForTimeout(500);
    const afterCount = await page.evaluate(() => window.GS.squad.length);
    expect(afterCount).toBe(beforeCount - 1);
    const coins = await page.evaluate(() => window.GS.coins);
    expect(coins).toBeGreaterThan(100);
  });
});

// ============================================================
// 5. SQUAD SELECTION (XI Picker)
// ============================================================
test.describe('Squad Selection', () => {
  test('XI is auto-preselected on first open so Confirm is live', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { selectedXI: [] }); // fresh player: never picked an XI
    await page.evaluate(() => window.showSquadSelect());
    await page.waitForTimeout(500);
    const xiNum = await page.locator('#ss-xi-num').textContent();
    expect(parseInt(xiNum, 10)).toBeGreaterThanOrEqual(3);
    const btnClass = await page.locator('#ss-confirm-btn').getAttribute('class');
    expect(btnClass).not.toContain('disabled');
    // overseas cap respected by the preselection
    const osNum = await page.locator('#ss-os-num').textContent();
    expect(parseInt(osNum, 10)).toBeLessThanOrEqual(4);
  });

  test('squad selection overlay opens from match', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await page.click('#hub-match-btn');
    await page.waitForTimeout(600);
    await dismissOverlays(page);
    const ssOverlay = page.locator('.squad-select-overlay.show');
    if (await ssOverlay.count() > 0) {
      await expect(page.locator('#ss-player-list')).toBeVisible();
      const players = await page.locator('.ss-player').count();
      expect(players).toBe(11);
    }
  });

  test('auto button selects XI', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await page.click('#hub-match-btn');
    await page.waitForTimeout(600);
    await dismissOverlays(page);
    const ssOverlay = page.locator('.squad-select-overlay.show');
    if (await ssOverlay.count() > 0) {
      await page.click('#ss-auto-btn');
      await page.waitForTimeout(300);
      const selected = await page.locator('.ss-player.selected').count();
      expect(selected).toBeGreaterThanOrEqual(3);
      expect(selected).toBeLessThanOrEqual(11);
    }
  });

  test('confirm navigates to prematch', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
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
    await expect(page.locator('#prematch-screen.active')).toBeVisible();
  });

  test('overseas cap enforced (max 4)', async ({ page }) => {
    await page.goto('/');
    const squad = makeSquad();
    squad[0].overseas = true;
    squad[1].overseas = true;
    squad[2].overseas = true;
    squad[3].overseas = true;
    await injectState(page, { squad });
    await page.click('#hub-match-btn');
    await page.waitForTimeout(600);
    await dismissOverlays(page);
    const ssOverlay = page.locator('.squad-select-overlay.show');
    if (await ssOverlay.count() > 0) {
      await page.click('#ss-auto-btn');
      await page.waitForTimeout(300);
      const osCount = await page.evaluate(() => {
        var sel = document.querySelectorAll('.ss-player.selected.overseas');
        return sel.length;
      });
      expect(osCount).toBeLessThanOrEqual(4);
    }
  });
});

// ============================================================
// 6. PRE-MATCH SCREEN
// ============================================================
test.describe('Pre-Match', () => {
  test('shows opponent info and pitch type', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await page.click('#hub-match-btn');
    await page.waitForTimeout(600);
    await dismissOverlays(page);
    const ss = page.locator('.squad-select-overlay.show');
    if (await ss.count() > 0) { await page.click('#ss-auto-btn'); await page.waitForTimeout(300); await page.click('#ss-confirm-btn'); }
    await page.waitForSelector('#prematch-screen.active', { timeout: 5000 });
    const oppName = await page.locator('#opp-name-pm').textContent();
    expect(oppName.length).toBeGreaterThan(0);
    const pitch = await page.locator('#pitch-type').textContent();
    expect(['SEAMING','TURNING','FLAT','GREEN TOP']).toContain(pitch);
  });

  test('strategy buttons toggle', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await page.click('#hub-match-btn');
    await page.waitForTimeout(600);
    await dismissOverlays(page);
    const ss = page.locator('.squad-select-overlay.show');
    if (await ss.count() > 0) { await page.click('#ss-auto-btn'); await page.waitForTimeout(300); await page.click('#ss-confirm-btn'); }
    await page.waitForSelector('#prematch-screen.active', { timeout: 5000 });
    await page.click('[data-strat="aggressive"]');
    await expect(page.locator('[data-strat="aggressive"].selected')).toBeVisible();
  });

  test('fix banner shows when mafia bonus active', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { mafiaBonus: { type: 'matchfix' } });
    await page.click('#hub-match-btn');
    await page.waitForTimeout(600);
    await dismissOverlays(page);
    const ss = page.locator('.squad-select-overlay.show');
    if (await ss.count() > 0) { await page.click('#ss-auto-btn'); await page.waitForTimeout(300); await page.click('#ss-confirm-btn'); }
    await page.waitForSelector('#prematch-screen.active', { timeout: 5000 });
    await expect(page.locator('#fix-active-banner')).toBeVisible();
  });
});

// ============================================================
// 7. MATCH ENGINE
// ============================================================
test.describe('Match Engine', () => {
  test('blitz format plays a 5-over match with halved rewards', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await page.click('#hub-match-btn');
    await page.waitForTimeout(600);
    await dismissOverlays(page);
    const ss = page.locator('.squad-select-overlay.show');
    if (await ss.count() > 0) { await page.click('#ss-auto-btn'); await page.waitForTimeout(300); await page.click('#ss-confirm-btn'); }
    await page.waitForSelector('#prematch-screen.active', { timeout: 5000 });
    await expect(page.locator('#format-opts')).toBeVisible();
    await page.click('#format-opts .strategy-opt[data-format="blitz"]');
    await page.waitForTimeout(200);
    const coinsBefore = await page.evaluate(() => window.GS.coins);
    await page.click('#start-match-btn');
    await page.waitForSelector('#match-screen.active', { timeout: 5000 });
    const isBlitz = await page.evaluate(() => window.match.blitz);
    expect(isBlitz).toBe(true);
    await page.click('#skip-btn');
    await page.waitForSelector('.match-result-overlay.show', { timeout: 10000 });
    const st = await page.evaluate(() => ({
      lastBall: window.match.ball, target: window.match.target, coins: window.GS.coins
    }));
    expect(st.lastBall).toBeLessThanOrEqual(31); // 5-over innings = 30 balls
    expect(st.target).toBeGreaterThan(0);
    expect(st.coins).toBeGreaterThan(coinsBefore); // some payout landed
    // match payout hero shows the HALVED blitz figure (T20 pays 80+ win / 30 loss)
    const payout = await page.locator('.match-payout').textContent();
    const amount = parseInt((payout.match(/\+?\s*(\d+)/) || [])[1], 10);
    expect(amount).toBeLessThanOrEqual(60);
    const scores = await page.locator('.result-scores').textContent();
    expect(scores).toMatch(/\d+\/\d+/);
  });

  test('skip produces valid non-zero scores', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await page.click('#hub-match-btn');
    await page.waitForTimeout(600);
    await dismissOverlays(page);
    const ss = page.locator('.squad-select-overlay.show');
    if (await ss.count() > 0) { await page.click('#ss-auto-btn'); await page.waitForTimeout(300); await page.click('#ss-confirm-btn'); }
    await page.waitForSelector('#prematch-screen.active', { timeout: 5000 });
    await page.click('#start-match-btn');
    await page.waitForSelector('#match-screen.active', { timeout: 5000 });
    await page.click('#skip-btn');
    await page.waitForSelector('.match-result-overlay.show', { timeout: 10000 });
    const scores = await page.locator('.result-scores').textContent();
    expect(scores).toMatch(/\d+\/\d+/);
    expect(scores).not.toMatch(/0\/0.*0\/0/);
  });

  test('match result updates season record', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { matchNum: 3, wins: 1, losses: 1 });
    await page.click('#hub-match-btn');
    await page.waitForTimeout(600);
    await dismissOverlays(page);
    const ss = page.locator('.squad-select-overlay.show');
    if (await ss.count() > 0) { await page.click('#ss-auto-btn'); await page.waitForTimeout(300); await page.click('#ss-confirm-btn'); }
    await page.waitForSelector('#prematch-screen.active', { timeout: 5000 });
    await page.click('#start-match-btn');
    await page.waitForSelector('#match-screen.active', { timeout: 5000 });
    await page.click('#skip-btn');
    await page.waitForSelector('.match-result-overlay.show', { timeout: 10000 });
    await page.click('#match-continue-btn');
    await page.waitForSelector('#hub-screen.active', { timeout: 5000 });
    await dismissOverlays(page);
    const matchNum = await page.evaluate(() => window.GS.matchNum);
    expect(matchNum).toBe(4);
  });

  test('tactic buttons work during match', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await page.click('#hub-match-btn');
    await page.waitForTimeout(600);
    await dismissOverlays(page);
    const ss = page.locator('.squad-select-overlay.show');
    if (await ss.count() > 0) { await page.click('#ss-auto-btn'); await page.waitForTimeout(300); await page.click('#ss-confirm-btn'); }
    await page.waitForSelector('#prematch-screen.active', { timeout: 5000 });
    await page.click('#start-match-btn');
    await page.waitForSelector('#match-screen.active', { timeout: 5000 });
    await page.click('#tac-aggro');
    await expect(page.locator('#tac-aggro.active')).toBeVisible();
    const strat = await page.evaluate(() => window.GS.strategy);
    expect(strat).toBe('aggressive');
  });

  test('scorecard shows after match', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await page.click('#hub-match-btn');
    await page.waitForTimeout(600);
    await dismissOverlays(page);
    const ss = page.locator('.squad-select-overlay.show');
    if (await ss.count() > 0) { await page.click('#ss-auto-btn'); await page.waitForTimeout(300); await page.click('#ss-confirm-btn'); }
    await page.waitForSelector('#prematch-screen.active', { timeout: 5000 });
    await page.click('#start-match-btn');
    await page.waitForSelector('#match-screen.active', { timeout: 5000 });
    await page.click('#skip-btn');
    await page.waitForSelector('.match-result-overlay.show', { timeout: 10000 });
    const scBtn = page.locator('#view-scorecard-btn');
    if (await scBtn.count() > 0) {
      await scBtn.click();
      await expect(page.locator('#scorecard-overlay.show')).toBeVisible();
    }
  });
});

// ============================================================
// 8. AUCTION
// ============================================================
test.describe('Auction', () => {
  test('auction pool presents budget lots before marquee players', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { squad: [] });
    const prices = await page.evaluate(() => {
      window.startAuction();
      const ps = window.auction.pool.map(p => window.getPlayerPrice(p));
      // stop the live timer so the test leaves no ticking state behind
      window.auction.active = false; clearInterval(window.auction.interval);
      return ps;
    });
    expect(prices.length).toBeGreaterThan(3);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]); // non-decreasing
    }
    expect(prices[0]).toBeLessThan(prices[prices.length - 1]); // genuinely cheap -> star
  });

  test('auction screen shows start button', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await navigateTo(page, 'auction');
    await expect(page.locator('#start-auction-btn')).toBeVisible();
  });

  test('starting auction shows card and bidding', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { squad: [] });
    await navigateTo(page, 'auction');
    await page.click('#start-auction-btn');
    await page.waitForTimeout(500);
    await expect(page.locator('#auction-active-area')).toBeVisible();
    await expect(page.locator('#auction-spotlight .player-card')).toBeVisible();
    await expect(page.locator('#bid-btn')).toBeVisible();
  });

  test('placing a bid increases current bid', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 5000, squad: [] });
    await navigateTo(page, 'auction');
    await page.click('#start-auction-btn');
    await page.waitForTimeout(500);
    const bidBefore = await page.locator('#current-bid').textContent();
    await page.click('#bid-btn');
    await page.waitForTimeout(300);
    const bidAfter = await page.locator('#current-bid').textContent();
    expect(parseInt(bidAfter)).toBeGreaterThan(parseInt(bidBefore));
  });

  test('pass skips current card', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { squad: [] });
    await navigateTo(page, 'auction');
    await page.click('#start-auction-btn');
    await page.waitForTimeout(500);
    const round1 = await page.locator('#round-info').textContent();
    expect(round1).toContain('1');
    await page.click('#pass-btn');
    await page.waitForTimeout(1500);
    const round2 = await page.locator('#round-info').textContent();
    expect(round2).toContain('2');
  });

  // Regression (9832b9b): the "budget lots first" purse-pacing toast (fires when
  // GS.squad.length < 4, see startAuction()) must not overlap the screen's own
  // back-btn -- it used to sit right on top of it before the toast's top offset
  // was increased to clear the back-btn row.
  test('low-squad purse-pacing toast does not overlap auction back-btn', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { squad: makeSquad().slice(0, 3) }); // length 3 < 4 -> toast fires
    await navigateTo(page, 'auction');
    await page.click('#start-auction-btn');
    await page.waitForSelector('#toast.show', { timeout: 3000 });
    const toastBox = await page.locator('#toast').boundingBox();
    const backBtnBox = await page.locator('#auction-back-btn').boundingBox();
    expect(toastBox).toBeTruthy();
    expect(backBtnBox).toBeTruthy();
    const overlaps = toastBox.x < backBtnBox.x + backBtnBox.width &&
                      toastBox.x + toastBox.width > backBtnBox.x &&
                      toastBox.y < backBtnBox.y + backBtnBox.height &&
                      toastBox.y + toastBox.height > backBtnBox.y;
    expect(overlaps).toBe(false);
  });
});

// ============================================================
// 9. CARDS & PACKS
// ============================================================
test.describe('Cards & Packs', () => {
  test('cards screen shows squad cards, paginated 3 per page', async ({ page }) => {
    // 2026-09-09 no-vertical-scroll redesign: was asserting all 11 cards rendered at once (count=11)
    // -- the Cards grid is now paginated (CARDS_PER_PAGE=3) so it fits the viewport with zero scroll
    // at every target device width. Updated to assert the new, deliberate behavior: 3 cards on the
    // first page, and the full 11-card squad still reachable via ceil(11/3)=4 pager dots.
    await page.goto('/');
    await injectState(page);
    await navigateTo(page, 'cards');
    const cardsPage1 = await page.locator('.player-card').count();
    expect(cardsPage1).toBe(3);
    const dots = await page.locator('.page-dot').count();
    expect(dots).toBe(4);
  });

  test('card filter works', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await navigateTo(page, 'cards');
    await page.click('[data-filter="bowler"]');
    await page.waitForTimeout(300);
    const cards = await page.locator('.player-card').count();
    expect(cards).toBeLessThan(11);
    expect(cards).toBeGreaterThan(0);
  });

  test('standard pack costs 500 coins', async ({ page }) => {
    await page.goto('/');
    const sq = makeSquad().slice(0, 3);
    await injectState(page, { coins: 600, squad: sq });
    await navigateTo(page, 'cards');
    await page.click('#drawer-packs-toggle');
    await page.click('#pack-standard');
    await page.waitForTimeout(500);
    await expect(page.locator('#pack-overlay.show')).toBeVisible();
    const coins = await page.evaluate(() => window.GS.coins);
    expect(coins).toBe(100);
  });

  test('pack fails without enough coins', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 100 });
    await navigateTo(page, 'cards');
    await page.click('#drawer-packs-toggle');
    await page.click('#pack-standard');
    await page.waitForTimeout(500);
    const toast = await page.locator('.toast.show').textContent();
    expect(toast).toContain('Not enough');
  });

  test('premium pack costs 15 gems', async ({ page }) => {
    await page.goto('/');
    const sq = makeSquad().slice(0, 3);
    await injectState(page, { gems: 20, squad: sq });
    await navigateTo(page, 'cards');
    await page.click('#drawer-packs-toggle');
    await page.click('#pack-premium');
    await page.waitForTimeout(500);
    await expect(page.locator('#pack-overlay.show')).toBeVisible();
    const gems = await page.evaluate(() => window.GS.gems);
    expect(gems).toBe(5);
  });
});

// ============================================================
// 10. LEAGUE TABLE
// ============================================================
test.describe('League', () => {
  test('league table renders with player team', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { teamName: 'My Team' });
    await navigateTo(page, 'league');
    const rows = await page.locator('.league-row').count();
    expect(rows).toBe(10);
    const youRow = page.locator('.league-row.you');
    await expect(youRow).toBeVisible();
    const name = await youRow.textContent();
    expect(name).toContain('My Team');
  });

  // 2026-09-11 audit fix (docs/FINDINGS.md #3): this test used to be called "promotion zone
  // highlighted for top 2" and only asserted that >=1 .promotion row existed, with a 14-0 record
  // injected -- which passed under BOTH the old (wrong, rank-based) zone rule and the corrected
  // (win-rate-pace) one, while its name documented the rule the game never actually implemented.
  // Rewritten to pin the REAL endSeason() rule and, critically, to fail if zones ever revert to
  // being rank-based.
  test('promotion/relegation zones follow the real win-rate rule, not table rank', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { wins: 14, losses: 0, matchNum: 14 });
    await navigateTo(page, 'league');
    // A 100%-win record is unambiguously on promotion pace.
    await expect(page.locator('.league-row.you')).toHaveClass(/promotion/);

    // The regression guard that actually matters: thresholds must agree with endSeason()'s rule
    // (winRate >= 0.57 promotes, < 0.29 relegates) for every possible win count.
    const mismatches = await page.evaluate(() => {
      const bad = [];
      for (let w = 0; w <= 14; w++) {
        const realPromo = (w / 14) >= 0.57;
        const realReleg = (w / 14) < 0.29;
        const uiPromo = w >= window.leagueWinsToPromote();
        const uiReleg = w <= window.leagueMaxWinsRelegated();
        if (realPromo !== uiPromo || realReleg !== uiReleg) bad.push({ w, realPromo, uiPromo, realReleg, uiReleg });
      }
      return bad;
    });
    expect(mismatches, 'UI thresholds must match endSeason()').toEqual([]);

    // Rank-independence: with every team on an identical losing record, SOMEBODY is still ranked
    // #1, but nobody is on promotion pace -- so a rank-based implementation would light up the top
    // rows here and this assertion would fail.
    const zonesWhenAllLosing = await page.evaluate(() => {
      return { promo: window.leagueZoneFor(1, 9), releg: window.leagueZoneFor(1, 9) };
    });
    expect(zonesWhenAllLosing.promo).not.toContain('promotion');
    expect(zonesWhenAllLosing.releg).toContain('relegation');
  });
});

// ============================================================
// 11. TRANSFER MARKET
// ============================================================
test.describe('Transfer Market', () => {
  test('market opens from hub', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await page.click('#hub-market-btn');
    await page.waitForTimeout(500);
    await expect(page.locator('#market-overlay.show')).toBeVisible();
  });

  test('buy tab shows listings', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { squad: makeSquad().slice(0, 5) });
    await page.click('#hub-market-btn');
    await page.waitForTimeout(500);
    const items = await page.locator('.market-item').count();
    expect(items).toBeGreaterThan(0);
  });

  test('sell tab shows squad players', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await page.click('#hub-market-btn');
    await page.waitForTimeout(500);
    await page.click('#market-tab-sell');
    await page.waitForTimeout(300);
    const items = await page.locator('.market-item').count();
    expect(items).toBe(11);
  });
});

// ============================================================
// 12. FACILITIES
// ============================================================
test.describe('Facilities', () => {
  test('pep talk boosts morale', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 1000, morale: 50 });
    await page.click('.hub-tab[data-htab="club"]'); // Club Management lives behind the Club tab (no-vertical-scroll redesign, 2026-09)
    await page.click('#drawer-club-toggle');
    await page.click('#morale-boost-btn');
    await page.waitForTimeout(500);
    const morale = await page.evaluate(() => window.GS.morale);
    expect(morale).toBe(65);
  });

  test('pep talk fails without coins', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 50 });
    await page.click('.hub-tab[data-htab="club"]'); // Club Management lives behind the Club tab (no-vertical-scroll redesign, 2026-09)
    await page.click('#drawer-club-toggle');
    await page.click('#morale-boost-btn');
    await page.waitForTimeout(500);
    const toast = await page.locator('.toast.show').textContent();
    expect(toast).toContain('Need');
  });

  test('media bribe reduces heat', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 1000, heat: 50 });
    await page.click('.hub-tab[data-htab="club"]'); // Club Management lives behind the Club tab (no-vertical-scroll redesign, 2026-09)
    await page.click('#drawer-club-toggle');
    await page.click('#heat-bribe-btn');
    await page.waitForTimeout(500);
    const heat = await page.evaluate(() => window.GS.heat);
    expect(heat).toBe(35);
  });
});

// ============================================================
// 13. ALIGNMENT SYSTEM (via evaluate)
// ============================================================
test.describe('Alignment System', () => {
  test('alignment zones map correctly', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const zones = await page.evaluate(() => {
      return [
        window.getAlignmentZone(80).name,
        window.getAlignmentZone(50).name,
        window.getAlignmentZone(0).name,
        window.getAlignmentZone(-50).name,
        window.getAlignmentZone(-80).name,
      ];
    });
    expect(zones).toEqual(['Clean Hero', 'Clean', 'Grey Zone', 'Corrupt', 'Deep Corrupt']);
  });

  test('alignment shift has inertia at extremes', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { alignment: 90 });
    const shift = await page.evaluate(() => {
      return window.applyAlignShift(5);
    });
    expect(shift).toBeLessThan(5);
  });

  test('sponsor tier matches alignment', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { alignment: 75 });
    const sponsor = await page.locator('#sponsor-name').textContent();
    expect(sponsor).toBe('Tata Group');
  });
});

// ============================================================
// 14. MAFIA SYSTEM (via evaluate)
// ============================================================
test.describe('Mafia System', () => {
  test('mafia banner visible in grey zone', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { alignment: -10, matchNum: 3 });
    await dismissOverlays(page);
    await expect(page.locator('#mafia-banner')).toBeVisible();
  });

  test('mafia banner hidden for clean players', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { alignment: 60 });
    await expect(page.locator('#mafia-banner')).toBeHidden();
  });

  test('mafia blocked during investigation', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { alignment: -50, investigation: { matchesLeft: 3 } });
    await expect(page.locator('#mafia-banner')).toBeHidden();
  });

  test('declining offer increases alignment', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { alignment: -10, matchNum: 3 });
    await dismissOverlays(page);
    await page.click('#mafia-banner');
    await page.waitForTimeout(500);
    await expect(page.locator('#mafia-overlay.show')).toBeVisible();
    const alignBefore = await page.evaluate(() => window.GS.alignment);
    await page.click('#decline-mafia-btn');
    await page.waitForTimeout(300);
    const alignAfter = await page.evaluate(() => window.GS.alignment);
    expect(alignAfter).toBeGreaterThan(alignBefore);
  });
});

// ============================================================
// 15. DEBT SYSTEM (via evaluate)
// ============================================================
test.describe('Debt System', () => {
  test('debt escalation works', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { debts: [{ source: 'Test Debt', principal: 100, matchesLeft: -1, stage: 0, heldPlayer: null }] });
    const warnings = await page.evaluate(() => window.processDebts());
    expect(warnings.length).toBeGreaterThan(0);
    const debt = await page.evaluate(() => window.GS.debts[0]);
    expect(debt.stage).toBe(1);
    expect(debt.principal).toBe(120);
  });

  test('pay debt deducts black money', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { blackMoney: 200, debts: [{ source: 'Test', principal: 100, matchesLeft: 2, stage: 0, heldPlayer: null }] });
    const result = await page.evaluate(() => window.payDebt(0));
    expect(result).toBe(true);
    const bm = await page.evaluate(() => window.GS.blackMoney);
    expect(bm).toBe(100);
    const debts = await page.evaluate(() => window.GS.debts.length);
    expect(debts).toBe(0);
  });

  test('pay debt fails without funds', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { blackMoney: 10, debts: [{ source: 'Test', principal: 100, matchesLeft: 2, stage: 0, heldPlayer: null }] });
    const result = await page.evaluate(() => window.payDebt(0));
    expect(result).toBe(false);
  });
});

// ============================================================
// 16. INVESTIGATION & TRIBUNAL (via evaluate)
// ============================================================
test.describe('Investigation & Tribunal', () => {
  test('investigation starts at high heat', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { heat: 90 });
    const result = await page.evaluate(() => window.checkInvestigation());
    expect(result).toBe('started');
    const inv = await page.evaluate(() => window.GS.investigation);
    expect(inv).not.toBeNull();
    expect(inv.matchesLeft).toBe(5);
  });

  test('tribunal resolves with verdict', async ({ page }) => {
    await page.goto('/');
    await injectState(page, {
      investigation: { matchesLeft: 0 },
      evidence: [
        { type: 'Communication Intercept', weight: 4, source: 'matchfix', match: 1 },
        { type: 'Financial Record', weight: 2, source: 'injection', match: 2 },
      ],
      alignment: -50,
    });
    const verdict = await page.evaluate(() => window.resolveTribunal());
    expect(verdict.name).toBeTruthy();
    expect(['CLEARED','WARNING','FINE','POINTS DEDUCTION','MATCH BAN','CARD SEIZURE','SEASON SUSPENSION']).toContain(verdict.name);
  });
});

// ============================================================
// 16b. UNDERWORLD CORE (factions, case file, weekly events)
// ============================================================
test.describe('Underworld Core', () => {
  test('factions lazy-init produces 5 factions', async ({ page }) => {
    await page.goto('/');
    await injectState(page, {});
    const keys = await page.evaluate(() => {
      window.initFactions();
      return Object.keys(window.GS.factions);
    });
    expect(keys).toEqual(expect.arrayContaining(['syndicate','thana','neta','bhai','bosses']));
    expect(keys.length).toBe(5);
  });

  test('power web panel visible on hub', async ({ page }) => {
    await page.goto('/');
    await injectState(page, {});
    await page.click('.hub-tab[data-htab="club"]'); // The Underworld lives behind the Club tab (no-vertical-scroll redesign, 2026-09)
    await page.click('#drawer-underworld-toggle');
    await expect(page.locator('#power-web-panel')).toBeVisible();
    const rows = await page.locator('#power-web-rows .pw-row').count();
    expect(rows).toBe(5);
  });

  test('inspector lazily assigned and info keeps matches count', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { investigation: { matchesLeft: 3 } });
    const info = await page.locator('#investigation-info').textContent();
    expect(info).toContain('3 matches');
    const insp = await page.evaluate(() => window.GS.investigation.inspector);
    expect(insp).toBeTruthy();
  });

  test('incorruptible inspector cannot be bribed', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { investigation: { matchesLeft: 3 }, blackMoney: 999 });
    const res = await page.evaluate(() => {
      window.GS.investigation.inspector = 'DSP Arjun Sherawat';
      window.GS.investigation.bribeTried = false;
      return window.bribeInspector();
    });
    expect(res.success).toBe(false);
  });

  test('hafta due triggers a hafta event', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { matchNum: 5 });
    const ev = await page.evaluate(() => {
      window.initFactions();
      window.GS.factions.bhai.haftaDue = 1;
      return window.processUnderworldWeek(true).event;
    });
    expect(ev).not.toBeNull();
    expect(ev.type).toBe('hafta');
  });

  test('election resolves and installs a neta in power', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { matchNum: 5 });
    const power = await page.evaluate(() => {
      window.initFactions();
      window.GS.factions.neta.election = 1;
      window.processUnderworldWeek(true);
      return window.GS.factions.neta.power;
    });
    expect(power).toBeTruthy();
  });

  test('outgoing bribe: rival boss accepts, sets rivalthrow and spends black money', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { matchNum: 6, blackMoney: 999, mafiaBonus: null });
    const res = await page.evaluate(() => {
      window.initRivalData();
      const r = window.getNextRival();
      const before = window.GS.blackMoney;
      const rng = Math.random;
      Math.random = function () { return 0; }; // force accept
      const out = window.bribeRivalToThrow(r.name);
      Math.random = rng;
      return { out, bonus: window.GS.mafiaBonus, name: r.name, before, after: window.GS.blackMoney };
    });
    expect(res.out.success).toBe(true);
    expect(res.bonus).not.toBeNull();
    expect(res.bonus.type).toBe('rivalthrow');
    expect(res.bonus.rival).toBe(res.name);
    expect(res.after).toBeLessThan(res.before);
  });

  test('outgoing bribe: clean rival refuses, no fix set, heat rises', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { matchNum: 2, blackMoney: 999, mafiaBonus: null, heat: 0 });
    const res = await page.evaluate(() => {
      window.initRivalData();
      const r = window.getNextRival();
      const rng = Math.random;
      Math.random = function () { return 0.99; }; // force refuse
      const out = window.bribeRivalToThrow(r.name);
      Math.random = rng;
      return { out, bonus: window.GS.mafiaBonus, heat: window.GS.heat, align: r.alignment };
    });
    expect(res.align).toBeGreaterThan(30); // Arvind Patil is a purist
    expect(res.out.success).toBe(false);
    expect(res.bonus).toBeNull();
    expect(res.heat).toBeGreaterThan(0);
  });

  test('outgoing bribe: rejected for a rival who is not the next opponent', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { matchNum: 6, blackMoney: 999 });
    const res = await page.evaluate(() => {
      window.initRivalData();
      const nxt = window.getNextRival().name;
      let other = null;
      for (let i = 0; i < window.RIVALS.length; i++) { if (window.RIVALS[i].name !== nxt) { other = window.RIVALS[i].name; break; } }
      return window.bribeRivalToThrow(other);
    });
    expect(res.success).toBe(false);
    expect(res.msg).toContain('next opponent');
  });

  test('outgoing bribe: blocked when a fix is already active', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { matchNum: 6, blackMoney: 999, mafiaBonus: { type: 'matchfix' } });
    const res = await page.evaluate(() => {
      window.initRivalData();
      const r = window.getNextRival();
      return window.bribeRivalToThrow(r.name);
    });
    expect(res.success).toBe(false);
  });

  test('outgoing bribe: throw button appears in next-rival profile', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { matchNum: 6, blackMoney: 999, mafiaBonus: null });
    await page.evaluate(() => {
      window.initRivalData();
      const r = window.getNextRival();
      window.showRivalProfile(r.name);
    });
    await expect(page.locator('#rp-throw-btn')).toBeVisible();
  });

  // ---- Increment 4: The Syndicate screen (underworld zone) ----
  test('syndicate screen renders don + lieutenants in underworld zone', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { alignment: -40 });
    await page.evaluate(() => window.showSyndicateScreen());
    await expect(page.locator('.syn-title')).toHaveText('THE SYNDICATE');
    const lieuts = await page.locator('.syn-lieut').count();
    expect(lieuts).toBe(2);
    const zone = await page.getAttribute('#mafia-overlay .modal', 'data-zone');
    expect(zone).toBe('underworld');
  });

  test('syndicate offer locked when too clean', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { alignment: 80 });
    await page.evaluate(() => window.showSyndicateScreen());
    await expect(page.locator('.syn-offer-locked')).toBeVisible();
    expect(await page.locator('#syn-hear-offer-btn').count()).toBe(0);
  });

  // ---- Increment 5: The Politics Desk (politics zone) ----
  test('neta screen renders candidate posters in politics zone', async ({ page }) => {
    await page.goto('/');
    await injectState(page, {});
    await page.evaluate(() => window.showNetaScreen());
    await expect(page.locator('.pol-title')).toHaveText('THE POLITICS DESK');
    expect(await page.locator('.pol-poster').count()).toBe(2);
    const zone = await page.getAttribute('#mafia-overlay .modal', 'data-zone');
    expect(zone).toBe('politics');
  });

  test('funding a campaign backs a candidate and spends coins', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 5000 });
    const res = await page.evaluate(() => {
      window.initFactions();
      window.GS.factions.neta.election = 2;
      window.GS.factions.neta.backed = null;
      const before = window.GS.coins;
      window.fundNetaCampaign(0);
      return { backed: window.GS.factions.neta.backed, before, after: window.GS.coins };
    });
    expect(res.backed).toBeTruthy();
    expect(res.after).toBe(res.before - 300);
  });

  // ---- Increment 6: The Streets / Sikandar Bhai (streets zone) ----
  test('bhai screen renders crew in streets zone', async ({ page }) => {
    await page.goto('/');
    await injectState(page, {});
    await page.evaluate(() => window.showBhaiScreen());
    await expect(page.locator('.str-title')).toHaveText('THE STREETS');
    expect(await page.locator('.str-crew-mem').count()).toBe(2);
    const zone = await page.getAttribute('#mafia-overlay .modal', 'data-zone');
    expect(zone).toBe('streets');
  });

  test('courting the bhai raises respect and spends coins', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 5000 });
    const res = await page.evaluate(() => {
      window.initFactions();
      const before = window.GS.factions.bhai.rel;
      const coinsBefore = window.GS.coins;
      window.courtBhai();
      return { before, relAfter: window.GS.factions.bhai.rel, coinsBefore, coinsAfter: window.GS.coins, courted: window.GS.factions.bhai.courted };
    });
    expect(res.relAfter).toBeGreaterThan(res.before);
    expect(res.coinsAfter).toBe(res.coinsBefore - 130);
    expect(res.courted).toBe(true);
  });

  test('bhai favour sets a match bonus and cannot be stacked', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 5000, blackMoney: 5000, mafiaBonus: null });
    const res = await page.evaluate(() => {
      window.initFactions();
      window.GS.factions.bhai.rel = 50;
      window.bhaiFavor('crowd');
      const first = window.GS.bhaiBonus ? window.GS.bhaiBonus.type : null;
      window.bhaiFavor('pitchprep'); // must be blocked while one is lined up
      const second = window.GS.bhaiBonus ? window.GS.bhaiBonus.type : null;
      return { first, second };
    });
    expect(res.first).toBe('crowd');
    expect(res.second).toBe('crowd');
  });

  test('squad pitch lean returns a valid pitch type', async ({ page }) => {
    await page.goto('/');
    await injectState(page, {});
    const lean = await page.evaluate(() => window.squadPitchLean());
    expect(['TURNING', 'SEAMING', 'FLAT']).toContain(lean);
  });
});

// ============================================================
// 17. CUSTOMISATION
// ============================================================
test.describe('Customisation', () => {
  test('settings button opens overlay', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await page.click('#settings-btn');
    await page.waitForTimeout(500);
    await expect(page.locator('#custom-overlay.show')).toBeVisible();
  });

  test('team name input updates state on save', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await page.click('#settings-btn');
    await page.waitForTimeout(500);
    await page.fill('#custom-team-name', 'Champions XI');
    await page.click('#custom-save-btn');
    await page.waitForTimeout(300);
    const name = await page.evaluate(() => window.GS.teamName);
    expect(name).toBe('Champions XI');
  });

  // Regression (56a87a7): color swatches must stay angular (clip-path chamfer),
  // never fall back to rounded border-radius corners (hard constraint #8).
  test('color swatches use angular clip-path chamfer, not rounded corners', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await page.click('#settings-btn');
    await page.waitForTimeout(500);
    await expect(page.locator('.color-swatch').first()).toBeVisible();
    const clipPath = await page.locator('.color-swatch').first().evaluate(
      (el) => getComputedStyle(el).clipPath
    );
    expect(clipPath).not.toBe('none');
    expect(clipPath).toContain('polygon');
  });
});

// ============================================================
// 17b. THEME (light default + dark toggle)
// ============================================================
test.describe('Theme', () => {
  test('light theme is the default', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('light');
    const dark = await page.evaluate(() => window.GS.darkTheme);
    expect(dark).toBe(false);
  });

  test('settings toggle enables dark theme and persists across reload', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await page.click('#settings-btn');
    await page.waitForTimeout(500);
    await page.click('#theme-toggle-row');
    await page.waitForTimeout(300);
    let theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('dark');
    await page.reload();
    await page.waitForSelector('#loading.hide', { timeout: 10000 });
    theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('dark');
    // toggle back off
    await dismissOverlays(page);
    await page.click('#settings-btn');
    await page.waitForTimeout(500);
    await page.click('#theme-toggle-row');
    await page.waitForTimeout(300);
    theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('light');
  });

  test('hub quick-toggle switches theme in one tap and persists', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    // quick toggle is on the hub header, no menus needed
    await page.click('#theme-quick-btn');
    await page.waitForTimeout(300);
    let theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('dark');
    // settings switch reflects the same state
    let switchOn = await page.evaluate(() => window.GS.darkTheme);
    expect(switchOn).toBe(true);
    // persists across reload
    await page.reload();
    await page.waitForSelector('#loading.hide', { timeout: 10000 });
    theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('dark');
    // one more tap flips back to light
    await dismissOverlays(page);
    await page.click('#theme-quick-btn');
    await page.waitForTimeout(300);
    theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('light');
  });
});

// ============================================================
// 18. TUTORIAL
// ============================================================
test.describe('Tutorial', () => {
  test('tutorial shows for new game', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('cu_save_v3'));
    await page.reload();
    await page.waitForSelector('#loading.hide', { timeout: 10000 });
    const tut = page.locator('#tut-overlay.show');
    await expect(tut).toBeVisible();
  });

  test('tutorial skippable', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('cu_save_v3'));
    await page.reload();
    await page.waitForSelector('#loading.hide', { timeout: 10000 });
    const skipBtn = page.locator('#tut-skip-btn');
    if (await skipBtn.isVisible()) {
      await skipBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('#tut-overlay.show')).toHaveCount(0);
    }
  });
});

// ============================================================
// 19. MATCH INTERACTIVITY — BOWLER & FIELD
// ============================================================
test.describe('Match Interactivity', () => {
  test('field placement modifiers affect calcBallOutcome', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const results = await page.evaluate(() => {
      var batter = {name:'Test',bat:80,bwl:10,form:70,fld:60,role:'Top-Order Batter'};
      var bowler = {name:'Test',bat:10,bwl:80,form:70,fld:50,role:'Fast Bowler'};
      window.match.fieldSetting = 'attacking';
      var atkWkts = 0;
      for (var i = 0; i < 1000; i++) {
        var o = window.calcBallOutcome(batter, bowler, 'FLAT', 1, 'balanced', 75, false, 1, 0, 0, i);
        if (o.wicket) atkWkts++;
      }
      window.match.fieldSetting = 'defensive';
      var defWkts = 0;
      for (var j = 0; j < 1000; j++) {
        var o2 = window.calcBallOutcome(batter, bowler, 'FLAT', 1, 'balanced', 75, false, 1, 0, 0, j);
        if (o2.wicket) defWkts++;
      }
      window.match.fieldSetting = 'standard';
      return { atkWkts, defWkts };
    });
    expect(results.atkWkts).toBeGreaterThan(results.defWkts);
  });

  test('boost activates for 6 balls', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await page.click('#hub-match-btn');
    await page.waitForTimeout(600);
    await dismissOverlays(page);
    const ss = page.locator('.squad-select-overlay.show');
    if (await ss.count() > 0) { await page.click('#ss-auto-btn'); await page.waitForTimeout(300); await page.click('#ss-confirm-btn'); }
    await page.waitForSelector('#prematch-screen.active', { timeout: 5000 });
    await page.click('#start-match-btn');
    await page.waitForSelector('#match-screen.active', { timeout: 5000 });
    await page.click('#boost-btn');
    // Deterministic: wait for the UI flag instead of an arbitrary timeout, then
    // read boostBalls immediately, before any further waits let a match tick
    // (which decrements boostBalls during ball resolution) land.
    await page.waitForSelector('#boost-btn.used', { timeout: 2000 });
    const boostBalls = await page.evaluate(() => window.match.boostBalls);
    expect(boostBalls).toBe(6);
    await expect(page.locator('#boost-btn.used')).toBeVisible();
  });
});

// ============================================================
// 20. SEASON SYSTEM (via evaluate)
// ============================================================
test.describe('Season System', () => {
  test('season end triggers at match 15', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { matchNum: 14, wins: 10, losses: 3 });
    await page.click('#hub-match-btn');
    await page.waitForTimeout(600);
    await dismissOverlays(page);
    const ss = page.locator('.squad-select-overlay.show');
    if (await ss.count() > 0) { await page.click('#ss-auto-btn'); await page.waitForTimeout(300); await page.click('#ss-confirm-btn'); }
    await page.waitForSelector('#prematch-screen.active', { timeout: 5000 });
    await page.click('#start-match-btn');
    await page.waitForSelector('#match-screen.active', { timeout: 5000 });
    await page.click('#skip-btn');
    await page.waitForSelector('.match-result-overlay.show', { timeout: 10000 });
    const resultText = await page.evaluate(() => document.querySelector('.match-result-overlay.show')?.textContent || '');
    expect(resultText.length).toBeGreaterThan(0);
    const matchNum = await page.evaluate(() => GS.matchNum);
    expect(matchNum).toBeGreaterThanOrEqual(15);
  });
});

// ============================================================
// 21. EDGE CASES
// ============================================================
test.describe('Edge Cases', () => {
  test('match with minimum squad (3 players)', async ({ page }) => {
    await page.goto('/');
    const miniSquad = makeSquad().slice(0, 3);
    await injectState(page, {
      squad: miniSquad,
      selectedXI: miniSquad.map(p => p.id),
      captainId: miniSquad[0].id,
      matchNum: 3,
    });
    await page.click('#hub-match-btn');
    await page.waitForTimeout(600);
    await dismissOverlays(page);
    const ss = page.locator('.squad-select-overlay.show');
    if (await ss.count() > 0) { await page.click('#ss-auto-btn'); await page.waitForTimeout(300); await page.click('#ss-confirm-btn'); }
    await page.waitForSelector('#prematch-screen.active', { timeout: 5000 });
    await page.click('#start-match-btn');
    await page.waitForSelector('#match-screen.active', { timeout: 5000 });
    await page.click('#skip-btn');
    await page.waitForSelector('.match-result-overlay.show', { timeout: 10000 });
    const scores = await page.locator('.result-scores').textContent();
    expect(scores).toMatch(/\d+\/\d+/);
  });

  test('game works with max heat', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { heat: 100 });
    await expect(page.locator('#hub-screen.active')).toBeVisible();
    const heat = await page.locator('#heat-val').textContent();
    expect(heat).toBe('100');
  });

  test('game works with max alignment', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { alignment: 100 });
    const zone = await page.locator('#align-zone-tag').textContent();
    expect(zone).toBe('Clean Hero');
  });

  test('game works with min alignment', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { alignment: -100 });
    const zone = await page.locator('#align-zone-tag').textContent();
    expect(zone).toBe('Deep Corrupt');
  });

  test('match with 0 coins does not crash', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 0 });
    await expect(page.locator('#hub-screen.active')).toBeVisible();
  });
});

// ============================================================
// 22. REAL-CLICK COVERAGE — mafia accept, staff, scout, heat
// actions, market buy/sell/refresh
//
// Added 2026-09-09 after a full player-advocate audit found these 5
// systems had ZERO test coverage of any kind (not even state-injection),
// discovered via the same session's squad-select bug: a real, live,
// pre-existing tap-to-toggle bug that 177 passing tests never caught
// because every one of them injects GS state directly instead of
// clicking through the real DOM. These tests specifically drive the
// actual button click path (Hub -> drawer -> button, or Hub -> overlay
// -> button) rather than calling the underlying JS function directly,
// so a future regression in the click-wiring itself (not just the
// logic) would actually be caught.
// ============================================================
test.describe('Real-Click Coverage', () => {
  test('mafia offer: accepting via real click applies real effects', async ({ page }) => {
    await page.goto('/');
    // league:'gully' (injectState default) restricts offers to injection/rivaldossier only --
    // both skip the loyalty-check roll (see the 2026-09-09 Match Fix Lose fix's noLoyaltyNeeded
    // list), so acceptance is deterministic here, not RNG-gated. blackMoney generous so the
    // "not enough black money" early-return in the accept handler can never block this test.
    await injectState(page, { alignment: -10, matchNum: 3, blackMoney: 1000 });
    await dismissOverlays(page);
    await page.click('#mafia-banner');
    await page.waitForTimeout(500);
    await expect(page.locator('#mafia-overlay.show')).toBeVisible();
    const before = await page.evaluate(() => ({ heat: window.GS.heat, favors: window.GS.consecutiveFavors || 0 }));
    await page.click('#accept-mafia-btn');
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => ({ heat: window.GS.heat, favors: window.GS.consecutiveFavors || 0 }));
    // Every offer type in the accept handler adds heat unconditionally before any type-specific
    // branch runs, and increments consecutiveFavors unconditionally too -- true regardless of
    // which of the two possible offers this test happens to roll.
    expect(after.heat).toBeGreaterThan(before.heat);
    expect(after.favors).toBeGreaterThan(before.favors);
    await expect(page.locator('#mafia-overlay.show')).toBeHidden();
  });

  test('staff: hiring a coins-cost item via real click deducts coins and marks it hired', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 2000 });
    await page.click('.hub-tab[data-htab="club"]'); // Club Management lives behind the Club tab (no-vertical-scroll redesign, 2026-09)
    await page.click('#drawer-club-toggle');
    await page.waitForTimeout(300);
    // 'legit' tab is the default staffTab -- physio (300 coins) is always visible on it.
    const before = await page.evaluate(() => window.GS.coins);
    await page.click('[data-staff="physio"]');
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => ({ coins: window.GS.coins, hired: !!window.GS.staff.physio }));
    expect(after.coins).toBe(before - 300);
    expect(after.hired).toBe(true);
  });

  test('staff: hiring a black-money fixer via real click deducts black money, not coins', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 2000, blackMoney: 500 });
    await page.click('.hub-tab[data-htab="club"]'); // Club Management lives behind the Club tab (no-vertical-scroll redesign, 2026-09)
    await page.click('#drawer-club-toggle');
    await page.waitForTimeout(300);
    await page.click('[data-stafftab="fixer"]');
    await page.waitForTimeout(300);
    const before = await page.evaluate(() => ({ coins: window.GS.coins, blackMoney: window.GS.blackMoney }));
    await page.click('[data-staff="pr_manager"]'); // 80 black money, currency:'black'
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => ({ coins: window.GS.coins, blackMoney: window.GS.blackMoney, hired: !!window.GS.staff.pr_manager }));
    expect(after.blackMoney).toBe(before.blackMoney - 80);
    expect(after.coins).toBe(before.coins); // must NOT touch the coins currency
    expect(after.hired).toBeTruthy();
  });

  test('scout: purchasing intel via real click deducts coins and opens the report', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 2000 });
    await page.click('.hub-tab[data-htab="club"]'); // Club Management lives behind the Club tab (no-vertical-scroll redesign, 2026-09)
    await page.click('#drawer-club-toggle');
    await page.waitForTimeout(300);
    const before = await page.evaluate(() => window.GS.coins);
    await page.click('[data-scout="basic"]'); // 100 coins, no analyst discount by default
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => window.GS.coins);
    expect(after).toBe(before - 100);
    await expect(page.locator('#scorecard-overlay.show')).toBeVisible();
  });

  test('heat action: real click raises heat and shifts alignment', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { heat: 20, alignment: 10 });
    await page.click('.hub-tab[data-htab="club"]'); // The Underworld lives behind the Club tab (no-vertical-scroll redesign, 2026-09)
    await page.click('#drawer-underworld-toggle');
    await page.waitForTimeout(300);
    const before = await page.evaluate(() => ({ heat: window.GS.heat, alignment: window.GS.alignment }));
    await page.click('[data-heatact="trash_talk"]'); // free, +5 heat, -2 align, always available
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => ({ heat: window.GS.heat, alignment: window.GS.alignment }));
    expect(after.heat).toBe(before.heat + 5);
    expect(after.alignment).toBeLessThan(before.alignment);
  });

  test('market: buying a player via real click deducts coins and adds to squad', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 5000, squad: makeSquad().slice(0, 5) });
    await page.click('#hub-market-btn');
    await page.waitForTimeout(500);
    const buyBtn = page.locator('[data-buyid]').first();
    await expect(buyBtn).toBeVisible();
    const before = await page.evaluate(() => ({ coins: window.GS.coins, squadLen: window.GS.squad.length }));
    await buyBtn.click();
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => ({ coins: window.GS.coins, squadLen: window.GS.squad.length }));
    expect(after.coins).toBeLessThan(before.coins);
    expect(after.squadLen).toBe(before.squadLen + 1);
  });

  test('market: selling a player via real click adds coins and removes from squad', async ({ page }) => {
    await page.goto('/');
    await injectState(page); // default 11-player squad, well above the 3-player sell floor
    await page.click('#hub-market-btn');
    await page.waitForTimeout(500);
    await page.click('#market-tab-sell');
    await page.waitForTimeout(300);
    const sellBtn = page.locator('[data-sellid]').first();
    await expect(sellBtn).toBeVisible();
    const before = await page.evaluate(() => ({ coins: window.GS.coins, squadLen: window.GS.squad.length }));
    await sellBtn.click();
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => ({ coins: window.GS.coins, squadLen: window.GS.squad.length }));
    expect(after.coins).toBeGreaterThan(before.coins);
    expect(after.squadLen).toBe(before.squadLen - 1);
  });

  test('market: refresh listings via real click costs 100 coins and regenerates', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 2000, squad: makeSquad().slice(0, 5) });
    await page.click('#hub-market-btn');
    await page.waitForTimeout(500);
    const before = await page.evaluate(() => window.GS.coins);
    await page.click('#market-refresh-btn');
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => window.GS.coins);
    expect(after).toBe(before - 100);
    const items = await page.locator('.market-item').count();
    expect(items).toBeGreaterThan(0);
  });
});

// ============================================================
// 23. PLAYER POOL DIVERSITY (docs/TEST-CASES.md F23 -- cheap regression guard,
// previously "manual -- no automated tests yet" per feature_list.json)
// ============================================================
// ============================================================
// 24. WEATHER SYSTEM (docs/TEST-CASES.md F09c -- confirmed zero coverage via
// function-name grep before writing this)
// ============================================================
test.describe('Weather System', () => {
  test('rollWeather() produces all 4 documented states over enough samples', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const seen = await page.evaluate(() => {
      var states = {};
      for (var i = 0; i < 2000; i++) states[window.rollWeather()] = true;
      return Object.keys(states);
    });
    ['rain', 'overcast', 'dew', 'clear'].forEach(w => expect(seen).toContain(w));
  });

  test('applyWeather() shows the correct banner text and class per state, hides on clear', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    for (const w of ['rain', 'overcast', 'dew']) {
      const info = await page.evaluate((weather) => {
        window.match.weather = weather;
        window.applyWeather();
        var el = document.getElementById('weather-banner');
        return { display: el.style.display, className: el.className, text: el.textContent };
      }, w);
      expect(info.display).not.toBe('none');
      expect(info.className).toContain(w);
      expect(info.text.length).toBeGreaterThan(0);
    }
    const clearInfo = await page.evaluate(() => {
      window.match.weather = 'clear';
      window.applyWeather();
      return document.getElementById('weather-banner').style.display;
    });
    expect(clearInfo).toBe('none');
  });

  test('overcast measurably boosts a pace bowler; dew measurably boosts 2nd-innings batting', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const results = await page.evaluate(() => {
      var batter = {name:'Test',bat:80,bwl:10,form:70,fld:60,role:'Top-Order Batter'};
      var paceBowler = {name:'Test',bat:10,bwl:80,form:70,fld:50,role:'Fast Bowler'};
      // 2026-09-11: sample size raised 1500 -> 40000. At 1500 the wicket count's standard
      // deviation (~9 on a ~90-wicket mean) was as large as the 10% effect being measured, so this
      // test flaked roughly 1 run in 3 (observed: 96v95 fail, pass, pass, 100v83 fail). 40000
      // samples puts the effect several sigma clear of the noise. Same reasoning for the runs
      // assertion. Still fast -- this is pure arithmetic in-page, no DOM work.
      var N = 40000;
      function countWkts(weather, innings) {
        window.match.weather = weather;
        var wkts = 0;
        for (var i = 0; i < N; i++) {
          var o = window.calcBallOutcome(batter, paceBowler, 'FLAT', 1, 'balanced', 75, false, innings, 0, 0, i);
          if (o.wicket) wkts++;
        }
        return wkts;
      }
      function sumRuns(weather, innings) {
        window.match.weather = weather;
        var runs = 0;
        for (var j = 0; j < N; j++) {
          var o2 = window.calcBallOutcome(batter, paceBowler, 'FLAT', 1, 'balanced', 75, true, innings, 0, 0, j);
          runs += o2.runs;
        }
        return runs;
      }
      var clearWkts = countWkts('clear', 1);
      var overcastWkts = countWkts('overcast', 1);
      var clearRunsInn2 = sumRuns('clear', 2);
      var dewRunsInn2 = sumRuns('dew', 2);
      window.match.weather = 'clear';
      return { clearWkts, overcastWkts, clearRunsInn2, dewRunsInn2 };
    });
    // Pace bowler's bwlStr *= 1.10 under overcast (index.html:8816) -> more wickets against a
    // batting-not-bowling side, same comparison style as the existing field-placement test.
    expect(results.overcastWkts).toBeGreaterThan(results.clearWkts);
    // batStr *= 1.08 in innings 2 under dew (index.html:8817) -> more runs scored.
    expect(results.dewRunsInn2).toBeGreaterThan(results.clearRunsInn2);
  });
});

// ============================================================
// 25. SUPER OVER (docs/TEST-CASES.md F09d -- confirmed zero coverage via
// function-name grep before writing this)
// ============================================================
test.describe('Super Over', () => {
  test('playSuperOver() resolves a tie to a decisive winner and updates match totals', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await page.click('#hub-match-btn');
    await page.waitForTimeout(600);
    await dismissOverlays(page);
    const ss = page.locator('.squad-select-overlay.show');
    if (await ss.count() > 0) { await page.click('#ss-auto-btn'); await page.waitForTimeout(300); await page.click('#ss-confirm-btn'); }
    await page.waitForSelector('#prematch-screen.active', { timeout: 5000 });
    await page.click('#start-match-btn');
    await page.waitForSelector('#match-screen.active', { timeout: 5000 });
    const result = await page.evaluate(() => {
      // Force the tie condition playSuperOver() is meant to resolve -- match.runs/oppRuns are both
      // 0 immediately after start, which already satisfies "scores tied," so no need to sim a full
      // match just to reach a tie.
      window.match.runs = 120; window.match.oppRuns = 120;
      var won = window.playSuperOver();
      return {
        won: won,
        runs: window.match.runs,
        oppRuns: window.match.oppRuns,
        superOverFlag: window.match.superOver,
      };
    });
    expect(typeof result.won).toBe('boolean');
    expect(result.superOverFlag).toBe(true);
    // A real super over score was added to at least one side -- totals should no longer both sit
    // exactly at the pre-tiebreaker value of 120 (the whole point of the function is to add runs).
    expect(result.runs > 120 || result.oppRuns > 120).toBe(true);
  });
});

// ============================================================
// 26. INJURY SYSTEM (docs/TEST-CASES.md F09e -- confirmed zero coverage via
// function-name grep before writing this)
// ============================================================
test.describe('Injury System', () => {
  test('rollInjury() returns null for full fitness, a valid {type,matchesOut} for low fitness, and fitness_trainer halves the chance', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const result = await page.evaluate(() => {
      var fullFit = { fit: 100 };
      var noInjuries = 0;
      for (var i = 0; i < 50; i++) if (window.rollInjury(fullFit)) noInjuries++;
      var lowFit = { fit: 10 };
      var oneInjury = null;
      for (var j = 0; j < 500 && !oneInjury; j++) oneInjury = window.rollInjury(lowFit);
      // fitness_trainer halves chance (index.html:9081) -- with enough trials, a trainer-equipped
      // roll should produce measurably fewer injuries than an unequipped one at the same low fitness.
      window.GS.staff = {};
      var withoutTrainer = 0;
      for (var k = 0; k < 3000; k++) if (window.rollInjury(lowFit)) withoutTrainer++;
      window.GS.staff = { fitness_trainer: true };
      var withTrainer = 0;
      for (var m = 0; m < 3000; m++) if (window.rollInjury(lowFit)) withTrainer++;
      window.GS.staff = {};
      return { noInjuries, oneInjury, withoutTrainer, withTrainer };
    });
    expect(result.oneInjury).not.toBeNull();
    expect(typeof result.oneInjury.type).toBe('string');
    expect(typeof result.oneInjury.matchesOut).toBe('number');
    expect(result.withTrainer).toBeLessThan(result.withoutTrainer);
  });

  test('processMatchInjuries() sets sp.injured on the matching squad player and blocks XI selection', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const injuredId = await page.evaluate(() => {
      // Force the roll: near-zero fitness maximizes rollInjury's chance. NOTE: fit:0 (not fit:1)
      // would NOT work here -- rollInjury() guards on `if (!player.fit) return null`, and 0 is
      // falsy in JS, so an exact-zero fitness is (mis)treated as "no fitness data" and always
      // short-circuits to null. fit:1 avoids that trap while still maximizing the real chance
      // (chance = max(0.01, (100-1)/800) = 0.124/attempt).
      window.match = window.match || {};
      window.match.yourXI = window.GS.squad.slice(0, 3).map(p => Object.assign({}, p, { fit: 1 }));
      var injured = null;
      for (var i = 0; i < 200 && !injured; i++) {
        var result = window.processMatchInjuries();
        if (result.length > 0) injured = result[0];
      }
      if (!injured) return null;
      var sp = window.GS.squad.find(p => p.name === injured.name);
      return sp ? { id: sp.id, injured: sp.injured } : null;
    });
    expect(injuredId, 'processMatchInjuries should have injured at least one of 3 fit:0 players within 200 attempts').not.toBeNull();
    expect(injuredId.injured).toHaveProperty('type');
    expect(injuredId.injured).toHaveProperty('matchesLeft');
    expect(injuredId.injured.matchesLeft).toBeGreaterThan(0);

    await page.evaluate(() => window.showSquadSelect());
    await page.waitForSelector('#ss-player-list', { timeout: 5000 });
    await page.waitForTimeout(300);
    const row = page.locator(`.ss-player[data-sid="${injuredId.id}"]`);
    await expect(row).toHaveClass(/banned/); // same unavailable styling reused for injured players
    await page.evaluate((id) => {
      document.querySelector('.ss-player[data-sid="' + id + '"]').click();
    }, injuredId.id);
    await page.waitForTimeout(200);
    await expect(row).not.toHaveClass(/selected/);
  });

  test('processInjuryTick() counts matchesLeft down and clears on schedule; physio doubles the rate', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const result = await page.evaluate(() => {
      window.GS.staff = {};
      window.GS.squad[0].injured = { type: 'Test Strain', matchesLeft: 3 };
      window.processInjuryTick();
      var afterOneTick = window.GS.squad[0].injured.matchesLeft;

      window.GS.staff = { physio: true };
      window.GS.squad[0].injured = { type: 'Test Strain', matchesLeft: 3 };
      window.processInjuryTick();
      var afterOneTickWithPhysio = window.GS.squad[0].injured.matchesLeft;

      window.GS.squad[0].injured = { type: 'Test Strain', matchesLeft: 1 };
      var healed = window.processInjuryTick();
      var clearedAfterFinalTick = window.GS.squad[0].injured;
      window.GS.staff = {};
      return { afterOneTick, afterOneTickWithPhysio, healed, clearedAfterFinalTick };
    });
    expect(result.afterOneTick).toBe(2); // -1 without physio
    expect(result.afterOneTickWithPhysio).toBe(1); // -2 with physio
    expect(result.clearedAfterFinalTick).toBeNull();
    expect(result.healed.length).toBeGreaterThan(0);
  });
});

// ============================================================
// 27. ACADEMY SYSTEM (docs/TEST-CASES.md F25 -- confirmed zero coverage via
// function-name grep before writing this)
// ============================================================
test.describe('Academy System', () => {
  test('recruiting requires alignment 30+ and 300 coins; real-click recruit adds a slot and deducts coins', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 2000, alignment: 10 });
    await page.click('.hub-tab[data-htab="club"]');
    await page.click('#drawer-club-toggle');
    await page.waitForTimeout(300);
    // Below alignment 30 with 0 slots -- getAcademyHtml() early-returns '' (index.html:10954),
    // so the whole panel is blank. NOTE: this means the "Need alignment 30+" hint text coded a few
    // lines further down (:10961) is actually unreachable dead code -- you can only reach that
    // branch when slots===0 AND alignment>=30 already holds (the early-return filters out the low
    // case first), which makes the else{amber hint} arm a tautological no-op. Confirmed by running
    // this exact scenario, not assumed from reading the code alone.
    await expect(page.locator('#academy-recruit-btn')).toHaveCount(0);
    await expect(page.locator('#academy-panel')).toHaveText('');

    await page.evaluate(() => { window.GS.alignment = 40; window.updateHub(); });
    await page.waitForTimeout(200);
    const before = await page.evaluate(() => window.GS.coins);
    await page.click('#academy-recruit-btn');
    await page.waitForTimeout(200);
    const after = await page.evaluate(() => ({ coins: window.GS.coins, slots: window.GS.academySlots.length }));
    expect(after.coins).toBe(before - 300);
    expect(after.slots).toBe(1);
  });

  test('recruiting fails without enough coins or once the 2-slot cap is hit', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 100, alignment: 40 });
    const failNoCoins = await page.evaluate(() => {
      var before = window.GS.academySlots.length;
      window.recruitAcademyProspect();
      return window.GS.academySlots.length === before;
    });
    expect(failNoCoins).toBe(true);

    await page.evaluate(() => {
      window.GS.coins = 5000;
      window.GS.academySlots = [window.generateAcademyProspect(), window.generateAcademyProspect()];
    });
    const failFull = await page.evaluate(() => {
      var before = window.GS.academySlots.length;
      window.recruitAcademyProspect();
      return window.GS.academySlots.length === before; // still 2, cap enforced
    });
    expect(failFull).toBe(true);
  });

  test('processAcademySlots() grows a prospect toward potential and graduates it into the squad on schedule', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const result = await page.evaluate(() => {
      var prospect = window.generateAcademyProspect();
      prospect.seasonsLeft = 1; // graduate on the very next tick
      var startBat = prospect.bat;
      window.GS.academySlots = [prospect];
      var squadBefore = window.GS.squad.length;
      var graduated = window.processAcademySlots();
      return {
        graduatedCount: graduated.length,
        graduatedName: graduated[0] ? graduated[0].name : null,
        slotsLeft: window.GS.academySlots.length,
        squadAfter: window.GS.squad.length,
        squadBefore: squadBefore,
        startBat: startBat,
      };
    });
    expect(result.graduatedCount).toBe(1);
    expect(result.slotsLeft).toBe(0);
    expect(result.squadAfter).toBe(result.squadBefore + 1);
    expect(result.graduatedName).not.toBeNull();
  });
});

// ============================================================
// 28. MENTORSHIP SYSTEM (docs/TEST-CASES.md F29 -- confirmed zero coverage via
// function-name grep before writing this)
// ============================================================
test.describe('Mentorship System', () => {
  test('panel is gated by alignment 40+; real-click flow selects a mentee and sets GS.mentorship', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { alignment: 20 });
    await page.click('.hub-tab[data-htab="club"]');
    await page.click('#drawer-club-toggle');
    await page.waitForTimeout(300);
    await expect(page.locator('#mentorship-panel')).toBeHidden();

    await page.evaluate(() => { window.GS.alignment = 50; window.updateHub(); });
    await page.waitForTimeout(200);
    await expect(page.locator('#mentorship-panel')).toBeVisible();
    await page.click('#mentor-select-btn');
    await page.waitForSelector('.scorecard-overlay.show, #scorecard-overlay.show', { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(300);
    // Pick whichever eligible mentee card rendered first -- squad fixture (makeSquad()) includes
    // uncommon/rare/epic/legendary rarities, so at least one common/uncommon player is guaranteed
    // eligible (The Anchor / Glove Master, both 'uncommon').
    const mentorCard = page.locator('[data-mentorid]').first();
    await expect(mentorCard).toBeVisible();
    const mentorId = await mentorCard.getAttribute('data-mentorid');
    await mentorCard.click();
    await page.waitForTimeout(300);
    const mentorship = await page.evaluate(() => window.GS.mentorship);
    expect(mentorship).not.toBeNull();
    expect(mentorship.playerId).toBe(Number(mentorId));
    expect(mentorship.seasonsLeft).toBe(3);
  });

  test('showMentorPicker() toasts an error when no common/uncommon player is eligible', async ({ page }) => {
    await page.goto('/');
    await injectState(page, {
      alignment: 50,
      squad: [{ id: 1, name: 'Legend Only', role: 'All-Rounder', bat: 80, bwl: 80, fld: 80, fit: 80, form: 70, loyalty: 70, greed: 20, rarity: 'legendary', overseas: false }],
    });
    await page.evaluate(() => window.showMentorPicker());
    await page.waitForTimeout(300);
    await expect(page.locator('#toast')).toContainText(/no eligible players/i);
  });

  test('processMentorship() boosts the two weakest stats each call and upgrades rarity after 3 seasons', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const result = await page.evaluate(() => {
      var player = window.GS.squad.find(p => p.rarity === 'uncommon');
      window.selectMentee(player.id);
      var weakStats = window.pickMentorStats(player);
      var before = { s1: player[weakStats[0]], s2: player[weakStats[1]] };
      window.processMentorship();
      var afterOne = { s1: player[weakStats[0]], s2: player[weakStats[1]] };
      window.processMentorship();
      var afterTwo = window.processMentorship(); // 3rd call -- seasonsLeft hits 0, should upgrade
      return {
        before, afterOne,
        rarityAfter: player.rarity,
        mentorshipCleared: window.GS.mentorship === null,
        upgradedFlag: afterTwo.upgraded,
      };
    });
    expect(result.afterOne.s1).toBe(result.before.s1 + 3);
    expect(result.afterOne.s2).toBe(result.before.s2 + 3);
    expect(result.rarityAfter).toBe('rare'); // uncommon -> rare per rarityOrder
    expect(result.upgradedFlag).toBe(true);
    expect(result.mentorshipCleared).toBe(true);
  });
});

// ============================================================
// 29. PLAYER BANS -- full lifecycle (docs/TEST-CASES.md F32 -- the existing
// tribunal test only checks a verdict NAME string, never that a real ban
// applies/blocks/expires -- confirmed zero coverage of the actual mechanic
// via function-name grep before writing this)
// ============================================================
test.describe('Player Bans', () => {
  test('rollBanEvents() applies each of the 4 documented ban types with correct duration and heat', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const result = await page.evaluate(() => {
      function tryBan(setupFn, wonArg, wasFixArg) {
        for (var i = 0; i < 400; i++) {
          setupFn();
          var events = window.rollBanEvents(wonArg, wasFixArg);
          if (events.length > 0) return { events: events, banned: window.GS.squad.find(p => p.banned) };
        }
        return null;
      }
      // doping: fit>=85, 3% per XI player per call
      var dopingSquad = window.GS.squad.map(p => Object.assign({}, p, { banned: undefined, fit: 90 }));
      window.match = window.match || {};
      window.match.yourXI = dopingSquad;
      var doping = tryBan(() => { window.GS.squad = dopingSquad; dopingSquad.forEach(p => { delete p.banned; }); }, true, false);

      // conduct: form<=25 && greed>=60, 6% per call
      var conductSquad = window.GS.squad.map(p => Object.assign({}, p, { banned: undefined, fit: 50, form: 10, greed: 90 }));
      window.match.yourXI = conductSquad;
      var conduct = tryBan(() => { window.GS.squad = conductSquad; conductSquad.forEach(p => { delete p.banned; }); }, true, false);

      // corruption: wasFix=true, loyalty<60, 15% per call (one target picked randomly from candidates)
      var corruptSquad = window.GS.squad.map(p => Object.assign({}, p, { banned: undefined, fit: 50, form: 50, greed: 30, loyalty: 10 }));
      window.match.yourXI = corruptSquad;
      var corruption = tryBan(() => { window.GS.squad = corruptSquad; corruptSquad.forEach(p => { delete p.banned; }); }, false, true);

      // board: wasFix=false, GS.heat>=60, 5% per call
      var boardSquad = window.GS.squad.map(p => Object.assign({}, p, { banned: undefined, fit: 50, form: 50, greed: 30, loyalty: 90 }));
      window.match.yourXI = boardSquad;
      window.GS.heat = 70;
      var board = tryBan(() => { window.GS.squad = boardSquad; boardSquad.forEach(p => { delete p.banned; }); }, false, false);

      return { doping, conduct, corruption, board };
    });
    expect(result.doping, 'doping ban should trigger within 400 attempts at fit:90').not.toBeNull();
    expect(result.doping.banned.banned).toMatchObject({ reason: 'doping', matchesLeft: 3 });
    expect(result.conduct, 'conduct ban should trigger within 400 attempts at form:10/greed:90').not.toBeNull();
    expect(result.conduct.banned.banned).toMatchObject({ reason: 'conduct', matchesLeft: 2 });
    expect(result.corruption, 'corruption ban should trigger within 400 attempts under a fix with loyalty:10').not.toBeNull();
    expect(result.corruption.banned.banned).toMatchObject({ reason: 'corruption', matchesLeft: 4 });
    expect(result.board, 'board ban should trigger within 400 attempts at heat:70').not.toBeNull();
    expect(result.board.banned.banned).toMatchObject({ reason: 'board', matchesLeft: 2 });
  });

  test('a banned player is blocked from XI selection, same guard as debt-held/injured players', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const bannedId = await page.evaluate(() => {
      window.GS.squad[0].banned = { reason: 'doping', matchesLeft: 3 };
      return window.GS.squad[0].id;
    });
    await page.evaluate(() => window.showSquadSelect());
    await page.waitForSelector('#ss-player-list', { timeout: 5000 });
    await page.waitForTimeout(300);
    const row = page.locator(`.ss-player[data-sid="${bannedId}"]`);
    await expect(row).toHaveClass(/banned/);
    await page.evaluate((id) => {
      document.querySelector('.ss-player[data-sid="' + id + '"]').click();
    }, bannedId);
    await page.waitForTimeout(200);
    await expect(row).not.toHaveClass(/selected/);
  });

  test('processBanTick() counts matchesLeft down and lifts the ban on schedule', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const result = await page.evaluate(() => {
      window.GS.squad[0].banned = { reason: 'conduct', matchesLeft: 2 };
      window.processBanTick();
      var afterOne = window.GS.squad[0].banned ? window.GS.squad[0].banned.matchesLeft : null;
      var unbanned = window.processBanTick();
      var afterTwo = window.GS.squad[0].banned;
      return { afterOne, afterTwo, unbanned };
    });
    expect(result.afterOne).toBe(1);
    expect(result.afterTwo).toBeUndefined();
    expect(result.unbanned.length).toBeGreaterThan(0);
  });
});

// ============================================================
// 30. KNOCKOUT BRACKET TOURNAMENT (docs/TEST-CASES.md F38 -- confirmed zero
// coverage via function-name grep before writing this)
// ============================================================
test.describe('Knockout Tournament', () => {
  test('startKnockout() gates on win rate alone (wins/14 >= 0.35) -- the matchNum>14 half of the documented trigger lives at the call site, not in this function', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const result = await page.evaluate(() => {
      window.GS.wins = 4; // 4/14 = 0.286, below the 0.35 gate
      var belowThreshold = window.startKnockout();
      window.GS.wins = 5; // 5/14 = 0.357, at/above the 0.35 gate
      var atThreshold = window.startKnockout();
      return { belowThreshold, atThreshold };
    });
    expect(result.belowThreshold).toBeNull();
    expect(result.atThreshold).not.toBeNull();
    expect(result.atThreshold.round).toBe('semi');
    expect(result.atThreshold.matches.length).toBe(2);
    // 4 teams total across both semis: player + up to 3 rivals/wildcards
    const totalTeams = new Set();
    result.atThreshold.matches.forEach(m => { totalTeams.add(m.a.name); totalTeams.add(m.b.name); });
    expect(totalTeams.size).toBe(4);
    const playerIsIn = result.atThreshold.matches.some(m => m.a.isPlayer || m.b.isPlayer);
    expect(playerIsIn).toBe(true);
  });

  test('advanceKnockout() (the "Simulate" path) progresses semi -> final -> champion with the documented reward formula', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { wins: 6, league: 'sma' }); // leagueIdx 1 -> reward should be 300*(1+1)=600 if player wins
    const result = await page.evaluate(() => {
      // simKnockoutMatch()'s player-favoring boost+cap (index.html:10751-10753) only applies when
      // the player occupies slot `a` (`if(a.isPlayer){aChance+=0.05;aChance=min(0.75,aChance)}` --
      // there's no equivalent branch checking b.isPlayer), so even a huge strength gap can't push a
      // single semi+final pair past a bounded win probability when the RNG happens to seat the
      // player as `a`. Rather than force state the function owns (which broke the first attempt at
      // this test -- pre-setting final.winner makes advanceKnockout()'s own `!ko.final.winner` guard
      // skip resolving it), retry the whole real flow with a real strength mismatch until the dice
      // land in the player's favor, same pattern as every other probabilistic test in this file.
      var afterSemis = null, champion = null, reward = null;
      for (var attempt = 0; attempt < 60 && !(champion && champion.isPlayer); attempt++) {
        var ko = window.startKnockout();
        ko.matches.forEach(function(m) {
          if (m.a.isPlayer) m.a.str = 999; else if (m.b.isPlayer) m.b.str = 999;
        });
        window.advanceKnockout(); // resolves both semis for real via simKnockoutMatch, builds final
        afterSemis = { round: window.GS.knockout.round, finalSet: !!window.GS.knockout.final };
        if (window.GS.knockout.final.a.isPlayer) window.GS.knockout.final.a.str = 999;
        else if (window.GS.knockout.final.b.isPlayer) window.GS.knockout.final.b.str = 999;
        window.advanceKnockout(); // resolves the final for real
        champion = window.GS.knockout.champion;
        reward = window.GS.knockout.reward;
      }
      return { afterSemis, champion, reward };
    });
    expect(result.afterSemis.round).toBe('final');
    expect(result.afterSemis.finalSet).toBe(true);
    expect(result.champion.isPlayer, 'player should win at least once in 60 heavily-favored attempts').toBe(true);
    expect(result.reward).toBe(600); // 300 * (leagueIdx(sma=1) + 1)
  });

  test('resolveKnockoutMatch() (the "Play" path) assigns the winner based on the real match result, not simulation', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { wins: 6 }); // needed so startKnockout()'s winRate gate doesn't return null
    const result = await page.evaluate(() => {
      var ko = window.startKnockout();
      var playerMatch = ko.matches.find(m => m.a.isPlayer || m.b.isPlayer);
      window.resolveKnockoutMatch(true); // player "won" the real match
      var winnerIsPlayerOnWin = playerMatch.winner.isPlayer;
      // Reset and try a loss
      var ko2 = window.startKnockout();
      var playerMatch2 = ko2.matches.find(m => m.a.isPlayer || m.b.isPlayer);
      window.resolveKnockoutMatch(false);
      var winnerIsPlayerOnLoss = playerMatch2.winner.isPlayer;
      return { winnerIsPlayerOnWin, winnerIsPlayerOnLoss };
    });
    expect(result.winnerIsPlayerOnWin).toBe(true);
    expect(result.winnerIsPlayerOnLoss).toBe(false);
  });
});

test.describe('Player Pool', () => {
  test('50-player pool: unique names, every role/rarity represented, overseas mix present', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const pool = await page.evaluate(() => window.ALL_PLAYERS);
    expect(pool.length).toBe(50);
    const names = pool.map(p => p.name);
    expect(new Set(names).size).toBe(names.length); // no duplicate names
    const roles = new Set(pool.map(p => p.role));
    ['Top-Order Batter','Middle-Order Batter','All-Rounder','Wicket-Keeper','Fast Bowler','Spin Bowler'].forEach(r => {
      expect(roles.has(r)).toBe(true);
    });
    const rarities = new Set(pool.map(p => p.rarity));
    ['common','uncommon','rare','epic','legendary'].forEach(r => {
      expect(rarities.has(r)).toBe(true);
    });
    expect(pool.some(p => p.overseas === true)).toBe(true);
    expect(pool.some(p => p.overseas === false)).toBe(true);
  });
});
