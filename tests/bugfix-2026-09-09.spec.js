// Regression coverage for the fixes shipped 2026-09-09 (see PROGRESS.md for the full writeup
// of each). Mirrors the injectState/dismissOverlays pattern from tests/comprehensive.spec.js
// and tests/bugfix-2026-08-03.spec.js.
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
// CAPTAIN TRAIT GATING (game-logic audit follow-up, GDD-alignment fix)
// ============================================================

test('CAPTAIN FIX 1: setCaptain rejects a non-eligible pick via real click, old-save captainId nulled on open', async ({ page }) => {
  await page.goto('/');
  // makeSquad()'s fixture players carry no .captaincy field at all -- none are eligible.
  // Default captainId:15 (Captain Cool) should be nulled the moment squad-select opens, since
  // showSquadSelect()'s capValid check now also requires .captaincy, not just XI membership.
  await injectState(page);
  await page.click('#hub-match-btn');
  await page.waitForTimeout(600);
  await dismissOverlays(page);
  const ssOverlay = page.locator('.squad-select-overlay.show');
  if (await ssOverlay.count() > 0) {
    const captainIdAfterOpen = await page.evaluate(() => window.GS.captainId);
    expect(captainIdAfterOpen).toBeNull();
    const lockedBtn = page.locator('.ss-cap-btn.locked').first();
    await expect(lockedBtn).toBeVisible();
    await lockedBtn.evaluate((el) => el.click()); // real DOM click, not Locator.click() -- see the
    // 2026-08-03 gotcha documented in PROGRESS.md: Locator.click() inside this overlay hits an
    // overlapping decorative element instead of the real button.
    await page.waitForTimeout(300);
    const captainIdAfterClick = await page.evaluate(() => window.GS.captainId);
    expect(captainIdAfterClick).toBeNull();
  }
});

test('CAPTAIN FIX 2: setCaptain accepts an eligible pick via real click', async ({ page }) => {
  await page.goto('/');
  const squad = makeSquad();
  squad[0] = Object.assign({}, squad[0], { captaincy: true, leadership: 88 }); // The Wall (id:1)
  await injectState(page, { squad, captainId: null });
  await page.click('#hub-match-btn');
  await page.waitForTimeout(600);
  await dismissOverlays(page);
  const ssOverlay = page.locator('.squad-select-overlay.show');
  if (await ssOverlay.count() > 0) {
    // 2026-09-09 no-vertical-scroll follow-up: with the XI-picker now paginated, the eligible
    // captain's row isn't necessarily on the page that's visible by default -- the pre-existing
    // (unchanged) role sort order in renderSquadSelect() happens to place this fixture's id:1 near
    // the end of the 11-player list, which lands it on page 2, not page 1. Navigate to whichever
    // page actually contains it first, same as a real player would tap through pages to find their
    // own eligible captain, instead of assuming DOM-first-order == visible-on-first-page.
    const targetPage = await page.evaluate(() => {
      var btn = document.querySelector('.ss-cap-btn[data-capid="1"]:not(.locked)');
      var pg = btn ? btn.closest('.ss-page') : null;
      return pg ? parseInt(pg.getAttribute('data-page'), 10) : null;
    });
    expect(targetPage).not.toBeNull();
    if (targetPage > 0) {
      for (let i = 0; i < targetPage; i++) {
        await page.locator('.page-arrow').nth(1).evaluate((el) => el.click()); // next arrow
        await page.waitForTimeout(200);
      }
    }
    const eligibleBtn = page.locator('.ss-cap-btn[data-capid="1"]:not(.locked)');
    await expect(eligibleBtn).toBeVisible();
    await eligibleBtn.evaluate((el) => el.click());
    await page.waitForTimeout(300);
    const captainId = await page.evaluate(() => window.GS.captainId);
    expect(captainId).toBe(1);
    await expect(page.locator('.ss-player.captain')).toHaveCount(1);
  }
});

test('CAPTAIN FIX 3: leadership stat measurably boosts batting output (formula-level, not just UI gating)', async ({ page }) => {
  await page.goto('/');
  await injectState(page);
  const stats = await page.evaluate(() => {
    const captainBatter = { id: 999, name: 'Cap', bat: 70, bwl: 20, form: 70, fld: 60, role: 'Top-Order Batter', captaincy: true, leadership: 90 };
    const plainBatter   = { id: 998, name: 'Plain', bat: 70, bwl: 20, form: 70, fld: 60, role: 'Top-Order Batter' }; // same base stats, no captaincy
    const bowler = { id: 2, name: 'W', bat: 20, bwl: 70, form: 70, fld: 60, role: 'Fast Bowler' };
    function run(batter, n) {
      window.GS.captainId = batter.id; // meaningless for plainBatter since it lacks .captaincy -- the
      // real guard (batter.id===GS.captainId && batter.captaincy) still correctly evaluates false
      let runs = 0;
      for (let i = 0; i < n; i++) {
        const o = window.calcBallOutcome(batter, bowler, 'FLAT', 1, 'balanced', 75, true, 1, 0, 0, i);
        runs += o.runs;
      }
      return runs;
    }
    // leadership:90 -> capBatMod = 1 + 90/2000 = 1.045x. A large sample is needed since this is a
    // much smaller effect size than e.g. the aggressive-vs-defensive strategy test elsewhere in
    // this suite -- a small N would be dominated by per-ball outcome variance, not the real signal.
    return { withCaptain: run(captainBatter, 30000), withoutCaptain: run(plainBatter, 30000) };
  });
  expect(stats.withCaptain).toBeGreaterThan(stats.withoutCaptain);
});

// ============================================================
// SQUAD-SELECT TAP-TO-TOGGLE (getCurrentSSSelection string/number mismatch)
// ============================================================

test('TOGGLE FIX: tapping squad-select rows decrements selection correctly, not collapsing to 1', async ({ page }) => {
  // Pre-fix, getCurrentSSSelection() read ids out of the DOM as strings via getAttribute()
  // while every consumer compared against numeric ids -- ["2"].indexOf(2) is always -1 in JS, so
  // every tap after the first was treated as a fresh "add" instead of a toggle, and the row that
  // was ALREADY selected silently dropped out of the next render. Empirically measured pre-fix:
  // 6 auto-selected rows -> tap row 1 -> collapses to 1 (not 5) -> tap row 2 -> still 1 (not 4).
  await page.goto('/');
  await injectState(page, { squad: makeSquad().slice(0, 6), selectedXI: [] });
  await page.evaluate(() => { window.showSquadSelect(); });
  await page.waitForSelector('#squad-select-overlay.show', { timeout: 5000 });
  const initial = await page.locator('.ss-player.selected').count();
  expect(initial).toBe(6); // fresh open auto-selects the whole 6-player squad as the XI

  await page.locator('.ss-player').nth(0).evaluate((el) => el.click());
  await page.waitForTimeout(200);
  const afterFirstTap = await page.locator('.ss-player.selected').count();
  expect(afterFirstTap).toBe(5); // real deselect, not a collapse to 1

  await page.locator('.ss-player').nth(1).evaluate((el) => el.click());
  await page.waitForTimeout(200);
  const afterSecondTap = await page.locator('.ss-player.selected').count();
  expect(afterSecondTap).toBe(4); // keeps decrementing correctly, not stuck at 1

  const sel = await page.evaluate(() => window.getCurrentSSSelection());
  expect(sel.every((id) => typeof id === 'number')).toBe(true); // the actual root-cause fix
});

// ============================================================
// DRS BATTING-ONLY GATING (was tappable while bowling, could only ever hurt the player)
// ============================================================

test('DRS FIX: active while batting, greyed + inert while bowling, guarded even against a direct call', async ({ page }) => {
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

  // Force batting side and confirm the button is genuinely active + clickable.
  // 2026-09-12: a DRS review is now gated to the dismissal JUST given (systems audit #10) -- it
  // used to be tappable at any moment, which let it resurrect a batter dismissed ten overs
  // earlier. This test is about REACHABILITY (the .unavailable state no longer swallows the tap),
  // and it uses `drsUsed` as its proxy for "the click reached the handler and did something", so
  // it now has to open a legitimate review window first. The assertion below is unchanged and
  // deliberately NOT weakened: a real click while batting must still actually work.
  await page.evaluate(() => {
    window.match.batting = 'you';
    window.match.wkts = 3;
    window.match.drsWindow = { side: 'you', batEntry: { name: 'Given Out', out: true }, bwlEntry: { name: 'Bowler', wkts: 1 }, batterName: 'Given Out' };
    window.syncDrsAvailability();
  });
  const battingState = await page.evaluate(() => {
    const btn = document.getElementById('drs-btn');
    return { unavailable: btn.classList.contains('unavailable'), pointerEvents: getComputedStyle(btn).pointerEvents };
  });
  expect(battingState.unavailable).toBe(false);
  expect(battingState.pointerEvents).not.toBe('none');
  const beforeBatClick = await page.evaluate(() => window.match.drsUsed);
  await page.locator('#drs-btn').evaluate((el) => el.click());
  await page.waitForTimeout(200);
  const afterBatClick = await page.evaluate(() => window.match.drsUsed);
  expect(beforeBatClick).toBe(false);
  expect(afterBatClick).toBe(true); // a real click while batting actually works

  // Fresh match, force bowling side -- button must be greyed out; a real click must have no
  // game-state effect but MUST still surface feedback (2026-09-09 follow-up fix: the .unavailable
  // state no longer uses pointer-events:none, since that silently swallowed the tap with zero
  // feedback -- the click now reaches useDRS()'s own guard, which shows a toast instead).
  await page.evaluate(() => { window.startMatch(); window.match.batting = 'opp'; window.syncDrsAvailability(); });
  const bowlingState = await page.evaluate(() => {
    const btn = document.getElementById('drs-btn');
    return { unavailable: btn.classList.contains('unavailable'), pointerEvents: getComputedStyle(btn).pointerEvents };
  });
  expect(bowlingState.unavailable).toBe(true);
  expect(bowlingState.pointerEvents).not.toBe('none'); // reachable, so the guard can give real feedback
  const beforeBowlClick = await page.evaluate(() => window.match.drsUsed);
  await page.locator('#drs-btn').evaluate((el) => el.click());
  await page.waitForSelector('#toast.show', { timeout: 3000 });
  const toastText = await page.locator('#toast').textContent();
  expect(toastText).toContain('only available while batting');
  const afterBowlClick = await page.evaluate(() => window.match.drsUsed);
  expect(beforeBowlClick).toBe(false);
  expect(afterBowlClick).toBe(false); // click reached the handler but the guard blocked the effect

  // Defense-in-depth: call useDRS() directly, bypassing the DOM/CSS block entirely.
  const directCall = await page.evaluate(() => {
    window.match.oppWkts = 2;
    window.useDRS();
    return { drsUsed: window.match.drsUsed, oppWkts: window.match.oppWkts };
  });
  expect(directCall.drsUsed).toBe(false);
  expect(directCall.oppWkts).toBe(2); // unchanged -- the guard inside useDRS() itself held
});

// ============================================================
// UI/UX AUDIT FIXES (senior ui-designer audit: bowler-picker, hub labels, FRM clip, toast overlap)
// ============================================================

test('UI FIX 1: bowler-picker scrolls into view when shown, not left below the fold', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await injectState(page, { squad: makeSquad() });
  await page.evaluate(() => {
    window.match.opponent = { name: 'Test Rivals', alignment: 0, heat: 0 };
    window.startMatch();
    window.match.batting = 'opp';
    const bowlers = window.extractBowlers(window.match.bwlXI);
    window.showBowlerPicker(bowlers, 0, 1);
  });
  await page.waitForTimeout(900); // let the smooth scroll finish
  const check = await page.evaluate(() => {
    const container = document.getElementById('match-screen');
    const picker = document.getElementById('bowler-picker');
    const rect = picker.getBoundingClientRect();
    return { scrollTop: container.scrollTop, visible: rect.top < window.innerHeight && rect.bottom > 0 };
  });
  expect(check.scrollTop).toBeGreaterThan(0); // it actually scrolled, not just show()'d in place
  expect(check.visible).toBe(true);
});

test('UI FIX 2: hub meter labels (Align/Heat/Fans) are not truncated at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/');
  await injectState(page);
  const labels = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.hub-meter .meter-label')).map((l) => ({
      text: l.textContent, clientWidth: l.clientWidth, scrollWidth: l.scrollWidth,
    }));
  });
  expect(labels.length).toBe(3);
  for (const l of labels) {
    expect(l.scrollWidth).toBeLessThanOrEqual(l.clientWidth); // not truncated (was 8/15/7px vs 27/23/23px needed)
  }
});

test('UI FIX 3: player card FORM stat is not clipped at narrow (pack-reveal) card width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await injectState(page);
  const check = await page.evaluate(() => {
    const p = window.ALL_PLAYERS[0];
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;top:0;left:0;width:140px;z-index:9999'; // pack-reveal width
    wrap.innerHTML = window.renderPlayerCard(p, true);
    document.body.appendChild(wrap);
    const card = wrap.querySelector('.player-card');
    const frm = wrap.querySelector('.card-footer .text-xs.text-slip');
    const cardRect = card.getBoundingClientRect();
    const frmRect = frm.getBoundingClientRect();
    const result = { clipped: frmRect.right > cardRect.right + 0.5, frmText: frm.textContent };
    document.body.removeChild(wrap);
    return result;
  });
  expect(check.clipped).toBe(false);
  expect(check.frmText).toContain('FRM');
});

test('UI FIX 4: auction purse-pacing toast no longer overlaps the player card', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await injectState(page, { squad: makeSquad().slice(0, 3) }); // <4 triggers the toast
  await page.evaluate(() => { window.goScreen('auction'); });
  await page.waitForTimeout(300);
  await page.click('#start-auction-btn');
  await page.waitForSelector('#toast.show', { timeout: 5000 });
  await page.waitForTimeout(200);
  const check = await page.evaluate(() => {
    const toast = document.getElementById('toast');
    const card = document.querySelector('.auction-spotlight .player-card, #auction-active-area .player-card');
    if (!card) return { noCard: true };
    const t = toast.getBoundingClientRect(), c = card.getBoundingClientRect();
    const overlap = t.left < c.right && t.right > c.left && t.top < c.bottom && t.bottom > c.top;
    return { overlap, noCard: false };
  });
  expect(check.noCard).toBe(false);
  expect(check.overlap).toBe(false);
});
