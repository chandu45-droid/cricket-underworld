// Permanent regression coverage for the 2026-09-10 no-vertical-scroll redesign (see PROGRESS.md).
// Promoted from a throwaway measurement script per docs/TEST-CASES.md's recommendation -- every
// prior verification of this invariant (the original redesign session AND this session's
// design-review fix pass) used a script that was written, run, and DELETED, meaning the exact
// "worst case" had to be re-derived from memory each time. This file pins it in code instead.
//
// IMPORTANT VIEWPORT-HEIGHT FINDING (found while building this): a naive height:700 viewport
// (used in an earlier throwaway check this session) shows real "overflow" on Hub/Squad/League even
// on pre-fix code that was already verified at genuine 0px -- 700px is simply too short a viewport
// for the real content, not a bug. At height:844 (a real modern-phone height, e.g. iPhone 12/13),
// the light-state overflow disappears entirely. Use 844, not an arbitrary shorter number, or this
// test will false-fail on content that was never broken.
const { test, expect } = require('@playwright/test');

const WIDTHS = [320, 375, 390];
const HEIGHT = 844;

function fullSquad() {
  return Array.from({ length: 15 }, (_, i) => ({
    id: 'p' + i, name: 'Player ' + i,
    role: ['Top-Order Batter', 'Middle-Order Batter', 'All-Rounder', 'Wicket-Keeper', 'Fast Bowler', 'Spin Bowler'][i % 6],
    bat: 70, bwl: 70, fld: 60, fit: 75, form: 70, loyalty: 60, greed: 40, rarity: 'rare', overseas: i % 3 === 0,
  }));
}

function baseState(overrides) {
  return Object.assign({
    coins: 5000, gems: 50, blackMoney: 30, alignment: 0, heat: 0, fans: 50,
    season: 1, matchNum: 3, wins: 1, losses: 1, squad: fullSquad(), maxSquad: 15,
    morale: 75, auctionPurse: 2000, strategy: 'balanced', league: 'gully',
    mafiaBonus: null, fanLoyalty: 50, cleanStreak: 0,
    sponsor: { tier: 3, name: 'Local Brand', purseBonus: 0 },
    rivalData: {}, debts: [], noAlignMatches: 0,
    evidence: [], investigation: null, tribunalBonus: 0,
    captainId: 'p0', selectedXI: [],
    teamName: 'Test XI', managerName: 'Tester', teamColor: 'gold', tutorialDone: true,
    seasonStats: {}, seasonPass: { xp: 340, premium: false },
  }, overrides);
}

async function measureOverflow(page, gs, width) {
  await page.setViewportSize({ width, height: HEIGHT });
  await page.evaluate((state) => localStorage.setItem('cu_save_v3', JSON.stringify(state)), gs);
  await page.reload();
  await page.waitForSelector('#loading.hide', { timeout: 10000 });
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
  await page.evaluate(() => {
    ['tut-overlay', 'mafia-overlay'].forEach((id) => { var el = document.getElementById(id); if (el) el.classList.remove('show'); });
  });
  const results = {};
  const overflow = async (sel) => {
    const r = await page.evaluate((s) => { const el = document.querySelector(s); return el ? { h: el.scrollHeight, c: el.clientHeight } : null; }, sel);
    return r ? r.h - r.c : null;
  };
  results.hubPlay = await overflow('#hub-screen');
  await page.click('[data-htab="club"]');
  await page.waitForTimeout(150);
  results.hubClub = await overflow('#hub-screen');
  await page.click('.nav-item[data-screen="league"]');
  await page.waitForTimeout(150);
  results.league = await overflow('#league-screen');
  await page.click('.nav-item[data-screen="cards"]');
  await page.waitForTimeout(150);
  results.cards = await overflow('#cards-screen');
  await page.click('.nav-item[data-screen="squad"]');
  await page.waitForTimeout(150);
  results.squad = await overflow('#squad-screen');
  return results;
}

test.describe('Zero-Vertical-Scroll Invariant', () => {
  for (const width of WIDTHS) {
    test(`full squad, no simultaneous investigation+debt -- all 5 nav screens hit true 0px at ${width}px`, async ({ page }) => {
      await page.goto('/');
      const r = await measureOverflow(page, baseState({}), width);
      expect(r.hubPlay, 'Hub Play tab').toBeLessThanOrEqual(0);
      expect(r.hubClub, 'Hub Club tab').toBeLessThanOrEqual(0);
      expect(r.league, 'League').toBeLessThanOrEqual(0);
      expect(r.cards, 'Cards').toBeLessThanOrEqual(0);
      expect(r.squad, 'Squad').toBeLessThanOrEqual(0);
    });
  }

  // KNOWN GAP, found while building this permanent test (2026-09-11) -- NOT caused by this
  // session's design-review fixes (confirmed: the state above with a full squad and no
  // investigation/debt hits genuine 0px, matching the original redesign's claim). Isolating each
  // condition independently found: investigation alone adds ~60-133px overflow to Hub, debt alone
  // adds ~38-110px, and the two TOGETHER (a fully plausible real game state -- both are
  // heat/alignment-driven and can coexist) add ~198-271px. League/Cards/Squad stay at genuine 0px
  // even under this combined state -- the gap is Hub-specific. This looks like the original redesign
  // verified investigation and debt as separate cases but never the combination. Founder decision
  // needed: is this worth a further Hub trim, or an acceptable edge case? This test pins TODAY's
  // measured overflow as a regression ceiling so a future change can't silently make it worse, NOT
  // as a claim that this is fine.
  for (const width of WIDTHS) {
    test(`KNOWN GAP: Hub overflows under simultaneous investigation+debt at ${width}px -- pinned as a regression ceiling, not asserted as correct`, async ({ page }) => {
      await page.goto('/');
      const r = await measureOverflow(page, baseState({
        investigation: { matchesLeft: 3, inspector: null },
        debts: [{ id: 'd1', amount: 500, type: 'hafta', matchesLeft: 2 }],
      }), width);
      // Regression ceiling, not a correctness claim -- see comment above. If these numbers grow,
      // something made the known gap worse. If they ever hit <=0, the gap is fixed -- update this
      // test to move that width to the passing group above.
      expect(r.hubPlay).toBeLessThanOrEqual(300);
      expect(r.hubClub).toBeLessThanOrEqual(220);
      // League/Cards/Squad are NOT part of the known gap -- they should stay at true 0 even here.
      expect(r.league, 'League').toBeLessThanOrEqual(0);
      expect(r.cards, 'Cards').toBeLessThanOrEqual(0);
      expect(r.squad, 'Squad').toBeLessThanOrEqual(0);
    });
  }
});
