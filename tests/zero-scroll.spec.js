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
    test(`full squad, no investigation/debt -- all 5 nav screens hit true 0px at ${width}px`, async ({ page }) => {
      await page.goto('/');
      const r = await measureOverflow(page, baseState({}), width);
      expect(r.hubPlay, 'Hub Play tab').toBeLessThanOrEqual(0);
      expect(r.hubClub, 'Hub Club tab').toBeLessThanOrEqual(0);
      expect(r.league, 'League').toBeLessThanOrEqual(0);
      expect(r.cards, 'Cards').toBeLessThanOrEqual(0);
      expect(r.squad, 'Squad').toBeLessThanOrEqual(0);
    });
  }

  // FIXED 2026-09-11 (was "KNOWN GAP" -- see docs/FINDINGS.md for the full history). Isolating each
  // condition independently had found: investigation alone added ~60-133px overflow to Hub, debt
  // alone ~38-110px, and the two TOGETHER (a fully plausible real game state -- both are
  // heat/alignment-driven and can coexist) ~198-271px, while League/Cards/Squad stayed at genuine
  // 0px even under the same combined state -- the gap was Hub-specific. Root cause: investigation-
  // panel/debt-panel's full detail (stage-track, inspector narration, bribe/pressure buttons, full
  // per-debt payable cards) lived inline in the always-visible persistent band. Fix: moved that
  // detail into 2 new destination overlays (#case-file-overlay/#debt-overlay, same drawer-overlay
  // pattern already proven for Club Management/Store/Underworld), leaving compact glanceable
  // summaries inline. Closing the remaining ~10% needed finding a real cascade-specificity bug along
  // the way: `#hub-persistent-band .glass{padding:9px 12px}` (ID+class) was silently beating a plain
  // `#investigation-panel{padding:...}` override (ID alone) -- the exact same bug class already
  // documented twice in this file from the original redesign session. Now asserts true 0px, not a
  // regression ceiling.
  for (const width of WIDTHS) {
    test(`full squad, simultaneous investigation+debt -- all 5 nav screens hit true 0px at ${width}px`, async ({ page }) => {
      await page.goto('/');
      const r = await measureOverflow(page, baseState({
        investigation: { matchesLeft: 3, inspector: null },
        debts: [{ source: 'Hafta Collector', principal: 500, matchesLeft: 2, stage: 1, heldPlayer: null }],
      }), width);
      expect(r.hubPlay, 'Hub Play tab').toBeLessThanOrEqual(0);
      expect(r.hubClub, 'Hub Club tab').toBeLessThanOrEqual(0);
      expect(r.league, 'League').toBeLessThanOrEqual(0);
      expect(r.cards, 'Cards').toBeLessThanOrEqual(0);
      expect(r.squad, 'Squad').toBeLessThanOrEqual(0);
    });
  }
});
