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
  test('shows all squad members', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await navigateTo(page, 'squad');
    const cards = await page.locator('.player-card-mini').count();
    expect(cards).toBe(11);
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
});

// ============================================================
// 9. CARDS & PACKS
// ============================================================
test.describe('Cards & Packs', () => {
  test('cards screen shows squad cards', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await navigateTo(page, 'cards');
    const cards = await page.locator('.player-card').count();
    expect(cards).toBe(11);
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

  test('promotion zone highlighted for top 2', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { wins: 14, losses: 0, matchNum: 14 });
    await navigateTo(page, 'league');
    const promRows = await page.locator('.league-row.promotion').count();
    expect(promRows).toBeGreaterThanOrEqual(1);
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
    await page.click('#morale-boost-btn');
    await page.waitForTimeout(500);
    const morale = await page.evaluate(() => window.GS.morale);
    expect(morale).toBe(65);
  });

  test('pep talk fails without coins', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 50 });
    await page.click('#morale-boost-btn');
    await page.waitForTimeout(500);
    const toast = await page.locator('.toast.show').textContent();
    expect(toast).toContain('Need');
  });

  test('media bribe reduces heat', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { coins: 1000, heat: 50 });
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
    await page.waitForTimeout(300);
    await expect(page.locator('#boost-btn.used')).toBeVisible();
    const boostBalls = await page.evaluate(() => window.match.boostBalls);
    expect(boostBalls).toBe(6);
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
