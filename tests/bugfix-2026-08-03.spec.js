// Regression coverage for the 5 confirmed bugs fixed in the 2026-08-03 full-game
// audit (see PROGRESS.md and docs/CODEBASE-MAP.md fix log for the full writeup).
// Mirrors the injectState/dismissOverlays/navigateTo pattern from
// tests/comprehensive.spec.js.
const { test, expect } = require('@playwright/test');

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

// ============================================================
// FIX 1 — Debt Stage-2 held player actually blocks squad selection
// ============================================================
test('FIX 1: debt stage-2 held player cannot be added to the XI', async ({ page }) => {
  await page.goto('/');
  // stage:1, matchesLeft:-1 -> processDebts() decrements to -2, still <0, escalates to stage 2
  await injectState(page, {
    debts: [{ source: 'Test Debt', principal: 100, matchesLeft: -1, stage: 1, heldPlayer: null }],
    selectedXI: []
  });
  const heldId = await page.evaluate(() => {
    window.processDebts();
    window.save();
    const held = GS.squad.find(p => p.debtHeld);
    return held ? held.id : null;
  });
  expect(heldId, 'processDebts() should have set debtHeld on exactly one squad player').not.toBeNull();

  await page.evaluate(() => window.showSquadSelect());
  await page.waitForSelector('#ss-player-list', { timeout: 5000 });
  await page.waitForTimeout(300);

  const row = page.locator(`.ss-player[data-sid="${heldId}"]`);
  await expect(row).toHaveClass(/banned/); // unavailable styling reused for held players too
  await expect(row).not.toHaveClass(/selected/);

  // row.click() gets stuck on Playwright's strict actionability check (an overlapping
  // decorative element intercepts the computed click point in this overlay's layout) --
  // dispatch a real DOM click directly, which still exercises the exact same delegated
  // listener on #ss-player-list that a genuine tap would.
  await page.evaluate((id) => {
    document.querySelector('.ss-player[data-sid="' + id + '"]').click();
  }, heldId);
  await page.waitForTimeout(200);
  await expect(row).not.toHaveClass(/selected/); // click must be rejected, not toggle it in
  await expect(page.locator('#toast')).toContainText(/held as mafia collateral/i);
});

// ============================================================
// FIX 2 — Auction Leak / Scout Intel favors removed from the offer pool
// ============================================================
test('FIX 2: mafia offers never surface Auction Leak or Scout Intel', async ({ page }) => {
  await page.goto('/');
  await injectState(page, { league: 'pro', blackMoney: 500 }); // non-gully so the full offer pool is in play
  const seenNames = new Set();
  for (let i = 0; i < 25; i++) {
    await page.evaluate(() => window.showMafiaOffer());
    await page.waitForTimeout(80);
    const overlayShown = await page.locator('#mafia-overlay.show').count();
    if (overlayShown > 0) {
      const name = await page.locator('#mafia-offer-content .cu-ribbon span').textContent();
      seenNames.add(name.trim());
      await page.evaluate(() => { document.getElementById('mafia-overlay').classList.remove('show'); });
    }
    await page.waitForTimeout(50);
  }
  expect([...seenNames]).not.toContain('Auction Leak');
  expect([...seenNames]).not.toContain('Scout Intel');
  expect(seenNames.size, 'sanity check: offers should still roll normally').toBeGreaterThan(0);
});

// ============================================================
// FIX 3 — resolveCard() saves immediately, not only at endAuction()
// ============================================================
test('FIX 3: resolveCard() persists a won card to localStorage synchronously', async ({ page }) => {
  await page.goto('/');
  await injectState(page, { coins: 5000, squad: [] });
  await page.evaluate(() => window.startAuction());
  await page.waitForTimeout(400);
  // force a win on the current card without waiting on the live bidding timer/UI
  const result = await page.evaluate(() => {
    window.auction.bidder = 'you';
    window.auction.bid = window.auction.bid || 100;
    window.resolveCard();
    var raw = localStorage.getItem('cu_save_v3');
    var saved = raw ? JSON.parse(raw) : null;
    window.auction.active = false; if (window.auction.interval) clearInterval(window.auction.interval);
    return { gsSquadLen: GS.squad.length, savedSquadLen: saved ? saved.squad.length : -1 };
  });
  expect(result.gsSquadLen).toBeGreaterThan(0);
  expect(result.savedSquadLen).toBe(result.gsSquadLen);
});

// ============================================================
// FIX 4 — endMatch() saves before Continue/Play Again is tapped
// ============================================================
test('FIX 4: match outcome is saved before Continue is tapped', async ({ page }) => {
  await page.goto('/');
  await injectState(page, { matchNum: 3, wins: 1, losses: 1, coins: 1000 });
  await page.click('#hub-match-btn');
  await page.waitForTimeout(600);
  await dismissOverlays(page);
  const ss = page.locator('.squad-select-overlay.show');
  if (await ss.count() > 0) {
    await page.click('#ss-auto-btn');
    await page.waitForTimeout(300);
    await page.click('#ss-confirm-btn');
  }
  await page.waitForSelector('#prematch-screen.active', { timeout: 5000 });
  await page.click('#start-match-btn');
  await page.waitForSelector('#match-screen.active', { timeout: 5000 });
  await page.click('#skip-btn');
  await page.waitForSelector('.match-result-overlay.show', { timeout: 10000 });
  // Deliberately do NOT click Continue -- simulate the app being killed right here.
  const saved = await page.evaluate(() => {
    var raw = localStorage.getItem('cu_save_v3');
    return raw ? JSON.parse(raw) : null;
  });
  expect(saved).not.toBeNull();
  expect(saved.matchNum).toBe(4); // matchNum++ happens inside endMatch(), before save()
  expect(saved.coins).not.toBe(1000); // coin reward already applied and persisted
});

// ============================================================
// FIX 5 — Impact Player Cancel removes its click listener (no duplicate fire)
// ============================================================
test('FIX 5: Impact Player cancel+reopen does not double-fire a substitution', async ({ page }) => {
  await page.goto('/');
  await injectState(page, { squad: makeSquad() });
  await page.evaluate(() => {
    window.match = {
      // leave 1 squad player off yourXI so the bench isn't empty (makeSquad() has exactly 11)
      yourXI: GS.squad.slice(0, 10).map(p => JSON.parse(JSON.stringify(p))),
      innings: 2,
      impactUsed: false
    };
    window.__momentCalls = 0;
    window.__origAddMoment = window.addMoment;
    window.addMoment = function(...args) { window.__momentCalls++; return window.__origAddMoment.apply(this, args); };
  });
  // Open -> Cancel, twice, to stack what would previously be duplicate listeners
  for (let i = 0; i < 2; i++) {
    await page.evaluate(() => window.showImpactPicker());
    await page.waitForSelector('#impact-cancel-btn', { timeout: 5000 });
    await page.waitForTimeout(150);
    await page.click('#impact-cancel-btn');
    await page.waitForTimeout(150);
  }
  // Reopen for real and complete one substitution
  await page.evaluate(() => window.showImpactPicker());
  await page.waitForSelector('.impact-out', { timeout: 5000 });
  await page.waitForTimeout(150);
  await page.locator('.impact-out').first().click();
  await page.locator('.impact-in:not(.disabled)').first().click();
  await page.waitForTimeout(300);
  const calls = await page.evaluate(() => window.__momentCalls);
  expect(calls).toBe(1);
});

// ============================================================
// GAME-LOGIC AUDIT FIXES (same day, second pass — balance/cricket-authenticity bugs)
// ============================================================

test('LOGIC FIX 1: aggressive strategy trades higher risk for higher reward, not risk-free', async ({ page }) => {
  await page.goto('/');
  await injectState(page);
  const stats = await page.evaluate(() => {
    const batter = { id: 1, name: 'B', bat: 70, bwl: 20, form: 70, fld: 60, role: 'Top-Order Batter' };
    const bowler = { id: 2, name: 'W', bat: 20, bwl: 70, form: 70, fld: 60, role: 'Fast Bowler' };
    function run(strategy, n) {
      let wkts = 0, boundaries = 0;
      for (let i = 0; i < n; i++) {
        const o = window.calcBallOutcome(batter, bowler, 'FLAT', 1, strategy, 75, true, 1, 0, 0, i);
        if (o.wicket) wkts++;
        if (o.runs === 4 || o.runs === 6) boundaries++;
      }
      return { wkts, boundaries };
    }
    return { agg: run('aggressive', 3000), bal: run('balanced', 3000), def: run('defensive', 3000) };
  });
  // Aggressive batting must cost MORE wickets than balanced/defensive, not fewer (the bug made
  // aggression strictly dominant: more boundaries AND fewer wickets, with no downside).
  expect(stats.agg.wkts).toBeGreaterThan(stats.bal.wkts);
  expect(stats.bal.wkts).toBeGreaterThan(stats.def.wkts);
  expect(stats.agg.boundaries).toBeGreaterThan(stats.bal.boundaries);
  expect(stats.bal.boundaries).toBeGreaterThan(stats.def.boundaries);
});

test('LOGIC FIX 2: auction floor no longer guarantees a profitable instant market flip', async ({ page }) => {
  await page.goto('/');
  await injectState(page, { coins: 5000, squad: [] });
  const result = await page.evaluate(() => {
    window.startAuction();
    const p = window.auction.pool[window.auction.idx];
    const floor = window.auction.bid; // base price set by showNextCard()
    const sellValue = Math.round(window.getPlayerPrice(p) * 0.6); // sellPlayer()'s payout formula
    window.auction.active = false; if (window.auction.interval) clearInterval(window.auction.interval);
    return { floor, sellValue };
  });
  // Winning at the exact unopposed floor and immediately reselling on the Transfer Market must
  // not be profitable (previously a flat rarity-only auction table vs. a stat-based market price
  // meant epic/legendary cards could be won near-floor and flipped for ~2-2.6x).
  expect(result.sellValue).toBeLessThanOrEqual(result.floor);
});

test('LOGIC FIX 3: alignment decay is blocked while under investigation', async ({ page }) => {
  await page.goto('/');
  await injectState(page, {
    alignment: -40, heat: 20, debts: [],
    investigation: { matchesLeft: 3, inspector: 0, bribeTried: false },
    noAlignMatches: 2
  });
  const alignmentAfter = await page.evaluate(() => {
    window.processAlignDecay();
    return GS.alignment;
  });
  expect(alignmentAfter).toBe(-40); // must NOT drift toward 0 while GS.investigation is open
});

test('LOGIC FIX 4: heat >= 90 still triggers the guaranteed investigation (no safety-valve exploit)', async ({ page }) => {
  await page.goto('/');
  await injectState(page, { heat: 95, matchNum: 3, wins: 1, losses: 1, coins: 1000, investigation: null, mafiaBonus: null });
  await page.click('#hub-match-btn');
  await page.waitForTimeout(600);
  await dismissOverlays(page);
  const ss = page.locator('.squad-select-overlay.show');
  if (await ss.count() > 0) {
    await page.click('#ss-auto-btn');
    await page.waitForTimeout(300);
    await page.click('#ss-confirm-btn');
  }
  await page.waitForSelector('#prematch-screen.active', { timeout: 5000 });
  await page.click('#start-match-btn');
  await page.waitForSelector('#match-screen.active', { timeout: 5000 });
  await page.click('#skip-btn');
  await page.waitForSelector('.match-result-overlay.show', { timeout: 10000 });
  const inv = await page.evaluate(() => GS.investigation);
  // heat 95 - 2 (base decay) = 93, still >= 86 -> checkInvestigation()'s guaranteed band.
  // Previously a deterministic ad-hoc fine ran first and dropped heat to ~55 before
  // checkInvestigation() ever saw it, so 90+ heat was SAFER than 86-89.
  expect(inv).not.toBeNull();
});

test('LOGIC FIX 5: a bowler cannot bowl more than 4 overs when an alternative exists', async ({ page }) => {
  await page.goto('/');
  await injectState(page, { squad: makeSquad() });
  const result = await page.evaluate(() => {
    window.match = {
      batting: 'opp', // opponent batting -> you are bowling -> scorecard.you.bowlers is your tally
      lastBowler: null,
      scorecard: { you: { bowlers: [{ name: 'Thunder Arm', runs: 40, balls: 24, wkts: 2 }] }, opp: { bowlers: [] } }
    };
    const bowlers = [
      { name: 'Thunder Arm', role: 'Fast Bowler', bwl: 88, form: 75 },
      { name: 'Swing King', role: 'Fast Bowler', bwl: 82, form: 68 }
    ];
    let neverPickedMaxed = true;
    for (let i = 0; i < 20; i++) {
      window.match.lastBowler = null; // ignore the separate "can't bowl consecutive overs" rule here
      const picked = window.pickBowler(bowlers, 2, i);
      if (picked.name === 'Thunder Arm') neverPickedMaxed = false;
    }
    return neverPickedMaxed;
  });
  expect(result).toBe(true);
});
