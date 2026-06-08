const { test, expect } = require('@playwright/test');

// ============================================================
// HELPERS (same pattern as comprehensive.spec.js)
// ============================================================
async function dismissOverlays(page) {
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => {
      ['tut-overlay','mafia-overlay','scorecard-overlay','pack-overlay'].forEach(id => {
        var el = document.getElementById(id);
        if (el) el.classList.remove('show');
      });
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
    seasonStats:{},winStreak:0,bestStreak:0,dailyChallenge:null,lastChallengeDate:null,
    pepTalkUsed:false,rivalWins:{}
  };
  const gs = { ...defaults, ...overrides, squad };
  await page.evaluate((state) => {
    localStorage.setItem('cu_save_v3', JSON.stringify(state));
  }, gs);
  await page.reload();
  await page.waitForSelector('#loading.hide', { timeout: 10000 });
  await dismissOverlays(page);
}

// ============================================================
// P1.5 VISUAL REBUILD TESTS
// ============================================================

test.describe('P1.5 — Procedural Team Crests', () => {
  test('hub shows SVG team crest instead of letter avatar', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const crest = page.locator('#hub-crest svg');
    await expect(crest).toBeVisible();
    const svgHtml = await crest.innerHTML();
    expect(svgHtml).toContain('linearGradient');
    expect(svgHtml).toContain('<text');
  });

  test('crest uses team initial from team name', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { teamName: 'Mumbai Legends' });
    const text = await page.locator('#hub-crest svg text').textContent();
    expect(text).toBe('M');
  });

  test('crest color changes with team color setting', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { teamColor: 'crimson' });
    const svg = await page.locator('#hub-crest svg').innerHTML();
    expect(svg).toContain('#EF2D2D');
  });

  test('crest glow element exists', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await expect(page.locator('#hub-crest .team-crest-glow')).toBeAttached();
  });

  test('league table shows crests for all teams', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await page.click('#hub-league-btn');
    await page.waitForSelector('#league-screen.active', { timeout: 5000 });
    const crests = page.locator('.league-row .crest-xs svg');
    expect(await crests.count()).toBeGreaterThanOrEqual(5);
  });

  test('prematch shows team crests instead of letter badges', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await page.click('#hub-match-btn');
    await page.waitForTimeout(600);
    const ssOverlay = page.locator('.squad-select-overlay.show');
    if (await ssOverlay.count() > 0) {
      await page.click('#ss-auto-btn');
      await page.waitForTimeout(300);
      await page.click('#ss-confirm-btn');
    }
    await page.waitForSelector('#prematch-screen.active', { timeout: 5000 });
    const yourCrest = page.locator('#your-badge svg');
    const oppCrest = page.locator('#opp-badge svg');
    await expect(yourCrest).toBeVisible();
    await expect(oppCrest).toBeVisible();
  });
});

test.describe('P1.5 — Hub Power Ring', () => {
  test('power ring SVG is visible on hub', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const ring = page.locator('#hub-power-ring svg');
    await expect(ring).toBeVisible();
  });

  test('power ring shows team OVR value', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const val = await page.locator('#power-val').textContent();
    const ovr = parseInt(val);
    expect(ovr).toBeGreaterThan(0);
    expect(ovr).toBeLessThanOrEqual(100);
  });

  test('power ring fill stroke-dashoffset is set', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const offset = await page.locator('#power-ring-fill').getAttribute('style');
    expect(offset).toContain('stroke-dashoffset');
  });
});

test.describe('P1.5 — Battle Card', () => {
  test('battle card shows with squad present', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await expect(page.locator('.hub-battle-card')).toBeVisible();
  });

  test('battle card has VS between crests', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await expect(page.locator('.battle-vs')).toHaveText('VS');
    await expect(page.locator('#battle-your-crest svg')).toBeVisible();
    await expect(page.locator('#rival-avatar svg')).toBeVisible();
  });

  test('battle card shows your team name and rival name', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { teamName: 'Chennai Kings' });
    const yourName = await page.locator('#battle-your-name').textContent();
    expect(yourName).toBe('Chennai Kings');
    const rivalName = await page.locator('#rival-name').textContent();
    expect(rivalName.length).toBeGreaterThan(0);
  });

  test('battle card shows strength values', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const yourStr = await page.locator('#battle-your-str').textContent();
    const rivalStr = await page.locator('#rival-str').textContent();
    expect(parseInt(yourStr)).toBeGreaterThan(0);
    expect(parseInt(rivalStr)).toBeGreaterThan(0);
  });
});

test.describe('P1.5 — Player Card Silhouettes', () => {
  test('player cards show SVG silhouettes instead of letters', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await page.click('#hub-cards-btn');
    await page.waitForSelector('#cards-screen.active', { timeout: 5000 });
    const silhouettes = page.locator('.player-card .player-silhouette svg');
    expect(await silhouettes.count()).toBeGreaterThan(0);
  });

  test('batter cards have bat-stance silhouette', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await page.click('#hub-cards-btn');
    await page.waitForSelector('#cards-screen.active', { timeout: 5000 });
    const firstCard = page.locator('.player-card').first();
    const svg = await firstCard.locator('.player-silhouette svg').innerHTML();
    expect(svg).toContain('circle');
    expect(svg).toContain('line');
  });

  test('OVR badge has angular clip-path', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    await page.click('#hub-cards-btn');
    await page.waitForSelector('#cards-screen.active', { timeout: 5000 });
    const badge = page.locator('.player-card .ovr-badge').first();
    const clipPath = await badge.evaluate(el => getComputedStyle(el).clipPath);
    expect(clipPath).toContain('polygon');
  });
});

test.describe('P1.5 — Spring Physics & Animations', () => {
  test('screen transitions use spring curves', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const screen = page.locator('.screen');
    const transition = await screen.first().evaluate(el => getComputedStyle(el).transition);
    expect(transition).toBeTruthy();
  });

  test('glass panels have elevation shadows', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const glass = page.locator('.glass').first();
    const shadow = await glass.evaluate(el => getComputedStyle(el).boxShadow);
    expect(shadow).not.toBe('none');
    expect(shadow.length).toBeGreaterThan(20);
  });

  test('action tiles have elevation shadows', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const tile = page.locator('.action-tile').first();
    const shadow = await tile.evaluate(el => getComputedStyle(el).boxShadow);
    expect(shadow).not.toBe('none');
  });
});

test.describe('P1.5 — Animated Gradient Backgrounds', () => {
  test('hub screen has animation on background', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const animation = await page.locator('#hub-screen').evaluate(el => getComputedStyle(el).animationName);
    expect(animation).toContain('hubMesh');
  });

  test('match screen has animated background', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const animation = await page.evaluate(() => {
      return getComputedStyle(document.getElementById('match-screen')).animationName;
    });
    expect(animation).toContain('matchMesh');
  });

  test('all screens have unique mesh animations', async ({ page }) => {
    await page.goto('/');
    await injectState(page);
    const screens = ['hub','auction','squad','cards','league','match'];
    const animations = await page.evaluate((ids) => {
      return ids.map(id => {
        const el = document.getElementById(id + '-screen');
        return el ? getComputedStyle(el).animationName : 'none';
      });
    }, screens);
    const unique = new Set(animations.filter(a => a !== 'none'));
    expect(unique.size).toBeGreaterThanOrEqual(5);
  });
});

test.describe('P1.5 — Hub Meters & Layout', () => {
  test('alignment meter displays correct value', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { alignment: 42 });
    const val = await page.locator('#align-val').textContent();
    expect(val).toBe('+42');
  });

  test('heat meter reflects game state', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { heat: 65 });
    const val = await page.locator('#heat-val').textContent();
    expect(val).toBe('65');
  });

  test('fan loyalty meter displays', async ({ page }) => {
    await page.goto('/');
    await injectState(page, { fanLoyalty: 80 });
    const val = await page.locator('#fan-val').textContent();
    expect(val).toBe('80');
  });
});

test.describe('P1.5 — No JS Errors', () => {
  test('game loads without console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/');
    await injectState(page);
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });

  test('navigating all screens produces no errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/');
    await injectState(page);
    const navItems = page.locator('.nav-item');
    const count = await navItems.count();
    for (let i = 0; i < count; i++) {
      await navItems.nth(i).click({ force: true });
      await page.waitForTimeout(800);
    }
    expect(errors).toEqual([]);
  });

  test('starting a match produces no errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
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
    await page.click('#start-match-btn');
    await page.waitForSelector('#match-screen.active', { timeout: 5000 });
    await page.waitForTimeout(3000);
    expect(errors).toEqual([]);
  });
});
