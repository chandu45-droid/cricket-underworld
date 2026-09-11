// Task 4 of docs/TEST-CASES.md: multi-persona end-to-end regression. The existing suite (194+
// tests across 7 other spec files) mostly injects its OWN specific hardcoded state per test --
// there's no shared "persona" concept to substitute in, so re-running those tests under different
// personas wouldn't exercise anything new (e.g. "training fails without coins" doesn't care who's
// playing). What DOES matter, and what this file actually tests, is the class of bug the
// zero-scroll permanent test just found: state COMBINATIONS that no single hardcoded test fixture
// happens to hit. Each persona below is a full, internally-consistent save state (not just one
// field changed), and each gets pushed through every major screen + a real match, watching for
// console errors and broken displays the whole way.
const { test, expect } = require('@playwright/test');

function squadOf(n, overrides = {}) {
  const roles = ['Top-Order Batter', 'Middle-Order Batter', 'All-Rounder', 'Wicket-Keeper', 'Fast Bowler', 'Spin Bowler'];
  return Array.from({ length: n }, (_, i) => Object.assign({
    id: 'p' + i, name: 'Player ' + i, role: roles[i % roles.length],
    bat: 60 + (i % 30), bwl: 60 + ((i + 3) % 30), fld: 55, fit: 75, form: 65,
    loyalty: 60, greed: 35, rarity: ['common', 'uncommon', 'rare', 'epic'][i % 4], overseas: i % 4 === 0,
  }, overrides));
}

const PERSONAS = {
  'P1 F2P Grinder': {
    coins: 450, gems: 0, blackMoney: 0, alignment: 5, heat: 0, fans: 20,
    season: 1, matchNum: 1, wins: 0, losses: 0, squad: squadOf(4), maxSquad: 15,
    morale: 60, auctionPurse: 1500, strategy: 'balanced', league: 'gully',
    debts: [], investigation: null, evidence: [],
    captainId: 'p0', selectedXI: [], teamName: 'Grinder XI', managerName: 'Rohit', teamColor: 'blue',
    tutorialDone: true, seasonPass: { xp: 0, premium: false },
  },
  'P2 Mid-Game': {
    coins: 5200, gems: 40, blackMoney: 180, alignment: -15, heat: 35, fans: 55,
    season: 1, matchNum: 7, wins: 3, losses: 3, squad: squadOf(13), maxSquad: 15,
    morale: 68, auctionPurse: 2200, strategy: 'balanced', league: 'gully',
    debts: [{ source: 'Hafta Collector', principal: 400, matchesLeft: 2, stage: 1, heldPlayer: null }], investigation: null, evidence: [],
    captainId: 'p0', selectedXI: [], teamName: 'Mid XI', managerName: 'Priya', teamColor: 'gold',
    tutorialDone: true, seasonPass: { xp: 210, premium: false },
  },
  'P3 Whale': {
    coins: 62000, gems: 2400, blackMoney: 50, alignment: 55, heat: 5, fans: 90,
    season: 1, matchNum: 5, wins: 4, losses: 1, squad: squadOf(15, { rarity: 'epic' }), maxSquad: 15,
    morale: 88, auctionPurse: 3000, strategy: 'balanced', league: 'gully',
    debts: [], investigation: null, evidence: [],
    captainId: 'p0', selectedXI: [], teamName: 'Whale XI', managerName: 'Arjun', teamColor: 'purple',
    tutorialDone: true, seasonPass: { xp: 480, premium: true },
  },
  'P4 Endgame Corrupt': {
    coins: 3800, gems: 10, blackMoney: 900, alignment: -62, heat: 88, fans: 40,
    season: 1, matchNum: 13, wins: 6, losses: 6, squad: squadOf(15), maxSquad: 15,
    morale: 45, auctionPurse: 1800, strategy: 'aggressive', league: 'gully',
    debts: [{ source: 'Hafta Collector', principal: 900, matchesLeft: 1, stage: 1, heldPlayer: null }],
    investigation: { matchesLeft: 2, inspector: null }, evidence: [{ type: 'Witness Statement' }],
    captainId: 'p0', selectedXI: [], teamName: 'Corrupt XI', managerName: 'The Fixer', teamColor: 'red',
    tutorialDone: true, seasonPass: { xp: 630, premium: false },
  },
};

async function injectPersona(page, state) {
  const defaults = { rivalData: {}, noAlignMatches: 0, tribunalBonus: 0, cleanStreak: 0, fanLoyalty: state.fans, mafiaBonus: null, sponsor: { tier: 2, name: 'Test Sponsor', purseBonus: 0 }, seasonStats: {} };
  const gs = Object.assign({}, defaults, state);
  await page.evaluate((s) => localStorage.setItem('cu_save_v3', JSON.stringify(s)), gs);
  await page.reload();
  await page.waitForSelector('#loading.hide', { timeout: 10000 });
  await page.evaluate(() => {
    ['tut-overlay', 'mafia-overlay', 'scorecard-overlay'].forEach((id) => { var el = document.getElementById(id); if (el) el.classList.remove('show'); });
  });
}

for (const [personaName, state] of Object.entries(PERSONAS)) {
  test.describe(personaName, () => {
    test('boots clean and every main screen navigates without console errors', async ({ page }) => {
      const errors = [];
      page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
      page.on('pageerror', (err) => errors.push(err.message));

      await page.goto('/');
      await injectPersona(page, state);

      for (const screen of ['hub', 'squad', 'cards', 'league']) {
        await page.click(`.nav-item[data-screen="${screen}"]`);
        await page.waitForSelector(`#${screen}-screen.active`, { timeout: 5000 });
        await page.waitForTimeout(300);
      }
      // Both Hub tabs.
      await page.click('.nav-item[data-screen="hub"]');
      await page.waitForTimeout(200);
      await page.click('.hub-tab[data-htab="club"]');
      await page.waitForTimeout(300);
      await page.click('.hub-tab[data-htab="play"]');
      await page.waitForTimeout(200);

      expect(errors, 'console errors while navigating: ' + JSON.stringify(errors)).toEqual([]);
    });

    test('key hub numbers render sensibly -- no NaN/undefined leaking into the UI', async ({ page }) => {
      await page.goto('/');
      await injectPersona(page, state);
      const hubText = await page.locator('#hub-screen').innerText();
      expect(hubText).not.toMatch(/NaN/);
      expect(hubText).not.toMatch(/undefined/);
      expect(hubText).not.toMatch(/\[object Object\]/);
    });

    test('can start, skip, and complete a full match without errors', async ({ page }) => {
      const errors = [];
      page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
      page.on('pageerror', (err) => errors.push(err.message));

      await page.goto('/');
      await injectPersona(page, state);
      await page.click('#hub-match-btn');
      await page.waitForTimeout(600);
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
      const scores = await page.locator('.result-scores').textContent();
      expect(scores).toMatch(/\d+\/\d+/);
      expect(errors, 'console errors during a full match: ' + JSON.stringify(errors)).toEqual([]);
    });
  });
}
