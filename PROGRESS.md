# Progress — Cricket Underworld

> ### 📐 NO-VERTICAL-SCROLL REDESIGN — HUB SCREEN IN PROGRESS, NOT COMMITTED (2026-09-09/10, 5th piece, incomplete)
> **Current status as of Update 3 below (read that one first, it supersedes everything else in this
> entry): NEITHER tab is done. Play tab's earlier "0px confirmed" claim (this line, originally) was
> retracted in Update 2 — real overflow ~341-356px, its own content not yet touched. Club tab is down
> to ~79-119px (from a real starting point of ~234-296px, not the "65px" this entry originally
> chased) after a shared-band redesign + further Club-specific trims, full suite green.** The rest of
> this entry (below) is kept for the historical trail of how the 65px number turned out to be wrong
> and what was learned about measurement methodology along the way — Update 3 has the current numbers
> and next steps; don't act on anything above it without checking it's not already superseded.
>
> **What was built this piece:**
> - New `#hub-persistent-band` wrapper around crest/meters/ticker/empire-line/investigation-panel/
>   debt-panel/mafia-banner/ban-panel/injury-panel (unchanged content, just grouped).
> - New `.hub-tabs` Play/Club switcher (`data-htab="play"|"club"`) splitting the old single long Hub
>   into `#hub-tab-play` (primary loop / action tiles / next match / daily bonus / quick tiles) and
>   `#hub-tab-club` (achievement rail / desk row / underworld ledger / 3 drawers, inline-expand
>   mechanism unchanged). Tab-switch JS bound near the other event wiring.
> - `renderHubLedger()`: removed the `debtHtml` block (confirmed genuine duplicate of the dedicated
>   debt panel elsewhere in the persistent band), kept the 4-tile stat grid only.
> - `renderHubDeskRow()` + markup + CSS: merged the 2 separate `cu-card` desk-row tiles (Squad
>   Strength, Season Progress) into 1 shared card — `.hub-desk-col`/`.hd-col-divider` flex layout
>   replacing the old `grid-template-columns` 2-tile layout. Reasoning: `getTeamStrength()`'s headline
>   number duplicates the Squad screen's own "Overall" stat (confirmed genuine dupe), but the
>   mini-standings list and Season Progress content are NOT duplicated elsewhere, so content was kept,
>   only the wrapping card chrome was merged — this was the founder-approved "structural change"
>   response to a 65px residual that plain CSS trimming couldn't close (down from 272px via ~25
>   individual property trims across `.hub-stadium-backdrop`, `.hub-meters`, `.hub-header`,
>   `.action-tile`, `.hub-login-panel`, `.hub-empire-line`, `.quick-tiles`, `.hub-news-ticker`,
>   `.hub-tabs`, `.cu-ribbon-wrap`, `#hub-screen` bottom padding, `.hub-drawer*`, `.hub-ach-item`,
>   `.hub-achieve-rail`, `.hd-val`, `.hub-ledger*`, `.hlg-*`, `.hd-stand`, `.hd-prog-bar` — see prior
>   session's edits, not yet individually logged as a separate entry since the piece as a whole isn't
>   done).
>
> **UNRESOLVED — the actual blocker:** after the desk-row merge (which removes one full `cu-card`'s
> worth of border/padding/shadow overhead — should be a real, measurable height saving), re-measuring
> Club tab's overflow via a Playwright script (click Club tab, read `#hub-screen`'s
> `scrollHeight - clientHeight`) still returns **exactly 65px — byte-for-byte identical to the
> pre-merge number.** This is not a rounding coincidence; a structural change that should have saved
> real vertical space produced *zero* measured improvement. Two syntax-check passes (`new Function()`
> on both inline `<script>` blocks) came back clean, so the merge isn't silently erroring out of the
> render path — but that only rules out a JS crash, not a CSS/layout mistake. **Never investigated
> before the session paused:**
> - Never measured `#hub-desk-row`'s own `getBoundingClientRect().height` before vs. after the merge
>   directly — only ever measured the *page-level* aggregate overflow, which can't distinguish
>   "the merge saved nothing" from "the merge saved height but something else on the page grew by the
>   same amount at the same time" (e.g. a margin-collapse change, or the new `.hd-col-divider`/flex
>   `gap:12px` consuming what the removed card-chrome freed up).
> - Never took a screenshot of the merged desk-row — visual correctness (does it actually render as
>   one card with a divider, or did something silently fail to apply) is unverified.
> - Possible causes not yet ruled in or out: (a) the removed `cu-card` border/shadow overhead was
>   smaller in practice than assumed when planning the merge; (b) `gap:12px` between the two
>   `.hub-desk-col`s plus the 1px divider nets out close to what two separate card margins used to
>   cost; (c) some *other* unrelated element in Club tab grew in the same edit pass and is masking the
>   real saving; (d) the merge's CSS didn't actually apply (specificity/cascade miss — same trap
>   documented earlier this session for League/Squad) and the browser is still rendering old-style
>   tile spacing some other way.
>
> **Next session should start here, in this order:**
> 1. Measure `#hub-desk-row` height directly (not page aggregate) to isolate whether the merge itself
>    saved anything.
> 2. Screenshot the Club tab in both themes to confirm the merge rendered as intended at all.
> 3. If the merge really saved 0px, don't trim further blindly — find the actual 65px culprit by
>    binary-searching Club tab's remaining sections (achievement rail / desk row / ledger / drawer
>    toggles) the same way League/Squad's real-vs-apparent-overflow trap was resolved earlier this
>    session (measure section-by-section, don't trust the aggregate number alone).
> 4. Once Club tab hits genuine 0px (`scrollHeight===clientHeight`, not just visually-fine), visually
>    verify both tabs in both themes, run full `npx playwright test`, fix any breaks honestly (not by
>    patching assertions), grep tests for `hub-` ids affected by the tab split (not yet done),
>    THEN commit — nothing from this Hub piece is committed yet, all of it is uncommitted working-tree
>    state.
> 5. Write the real PROGRESS.md completion entry for Hub once actually done (this entry is a status/
>    handoff note, not that entry — replace or supplement it, don't leave both as if redundant).
> 6. Separate remaining piece, not started: convert Hub's 3 drawers (Store & Rewards, Club Management,
>    Underworld) from inline-expand to a destination-overlay pattern — needed because collapsed-state
>    CSS trims don't touch the ~1600-2221px overflow that occurs when a drawer is actually opened;
>    this is a different problem from the collapsed-state 65px gap and was explicitly scoped as a
>    separate step by the founder earlier in this redesign, still pending.
> 7. After Hub is fully done (collapsed AND drawer-open states both zero-scroll) and committed, the
>    no-vertical-scroll redesign as a whole (League/Cards/Squad/XI-picker/Hub = all 5 pieces) is
>    complete — that's the point to do a final full-suite run and a closing summary entry.
>
> **Session ended here on context ceiling, not on a natural stopping point** — Hub is genuinely
> mid-repair, not paused at a clean boundary. Treat the working tree as WIP, verify what's actually on
> disk before assuming the description above is 100% current (it reflects the last tool output seen,
> not a fresh re-read).
>
> **UPDATE (2026-09-10) — root cause of the "65px unchanged" reading found: it was measurement noise,
> not a dead merge.** Reconstructed the exact pre-merge state (took the committed HEAD version — which
> predates all Hub work — and manually reverted *only* the desk-row merge hunk from `git diff` back
> onto a copy of the current working tree, so the comparison is apples-to-apples: tabs already split,
> only the desk-row markup/CSS differs) and re-measured `#hub-desk-row.getBoundingClientRect().height`
> directly, per the plan from the last entry. First pass reproduced the same "no change" illusion —
> then traced it to the Hub's `stagger-child` fade/slide-in CSS animation: the measurement script's
> 400ms wait after clicking the Club tab wasn't reliably past the animation's settle point, so
> consecutive runs of the *same* file returned different heights (e.g. one AFTER run read 113.20px,
> a re-run read 113.15px — small, but enough to make a real 6-10px difference look absent depending on
> exactly when each of the two pages happened to be sampled). Fixed by injecting
> `*{animation:none!important;transition:none!important}` before measuring and waiting 1200ms; results
> became exactly reproducible across repeated runs and across all 3 tested widths (320/375/390):
>
> | | MID (pre-merge, tabs split) | AFTER (post-merge) | delta |
> |---|---|---|---|
> | `#hub-desk-row` height | 119.0px | 113.0px | **-6px** |
> | Club tab total overflow @320 | 296px | 286px | -10px |
> | Club tab total overflow @375 | 264px | 254px | -10px |
> | Club tab total overflow @390 | 264px | 254px | -10px |
>
> So the merge **did** work — a real, consistent 10px reduction in total overflow at every tested
> width, not zero. The earlier "identical 65px" conclusion was wrong; retract it. **Also important:**
> the actual overflow number at all 3 widths (254-296px) is far larger than the "65px residual" this
> whole investigation was trying to explain — meaning the 65px figure itself was very likely *also* a
> product of the same unkilled-animation timing noise (measured mid-animation, catching Club tab at a
> transient partially-collapsed height rather than its settled one), not a trustworthy baseline. **Do
> not carry the "65px" number forward into further work — it's discredited.** The trustworthy number,
> measured with animations forced off and confirmed reproducible, is **~254-296px of real overflow
> still remaining on Club tab**, substantially more work than previously believed.
>
> **Lesson for this whole redesign, not just Hub:** any screen using `.stagger-child` (Hub is the only
> one that does, per grep — League/Cards/Squad/XI-picker don't use this animation class) needs
> animations forced off before trusting a `scrollHeight`/`getBoundingClientRect` measurement, or needs
> a wait comfortably past the stagger animation's total duration+delay. Add this to the standard
> measurement method for the rest of Hub's work, not just this one investigation.
>
> **UPDATE 2 (2026-09-10, same session) — Club tab trimmed further via a real structural change
> (drawer-row merge), AND a much bigger cross-cutting bug found: the earlier "Play tab is done, 0px
> confirmed" claim is WRONG.**
>
> **Club tab progress (the actual ask this round):** applied CSS-only trims across desk-row/ledger/
> achieve-rail (padding/margin/gap shaves, all content-preserving, ~4-10px each), then a structural
> change to the 3 stacked drawers — same escalation pattern as the desk-row merge: wrapped
> `#drawer-rewards`/`#drawer-club`/`#drawer-underworld` in a new `.hub-drawer-row` flex container so
> their COLLAPSED toggles sit side-by-side as compact icon+title tiles instead of 3 full-width bars
> stacked vertically (was 126px of the 234px total just from 3× border+padding+icon+title+subtitle
> rows). Content-preserving: titles still shown (wrap to 2 lines), subtitles hidden only in the
> collapsed-row view via CSS `display:none` (still in the DOM, shown again once a drawer is
> `.open`, which breaks that one drawer out to its own full-width line via `flex-basis:100%` so its
> body still renders full-width exactly as before — collapsed siblings stay in the compact row).
> Result: Club tab overflow dropped from ~234px to ~159px @375/390 (worst-case measurement, see
> below) — real, substantial progress, but **not yet zero**.
>
> **The bigger finding — root-caused the exact 22px flakiness from Update 1's table, and it wasn't
> noise at all:** it's `#mafia-banner`, a persistent-band element shared by BOTH Play and Club tabs.
> `updateHub()`'s flavor-text picks one of 3 messages via `Math.random()` regardless of whether
> `GS.mafiaBonus` is set — the longest message wraps to 2 lines (129.7px), the shorter two fit on 1
> (107.8px), a genuine and expected **21.9px swing that will happen in real play**, not a test
> artifact. Forced it deterministically for measurement (`Math.random = () => 0` via
> `page.addInitScript`, selecting the longest/worst-case message) instead of leaving it to chance —
> this made every subsequent Club tab measurement exactly reproducible (180px@320, 159px@375/390,
> zero variance across repeated runs).
>
> **Using that same worst-case-forcing method on Play tab — which the previous entry claimed was
> "done, 0px overflow, confirmed" — found it is NOT zero: 397-401px of real overflow across all 3
> widths.** Section breakdown: the persistent band's `mafia-banner` (129.7px worst-case) plus
> `hub-next-rival-ribbon`+`hub-next-rival` (215px, shown because the test state has a scheduled next
> match — `GS.matchNum=3`, the same default used throughout this whole redesign's test harness)
> account for most of it. **The earlier "0px confirmed" verification was almost certainly done under
> a narrower game state that happened to hide one or both of these** (no scheduled match, and/or a
> lucky short mafia message, and/or the banner's `hubZone.mafiaAccess`/`GS.investigation` gate
> happening to hide it) — not a true worst-case check. That claim should be treated as **retracted**,
> not just "needs re-verification." Play tab has real, substantial, previously-unreported overflow.
>
> **This changes the shape of what's left in Hub, and arguably in every earlier "done" screen too:**
> every prior zero-scroll verification in this whole redesign (League/Cards/Squad/XI-picker, plus
> Hub's Play tab) was done by injecting one fixed representative `GS` state via the same
> `injectState()` helper from `tests/comprehensive.spec.js` — none of them appear to have
> specifically stress-tested state-conditional persistent-band elements (mafia-banner's random
> message, a scheduled-vs-no-next-match toggle, active investigation/debt/ban/injury panels, which
> all live in the shared `#hub-persistent-band` used by both Hub tabs). **Nothing about League/Cards/
> Squad/XI-picker's own screen-specific content is known to be affected** — this band is Hub-only —
> but Hub's Play tab genuinely needs to be redone, and Club tab's remaining trim work should be
> planned against this newly-honest 159-180px baseline, not the stale 65px/234px numbers.
>
> **Not yet done this session:** getting Club tab the rest of the way to true 0px; re-fixing Play tab
> from scratch against its real 397-401px overflow; deciding whether the persistent band itself
> (crest/meters backdrop, empire-line, mafia-banner, the 4 conditional panels) needs its own
> worst-case-safe redesign since it's shared infrastructure both tabs sit on top of, which would be
> the more durable fix than trimming each tab's own content further while the band underneath keeps
> silently growing under real game states. Founder has not yet weighed in on which to prioritize.
>
> **UPDATE 3 (2026-09-10, same session) — founder chose "redesign the shared band first."
> Real, verified progress on both the band and Club tab; Play tab's own content is the next
> remaining piece, not yet started.**
>
> **Shared `#hub-persistent-band` fixes (the actual root-cause work):**
> - `.mafia-banner`/`.mb-title`/`.mb-text`/`.mb-action`: this banner had never been touched by any
>   earlier trimming pass in this whole redesign (it's `display:none` by default, so it was invisible
>   to whatever GS state those passes measured against) despite showing in most non-clean alignment
>   zones — genuinely common, not a rare edge case. Padding cut ~40%, margin-bottom 16px→6px, title/
>   action font shrunk. `.mb-text` (the flavor-text quote) was trimmed moderately (19px→16px), not
>   collapsed to base size, specifically to respect `docs/visual-design-system.md` §3.1's documented
>   "Dramatic/Mafia/Quotes → Teko, oversized" rule — a real design-system constraint, not just a
>   number to hit zero.
> - `#hub-persistent-band .glass` (investigation/debt/ban/injury panels) and `.section-title.sm`
>   scoped-trimmed (both are shared classes used everywhere else, so scoped rather than touching
>   base — same discipline as every other cross-screen class this whole redesign). `.hub-ban-item`
>   and `.hub-bans` (single-use-site classes, safe to edit directly) trimmed too. Investigation
>   panel's inline-styled icon box (40px→30px) and evidence-count digit (24px→18px) shrunk directly
>   in markup since those were inline styles, not CSS classes.
> - Verified with a deterministic worst-case method (`Math.random = () => 0` via
>   `page.addInitScript`, forcing the mafia-banner's longest flavor message instead of leaving it to
>   chance) rather than trusting whatever random message happened to render — this is now the
>   standing method for measuring anything touching this band, documented in the scratch script.
>
> **Effect measured on both tabs** (worst-case mafia message, animations killed, 320/375/390 all
> tested): Club tab **234px → 99px** from the band fixes alone; Play tab **397-401px → 341-356px**
> from the same band fixes (no Play-tab-specific content touched yet — this delta is 100% the shared
> band getting smaller under both tabs).
>
> **Then continued Club-tab-specific trimming** (the original ask before the Play-tab regression was
> found) on top of the now-honest baseline: desk-row padding/gap tightened further, `.hd-val` font
> 21px→18px, `.hub-ledger` padding tightened, `.hll-title` 15px→13px, `.hlg-stat` padding trimmed,
> `.hub-achieve-rail`/`.hub-ach-item` padding/icon/gap tightened again. **Club tab: 99px → 79px
> @375/390 (119px @320)** — down from the original 234-296px this whole investigation started from.
> **Not yet zero, but the closest it's been.**
>
> **Full regression run: 191-194/194 passed** (2 full-suite runs; the 3 timeout-style failures on the
> first run — a corrupt-save test, a 0-coins edge case, and the already-documented flaky probabilistic
> strategy test — all passed cleanly in isolation, confirming environmental flakiness from running 6
> parallel workers alongside this session's own background node/serve processes, not a real
> regression from the CSS/markup changes). **Also found and fixed a separate, real, pre-existing
> break**: 14 call sites across `smoke.spec.js`/`features-10k.spec.js`/`comprehensive.spec.js` clicked
> a `#drawer-*-toggle` directly without first switching to the Club tab — broken by the earlier
> (already-uncommitted) Play/Club tab split, never caught because Hub's tests hadn't been run since
> that split happened. Fixed all 14 by adding `.hub-tab[data-htab="club"]` click first, matching real
> user behavior. **Flagging one real product-level side effect this surfaced, not just a test
> artifact**: reaching Store & Rewards (Vault/Sponsor Break/Syndicate Contract) now takes 3 taps from
> Hub instead of the 2 the test used to assert — renamed that test's title/assertion to match reality
> rather than silently keeping the old "<=2 taps" claim. This is a direct, foreseeable consequence of
> the Play/Club split itself (already founder-approved earlier in this redesign), not something new
> introduced this session — flagging it here since it touches monetization reachability, a real
> business concern per this project's F2P constraints, not just layout.
>
> **Still remaining, unchanged in kind from before, just re-baselined to honest numbers:**
> - Club tab: ~79-119px left to close (was chasing a false "65px", the real number was always bigger).
> - Play tab: **~341-356px still unaddressed** — its own content (`action-tiles` 132px, `hub-next-
>   rival`+ribbon 215px, `hub-login-panel` 95px, `quick-tiles` 50px) hasn't been touched this round;
>   only the shared band underneath it got smaller. This is the next full piece of work, not a small
>   follow-up — comparable in size to what Club tab needed.
> - Drawer inline-expand → destination-overlay conversion (the ~1600-2221px drawer-OPEN overflow,
>   separate from the collapsed-state numbers above) still not started.
> - Uncommitted: everything in this update, Update 1, and Update 2 is still sitting as working-tree
>   changes. Given this update closes with a green full-suite run and real (if incomplete) progress,
>   this is a reasonable checkpoint-commit point per this project's "commit early and often" case
>   law — check git status/diff before assuming what's staged.
>
> **UPDATE 4 (2026-09-10, same session) — Play tab's own content trimmed hard. Real progress,
> still not zero.**
>
> Founder said "continue trimming Play tab to zero overflow." Worked through its own sections in
> descending size order, same empirical iterate-and-measure discipline as every other screen:
>
> - **Found and removed a literal duplicate label**, no CSS trimming needed: `#hub-next-rival-ribbon`
>   (a "Next Match" section ribbon sitting above the battle card) duplicated the battle card's own
>   internal `.battle-label` which already reads "NEXT MATCH". Removed the standalone ribbon entirely
>   (markup only; its `show()`/`hide()` calls in `updateHub()` are null-safe no-ops now, left in place
>   rather than ripped out). Zero content lost, ~30px+margin recovered for free.
> - **`.hub-battle-card`** (the next-match preview): padding/margin trimmed, crest/VS-diamond shrunk
>   moderately (30→22px / 36→32px), and its 3-stat footer (Relationship/H2H/Fixes) **restructured
>   from 3 stacked 2-line label+value blocks into 1 line of "label value" pairs** — same 3 element
>   ids untouched so `updateHub()`'s JS needed zero changes, just less markup height for the same data.
> - **`.action-tile`** (Auction/Match CTAs): 2nd trim round on top of an earlier-session pass that had
>   explicitly called these tiles "the last lever" against Club tab's much smaller gap — Play tab's
>   real gap turned out to be a different order of magnitude, so they got trimmed further this round
>   too (icon 46→30px, min-height 112→74px, title font 22→17px via the winning v3-kit override).
>   Icon+title+subtitle all still present.
> - **Hub identity header** (crest/power-ring/manager name stack, shared with Club tab too): an
>   earlier-session comment had established that the *text stack* (name/league/tag/star-pips), not
>   the crest/ring, was the header's real height driver — true at the time, but after trimming that
>   stack further this round (name 23→20px, tighter margins throughout), the **balance flipped**: the
>   80px crest and 76px power-ring became the tallest elements. Re-measured to confirm before acting,
>   then shrunk both to 64px (still clearly the visual centerpiece, just no longer oversized relative
>   to the now-shorter text next to it).
> - `.hub-empire-line` (Net Worth + rank row, shared band element): value/rank font 19→16px, padding
>   trimmed.
> - `.hub-login-panel`, `.quick-tiles`, both Play-tab section ribbons: further padding/min-height
>   trims on top of Update 2/3's band work.
>
> **Net effect** (worst-case mafia message forced, animations killed, all 3 widths): **Play tab
> 397-401px → 158-180px** (a ~55-60% cut). Club tab, which shares the header/band with Play, also
> benefited from the header/empire-line trims even though this round's focus was Play: **79-119px →
> 50-97px**.
>
> **Verified no regression from a transient environment issue, not a real one**: a `--grep`-filtered
> Hub-focused run (39 tests) failed across the board with `ERR_CONNECTION_REFUSED` on the first
> attempt — Playwright's own auto-started dev server (port 8080, separate from this session's own
> measurement server on 8090) failed to bind in time, most likely from system load with several node
> processes running concurrently this session. Immediate retry: all 39 passed clean. Full suite run
> initiated after that to confirm before considering this a checkpoint.
>
> **Still remaining:** Play tab is not at zero — ~158-180px left, roughly evenly spread across
> `hub-next-rival` (140px), `action-tiles` (92px), `hub-login-panel` (81px), `hub-stadium-backdrop`
> (~201-210px, shared with Club), and the mafia-banner's width-dependent 1-line/2-line variance
> (80.4px vs 98.8px) which is real, expected content variance, not something to eliminate. Club tab
> similarly not yet at zero (50-97px). Next session should keep working section-by-section on
> whichever tab has the largest remaining single item, same method as this whole entry — check
> PROGRESS.md's live numbers before assuming anything above is still current, this redesign has had
> multiple false "done" claims corrected already and the discipline going forward is: re-measure with
> animations killed + worst-case mafia message forced before trusting any number, including old ones
> in this very file.
>
> **UPDATE 5 (2026-09-10, same session) — 🎉 Club tab reaches genuine 0px overflow at all 3 widths.**
>
> Continued the section-by-section micro-trim loop from Update 4 (desk-row/ledger/achieve-rail/
> drawer-row padding+font shaves, one property at a time, re-measuring after each). Two things worth
> recording beyond "kept trimming":
>
> - **Found and fixed a real specificity bug from the Update 3 drawer-row merge**: the intended
>   compact-tile padding (`.hub-drawer-row .hub-drawer__toggle{padding:8px 4px}`, 2 classes) was
>   silently never applying — `#hub-tab-club .hub-drawer__toggle{padding:6px 14px}` (1 ID + 1 class)
>   beat it on the padding property specifically, even though the *other* declarations in the same
>   rule (flex-direction, gap, text-align) still applied fine since the ID rule doesn't touch those
>   properties. CSS cascade conflicts resolve per-property, not per-rule — easy to miss. Found by
>   directly reading `getComputedStyle()` on a real toggle rather than assuming the rule I wrote was
>   the one winning. Fixed by adding the `#hub-tab-club` prefix so the compact-row rule's specificity
>   wins outright; corrected the actual applied value at the same time now that the true computed
>   baseline was known. This alone dropped Club tab another ~6px.
> - **320px's last ~36px was split into a real content cost and ordinary chrome slack**: the mafia-
>   banner's longest flavor message provably cannot fit on 1 line at 320px regardless of reasonable
>   font size (did the arithmetic: content width ≈264px, the 48-char message needs ~264-360px even
>   down to 12px font) — accepted that as genuine, expected variance, not something to eliminate. Added
>   a scoped `@media (max-width:340px)` top-up (reusing the file's existing narrow-breakpoint pattern
>   from `#top-bar`/`.hub-meters`) to shrink desk-row/ledger padding and the mafia-banner further
>   *only* at this width, absorbing the rest.
>
> **Result: `#hub-screen.scrollHeight === clientHeight` exactly at 320px, 375px, and 390px** — worst-
> case mafia message forced, animations killed, confirmed reproducible across 2 repeated runs.
> Screenshot-verified in both dark and light themes at 375px (`_scratch/measure/club-{dark,light}.png`)
> — clean render, no clipping, no overlap, drawer-row tiles read well as compact icon buttons, both
> themes visually distinct and correct (the first screenshot attempt used the wrong theme-toggle
> method and rendered identically in both — fixed by calling the real `applyTheme()`/`GS.darkTheme`
> path instead of hacking the `data-theme` attribute directly).
>
> **Club tab is genuinely done.** Full suite run in progress to confirm before committing; not yet
> committed as of this entry.
>
> **Play tab is NOT done — still ~158-180px, entirely untouched since Update 4.** That's the next
> and last piece of the whole 5-screen no-vertical-scroll redesign.
>
> **Corrected next steps (superseded twice now — this is the current version, from Update 3):**
> 1. Play tab needs its own dedicated trim/structural pass against its real ~341-356px overflow —
>    `action-tiles` (132px), `hub-next-rival-ribbon`+`hub-next-rival` (215px), `hub-login-panel`
>    (95px), `quick-tiles` (50px) are the untouched content sections; the band underneath it is
>    already fixed. Use the same worst-case-forcing measurement method (`Math.random=()=>0` for the
>    mafia-banner, animations killed, 320/375/390) — script is `_scratch/measure/club-overflow.js`
>    (pass `'play'` as the 2nd arg to `measure()`).
> 2. Club tab: ~79-119px left. Achievement rail/desk-row/ledger have all had 2 rounds of trims now —
>    check for diminishing returns before a 3rd CSS-only round; the drawer-row structural merge is
>    the template if another structural change turns out to be needed (unlikely to need one more,
>    given how much smaller the remaining gap is now).
> 3. Once both tabs hit genuine 0px (confirmed reproducibly, worst-case band content, all 3 widths):
>    screenshot both tabs in both themes, run full suite once more, then this whole 5-piece redesign
>    (League/Cards/Squad/XI-picker/Hub) is complete — that's the point for a final closing summary.
> 4. Drawer inline-expand → destination-overlay conversion (the separate ~1600-2221px drawer-OPEN
>    overflow case) still not started — unchanged scope from every earlier entry.
> 5. Scratch verification files live in `_scratch/measure/` (`before/`, `mid/`, `after/` throwaway
>    index.html copies, `measure-desk-row.js`, `club-overflow.js`), not committed, to be deleted once
>    Hub's redesign is fully done and committed.
> 6. This session ended with a green full-suite run (191-194/194, remaining failures confirmed
>    environmental-flaky in isolation) and real progress on both the band and Club tab — a legitimate
>    point to checkpoint-commit per this project's case law, even though neither tab is at true zero
>    yet. Check git status before assuming what's staged when resuming.

> ### 📐 NO-VERTICAL-SCROLL REDESIGN — XI-PICKER OVERLAY COMPLETE (2026-09-09, 4/5 pieces)
> The most architecturally different piece of this redesign. Founder had already confirmed no
> exception for this screen (paginate it too, full consistency) — but it genuinely couldn't use the
> same technique as Squad/Cards.
>
> **Why:** `getCurrentSSSelection()` reads selection state straight out of the live DOM
> (`document.querySelectorAll('.ss-player.selected')`) — this overlay has real interactive state
> (checkbox-style selection, captain assignment) that Squad/Cards' read-only browse lists don't. If
> only the current page's rows were rendered (Squad/Cards' approach), selecting a player on page 1
> then flipping to page 2 would silently lose that pick — the DOM node carrying its `.selected` class
> simply wouldn't exist anymore. **Fix: render every player's row always** (unchanged from before),
> wrap them into `.ss-page` groups, and toggle CSS `display` per page instead of re-rendering a slice.
> `display:none` elements are still matched by `querySelectorAll` — selection/captain state survives
> page flips for free. New `showSSPage()` helper does only the visibility toggle, never touches
> selection state; `renderSquadSelect()` still rebuilds full HTML on every mutation (toggle/captain
> pick) but re-applies the current page's visibility at the end so the view doesn't jump.
>
> 5 players/page, same `renderPager()` component. Unlike the other three screens, this one needed
> almost no manual chrome-trimming iteration — `.ss-player-list{flex:1;overflow-y:auto}` was already
> designed to fill available space, so pagination mostly "just fit." One small real gap found by
> direct measurement (not assumed away): even with only one page's 5 rows visible, the container's
> own padding alone was enough to keep `scrollHeight` slightly above `clientHeight` at 320px — a tiny
> but real residual scroll capability despite pagination being in place. Closed by trimming the
> container's own padding (12px→6px); confirmed `scrollHeight === clientHeight` (zero scroll
> capability, not just "looks fine in a screenshot") at all three widths afterward.
>
> **Verification went further than a visibility/geometry check** given the stakes — this is the
> single check that actually validates the different-architecture decision was right, not just that
> pagination "looks" like it works: confirmed all 15 test-fixture rows exist in the DOM simultaneously
> (not DOM-windowed), that toggling a player then flipping pages preserves the exact same selection
> set, that a NEW selection made on page 2 correctly adds to the running total rather than resetting
> it, that flipping back to page 1 shows the earlier deselect as still persisted rather than reverted,
> that captain assignment survives a page flip, and that Confirm XI still produces a valid squad size
> end-to-end through the paginated flow. All independently verified, not asserted from the
> implementation's own logic.
>
> **Found and properly fixed one real test breakage** — not a bug in the new pagination logic, but a
> genuine pre-existing (unchanged) blind spot the pagination exposed: this session's own earlier
> `CAPTAIN FIX 2` test used `.locator('.ss-cap-btn:not(.locked)').first()`, assuming DOM-first-order
> meant visible-on-the-first-page. The `order` map used by `renderSquadSelect()`'s role sort (a
> *different*, separate order than `updateSquadScreen()`'s own `roleOrder` array for the base Squad
> screen — traced and confirmed both exist independently, not a typo) happens to place this test
> fixture's eligible captain near the end of an 11-player sort, which lands them on page 2 — invisible
> by default, exactly where a real player would need to tap the pager to find them too. Rewrote the
> test to locate which page actually contains the eligible player and navigate there first, same as a
> real player would, rather than assuming first-in-DOM is always visible.
>
> **Full `npx playwright test`: 193/194 — only the same already-documented flaky probabilistic
> strategy test, unrelated to this change.**
>
> **Remaining in this redesign** (not yet built): Hub — the largest single piece (persistent status
> band, Play/Club tabs, 2 drawer-to-destination conversions, the confirmed ledger-duplicate cut).

> ### 📐 NO-VERTICAL-SCROLL REDESIGN — SQUAD SCREEN COMPLETE (2026-09-09, 3/5 pieces)
> Reused the `renderPager()` helper built for Cards, no new component work needed. Per the design
> spec: 5 players/page, and the 3 role-group ribbon headers (Batters/All-Rounders/Bowlers) removed
> entirely — under pagination a page could open mid-way through a group, which reads worse than no
> header; each row's own `.mini-role-chip` already shows the role (BAT/WK/AR/PACE/SPIN), so no role
> information is actually lost, only the section chunking. Sort order kept (still roughly clusters by
> role even without visible headers).
>
> Same empirical iterate-and-measure pattern as League/Cards: first pass hit 0 overflow at 390px
> (PRIMARY, 114px clearance) but real clipping at 375px (-63px) and 320px (-90px). Trimmed chrome in
> small, verified steps rather than one large guess — squad-header, team-stats-row tile padding,
> morale-bar, and row padding/margin, re-measuring after each change: 375px closed first (12px
> clearance), then 320px closed last with one more row-level trim (4px clearance — tight but real,
> confirmed via exact geometry not just the aggregate scroll-height number, same discipline as
> League). Unlike Cards, **5-per-page held at all three widths** — no need to drop to a smaller page
> size this time, just tighter chrome.
>
> Visually confirmed legible in both the mechanics (all 15 test-squad players reachable across pages
> via real clicks, no dupes/none missing) and appearance (screenshot at the tightest width — stats,
> names, roles, OVR badges all readable, no cramping) before considering this done.
>
> **Broke and properly fixed one existing test**, same honest-fix approach as Cards: `comprehensive.
> spec.js` "shows all squad members" asserted count===11 (unpaginated). Rewritten to assert the real
> new behavior — 5 rows on page 1, full 11-player squad reachable via 3 pager dots (`ceil(11/5)`).
> Grepped every other test file for squad-list-count assumptions first — none found, no other breaks.
>
> **Full `npx playwright test`: 192/194 — both failures the same two already-well-documented flaky
> tests from earlier this session** (probabilistic strategy test, RNG-dependent bowler-picker test),
> neither touching Squad/pagination code at all. Re-ran both in isolation to confirm no new pattern:
> bowler-picker passed clean, strategy test failed again — consistent with its established ~65-70%
> pass rate, not a regression.
>
> **Remaining in this redesign** (not yet built): Squad Selection XI-picker overlay pagination (same
> `renderPager()` helper, but more complex — must preserve live checkbox-selection/captain-assignment
> state across page flips, unlike the read-only Squad/Cards/League screens), and Hub (persistent band
> + Play/Club tabs + 2 drawer conversions + the confirmed ledger-duplicate cut) — the largest single
> piece left.

> ### 📐 NO-VERTICAL-SCROLL REDESIGN — CARDS SCREEN COMPLETE (2026-09-09, 2/6 pieces)
> Founder confirmed the last open architecture question before this piece: in-page pagination
> (Squad/Cards) uses a **tap-only pager (dots + prev/next arrows), no swipe** — this game already has
> a horizontal swipe-between-screens gesture, and a second swipe gesture for pagination risked the
> same finger motion being captured by the wrong listener. Built a shared `renderPager()` helper (new
> `.page-pager`/`.page-dot`/`.page-arrow` CSS, visual language borrowed from the existing `.tut-dot`
> component) meant to be reused across Cards/Squad/Squad-Select rather than styled once per screen.
>
> **Cards grid**: was rendering the full filtered squad into a 3-col grid with no pagination (measured
> pre-fix: only 2 of however-many rows visible before the nav). Added `cardsPage`/`CARDS_PER_PAGE`
> state, sliced the filtered `players` array to the current page before rendering, wired the shared
> pager, and reset to page 1 on filter change (per spec: avoids landing on an empty page if a new
> filter has fewer pages than the previous scroll position). Pager auto-hides (`.hidden`) when a
> filtered view already fits in one page — verified via the "Keepers" filter (1-2 players in the test
> fixture), confirmed the pager control disappears rather than showing a single useless dot.
>
> **Real, mid-flight discovery that changed the page-size plan:** the spec's original "6/page (2×3
> grid, matches what's already visible today)" didn't fully account for the NEW pager control's own
> footprint eating into the same budget. First implementation hit exactly 0 overflow at 390px
> (PRIMARY) but real clipping remained at 375px/320px even after real chrome trims (Collection-
> progress card padding, filter-row margin, and — this took a wrong turn worth recording — an attempt
> to shrink the "Packs & Shop" drawer's inline-expand body, which turned out to reclaim **zero** space
> in the baseline state: `.hub-drawer__body{display:none}` when collapsed already contributes 0px, so
> converting inline-expand to a destination-overlay wouldn't have helped this specific problem at all
> — caught this via direct measurement before implementing the conversion, not after). What actually
> helped: shrinking the drawer's own **entry-point row** (same principle as League's stats-button
> move, scoped CSS only, not touching the shared `.hub-drawer`/`.hub-drawer__toggle` base classes used
> by Hub's drawers). Closed ~45px this way but still had a real 62-89px gap at 320/375px — continuing
> to shave chrome pixel-by-pixel risked real card legibility (portraits/stats are already dense at the
> existing size). **Decision: dropped `CARDS_PER_PAGE` from 6 to 3 (one full grid row)** rather than
> keep chasing diminishing-returns trims — verified this closes the gap with real margin at all three
> widths (80-285px of spare clearance, not a borderline fit). Trade-off named explicitly: more pages
> to browse a full collection (15 cards → 5 pages instead of 3), accepted because reliable zero-scroll
> across every target width was the founder's stated priority over minimizing tap count, and the
> dot-pager makes jumping between pages fast regardless of page count.
>
> **Broke and properly fixed one existing test, not just tweaked its assertion:**
> `comprehensive.spec.js` "cards screen shows squad cards" asserted `.player-card` count === 11 (the
> full squad, un-paginated). This is a real, deliberate behavior change — only the current page
> renders into the DOM now — so the test was rewritten to assert what actually matters under the new
> design: 3 cards on page 1, and the full 11-card squad still reachable via 4 pager dots
> (`ceil(11/3)`), not just forced back to green with a weaker check.
>
> **Full `npx playwright test`: 194/194, clean** (the flaky bowler-picker test that failed on the
> first post-change run was independently unrelated — same pre-existing, already-documented mechanism
> from earlier this session, confirmed not caused by this change since re-running the whole suite
> came back fully clean).
>
> **Remaining in this redesign** (not yet built): Hub (persistent band + Play/Club tabs + the
> confirmed ledger-duplicate cut), Squad base-screen pagination, Squad Selection XI-picker overlay
> pagination (now confirmed in scope, no exception — reusing the same `renderPager()` helper built
> for Cards).

> ### 📐 NO-VERTICAL-SCROLL REDESIGN — LEAGUE SCREEN COMPLETE (2026-09-09, 1/6 screens)
> Founder directive: the whole game should not rely on vertical scrolling anywhere. Given the real
> scope (measured: every major screen overflows one mobile viewport, Hub by up to 2844px with drawers
> open), routed to a `ui-designer` proposal pass first rather than freehanding a redesign of this size
> — two rounds: (1) initial per-screen proposal with real overflow measurements, (2) a follow-up round
> after the founder locked two open questions (**strict interpretation — zero scroll on every element,
> not just page-level**; and keep all 4 Hub quick-tiles, just shrink them) to get a concrete,
> implementable spec for the list-shaped screens (Squad/Cards/League) the first pass had left as a
> flagged fallback. Independently verified the spec's load-bearing claims before implementing anything
> (confirmed the 10-team league hardcap in code, confirmed a real Hub-ledger/Power-Web data duplicate
> the spec flagged). One open judgment call — keep the XI-picker overlay scrollable as a deliberate
> exception, since it's a selection task not a browse list — was explicitly routed back to the founder
> rather than decided silently; **founder chose full consistency, no exceptions, paginate that too.**
>
> Implementing one screen at a time (WIP=1), verified + tested + committed before moving to the next.
> **League is done — the first fully shipped piece.**
>
> **What changed:** the design proposal recommended AGAINST pagination for a league table specifically
> — a table's whole value is seeing rank relative to the full field in one glance (promotion/
> relegation zones are a gestalt read across all rows), so paginating it removes the screen's reason
> to exist rather than just reformatting it. Instead: compress the row (single-line ellipsis team
> names — were wrapping to 2 lines unpredictably, inflating row height; tighter padding/margins/crest
> size) and move the "Season Stats & Leaderboard" button from a 48px full-width block in the vertical
> stack into a compact icon-button in the ribbon row (same id, same click handler, only markup/
> position/styling changed) — reclaiming its height entirely. Verified the 10-team count is genuinely
> hardcoded (`RIVALS` array, 9 rivals + you, not something that grows), so a fixed-row-budget approach
> is safe, not fragile.
>
> **Iterated empirically against real measurements, not just implemented-and-assumed-done** — same
> discipline as this session's earlier CSS fixes: first pass closed the gap at the PRIMARY device
> target (390px, per `docs/visual-design-system.md`'s own device-priority table) to exactly 0
> overflow, but 375px/320px still showed 83px/188px of measured "overflow." Investigated rather than
> assumed a bigger fix was needed — turned out the raw scrollHeight-vs-clientHeight comparison was
> misleading (it counts reserved bottom-nav-clearance padding as "overflow" even when no real row
> content is hidden). Measured the ACTUAL thing that matters — does the last row's bottom edge clear
> the bottom nav's top edge — and found 375px was already fully clean (36px of real clearance, not the
> 83px "overflow" number suggested) while 320px had a real 20px clip on row 10. One more small trim
> closed that too: **all three widths (320/375/390) now show zero real clipping**, confirmed via exact
> geometry checks, not just the aggregate scroll-height number. Also visually confirmed legible in
> both themes at the tightest width (320px) — crests, form dots, W-L, points all readable, no cramping.
>
> Note: 320px isn't in this game's own documented device-priority table at all (only 375px+ has a
> stated requirement) — closing it anyway was extra rigor, not a compromise on the required tiers.
>
> **Test impact:** none. `test.describe('League', ...)` asserts `.league-row` count (10, unaffected)
> and `textContent()` containing the team name (unaffected by the new CSS ellipsis — the underlying
> DOM text is unchanged, only its visual rendering truncates). No test references `#season-stats-btn`
> at all (grepped `tests/` first, confirmed zero hits, before moving it).
>
> **Full `npx playwright test`: 194/194, clean.**
>
> **Remaining in this redesign** (not yet built): Hub (persistent band + Play/Club tabs + drawer→
> destination conversion for 2 drawers + the confirmed ledger-duplicate cut), Squad Selection overlay
> pagination, Squad base-screen pagination, Cards pagination, Cards' Packs&amp;Shop drawer→destination
> conversion, plus a real architecture decision on the swipe-gesture conflict (existing screen-swipe-
> navigation vs. new in-page pagination swipe) that the design spec explicitly flagged as needing
> resolution before build, not something to silently pick.

> ### 🧹 4 REMAINING NO-DECISION-NEEDED BACKLOG ITEMS CLOSED (2026-09-09, same session)
> Continuing "pick and deploy what doesn't need approval, one by one" — closed the rest of the
> backlog that didn't require a founder call, all clear-cut fixes with a concrete direction already
> established (either by the audit's own suggested fix, or by an existing pattern elsewhere in the
> codebase):
>
> 1. **DRS silent-tap feedback** (MEDIUM, ui-designer audit). `.tactic-btn.drs.unavailable` used
>    `pointer-events:none`, which blocked the tap before any handler could run — zero feedback for a
>    player who reflexively reaches for DRS while bowling. Removed `pointer-events:none` from the CSS,
>    moved the reachability guard into `useDRS()` itself with a toast ("DRS is only available while
>    batting"), matching the captain-lock button's exact pattern elsewhere in this codebase. Updated
>    the `DRS FIX` regression test added earlier this session (its old assertion —
>    `pointerEvents.toBe('none')` — was now testing the WRONG behavior; caught and fixed before
>    trusting green).
> 2. **Dead `data-buy-id` attribute** (LOW). Confirmed zero references anywhere (grep, both
>    `prototype/index.html` and `tests/`) before removing — genuinely inert leftover markup, the real
>    functioning attribute is the differently-spelled `data-buyid` on the nested Buy button.
> 3. **Overlay tablet-frame inconsistency** (MEDIUM, ui-designer audit). 8 overlays
>    (squad-select/market/pack/mafia/scorecard/player-detail/match-result/tutorial) are `position:
>    fixed;inset:0` *siblings* of `#app`, not descendants — so `#app`'s own tablet-width transform
>    (which becomes the containing block for any FIXED descendant) never applied to them, leaving them
>    stretched edge-to-edge at 768px+ while every base screen stayed framed. Added a matching
>    `left:50%;right:auto;max-width:480px;transform:translateX(-50%)` rule targeting all 8 by ID.
>    Deliberately used ID selectors (not class) so specificity alone guarantees the override wins
>    regardless of source-order placement — avoiding the exact trap the hub-meter-label fix hit earlier
>    this session, where a class-specificity override silently lost by sitting before its base rule.
>    Verified no overlay animates its OWN `transform` for open/close (checked all 8 `.show` states —
>    only nested children like `.modal`/`.tut-card` animate transform), so this couldn't collide with
>    any existing animation. Confirmed via computed-style check (all 8 render at exactly 480px,
>    centered) and a real screenshot.
> 4. **Light-theme tablet shadow imperceptible** (LOW, ui-designer audit). The 0.5-alpha box-shadow
>    was genuinely applied in light theme (confirmed via computed style) but didn't read as a floating
>    card because the margin and card-edge tones are only ~8-16 RGB units apart in light theme. Raised
>    the light-theme-specific alpha to 0.8 (hue/blur unchanged) so the shadow itself gets dark enough
>    to register — dark theme's existing 0.5 stays as-is since its tones are already separated enough.
>    Confirmed via computed style + a real screenshot showing a clearly visible drop shadow now.
>
> **Verification:** all 4 syntax-checked, browser-verified (computed styles + real screenshots for the
> 2 visual fixes, the updated regression test re-run for the DRS follow-up). Full suite: 193/194 —
> only failure was the already-well-documented flaky probabilistic strategy test (7 total observations
> across this session now, ~70% pass rate, consistent with genuine RNG variance in a small-effect-size
> statistical comparison; zero plausible connection to CSS/attribute/toast changes). This closes every
> item from the "doesn't need founder approval" backlog — remaining open items (storefront decision,
> untracked `_scratch` files, the broader test-planning menu beyond what was built) all genuinely need
> founder input.

> ### 🧪 REGRESSION TESTS FOR TODAY'S 7 OTHER FIXES (2026-09-09, same session)
> Founder asked to pick and deploy items from the pending backlog that don't need approval, one by
> one — started with the highest-value item from the earlier test-planning menu: permanent regression
> coverage for the fixes shipped earlier today that only ever existed as now-deleted throwaway
> verification scripts. New file `tests/bugfix-2026-09-09.spec.js` (mirrors the established
> `bugfix-2026-08-03.spec.js` naming/structure convention), 9 tests:
>
> - **CAPTAIN FIX 1/2**: real-click rejection of a non-eligible captain pick + the old-captainId
>   null-out on squad-select open, and real-click acceptance of an eligible pick.
> - **CAPTAIN FIX 3**: a formula-level statistical test (same style as the existing "LOGIC FIX 1"
>   aggressive-strategy test) proving the leadership-stat bonus has a real, measurable effect on
>   batting output, not just correct UI gating. Needed a much larger sample (n=30,000 vs. the
>   existing test's n=3,000) since a ±4.5% leadership modifier is a far smaller effect size than
>   aggressive-vs-defensive strategy — stress-tested with `--repeat-each=8` before trusting it (8/8).
> - **TOGGLE FIX**: squad-select tap-to-toggle decrements correctly (6→5→4) instead of collapsing to 1.
> - **DRS FIX**: active+clickable while batting, greyed+inert while bowling via a real click, AND a
>   direct `useDRS()` call while bowling still rejected (the defense-in-depth guard).
> - **UI FIX 1-4**: bowler-picker auto-scrolls into view, hub meter labels aren't truncated at 320px,
>   FRM stat isn't clipped at pack-reveal card width, auction toast doesn't overlap the card.
>
> **Deliberately did NOT write a regression test for the Match Fix (Lose) loyalty-check fix** — traced
> why: `showMafiaOffer()` picks a random offer via `Math.floor(Math.random()*offers.length)`, and
> forcing a specific offer type (matchfixlose) deterministically would require either hardcoding its
> array index (fragile — a future edit to `allOffers`' order would silently break the test's premise
> without erroring) or a multi-call stateful `Math.random` mock sequencing 3+ separate rolls (offer
> select, evidence-generation, loyalty-check) with high risk of getting the sequencing subtly wrong
> and shipping something that LOOKS like it tests the right thing but doesn't. Per this session's own
> case law (a test that only sometimes passes is worse than no test), skipped rather than force it —
> flagged here as a deliberate gap, not an oversight.
>
> **Verification:** every test run individually first, then the whole new file together (9/9, no
> cross-test interference), then the full suite. Two background run attempts got killed by the
> environment mid-flight with `browserType.launch: Target page...closed` / `worker process exited
> unexpectedly` errors — recognized as infrastructure noise (external kill terminating Chromium
> mid-run), not real failures, and re-ran via the foreground-with-auto-continue pattern that worked
> reliably earlier this session. **Full `npx playwright test`: 194/194 (was 185), clean — zero
> failures, not even the usual flaky one.**

> ### 🧪 REAL-CLICK TEST COVERAGE ADDED — the 5 systems the player-advocate audit found untested
> ### (2026-09-09, same session)
> Founder asked what kinds of tests could still be planned; given the menu (regression tests for
> today's fixes / real-click coverage for the 5 confirmed-untested systems / structural real-click
> gap / cross-system tests / accessibility / visual regression), **chose real-click coverage for the
> 5 systems** flagged zero-coverage by the earlier player-advocate audit: mafia offer Accept, staff
> hiring, scout intel, heat actions, transfer market buy/sell/refresh.
>
> New section 22 in `tests/comprehensive.spec.js`, `describe('Real-Click Coverage')`, 8 tests — one
> extra for staff (coins-cost item AND black-money fixer separately, since the currency-type branch
> — `st.currency === 'black'` — is exactly the kind of logic a real click needs to exercise, not a
> state-injection test) and market gets 3 (buy/sell/refresh are functionally independent). Every test
> drives the ACTUAL click path (Hub → drawer-toggle → button, or Hub → banner → overlay → button) —
> none of them call the underlying JS function directly — matching this file's existing
> `injectState`/`dismissOverlays` conventions exactly rather than inventing a new pattern.
>
> **Traced each system's real code path before writing anything** (not guessed at selectors):
> `showMafiaOffer()`/`#accept-mafia-btn` (mafia), `STAFF_TYPES`/`updateStaffPanel()`'s `data-staff`
> click binding (staff — confirmed `physio` is a plain-coins item, `pr_manager` is a black-money
> fixer via `currency:'black'`), `SCOUT_OPTIONS`/`updateScoutPanel()`'s `data-scout` binding (scout),
> `getHeatActions()`/`executeHeatAction()`'s `data-heatact` binding inside the `#drawer-underworld`
> collapsible (heat actions), `buyPlayer()`/`sellPlayer()`/`#market-refresh-btn`'s click delegation
> (market). Picked test cases that are **deterministic, not RNG-luck-dependent**: the mafia test
> relies on `injectState`'s default `league:'gully'`, which restricts the random offer pool to just
> `injection`/`rivaldossier` — both already in the `noLoyaltyNeeded` skip-list (post today's earlier
> Match Fix Lose fix), so acceptance never depends on a loyalty-check dice roll; the heat-action test
> uses `trash_talk` specifically because it's the one action with `condition:true` (always available,
> no alignment/heat threshold to accidentally miss).
>
> **Verification, not just "wrote tests and moved on":** ran the 8 new tests alone first (8/8 pass,
> ~53s), then `--repeat-each=4` (32/32 pass across 5 total runs) specifically to rule out hidden
> flakiness from the market tests' random listing generation or the mafia test's random offer pick
> before trusting them as permanent regression coverage — a test that only *sometimes* passes is worse
> than no test (case law from this session's own flaky-test investigations).
>
> **Full `npx playwright test` re-run: 185/185, clean — not even the usual flaky failure this time.**
> Suite is now 185 tests, up from 177 at the start of this session.
>
> **Remaining test-planning items from the menu presented, not built this session:** regression tests
> for today's other 7 fixes (currently only verified via now-deleted throwaway scripts), the
> structural real-click gap in the rest of the suite, cross-system interaction tests, an accessibility
> pass, and visual regression/screenshot diffing. Founder's call which (if any) come next.

> ### 🎨 SENIOR UI/UX DESIGN AUDIT + 4 CONFIRMED FIXES (2026-09-09, same session)
> Founder asked for a "UI and UX related test suite by a 5 years experienced frontend and product
> design guy." Clarified this meant a design audit/critique (not literal new Playwright test files),
> routed to this workspace's `ui-designer` agent — the founder-designated canonical agent for exactly
> this (2026-07-31 standing instruction) — with the precedent bar set explicitly: match the rigor of
> the 2026-08-02 ui-designer audit on this same project (real screenshots, computed-style/contrast
> math, not eyeballing), and read `docs/visual-design-system.md` first so critique is grounded in this
> game's own stated design intent. ~23min background run, 117 tool calls, 51 screenshots left in
> `_scratch/audit-shots/` for direct review (deleted after use per protocol, see below).
>
> **Per this session's established protocol, independently re-verified every CRITICAL/HIGH finding
> myself (screenshot review + direct code read) before touching anything — did not fix on the agent's
> word alone:**
> - **[CRITICAL] Bowler-picker rendered off-screen with zero scroll cue, every over bowled** —
>   confirmed both visually (a screenshot of the "waiting for input" state looks identical to an idle
>   match screen — nothing visible suggests the game needs an action) and in code (`show()` at
>   `index.html:5874` just flips `display:''`, `showBowlerPicker()` never scrolls). Real. This halts
>   `simBall()`'s interval every single over a player bowls — core loop, not edge case.
> - **[HIGH] Hub stat labels ("Align"/"Heat"/"Fans") truncated to 1-2 unreadable characters at 320px**
>   — confirmed via screenshot ("AI +0", "HEA", "FI 50").
> - **[HIGH] Player card FORM stat clipped by the card's own `overflow:hidden` at narrow widths** —
>   confirmed on all 3 cards of a real pack-opening screenshot, each showing a bare "F" with the
>   number sheared off.
> - **[HIGH] Auction purse-pacing toast overlapping the player card** — confirmed real overlap, but
>   pushed back on the agent's severity framing after looking at the actual screenshot: the overlap
>   grazes the card's decorative portrait art, not the name/stats/bid info a player actually needs to
>   decide — still fixed, just noted the nuance rather than passing along the stronger claim unchecked.
> - Also independently caught **two things the agent got wrong** before they were acted on: it claimed
>   live in-match strategy switching was untested (false — a real test clicks `#tac-aggro` directly,
>   `comprehensive.spec.js:505-519`) and that mafia Accept/Decline both lacked real-click coverage
>   (half-true — Decline is tested, only Accept isn't). Not part of this UI pass, carried over as
>   context from the prior player-advocate audit same session; flagged here because the same
>   "independently verify, don't take agent claims on faith" discipline applies across both audits.
>
> **Founder approved fixing all 4 confirmed items.** Implementation:
>
> 1. **Bowler picker**: `$('bowler-picker').scrollIntoView({behavior:'smooth', block:'start'})` added
>    right after `show('bowler-picker')` in `showBowlerPicker()`. Considered converting the whole
>    element to a real fixed-position overlay (matching every other decision-point modal in this
>    codebase) instead — went with the smaller, lower-risk scroll fix given `.bowler-opt` inside this
>    exact container is where an earlier flaky-test investigation this session already found fragility;
>    minimized structural changes to it.
> 2. **Hub meter labels**: shrunk `.meter-icon` (20→16px), `.meter-value` (16→13px font),
>    `.meter-label` (9→8px font), tightened padding/gaps, inside a NEW `@media(max-width:340px)`
>    block. **Found a real, independent, pre-existing bug while implementing this**: there was already
>    an OLDER attempt at this exact fix at `index.html:343` (even sets `meter-icon{display:none}`) —
>    but it sat BEFORE the unconditional base `.hub-meter`/`.meter-icon` rules later in the file
>    (`~L2237-2243`). Media queries don't add CSS specificity; with equal specificity, later source
>    position wins regardless of which rule is conditional — so that older "fix" was silently dead on
>    arrival and had *never* actually applied at any viewport width. My own first attempt (placed near
>    the hub-header media query, `~L2201`) made the identical placement mistake and I caught it myself
>    via a failing verification check before committing — moved the working version to right after the
>    base rules it needs to override (`~L2247`+), documented the placement trap in a code comment so
>    it doesn't get reintroduced a third time. Left the dead `~L343` rule alone (out of scope, already
>    harmlessly inert regardless of what this fix does).
> 3. **Player card FORM clipping**: `.trait-bar .mini-bar` width 36px→24px, `.loyalty-greed` gap
>    10px→6px — frees enough room for FRM to fit within the card's `overflow:hidden` bound (real
>    overflow measured was ~12px; this frees ~24px, comfortable margin). Applies to every
>    `renderPlayerCard()` context (pack reveal, auction spotlight, etc.) via the single shared rule.
> 4. **Auction toast overlap**: shortened the purse-pacing toast copy. Measured empirically (not
>    guessed) that the combined 2-clause message still wrapped to 2 lines (58px tall) even shortened —
>    only a single short clause renders at 1 line (42px), which actually clears the card. Went with
>    "Budget lots first." (kept the core actionable half of the original "Budget lots first — the
>    stars close the show. Pace your purse.").
>
> **Verification:** wrote a throwaway Playwright script (deleted after use) covering all 4 fixes with
> real measurements, not assumptions — caught 3 of 4 failing on the first pass (my own bowler-picker
> pass-threshold was too strict — the fix actually worked, my check's arbitrary `<200px` bar was wrong;
> the hub-label fix needed the placement correction above; the toast needed the shorter single-clause
> copy) and iterated until all 4 genuinely passed: bowler-picker scrolls to top=44px (was fully
> off-screen), hub labels render fully legible at 320px with 0 truncation, FRM stat unclipped
> (`frmRight:125` vs `cardRight:140`), toast/card overlap `false`. Also visually confirmed all 3
> screenshot-based fixes by eye, not just computed-style math. Grepped `tests/*.spec.js` for the
> exact toast copy string first — no test pins the old text, only checks non-overlap with the
> back-button (a shorter toast only makes that safer).
>
> **Full `npx playwright test` re-run: 176/177, only failure was the same probabilistic
> "LOGIC FIX 1: aggressive strategy..." test flagged earlier this session.** This time it failed twice
> in a row (full run + first isolated retry) before a `--repeat-each=5` batch came back 4/5 passing —
> combined with the 1/1 pass from earlier today, that's 6 passes / 2 fails across 8 total runs (~75%),
> consistent with genuine RNG variance in a statistical wicket-count comparison, not a deterministic
> break (which would fail 100% of runs). None of today's UI/CSS changes touch match-sim RNG or
> strategy logic at all, so there's no plausible mechanism for a real regression here either. Not
> re-flagging as a new case-law entry since it's the same test/mechanism already logged earlier this
> session.

> ### 🔍 FRESH GROUND-UP AUDIT + DRS BATTING-ONLY FIX (2026-09-09, same session)
> Founder asked "any other bugs need to check?" after this session's squad-select fix. Rather than
> guess, first did a bounded, targeted check: grepped every `getAttribute('data-*')` id-extraction
> site in the file for the exact string-vs-number mismatch class that broke squad-select. **Confirmed
> that specific bug class is fully contained** — every other numeric-id site already `parseInt()`s at
> extraction, every string-keyed site (staff/scout/favor/screen names) doesn't need to. Reported this
> back with the honest caveat that it doesn't rule out OTHER bug classes. Founder asked for a full
> fresh ground-up audit, repeating the 2026-08-03 player-advocate methodology.
>
> Routed through the `player-advocate` persona (project agent not registered as an invokable type in
> this session, same workaround as `game-designer` earlier — ran via `general-purpose` with the full
> persona embedded verbatim) as a background agent, ~500s runtime, 66 tool calls. Explicitly briefed
> it on today's lead: the test suite's structural blind spot (177 tests, but every single one injects
> `GS` state directly rather than clicking through the real DOM) is exactly what let the squad-select
> bug hide in plain sight — told it to hunt for the same *class* of gap elsewhere, not just re-report
> today's fix.
>
> **Per this repo's own established audit protocol ("no agent-claim taken on faith"), independently
> re-verified every finding before acting on any of it — and this caught real inaccuracies in the
> agent's own report:**
> - Agent claimed "live in-match strategy switching has never been verified via a real tap" — **false**.
>   `tests/comprehensive.spec.js:505-519` starts an actual match and clicks `#tac-aggro` directly,
>   asserting both the `.active` class and `GS.strategy`. Fully covered; the agent's underlying
>   observation (the ambiguous `[data-strat="aggressive"]` selector matches 2 different DOM elements —
>   the prematch picker AND the live match button) was real and worth noting, but the conclusion drawn
>   from it was wrong.
> - Agent claimed "mafia offer Accept/Decline both have zero real-click coverage" — **half true**.
>   `tests/comprehensive.spec.js:843-855` clicks `#decline-mafia-btn` via a real Hub→banner→overlay
>   path and asserts the alignment delta. Decline is genuinely covered; only **Accept**
>   (`#accept-mafia-btn`) has zero hits anywhere in `tests/` (confirmed via grep myself).
> - Confirmed via my own grep (not just trusting the agent's read): staff hiring (`data-staff`), scout
>   intel (`data-scout`), heat actions (`data-heatact`), and transfer market buy/sell/refresh
>   (`data-buyid`/`data-sellid`/`market-refresh-btn`) all genuinely have **zero test coverage of any
>   kind** — not even state-injection tests, let alone real clicks. These are coverage gaps in code
>   that reads correctly on inspection, not confirmed bugs — logged, not fixed this session (a real
>   test-writing effort, not something to barrel into unscoped).
> - Confirmed the one dead-code LOW finding: `data-buy-id` (hyphenated) on the market-item container
>   (`index.html:11011`) is genuinely unused — the real, functioning attribute is the differently-named
>   `data-buyid` (no hyphen) on the nested Buy button. Harmless, not fixed (cosmetic/maintenance note).
>
> **One real, confirmed bug, independently verified by reading the code myself before proposing
> anything: DRS was tappable throughout the ENTIRE match (no gating on `match.batting`), but
> `useDRS()` always targets whichever side is currently batting and only ever DECREASES their wicket
> count.** While batting, that's correct (real-cricket "review your own out call"). While bowling, the
> exact same code path takes away the wicket you just took, with zero "review overturns not-out to
> given-out" branch for the fielding side ever existing. A player instinctively reaching for DRS during
> their own bowling innings — the real-cricket use case a cricket fan would expect — was silently
> sabotaging their own scorecard, with no way to ever benefit from it while bowling. Verified myself by
> reading `useDRS()` (`index.html:8498-8524`) and the button markup/wiring (`index.html:3609`,
> `11421-11424`) directly — confirmed real, not agent noise.
>
> **Founder chose the simpler of two fix directions: disable DRS while bowling** (vs. building a new
> bowling-side "review for a wicket" branch — bigger, more speculative, a real game-design addition
> rather than a fix). Implemented:
> - New `syncDrsAvailability()` (`index.html`, next to `useDRS()`): greys out + disables `#drs-btn`
>   (new `.tactic-btn.drs.unavailable` CSS — opacity 0.35, `pointer-events:none`, no
>   `text-decoration:line-through` so it reads as "not right now" rather than "already spent," visually
>   distinct from the existing `.used` state) whenever `match.batting !== 'you'`; adds a `title`
>   tooltip explaining why. Called from both `startMatch()` and `switchInnings()` (the only two places
>   `match.batting` can change during a live match — confirmed Super Over resolves synchronously via
>   direct `calcBallOutcome()` calls with no live DRS button interaction possible, so it needed no
>   third hook).
> - `useDRS()` itself now early-returns on `match.batting !== 'you'` too — defense-in-depth guard so
>   the block holds even if the button is ever reached directly, same pattern as the `BILLING_LIVE`
>   grant guard (CORE-MEMORY case law).
>
> **Verification:** zero existing tests touch DRS at all (grepped `tests/` for `drs|DRS`, confirmed
> before editing — no test-selector risk). Wrote a throwaway Playwright script (deleted after use):
> forced a live match into batting and bowling states, confirmed the button is active+clickable while
> batting (real click flips `match.drsUsed`), greyed-out+inert while bowling (real click has zero
> effect, blocked by CSS `pointer-events:none`), AND confirmed the defense-in-depth guard by calling
> `useDRS()` directly while bowling (bypassing the DOM entirely) — rejected, `drsUsed` stays false,
> `oppWkts` unchanged. 5/5 checks passed.
>
> **Full `npx playwright test` re-run: 175/177 first pass, 2 failures — both independently confirmed
> pre-existing/flaky, NOT regressions from this fix.** (1) The already-documented "smoke bowler-picker"
> flaky test (CORE-MEMORY case law since 2026-07-11) — this time actually narrowed down its root
> cause while investigating: `tests/smoke.spec.js:400`'s `.bowler-opt.first()` doesn't filter out
> `.disabled` bowler options, and depending on random squad/overs-cap state that first-rendered option
> can legitimately be over the 2026-08-03 overs-cap and thus disabled, blocking the click. Confirmed
> genuinely intermittent, not deterministic: ran it 4 more times total (1 solo + 3 via `--repeat-each`)
> and got 3 passes / 2 fails — a real regression from my change would fail 100% of runs, not ~40-50%.
> (2) `bugfix-2026-08-03.spec.js` "LOGIC FIX 1: aggressive strategy..." — a probabilistic/statistical
> test (simulates many balls, checks a risk/reward distribution), unrelated to anything touched this
> session (strategy/aggression formula code untouched); re-ran in isolation and passed clean, 1/1.
> Neither failure touches DRS, `match.batting`, `startMatch()`, or `switchInnings()`'s other logic.

> ### ✂️ RTM + PLANTED AGENT FORMALLY CUT FROM GDD (2026-09-09, same session) — the last of the
> ### "flagged, not fixed" items from the 2026-08-03 audits
> Founder asked to "check the other flagged items" — the 2 gaps from the FULL-GAME BUG AUDIT entry
> below (RTM dead stub, Planted Agent unbuilt), explicitly called out at the time as "founder/
> game-designer call, not something to unilaterally build or delete." Investigated both properly
> before proposing anything — this turned out bigger than "wire up a stub":
>
> - **RTM (Right to Match):** GDD premise is a season-boundary squad wipe where RTM lets you retain 2
>   favorites. Read the actual `endSeason()` function (~L10675) line by line: it resets league
>   position, matchNum, wins/losses, season pass, morale, purse, sponsor, and decays fan
>   loyalty/rival relationships — **`GS.squad` is never touched.** There's no season-boundary
>   re-auction for RTM to apply to; the squad just persists continuously. Building RTM as specced
>   means retrofitting a full squad-wipe-and-reauction cycle into a shipped, tested, continuous-squad
>   game loop — a much bigger structural change than the feature itself.
> - **Planted Agent:** GDD premise is a mole that "leaks rival's strategy to you for 3 matches."
>   Checked `GS.rivalData` and the match-sim code: rival opponents have no persisted strategy value
>   anywhere — only a fixed archetype personality (Purist/Pragmatist/Shark/Coward/Politician) that
>   drives auction bidding behavior, nothing per-match to leak. The favor's entire stated payoff has
>   no data behind it in the shipped architecture.
>
> Presented both findings to the founder with three options (cut from GDD / route to game-designer
> for a scoped-down redesign that fits the existing architecture / leave flagged for later). **Founder
> chose: cut both from GDD.**
>
> **Code changes:** removed the dead `.rtm-banner`/`.rtm-banner.show` CSS and the empty
> `<div id="rtm-banner">` markup from `prototype/index.html` (was never wired to any JS — confirmed
> via grep before removing). Also dropped `rtm-banner` from a stale "wired hooks" comment in the same
> file that had been listing it as if it were live.
>
> **GDD changes** (`docs/core-systems-gdd.md`): §5.2 RTM paragraph replaced with a cut note explaining
> why (with a revival path: only makes sense bundled with a from-scratch season-squad-reset redesign).
> §5.4's corruption-layer table: Planted Agent row struck through with the same reasoning + a revival
> note (needs a real rival-AI strategy system built first — bigger than the favor itself). §5.5 and
> §9.2's Clean-vs-Corrupt comparison tables: removed "planted agents" mentions, §9.2's row backfilled
> with the real built mechanic in that slot (rival outgoing bribes / throw-the-match, shipped as part
> of Underworld Core increment 3). §8.5's IPL Challenger tier-unlock description: dropped "Planted
> agents available." §10's monetization table: removed the "Extra RTM Slot" IAP row (100 gems) — was
> never sellable since RTM never existed to need a slot.
>
> **Bonus find while in the same table (not a new decision, just doc catch-up on an already-shipped
> fact):** §5.4 also still listed **Auction Leak** as a live corrupt action — but that was already cut
> from the actual code back on 2026-08-03 (the "5 confirmed defects fixed" bug-audit entry below,
> fix #2: "cost real B$/heat/alignment/debt for zero effect... removed both offer types"). The GDD
> table was simply never updated after that cut. Fixed it alongside since it's the exact table already
> being edited and the fact was already decided/shipped, not a new call.
>
> **Also caught and fixed a real factual error in §8.4's "What Resets vs Carries Forward" table,
> independent of the RTM decision:** it claimed "Player cards in squad: No — new auction each season"
> — but per the `endSeason()` read above, that's simply false against the shipped code (squad always
> persists). Corrected to "Yes — persists continuously" with a note explaining the correction. The
> §8.4 "Card upgrades... via RTM" row was also reworded since upgrades now persist via the squad's own
> natural persistence, not an RTM mechanic that no longer exists.
>
> **Verification:** grepped `tests/*.spec.js` for `rtm|RTM` — zero matches, no test-selector risk from
> the markup removal. Node syntax parse of both inline `<script>` blocks (0 errors) and confirmed
> `rtm-banner` string appears 0 times anywhere in `prototype/index.html` after the edit. **Full
> `npx playwright test` re-run: 177/177, clean, 10.1m, zero failures.**
>
> This closes out the last "flagged, not fixed" item from the 2026-08-03 audits — both game-logic
> gaps (captain bonus, Match Fix Lose loyalty check) and this GDD-cut are now resolved this session,
> plus the two bugs this session's own UI testing surfaced along the way (squad-select tap-to-toggle,
> light-theme lock visibility).

> ### 🎨 LIGHT-THEME LOCK VISIBILITY FIX — same session, closes out the polish note flagged above
> Founder asked to fix the "locked cap-btn is subtle in light theme" note flagged during the UI test
> pass above. Root cause: `.ss-cap-btn.locked` only applied `opacity:0.35` on top of the base
> `.ss-cap-btn` style, which is itself already very faint (`background:rgba(240,200,80,0.04)`,
> `border:rgba(240,200,80,0.2)`) — dimming an already-faint gold tint doesn't read as "different,"
> just "slightly fainter gold." Checked this codebase's own existing locked/disabled conventions
> before inventing a new one: `.btn.disabled` (~L537) and `.pass-cell.locked` (~L2507) both already
> pair `opacity` with `filter:grayscale(...)` — that combo genuinely desaturates the element into a
> neutral gray, which contrasts against the surrounding warm gold UI regardless of underlying theme
> luminance, unlike a pure opacity dim. Matched that established pattern instead of a one-off value:
> `.ss-cap-btn.locked` is now `opacity:0.4;filter:grayscale(0.65)` (was `opacity:0.35` alone).
>
> **Verified, not just assumed:** computed-style check confirmed the filter actually applies
> (`grayscale(0.65)` on locked, `none` on unlocked) in both themes. Full-page screenshots weren't
> enough to judge a 28px element, so cropped/zoomed close-ups of just the cap-btn column were taken
> in both themes — visually confirmed a real, legible difference now (solid-ring "C" for eligible vs.
> washed-out ghost "C" for locked), sent to founder for their own look. Pure CSS change, one selector
> — grepped `tests/*.spec.js` for `ss-cap-btn|\.locked`: zero matches, no test-selector risk, so did
> not re-run the full 177-test suite (already green twice this session; nothing here touches JS
> behavior). Throwaway verification scripts/screenshots deleted after use per protocol.

> ### 🐛 UI-TESTING FOUND A REAL PRE-EXISTING BUG — squad-select tap-to-toggle was fundamentally
> ### broken (2026-09-09, same session as the captain/loyalty fixes above)
> Founder asked for "ui specific tests" on the captain-lock UI. Wrote a throwaway Playwright script
> (deleted after use) that actually clicked the real UI (not state-injection) to verify the new
> captain-eligibility gating — and it surfaced a severe, **pre-existing, untouched-by-this-session**
> bug: **tapping a player row (or the captain button) in Squad Select only ever worked for the first
> tap.** Every subsequent tap collapsed the whole selection down to just the just-tapped row instead
> of toggling normally. Empirically verified: 6 auto-selected rows → tap row 1 → selection drops to 1
> (not 5, as a real deselect would give) → tap row 2 → still 1 (now row 2 only; row 1 silently lost).
>
> **Root cause:** `getCurrentSSSelection()` (`prototype/index.html`, was ~L9039) read selection out of
> the DOM via `.getAttribute('data-sid')`, which always returns a **string**. Every consumer
> (`toggleSquadPlayer`, `setCaptain`, `confirmSquadSelect`) compares/pushes that against the
> **numeric** player ids used everywhere else (`GS.squad`/`ALL_PLAYERS`, and the `parseInt(...)`'d id
> at the click-binding). `["2"].indexOf(2)` is `-1` in JS — so `indexOf` never matched, every tap was
> treated as a fresh "add" (never a toggle), and the previously-selected ids silently dropped out of
> the next render once they round-tripped through the DOM as strings.
>
> **Confirmed pre-existing, not introduced this session:** `getCurrentSSSelection`/`toggleSquadPlayer`
> are code I never touched for the captain/loyalty fix (only `setCaptain`, `capValid`, `autoSelectXI`,
> `confirmSquadSelect`'s auto-pick, and `renderSquadSelect`'s markup were edited). Grepped
> `tests/*.spec.js` for `ss-cap-btn|setCaptain|captainId` — **zero existing tests click the real UI
> path**; all 5 spec files inject `captainId`/`selectedXI` directly into state, bypassing this bug
> entirely, which is exactly why 177/177 tests were green earlier today despite this being broken.
> **Practical impact if this had shipped as-is:** manually customizing your Playing XI or picking a
> captain by tapping — a marketed, tutorial-taught feature (`docs/core-systems-gdd.md` "Captain
> Choice", the in-game tutorial copy at ~L11221) — likely never worked past the first tap, in the live
> game, for as long as this code has existed. Casual play probably never surfaced it because the
> default auto-picked XI is usable without ever touching a row.
>
> **Founder was asked before fixing** (this was a real scope decision, not part of the requested
> captain/loyalty task) — approved fixing it immediately since it's a one-line root cause in the exact
> screen already under test. **Fix:** `getCurrentSSSelection()` now does
> `parseInt(items[i].getAttribute('data-sid'), 10)` instead of pushing the raw string. This single
> change fixes all three downstream consumers at once (no changes needed to `toggleSquadPlayer`,
> `setCaptain`, or `confirmSquadSelect` themselves — they were already written assuming numeric ids).
>
> **Verification:** Node syntax parse of both inline `<script>` blocks (0 errors). Wrote a second
> throwaway script isolating just the toggle behavior: confirmed 6→5→4 (correct decrement) post-fix,
> vs. 6→1→1 (broken) pre-fix — same script, same assertions, only the fix applied/reverted between
> runs. Re-ran the captain-lock verification script end-to-end (8/8 checks): locked-button rejection,
> eligible-button acceptance via a REAL DOM click (not synthetic state), the `.ss-player.captain`
> class + gold styling applying correctly, and the old-save fallback nulling a stale non-eligible
> `captainId` on squad-select open. Two of my own test-script bugs surfaced and were fixed along the
> way (documented for whoever writes the next squad-select test): (1) `Locator.click()` inside this
> overlay hits an overlapping decorative element instead of the target — this exact gotcha is already
> documented in this file's 2026-08-03 entry; use `elementHandle.evaluate(el => el.click())` instead;
> (2) `showSquadSelect()` hard-requires `GS.squad.length >= 3` and silently no-ops below that — a
> test squad of 1 silently skipped the very capValid logic it was meant to exercise. Screenshotted the
> real rendered UI in both themes (sent to founder, not committed — screenshots live in the deleted
> throwaway `_scratch/` output, consistent with this repo's "screenshots left out of the repo by
> design" convention): dark theme clearly shows the gold captain glow + badge on an eligible pick and
> a readable red rejection toast ("Needs the Captaincy trait — this player can't lead the side") on a
> locked attempt; light theme confirmed the feature renders but the locked-vs-unlocked visual
> distinction (opacity 0.35 dim) is fairly subtle before a captain is actually picked — flagged as a
> minor polish note, not fixed (out of scope, founder's call whether it's worth a follow-up pass).
>
> **Full regression suite re-run after this second fix** (needed since this touches a shared helper
> function, not just the two originally-scoped design gaps): **177/177 green, 10.2m, clean run** —
> this time not even the usual flaky bowler-picker smoke test failed. Zero regressions from the
> `getCurrentSSSelection()` fix.

> ### 🎖️ DESIGN-CONSISTENCY FIXES — captain trait gating + Match Fix (Lose) loyalty gap (2026-09-09, needs testing)
> Resumed after a ~5-week gap. Verified the memory's "NEXT" pointer (tutorial-overlay fix, LOOK pass,
> D1/D7 cohorts) was stale — both the tutorial fix and the full LOOK/wider-scope pass already shipped
> back in July/early August; the only genuinely open items were the storefront/billing decision (still
> deferred, founder call) and the two "flagged, not fixed" design-consistency gaps from the 2026-08-03
> game-logic audit below. Founder chose to resolve those two. Routed through a `game-designer`-persona
> consult (the project's own `.claude/agents/game-designer.md` isn't registered as an invokable agent
> type in this session — ran it via `general-purpose` with the persona instructions embedded verbatim)
> for a verdict, independently verified the agent's file/line claims against the actual code and GDD
> before implementing, then implemented directly.
>
> **1. Captain bonus was a flat +8% for ANY squad member — GDD specifies a rare Captaincy trait +
> variable Leadership stat.** GDD (`docs/core-systems-gdd.md` lines 644-645/725/836-837): only players
> with a boolean `Captaincy` trait (~15% of cards) can captain, bonus = `leadership/20`% (max 5%). Code
> had neither field on any of the 50 `ALL_PLAYERS` entries and let `setCaptain()` accept anyone for a
> flat `1.08` multiplier. Fixed:
> - Added `captaincy:true, leadership:<N>` to **7 of 50 players (14%)** via a re-derivable rule (loyalty
>   ≥78 AND greed ≤22, `leadership` set equal to `loyalty`): id 6 Dinesh Kulkarni (uncommon, 85), id 15
>   Suresh Venkatesh (legendary, 90), id 19 Manish Patel (common, 88), id 22 Rohan Gavaskar (rare, 80),
>   id 28 Rinku Mehra (uncommon, 82), id 31 Dhruv Juneja (common, 78), id 44 Akash Parmar (rare, 80).
>   Deliberately checked this spans common→legendary (2 commons included) specifically so a F2P player's
>   starter pulls aren't locked out of captaincy — Hard Constraint #5 ("free players can reach every
>   tier") would be violated by a rarity-gated trait.
> - Match calc (`capBatMod`/`capBwlMod`, ~L8362): flat `1.08` → `1 + leadership/2000` (3.9%–4.5% for the
>   7 above, matches GDD's `leadership/20`% formula and 0-5% cap). Guarded with `&& batter.captaincy`/
>   `&& bowler.captaincy` so an old save (`cu_save_v3`) with a pre-patch `GS.captainId` pointing at a
>   non-eligible player falls back to `1.0` instead of applying a bonus or crashing.
> - Gating added at every path that can set `GS.captainId`: `setCaptain()` now rejects non-eligible picks
>   with a toast; the squad-select `capValid` check (~L8944) now also requires `.captaincy`; `autoSelectXI()`
>   and `confirmSquadSelect()`'s auto-pick fallback now filter to `captaincy===true` and leave the squad
>   **captainless** (not force a non-eligible pick) when the selected XI has zero eligible players — the
>   match-calc guard means a captainless XI just plays at the pre-existing 1.0 baseline, never blocks
>   starting a match.
> - UI: `.ss-cap-btn` on non-eligible squad-select rows gets a new `.locked` class (opacity 0.35,
>   `cursor:not-allowed`, `title="Needs the Captaincy trait"`) rather than being hidden — kept
>   discoverable per the "advise, don't obscure" pattern already used elsewhere (debtHeld/injured/banned
>   tags), backed by the real JS-level rejection in `setCaptain()` (defense-in-depth, same pattern as the
>   `BILLING_LIVE` guard).
>
> **2. "Match Fix (Lose)" skipped the loyalty check every other corruption favor uses.** Confirmed this
> was the code diverging from the GDD, not an ambiguous call: the GDD's own Fixed-Moments table
> (`core-systems-gdd.md` lines 735-739, 748) already lists **Match Fix (Lose) with its own 5% failure
> chance** and a general "Player refuses (loyalty check)" row covering fix types broadly — the GDD never
> intended this favor to be risk-free. `noLoyaltyNeeded` (~L10905, the array of favor types that skip
> `loyaltyCheck()`) had `matchfixlose` grouped in with `injection`/`rivaldossier`/`evidencedestroy` even
> though, unlike those three (no squad complicity needed), throwing the match for pay asks the same
> squad buy-in `matchfix`/`umpire`/`playertap` do — and those three DO roll the check. Fixed: removed
> `'matchfixlose'` from the skip-list; moved its payout/cooldown effect (`GS.blackMoney += earn`,
> `GS.mafiaFixLoseCooldown = 5`) inside the existing `else if (skipLoyalty || lc.success)` branch so it
> only fires on a successful loyalty roll, same as `matchfix`/`umpire`/`playertap`. Refusal now falls
> into the existing generic "Players refused the fix!" toast + 10%-report/+25-heat path — no new UI/
> copy needed, it was already type-agnostic. Existing guardrails (5-match cooldown, 65% evidence
> chance — highest of any favor, 18 heat, -8 alignment) are unchanged and still apply regardless of
> success/failure.
>
> **Verification:** independently re-derived the 7-player captaincy selection by hand from the raw
> `loyalty`/`greed` values in `ALL_PLAYERS` (not taken on the consulting agent's word) — confirmed
> exactly 7 matches, no more/fewer. Ran a Node syntax parse of both inline `<script>` blocks (0 errors)
> after all edits.
>
> **✅ FOUNDER-REQUESTED TEST PASS (2026-09-09): 177/177 green, 0 regressions.** Full suite run
> (`npx playwright test`, 5 workers, 10.4m) came back 176/177 on the first pass — 1 failure,
> `smoke.spec.js:374 "field placement setting appears in bowler picker"` (a `.bowler-opt` click
> timeout, `#bowler-options` intercepting the pointer event). This is unrelated code (bowler picker,
> not captain/loyalty) and matches a pre-existing flaky test already documented in CORE-MEMORY §3 case
> law since 2026-07-11 ("smoke bowler-picker... pass on isolated re-run — a full-run failure isn't a
> regression until it fails in isolation"). Re-ran it in isolation (`--grep`, 1 worker): **passed clean,
> 1/1, 15.7s**. Confirmed not a regression from this session's changes before reporting green. Manual
> device/UI spot-checks (captain-picker lock rendering in both themes, old-save `cu_save_v3` fallback)
> still outstanding — founder's call whether those are needed before considering this fully closed.
>
> **Still open, not touched this session (founder calls, deferred on purpose):** storefront/billing
> decision (Play Store TWA+Billing vs PWA+Razorpay, `BILLING_LIVE=false` still gates all real-money
> grants); real D1/D7 cohort read (analytics pipeline is built and wired, just has no real user traffic
> yet — needs distribution, not more dev work). Also noticed but not touched: 4 untracked files in
> `prototype/_scratch/` (`_premium-review.html`, `hub-premium-dark.png`, `hub-premium-light.png`,
> `hub-premium.html`) sitting in the working tree since before this session — flagged to founder,
> left alone since scope was the two design gaps only.

> ### ⚖️ GAME-LOGIC / BALANCE AUDIT (2026-08-03, second pass) — 5 formula-level bugs fixed, browser-verified
> Founder asked for a "logic-wise" audit of the entire game, distinct from the UI/flow audit
> earlier the same day. Ran a combined Balance-Tester + Cricket-Consultant style audit against the
> actual math (not flow/UI), independently re-verified every finding by reading the code myself,
> fixed the confirmed CRITICAL ones, then browser-tested all 5 (`tests/bugfix-2026-08-03.spec.js`,
> "LOGIC FIX" tests) plus the full existing suite — **177 tests total, all green, 0 regressions.**
>
> 1. **Aggressive batting/bowling strategy was strictly dominant — no downside, ever.**
>    `calcBallOutcome()`'s strategy modifiers fed straight into the same skill `ratio` that also
>    drives wicket probability (`wktP = 0.06/ratio`), so raising your own side's ratio via
>    aggression simultaneously bought MORE boundaries AND FEWER wickets conceded, with zero risk
>    — Balanced/Defensive were never a correct choice. GDD 6.2 specifies a real trade-off
>    ("+10% wickets, +15% runs conceded" for aggressive, opposite for defensive). Fixed by
>    decoupling strategy from the skill ratio entirely and re-applying it as an explicit,
>    independent multiplier on `wktP`/`sixP`/`fourP` after the ratio-based base is computed, in
>    the GDD-correct direction for both axes.
> 2. **Auction floor price and Transfer Market sell price were two unrelated formulas — a
>    guaranteed buy-low/sell-high coin exploit.** `showNextCard()` priced auctions off a flat
>    `{common:80,...,legendary:400}` table while `sellPlayer()` pays `0.6 × getPlayerPrice()`
>    (a stat-based formula). An epic/legendary card won near its auction floor could be instantly
>    resold for ~2-2.6x its cost, repeatable every auction with no cooldown. Fixed: auction floor
>    is now `0.6 × getPlayerPrice()` — the same fraction the market pays out — so winning
>    completely uncontested breaks even on an immediate flip, and any real bidding competition
>    makes flipping a loss.
> 3. **`processAlignDecay()` was missing one of the GDD's three documented decay-block
>    conditions.** GDD 1.4 [v2 FIX] blocks passive alignment decay when the player has active
>    debts, heat > 30, **or is under investigation** — "to prevent the exploit of cycling between
>    corrupt bursts and passive decay to stay safely in the Grey Zone." The code only checked the
>    first two. Fixed: added the missing `|| GS.investigation` guard.
> 4. **Heat ≥ 90 was safer than heat 86-89 — an inverted risk curve.** `endMatch()` had a
>    deterministic "heat ≥ 90" branch that fined the player and dropped heat by 40 **before**
>    `checkInvestigation()` ran — so by the time the real investigation check saw the heat value,
>    it had already fallen back below the guaranteed-investigation threshold (GDD 3.4: 86-100 =
>    guaranteed Formal Investigation). A savvy corrupt player would learn to push heat *past* 90
>    rather than stay under it. Fixed: removed the ad-hoc fine/reduction; all heat ≥ 86
>    consequences now flow through the real `checkInvestigation()`/`resolveTribunal()` pipeline
>    only, with the lower-band flavor text capped below 86 so it can't stack with the real
>    investigation message.
> 5. **No per-bowler overs cap existed anywhere — a squad with just 2 capable bowlers could
>    legally alternate them for an entire 20-over innings**, one bowling up to 10 overs — breaking
>    both game balance (bypasses the squad's bowling-depth constraint entirely) and basic T20
>    authenticity (real cricket caps a bowler at 4 overs in a 20-over innings). Fixed: added
>    `getBowlersAtOversCap()`, reusing the ball-by-ball tally `simBall()` already keeps in
>    `match.scorecard[side].bowlers[].balls` (no new state needed) — a bowler at 24+ balls is
>    excluded from both the auto-pick (`pickBowler()`) and the manual picker
>    (`showBowlerPicker()`), UNLESS excluding them would leave zero legal bowlers (thin-squad
>    edge case still completes the innings).
>
> **Flagged, not fixed** (design-consistency questions for game-designer/cricket-consultant, not
> clear-cut bugs): captain bonus is a flat +8% for any squad member with zero eligibility gating,
> vs. GDD's stated Captaincy-trait + Leadership-stat model (0-5% max) — a minor squad-building
> constraint loss, not an exploit. "Match Fix (Lose)" skips the player loyalty check that every
> other corruption favor rolls — bounded by the existing cooldown/evidence chance so not a
> runaway exploit, just an inconsistent trust model worth a founder call.

> ### ✅ BROWSER TEST PASS ON THE 2026-08-03 BUG-AUDIT FIXES (founder-requested)
> Founder explicitly asked to test the 5 fixes below in browser (testing is normally founder-gated).
> Added `tests/bugfix-2026-08-03.spec.js` — one Playwright test per fix, using the same
> `injectState`/`dismissOverlays` pattern as `comprehensive.spec.js` — and ran it plus the full
> existing suite (`smoke.spec.js`, `comprehensive.spec.js`, `features-10k.spec.js`,
> `p15-visual.spec.js`) against a live local server. **All 172 tests pass, 0 regressions, 0 console
> errors.**
>
> Testing surfaced one more real bug in the same area, found and fixed before it could ship:
> **`autoSelectXI()` (the "Auto" button) and `showSquadSelect()`'s first-open pre-select fallback
> only excluded `banned` players** — not `injured`, and not the new `debtHeld` flag either. So even
> with the Stage-2 hold fix in place, tapping "Auto" (or opening squad-select for the very first
> time) could still silently draft an injured or mafia-held player into the starting XI. Both
> filters now exclude `injured` and `debtHeld` too (`prototype/index.html`, `showSquadSelect()` and
> `autoSelectXI()`).
>
> One test-writing note for future agents: a real `Locator.click()` on `.ss-player` rows hangs on
> Playwright's strict actionability check inside the squad-select overlay (an overlapping
> decorative element intercepts the computed click point) — use
> `page.evaluate(() => el.click())` to dispatch a real DOM click instead, which still exercises the
> exact same delegated listener a genuine tap would.

> ### 🐛 FULL-GAME BUG AUDIT (2026-08-03) — 5 confirmed defects fixed, 2 gaps flagged (not fixed)
> Founder asked for a ground-up "find the bugs and potential issues and resolve" pass. Ran a full
> player-advocate-style audit (gap detection + flow integrity + test-suite observation across the
> auction→squad→match→economy→save/load core loop), then independently re-verified every
> CRITICAL/HIGH finding by reading the actual code myself before touching anything (grep + Read,
> no agent-claim taken on faith). 5 real, reproducible defects fixed:
>
> 1. **Debt Stage-2 "held player" was purely cosmetic.** `processDebts()` set a display-only
>    `heldPlayer` name string on the debt object; nothing ever blocked that player from being
>    selected/fielded, so the entire mid-tier debt-escalation penalty (one of only two hard
>    checkpoints in the ladder) had zero mechanical effect. Fixed: real `p.debtHeld` flag on the
>    player object, checked in `toggleSquadPlayer()`, `renderSquadSelect()`,
>    `showSquadSelect()`'s selection filter, and `renderPlayerMini()` (new "HELD BY MAFIA" tag on
>    the Squad/Cards screens). Cleared in `payDebt()`, including the multi-debt-same-player edge
>    case (only clears if no other open debt still holds that player).
> 2. **'Auction Leak' / 'Scout Intel' mafia favors cost real B$/heat/alignment/debt for zero
>    effect** — worse, they occupied the single `GS.mafiaBonus` slot, blocking every other real
>    favor/bribe until the next match cleared it. Neither "reveal rival budget" nor "reveal hidden
>    player stats" was implemented anywhere in the auction code. Removed both offer types
>    (`showMafiaOffer()` + `addEvidence()` maps) rather than fake-implement them — re-add only
>    alongside a real build. Gully-tier offer filter rebalanced to `injection` + `rivaldossier`
>    (both real, already-working, similarly low-cost) so early-game players keep two working
>    options instead of losing 2 of their 3.
> 3. **`resolveCard()` never saved mid-auction** — only `endAuction()` did. Closing the app
>    mid-auction (very plausible on mobile) silently lost every card bought that session. Fixed:
>    `save()` after each won card.
> 4. **`endMatch()` held the entire match outcome in memory** (coins, alignment, heat, debts,
>    tribunal verdict, bans, injuries — the single highest-value checkpoint in the game) until the
>    player tapped Continue/Play Again. Closing from the result screen first discarded it all.
>    Fixed: `save()` right after the reward/consequence computation block, before the result HTML
>    is even built.
> 5. **`showImpactPicker()` Cancel path never removed its click listener.** Every open→Cancel→
>    reopen cycle stacked another listener on `#scorecard-content`; a later real substitution fired
>    once per stacked copy (duplicate toasts/commentary/SFX). Fixed: named the handler so Cancel
>    can remove it too.
>
> **Flagged, not fixed (founder/game-designer call, not a code bug):** RTM (Right to Match) has a
> fully-styled dead CSS/markup stub (`#rtm-banner`) with zero JS wiring — GDD-specified, never
> built. "Planted Agent" mole mechanic from the GDD auction-corruption layer is entirely unbuilt.
> Both are content-scope decisions (build vs. formally cut from GDD), not something to
> unilaterally build or delete in a bug-fix pass.
>
> All 5 fixes verified by direct code reading (not agent-report trust) + a Node syntax parse of
> both inline `<script>` blocks (0 errors). Per this repo's standing rule, Playwright/browser
> verification was NOT run (testing is founder-gated) — **needs founder test pass**, especially:
> debt stage-2 lockout, mid-auction app-kill persistence, result-screen app-kill persistence,
> Impact Player cancel/reopen. Built in an isolated worktree
> (`.claude/worktrees/cricket-underworld-bugfix`); see `docs/CODEBASE-MAP.md` fix log for the full
> technical rundown per function.

> ### 🔄 ANON NETLIFY DEMO RE-SYNCED (2026-08-02) — Player Detail pass included (session close-out)
> `_deploy-anon/index.html` refreshed to pick up the Player Detail wider-scope pass (b303ca9): the
> `--pd-glow` rarity-tiered hero glow fix and the Fix Success Rate visual bar. This is the final
> resync for the day's full wider-scope pass series (Hub/Squad/Match/Pack/Auction/Post-Match/
> Hub-badge-reorder/Player-Detail — all 8 covered). Diffed against `prototype/index.html`,
> byte-copied, re-verified zero personal-identity strings (`chandu`/`yeswanth`/`@gmail`/
> `chandu45-droid`) via grep — 0 matches. Founder still needs to manually re-drag `_deploy-anon/`
> onto Netlify Drop.

> ### 🎴 PLAYER DETAIL WIDER-SCOPE PASS (2026-08-02d) — 8th/FINAL screen in this session's series
> Closes out the wider-scope pass series that covered Hub/Squad/Match/Pack/Auction/Post-Match/
> Hub-badge-reorder this session. Player Detail (`showPlayerDetail()`, ~L7313) was already ahead
> of the reference mockup (`design-lab/bolt-round4/project/public/mockups/player.html`) on most
> fronts — faceted avatar, full stat bars, and a genuine `fixChance` corruption mechanic the
> mockup doesn't even have — so the real opportunity here was two small, verified, real-data-only
> fixes, not a rebuild.
>
> **1. `--pd-glow` dead CSS variable, wired in — plus a real cascade bug found along the way.**
> The hero card set `--pd-glow:<RARITY_COLORS[p.rarity]>` inline but `.pd-hero::before` never
> consumed it (no `background` declared at all — the rule was a no-op). Investigation surfaced a
> second, un-briefed bug: even after adding `background:var(--pd-glow)`, the shared
> `.cu-card::before` rule (~L2568, the generic gold-sheen texture every `.cu-card` gets) has equal
> selector specificity and sits later in source, so it fully overrode the new background (and would
> have shifted the glow off-center via its `inset:0` clobbering `left:50%`). Fixed by rescoping to
> `.pd-hero.cu-card::before` (2-class selector beats `.cu-card::before`'s 1-class one regardless of
> source order) — verified via computed-style checks that `background-color` now resolves to the
> real per-player rarity hex (e.g. legendary → `#DC2626`) and the circle stays centered
> (`left:190px` + `translateX(-100px)` on a 420px-wide test viewport, not clipped/shifted).
> Removed the old JS-injected duplicate glow `<div>` (was doing the same 180px-blur job inline on
> every render) now that the CSS pseudo-element does it — same "CSS handles the look, JS only sets
> the data-driven var" technique `renderPlayerMini`/`#squad-screen .player-card-mini` already
> established for its `--rarity-color`/`--rarity-glow` pair (cross-checked against that code,
> ~L7290-7307 and its CSS at ~L2658-2667, commit history back to this session's Squad pass).
> Rarity tiering matches that same precedent exactly: common/uncommon/rare get the plain
> `--pd-glow` wash at 0.15 opacity; **epic** gets a static stronger wash (0.24, no animation);
> **legendary** is the only tier that pulses (`pdHeroGlowPulse`, opacity 0.16↔0.32, 3s ease-in-out
> infinite, one shared keyframe) — same "rarest tier only" rule Squad's `sqMiniRarityPulse` used,
> so the effect stays earned/rare rather than applied to every card.
>
> **2. Fix Success Rate got a bar.** `.pd-fix-rate` was label+value text only despite sitting one
> section below a full stat-bar block using the same `.stat-bar`/`.fill` component. Added a
> `.stat-bar.flex-1` + `.fill` row using the SAME markup convention as `.pd-stat-row` above it, and
> reused the color thresholds `fixChance` already had (`>=70` / `>=40` / else) rather than
> inventing new ones — mapped straight onto the existing `.fill.green`/`.fill.amber`/`.fill.red`
> CSS variants (all three already existed pre-this-pass). The real `fixChance` computation
> (`Math.round(100 - loyalty*0.8 + greed*0.3)`, clamped 5-95) is untouched — purely visual.
>
> **Explicitly excluded (verified NOT real, would require inventing new state/mechanics/fields —
> not built):** a "Recent Matches" history section (no per-player match log exists anywhere,
> `GS.matchesPlayed` is team-level only); an Age/City/Nationality line (no such fields on
> `ALL_PLAYERS` objects); a "Pressure" attribute (only bat/bwl/fld/fit/form exist); a reserve-price/
> market-value/"Send to Auction" CTA (no resale-a-squad-player mechanic exists in the auction
> system at all). Training section, Loyalty/Greed numbers, banned callout, and Close/Release button
> logic were also explicitly out of scope for this pass and were not touched.
>
> **Protected selectors confirmed untouched:** grepped `tests/*.spec.js` for
> `player-detail|release-detail-btn` — only `#player-detail-overlay.show` and `#release-detail-btn`
> are pinned (`tests/comprehensive.spec.js` lines 243-287), both still present, neither renamed nor
> restructured; `#close-detail-btn` and the training/release JS logic are unmodified.
>
> **Verified** with a throwaway Playwright script (deleted after use, per protocol) against
> `npx serve`: forced each rarity tier onto a squad player and confirmed via computed styles that
> the glow color/opacity/animation-name vary correctly per tier (common/uncommon/rare: opacity
> 0.15, `animation-name:none`; epic: 0.24, none; legendary: 0.16 base + `pdHeroGlowPulse`), that the
> fix-rate bar's `.fill` class and width track `fixChance` (e.g. 95% → `fill green`, 43% → `fill
> amber`), and visually screenshotted both light and dark theme — glow and bar render cleanly in
> both, no clipping, no layout shift in the Character/Training/Actions sections below. Thermal gate:
> `infinite` 62→63 (one new keyframe, `pdHeroGlowPulse`, GPU-cheap opacity-only, legendary tier
> only), `backdrop-filter` 22→22 (unchanged), `requestAnimationFrame`/`<canvas>` 8→8 (unchanged).
>
> This closes the wider-scope pass series for this session — all 8 planned screens (Hub, Squad,
> Match, Pack, Auction, Post-Match, Hub-badge-reorder, Player Detail) are now done.

> ### 🔄 ANON NETLIFY DEMO RE-SYNCED (2026-08-02) — Hub badge + reorder pass included
> `_deploy-anon/index.html` refreshed to pick up the Hub badge+reorder pass (6516b95): the
> `#hub-nav-dot` notification dot and the investigation-panel/debt-panel reorder that replaced
> the original "Deals screen" ask. Diffed against `prototype/index.html`, byte-copied, re-verified
> zero personal-identity strings (`chandu`/`yeswanth`/`@gmail`/`chandu45-droid`) via grep — 0
> matches. Founder still needs to manually re-drag `_deploy-anon/` onto Netlify Drop.

> ### 🔔 HUB BADGE + REORDER (2026-08-02c) — replaces the original "Deals screen" wider-scope ask
> The founder's original ask for this pass was a "Deals screen wider-scope pass" (same treatment as
> Hub/Squad/Match/Pack/Auction/Post-Match this session). Investigation found the mockup's "Deals"
> screen doesn't map to any real nav destination — real nav is Hub/Squad/Auction/Cards/League, and
> everything the mockup shows (favors, debts, heat/tribunal risk, deal cards) already exists as Hub
> sub-panels (`investigation-panel`, `debt-panel`, `hub-ledger`). A player-experience consult was run
> and explicitly recommended AGAINST building a new "Deals" nav tab — a 6th tab would shrink every
> tab's thumb-target, and the mockup's "Initiate a Deal" CTA is a fabricated mechanic that doesn't
> exist in the real code. Founder approved the consult's narrower alternative instead: **badge +
> reorder** on the existing Hub panels, nothing more.
>
> **1. Notification dot on the Hub nav icon.** Added `#hub-nav-dot` (`.nav-dot` CSS, static — no
> animation, thermal-neutral) inside the Hub `.nav-item` (~L3728). Shown/hidden by a single check —
> `GS.investigation || GS.debts.length > 0` — added directly alongside the existing
> `show/hide('investigation-panel')` and `show/hide('debt-panel')` calls inside `updateHub()`
> (~L7601-7610), so the dot can never drift out of sync with the panels it represents. Color is
> `var(--blood)` (real design-system token, `docs/visual-design-system.md` — "Corrupt highlight,
> warnings, heat", the general attention/alert color already used for debt-stage-2/bans/high-heat
> elsewhere in this same screen), ring uses `rgba(var(--chrome-rgb),1)` to match the bottom-nav's
> actual background gradient. `updateHub()` already runs unconditionally on app init (L12076,
> before any nav click), so the dot is correct on first paint, not just after navigation.
>
> **2. Reordered two Hub panels.** `investigation-panel` and `debt-panel` moved (as complete,
> unmodified blocks — pure cut/paste, no internal markup/JS touched) from AFTER the Store & Rewards
> drawer + `mafia-banner` (buried 4-5 scroll-lengths down) to immediately after `#hub-ledger`, before
> the Store & Rewards drawer. Relative order to each other unchanged (investigation before debt, as
> before). `mafia-banner` and Store & Rewards now sit after these two panels instead of before.
> `ban-panel`/`injury-panel`/Club Management drawer untouched, same position as before.
>
> **Explicitly out of scope (per founder's approval of the narrower ask):** no new "Deals" nav tab,
> no "Initiate a Deal" mechanic, no `hub-ledger`+debt-list accordion merge (a further nice-to-have
> the consult raised but founder did not approve), no changes to any other screen.
>
> **Verified** with a throwaway Playwright script (deleted after use, per protocol) against
> `npx serve`, injecting `GS.debts`/`GS.investigation` state the same way `tests/comprehensive.spec.js`
> does: dot hidden on first paint with no debts/investigation; dot+debt-panel appear together when
> debts present, investigation-panel stays hidden; dot+investigation-panel appear together when
> investigation active, debt-panel stays hidden; both together when both present; DOM order confirmed
> `hub-ledger < investigation-panel < debt-panel < drawer-rewards/mafia-banner/ban-panel`. 14/14 checks
> passed. Grepped `tests/*.spec.js` for `investigation-panel|debt-panel|hub-ledger|nav-item` first —
> all existing test assertions are ID/attribute-based (`#investigation-panel`, `.nav-item[data-screen=...]`),
> none pin DOM position, so nothing broke. Thermal gate unchanged: `infinite`=62, `backdrop-filter`=22,
> `requestAnimationFrame`/`<canvas>`=8 (baseline == after — the dot is static, zero new animation loops).

> ### 🔄 ANON NETLIFY DEMO RE-SYNCED (2026-08-02) — Post-Match wider-scope pass included
> `_deploy-anon/index.html` refreshed to pick up the Post-Match wider-scope pass (458f553):
> Standout Performer card wired from real scorecard data, hero verdict card, real Contract-XP
> progress bar. Diffed against `prototype/index.html`, byte-copied, re-verified zero personal-
> identity strings (`chandu`/`yeswanth`/`@gmail`/`chandu45-droid`) via grep — 0 matches. Founder
> still needs to manually re-drag `_deploy-anon/` onto Netlify Drop.

> ### 🏆 WIDER-SCOPE COMPOSITION PASS — Post-Match Result (2026-08-02, needs testing)
> Sixth screen under the wider-scope label (Hub/Squad/Match/Pack/Auction shipped earlier). Re-inventoried
> `design-lab/bolt-round4/project/public/mockups/postmatch.html` against the real `endMatch()` result
> screen (`#match-result`, grepped ~L9652 pre-edit). Verdict going in: this screen is already MORE
> data-dense than the mockup (corruption reports, tribunal verdicts, rival relationship events, debt
> warnings, ban/injury events, streak milestones, daily challenge, social feed, next-opponent tease —
> none of which the mockup has), so this pass found exactly 3 concrete, real-data-backed gaps rather than
> porting the mockup's composition wholesale. Explicitly did NOT port the mockup's invented "Level/XP"
> fake system — the real syndicate contract (season pass) system already covers that ground.
>
> **1. Wired up the dead `.potm` CSS into a real "Standout Performer" card.** `.potm`/`.potm-label`/
> `.potm-name`/`.potm-stat` (index.html ~L1787-1790) were defined in CSS but never referenced by any
> markup in the whole file — an orphaned "Player of the Match" card designed but never built. Added
> `computeStandoutPerformer(sc, won, tied)` (new function, sits just above `endMatch()`): reads the REAL
> per-player data already collected during the match at `match.scorecard.you/opp.batters/bowlers` (same
> arrays `showScorecard()` renders in the scorecard table — no new state, no invented stats). For each
> side it finds the best real batting return (highest runs) and best real bowling return (most wickets,
> tie-broken by fewest runs conceded), scores each with a small fixed heuristic (batting: runs + fours +
> sixes×2; bowling: wkts×28 − runs conceded), adds a +10 tie-break bonus to whichever side actually won
> the match, then picks the single highest-scoring candidate — fully deterministic, no RNG. Verified live
> via Playwright: a loss picked a top-scoring batter from the LOSING side (71 off 49, no bowler on either
> side had a bowling case as strong) and a win correctly picked a 5-wicket bowling haul over any batting
> return. Rendered using the EXISTING `.potm*` CSS classes verbatim — checked first and confirmed they
> already use real design tokens (`--glass-bg`, `--gold`, `--gold-bright`, `--white`, `--slip`, `--font-d`)
> since this CSS originated in this codebase, not the mockup, so no recoloring was needed.
>
> **2. Wrapped the bare Victory/Defeat verdict in a `.cu-card` hero panel with an icon.** Was previously
> unbordered text directly on the overlay background. Now wrapped `result-text`/`result-scores`/
> `result-margin` in `<div class="cu-card result-hero-card">` reusing the exact same `.cu-card`/`.cu-green`/
> `.cu-red` language already used elsewhere on this same screen (tribunal verdict card, and the
> `#fix-active-banner` warning card on the pre-match screen) — no new card style invented. Added a small
> inline SVG icon above the verdict, matching this codebase's existing icon convention (14-20px inline
> SVG, `stroke`/`fill` via CSS var tokens, no icon library): the same 5-point star path already used
> elsewhere for achievement/training icons (`HUB_STAR_SVG`) for a win, the same warning-triangle path
> already used on `#fix-active-banner` for a loss, and a plain neutral circle-with-line for a tie (no
> precedent existed for tied, so this is the one new glyph — kept intentionally minimal). New CSS is
> layout-only (`margin`/`padding`/icon `width`/`height`/`filter: drop-shadow`), no new colors, no
> `border-radius` beyond the pre-existing `--clip-14` chamfer `.cu-card` already supplies. `result-scores`
> element and its exact text-content shape are untouched — only its parent changed.
>
> **3. Added a real syndicate-contract progress bar under the "Contract XP" reward row.** That row was
> previously a dead-end "+X" number with no visible progression, even though the Hub screen already shows
> real season-pass tier progress via `updatePassPanel()`. Reused the EXACT same math
> (`GS.seasonPass.xp − tier×PASS_TIER_XP`, `Math.round((intoTier/PASS_TIER_XP)×100)`) and the existing
> generic `.pass-xp-bar`/`.pass-xp-fill` CSS classes (already unscoped/reusable, so zero new CSS needed)
> to render a compact bar plus a "Tier N · X / 70 XP to Tier N+1" line. No new fake "Level" system — this
> is the real syndicate contract tier, same data the Hub panel already reads.
>
> **Explicitly excluded, and why:** everything else the inventory listed as already-shipped (corruption
> report, heat/investigation/tribunal banners, rival events/scandals, debt warnings, underworld notes, ban/
> injury events, match-payout hero, the other 10 reward rows, post-match event cards, streak milestone,
> daily challenge, match hook, next-opponent tease, social feed, scorecard/continue/play-again buttons) was
> left untouched — this screen's data density already exceeds the mockup, so padding it further would be
> manufactured scope, not a real gap.
>
> **Verified with a throwaway Playwright script against `npx serve` (deleted before finishing, per the
> testing-is-founder-gated rule — real `npx playwright test` was NOT run):** drove real matches to a loss
> (light theme) and a win (dark theme) via localStorage state injection + `#skip-btn`, screenshotted both,
> confirmed the standout-performer card renders correct real numbers, the hero card renders `cu-red`/
> `cu-green` correctly with the right icon, the contract-progress bar width matches the real XP math, and
> `.result-scores` / `#match-continue-btn` / `#view-scorecard-btn` / `#match-play-again-btn` all still
> exist and function. Confirmed by grep that `tests/*.spec.js`'s only pins on this screen
> (`.match-result-overlay.show`, `.result-scores` text shape, the three button IDs) are all untouched.
>
> Thermal budget: `infinite` 62 → 62 (+0 — no new animation, icon is static, `.pass-xp-fill`'s width
> transition was already pre-existing generic CSS), `backdrop-filter` 22 → 22 (+0), `requestAnimationFrame`/
> `<canvas>` 8 → 8 (+0). Zero new animation loops added. Needs Playwright/founder testing (not run —
> founder-gated); self-verified only via the throwaway script described above.

> ### 🔄 ANON NETLIFY DEMO RE-SYNCED (2026-08-02) — 5-bug design-audit fix batch included
> Closes the gap opened by the 5-bug fix batch (`98b8232`/`92e63df`): Hub OVR-ring clip fix, ticker edge
> fade, achievement-rail contrast fix (verified independently — WCAG ratios re-computed by hand, matched
> the build's numbers almost exactly: light 4.19→5.35:1, dark 3.68→4.88:1, both now clear AA), toast
> offset fix, and a new SVG field backdrop behind Match's (confirmed-dead-code) fielder dots.
> - `index.html` refreshed (802,172 → 810,179 bytes). Icon assets already synced from the prior pass,
>   untouched here.
> - Re-verified zero personal-identity strings in the copy.
> - **This completes the sync for today's full design-audit remediation** (Stump Crown icon + 5-bug fix).
> - **NOT done (founder step, ~2 min):** re-drag `_deploy-anon/` onto Netlify Drop.

> ### 🩹 UI-DESIGNER AUDIT FOLLOW-UP — 5 defects fixed (Hub ring/ticker/achieve-rail/toast, Match field backdrop) (2026-08-02)
> A `ui-designer` audit of the Hub/Squad/Match cinematic + wider-composition passes (shipped earlier
> today) found 5 real, small defects, verified against actual screenshots at 320/390/768px in both
> themes and a real driven match. All 5 fixed, CSS/markup-only, zero game-state/logic changes.
>
> **1 [HIGH] Hub OVR ring clipped off-screen at 320px.** `.hub-header`'s flex row (80px crest + name
> column + 76px ring, 16px gaps) doesn't reflow at narrow widths; the row overflowed its own card by
> ~33px with just the default "Manager" name, and `.screen`'s `overflow-x:hidden` clipped the ring at
> the viewport edge instead of reflowing it. Added a `@media (max-width:340px)` block (placed *after*
> the base rules so cascade order — not just the media match — wins): crest 80→64→62px, ring 76→48px,
> header gap 16→8px, name font 32→23px. First pass (ring-only shrink, crest untouched) fit the ring but
> made "Manager" itself start truncating ("Mana...") — measured the real content-box math (.hub-header's
> border-box 288px at 320vw minus its own 32px padding = 256px content width) and rebalanced across
> crest+ring+font instead of ring alone. Verified un-truncated + ring fully on-screen for "Manager",
> "Siddharth", and "Virender Rao" at 320/340/390px; only the true 20-char input-cap extreme
> ("Chandrasekhar Reddy") still ellipsizes — `min-width:0` + `text-overflow:ellipsis` on the name is a
> deliberate safety net for that case, not the primary mechanism.
>
> **2 [HIGH] Hub LED ticker "hard truncation."** Investigated before touching anything: the marquee
> is NOT broken — `.ticker-track`'s content is already duplicated once (10 spans = 5 unique ×2) and
> `hubTickerScroll` already drives a continuous `translateX(0)→translateX(-50%)` loop. Confirmed live
> by sampling the computed `transform` at t=0/3s/6s — value advances every sample,
> `animation-play-state:running`. The audit's screenshot caught it mid-cycle, which is inherent to any
> running marquee, not a defect. **Outcome: no repair needed to the marquee itself** — added a
> polish-only CSS edge fade (`mask-image`, both edges, transparent→opaque within 20px) so the
> inevitable mid-word edge reads as an intentional vignette. Chose `mask-image` over a solid-color
> pseudo-element because the ticker sits directly on the hub screen's own radial-gradient backdrop
> (no flat card color to fade toward).
>
> **3 [MEDIUM] Hub achievement rail contrast + no scroll cue.** `.hub-ach-item .hub-ach-name` was
> 8.5px `var(--slip)` on `var(--glass-bg)`. Computed WCAG contrast by hand from the actual CSS hex
> values (relative-luminance formula, sRGB→linear, worst-case gradient stop per theme):
> - Light theme: `--slip` `#57687C` vs glass-bg darkest stop `#E8DCBC` = **~4.19:1** (fails 4.5:1 AA;
>   matches the audit's own ~4.15:1 reading within rounding) → `--white-60` `rgba(26,35,51,.72)`
>   composited over the same stop = **~5.34:1** (passes).
> - Dark theme: `--slip` `#7A8299` vs glass-bg lightest stop `#232B40` = **~3.68:1** (also fails,
>   worse than light) → `--white-60` `rgba(232,224,212,.6)` composited over the same stop =
>   **~4.90:1** (passes).
> Moved to the existing `--white-60` token (already used elsewhere for readable secondary text on a
> card — `--slip` is for body-copy on the main screen bg, not the smallest label on a small card) and
> bumped 8.5px→9.5px. Both themes now clear AA with margin at the single worst-case pixel. Added a
> right-edge `mask-image` fade on `.hub-achieve-rail` (same rationale as the ticker — no card color
> behind it to fade toward) so the 6-badge horizontal scroll reads as "more content" instead of a hard
> stop.
>
> **4 [MEDIUM] Hub toasts overlapping the manager card.** `.toast[data-screen="hub"]` was tuned
> (2026-07-31) to `top:calc(var(--top-h)+4px)` for a pre-cinematic-pass header. Today's Hub cinematic
> pass grew the header into a full stadium-backdrop card; measured live (`getBoundingClientRect`,
> identical at 320/390px — fixed mobile-width column) that `.hub-header` now spans top:68px→bottom:195px,
> so the old +4px (56px from viewport top) landed mid-header, over the manager name. Moved to
> `top:calc(var(--top-h)+155px)`, clearing the header with margin at both widths. Every row below is
> packed tight enough (largest gap 20px vs. toast's ~40px+ height) that a toast will still graze
> hub-meters briefly — accepted tradeoff since the only hard requirement (clear the manager
> name/OVR ring) is met.
>
> **5 [LOW] Match screen fielder dots read as debug scatter.** Investigated the actual rendering path
> before touching anything: `#fielder-dots`/`FIELDER_POSITIONS`/`updateFielderDots()` (the anchors named
> in the brief) turned out to be **dead code** — the container is `display:none` in the markup and
> nothing in the codebase ever toggles it visible (confirmed via live `getComputedStyle` after calling
> `updateFielderDots()` directly — still `display:none`). The actual live fielder/ground visual is a
> separate, already-existing canvas 2D system (`matchCanvas.drawGround()` + `drawFielders()`, called
> every frame from `render()`) that already draws a boundary ellipse + pitch rectangle, just at very low
> alpha (0.06–0.2), which is why it under-renders as "no boundary/pitch" in practice. Per the brief's
> constraint (don't touch dot-positioning/game logic), left `matchCanvas` and the dead DOM system alone
> and added a purely additive SVG backdrop (`#fielder-field-svg`, z-index:1, between canvas z0 and the
> inert `#fielder-dots` z2) — an oval boundary + center pitch rectangle, monoline `stroke-width:1.8`
> matching `.action-tile .tile-icon svg`'s existing convention, colored `var(--green-bright)` (existing
> token, already this screen's accent) at 0.34 opacity. Verified via live screenshots (light theme
> standard field, dark theme attacking field, both 320/390px) that the pitch strip and boundary are now
> clearly legible without competing with the fielder dots. **Flagging for founder:** the dead
> `#fielder-dots`/`FIELDER_POSITIONS` DOM system is real tech debt worth a cleanup pass separately —
> it was out of scope here since the brief explicitly said not to touch dot-positioning logic.
>
> **Verification:** thermal grep unchanged (62 `infinite`, 22 `backdrop-filter`, before = after — no
> new always-running animations or blur layers). Brace count balanced (4471/4471). All test-referenced
> selectors survived unmodified (`hub-power-ring` id, `hub-news-ticker`/`hub-achieve-rail` classes,
> `fielder-dots` id, `hub-crest`/`manager-name`/`hub-meters`/`hub-empire-line`/`action-tile`/
> `hub-battle-card`/`drawer-rewards`/`match-score .score-char`/`tac-aggro`) — none renamed, none removed.
> Verified locally via `npx serve prototype` + throwaway Playwright scripts (state-injected screenshots
> at 320/340/390px, both themes, plus live match-screen rendering) — not the real `npx playwright test`
> suite (founder-gated). Scratch scripts deleted after use, not committed. **Needs founder device pass**
> before considering closed.

> ### 🔄 ANON NETLIFY DEMO RE-SYNCED (2026-08-02) — new app icon (Stump Crown recolor)
> Founder: "resync the anon demo too" — closes the gap opened by the Stump Crown icon recolor (`eacfe6a`).
> - `index.html` was already identical (the 5-bug design-audit fix batch hadn't landed yet at sync time —
>   another re-sync will be needed once that lands).
> - Copied the 3 changed icon assets: `icon.svg`, `icon-192.png`, `icon-512.png`. Re-verified zero
>   personal-identity strings in the new SVG.
> - `manifest.json`/`sw.js`/`pitch.html` confirmed already byte-identical, untouched.
> - **NOT done (founder step, ~2 min):** re-drag `_deploy-anon/` onto Netlify Drop.

> ### 🎨 APP ICON RECOLORED — Stump Crown adopted, generic orange swapped for real palette (2026-08-02)
> Founder generated a bolt.new AI logo-concept export exploring 6 app-icon directions
> (`design-lab/bolt-round5-logo/`). A `ui-designer` audit independently reviewed all 6 (reading the
> actual SVG code) and gave a clear verdict: **adopt Concept 4, "Stump Crown"** (three cricket stumps
> forming a crown) — the only concept that reads as both "cricket" and "underworld/prestige" at any
> size, including tiny app-icon scale. It shipped in a generic orange with no relation to this game's
> real palette, so the audit mandated a recolor before use.
>
> **What changed — `prototype/icon.svg` rebuilt from source geometry** (`design-lab/bolt-round5-logo/
> project/src/components/Logos.tsx`, `LogoRecommended` — the refined final form of `LogoStumpCrown`/
> Concept 4), recolored to the game's real design-system tokens (`docs/visual-design-system.md` §2.1):
> - **Stumps**: `--gold-bright` `#DAA520` → `--gold` (Antique Gold) `#B8862F` (was an orange-adjacent
>   approximation `#E8B84A`/`#D4A017`/`#8B5A2B`).
> - **Crown arch + base bar**: `--blood` (Blood Red) `#CC1100` → `--crimson` (Crimson Deep) `#8B0000` —
>   the game's real corrupt/underworld half, replacing the generic `#FF6A00`→`#B5470D` orange that had
>   no basis in the palette.
> - **Stump caps + diamond accent**: solid `#FFD700` lemon-gold → solid `--gold-bright` `#DAA520` (the
>   design system explicitly flags lemon-gold as an anti-pattern — "burnished, NOT lemon").
> - Composition, proportions, and silhouette kept exactly as designed (pure color swap). Source
>   geometry is `viewBox 0 0 200`; scaled uniformly to the icon's `512x512` viewBox via a single
>   `<g transform="scale(2.56)">` so every coordinate scales by the identical factor. Kept the existing
>   dark-void `bg` gradient (`#0B0F1E`→`#060810`) behind the mark for contrast on any home-screen
>   background (the source mockup has no background since it renders on a dark page already).
> - Design call made mid-task: the diamond accent below the crown uses solid gold-bright rather than
>   the red crown-arch gradient (source `LogoRecommended` used the red gradient there) — the recolor
>   spec explicitly grouped the diamond with the stump-cap gold accents, giving a "gold jewel drop
>   below a blood-red crown" motif.
> - Regenerated `prototype/icon-192.png` and `prototype/icon-512.png` via the existing
>   `prototype/gen_icons.js` Playwright pipeline; confirmed both PNGs changed (byte size and content
>   hash both differ from the pre-recolor versions).
> - `manifest.json` and `index.html`'s `<link rel="icon">`/`<link rel="apple-touch-icon">` reference the
>   files by filename only (no embedded data-URI/inline SVG) — verified, no changes needed there.
> - No test coverage of icon file contents (`tests/smoke.spec.js` only checks `manifest.icons.length`
>   and unrelated in-app hub tile icons) — confirmed via grep, zero test-selector risk.

> ### 🔄 ANON NETLIFY DEMO RE-SYNCED (2026-08-02) — ALL 5 WIDER-SCOPE PASSES now included
> Final re-sync of this batch: Auction (`285cd4d`) and Pack (inventory-only, no code change) have now
> landed alongside the earlier Hub/Squad/Match wider-scope passes. `_deploy-anon/index.html` refreshed
> (798,772 → 802,172 bytes) — other staged assets confirmed byte-identical. Re-verified zero
> personal-identity strings in the copy.
> **All 5 screens in the wider-composition initiative are now complete and reflected here:** Hub
> (`0622743`), Squad (`1bad30e`), Match (`4031f6a`), Pack (`d6aadb5`, no code change — honest finding),
> Auction (`285cd4d`).
> **NOT done (founder step, ~2 min):** re-drag `_deploy-anon/` onto Netlify Drop.
> **Still owed across this whole initiative (10 passes total: 5 narrow + 5 wider):** none of it has been
> seen in a real browser yet — testing stays founder-gated.

> ### 🔨 WIDER SCOPE — Auction restyle pass shipped (2026-08-02, needs testing)
> **Fourth wider-composition pass** (after Hub, alongside Squad/Match in parallel worktrees), applying
> the founder's "update both" scope-widening decision to Auction — already got the narrow SOLD-stamp/
> bid-punch pass (`0d03562`), which stays untouched here.
>
> **Inventory finding: this screen has less of a real gap than Hub/Squad did.** Before touching anything,
> compared `design-lab/bolt-round4/project/public/mockups/auction.html` against `#auction-screen` line
> by line:
> - **Atmosphere already fully covered** — `#auction-screen`'s own animated mesh-gradient background
>   (`auctionMesh`, L407-420) plus the already-rotating `.spotlight-rays` conic-gradient (`spotlightRotate
>   20s linear infinite`, L730/732) around the stage. The mockup's `.atmosphere`/`.beam` layer would be
>   pure redundancy on top — not added.
> - **The live bidding card is already the full rarity-tiered card** — `showNextCard()` renders the SAME
>   `renderPlayerCard()` component used on Cards/Pack screens (OVR badge, rarity strip/shimmer, stats).
>   The mockup's simpler `.stage`/`.stat-strip` is already matched or exceeded. Not touched.
> - **Bid info is already real and functional, and MORE information-rich than the mockup** — countdown
>   ring, current bid, leading bidder, a real scrolling chronological `#bid-log` fed by `auctionTick()`,
>   plus a Mafia Intel panel the mockup has no equivalent of at all (this game's own unique system, kept
>   exactly as-is).
>
> **What was actually restyled (small, on purpose):**
> 1. **`auction-cam-flashes`** — the one genuinely-missing atmospheric detail from the mockup: ambient
>    "photographers in the crowd" camera flashes (`.flashes`/`.flash` in the mockup), independent of the
>    SOLD-moment flash from the narrow pass (`.ssv-flash`, untouched). Added 3 elements sharing ONE
>    keyframe (`aucCamFlash`), opacity capped at 0.3, staggered delays, `z-index:1` (below the card
>    spotlight/avatar so it never dims the live card), no `border-radius` (angular-design rule — a soft
>    radial fade needs no circular clip to read as a flash), `prefers-reduced-motion` respected.
> 2. **`auction-log-title`** — restyled the existing "Bid History" section-title into a premium card
>    header: added a small gavel icon (reusing the exact same hammer SVG path as `.ssv-hammer` from the
>    narrow pass, so the auction's iconography stays consistent rather than inventing a new glyph) and a
>    gold-tinted accent-line, closer to the mockup's `.board-head`/`.board-title` visual weight. Same
>    text, same `#bid-log` data/DOM id, presentation only.
>
> **Explicitly excluded, and why:**
> - **Mockup's 4-button bid-ladder** (+5K min / +10K step / +25K push / +50K all-in) — this is a
>   different, more permissive interaction model (player chooses bid increment) than the real game's
>   fixed "Bid [amount]" / "Pass" buttons. New player-facing mechanic, out of scope regardless of visual
>   appeal.
> - **Mockup's `.rivals` mini-leaderboard** (3 fixed rows, deduplicated "top bidders" standings, one
>   marked Lead/You) — a different DATA SHAPE than the real `#bid-log`'s chronological history (same
>   bidder can re-appear as they re-bid). Computing a deduplicated standings view from the log is
>   possible but adds real complexity/risk to a screen that already works well; restyling the log's
>   existing presentation (above) was judged sufficient. `#bid-log` itself was NOT restructured.
> - **`.bid-arena`'s card treatment** — already carries `.cu-card`, which supplies the chamfered frame,
>   gold radial glow, and gold top accent-line for free. Checked against the mockup's `.board`/
>   `.current-bid` glow treatment; no concrete gap found, so left untouched (adding another pulsing glow
>   on top would have competed with the existing `bidPunch` animation and cost thermal budget for no
>   real gain).
>
> **Net effect:** this is the smallest wider-scope diff of the four shipped so far, on purpose — the
> screen was already unusually well-developed (more real functional depth than its own mockup in some
> areas), so the honest answer was a small, targeted restyle rather than manufactured scope.
>
> Thermal budget: `infinite` count 61 → 62 (+1, one shared keyframe for the 3 flash spans, within the
> +0 to +2 target), `backdrop-filter` count unchanged at 22. All test-relevant selectors (`#auction-screen`,
> `#current-bid`, `#bid-btn`, `#pass-btn`, `#bid-log`, `#sold-stamp-overlay`, `#auction-intel-panel`,
> `#timer-circle`, `#timer-sec`) confirmed intact by grep — none were renamed or removed, only a sibling
> div and an icon were added around them. Needs Playwright/founder testing (not run — founder-gated).

> ### 📦 WIDER SCOPE — Pack: inventory only, no code change (2026-08-02)
> **Third of five wider-scope passes to land honest instead of padded** (Auction is the other one
> running the same instruction, in parallel). The narrow lighting-flash/smoke/`epicSpot` pass on Pack
> already shipped in `0480e43` and stays untouched. This pass re-inventoried `design-lab/bolt-round4/
> project/public/mockups/pack.html` against the real `openPack()` flow (grepped, ~L10354) specifically
> looking for composition/layout to port — and concluded there is nothing safe to add.
>
> **Why the mockup doesn't map onto this game's actual flow:**
> - The mockup depicts a **pre-purchase staging screen**: idle sealed-pack box with a `pack-shake`
>   4s-infinite CSS animation, tier label, "3 Cards · Boosted Odds", an odds line, a "Pack Contents"
>   disclosure list (guaranteed rare / standard cards / **a "chemistry boost token" — confirmed
>   invented, no such item exists in `ALL_PLAYERS`/`GS`/the draw logic, correctly excluded**), and a
>   "OPEN PACK · Cost ₹40,000 · 3 cards" CTA that triggers the reveal.
> - The real `openPack(type)` is called **after** purchase already happened on the Vault/Store screen
>   (cost already deducted at L10360) — it immediately builds and shows the flip-card grid inside
>   `#pack-overlay`. There is no "idle sealed pack" moment in the real flow to host that box.
> - The odds/contents disclosure the mockup shows **already exists, live, in the correct place**:
>   `#odds-overlay` / `renderOdds()` (~L11714), fed by the real `PACK_INFO` array (~L11701-11704:
>   `{name, cost, cards, floorLbl}` per pack type, e.g. "Final card guaranteed Rare or better"),
>   triggered from `#store-odds-link` on the Store screen — i.e. pre-purchase, where the decision
>   actually happens. Duplicating it inside the pack-overlay would be wrong (post-purchase, decision
>   already made) and redundant.
> - The revealed cards already use the full rarity-tiered `renderPlayerCard()` for **every** card in
>   the pack (not one headline pull like the mockup) — richer than the mockup, not a downgrade to fix.
> - The pack-type header (`packLabel`, e.g. "Standard Pack") is **already** rendered via `.cu-ribbon`
>   (angular chamfered banner, gold gradient, uppercase letter-spacing — `index.html` ~L2440-2443) plus
>   a "Tap to reveal" subtitle immediately above the flip-grid. This already has more visual weight than
>   the mockup's plain "Pack Contents" text header — nothing to port here.
>
> **The one candidate considered and rejected: a brief "sealed pack" anticipation beat before the
> flip-grid appears (the brief's suggested ~800-1200ms delay, reusing `pack-shake`-style CSS).**
> Rejected on concrete evidence, not a guess: `tests/smoke.spec.js:126-131` clicks `#pack-standard`,
> waits exactly `500ms`, then asserts `.pack-flip-container` count > 0. Any anticipation delay long
> enough to actually read as a beat (the brief's own 800-1200ms suggestion, or anything with real
> margin above the test's 500ms checkpoint) would make that assertion fail — flip-grid elements don't
> exist yet while a sealed-box placeholder is showing instead. Shortening the delay to survive the
> test (e.g. <300ms) would defeat the point of an "anticipation" beat and wasn't worth the risk for a
> cosmetic flourish. Editing the test to accommodate a cosmetic change was out of scope. Concluded
> this doesn't have a clean home without either breaking a verified selector or being too short to
> matter.
>
> **Verdict: no `prototype/index.html` change shipped for Pack.** Zero new `GS` fields (moot — no
> code touched). `openPack()`'s draw/RNG/currency logic, `spawnPackSparks()`, the flip-stagger timing
> loop, `#odds-overlay`/`renderOdds()`/`PACK_INFO`, and the narrow pass's `packSurge`/smoke/`epicSpot`/
> `legendarySpot` effects are all untouched (never opened for edit). Thermal counts unchanged because
> nothing changed: `infinite` grep count and `backdrop-filter` grep count both identical pre/post (not
> re-measured as a diff since no lines were touched). Re-grepped every test selector this brief listed
> (`pack-overlay`, `pack-flip-container`, `pack-flip-inner.flipped`, `pack-collect-btn`,
> `pack-opening-content`, `odds-overlay`, `store-odds-link`) across `tests/*.spec.js` — all present,
> all still map to markup that was never opened for edit, so none can have broken.

> ### 🔄 ANON NETLIFY DEMO RE-SYNCED (2026-08-02) — now carries the WIDER-SCOPE passes
> Founder asked whether the wider-composition work is live on Netlify too — it was not; GitHub Pages
> auto-deploys on every push, but `_deploy-anon/` only updates when manually re-synced + re-dropped.
> - Refreshed `index.html` (775,665 → 798,772 bytes) to pick up the three wider-scope passes landed so
>   far: Hub (`0622743`), Squad (`1bad30e`), Match (`4031f6a`/`3cc402c`). Other staged assets confirmed
>   byte-identical.
> - Re-verified zero personal-identity strings in the copy.
> - **Auction and Pack wider-scope passes are still running** (separate worktrees) — this snapshot does
>   NOT yet include them. Another re-sync will be needed once they land.
> - **NOT done (founder step, ~2 min):** re-drag `_deploy-anon/` onto Netlify Drop.

> ### 🖼️ WIDER-SCOPE COMPOSITION PASS — Match (2026-08-02, third pass under this label, needs testing)
> Third of the widened-scope cinematic passes (after Hub and Squad, run concurrently in separate
> worktrees) — founder confirmed his mockup zip is byte-identical to `design-lab/bolt-round4/` and
> that the live game's narrow passes never ported the mockup's actual layout density/hierarchy for
> Match. Scope for this pass: **reshape HOW existing `match`/`GS` data is displayed** (layout, density,
> visual hierarchy, card treatment) — no new persisted state, no new mechanics. The narrow Match pass's
> six/four/wicket text-slam (`8951416`) and the `matchMesh` background are untouched/not duplicated.
>
> **Restyled (real-data sources, no new state):**
> - **Scoreboard card** (`.match-pitch-bg` / `.match-scoreboard`) — added a top gold accent line and a
>   radial glow behind the score digits for broadcast-scoreboard visual weight. `#match-score
>   .score-char` digit-roll structure (test-referenced, `smoke.spec.js:79`) is completely untouched —
>   only the surrounding container got new `::before` pseudo-elements.
> - **Momentum bar** (`.momentum-bar`) — kept as the same real two-team tug-of-war bar driven by
>   `match.momentum` (no second/duplicate momentum display added). Given more card weight (bigger
>   padding, taller bar, gold top accent) plus a new header row with a sublabel ("Surging" >65 /
>   "Slipping" <35 / "Steady" otherwise) derived from the existing `match.momentum` value via simple
>   threshold in `updateMomentum()` — no new tracked field.
> - **"Key Moments" feed** (`#match-moments`) — container given a gold top-accent card treatment
>   (`.match-feed-card`) and a slightly taller viewport (200px→230px). `addMoment()`, the 10-item cap,
>   and all commentary generation logic are byte-for-byte untouched — restyle only.
> - **Match Tactics grid** (`.match-tactics`) — wrapped in a `cu-card` (`.tactics-card`) with a
>   "MATCH TACTICS" header label for hierarchy. All 5 button ids (`tac-aggro`/`tac-balanced`/
>   `tac-defense`/`boost-btn`/`drs-btn`/`impact-btn`) and the click-to-activate mechanism are untouched
>   — `#tac-aggro`/`.active` (test-referenced, `comprehensive.spec.js:515-516`) confirmed intact.
>
> **New, real-data-backed addition:**
> - **Chase-context line** ("Need N off M balls") under the score, 2nd innings only. Real-data source:
>   `match.target`, `cRuns`, and `match.ball` (`120 - match.ball` for balls remaining) — the exact same
>   math the game already computes internally for the end-of-over "Need N off M" moment text
>   (`simBall()`, ballInOver===5 block). Updated every ball in `simBall()`, initialized at 2nd-innings
>   start in `switchInnings()`, hidden by default / reset in `startMatch()`. Gated on `match.target > 0`
>   to match the existing convention used by the pre-existing over-summary code (handles the
>   all-out-for-0 edge case the same way the codebase already does).
>
> **Deliberately excluded (flagged, not built):**
> - **Win-probability bar** — no validated win-probability is tracked anywhere; the internal sim math
>   produces per-ball outcome-weighting ratios for RNG purposes only. Presenting that as a stable "Win
>   Prob 64%" would misrepresent an internal RNG knob as a real stat. Excluded entirely.
> - **"Pressure" meter** — no numeric "pressure" stat exists anywhere in the codebase (confirmed via
>   grep — it only appears as flavor-text/CSS class names). Excluded entirely, not even relabeled.
> - **Phase/over-progress pip strip** — the research brief for this pass suggested building one from
>   `match.phase`/`match.phaseScores`, but on inspection the game **already has** a fully-built, richer
>   version of exactly this: `.match-phases` (`#phase-pp`/`#phase-mid`/`#phase-death`, Power/Middle/
>   Death with live scores and fill bars, ~L3294-3297 markup, updated throughout `simBall()`). Building
>   a second one would have been a confusing duplicate — left untouched, not restyled further since it
>   already carries strong visual weight (active/completed states, glass-card framing).
> - **Ticker marquee** — same reasoning as the phase strip: the existing "Key Moments" feed is already
>   richer than a single-line marquee (typed icons, entrance animations, chase-aware commentary). Only
>   its container got more visual weight; no marquee was added.
>
> **Thermal check:** `infinite` 59→59, `backdrop-filter` 22→22, `<canvas>` 2→2 — zero new animations,
> this pass is restyling/reframing already-live real data plus one pure-CSS decorative line/glow (no
> `infinite` keyframe), consistent with the S24 thermal-budget case law.
>
> **Colors/tokens:** every addition reuses existing tokens only (`--gold-bright`, `--hl-rgb`, `--blood`,
> `--slip`, `--white-60`, `--white-20`) — no literal mockup orange/slate values. Angular design rule
> respected — no rounded corners introduced; `.tactics-card` inherits `cu-card`'s existing chamfered
> `clip-path`.
>
> Implementation: `prototype/index.html` only (CSS + markup + `simBall()`/`updateMomentum()`/
> `startMatch()`/`switchInnings()` JS). Zero new `GS`/`match` fields, zero save-format changes, zero
> navigation changes. Not tested in browser (founder-gated) — verified by re-reading every edited
> region for balanced tags/braces and re-grepping all match-related test selectors.

> ### 🏛️ WIDER SCOPE — Hub layout/density pass shipped (2026-08-02, needs testing)
> **First pass under the founder's "update both" scope-widening decision.** The 5 prior cinematic
> passes (Auction/Pack/Hub/Squad/Match) were deliberately narrow — small additive atmosphere layers
> bolted onto the existing layout, explicitly excluding anything that restructured composition. Founder
> compared the live game to `design-lab/bolt-round4/project/public/mockups/hub.html` directly and it
> still doesn't match — the mockup's density/hierarchy/composition was never actually ported, only
> effects were layered on top. This pass ports more of that composition on **Hub** using only real `GS`
> data — still zero new `GS` fields, zero new persisted state, zero navigation changes.
>
> **Ported / restyled (with real-data source):**
> - **Club identity card** — `.hub-header` now also carries `.cu-card` (chamfered glass panel,
>   `padding:14px 16px`), giving the crest/name/power-ring group the boxed hero prominence the
>   mockup's `.club-id` panel has. Zero data change — `#hub-crest`, `#manager-name`, `#league-label`,
>   `#align-zone-tag`, `#hub-star-pips`, `#hub-power-ring`/`#power-val`/`#power-ring-fill` all untouched
>   (ids, JS bindings, SVG geometry unchanged — confirmed against `tests/p15-visual.spec.js`).
> - **Achievement rail** (`#hub-achieve-rail`, `renderHubAchievements()`) — 6 badges, each a read-only
>   `existing_stat >= threshold` check computed at render time, zero persistence:
>   - "50 Wins" → `GS.wins >= 50`
>   - "Season 3" → `GS.season >= 3`
>   - "Hot Streak" → `GS.bestStreak >= 3` (existing win-streak-milestone stat)
>   - "Fan Favorite" → `GS.fanLoyalty >= 80`
>   - "Clean Run" → `GS.cleanStreak >= 5` (existing clean-streak counter, already shown elsewhere on Hub)
>   - "100 Wins" → `GS.wins >= 100`
> - **Desk row** (`#hub-desk-row`, `renderHubDeskRow()`) — two tiles:
>   - *Squad Strength*: `getTeamStrength()` (same value the power ring shows) + a session-only
>     (non-persisted, resets on reload) delta vs. last render, same client-side-comparison pattern
>     `renderHubMeterTrend()` already uses for Align/Heat/Fans. Below it, a top-3 mini-standings list by
>     `RIVALS[].strength` vs. your real strength — the exact same fields `getEmpireRank()` already uses
>     for the rank shown in `.hub-empire-line` directly above (not the League screen's randomly-simulated
>     win cache, which would have meant duplicating side-effecting logic for this pass). Empty-squad case
>     shows an honest "Build your squad to see standings" message — same case-law as
>     `renderEmpireLine()`'s existing "Unranked" guard (a fake-looking rank with 0 matches played was a
>     prior playtest defect).
>   - *Season Progress*: `GS.matchNum` / 14 and `GS.wins`/`GS.losses` — the exact same fields and 14-match
>     total already used by the existing (drawer-buried) "Season Progress" panel; this just surfaces the
>     same real numbers more prominently in the main flow. The original panel is untouched inside
>     Drawer: Club Management.
> - **Manager's Ledger** (`#hub-ledger`, `renderHubLedger()`) — underworld data surfaced out of the
>   collapsed drawer into the main flow, all from `getFactionRows()`'s existing backing fields:
>   - Favors = `GS.factions.syndicate.favorsDone + .neta.favorsDone + .bhai.favorsDone` (real, summed)
>   - Risk = `GS.heat` banded Low/Medium/High/Critical using the exact same 26/51/76 thresholds
>     `updateHub()` already uses to color the Heat meter
>   - Rep = `getAlignmentZone(GS.alignment).name` — same function that drives `#align-zone-tag`
>   - Owed = `GS.debts.length`
>   - Debt line = first real `GS.debts[0]` entry (source/principal/matchesLeft, same fields the existing
>     `#debt-panel` renders) — if no debts, an honest "No outstanding debts" empty state, never a
>     fabricated NPC name/amount.
>
> **Deliberately excluded (flagged for founder, not guessed at):**
> - **XP/level bar** (mockup's "7,200/10,000 XP, Lvl 15" under the club name) — no player/club
>   level or XP system exists anywhere in `GS` (confirmed via grep: no `GS.xp`, `GS.level`). Dropped
>   entirely per the brief's stated preference, rather than repurposing the slot for something that would
>   read as fake.
> - **Hero fan-count reformat** ("1.2M FANS +4.2K") — `GS.fanLoyalty` is a 0-100 loyalty score, not an
>   absolute fan count; converting it to a fabricated "1.2M" via an invented multiplier would misrepresent
>   real data. Fans stays in the existing `.hub-meters` strip, value/trend unchanged.
> - **Match-hero form line** (W/W/L/W/N) and **win-odds %** on the battle card — no per-rival sequential
>   match-history is tracked in an easily-readable form; the only "win chance" formula in the codebase
>   (`simKnockoutMatch`'s `str/(str+str)`) belongs to a different subsystem (off-screen knockout bracket
>   sim) and isn't a stat the game surfaces to players elsewhere, so introducing it here would be a new
>   derived metric, not a restyle of an existing one. Left `.hub-battle-card`/`#hub-next-rival` as-is.
> - **League-table-based mini-standings** (wins/pts, matching `#league-screen` exactly) — considered, but
>   `updateLeagueTable()`'s rival win-counts come from a randomly-simulated cache (`GS.rivalWins`) that's
>   lazily populated with side effects; reusing it from Hub would mean either duplicating that
>   side-effecting logic or triggering it as an unrelated side effect of opening Hub. Used the
>   strength-based standings (`RIVALS[].strength`, already real and side-effect-free, same fields
>   `getEmpireRank()` uses) instead — see Desk Row above.
>
> **Verification (testing is founder-gated, not run):** thermal counts unchanged before/after —
> `infinite` 59→59, `backdrop-filter` 22→22, `<canvas` 2→2 (net-zero new animation loops; the one CSS
> transition added — `.hd-prog-fill` — is a one-shot width transition, not a loop). Re-grepped every
> selector `tests/*.spec.js` asserts on `#hub-screen`/`hub-crest`/`manager-name`/`hub-meters`/
> `hub-empire-line`/`action-tile`/`hub-battle-card`/`hub-login-panel`/`quick-tile`/`drawer-rewards` —
> all present, unchanged markup shape. `#hub-screen`'s `hubMesh` background animation (asserted by
> `p15-visual.spec.js`) untouched. Angular clip-path convention followed throughout (`--clip-10`/
> `--clip-6` on new chips, no `border-radius` introduced).

> ### 🎬 WIDER SCOPE — Squad shipped (2026-08-02, needs testing)
> Second screen under the WIDER-SCOPE label (after Hub, running in parallel in a separate worktree) —
> unlike the 5 narrow "atmosphere-only" passes (Auction `0d03562`, Pack `0480e43`, Hub `3528e59`, Squad
> `062d38c`, Match `8951416`), this pass may reshape HOW existing `GS` data is displayed (layout, density,
> hierarchy, card treatment) to close the gap with `mockups/squad.html`'s composition — but still zero new
> `GS` state, zero new persisted state, zero new nav beyond one explicitly-scoped CTA (below).
>
> **Ported/restyled (all real-data sources):**
> 1. **`.team-stats-row` hero numbers** — bumped `ts-val` to 32px and added a per-stat `text-shadow` glow
>    reusing the SAME rgba tuples already used by each tile's own `::after` radial wash (green/gold/blue/
>    amber for Batting/Bowling/Overall/Morale). Source: `GS.squad` batting/bowling averages, `getTeamStrength()`,
>    `GS.morale` — all pre-existing, unchanged reads.
> 2. **`.squad-morale-bar`** — bigger `morale-val` (22px + glow) and a taller track (7px) with a shimmer
>    sweep (`::after`, reusing the existing shared `shimmer` keyframe) over the fill. Mirrors the mockup's
>    `.chem-bar` role using REAL `GS.morale` data — see explicit exclusion below for why this is NOT a
>    "chemistry" stat.
> 3. **`.squad-role-group` headers** — added a static count chip (`.sq-role-count`, real `players.length`
>    for that already-computed role group) next to each `cu-ribbon` label, closer to the mockup's filter-row
>    feel without adding click-to-filter behavior.
> 4. **`.player-card-mini` rarity accent** — extended the SAME `RARITY_COLORS`/`RARITY_GLOW` tokens
>    `renderPlayerCard()` already uses for the big Cards-screen card (ovr-badge/rarity-strip) onto the
>    roster's compact mini-card: a thin top accent line in the rarity color for all tiers, a stronger
>    static glow for epic, and an animated glow for legendary using ONE shared keyframe (`sqMiniRarityPulse`,
>    parameterized by the per-card `--rarity-glow` custom property) — not a unique keyframe per card.
>    `renderPlayerMini()` now sets `--rarity-color`/`--rarity-glow` inline, same pattern as `renderPlayerCard()`.
>
> **Filters decision — excluded (deliberate).** The mockup's `.filters` row (All/Batsmen/Bowlers/All-rounders/
> Keepers clickable tabs) was NOT implemented as interactive. The real Squad screen has no toggle state to
> back it, and wiring click-to-filter (even reusing the Cards-screen `.card-filter` pattern, which touches
> no `GS`) would still be a new interactive capability the screen doesn't have today. Kept the existing
> always-grouped 3-section display (Batters/All-Rounders/Bowlers), just gave the section headers a count
> chip (item 3 above) so they read more intentionally. No exception taken here.
>
> **Persistent CTA decision — included.** Added `#squad-fill-cta`, a bottom CTA shown whenever
> `0 < GS.squad.length < GS.maxSquad` (both pre-existing, already-read fields), with real remaining-slot
> count ("Fill N empty slots"). Reuses the EXACT SAME action as the existing empty-state
> `#squad-go-auction` handler (`goScreen('auction'); if (!auction.active) startAuction();`) — not a new nav
> target. Hidden when squad is empty (existing `#squad-empty` CTA already covers that case, no double CTA)
> and hidden when the squad is full (15/15, nothing to fill).
>
> **Deliberately excluded (and why):**
> - **"Chemistry" stat** — the mockup shows a `Chemistry %` hero number + `.chem-bar`. Grepped `GS` for
>   `chemistry`/`GS.chem`: zero matches. There is no such stat in this game. Did NOT invent one and did NOT
>   relabel `GS.morale` as chemistry — that would misrepresent what the real number means to the player.
>   `GS.morale` already gets its own real bar (item 2 above).
> - **"Mythic" rarity tier** — `RARITIES` is `['common','uncommon','rare','epic','legendary']`; mythic
>   doesn't exist in this game's rarity system. Not added.
> - **Grid-conversion of the roster** — the mockup's big 3-column card grid is confirmed (from the earlier
>   narrow Squad pass) to map to `#cards-screen` (the Cards/Collection tab), a deliberately different IA
>   surface from the Squad roster's compact list. Kept `.player-card-mini`'s list/row layout; did not touch
>   `#cards-screen`/`renderPlayerCard`/`.player-card`.
> - **Interactive filter tabs** — see Filters decision above.
>
> **Thermal check:** `infinite` 59→61 (+2: one shared shimmer sweep on the single `.morale-fill` element,
> one shared `sqMiniRarityPulse` keyframe gated to the legendary tier only — never per-card unique
> keyframes). `backdrop-filter` 22→22, `canvas` 18→18 — unchanged.
>
> **Test selectors reconfirmed unaffected:** `#squad-screen.active` (nav tests), `.player-card-mini` count
> (`comprehensive.spec.js:217` expects 11 — unchanged, only added classes/inline custom-properties to
> existing elements, no elements added/removed), `#squad-screen` `.active` class (`features-10k.spec.js:440`),
> `squad-count`/`squad-morale-bar`/`squad-go-auction`/`squad-role-group` ids/classes all preserved as-is.
>
> Files: `prototype/index.html` only. Commit: see git log. Founder-gated: not run via Playwright this
> session — needs testing.

> ### 🔄 ANON NETLIFY DEMO RE-SYNCED AGAIN (2026-08-02, no game code changed)
> Founder: "resync" (part of a two-part "update both" instruction — see the scope-widening entry
> directly below for the other half). Closes the gap opened by the Match cinematic pass (`8951416`).
> - Only `index.html` had drifted (773,696 → 775,665 bytes); all other staged assets confirmed
>   byte-identical.
> - Re-verified zero personal-identity strings in the copy.
> - **NOT done (founder step, ~2 min):** re-drag `_deploy-anon/` onto Netlify Drop.
> - Founder separately confirmed (via zip-comparison this session) that `design-lab/bolt-round4/` —
>   the source for all 5 cinematic passes so far — is genuinely the design target he's judging the live
>   game against, and that the live game correctly does NOT yet match its fuller composition (achievement
>   rail, chemistry cards, momentum meters, LED tickers, etc. were deliberately excluded from every pass
>   so far as feature-inventing/system-rewriting). Direction for what happens next is in the entry below.

> ### 🎬 CINEMATIC DIRECTION PASS — Match shipped (2026-08-02, needs testing)
> Fifth screen in the direction pass, after Auction (`0d03562`), Pack (`0480e43`), Hub (`3528e59`), Squad
> (`062d38c`) — same hard rules: **no logic changes, no removed features, no rewritten systems, no
> navigation changes, no regressions**, presentation/atmosphere only.
>
> **Inventory first, build second.** Match already had the most built of any screen so far: its own
> animated mesh-gradient background (`matchMesh`, 18s loop, untouched), and a full ball-outcome
> celebration system — `spawnCelebration()` (canvas particle burst), `flashOutcome()` (sets
> `#outcome-flash`'s className to `six`/`four`/`wicket`, which drives an existing CSS radial-gradient
> flash via `outcomeBurst`), and `screenShake()` (reserved for match losses, not touched/extended here).
> All three fire from the existing `if (!match.skipMode) {...}` guard at the six/four/wicket call sites
> (~L8764-8766) — confirmed untouched. The real gap: no big dramatic TEXT moment (a "SIX!"/"FOUR!"/"OUT!"
> slam), the natural Match-screen equivalent of Auction's SOLD stamp.
>
> **Implementation — zero JS added.** Because `flashOutcome(type)` already sets `#outcome-flash`'s
> className to exactly `six`/`four`/`wicket` on every real event (and nothing else touches that
> className), the text-slam is a pure CSS `::after` keyed off those same existing classes —
> `#outcome-flash.six::after{content:'SIX!';...}` etc. — each with its own one-shot slam-in keyframe
> (`outcomeTextSlam`: scale 0.55→1.12→1, opacity 0→1→0, forwards fill-mode, no loop). Added
> `display:flex;align-items:center;justify-content:center` to the base `#outcome-flash` rule so the
> pseudo-element centers in the full-viewport stage — the div has no children (confirmed via grep), so
> this is a no-op for `.win`/`.loss`, which get no `::after` content and render nothing extra.
> - **Colors:** literal `rgb()` triples copied exactly from the `.six`/`.four`/`.wicket` flash gradients
>   directly above (255,207,68 gold / 34,211,153 teal / 239,45,45 red) — checked the closest design
>   tokens (`--gold-bright #FFD23F`, `--green-bright #34D399`) and they're close-but-not-exact, so literal
>   reuse was chosen to keep flash+text perfectly color-matched rather than introduce a subtle mismatch.
>   Zero new custom properties.
> - **Type:** `var(--font-d)` (Teko), 76px for SIX!/OUT!, 68px for FOUR! (longer word), 5-6px
>   letter-spacing — checked against the existing scoreboard `.score` (56px, up to 5 chars like "120/4")
>   and sized up since these strings are shorter (4-5 chars) and rarer/more dramatic; confirmed no
>   wrap/clip risk at 390px width.
> - Verified before/after grep counts identical: `infinite` 59→59, `backdrop-filter` 22→22,
>   `requestAnimationFrame|<canvas` 8→8 (the raw count did transiently read 60 because a code-comment's
>   own prose contained the word "infinite" — reworded the comment so the count reflects real animations,
>   not prose false-positives).
>
> **Deliberately excluded (per brief):** momentum/win-probability meter (no backing `GS` state — would be
> inventing a feature), a redundant edge-flash box-shadow layer (the radial flash already does this),
> DOM confetti (canvas `spawnCelebration` already does this), an LED "MAXIMUM" flash bar (a second
> competing text element would be noise, not polish), stadium crowd ambience (mesh background already
> covers per-screen atmosphere; no reason to duplicate Hub's crowd-band here), restructuring
> `.match-tactics` into a mockup grid shape (real AGGRO/BALANCED/DEFENSE/DRS/IMPACT buttons are wired to
> real `GS` state, untouched), screen-shake on every six/four/wicket (reserved for losses; adding it to
> frequent in-match events risks feeling repetitive — left for the founder to request explicitly), and a
> text-slam for `win`/`loss` (those belong to the Post-Match/Victory screen, the next item in the queue,
> not live-simulation Match).
>
> Needs testing (Playwright is founder-gated, not run this session).

> ### 🔄 ANON NETLIFY DEMO RE-SYNCED AGAIN (2026-08-02, no game code changed)
> Founder: "resync the anon demo too" — closes the gap opened by the Squad cinematic pass (`062d38c`:
> header-zone light beams + ambient motes).
> - Diffed each staged asset against the live source: only `index.html` had drifted (771,196 → 773,696
>   bytes, the Squad pass's +2,500 bytes); `manifest.json`/`sw.js`/`icon.svg`/`icon-192.png`/
>   `icon-512.png`/`pitch.html` all still byte-identical, untouched.
> - Re-verified the anonymity invariant on the copy: grep -i "chandu|yeswanth|@gmail|chandu45-droid" —
>   zero matches.
> - **NOT done (founder step, ~2 min):** re-drag `_deploy-anon/` onto Netlify Drop. Until then
>   `cricket-underworld.netlify.app` still serves the pre-Squad-pass snapshot.
> - Same as every prior re-sync: none of the four cinematic passes (auction, pack, hub, squad) have been
>   seen in a real browser yet — founder-gated testing still owed on all four.

> ### 🎬 CINEMATIC DIRECTION PASS — Squad shipped (2026-08-02, needs testing)
> Fourth screen in the direction pass, after Auction (`0d03562`), Pack (`0480e43`), Hub (`3528e59`) — same
> hard rules: **no logic changes, no removed features, no rewritten systems, no navigation changes, no
> regressions**, presentation/atmosphere only.
>
> **Inventory first, build second.** Unlike Hub, Squad already had most of the design system's "spotlight
> grading" built: `#squad-screen`'s animated `squadMesh` mesh-gradient background (15s loop, untouched),
> and a rarity-tiered player-card system (`RARITY_COLORS`, holo-sheen legendary cards, hex `.ovr-badge`)
> that's already more developed than the design-lab mockup's version — including a mockup-invented
> "mythic" tier the real game's data doesn't have, correctly never added anywhere. The real gap (confirmed
> by grep — no beam/particle/light-sweep classes existed near squad) was atmosphere in the header zone,
> analogous to what Hub's floodlights/embers added there.
>
> Design source was `design-lab/bolt-round4/project/public/mockups/squad.html` — read in full for its
> `.atmosphere`/`.particles` beam-sweep + float-up CSS technique only. **Deliberately NOT ported**: its
> `.summary` card (Squad OVR/Chemistry/Roster + a chemistry bar — "chemistry" isn't a real game mechanic),
> its `.filters` row (All/Batsmen/Bowlers/etc — no such filter exists in `updateSquadScreen()`), its 5-tier
> rarity card grid (incl. the invented "mythic" tier), its CTA button, its orange/slate palette, and its
> nav chrome. **IA distinction confirmed:** the mockup's big rarity-card grid actually corresponds to this
> game's `#cards-screen` (a different screen, out of scope), not `#squad-screen` — which is the
> roster/team-management view using compact `.player-card-mini` rows, untouched here.
> - **2-3 sweeping light beams** — new `.squad-atmosphere .sq-beam` divs, opacity-oscillating via one
>   shared `sqBeamSweep` keyframe with `animation-delay` variance per beam (same technique as Hub's
>   floodlight flicker) — `transform`/`opacity` only.
> - **3 ambient motes** — `.squad-atmosphere .sq-motes span`, same visual language as Hub's `.hub-embers`
>   (gold dot, `box-shadow` glow, opacity+`translateY` drift) on one shared `sqMoteDrift` keyframe, for
>   consistency across screens.
> - **Structural gotcha handled:** `#squad-screen` is both the screen wrapper AND its own scroll container
>   (`.screen{position:absolute;overflow-y:auto}`), unlike the mockup's separate fixed body + scrolling
>   `<main>`. So the new atmosphere layer is confined to a `height:200px` box covering just the header zone
>   (`.squad-header` + `.team-stats-row` + `.squad-morale-bar`) rather than spanning the full screen — it
>   scrolls away with the rest of the content once the player scrolls the roster list, same as the header
>   itself, instead of trying to fake a pinned backdrop. `team-stats-row`/`squad-morale-bar` sit on opaque
>   `.cu-card` panels (`--glass-bg` is an opaque gradient, not translucent), so the beams/motes are only
>   visually live in the `.squad-header` strip above them — the extra height below is inert by design, not
>   a bug. `.squad-header` was given `position:relative;z-index:1` (one new declaration) so it paints above
>   the atmosphere layer despite being declared first in the DOM; `team-stats-row`/`squad-morale-bar`
>   already sit above it for free via their existing `.cu-card` `position:relative` + later DOM order.
>
> **Thermal counts (S24 case law):** `infinite` 57→59 (+2 — `sqBeamSweep`, `sqMoteDrift`, each a single
> shared keyframe reused across elements via `animation-delay`, not one keyframe per element). well within
> the low-single-digit budget. `backdrop-filter` 22→22 (+0). `requestAnimationFrame`/`<canvas>` 8→8 (+0,
> untouched). Every new animation is `opacity`/`transform` only. `--gold-bright` confirmed defined in both
> `:root` and `html[data-theme="light"]` before use; no new custom properties invented. The existing global
> `@media (prefers-reduced-motion: reduce)` rule (universal `*,*::before,*::after` selector) automatically
> covers the new elements — no new per-element overrides added.
>
> **Zero JS touched.** Pure CSS (`prototype/index.html` ~L1206-1229) + 5 new static decorative `<div>`s
> (~L3311-3316), same class of change as the Hub pass. No existing `id` changed, no `updateSquadScreen()`/
> `renderPlayerMini()` logic touched, no `GS` state read/written, `.player-card-mini` markup/classes
> untouched (test-referenced: `tests/comprehensive.spec.js:217` counts these elements). Test-referenced
> `#squad-screen.active` (`comprehensive.spec.js:192,205`, `features-10k.spec.js:440`) — whatever produces
> that class toggle is untouched (zero JS).
>
> **Unseen in browser — testing is founder-gated per project CLAUDE.md.** Verified by reading code only:
> HTML nesting checked (new `.squad-atmosphere` block closes cleanly, `.squad-header` unaffected), CSS
> braces balanced, grep counts re-run post-edit.

> ### 🔄 ANON NETLIFY DEMO RE-SYNCED AGAIN (2026-08-02, no game code changed)
> Founder: "resync the anon demo too" — closes the gap opened by the Hub cinematic pass (`3528e59`:
> floodlight flicker, crowd band, embers, LED ticker).
> - Diffed each staged asset against the live source: only `index.html` had drifted (766,900 → 771,196
>   bytes, the Hub pass's +4,296 bytes); `manifest.json`/`sw.js`/`icon.svg`/`icon-192.png`/`icon-512.png`/
>   `pitch.html` all still byte-identical, untouched.
> - Re-verified the anonymity invariant on the copy: grep -i "chandu|yeswanth|@gmail|chandu45-droid" —
>   zero matches. (A broader sanity grep for the bare word "github" turned up one hit — a code COMMENT in
>   the analytics-setup instructions, "GitHub Pages redeploys..." — a generic platform-name reference, not
>   a personal identifier; confirmed not a leak, left as-is.)
> - **NOT done (founder step, ~2 min, cannot be done by an agent):** re-drag `_deploy-anon/` onto Netlify
>   Drop. Until then `cricket-underworld.netlify.app` still serves the pre-Hub-pass snapshot — the crowd
>   band / ticker / floodlight flicker are not visible there yet.
> - Same as every prior re-sync: neither this pass nor the two before it (auction, pack) have been seen in
>   a real browser — founder-gated testing still owed on all three.

> ### 🎬 CINEMATIC DIRECTION PASS — Hub shipped LIVE (2026-08-02)
> Third screen in the direction pass, after Auction (`0d03562`) and Pack (`0480e43`) — same hard rules:
> **no logic changes, no removed features, no rewritten systems, no navigation changes, no regressions**,
> presentation/atmosphere only. Hub is the highest-priority screen (first thing every player and every
> prospective buyer sees), so this closes the "first impression" gap flagged in the earlier entry.
>
> Design source was `design-lab/bolt-round4/project/public/mockups/hub.html`, an AI concept mockup — read
> in full, but **deliberately NOT ported wholesale**: it's a from-scratch reimagining with features the
> real game has no backing logic for (achievement rail with unlock badges, an XP progress ring, a
> restructured desk-row and underworld-ledger layout, a CTA button, bottom nav) and a generic
> orange/slate palette that doesn't match this game's gold/blood/ivory-noir design system. **None of that
> was touched.** Only the mockup's genuinely new atmosphere ideas — that the real Hub's existing
> `.hub-stadium-backdrop` (shipped in the P2 Hub redesign, static since) doesn't have — were built,
> reimplemented with the game's own CSS tokens (`--gold-bright`, `--white`, `--white-40`, `--font-b`,
> `--hl-rgb`, all confirmed defined in both `:root` and `html[data-theme="light"]`):
> - **Floodlight flicker** — the existing 4 `.floodlight` elements (no new elements) now oscillate via one
>   shared `floodlightFlicker` keyframe; a `--fl-peak` custom property per element keeps the two dimmer
>   rear lights dimmer instead of the animation flattening all 4 to the same brightness.
> - **Crowd silhouette** — one static `.hub-crowd-band` div, a CSS dot-pattern (`radial-gradient` +
>   `background-size`) faded in with a `mask-image`, zero animation, zero extra DOM — explicitly NOT the
>   mockup's 45 individually-animated divs (thermal budget).
> - **Ambient embers** — 3 small dots (`.hub-embers span`) drifting opacity+`translateY` on one shared
>   keyframe (`hubEmberDrift`), within the "2-4 particles" ceiling.
> - **LED news ticker** — `.hub-news-ticker`, a `translateX` marquee of static in-world flavor lines
>   (syndicate/auction/black-market themed — NOT the mockup's placeholder team names), `aria-hidden` since
>   the list is duplicated for a seamless loop. Landed as a real flex child appended AFTER `.hub-meters`
>   (confirmed by reading the layout: `.hub-stadium-backdrop` is `flex-direction:column`, and its content
>   already exceeds `min-height:148px`) — NOT `position:absolute;bottom:0`, so it doesn't render behind the
>   opaque `.hub-meters` panel.
> - **Fireworks / waving flags** — skipped. Budget stayed tight enough after the 4 items above that adding
>   them wasn't needed; they were explicitly lowest-priority/cut-first in the brief.
> - **Stadium entrance fade** — skipped entirely, on purpose. The game already has its own verified-clean
>   fresh-install splash/reel sequence (see the "LOOK L5" entry); a second competing full-screen fade on
>   Hub risked a regression there.
>
> **Thermal counts (S24 case law):** `infinite` 54→57 (+3 — floodlight flicker, embers, ticker; each a
> single shared keyframe reused across elements via `animation-delay`, not one keyframe per element).
> `backdrop-filter` 22→22 (+0). `requestAnimationFrame`/`<canvas>` 8→8 (+0, untouched). Every new animation
> is `opacity`/`transform` only. The existing global `@media (prefers-reduced-motion: reduce)` rule (a
> universal `*,*::before,*::after` selector) automatically covers all new elements — no new per-element
> reduced-motion overrides were needed or added.
>
> **Zero JS touched** — confirmed via diff (no `function`/`addEventListener`/`<script>` lines added). Pure
> CSS + static decorative markup, same class as the Pack pass. No existing element's `id` changed, no
> `updateHub()` logic touched, no GS state read/written. Test-referenced selectors confirmed untouched:
> `#hub-screen`, `#hub-crest`, `.hub-battle-card`, `.action-tile`, `#hub-screen.active`, and specifically
> the `#hub-screen` `hubMesh` keyframe/animation (`p15-visual.spec.js:267` asserts its computed
> `animationName`) — not modified.
>
> **Unseen in browser — testing is founder-gated per project CLAUDE.md.** Verified by reading code only:
> markup nesting checked (`.hub-stadium-backdrop` still closes cleanly after the new ticker), CSS braces
> balanced, all new custom properties/tokens confirmed defined in both theme scopes before use. Needs a
> real-device pass before calling it done.

> ### 🔒 PITCH.HTML MIRRORED TO THE ANONYMOUS HOST (2026-08-02)
> Founder: "mirror pitch.html to the anonymous host too" — closes the gap flagged right after the email-fix
> above (content was clean, but the URL still carried the personal GitHub handle).
> - Grepped `pitch.html` for chandu/yeswanth/@gmail/chandu45-droid/github first — zero matches (the only
>   leak was the already-fixed footer email). Its one external link was already the anon Netlify demo
>   (`https://cricket-underworld.netlify.app/`), set in the earlier 2026-08-02 demo-link swap.
> - Copied `pitch.html` into `_deploy-anon/` (the same gitignored staging folder as `index.html`) —
>   re-verified zero identity strings in the copy too. No new assets needed (file has no `src=` refs).
> - Updated the two outbound pitch links in `outreach.md` (WhatsApp/DM template line 9, email template
>   line 26) from the identifying `chandu45-droid.github.io/cricket-underworld/pitch.html` to
>   `https://cricket-underworld.netlify.app/pitch.html` — these are the actual copy-paste templates the
>   founder sends to prospects, so this was the live leak surface, not just pitch.html's own content.
> - Checked every other doc referencing `pitch.html` (`docs/demo/README.md`, `BUILD-SHEET-10K.md`) —
>   filename mentions only, no identifying URLs. `PROGRESS.md`'s own historical entries left untouched
>   (append-only rule — those describe what was true at the time).
> - **NOT done (founder step, same ~2 min Netlify Drop as the demo re-sync above):** re-drag
>   `_deploy-anon/` (now containing `index.html` + `pitch.html` + assets) onto Netlify Drop. Once live,
>   `pitch.html` is reachable with zero identity trace end-to-end — URL, links, and content all clean.
> - The old identifying `pitch.html` at `chandu45-droid.github.io/cricket-underworld/pitch.html` still
>   exists too (repo's Pages auto-serves it from master) — it just isn't linked from any outbound template
>   anymore. Founder call whether that old copy matters (fine for warm/known contacts per the earlier note).

> ### 🔒 PITCH.HTML EMAIL LEAK FIXED (2026-08-02)
> Founder: "fix the pitch.html email leak." The footer's `mailto:chanduyeswanth45@gmail.com` (flagged
> twice, unresolved since the 2026-08-02 anon-sale-listing prep) has been removed. Grepped the whole file
> for gmail/mailto/chanduyeswanth first — that footer line was the ONLY occurrence, nothing else leaked.
> Replaced with neutral copy consistent with the plan already documented in `outreach.md` ("Contact
> happens through the marketplace's own messaging only... a fresh contact email set up once a real buyer
> is confirmed") — footer now reads "Serious inquiries via the listing platform" instead of exposing a
> personal address.
> - **Not addressed by this fix (separate, pre-existing issue, still true):** `pitch.html` itself is still
>   hosted only at the identifying `chandu45-droid.github.io` GitHub Pages URL, not mirrored to the
>   anonymous Netlify host — so the file's URL still carries the personal GitHub handle even though its
>   *content* is now clean. Per the 2026-08-02 anon-sale-listing entry's own options: keep `pitch.html`
>   for warm/known contacts only and do not post its link on the cold marketplace listing, unless/until
>   it's mirrored anonymously too.

> ### 🔄 ANON NETLIFY DEMO RE-SYNCED (2026-08-02, no game code changed)
> Resumed session; founder chose "redeploy stale Netlify demo" from the open-threads list. `_deploy-anon/`
> (the gitignored staging folder for `cricket-underworld.netlify.app`) was a manual snapshot from earlier
> the same day (12:50) — stale against everything shipped since: auction SOLD-payoff/bid-punch (`0d03562`),
> pack cinematic pass (`0480e43`), the critical save-loss fix (`1553c95`), analytics instrumentation
> (`6849120`), and the full plot-spine/Reckoning-climax work.
> - Diffed each staged asset against `prototype/`: only `index.html` had drifted (746,368 → 766,900 bytes);
>   `manifest.json`/`sw.js`/`icon.svg`/`icon-192.png`/`icon-512.png` byte-identical, left untouched.
> - Re-verified the anonymity invariant before copying: grep -i "chandu|yeswanth|@gmail|chandu45-droid"
>   against `prototype/index.html` — zero matches, same as the original prep. Copied, re-verified the copy
>   — still zero matches.
> - Confirmed all asset refs in the copied file are relative (`icon.svg`, `icon-192.png`, `manifest.json`,
>   Google Fonts) — safe for a Netlify Drop root deploy, same structure as the working live demo.
> - **NOT done (founder step, ~2 min, cannot be done by an agent):** re-drag `_deploy-anon/` onto
>   Netlify Drop to push the refresh live. Until then `cricket-underworld.netlify.app` still serves the
>   12:50 snapshot — buyers evaluating it right now still see the pre-cinematic build.
> - **Also still open from the same thread (not actioned this pass, founder chose Netlify sync only):**
>   `pitch.html` footer still shows the real email (flagged twice, see the Aug 2 anon-sale-listing entry
>   below); neither cinematic pass has been seen in a browser (founder-gated testing).

> ### 🎬 CINEMATIC DIRECTION PASS — auction + pack shipped LIVE (2026-08-02, `0d03562` + `0480e43`)
> Founder issued a product-vision update: Cricket Underworld is "a high-stakes underground cricket
> universe," not a cricket app. Explicit hard rules: **no logic changes, no removed features, no
> rewritten systems, no navigation changes, no regressions** — presentation/atmosphere only, one screen
> at a time, verify between each. Design source: a bolt.new export (5 zips iterated same day; used the
> newest, 13:03) extracted to `design-lab/bolt-round4/` (12 plain-HTML mockups: 5 hub variants + auction,
> match, postmatch, squad, player, pack, deals).
>
> **Font policy — founder DECIDED: substitute already-loaded fonts** (over loading new ones / partial
> load / build-both-and-compare). Turned out to be moot for the developed mockups: `hub.html`, `auction`,
> `match`, `pack` in round-4 already use **Teko + Rajdhani only** — the two fonts the game loads — so the
> port costs **zero network bytes** and does not reopen the ratified 2026-07-11 L3 ruling (Space Grotesk +
> Cinzel stay cut for the ~100-150KB India budget). **The `hub-a/b/c/d` variants are the outlier** — they
> introduce Fraunces/Space Grotesk/DM Sans/Space Mono/Archivo/Inter/Instrument Serif/Sora and would each
> reopen that ruling; Hub A literally uses the exact font that was cut. Treat A/B/C/D as superseded
> exploration unless the founder explicitly revives one.
>
> **Thermal pre-check (S24 case law) — the vision LOOKED dangerous and wasn't.** "Particles, smoke, fog,
> floodlights, camera flashes" reads like a replay of the S24 overheat (always-on rAF canvas loop + 21
> backdrop-filters + 52 infinite anims). Audited the mockups BEFORE briefing any build: **0 `<canvas>`,
> 0 `requestAnimationFrame`** across all of them — the cinematic look is achieved with CSS gradients and
> shadows, not particle systems. So this direction is thermally *safer* than what already ships. The one
> real risk was the mockups' 10-17 infinite animations each; both builds were instructed to convert
> ambient loops into one-shot `forwards` animations, and both landed at **net zero increase**.
>
> - **AUCTION (`0d03562`)** — founder's named "signature feature." Added: **SOLD payoff** (stamp-slam +
>   hammer strike + one-shot confetti + camera flash; gold when you win, crimson when a rival takes the
>   lot) and **bid punch** (one-shot hit on `#current-bid`, fires on your bids AND the AI's).
>   `aiBid`/`placeBid`/`resolveCard` each got exactly ONE appended call — verified the deleted lines were
>   re-added verbatim with `flashBid()` appended, not rewritten. Counts: infinite 52→52, backdrop 21→22
>   (one transient ~1.1s overlay, blur ≤10px). All 6 test-referenced auction ids intact.
> - **PACK (`0480e43`)** — added `packSurge` lighting flash, two smoke wisps (used `filter:blur()` NOT
>   `backdrop-filter` — cheaper, samples only the element), **`epicSpot`** (epic pulls previously had NO
>   unique visual beyond spark count), a scale-pop on `legendarySpot` so legendary reads bigger not just
>   brighter, and a collection-update settle beat. **Zero JS touched** — `openPack()` draw/odds/currency/
>   guaranteed-floor byte-for-byte unchanged, so published gacha odds stay truthful (Play compliance line).
>   Independently re-counted: infinite 54→54, backdrop 35→35, rAF/canvas +0.
>
> **FINDING WORTH ACTING ON — most requested beats ALREADY EXISTED.** Auction: countdown pressure
> (`timer-bar-fill.warn/.danger`, `#bid-btn.urgency`) and player entrance/spotlight (`cardEnter`,
> `spotlight-rays`) were already shipped from the v3-kit pass — verified intact, deliberately NOT rebuilt.
> Pack: `packBurst`, `revealRing`, `legendarySpot`, `sparkFly` w/ rarity-scaled spark counts (0/5/8/12/18),
> the NEW badge, ambient `packRays` — all already there. **Two screens running, the majority of the vision
> doc's asks were already implemented.** Inference (not yet acted on): the perceived gap is probably NOT
> missing effects but the FIRST IMPRESSION — i.e. the hub, the one screen untouched. The founder's own
> success criterion ("open it and immediately think: this doesn't feel like a cricket app") is a hub test.
> **Recommended next pass = hub, not another effects screen.**
>
> **Stale doc corrected:** CODEBASE-MAP warned `#pack-overlay` shares `.match-result-overlay` with
> `#match-result` (a CSS change would have silently restyled match results). A prior pass had ALREADY
> split it to `.pack-open-overlay`; the map note was stale and is now fixed. The warning still earned its
> place — it cost nothing and improved the doc.
>
> **BLOCKED / OUTSTANDING:**
> - **`image.png`** — founder answered the hub-direction question with "I added public/mockups/image.png",
>   but it exists ONLY in bolt's online workspace: not in any of the 5 exported zips, not anywhere on disk
>   (filesystem search). Cannot be used until pasted into chat. Hub work is blocked on it (or on picking
>   `hub.html`, the developed one with correct fonts).
> - **Netlify demo is STALE for buyers.** `cricket-underworld.netlify.app` (the de-identified sale listing
>   demo) is a MANUAL Netlify-Drop snapshot from a gitignored `_deploy-anon/` folder — it is NOT wired to
>   master. It currently lacks BOTH cinematic passes. **Every future master push auto-deploys GitHub Pages
>   but NOT Netlify** — two targets that silently drift while the asset is being shopped to buyers.
> - **Neither pass has been seen in a browser** (founder-gated testing). Nobody has watched the SOLD stamp
>   or the pack surge actually fire, in either theme.
> - Open design call: SOLD stamp fires only when `auction.bidder` is truthy — suppressed on a
>   zero-bid expiry. Founder may want an "UNSOLD" beat instead.

> ### 📌 ANONYMOUS SALE LISTING PREP — demo link swapped to a de-identified host, all outward-facing docs updated (2026-08-02)
> Founder is prepping to sell the project (asset flip, ~$1,200–1,500 asking) via SideProjectors and wants
> zero personal identity exposed to prospective buyers. Two identity leaks existed: (1) the live demo URL
> was `chandu45-droid.github.io/cricket-underworld` — a personal GitHub handle in the URL; (2) `pitch.html`'s
> footer has the founder's real email (`chanduyeswanth45@gmail.com`) — **still unresolved, flagged below.**
>
> **Fixed:** copied just the playable game (`index.html`, `manifest.json`, `sw.js`, icons — verified by grep
> to contain zero personal-name/email strings) into a gitignored `_deploy-anon/` staging folder, founder
> deployed it via Netlify Drop under a neutral site name. Live, verified working end-to-end in a real
> browser (Hub screen renders correctly, meters/tiles/nav all intact, zero console errors) at:
> **`https://cricket-underworld.netlify.app/`**
>
> Swapped the old `chandu45-droid.github.io/cricket-underworld/...` link for the new anonymous one in every
> **outward-facing / current-pointer** doc: `README.md`, `pitch.html` (both CTA buttons), `UI-AUDIT.md`,
> `distribution/DISTRIBUTION-KIT.md`, `docs/bolt-redesign-brief.md`, `outreach.md` (the two playable-demo
> links only).
>
> **Deliberately left unchanged (2 categories):**
> - **This file's own historical log entries** (3 occurrences, e.g. line ~182/221/784 below) — those are
>   dated narrative describing what was true *at the time* (e.g. "confirmed live at chandu45-droid.github.io
>   ... HTTP 200, byte-identical to master HEAD"); rewriting them would falsify the record. Append-only
>   logs don't get retroactively edited — new facts get a new entry, like this one.
> - **`outreach.md`'s two `pitch.html` links** (WhatsApp + email templates) — `pitch.html` itself was never
>   mirrored to the anonymous host, so pointing it at the netlify URL would 404. It still lives at the old
>   identifying GitHub Pages URL.
>
> **Still open (founder decision needed, flagged twice now, not yet actioned):** `pitch.html`'s footer
> (`mailto:chanduyeswanth45@gmail.com`) still shows the founder's real email. If `pitch.html` is ever sent
> to a buyer or posted anywhere public, that leak is live. Options: strip/replace the email, or keep
> `pitch.html` strictly for warm/known contacts (not the cold marketplace listing) and never post its link
> publicly.

> ### 🚨 CRITICAL: SAVE-DATA LOSS FIXED + FOUNDER ANALYTICS WIRED (2026-08-02, `1553c95` + `6849120`, both LIVE)
> Founder: *"i gave to one or two people - problem is when refreshed there progress is getting killed and had to start fresh"*
> and *"me as a founder want to see who logged in and what they tried - how can i see?"*
>
> **1. Save-data destruction — root cause found in code, FIXED, live (`1553c95`).**
> The old `load()` was: `try { hydrateGS(JSON.parse(localStorage.getItem(SAVE_KEY))); } catch(e){ localStorage.removeItem(SAVE_KEY); }`
> — i.e. **any** load error PERMANENTLY DELETED the player's only save. Three confirmed defects:
> - (a) the catch destroyed data outright (corrupt/truncated JSON → save gone, no backup, no warning);
> - (b) `hydrateGS()` returning `false` (its line-3839 shape guard) was **silently ignored** — GS stayed at
>   defaults, player saw a fresh game, and the next `save()` **overwrote their real save with the blank state**.
>   Silent corruption, arguably worse than (a);
> - (c) `save()` swallowed every error, so a QuotaExceeded / blocked-storage failure was invisible — player
>   plays an hour believing it's saved, nothing persists.
> **NOTE — a first hypothesis was WRONG and was discarded before any code changed:** I initially suspected
> `d.squad.forEach` was an unguarded landmine, then read line 3839 and found `Array.isArray(d.squad)` already
> guards it. Evidence-before-diagnosis held; no fix was shipped for the unproven cause.
> **Fix:** `load()` never calls `removeItem` again (only the user-initiated Reset button does, L10324 — verified
> by grep, exactly 1 remaining call site); a failed load preserves the raw string to `cu_save_v3_corrupt` and
> sets `_saveBlocked`, which makes `save()` refuse to overwrite until the player explicitly recovers
> (Backup Code / Cloud Restore clears it) or resets; `save()` now surfaces failure once/session via `toast()`;
> a boot-time `_probeStorage()` write/read/delete test catches blocked storage EARLY and rewrites the existing
> Settings → Cloud Save & Backup note in place. **No save-format or SAVE_KEY change** (existing saves stay valid).
> **ROOT CAUSE OF THE TESTERS' LOSS REMAINS UNPROVEN** — the leading (untested) hypothesis is that the link was
> shared over WhatsApp and in-app browser webviews partition/clear localStorage. The fix is deliberately
> *diagnostic and non-destructive* rather than a bet on one cause.
> **Known residual gap (flagged by the builder, NOT fixed):** storage that *works in-session* but is *evicted
> between sessions* (iOS WebKit ITP-style eviction in some webviews) would pass the boot probe and produce NO
> warning — player still loses data on their next visit. Not speculatively built for; needs real-device evidence.
>
> **2. Analytics instrumented + founder dashboard built, live (`6849120`) — but NOT yet collecting.**
> Root finding: the analytics plumbing already existed and was good, it was just **switched off and under-instrumented**
> — `ANALYTICS_ENDPOINT` was `''` (so nothing ever transmitted) and only 3 events existed
> (`session_start`/`purchase_stub`/`odds_view`), which cannot answer "what did they try."
> Added **13 event call sites**: `screen_view` (from `goScreen`, covers every nav tap), full tutorial funnel
> (`tutorial_started`/`_step`/`_done` vs `_skipped`), auction funnel (`entered`/`first_bid`/`completed`),
> `xi_confirmed`, `match_started`, `season_ended`, `pack_opened`, `store_opened`, and `reckoning_shown` +
> `reckoning_choice` across all 6 climax branches. Extended `analytics/apps-script-sink.gs`'s `doGet()`
> (backward-compatible) to aggregate funnels + up to 200 anonymous device rows, and added a self-contained
> `analytics/dashboard.html` (no build step, no CDN, ₹0). `ANALYTICS_ENDPOINT` is deliberately **still `''`** in
> committed code — purely additive, zero behavior change until the founder switches it on.
> **BLOCKED ON FOUNDER (~5 min, cannot be done by an agent):** deploy the Apps Script, paste the `/exec` URL into
> `ANALYTICS_ENDPOINT`, push. Exact numbered steps in `analytics/README.md`.
> **Expectation set honestly:** "who logged in" can only ever mean **anonymous distinct devices** — there is no
> login system, so no names/emails/IPs, by design and by law. Retroactive data is impossible; collection starts
> only once the endpoint is switched on.
>
> **3. Underworld sequence beats — REVIEWED + MERGED + LIVE (`552120a`).**
> Section 7 of the plot spine ("The Alignment-Branched Telling") was specced but never built: the spine
> only existed at 4 bookend moments (tutorial + 2 promo cards + climax), while the **recurring** events a
> player sees dozens of times were static generic copy. Verified before briefing: hafta was one static
> string (L5686), `CASE_STAGES` 4 bare labels (L4167), `Arvind Patil` appeared exactly ONCE in the file
> (L4100, the data array — zero reactive flavour).
> **Built (all 6 briefed items):** hafta branched on `GS.alignment` + `f.bhai.rel` respect tail · election
> reframed as the first *public* commitment, alignment-branched · rival offer with Rajan-Mehra-specific
> dark-mirror escalation keyed off `GS.league` + alignment (sizing-you-up → "a working arrangement" →
> openly hostile if you are clean) · neta demand branched per demand type · new `caseStageNarration()`
> giving every case stage two alignment-gated framings, narrated with the actually-assigned inspector
> (Sherawat gets his own incorruptible variant) · Patil/Mehra reactive flavour on the existing rival profile.
> **The original builder died mid-verification (API ENOTFOUND) — work was recovered from disk (ground-truth-is-git
> case law) and I completed its unfinished review pass myself before merging**, specifically the reachability
> checks it never reached: `caseStageNarration` confirmed called in 2 real render paths (not dead code);
> `getInspector()` proven null-safe (falls back to `INSPECTORS[0]`, so the new `insp.trait`/`insp.name`
> dereferences cannot throw); `demandDesc` confirmed initialized to `dpick.desc` so the third demand type
> (`fundraiser`) cannot render `undefined`; all 4 event `type:` strings intact so the one coupled test
> (`comprehensive.spec.js:965`, asserts `ev.type==='hafta'` only, never copy) still passes; zero consequence/
> payout logic touched; syntax clean post-merge. Merged with 0 conflict markers, pushed, auto-deployed.
> **NOT done:** no browser/Playwright pass on any of this copy (founder-gated) — it is copy-only over
> unchanged mechanics, but nobody has *seen* these variants render yet.

> ### ✅ RECKONING CLIMAX UPGRADED — real branched choice, not a Dismiss card (2026-08-02, commits `4ee6e8c`+`ceddc85`)
> Founder: *"Upgrade the plot-spine climax"* — the shipped climax (below) was a deliberate thin build,
> prose-only behind one Dismiss button; the three endings *described* costs nothing in code applied.
> Built in a worktree (`cu-wt-climax-choice`), merged clean (0 conflict markers), fast-forwarded to
> master, pushed → **auto-deployed live**.
> - **Design first** (`docs/underworld-plot-spine.md` addendum, `4ee6e8c`): read the game's own
>   established choice-card pattern (hafta/election/rival-offer — real buttons, `.onclick` mutates
>   `GS`, swap-in-place resolution) and speced all 3 branches onto it — exact button ids, exact `GS`
>   deltas, exact resolution copy, a "why balanced" note per branch. Caught a real exploit risk before
>   build: without a guard, relegating out of Champions League and re-promoting would re-fire the
>   climax and let a player farm the accept-button rewards repeatedly (500 blackMoney windfall / debt
>   wipe, over and over). Fixed with one new persisted field, `GS.reckoningResolved` (boolean), gating
>   the trigger — the only new state added, deliberately justified in the doc against the plot spine's
>   own "no new mechanics" rule.
> - **Built by shilpi** (`ceddc85`) exactly to spec: `uwClimaxCard()` now carries real per-branch button
>   configs; new `uwClimaxBeatHtml()` renders them (Act II/III promo beats untouched, still
>   dismiss-only); new `bindUwClimax()` wires all 6 buttons to real deltas via `applyAlignShift()`
>   (never a raw assignment) + `f.syndicate.rel`/`GS.blackMoney`/`GS.debts`/`GS.fanLoyalty`/`GS.heat`;
>   `#season-continue-btn` is disabled/greyed while the climax is unresolved, re-enabled the instant a
>   branch resolves — **the one promo beat in the whole spine that blocks progression**, a deliberate
>   design call (this is "the payoff," a skippable payoff isn't one) with a no-soft-lock guarantee
>   (every branch has a zero-cost resolution path; "Cut Ties" deducts `min(coins,400)`, never a hard
>   gate).
> - **Verified by read, not run** (testing is founder-gated): `node --check` on extracted script
>   blocks clean; every button id greped to exactly 2 occurrences (render + bind, no mismatch); every
>   alignment mutation confirmed routed through `applyAlignShift`; `reckoningResolved` confirmed wired
>   in defaults + `hydrateGS()` + all 6 handlers + both guard sites; Act II/III promo card bodies
>   confirmed byte-identical (diff isolated to the climax path only); zero test-suite coupling found
>   (grepped `tests/*.spec.js` for `uw-promo-beat`/`uwClimaxCard`/`endSeason`/`season-continue-btn` —
>   no matches; all existing assertions target the single-match flow, never the 14-match season-end
>   path) — orchestrator independently re-read the full diff before merging, not just trusted the
>   builder's report (auto-deploy discipline, per the 2026-08-02 `git add`-bundles-dirt case law).
> - **Two flagged judgment calls** (both reasonable, noted for founder awareness): the design doc's
>   own prose briefly said "three buttons" for the undecided "Pick, Now" branch while its own table
>   specified two — builder correctly treated the table as source of truth (2 buttons: "Cut Ties — Go
>   Clean" / "Go All In"), doc's prose left inconsistent, worth a future 1-line fix. Branch 3's
>   button styling wasn't specified in the addendum — builder made "Cut Ties" primary (`btn-gold`),
>   matching the accept/primary-first convention used by every other 2-button choice in the file.
> - **Next (not started):** founder/browser QA pass of all 3 branches at Champions League promotion
>   (needs either a real 3-season playthrough or an injected `GS.league='challenger'`+high win-rate
>   state to trigger `endSeason()` — no shortcut exists yet); full Playwright suite re-run (still
>   167/167 as of the last run, this change added no new test coverage of its own — flagged in the
>   addendum's Edge Cases as a good candidate for a future test pass, now that this card is stateful).

> ### ✅ UNDERWORLD PLOT SPINE SHIPPED + suite-verified (2026-08-02) — 3 surfaces live, 167/167 green
> Founder: *"i feel the main plotpoint of underworld is missing."* Bhairava confirmed by audit — rich
> systems layer (5-faction Power Web, alignment, cases, debt) but ZERO narrative spine; the tutorial was
> a mechanics briefing. game-designer drafted the spine (`docs/underworld-plot-spine.md`, `786b5ec`):
> drama wrapped on EXISTING state, **no new mechanics**. shilpi built it in 3 gated surfaces (Bhairava
> eyeballed each diff before commit); cricket-underworld auto-deploys master→live, so all shipped live:
> - **Surface a+c — inciting incident** (`41f252f`): 6 `TUT_STEPS` bodies rewritten — you INHERITED a
>   club already 30 black money deep from the previous owner's arrangement with Anna Seth; Ruby Mirza
>   makes first contact; Sikandar Bhai named. Every player gets the plot in the first 60s.
> - **Surface b — chapter beats** (`a77bc84`): fire-once, alignment-branched cards hooked into the
>   `endSeason` PROMOTED branch — Act II "The Web" (gully→sma), Act III "The Ledger" (sma→challenger).
>   Additive/non-blocking, reuses `.glass`/`uw-event-card` classes.
> - **Climax — the reckoning** (`3915f76`): 3-way branch at challenger→champions on `GS.alignment` —
>   Burn the Ledger (≥+40), Take the Chair (≤−40, Mehra-contested when `rivalData` rel≥20), Pick, Now
>   (undecided middle). Narrative payoff card, NOT interactive choice-with-consequences (deliberate thin
>   build — flagged as a future upgrade).
> - **Hub premium port** (`18ff9c9`) eyeballed both themes this session → PASS (light-depth bugs fixed,
>   red-hero Match composition, 0 console errors) → **KEPT**.
> - **TEST GATE CLEARED:** full Playwright suite **167/167 green** (9.6m, exit 0). Tutorial tests pass
>   despite the copy rewrite (nothing asserts tutorial copy/count); Theme #124 light-default untouched.
> - Untracked reference artifacts (`design-lab/`, `_scratch/*.png`) left out of the repo by design.

> ### ✅ HUB PREMIUM PORT — verified + shipped LIVE (2026-08-01, commit `18ff9c9`)
> Founder: *"verify and commit the hub port."* Landed the dangling uncommitted Hub premium-port
> (an earlier same-day session ported `_scratch/hub-premium.html` into `prototype/index.html` but
> left it uncommitted — 87+/22-, CSS + one `.hub-meters.cu-card` markup add). Serves the **sell-now**
> goal (the live demo is the asset — must look premium).
> - **Fixed real light-theme bugs:** `--border-lit` was UNDEFINED in light → killed every
>   border+bevel; meter tracks were ~2% contrast on ivory (new `--track-bg`/`--track-shadow`);
>   `--dugout`/`--pavilion` swapped so 160deg gradients are top-lit not inverted.
> - **Premium upgrades:** Match tile → the one red hero CTA (vs gold Auction secondary); mafia-banner
>   → Teko; hub-meters → chamfered `.cu-card` plaque; lacquered glass + 3-tier elevation; gold today cell.
> - **Verified (founder-authorized) both themes @390×844 + 320×568** via throwaway Playwright capture
>   (deleted): light reads premium with real depth, dark at parity, **0 console errors**. No
>   test-protected selector touched; test #124 (light default) untouched. Full suite NOT run
>   (founder-gated) — diff is CSS-only + 1 class-add, low risk.
> - **Pushed to master → auto-deployed live** (Pages serves from master root).
> - **Untracked, left on disk (binary/scratch, not committed):** `design-lab/bolt-round2/` (bolt React
>   mockup — reference only, violated the plain-HTML/CSS brief), `_scratch/*.png` + `hub-premium.html`.
> - **NEXT (per the mockup's own plan):** roll the SAME treatment to other screens, Auction → Squad
>   first (ui-designer direction → shilpi port, one screen/commit, tests green).
> - **Pre-existing nit (not this port):** 320px truncates Hub meter labels ("HE 15"/"Fi 50").

> ### ✅ RICHNESS PASS COMPLETE (2026-07-31) — all 6 fixes merged to master, LIVE
> Founder-authorized richness pass (ported dark-theme depth into the enforced light default) shipped as
> 6 parallel single-fix branches across isolated worktrees, then merged to `master`:
> `rich-bevel` (`ffa157e`) · `rich-panel-lift` (`0cf84e1`) · `rich-spotlight` (`2714627`) ·
> `rich-texture` (`2f57f21`) merged earlier; **`rich-chrome-bar`** (true-white top-bar/bottom-nav chrome +
> visible `--border` divider) and **`rich-chrome-ratio`** (fold Hub ALIGN/HEAT/FANS pills into one manager
> card, demote Primary Loop/Daily Bonus to `.cu-ribbon-sub` dividers) merged this session. Master pushed
> (`92b3476..768fca0`) -> **auto-deployed live** (Pages serves from master root). All 6 rich-* branches +
> their worktrees + 2 stale `.claude/worktrees/agent-*` torn down; repo back to `master` + `fix/investor-claims`.
> - **NOT committed:** 34 audit-mode PNGs (`audit-2026-07-31*/`) left untracked on disk as reference -- binary
>   artifacts don't belong in the game repo.
> - **Test posture (founder-gated):** full Playwright suite NOT run this session. Merges were conflict-free
>   (`merge-tree` = 0 markers) and each branch self-reported targeted tests green; `--chrome-rgb 255,255,255`
>   and `.cu-ribbon-sub` confirmed present, test #124 (`light theme is the default`) untouched.
> - **WARNING - ONE THING TO EYEBALL:** `rich-chrome-ratio` is a real Hub *layout* change (pill regrouping)
>   that never got a full-suite run (Playwright wasn't resolvable in its worktree -- 18 assertions were manually
>   replicated instead). This is the buyer-facing sell-now demo, so glance at the live Hub at 390x844 + 320x568;
>   revert that merge if the manager card reads wrong.

> ### 🔧 UI polish batch (2026-07-31, same day as the sell-now override below) — 6 fixes shipped, LIVE
> Founder ran a `ui-designer` audit (Audit Mode) then explicitly asked for the trivial/small findings in
> Build Mode, one subagent per fix, parallelized across isolated git worktrees. Shipped to `master` and
> **auto-deployed live** (this repo's Pages serves directly from master root, no separate deploy step —
> confirmed live at `chandu45-droid.github.io/cricket-underworld/prototype/index.html`):
> 1. Hub OVR label contrast (`e95e0c9`) — also fixed a root-cause bug where `renderHub()` was silently
>    wiping the label from the DOM every render; a CSS-only fix would not have worked.
> 2. Angular hairline crispness on hero cards (`e880512`) — surfaced that the "lit border"/bevel tokens
>    are defined ONLY in dark `:root`, never overridden for light theme (the enforced default).
> 3. Toast/tooltip collisions, Hub + Auction (`9330c1d`).
> 4. Floating avatar chip in live auction (`5072873`).
> 5. Three 320×568 breakpoint bugs — season badge wrap, FANS pill clip, Sponsor Boost/nav overlap (`5121296`).
> 6. Desktop 1280px unstyled stretch — max-width cap (`33201ec`).
>
> Full suite re-run on merged master: **167/167 green** (10.6m), including `light theme is the default`
> (test #124, untouched). Merge commits `a0f9198`..`28d575a`.
>
> **✅ SCOPE FLAG RESOLVED (2026-07-31, same session):** founder explicitly chose "proceed with the
> richness pass anyway" over holding to the sell-now "no code changes" scope, reasoning a more premium
> product may sell better / support a higher ask even at the $600-3k pre-revenue banding. The richness
> pass below is founder-authorized, not an agent assumption. Audit Mode runs first (concrete before/after
> direction) before any Build Mode work, same discipline as the polish batch above.
>
> **Root-finding from the same audit, not yet built:** overall UI "feels basic" traces to the enforced
> default (light) theme shipping a stripped-down version of the documented noir/stadium design system —
> texture layer barely implemented (9 grain/texture refs total in the whole file vs. a spec promising
> texture on every surface), premium tokens dark-theme-only. Founder's direction if it proceeds: port
> dark theme's richness into light, keep light as default (no test #124 change).

> ### 🏷️ FOUNDER OVERRIDE (2026-07-31) — PIVOTING TO SELL NOW (Path C superseded)
> Founder asked to prep a sell-ready package and shop it to buyers (cold marketplace channel — Flippa/Acquire.com-style). This **supersedes Path C** ("build traction, sell at a multiple for ~$10k", locked 2026-07-11) before any of its 3 gates were reached (~20 days into the 90-day window). Full reasoning + tradeoff logged in root `CORE-MEMORY.md` §4 (Cricket Path-C kill-gates, superseded note) and §8 (2026-07-31 entry, "FOUNDER OVERRIDE #4").
> **What this means for the record:** honest valuation is the **$600–$3k pre-revenue code-asset band** (priced 2026-07-11 by Vidura+Sanjaya at ₹0 revenue) — NOT $10k, which assumed real traction this pivot skips. No install/D1/MRR numbers exist (analytics collector was built but never confirmed deployed; no distribution wave was confirmed fired) — `pitch.html` already correctly says "Working prototype, pre-revenue" and must stay honest, not be inflated for the sale.
> **In progress:** reframing `pitch.html` from an "Investor Brief" (implies growth-stage investment) to a straight asset-for-sale listing (finished build, live demo, source handover, honest pre-revenue status) + a buyer due-diligence doc. Outreach itself stays founder-led (distribution/posting is never delegated to an agent — premium-templates precedent).

> ### ⏸️ HANDOFF (2026-07-27) — GAME-WIDE v3-KIT REDESIGN + THERMAL FIX — RESUME HERE
> **What shipped this session (all on `master`, pushed; NOT deployed to gh-pages/players):**
> - **S24 heating fix** (`f55db55`): idle the always-on particle rAF loop (pause on invisible/hidden-tab, 30fps cap), strip `backdrop-filter` from always-visible surfaces (kept on true overlays ≤12px), freeze off-screen animations. A founder's friend's Samsung S24 (flagship) was heating up; root cause = app never let the GPU idle.
> - **Game-wide "v3-kit" redesign** — benchmarked against Play Store cricket/football leaders (steal-list: card-frame hierarchy, ribbon headers, hero-card CTAs, OVR/star badges, trend deltas, faceted avatars). Reusable CSS kit created on the Hub then rolled to every screen:
>   Hub (`90492f1`) · Squad+PlayerDetail B1 (`96c22dc`) · Auction B2 (`2d89dbd`) · Match trilogy B3 (`3e984d4`) · League+Rival B4 (`ec29ddb`) · Deals+Collection+Pack B5 (`2e85f19`) · Shop+Pass+Profile+overlays B6 (`dc718ef`) · Syndicate+Neta B7 (`1666991`) · faceted player-card art B-CARD (`ca162b6`) · merge-comment fix (`878487c`) · crest-test update (`9028186`) · design artifacts (`docs/look-direction-v2.md` + `prototype/_scratch/` hub-v2/v3 + avatar explorations).
> - Faceted player-card art now replaces the old stick-figure silhouette game-wide (shared `generatePlayerSilhouette`, ~2KB/card).
>
> **TEST STATE — ✅ CONFIRMED GREEN (2026-07-27):** the final full Playwright suite on integrated master ran **167 passed / 0 failed** (real exit 0, verified via PIPESTATUS; bg id `b8wj25lxz`, 10.6m). The prior 163/4 failures were only the `p15-visual` crest tests pinning the OLD letter-crest Hub — fixed in `9028186`. **Test gate CLEARED.** (Optional sanity re-run: `npx playwright test`. Known flakes that pass on isolated re-run: `p15-visual` crests, `smoke` bowler-picker.)
>
> **✅ DEPLOYED — the redesign is LIVE (2026-07-27).** DEPLOY MODEL CLARIFIED: cricket-underworld's GitHub Pages serves DIRECTLY FROM `master` root (root `index.html` = meta-refresh redirect → `prototype/index.html`); there is NO `gh-pages` branch and NO Pages Actions workflow. Therefore **every push to master auto-deploys** — the whole rollout went live as it was pushed. Verified: live `https://chandu45-droid.github.io/cricket-underworld/prototype/index.html` is HTTP 200 and **byte-identical to master HEAD** (695,896 bytes; 93 cu-card, 15 faceted-avatar, 3 startParticles markers present).
> **GATES:** 1. ✅ Playwright 167/167. 2. 🌡️ **S24 heating check is now a POST-deploy verification** (it went live before the on-device test — fix is code-verified + suite green, low risk, instantly revertible via `git revert`): on the S24, idle at Hub a few min → stays cool + battery ok, smoke still shows on corrupt alignment, celebrations still fire. If it regresses, revert the relevant commit and re-push (auto-redeploys).
>
> **Behavior change for founder awareness (easy revert):** the Hub HEADER avatar now shows a faceted cricketer PORTRAIT instead of the team-initial letter crest. Team COLOR is still reflected (avatar seeded by `GS.teamColor`), team NAME still shows as text, and letter-crests still appear in the league table + battle card + prematch badges. If you want the initial letter back in the hub too, it's a small add.
>
> **Minor cleanups queued (non-blocking):** League ▲/▼ promotion/relegation done as scoped CSS `::after` (not a literal `.cu-delta` element — would need a 1-line JS-template edit); dead vars `monogram`/`mono` left in Syndicate/Neta render fns; a few screens use faceted avatars as ADDITIVE badges alongside existing crests rather than replacing them.


> ### ⏸️ HANDOFF TO LAPTOP (2026-07-15) — RESUME HERE
> **Where everything lives:** branch `claude/current-status-gpzh42` — 5 commits ahead of `master`
> (`7710c88` analytics sink · `c6066d3` reel + distribution kit + font first-paint fix ·
> `c46a5b6` 4-persona playtest report · `1bbae8e` funnel fixes · this commit). To resume:
> `git fetch origin && git checkout claude/current-status-gpzh42`. **NOT yet merged to master**
> — GitHub Pages still serves the pre-Pillar-3 build until this branch is PR'd + merged.
> **Test state at handoff:** targeted groups all green (P3 sink 3/3 · Squad Selection+Auction
> 10/10 incl. 2 new); prior clean full run 155/155; a fresh full-suite run over the final two
> funnel-fix commits was IN PROGRESS in the cloud session at handoff — re-verify locally with
> `npx playwright test` (suite is now 157 tests) before merging.
> **Latest work (2026-07-15):** 4-persona playtest (`docs/playtest-personas-2026-07-15.md`) →
> shipped its two pre-wave fixes: auction pool budget-first (purse trap: naive day-1 bidder
> now keeps 1,118/2,000 vs 490) + XI auto-preselect (Confirm live on first open).
> **Next actions:** (1) merge branch → master via PR · (2) founder Pillar-3 queue below
> (collector deploy → device QA → reel to MP4 → fire wave 1) · (3) remaining persona-report
> items stay ranked in its synthesis table (cloud save before C2 billing is the big one).

> ### ▶️ PILLAR 3 (PROOF) — BUILD SIDE DONE 2026-07-15; BALL IS WITH THE FOUNDER
> **Shipped this session (founder: "Implement pillar 3"):**
> - **P3 pipeline** — remote analytics sink: in-game beacon (`flushAnalytics` — boot flush, 4s debounce, pagehide sendBeacon, sentIdx cursor w/ quota realignment, offline-safe, endpoint-pluggable, empty endpoint = old local-only behavior) + first-touch **UTM/referrer capture** (`captureAcquisition`) + free **Google Apps Script collector** (`analytics/apps-script-sink.gs` → Sheet, GET = fleet D1/D7 JSON) + `analytics/README.md` deploy guide. 3 new E2E green.
> - **P4 demo reel DONE** — `docs/demo/cricket-underworld-60s-reel.webm` (43s, real gameplay, Victory end-beat; README has beats/regen/convert).
> - **P2 distribution kit READY** — `distribution/DISTRIBUTION-KIT.md`: India-first waves w/ per-wave UTM tags + paste-ready posts (per §11: itch.io demoted).
> - **First-paint fix** (real product bug found while recording): Google-Fonts stylesheet was render-blocking → on slow/hanging networks the screen stayed WHITE for ~10s before the splash. Now non-blocking (`media="print"` swap + noscript fallback). Hidden splash now stays in DOM w/ animations stopped (`#loading.hide` observability — tests + timing races).
> **ALSO SHIPPED 2026-07-16: Cloud Save & Backup (playtest #4)** — portable backup code (offline, checksummed, full-save round-trip) + optional cloud sync by Save Code over a free Google Apps Script endpoint (`cloudsave/apps-script-cloudsave.gs` + README). Settings → Cloud Save & Backup section. Refactored `load()` → shared `hydrateGS(d)`; new `exportSaveString/importSaveString/parseSaveString/cloudBackup/cloudRestore/ensureSaveCode` (all on window). `GS.saveCode` added to defaults+hydrate. 5 new E2E in features-10k.spec.js (round-trip, reject corrupt/garbage, cloud put/get via mocked route, not-found, no-endpoint no-op). Standalone browser round-trip verified (coins+unicode name+squad restore; corrupt/garbage rejected; zero boot errors). **Full suite run 2026-07-15 on laptop: GREEN (exit 0) — cloud save merge verified, pushed to origin.** This clears the last hard blocker before C2 real billing. Next: founder billing-model decision (TWA vs PWA+Razorpay).
>
> **EARLIER 2026-07-15 (playtest items 1-3):** auction budget-first order + purse tip · XI auto-preselect (Confirm live on first open) · **Blitz 5-over format** on pre-match (30-ball innings, halved payout/XP, resets to T20 each match day) — persona report items 1-3 done, next unshipped = #4 cloud save (blocks C2 billing). Targeted groups green (Squad Selection, Auction, Match Engine, Pre-Match 18/18 + 3 new E2E); **run the full suite on laptop resume** (this container takes ~50 min).
> **FOUNDER ACTIONS (in order, ~15 min total):** (1) deploy Apps Script collector + set `ANALYTICS_ENDPOINT` + push (3 min, `analytics/README.md`) → (2) real-device QA of live URL → (3) convert reel to MP4 → (4) fire distribution wave 1 on a match day (kit §channel plan). Then P3 = wait ~2 weeks / ~200 users → P5 wire numbers into pitch.html.
> **Still open (founder decisions):** billing model (TWA+Play Billing vs PWA+Razorpay; blocks C2 not C1) · default-theme sign-off · optional balance-tester/player-advocate gate.

**Last updated:** 2026-07-12
**Last commit:** (this commit) — **LOOK L5 FIRST-60-SECONDS REEL** (founder: *"next?"*): audit-first verification of the fresh-install reel end-to-end on BOTH themes — splash → hub → 6-step tutorial → auction → **first-match Victory**. **No fix needed — reel already clean.** The one suspected defect (splash "UNDERWORLD" washout) was a **FALSE ALARM** (captured at 400ms, before `.t2 fadeUp` 0.5s delay had begun; re-shot settled at 1500ms = rich legible gold → per evidence-before-diagnosis #8, NO override applied). Win beat proven by driving the REAL live match chain (CORE-MEMORY #13) to a deterministic "Victory" (god-squad 99 vs seeded trash opponent 1) — Victory overlay screenshot-verified clean on both themes, **0 console/page errors**. **LOOK PILLAR COMPLETE (L1–L5 ✅).** Temp specs removed; suite **152/152** green. (prior: LOOK L4 juice pass — haptics + loss moment + reduced-motion + purseShimmer restore)
**Superseded header (kept for trail):** **LOOK L4 JUICE PASS** (founder: *"L4 the juice pass"*): audit-first found 4 real gaps in an already heavily-juiced game and closed them → (1) **haptics** (were absent) — `buzz()` layer wired into 15 SFX methods (tap/bid/cardWon/wicket/six/four/run/win/lose/reveal/promote/relegate/mafia/knockout/socialPing), reduced-motion-gated; (2) **loss moment** (was SFX-only) — `#outcome-flash.loss` red radial burst + `screenShake()` on the `#app`; (3) **`prefers-reduced-motion`** accessibility/60fps-budget safety valve (was absent) — kills all animation for reduce users + `_reduceMotion` guards on `buzz`/`screenShake`/`spawnCelebration`; (4) **purseShimmer restored** from L1-parked — theme-safe gradient-clip shimmer on `.auction-purse-zone .purse` with solid-gold fallback + light-theme peak override + `.m-cur` pinned solid (heeds L1 case law: gradient text stays visible on BOTH themes — screenshot-verified light+dark, `C 5,000` legible gold on ivory & dark). Card-reveal + screen-transition moments already animated (packBurst/cardFlip/revealRing + staggerIn), left intact, haptics added. Full suite **152/152** green; both themes verified. (prior: UX DENSITY PASS — progressive-disclosure `.hub-drawer` drawers on hub+cards)
**Superseded header (kept for trail):** **UX DENSITY PASS** (founder interrupt directive): screens too tall / too much info / heavy scroll → progressive-disclosure via collapsible `.hub-drawer` drawers on the two worst offenders. **Hub:** Club Management + Underworld collapsed, alerts + battle card moved up (depth 4.64→2.09 @360w / 1.82 @390w, top blocks 29→20). **Cards:** Packs & Shop collapsed drawer at top, duplicate bottom shop block removed, grid starts high (depth 3.12→2.78 @360w / 2.41 @390w, blocks 9→5). Drawers use `display:none` bodies (Playwright-clickable after expand), static wrapper (`.open` survives re-render), ES5-safe inline toggle w/ ARIA. 6 drawer-gated test assertions coupled to open their drawer first. Full suite **152/152** green; both themes screenshot-verified on both screens. (prior: LOOK L3 font pass DROP → two-tier numeric; L2 gold austerity; L1 `.money` hero; STORE SAFETY `BILLING_LIVE=false`; balance-tester F1+F3; FEATURE F1–F4)
**Superseded header (kept for trail):** LOOK pillar **L3** DECIDED → **DROP** (font pass): re-add-vs-drop resolved as DROP — Space Grotesk + Cinzel stay cut; instead routed dense stat-grid numbers (`.player-card .stat-val`, `.pd-stat-row .stat-val`) from condensed Teko → already-loaded **Rajdhani tabular**, fixing the "reads cheap" defect at zero network cost; hero money/scores stay Teko by deliberate L1 choice → **two-tier numeric system** ratified in `docs/visual-design-system.md`; both themes eyeballed (`docs/l3-evidence/`); full suite green (152/152) (prior: LOOK L2 gold austerity; L1 `.money` hero; STORE SAFETY PATCH `BILLING_LIVE=false`; balance-tester gate F1+F3; FEATURE pillar F1–F4)

## ✅ DONE (2026-07-20): playtest-5gamers P2/P3 polish batch (7 fixed, 1 skipped)

Scope: the P2/P3 tail of `docs/playtest-5gamers-2026-07-15.md` ranked synthesis (items 5-8), after the P0/P1 items from the same report already shipped in `5209898` (2026-07-16). Card art (stick figures) explicitly out of scope. Built by Shilpi, WIP=1, one commit per item, code-inspection verified only (testing is founder-gated — **all 7 fixes below need a founder/browser pass before sign-off**).

- **Fixed:** angular-rule swatches → `clip-path` not `border-radius` (`56a87a7`) · PASS button restyled to match clip-path BID (`8aac2e0`) · purse-pacing tooltip no longer overlaps `< HUB` back-btn (`9832b9b`) · Cards filter tabs edge-fade so clipped labels ("ALL-ROUN") have a scroll affordance (`148e130`) · nickname input widened + ellipsis so it stops truncating its own value (`71cf272`) · hub league-rank/empire-value relabeled "Projected Rank" / "Your Empire (Est.)" until match 1 completes, so a 0-match player stops seeing numbers that look real (`abd8a67`) · star-rating glyphs now carry `role="img"`/`aria-label="N out of 5 stars"` in both `renderPlayerCard` and `showPlayerDetail`, decorative glyphs `aria-hidden` — visual fill was already correct, only the accessible name was wrong (`4abde5f`).
- **Skipped (not guess-fixed):** toast staleness (addendum finding D, run 3). Code-read of `toast()` (~L4604) + grep of every call site confirmed the single `#toast` element is only ever mutated by that one function, which always overwrites `textContent` before adding `.show`; CSS keeps the non-`.show` state `opacity:0; pointer-events:none;` off-screen. No path re-shows stale text without a fresh `toast()` call — the run-3 "retains last message" finding is inert hidden-DOM state, not a reproducible visible bug. Per the "skip if not reproducible" instruction, no code change made.

**Next:** founder/browser verification of all 7 fixes (Playwright + eyeball, both themes) — none of this batch has been test-run per the founder-gated testing rule. Card art (stick figures) remains a separate, unstarted task.

---

## ✅ DONE (2026-07-12): BUILD-SHEET-10K — LOOK pillar L5 (first-60-seconds reel) → **LOOK PILLAR COMPLETE**

Founder directive (verbatim): *"next?"* → proceed to **L5**, the last LOOK-pillar item. Built/verified directly (Chanakya, no agent per standing instruction). BUILD-SHEET line 42 spec: *"First-60-seconds reel polish — splash → onboarding → first match win path is flawless."* Done-criterion: *"Fresh-install run recorded; zero jank, zero dead taps, ends on a win celebration."*

**Evidence first (CORE-MEMORY #8 — audit before fixing).** L5 is "the trailer": the buyer's decision is made in the first minute of a fresh install. So I did NOT blindly re-style — I audited the actual fresh-install reel end-to-end on both themes at 390×844 and fixed only proven defects. Result: **the reel is already clean — zero fix required.**

**Reel beats audited (all clean):**
- **Splash** — settled `.t2` "UNDERWORLD" wordmark = rich legible gold on ivory (deep-gold flanks + bright middle sheen + gold drop-shadow halo) / pale-gold on near-black. **The suspected "washout" was a FALSE ALARM**: the earlier bad shot was captured at 400ms, but `.t2` anim is `fadeUp 0.8s ease-out 0.5s forwards` → opacity was still ~0 (fade hadn't begun). Re-captured at the SETTLED state (1500ms) = clean on both themes. Per evidence-before-diagnosis #8, I **did NOT apply** the previously-planned light-theme gradient override — fixing a non-defect risks regressing the intended premium shimmer.
- **Loading → hub reveal** — clean crossfade, no flash-of-unstyled, no layout jump.
- **6-step tutorial** — every step advances, **zero dead taps**, auto-dismiss on completion, **0 console errors**.
- **Auction** (landing + live) — clean, premium, no clipping.
- **Win celebration (the required end-beat)** — verified the LIVE chain, not the parts (CORE-MEMORY #13): drove a real match to a **deterministic "Victory"** using a god-squad (all stats 99) vs a seeded trash opponent (`GS.scoutedXI` = 11 players all stats 1, injected at prematch just before `#start-match-btn`; `startMatch()` prefers `GS.scoutedXI` over `generateRivalXI` → guaranteed lopsided win regardless of toss/RNG). Victory overlay **screenshot-verified on both themes**: letterspaced gold "VICTORY" wordmark, full score line + margin ("Won by 253 runs" / "Won by 10 wickets"), MATCH PAYOUT hero (`C +80`), complete Grey-Zone rewards panel, angular sharp-cornered panels, no clipped/overlapping text. **0 console/page errors** on both runs.

**Verified.** Two throwaway specs (`_l5rec.spec.js` settled-splash both themes; `_l5win.spec.js` real-match-to-Victory both themes) ran green, then **deleted before commit**. Full Playwright suite **152 passed / 0 failed** (incl. #140 light-default + #142 theme-toggle — untouched). No game-code edits this item (audit-only) — the reel was already ship-quality.

**🏁 LOOK PILLAR COMPLETE (L1 `.money` hero · L2 gold austerity · L3 font two-tier · L4 juice · L5 reel).** The "reads expensive in the first 30/60 seconds" pass is done end-to-end on both themes.

**Roadmap next:** **Gate** — balance-tester + player-advocate eyeball the core loop in both themes (per standing instruction, agents run only on explicit founder ask → defers to founder direction). Then **Pillar 2 — FEATURE** (retention + revenue-ready): F1 Daily Login Streak, F2 Empire Net-Worth line, F3 surface monetization, F4 analytics — *note: F1–F4 were already shipped 2026-07-11 (see below), so the practical next move is **Pillar 3 — PROOF** (distribution + real D1/D7 signal), which is what actually closes $10k.*

---

## ✅ DONE (2026-07-12): BUILD-SHEET-10K — LOOK pillar L4 (juice pass)

Founder directive (verbatim): *"L4 the juice pass."* Built directly (Chanakya, no agent per standing instruction). BUILD-SHEET line 41 spec: *"card-reveal, win/loss celebration moment, screen transitions, SFX/haptic on key taps."* Done-criterion: *"4 named moments animate; 60fps on a budget Android; toast/SFX fire; tests green."*

**Evidence first (CORE-MEMORY #8 — audit before adding).** This game is already heavily juiced (packBurst, cardFlip, revealRing, sparkFly, spawnCelebration for six/four/wicket/win, confetti, staggerIn screen transitions, a full Web-Audio `SFX` synth). Blindly piling on more animation would be noise. So I audited the 4 named moments against what already exists and found the **real gaps**:
- **card-reveal** — already juicy (pack-overlay + packBurst + cardFlip 3D + revealRing + legendarySpot + sparkFly). *Gap: no haptic.*
- **screen transitions** — already animate (`staggerIn` re-fires each time a `.screen` gains `.active` via `goScreen`; `SFX.tap()` already fires). *No gap.*
- **win** — already celebrates (`spawnCelebration('win')` + confetti + `#outcome-flash.win` + `SFX.win`). *Gap: no haptic.*
- **loss** — **only SFX**, no visual moment at all. *Real gap.*
- **haptics** — **`navigator.vibrate` was nowhere in the file.** *Real gap.*
- **`prefers-reduced-motion`** — **absent.** On a heavily-animated game this is both an a11y defect and the 60fps-on-budget-Android safety valve. *Real gap.*

**Shipped (5 edits in `prototype/index.html`):**
1. **Haptic layer** — `_reduceMotion` flag (matchMedia, live-updating) + `buzz(pattern)` (try/catch, gated on `!_reduceMotion && navigator.vibrate`) added before `var SFX`. Wired distinct vibration patterns into **15 SFX methods**: tap 8ms, bid 14, cardWon `[0,18,30,26]`, wicket `[0,38,26,52]`, six `[0,26,40,58]`, four `[0,20,28]`, run 10, win `[0,45,55,45,75]`, lose `[0,130]` (one long thud), reveal 12, promote/relegate/mafia/knockout/socialPing. (dot + swipe intentionally silent.)
2. **Loss visual moment** — `#outcome-flash.loss` red radial burst (`outcomeBurst` reuse) + a new `screenShake` keyframe/`.shake` class.
3. **`prefers-reduced-motion: reduce`** media query — collapses all animation/transition durations to ~0 + iteration-count 1; plus `_reduceMotion` early-returns in `buzz`, `screenShake`, and `spawnCelebration`.
4. **`screenShake()` function** — reduce-motion-guarded, reflow-restart (`void app.offsetWidth`) so it re-fires on consecutive losses, self-clears after 520ms.
5. **Loss-moment wiring** (endMatch loss branch): `SFX.lose(); flashOutcome('loss'); screenShake();`.

**L1 case-law compliance — the purseShimmer restore (the risky part).** The L1-parked `purseShimmer` gradient-clip text was restored on `.auction-purse-zone .purse`. Case law: *"a gradient text-fill must stay visible on BOTH themes"* (a prior gradient washed out on ivory). Mitigations: (a) gradient stops stay in **saturated gold** — the near-white shine peak (`#FFFDF4`) only appears on dark; (b) a **`html[data-theme="light"]` override** replaces that peak with saturated gold (`#E9C651`) so it can't wash out on ivory; (c) a **solid `--gold-bright` fallback** color under the clip; (d) `.m-cur` (the `C` glyph, which carries `opacity:0.72` → own stacking context → could vanish under clip) **pinned to solid gold**. Screenshot-verified at 390×844 on **both** themes: `C 5,000` renders as clear legible gold on ivory and bright shimmer-gold on dark. No washout.

**Verified.** Full Playwright suite **152 passed / 0 failed** (incl. #140 light-default + #142 theme-toggle — both untouched). Throwaway `_l4shots.spec.js` drove the auction on both themes (invisibility guard: purse boundingBox width>20 / height>10) + screenshotted `.auction-purse-zone` → both legible; temp spec deleted before commit. Chromium headless defaults to reduce-motion `no-preference`, so the new media query does not affect the suite.

**Roadmap next:** **L5** (first-60-seconds reel) is the last LOOK-pillar item. Gate before Pillar 2: balance-tester + player-advocate eyeball the core loop in both themes.

---

## ✅ DONE (2026-07-11): UX DENSITY PASS — progressive-disclosure drawers (founder interrupt)

Founder directive (verbatim, while away): *"almost all screens in game have larger screens. need to scroll down a lot and there is lot of information everywhere. need to show them much better with critical user experience in mind."* Operated fully autonomously; built directly (Chanakya, no agent per standing instruction).

**Evidence first (CORE-MEMORY #8 — measure before restructuring).** Built a throwaway `_density.spec.js` harness: for each screen × 2 mobile viewports (360×740, 390×844), logged `scrollHeight / viewport` (= "screens deep") and count of top-level blocks. Result — only **two** screens were egregious; the rest were already fine, so I restructured *only* the offenders instead of a blind sweep:
- **hub** 4.64 screens deep (360w), 29 top blocks — WORST
- **cards** 3.12 screens deep (360w), 9 top blocks
- auction 0.90, squad 1.61, league 1.37 — already fine, left untouched.

**The lever — progressive disclosure via collapsible `.hub-drawer`, NOT tabs.** Chose drawers over a tab bar to minimize test churn and keep everything one-tap reachable. The `.hub-drawer` class is generic/reusable (not hub-scoped), so it drops onto the cards screen too.

**Shipped (`prototype/index.html`):**
- **Hub** — Club Management drawer (Facilities · Staff · Scouting · Sponsor · Season) + Underworld drawer both collapsed by default; alerts + the primary battle card promoted to the top. Depth **4.64 → 2.09** (360w) / **1.82** (390w) screens, top blocks **29 → 20**.
- **Cards** — Packs & Shop drawer (Standard · Premium · Free Sponsor Pack) collapsed at the **top** (after the collection progress bar, before filters), so the shop stays a one-tap CTA without scrolling past the whole grid; removed the duplicate bottom shop block. Depth **3.12 → 2.78** (360w) / **2.41** (390w) screens, top blocks **9 → 5**. Grid is the inherent height driver (a collection is expected to scroll), so decluttering packs was the right lever.

**Mechanics that make drawers robust (case law for reuse):**
- Collapsed body = **`display:none`** (NOT max-height clip) → an element inside is un-clickable & not `toBeVisible()` until expanded; `.textContent()`/`toHaveText()` still work without visibility.
- Drawer **wrapper is static HTML** untouched by `renderHub`/`renderCards`, so the `.open` class survives `innerHTML` re-renders of inner panels.
- Toggle is **ES5-safe inline** (no arrow): `this.parentNode.classList.toggle('open');this.setAttribute('aria-expanded',...)` with `role="button" tabindex="0" aria-expanded`. Angular clipped toggle bar + rotating chevron, consistent both themes.

**Test coupling (6 drawer-gated assertions).** Elements now behind a collapsed drawer needed their drawer opened before assertion: clean-streak-tag (comprehensive — the one suite break, fixed), standard/premium/insufficient-coins packs (comprehensive), 3D-flip pack-open + sponsor-pack visibility (smoke). Proactively grepped every other drawered element (integrity-shield, social-feed, academy, mentorship, scout, staff) for visibility tests → none broken.

**Verified.** Full Playwright suite **152 passed / 0 failed** (temp harnesses deleted). Both themes screenshot-verified via throwaway `_shots.spec.js` (fixed a harness bug: theme is driven by `GS.darkTheme` in `cu_save_v3`, NOT a `cu_theme` key) — hub + cards, collapsed + drawer-open, light + dark all render premium/angular; packs correctly use in-game `C`/`G` (no `₹` misuse). Both temp specs deleted before commit.

**Roadmap next:** L4 (juice pass — includes restoring parked `purseShimmer` gradient-clip text from L1), L5 (first-60-seconds reel). Gate before Pillar 2: balance-tester + player-advocate eyeball the core loop.

---

## ✅ DONE (2026-07-11): BUILD-SHEET-10K — LOOK pillar L3 (font pass — DECIDED: DROP)

Founder directive: *"L3 the font pass — decide: re-add or drop."* A binary decision, not a build. Built/decided directly (Chanakya, no agent spawned per standing instruction).

**The conflict (evidence-first, CORE-MEMORY principle #8).** Two ratified docs disagreed:
- `docs/visual-design-system.md` v2.0 §3.1 (line 190) deliberately **dropped** Space Grotesk + Cinzel — "cut 4 fonts → 2… saves ~100-150KB, critical for slow Indian connections… Rajdhani's tabular figures handle numbers, Teko bold handles dramatic moments."
- `CRICKET-REVIEW-2026-07-09.md` #5 (line 48) argued the **opposite** — "Teko is a condensed poster face — makes numbers read cheap. Load a proper numeric face (Space Grotesk)."

**The resolution — separate the CONCERN from the PRESCRIPTION.** Both docs actually *agree* on the concern: **dense numbers should not be condensed Teko** (it reads cheap in small stat tiles). They differ only on the *fix*. The review's fix (load a new font) fights the ratified performance budget; the doc already offers a fix that costs nothing — **Rajdhani tabular, already loaded.** So: **DROP** the re-add. Space Grotesk + Cinzel stay cut.

**Shipped (2 edits in `prototype/index.html`) — route dense stats off Teko:**
- **`.player-card .stat-val`** (line 528): `var(--font-d)` → `var(--font-b)` + `letter-spacing:0.5px` + `font-variant-numeric:tabular-nums` + `font-feature-settings:"tnum" 1`.
- **`.pd-stat-row .stat-val`** (line 1190): `var(--font-d)` → `var(--font-b)` + `tabular-nums` + `"tnum" 1`.
- The Google Fonts `<link>` (line 15) already loads Rajdhani `400;500;600;700`, so 600/700 tabular were available — **zero new network cost**, confirming the DROP was free.

**Two-tier numeric system (now ratified in `docs/visual-design-system.md` §3.1).**
- **Hero / dramatic → Teko** (`--font-d`, tabular): `.money`, match scores, big auction bids. Condensed poster face at large size = broadcast-scoreboard drama (this is the deliberate L1 `.money` choice, NOT drift — documented so no future pass "fixes" it).
- **Dense data → Rajdhani** (`--font-b`, tabular): stat-grid values in cards/tables. Squarer engineered figures read clean at 18px in small tiles.

**Verified.** Full Playwright suite **152 passed**. Both-theme screenshots via throwaway spec (mirrors `injectState`/`dismissOverlays`, navigated squad + `window.showPlayerDetail(1)`) eyeballed — dense stat numbers now render in Rajdhani tabular, clean and even-width, no layout break in either theme. Shots in `docs/l3-evidence/` (`{squad,detail}-{light,dark}.png`); temp spec deleted. `CRICKET-REVIEW-2026-07-09.md` #5 + its MED font-drift bug are now **superseded** (left as historical record; this DROP decision overrides them).

**Roadmap next:** **NEW founder directive (interrupt, higher priority than L4/L5):** *"almost all screens have larger screens — need to scroll a lot, lots of information everywhere; show them much better with critical UX in mind."* → information-density / progressive-disclosure pass, evidence-based (measure per-screen scrollHeight vs viewport, worst offenders first). Then L4 (juice pass), L5 (first-60-seconds reel).

---

## ✅ DONE (2026-07-11): BUILD-SHEET-10K — LOOK pillar L2 (gold austerity pass)

Founder directive: *"L2 the gold austerity pass."* Built directly (Chanakya, no agent spawned per standing instruction).

**The finding (from `CRICKET-REVIEW-2026-07-09.md`).** Not under-built, **under-differentiated** — every element wore the same dark-glass + 8–15% gold costume, so nothing read premium. Fix is **contrast**, not more screens. "Rich is a contrast phenomenon."

**The audit discipline (the actual work — this was classification, not mechanical stripping).** Found ~50 low-opacity gold instances across two shades (`255,210,63` + `240,200,80`). Rather than strip all ~40–50, classified each:
- **STRIP** — gold that DUPLICATES an on-screen gold hero, OR stands ALONE as decoration / hover / over-glow. → de-gilded to neutral, theme-aware `rgba(var(--hl-rgb),0.xx)` fills/borders.
- **KEEP (semantic).** Gold used in a **multi-hue parallel system** (each item = its own category hue; gold is just one color in the rainbow) — stripping it would break the color-coding. Also kept: **monetization wayfinding** (store/vault/pass/sponsor-boost = "gold means money"), **rarity/achievement** semantics, **atmospheric stage-lighting** (ambient mesh, auction spotlight/rays, pack rays), **"your row" wayfinding** (league), and the **one hero + primary `btn-gold` CTA** per screen.

**Stripped (7 panels/states, all in `prototype/index.html`):**
- **auction-purse-zone** (~622) — bg/border/`::after` glow → neutral; the L1 purse `.money` hero is now the only gold on the live-auction bar.
- **strategy-opt.selected** (~747) — dropped gold bg + gold box-shadow glow; keeps gold text/border as the selected marker only.
- **pd-train-opt:hover** (~1204) — gold hover → neutral hover.
- **hub Season-Progress panel** (~2407) — `glass accent-gold` → `glass` (neutral).
- **hub-win-streak tile bg** (~2352) — gold-tinted bg → neutral; kept the gold streak NUMBER.
- **season-complete panel** (~8278) — `glass accent-gold` → `glass`; screen hero stays the 44px PROMOTED/RELEGATED word + `btn-gold` CTA.
- **card-filter.active** (~1101) — dropped 0.16 gold fill + double glow + text-shadow; keeps gold text/border as the active marker.

**Kept, with reason (representative).** team-stat `.stat-bwl`, quick-tile `.qt-league`, hub-meter `.meter-align` = **hue-coded parallels** (batting=green / bowling=gold / overall=blue / morale=amber, etc.). league-row `.you` = your-row wayfinding. store hero + hms money strip + sponsor-boost = money wayfinding. badge.rarity-epic / syn-tier / pass-tier = rarity/achievement. ambient mesh + auction spotlight/rays + pack rays = atmosphere/celebration. potm / event-rewards / pre-match strategy / player-detail training = each its screen's single hero.

**Verified.** Full Playwright suite **152 passed** (the historically flaky `p15-visual` crests + `smoke` bowler-picker both passed this run; the 7 edits are pure CSS/class changes touching no currency or tested markup). Both-theme screenshots captured via a throwaway spec (mirrors `injectState`/`dismissOverlays`) and eyeballed — hub / auction / squad / league each now carry exactly one focal gold: **hub** = empire value (+ crest identity + hue-coded accents), **auction** = purse hero mid-auction / single money CTA on the landing, **squad** = hue-coded stat tiles + rating hexes, **league** = the gold "your row." Shots saved in `docs/l2-evidence/` (`{hub,auction,squad,league}-{light,dark}.png`); temp spec deleted.

**Roadmap next:** L3 (load Space Grotesk + Cinzel — money/stats currently fall back to Teko; **note:** the v2 depth-recipe port CUT Space Grotesk/Cinzel from the type scale, so L3 needs reconciliation before loading). Then L4 (juice pass), L5 (first-60-seconds reel).

---

## ✅ DONE (2026-07-11): BUILD-SHEET-10K — LOOK pillar L1 (`.money` hero class)

Founder directive: *"L1 the .money hero pass."* Built directly (Chanakya, no agent spawned per standing instruction).

**The pattern.** One reusable, theme-aware gold currency treatment, routed through the single dominant currency value on each of the three money-bearing screens — so "money looks like money" and each screen has exactly one hero number (leaves room for the L2 austerity pass).

**Shipped (all in `prototype/index.html`):**
- **`.money` class + parts.** `.money` (base: `var(--font-d)`, weight 700, `color:var(--gold-bright)`, `tabular-nums` + `"tnum"` for even-width digits, inline-flex baseline) · `.m-cur` (the unit glyph, 0.58em, dimmed) · `.m-val` (inherits) · size modifiers `.money.hero` (40px, gold glow) and `.money.mid` (20px). Markup: `<span class="money hero"><span class="m-cur">C</span><span class="m-val">2,000</span></span>`.
- **Routed through 3 screens:** hub net-worth `#empire-value` (`.money.mid`, HTML + `renderEmpireLine` JS) · auction purse `#auction-purse` (`.money.hero`, HTML + JS + old gradient rule neutralized) · match-result **new `.match-payout` hero** (`.money.hero` 52px, injected into the result template before the rewards panel).
- **Solid gold, not gradient — on purpose.** The old auction purse used a hardcoded light-gold gradient with `-webkit-text-fill-color:transparent` and **no light-theme override**, so it nearly vanished on the (default) light theme. `var(--gold-bright)` is redefined per theme → visible in both. The lost `purseShimmer` needs gradient-clip text → **parked for the L4 juice pass** (documented in the CSS comment).
- **Coin unit `C`, never `₹`.** Spec said "₹ symbol", but in-game currency is coins — `₹` stays reserved for the real-money store (compliance boundary). Top-bar coins (`#coins-val`) deliberately **left un-gilded** to keep one dominant gold number per screen (that hierarchy call is L2).

**Verified:** full Playwright suite **150 passed**; the 2 failures (`p15-visual` league-table crests, `smoke` bowler-picker) are **unrelated flakies that both pass on isolated re-run** — neither touches currency markup. `features-10k` F2 empire tests green (`#empire-value` textContent still `.toContain('C')`). Temp both-theme computed-style probe confirmed visible solid gold — light `rgb(176,141,10)` / dark `rgb(218,165,32)`, never transparent — on `#empire-value` and `#auction-purse` (then deleted).

**Roadmap next:** L2 (gold austerity — de-gold ~40 low-opacity panels, one gold hero + one CTA per screen), L3 (load Space Grotesk + Cinzel).

---

## ✅ DONE (2026-07-11): BUILD-SHEET-10K — FEATURE pillar (F1–F4)

Founder directive: *"first build the features part, this part [storefront/billing] we can do later. mostly will go with playstore model."* Built the four FEATURE-pillar items directly (Chanakya, no agents spawned per standing instruction); storefront/billing DEFERRED, Play Store the working (non-final) model.

**Shipped (all in `prototype/index.html`, tracker IDs F43–F46):**
- **F1 Daily Login Streak (F43).** `GS.loginStreak/lastLogin/bestLoginStreak/loginClaimedDate` (defaults + load persistence). `processDailyLogin()` at boot: same-day no-op / +1 consecutive / reset-to-1 on a gap (best preserved). `LOGIN_REWARDS` 7-day curve (200c → 300c → 500c+5g → 600c → 800c+10g → 1000c → 1500c+25g), cycles via `_loginCycleIndex`. `renderLoginPanel()` hub row (streak/best header + per-day tiles + claim CTA), `claimDailyLogin()` grants once/day guarded against double-grant.
- **F2 Empire Net-Worth + Rank (F44).** `computeNetWorth()` = coins + gems·rate + blackMoney·rate + Σ`playerMarketValue`. `getEmpireRank()` ranks player among the 10 league teams by net worth. `formatCompactCoins()` → "14.8K". `renderEmpireLine()` → hub line "YOUR EMPIRE · C X · #Y OF 10 LEAGUE RANK", recomputed in `updateHub()` after auction/match. Rendered in coin unit "C" — **rupee ₹ is deliberately a LOOK-pillar task (roadmap 1.1/1.5), not introduced here.**
- **F3 Monetization surfacing + published drop rates (F45).** Hub `#hub-money-strip`: angular clip-path tiles — `#hub-vault-tile` (gold → showStore) + `#hub-sponsor-tile` (blue → free 2-card Sponsor Pack via `showRewardedAd('pack')`, guarded vs daily-cap + squad-full); Syndicate already 1 tap via `#hub-pass-panel`. Published gacha odds: `#odds-overlay` reachable from hub link **and** Vault link; `renderOdds()`/`poolRarityPct()` compute per-rarity % live from the `ALL_PLAYERS` distribution (honest — `openPack` draws uniformly from the unowned pool), 3 pack blocks × 5 color-coded rarity rows + per-pack floor rule + legal note (odds shift with collection, no duplicates, virtual only, no cash-out). Satisfies constraints #3 (no gambling) + #4 (Play gacha-disclosure policy).
- **F4 Analytics (F46).** `ANALYTICS` module on a SEPARATE key `cu_analytics_v1` (isolated from `cu_save_v3`), fully try/catch-wrapped → silent no-op offline. `trackEvent(n,p)`/`analyticsSessionStart()`/`getAnalytics()`/`computeRetention()` → `{uid,installDay,daysActive[],d0,d1,d7}`. Instrumented at `purchase_stub` + `odds_view`, extensible.

**Verified:** new `tests/features-10k.spec.js` — **12/12 green** (F1×3, F2×3, F3×3, F4×3). Browser-eyeballed in a real Chromium (412×892): hub empire line "C 14.8K · #1 OF 10", "2-day streak · best 3 / CLAIM DAY 2 · 300 COINS", money strip (Vault gold + Sponsor Break blue), and the full Drop Rates page (3 packs × 5 rarities, Common 26/Uncommon 32/Rare 26/Epic 14/Legendary 2%). Boot error-free with analytics wiped.

---

## 🧪 BALANCE-TESTER GATE — F1 + F3 (2026-07-11, founder-authorized "run balance-tester on F1+F3")

Formal exploit/fairness pass run against the balance-tester charter (`.claude/agents/balance-tester.md`), scoped to F1 (Daily Login) + F3 (monetization surfacing + published drop-rates + sponsor rewarded-ad), advise-only.

**VERDICT — F1 + F3 mechanics SIGN OFF.** In the offline / virtual-currency / no-cash-out context there is no launch-blocking exploit in the F1/F3 logic itself. Reward curve is F2P-generous-but-fair (no >20% win gap, no real pay-to-win since billing is a non-charging stub), floor labels match `openPack` code, the odds page is live-computed so it cannot drift from actual pulls, and the daily ad caps hold (no infinite farming). Residual F1 exploits are self-harm-only.

**Fixed this pass (in-scope F3 polish, both low-risk / additive — features-10k still 12/12 green):**
- **F3-3** — odds legal note now states the shown %'s are *base* pull rates and each pack's guaranteed final-card floor means your actual result *meets or beats* them (Play gacha-disclosure strengthener). `index.html` ~2876.
- **F3-4** — `adToday()` now uses the local-date boundary (`_todayStr()`), consistent with the daily-login reset; was UTC (05:30 IST rollover mismatch). `index.html` ~9458.

**FIX-QUEUE (deferred, with rationale):**
- ✅ **F3-1 — Vault store stub leaked free currency — PATCHED (2026-07-11, founder-authorized "apply the store safety patch now").** Added `var BILLING_LIVE = false;` (`index.html` ~9356) gating ALL purchase grants until Google Play Billing is wired + verified. `requestPurchase()` now early-returns while off — logs a `store_intent` analytics event (keeps acquisition-phase demand measurable) + shows an honest toast, and **never opens the confirm sheet**. `completePurchase()` has a defense-in-depth hard guard that grants nothing even if reached directly (exploit-site guard). Store banner reworded "Test Mode" → "Opens at launch — payments not live yet, nothing charged". Store stays browsable so F3's "reachable in ≤2 taps" done-criterion holds. **Locked by 2 regression tests:** features-10k `SAFETY: Vault store grants NO currency…` (drives real UI-tap path + proves `window.completePurchase` is genuinely exercised) and the rewritten smoke `Vault store: opens & browses, but grants NOTHING while billing is off`. **Real Play Billing still DEFERRED — founder call to flip `BILLING_LIVE=true` only when billing is integrated + verified.**
- ✅ **F3-2 — aborted rewarded-ad burns the daily spot.** FIXED 2026-07-15: spot now consumed in the `ad-claim-btn` handler (tracked via `adPlacement`), not at ad start — abort/reload mid-ad costs nothing. Bonus finding: the ad overlay was never covered by the generic `.overlay` backdrop-dismiss (class is `ad-overlay`), so it had NO abort path at all except reload; added an explicit backdrop-dismiss that closes the ad and drops the pending reward (stale callback can't fire). New E2E abort assertion in smoke.spec.js Sponsor Break test; targeted sponsor-break group 2/2 green.
- 🟡 **F1-1 / F1-2 — clock-forward streak farming & concurrent-window multi-claim.** Both self-harm-only on an offline single-player save with no real PvP stakes; cheap guards (persist `maxDateSeen`; re-read save before the claim gate) available if wanted. Deferred as low-value hardening for an offline game.

**Deferred per founder:** real Play Billing integration (leaning Play Store) — 🔴 F3-1's *free-grant exploit* is now neutralized (see ✅ above); what remains deferred is wiring actual billing + flipping `BILLING_LIVE=true`. Rupee `.money` styling stays with the LOOK pillar (roadmap Phase 1).

---

## ✅ DONE (2026-07-10): Light theme default + dark-theme toggle (founder directive)

Founder: *"Remove dark theme as well from the game. Can include a toggle to enable or disable dark theme easily."* Also new **project scope: sell the game to investors / gaming companies** (see plan below).

**Architecture** (all in `prototype/index.html`):
- Existing dark-noir CSS stays as the base layer; `html[data-theme="light"]` overrides ~60 design tokens (surfaces → warm ivory #F4EFE6 family, warm-white text → ink #1A2333, accents deepened for contrast, light glass, softer elevations).
- Hardcoded colors converted to **rgb channel variables** so one variable flips whole families: `--hl-rgb` (155× white hairlines/fills), `--ov-rgb` (20× full-screen overlay scrims), `--chrome-rgb` (top bar/nav), `--abyss-rgb` (deep gradient stops).
- **Noir set-pieces stay dark in light theme** (mafia banner, shop pack rows, vault hero, ad billboard, syndicate/streets faction modals, corruption report) — scoped rule re-maps text tokens back to light values + `color:var(--white)` to re-resolve inherited color (computed-value inheritance gotcha). This IS the review's contrast thesis: dark underworld set-pieces read premium against ivory.
- Inc-7 zone re-skin text tones that assumed dark backdrops get deepened light variants (league green, market teal, scout blue).
- **Boot**: inline script right after `</style>` reads `cu_save_v3` and sets `data-theme` before first paint (no flash); updates `<meta theme-color>`. Default = light; dark only when save has `darkTheme:true`.
- **State**: `GS.darkTheme` (default false) in defaults + load(); `applyTheme()` beside save(); toggle row in Settings → Appearance (`#theme-toggle-row` / `#theme-switch`, angular clip-path switch) bound in INIT.
- `playwright.config.js`: conditional `executablePath:/opt/pw-browsers/chromium` when that path exists (cloud containers ship a Chromium whose revision mismatches @playwright/test 1.60; no effect on local Windows).

**Verified**: 2 new E2E in comprehensive.spec.js (`test.describe('Theme')`): light default + toggle→dark→persists-across-reload→toggle-back. Browser-verified screenshots (390×844 DPR2): hub/squad/cards/league/auction/market/settings in light, syndicate+bhai set-pieces stay noir w/ readable text, dark mode unchanged. Theme+Customisation targeted run: 4/4 green. Full-suite regression pass initiated (this container runs ~50min vs 9min local — one pre-existing env flake: 'bowler picker appears when bowling' timeout, unrelated to theme).

**Note for next session**: alignment cascade (index.html lines ~126-133) untouched ✓. `.money` gold-hero class from the feel-rich plan should use `--gold-bright` so it works in both themes.

---

## 🎯 PROJECT SCOPE (2026-07-10): Sell to investors / gaming companies

Founder set the goal: sell the game to investors or other gaming companies. Gap analysis done this session. Traction data is the valuation driver — "prototype + D7%" prices as a product, "prototype, zero users" prices as an asset sale. No analytics exist in the build today.

---

## 📋 FINALIZED ROADMAP — RESUME DEVELOPMENT HERE (written 2026-07-10, founder-approved scope)

Work top-to-bottom. WIP=1, verify each item (`npx playwright test` + browser eyeball) before the next, commit each. All work continues on PR #1 branch (`claude/current-status-gpzh42`) until it merges.

### Phase 0 — Demo blockers (do FIRST, ~1 day total)
Every investor clicks the game link before reading anything. These three make the first 30 seconds survivable.

- [x] **0.1 Fix HIGH bug: tutorial overlay pointer-block.** ✅ Shipped 2026-07-11 (BUILD-SHEET P0). Scrim now stays `pointer-events:none` even when `.show` (nav taps pass straight through); `.tut-card` re-enabled to `pointer-events:auto` **only** under `.tut-overlay.show .tut-card` (not unconditionally — the first attempt did that and an invisible centred card intercepted mid-screen clicks, breaking auction-bid + ad-claim; caught by the full suite, fixed by scoping to `.show`). `goScreen()` auto-dismisses the onboarding/context overlay on ANY navigation. Swipe handlers moved from the (now pass-through) overlay onto `#tut-card`. 3 new E2E (fresh-install → 1 nav tap switches screen + auto-dismisses & marks tutorialDone; scrim computed `pointer-events:none` while card is `auto`; in-card Skip still dismisses). **Full suite 152 green** (149 → 152). (Effort: S)
- [x] **0.2 Refresh pitch materials with real numbers.** ✅ Shipped 2026-07-15. `outreach.md` + `pitch.html` updated with re-verified numbers (fresher than this item's original estimates): **46** tracked features passing (feature_list.json), **163** E2E tests (`npx playwright test --list`), $5.91B→$16.72B (2034) market. Both missing cards added: (a) 5-faction Power Web differentiation (Syndicate/Thana/Neta/Bhai/Rival Bosses) — new "The Moats" section in pitch.html + email para in outreach.md; (b) regulatory moat — PROG Act 2026 killed RMG fantasy apps, no-RMG design is regulation-proof. (Effort: S)
- [~] **0.3 Verify live deployment + real-device QA.** **Deployment half ✅ VERIFIED 2026-07-15:** live `…/prototype/` is byte-identical to master HEAD (`609657d`, incl. Streak Shield + setNavState just pushed); Pages build green; `pitch.html` live with refreshed numbers ($16.72B present); `manifest.json` + `sw.js` both 200. Theme work is on master → already public. **Remaining (founder): real budget-Android QA — light theme + dark toggle by hand.** (Effort: S, founder-assisted)

### Phase 1 — Look expensive (~1 week) — Tier 1 of CRICKET-REVIEW-2026-07-09
The demo IS the pitch. Full rationale + Tier 2/3 backlog in `CRICKET-REVIEW-2026-07-09.md`.

- [x] **1.1 Global `.money` class — make money look like money.** ✅ Shipped 2026-07-11 (LOOK L1). Solid gold theme-aware `.money` hero routed through hub net-worth / auction purse / match payout; coin unit `C` (₹ reserved for store). E2E green.
- [x] **1.2 Gold austerity pass.** ✅ Shipped 2026-07-11 (LOOK L2). De-golded 7 hero-duplicating/decorative panels → one focal gold + CTA per screen; kept hue-coded/wayfinding/rarity/atmosphere golds. 152/152.
- [x] **1.3 Font pass — DECIDED: DROP** ✅ 2026-07-11 (LOOK L3). Re-add-vs-drop resolved **DROP**: Space Grotesk + Cinzel stay cut (perf budget); instead routed dense stat-grid numbers Teko → already-loaded **Rajdhani tabular** (zero network cost). Hero money/scores stay Teko → **two-tier numeric system** ratified in `docs/visual-design-system.md` §3.1. 152/152, both themes eyeballed (`docs/l3-evidence/`).
- [x] **1.4 Daily Login Streak.** ✅ Shipped 2026-07-11 (BUILD-SHEET F1 / tracker F43). Streak counter + escalating 7-day reward row on hub, persists in GS, feeds Phase 2 retention. E2E 3/3.
- [x] **1.5 Empire Net-Worth + Rank line on hub.** ✅ Shipped 2026-07-11 (BUILD-SHEET F2 / tracker F44). "YOUR EMPIRE · C X · #Y OF 10". **Rendered in coin unit "C" for now — the ₹ symbol/`.money` styling is intentionally left to LOOK-pillar item 1.1.** E2E 3/3.
- [x] **1.6 Remaining LOW bugs from review §2.** ✅ Shipped 2026-07-15. (a) Dup nav loop: the swipe `touchend` handler had a copied 14-line nav-state block — extracted shared `setNavState(name)` helper (active-class loop + nav indicator + per-screen refresh), now called by both `goScreen` and the swipe engine. (b) Win-streak grace: **Streak Shield** — armed once per run when the streak hits 3; the first loss in a 3+ run is forgiven (streak survives, 🛡 card on result screen), second loss resets. `if (!won) return null` guard prevents milestone coin re-awards on forgiven losses; shield cleared on season rollover; persisted in save. (c) Pack dupe dead-end: found ALREADY FIXED in shipped code — `openPack` draws exclusively from unowned players and odds text publishes "No duplicates"; nothing to do. Targeted E2E: new Streak Shield test (smoke.spec.js) + 3 nav tests, 4/4 green. (Effort: S)

### Phase 2 — The traction number (~1-2 weeks)
- [x] **2.1 Analytics.** ✅ Shipped 2026-07-11 (BUILD-SHEET F4 / tracker F46). Anonymous localStorage user id + event log on separate key `cu_analytics_v1` → computable D1/D7 cohorts, offline-safe (silent no-op). Instrumented at session_start / purchase_stub / odds_view; extensible to match_completed etc. E2E 3/3. (No external endpoint yet — local-only ledger; wiring to a free tier/self-owned endpoint remains for when distribution starts.)
- [ ] **2.2 Distribution.** itch.io listing + Reddit (r/WebGames, r/incremental_games, cricket subs) + X; time waves to a cricket moment. (Effort: S, founder-assisted for accounts)
- [ ] **2.3 FREEZE new systems** until ~200 organic users produce D7 data.

### Phase 3 — Outreach (parallel with Phase 2, founder-led)
- [ ] **3.1 30-60s demo video/GIF** (what actually gets forwarded inside a studio).
- [ ] **3.2 Wire live metrics into pitch.html** once analytics has ~2 weeks of data.
- [ ] **3.3 Fire `outreach.md` templates** at Indian gaming studios (Nazara/JetSynthesys/Gametion-type) + micro-VCs.

### Decision gate
- **D7 > 15%** → lead every pitch with the retention number.
- **D7 < 15%** → diagnose funnel drop-off via events, fix only that, re-measure; pitch as tech/IP acquisition meanwhile.

### Backlog (post-gate / opportunistic — not scheduled)
- Automated E2E for manual-only features: F09 (DRS/impact/weather/super-over/injury), F25 academy, F27 staff, F29 mentorship, F32 bans, F38 knockout.
- Tier 2/3 feel-rich items from `CRICKET-REVIEW-2026-07-09.md` (per-zone panel silhouettes, number-roll animations, haptics).
- GDD systems still unbuilt: gacha pity counter, dupe→fragment conversion.
- Real billing integration (IAP stubs are launch-blocking for stores, not for the pitch).
- Split `index.html` (~9000 lines) when it crosses ~10K per decisions log.

### Session-restart cheat sheet
`/resume` → this section → Phase 0.1. Server: `npx serve prototype -l 8080`. Tests: `npx playwright test` (~9min local, ~50min cloud container). Cloud container: config auto-uses `/opt/pw-browsers/chromium`; run node scripts with `NODE_PATH=<repo>/node_modules`. Dismiss tutorial in scripts: `classList.remove('show')` + `GS.tutorialDone=true`. PRESERVE alignment cascade (`index.html` ~lines 126-133 dark block + light-theme equivalents). Light theme is default — verify visual work in BOTH themes (toggle: Settings → Appearance).

---

## 🔎 REVIEW SESSION 2026-07-09 — "feel rich + stickiness" multi-agent audit → FULL DOC: `CRICKET-REVIEW-2026-07-09.md`

Founder brief: *"suggestions, improvements and bugs… UI/screens/colors too basic, no trigger to make the user stick and feel rich."* Ran ui-designer + user-researcher + component-architect + a bug-hunt agent, grounded in **live screenshots of all 5 screens** (`review-shots/`).

**Two headline findings:**
1. **Not under-built — under-differentiated.** 80+ tokens, glass, 70+ animations already exist; every element wears the SAME dark-blue-glass + faint-gold (8-15%) costume, so nothing reads expensive. Fix = CONTRAST: solid gold on ONE hero per screen (the money number + primary CTA), strip gold off the other 40 panels. On every screenshot the single best element is the one solid-gold button — that's the whole thesis.
2. **Zero reason to return.** Daily-login/streak was GDD-specced but NEVER built (`loginReward`/`lastLogin`/`dailyLogin` absent). Plus no "empire net-worth + rank" progress line = no feel-rich pull.

**Note on the pause:** the 2026-07-06 "UI redesign PAUSED / ship-and-measure" was **already formally reversed on 2026-07-08** (see "FOUNDER DECISION 2026-07-08" section below). This review executes under that live directive — consistent, not a new reversal.

**NEXT STEPS (resume here):**
1. **Read the bug-hunt agent output** (general-purpose id `a99bcfd880f12f72e` — was STILL RUNNING at write time; file under `…/tasks/a99bcfd880f12f72e.output`). Fold into CRICKET-REVIEW §2. **Do NOT spawn a duplicate.**
2. **Ship Tier 1 batch (feel-rich + retention):** (a) global `.money` class — make the headline number `index.html:547` solid gold + bigger + ₹ symbol; (b) gold austerity pass (strip gold off the 40 low-opacity panels); (c) build Daily Login Streak; (d) add "Empire Net-Worth + Rank" line to Hub.
3. **Fix HIGH bug first:** tutorial overlay `#tut-overlay.show` intercepts pointer events on fresh load → blocks ALL nav until dismissed.
4. Load **Space Grotesk** (specced in `docs/visual-design-system.md`, never loaded); route money/stats through `.money`. Also Cinzel specced/not loaded.
5. **PRESERVE** the alignment theming cascade at `index.html` **lines 126–133** through any restyle.
6. After each change: `npx serve prototype -l 8080` + `npx playwright test` + eyeball (hard-rule #10). Commit & push each.

**Bugs logged (full table in CRICKET-REVIEW §2):** HIGH tutorial-overlay pointer-block · MED font spec drift (Space Grotesk/Cinzel not loaded, money in Teko) · MED UI-AUDIT keyframe count wrong (34 vs actual 70+) · LOW dup nav loop (8471–8481) **✅ fixed 2026-07-15 (`setNavState` helper)**, win-streak resets to 0 no grace (6815) **✅ fixed 2026-07-15 (Streak Shield)**, pack dupe dead-end (7686–7688) **✅ was already fixed (no-dupe pack draws)** · missing GDD systems: daily-login **(since built)**, gacha pity, dupe→fragment.

**First PR when resuming:** `Feel-rich + retention batch 1: gold money hero, gold austerity, daily streak, empire net-worth`

---

## ✅ DONE (2026-07-09): Underworld Core increments 4-7 — faction screens + zone-palette re-skins

Founder directive #3 finishes here. Increments 1 & 3 stood up the engine + rival two-way bribes; 4-7 give the three human-facing factions their own full-screen destinations and dress every remaining screen in its zone palette. **Built as four commits (89b1d3f, 026c3e3, 70a775d, 8803423), tests deferred to one pass at the end per founder instruction ("no need to do the testing after each increment").**

- **Increment 4 — The Syndicate (Underworld zone, blood red + smoke black), commit 89b1d3f.** `showSyndicateScreen()` renders a `.syn-screen` with Don **Anna Seth** + 2 lieutenants (Rukhsana Mirza, Balwant Teja), a relationship meter, syndicate-tier badge (`syndicateTier`: Made Man ≥60 / Associate ≥20 / Known ≥−20 / On Notice ≥−60 / Marked), memory line, and an "Hear the offer" button. The offer **locks** (`.syn-offer-locked`, button removed) when you're too clean (`!zone.mafiaAccess`, i.e. alignment ≥45), a case is open, you're marked, or debts ≥5. Wraps the existing offer economy — nothing lost. `data-zone='underworld'`.
- **Increment 5 — The Politics Desk (Politics zone, ivory + deep amber poster), commit 026c3e3.** `showNetaScreen()` renders `.pol-screen` with a campaign poster per candidate (NETA_CANDIDATES = Bhupathi Rao/Vikas Morcha, Savitri Devi/Jan Shakti Party — all fictional), a power/ally readout, a live demand block (fundraiser / nephew-in-squad / throw-a-match), and memory line. `fundNetaCampaign(idx)` (300 coins, only while `election ≤ 3 && !backed`) backs a candidate and shifts alignment −3. `data-zone='politics'`.
- **Increment 6 — The Streets (Streets zone, sodium orange #F97316 + concrete grey), commit 70a775d.** `showBhaiScreen()` renders `.str-screen` for area don **Sikandar Bhai** + 2 crew (Munna Tawde, Kaali Prasad), relationship meter, hafta status/pay block, `courtBhai()` ("Pay Your Respects · 130 coins" → rel +12, courted, heat +1, align −3), and favour buttons. `bhaiFavor(key)` buys a home-ground match edge (`crowd` 90 coins / `pitchprep` 110 B$) into a single `GS.bhaiBonus` slot — **guarded against stacking** with `GS.mafiaBonus`. `payHaftaFromScreen()` clears the hafta clock. `squadPitchLean()` reports TURNING / SEAMING / FLAT from squad make-up. `data-zone='streets'`.
- **Increment 7 — zone-palette re-skins for the remaining screens, commit 8803423.** Scoped CSS overrides (no risky rewrites, all test-protected selectors preserved) give each remaining screen its zone identity: **League table + Playing XI + Scorecard → Cricket broadcast green**; **Transfer Market → Economy neon teal**; **Scout panel → Law/Intel steel blue**; **Customise/Settings → Hub noir + gold** with angular section headers. All selectors verified against real markup before commit — no dead selectors relied on for effect.

### Verification (deferred single pass — all passed)
- **`npx playwright test` → 133 passed (9.1m)** — 125 baseline + 8 new Underworld Core tests, zero regressions.
- New tests (tests/comprehensive.spec.js → `test.describe('Underworld Core')`): syndicate screen renders don+2 lieutenants in `data-zone='underworld'` · syndicate offer locked when too clean (alignment 80) · neta screen renders 2 candidate posters in `data-zone='politics'` · `fundNetaCampaign(0)` backs a candidate + spends 300 coins · bhai screen renders 2 crew in `data-zone='streets'` · `courtBhai()` raises respect + spends 130 coins + sets courted · `bhaiFavor('crowd')` sets the bonus and a second favour is blocked by the stacking guard · `squadPitchLean()` returns a valid pitch type.

### Underworld Core — COMPLETE
All 7 increments shipped (1 Power Web + case file + weekly events · 2 Law zone/case pipeline · 3 rival two-way bribes · 4 Syndicate screen · 5 Neta screen · 6 Bhai screen · 7 zone re-skins). The underworld fantasy now has faces, screens, and decisions across all 5 factions. Ship-and-measure (analytics + distribution) is the next strategic step.

---

## ✅ DONE (2026-07-09): Underworld Core increment 3 — Rival outgoing bribes (two-way F5 complete)

Founder directive #3 continues. Increment 1 shipped the INCOMING bribe (rival pays you to throw, `rivaloffer` → `matchfixlose`). Increment 3 adds the OUTGOING direction, completing the two-way rival-boss bribe loop (plan doc F5, "smallest lift, extends live code"):

- **You can now bribe a rival boss to throw the match for you.** In the next opponent's rival profile, a premium angular red **"Bribe to Throw the Match · N B$"** button appears (only when they're your *next* opponent, no fix is already set, you're not under investigation, and they're not suspended). Cost = `150 + round(strength)`, paid in **black money**.
- **Acceptance is personality-gated:** shark 0.85 · politician 0.70 · pragmatist 0.35–0.65 (worse if the rival is clean) · coward 0.30–0.55 (worse when hot) · purist 0.04. Modified by relationship (`rel/400`) and slashed to ×0.3 for clean rivals (alignment > 30). Floor 0.02.
- **Accept:** deducts cost, sets `GS.mafiaBonus = {type:'rivalthrow', rival}`, +10 rel with that boss, **+10 heat**, alignment −8, 15% chance to drop an "Intercepted Call" evidence item.
- **Refuse:** clean/purist rivals report the approach (+12 heat, 50% chance of a "Witness Statement" evidence item) and rel −12; others just take offence (+4 heat, rel −6). No fix is set.
- **Match effect (`rivalthrow`):** the OPPONENT is weakened both innings — their batting ×0.62 (when they bat) / bowling ×0.72 (when they bowl). Distinct from `matchfixlose`/`forcelose`, which weaken YOU.
- **Pre-match banner** announces the specific rival: *"<Rival> is folding — their team weakened"*.

### Verification (all passed)
- **`npx playwright test` → 125 passed (8.3m)** — 120 baseline + 5 new outgoing-bribe tests, zero regressions.
- **Browser-verified live chain** (headless Playwright, real UI): next-rival profile renders the premium red "BRIBE TO THROW THE MATCH · 224 B$" button + flavor text; forcing accept deducts black money (999→775) and sets `mafiaBonus.type==='rivalthrow'`; pre-match banner reads "Priya Sundaram is folding — their team weakened".

### 5 new tests (tests/comprehensive.spec.js → `test.describe('Underworld Core')`)
1. accept (shark, `Math.random→0`) → `mafiaBonus.type==='rivalthrow'` + black money spent · 2. clean rival (purist, `Math.random→0.99`) refuses → no fix, heat rises · 3. rejected for a non-next opponent (msg contains "next opponent") · 4. blocked when a fix is already active · 5. `#rp-throw-btn` visible in the next-rival profile.

### Next increment (execution order)
4. Grey Zone/Mafia redesign + Syndicate faces → 5. Politicians + elections screen (Politics zone) → 6. Local leaders (Streets zone) → 7. Remaining redesign screens in zone palettes.

---

## ✅ DONE (2026-07-09): Underworld Core increment 1 — Power Web + case file + weekly underworld events

Founder directive #3 (*"focus more on the gameplay tuning and create a more realistic and more engaging with these elements"*) — increment 1 shipped and verified. The dormant engine is now **live and wired**:

- **Power Web hub panel** — 5 faction rows (Syndicate / Thana / Neta / Bhai / Rival Bosses), each with a colored dot, relationship meter (−100..+100 → 0-100% fill with zero-marker), faction head/face name, and live status (e.g. Thana flips "Quiet — for now" → "CASE OPEN" when an investigation is active; Bhai shows "Hafta in N" / "HAFTA DUE"). Renders every `updateHub()`.
- **Case file** — under an active investigation, `#investigation-panel` now shows the FIR→Evidence→Chargesheet→Court stage track (current stage highlighted), the assigned named inspector with trait tag (greedy/ambitious/incorruptible) + flavor, and action buttons: **Bribe** (hidden for the incorruptible DSP Arjun Sherawat / after one try) and **Political Pressure**. Inspector is lazily assigned if absent.
- **Weekly underworld event card** — `endMatch` now calls `processUnderworldWeek(won)`; priority **hafta > election-funding > rival offer**. Notes render as `.uw-note` lines; the event renders as a `#uw-event-card` (accent-bordered) in post-match events with type-specific decision buttons, bound via `bindUnderworldEvent`.

### Verification (all passed)
- **`npx playwright test` → 120 passed (8.0m)** — 114 baseline + 6 new Underworld Core tests, zero regressions (Match Engine exercises the new `endMatch` path).
- **Browser-verified live** (headless Playwright, real hub after splash): Power Web panel visible with 5 rows and premium angular styling; case file renders with named inspector + stage track + action buttons; Thana row correctly flips to "CASE OPEN" with the incorruptible inspector; `processUnderworldWeek(true)` with `bhai.haftaDue=1` fires a hafta event titled "Sikandar Bhai — Hafta Due".

### 6 new tests (tests/comprehensive.spec.js → `test.describe('Underworld Core')`)
1. factions lazy-init → 5 keys · 2. `#power-web-panel` visible + 5 `.pw-row` · 3. inject `investigation:{matchesLeft:3}` → inspector lazily assigned + info contains '3 matches' · 4. incorruptible inspector → `bribeInspector().success === false` · 5. `bhai.haftaDue=1` → `processUnderworldWeek(true).event.type === 'hafta'` · 6. `neta.election=1` → resolution sets `neta.power`.

### Next increment (execution order) — superseded, see increment 3 above
3. ~~Rival outgoing bribes UI~~ **DONE (increment 3)** → 4. Grey Zone/Mafia redesign + Syndicate faces → 5. Politicians + elections screen (Politics zone) → 6. Local leaders (Streets zone) → 7. Remaining redesign screens in zone palettes.

---

<details>
<summary>Archived handoff (increment 1 — verbatim edit drafts, now applied)</summary>

**Founder directive #3 (active, verbatim):** *"focus more on the gameplay tuning and create a more relaistic and more engaging with these elements"* — mechanical depth for the underworld fantasy: named police inspectors + case pipeline, politicians/elections, local-leader hafta, incoming rival throw-match bribes, all as one-decision-per-match-week events.

**State of `prototype/index.html` (~7350 lines, ES5 only — NO arrow functions):** SIX edits applied and consistent, but **dormant** — game runs identically until updateHub/endMatch wiring lands. Tests NOT run since edits. Committed as WIP.

### Applied edits (done, in working tree)
1. **CSS** (after `.glass.investigation .section-title` block, before `/* Tribunal overlay */`): `.pw-row .pw-dot .pw-main .pw-name .pw-head .pw-meter(-fill/-zero) .pw-status(.hot) @keyframes pwPulse .pw-case-stages .pw-stage(.done/.now) .pw-stage-line(.done) .pw-insp(-name/-tag .greedy/.ambitious/.incorruptible/-desc) .uw-note`
2. **Hub HTML:** `#power-web-panel` glass (with `#power-web-rows`) inserted between mafia-banner and investigation-panel; `#case-stage-track` + `#case-actions` divs appended INSIDE `#investigation-panel` (original markup preserved byte-for-byte)
3. **GS/state:** `factions: null,` after `ads: {...}` in GS; `GS.factions=v(d.factions,null);` in load(); `initFactions()` after initRivalData — lazy, per-key: `syndicate{rel} thana{rel} neta{rel,backed,power,ally,election:8,fundingSeen} bhai{rel,haftaDue:3} bosses{rel,offerCd:0}`
4. **Data** (after RIVALS `];`): `INSPECTORS` (Inspector Khurana/greedy/200/0.85 · ACP Vaidehi Menon/ambitious/450/0.6 · DSP Arjun Sherawat/incorruptible/0/0), `NETA_CANDIDATES` (Bhupathi Rao–Vikas Morcha · Savitri Devi–Jan Shakti Party), `BHAI_NAME='Sikandar Bhai'`, `SYNDICATE_DON='Anna Seth'`, `pickInspector()`, `getInspector(name)` (fallback INSPECTORS[0]), `CASE_STAGES` (FIR Filed/Evidence/Chargesheet/Court Date), `caseStageIndex(m)` (m>=5→0, >=3→1, >=2→2, else 3), `caseStage(m)`
5. **Enriched `startInvestigation()`:** `GS.investigation = { matchesLeft: 5, inspector: pickInspector(), bribeTried: false };` + fanLoyalty −15 + initFactions + thana rel −10. **matchesLeft:5 kept — test asserts it.**
6. **New engine fns** (after startInvestigation): `bribeInspector()` (incorruptible→fail; one try per case via bribeTried; cost `round(bribeBase * (matchesLeft>=3 ? 1 : 1.6))` in blackMoney; align −5 always; success roll vs bribeSuccess → case cleared, greedy: half evidence lost +8 heat thana+10, ambitious: +10 heat; fail: ambitious DOUBLE-CROSS pushes evidence `{type:'Communication Intercept',weight:3}` +15 heat thana−15, greedy fail +6 heat) · `applyPoliticalPressure()` (needs neta.ally && neta.power && rel>=30; rel−30, clears case, +8 heat, align−8) · `processUnderworldWeek(won)` → `{notes:[], event:null|{type,title,desc,accent,...}}`, priority **hafta > election-funding > rival offer**: bhai rel≥40+won→+30 coins note; rel≤−30→−3 morale note; hafta clock (matchNum>2, haftaDue--, ≤0→event `amt=max(40,min(200,round(coins*0.05)))` accent #F97316); election-- weekly, ===3&&!backed&&!fundingSeen→funding event (cost 300, accent #F59E0B), ≤0→resolution (backed wins 60%: ally→rel+40; backed loser→rel−25 +10 heat; reset election=8/backed=null/fundingSeen=false); rival offer (`!event && !GS.investigation && !GS.mafiaBonus && offerCd<=0 && matchNum>2 && matchNum<=14 && nxt.alignment<0 && rnd<0.18`, `pay=150+round(nxt.strength)`, accent #A78BFA) · `resolveUwCard(html)` · `bindUnderworldEvent(ev)` binding `#hafta-pay-btn/#hafta-refuse-btn` (pay: −amt, bhai+6, haftaDue=3 / refuse: rel−15, haftaDue=3, align+2), `#fund-a-btn/#fund-b-btn/#fund-none-btn` (−300 coins, `neta.backed=NETA_CANDIDATES[idx].name`, align−3), `#rivaloffer-accept-btn` (blackMoney+=pay, `GS.mafiaBonus={type:'matchfixlose'}`, +8 heat, align−6, bosses+8, offerCd=4, rivalData rel+12) / `#rivaloffer-refuse-btn` (bosses−5, offerCd=2, rivalData rel−8, align+3). All call updateCurrency()/save() + resolveUwCard flavor text.

### Remaining edits (3) — verbatim drafts

**(a) Insert after `bindUnderworldEvent`:**
```js
function renderCaseFile() {
  var inv = GS.investigation;
  var track = $('case-stage-track'), actions = $('case-actions');
  if (!inv || !track || !actions) return;
  var idx = caseStageIndex(inv.matchesLeft);
  var h = '';
  for (var i = 0; i < CASE_STAGES.length; i++) {
    h += '<div class="pw-stage' + (i < idx ? ' done' : i === idx ? ' now' : '') + '">' + CASE_STAGES[i] + '</div>';
    if (i < CASE_STAGES.length - 1) h += '<div class="pw-stage-line' + (i < idx ? ' done' : '') + '"></div>';
  }
  track.innerHTML = h;
  var insp = getInspector(inv.inspector);
  var ah = '<div class="pw-insp"><span class="pw-insp-name">' + insp.name + '</span><span class="pw-insp-tag ' + insp.trait + '">' + insp.tag + '</span><span class="pw-insp-desc">' + insp.desc + '</span></div>';
  ah += '<div class="flex gap-10" style="margin-top:8px">';
  if (insp.trait !== 'incorruptible' && !inv.bribeTried) {
    var cost = Math.round(insp.bribeBase * (inv.matchesLeft >= 3 ? 1 : 1.6));
    ah += '<div class="btn btn-outline text-xs flex-1" style="padding:6px 10px" id="bribe-inspector-btn">Bribe · ' + cost + ' B$</div>';
  }
  ah += '<div class="btn btn-outline text-xs flex-1" style="padding:6px 10px" id="political-pressure-btn">Political Pressure</div></div>';
  actions.innerHTML = ah;
  var bb = $('bribe-inspector-btn');
  if (bb) bb.onclick = function(e) { e.stopPropagation(); var r = bribeInspector(); toast(r.msg, r.success ? 'success' : 'error'); save(); updateHub(); updateCurrency(); };
  var pb = $('political-pressure-btn');
  if (pb) pb.onclick = function(e) { e.stopPropagation(); var r = applyPoliticalPressure(); toast(r.msg, r.success ? 'success' : 'error'); save(); updateHub(); };
}
function getFactionRows() {
  initFactions();
  var f = GS.factions;
  var rows = [];
  rows.push({ name:'The Syndicate', head: SYNDICATE_DON, rel: f.syndicate.rel, color:'#EF2D2D', status: GS.debts.length > 0 ? GS.debts.length + ' debt' + (GS.debts.length>1?'s':'') + ' open' : (GS.mafiaBonus ? 'Fix is set' : 'Watching you') });
  rows.push({ name:'The Thana', head: GS.investigation ? getInspector(GS.investigation.inspector).name : 'Local Police', rel: f.thana.rel, color:'#60A5FA', status: GS.investigation ? 'CASE OPEN' : (GS.heat >= 50 ? 'Heat rising' : 'Quiet — for now') });
  rows.push({ name:'The Neta', head: f.neta.power ? f.neta.power : 'No one in power', rel: f.neta.rel, color:'#F59E0B', status: (f.neta.election <= 3 && !f.neta.backed ? 'Election in ' + Math.max(1,f.neta.election) + ' — funding open' : 'Election in ' + Math.max(1,f.neta.election)) + (f.neta.ally ? ' · Your MLA rules' : '') });
  rows.push({ name:'The Bhai', head: BHAI_NAME, rel: f.bhai.rel, color:'#F97316', status: f.bhai.haftaDue <= 0 ? 'HAFTA DUE' : 'Hafta in ' + f.bhai.haftaDue + (f.bhai.rel >= 40 ? ' · Crowd is yours' : f.bhai.rel <= -30 ? ' · Crowd hostile' : '') });
  rows.push({ name:'Rival Bosses', head: '9 team owners', rel: f.bosses.rel, color:'#A78BFA', status: GS.collusionPacts && GS.collusionPacts.length > 0 ? GS.collusionPacts.length + ' pact' + (GS.collusionPacts.length>1?'s':'') + ' active' : 'Deals on the table' });
  return rows;
}
function renderPowerWeb() {
  var wrap = $('power-web-rows');
  if (!wrap) return;
  var rows = getFactionRows();
  var h = '';
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var pct = Math.round((r.rel + 100) / 2);
    h += '<div class="pw-row"><div class="pw-dot" style="background:' + r.color + ';box-shadow:0 0 8px ' + r.color + '66"></div>' +
      '<div class="pw-main"><div class="pw-name">' + r.name + '<span class="pw-head">' + r.head + '</span></div>' +
      '<div class="pw-meter"><div class="pw-meter-fill" style="width:' + pct + '%;background:' + r.color + '"></div><div class="pw-meter-zero"></div></div></div>' +
      '<div class="pw-status' + (r.status.indexOf('DUE') >= 0 || r.status.indexOf('CASE OPEN') >= 0 ? ' hot' : '') + '">' + r.status + '</div></div>';
  }
  wrap.innerHTML = h;
}
```

**(b) updateHub — replace lines ~4353-4357, verbatim anchor:**
```js
  if (GS.investigation) {
    show('investigation-panel');
    $('investigation-info').textContent = GS.investigation.matchesLeft + ' matches until tribunal · No new favors allowed';
    $('evidence-count').textContent = GS.evidence.length;
  } else { hide('investigation-panel'); }
```
Replace with lazy inspector + stage text (MUST keep `matchesLeft + ' matches'` prefix — test asserts `toContain('3 matches')`):
```js
  if (GS.investigation) {
    show('investigation-panel');
    if (!GS.investigation.inspector) GS.investigation.inspector = pickInspector();
    $('investigation-info').textContent = GS.investigation.matchesLeft + ' matches until tribunal · ' + caseStage(GS.investigation.matchesLeft) + ' · No new favors';
    $('evidence-count').textContent = GS.evidence.length;
    renderCaseFile();
  } else { hide('investigation-panel'); }
  renderPowerWeb();
```

**(c) endMatch wiring (grep anchors, line numbers shifted ~+265 after orig 3811):**
- After `var debtWarnings = processDebts();` → add `var uw = processUnderworldWeek(won);`
- In the debtWarnings render block inside `$('match-result').innerHTML` → append `uw.notes.map(function(n){ return '<div class="uw-note">' + n + '</div>'; }).join('')`
- In postEventsHtml assembly (follow the charity/`#charity-btn` pattern) → PREPEND `#uw-event-card` glass card: `border-left:3px solid ' + uw.event.accent`, title + desc, then type-specific button pairs: hafta → `#hafta-pay-btn` ("Pay N") / `#hafta-refuse-btn`; funding → `#fund-a-btn` / `#fund-b-btn` (candidate names) / `#fund-none-btn`; rivaloffer → `#rivaloffer-accept-btn` ("Take N B$") / `#rivaloffer-refuse-btn`
- After `$('post-match-events').innerHTML = postEventsHtml;` → `if (uw.event) bindUnderworldEvent(uw.event);`
- Optional: `initFactions();` after `initRivalData();` in INIT block (~line 7783) — lazy calls already cover correctness

### Verified facts (do not re-derive)
- `if (!isKnockout) GS.matchNum++;` runs BEFORE processDebts → `getNextRival()` inside processUnderworldWeek returns the true NEXT opponent ✓
- `GS.mafiaBonus = null;` executes in endMatch BEFORE post-match event binding → setting `matchfixlose` in the accept handler survives to next match ✓ (`var wasFix = GS.mafiaBonus !== null;` adds +5 heat/−2 align/fanC−5/fixedAgainst++ next match)
- NO `--ink` CSS token — use `var(--white)` (#F2ECE0). Tokens: `--white-06/-10/-20/-40 --slip #94A3B8 --amber #F59E0B --gold-bright #FFD23F --blood #EF2D2D --blue-bright #60A5FA --purple #A78BFA --font-d 'Teko' --font-b 'Rajdhani'`
- Inspector names are original fiction (avoided Sacred Games IP names)
- injectState (tests) writes `cu_save_v3` with NO factions key → every faction-touching fn calls initFactions() lazily ✓; injected `investigation:{matchesLeft:3}` has NO inspector → updateHub lazy-assign handles it

### Test contracts that MUST stay green (114 tests)
- `#investigation-info` textContent contains `matchesLeft + ' matches'` (`toContain('3 matches')`)
- `#mafia-banner` hidden when `GS.investigation` truthy (existing guard — don't touch)
- `window.checkInvestigation()` with heat:90 → `'started'` + `GS.investigation.matchesLeft === 5`
- `window.resolveTribunal()` verdict names, `window.processDebts()` / `window.payDebt(0)` unchanged
- Protected selectors: `#investigation-panel #investigation-info #evidence-count #mafia-banner #debt-panel #debt-list` + pack/tutorial set

### New tests to add (tests/comprehensive.spec.js)
1. Factions lazy-init: fresh state → `window.initFactions()` → GS.factions has 5 keys
2. `#power-web-panel` visible on hub
3. Inject `investigation:{matchesLeft:3}` → inspector lazily assigned + info still contains '3 matches'
4. `GS.investigation.inspector='DSP Arjun Sherawat'` → `bribeInspector().success === false`
5. `GS.factions.bhai.haftaDue=1` → `processUnderworldWeek(true)` returns hafta event
6. `neta.election=1` → processUnderworldWeek resolves election, sets `neta.power`

### Finish checklist
1. Apply edits (a)(b)(c) above
2. Add 6 new tests · serve `npx serve prototype -l 8080` (a prior background serve may still be running) · `npx playwright test` (~7.5 min, 114+6 green)
3. Browser-verify: hub Power Web panel, case file under investigation, post-match event card
4. Commit + push (trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`), update this file + feature_list.json + memory `game-design-project.md`

**Gotchas carried forward:** run node scripts FROM project dir (Temp breaks @playwright/test resolution) · dismiss `#tut-overlay` via `classList.remove('show')` + `GS.tutorialDone=true` · `#particle-canvas` z-49 behind overlays — scoped CSS sparks only.

### After this increment (execution order)
3. Rival outgoing bribes UI → 4. Grey Zone/Mafia redesign + Syndicate faces → 5. Politicians screen (Politics zone) → 6. Local leaders (Streets zone) → 7. Remaining screens in zone palettes.

</details>

## Current State

- **Build:** HTML5 single-file PWA (`prototype/index.html`, ~9000 lines). Light theme default + dark toggle (F42).
- **Tests:** 135 Playwright E2E tests — last full run 2026-07-10: all 135 passing (cloud container, 51min).
- **Features:** 42/42 tracked features passing. Underworld Core complete (7/7); F42 theming shipped 2026-07-10.
- **PR:** #1 open (`claude/current-status-gpzh42` → master), mergeable, session subscribed to its events.
- **Phase:** Sale scope active — Phase 0.1 (tutorial-overlay bug) ✅ DONE 2026-07-11. Next work = Phase 0.2 (refresh pitch materials with real numbers), then the LOOK pass (1.1 `.money` → 1.2 gold austerity → 1.3 Space Grotesk).

## FOUNDER DECISION 2026-07-08: UI Redesign resumes NOW

Founder verdict: *"the game UI is very basic and I am not okay with it"* — redesign with rich, modern frames that hook players. This **overrides** the ship-and-measure pause on UI work. Rationale: shipping a basic-feeling game would poison the D7 measurement anyway — first impressions gate retention. Ship-and-measure (analytics + distribution) remains the step AFTER the redesign, not cancelled.

- [x] ~~1. Card Collection + pack opening~~ **DONE 2026-07-08 (ac78820)** — collection progress strip, angular filter chips w/ live counts, card deal-in stagger, premium pack showcase, full reveal ceremony (spotlight rays, rarity-tinted rings, spark bursts, legendary flash, NEW badges); also fixed pre-existing hidden-toast peek. 114/114 tests green.

## FOUNDER DIRECTION 2026-07-08 (#2): Underworld Core — supersedes the screen queue order

Founder verdict: *"the core game play is underworld, politicians, mafia, local leaders, other team boss bribes, police cases — majorly missing at the current structure. Also colors need not stay the same — re-plan them properly."*

Code audit confirmed it: mafia = offer menu only; politicians = a tag on 2 rivals; police = zero mentions; local leaders = zero; rival bribes one-directional. **Full plan: `docs/underworld-core-plan.md`** — 5-faction Power Web (Syndicate / Thana police cases / Neta politicians / Bhai local leaders / rival bosses two-way bribes) + zone-based color re-plan (Underworld=blood red noir, Law=steel blue, Politics=ivory/amber, Streets=sodium orange, Cricket=broadcast green, Economy=neon teal).

**New execution order (each built → committed individually) — ALL COMPLETE:**
1. [x] Power Web hub panel + `GS.factions` skeleton (increment 1)
2. [x] Police case pipeline (FIR → evidence → chargesheet → court) + Law zone (increment 1/2)
3. [x] Rival boss two-way bribes (increment 3)
4. [x] Grey Zone / Mafia screen redesign + Syndicate faces — Underworld zone (89b1d3f)
5. [x] Politicians + elections — Politics zone (026c3e3)
6. [x] Local leaders — Streets zone (70a775d)
7. [x] Remaining redesign screens in their zone palettes: league, XI, scorecard, market, scout, customise/settings (8803423)

## STRATEGIC PIVOT: Ship & Measure (2026-07-06 — Vidura portfolio audit)

**Verdict: PIVOT** — from "keep building" to "ship and validate". Cricket Underworld ranked #3 of 5 in the portfolio viability audit (see workspace `PORTFOLIO-AUDIT-2026-07-06.md`): biggest ceiling, wrong quarter.

**Why (researched live):**
- India gaming $5.91B → $16.72B by 2034; PROG Act 2026 banned real-money gaming while permitting social games — this game's no-RMG design is regulation-proof. The market thesis holds.
- BUT: gaming CPI up 30% YoY (~$0.56 blended), founder ad budget ₹0, PWA has zero store discovery, and 43 built systems have produced **zero users and zero retention data** — the only numbers that matter for both revenue and the investor pitch.
- Every additional polished screen deepens sunk cost without touching the real bottleneck: players.

**New plan — one Shipping Weekend, then hands off:**
1. Deploy/refresh public URL (GitHub Pages already live at `chandu45-droid.github.io/cricket-underworld/prototype/`)
2. F37: PWA manifest + service worker (installability drives return visits)
3. Analytics: anonymous localStorage user ID + events (session start, match completed, return visit) → D1/D7 cohorts
4. Mobile QA pass on a real device
5. Distribution: itch.io listing + Reddit (r/incremental_games, r/WebGames, cricket gaming subs) + X; time promo waves to cricket moments (Asia Cup window)
6. FREEZE all new systems/screens until ~200 organic users generate D7 data

**Tripwire:**
- **D7 > 15%** → premium UI redesign resumes with priority; retention data becomes the spine of the investor pitch
- **D7 < 15%** → diagnose drop-off via funnel events, fix only that, re-measure; still failing → park as portfolio piece

**Status: awaiting founder "ship it" confirmation.** Until then, no new build work. The 10 remaining redesign screens and Phase 4 features (F33–F36, F38) resume only if the tripwire passes.

## Completed (Phase 1-3)

- [x] Auction system (IPL-style, AI bidders)
- [x] Match engine (ball-by-ball, DRS, impact player, weather, super over, injuries)
- [x] Squad management (training, release, XI selection, overseas cap)
- [x] Cards & collection (packs, 3D flip, filters, holographic foil)
- [x] Alignment system (5 zones, inertia, theming, sponsor tiers)
- [x] Mafia + debt + investigation + tribunal systems
- [x] League table with promotion/relegation zones
- [x] Transfer market (buy/sell)
- [x] Tutorial & onboarding
- [x] 50 Indianized players, commentary, social media
- [x] Visual rebuild (P1.5): crests, silhouettes, power ring, battle card, spring physics, animated gradients, glass panels
- [x] Canvas match ground, sound, gestures, mentorship, academy, staff, bans
- [x] **Premium UI Redesign — Screen 01 (Hub):** FIFA/WCC3-tier hub with glass panels, animated gradient mesh, power ring, battle card, spring physics
- [x] **Premium UI Redesign — Screen 03 (Auction):** Spotlight stage with rotating conic-gradient rays, glass bid arena, angular purse zone, dual timer (SVG circle + drain bar), bid urgency pulse, mafia intel panel, premium empty state with SVG gavel
- [x] **Premium UI Redesign — Screen 04 (Squad):** Glass stat panels with colored accent bars (bat/bwl/ovr/morale), gradient morale bar, role-grouped roster (Batters/All-Rounders/Bowlers), squad-specific card borders, SVG empty state
- [x] **Premium UI Redesign — Screen 05 (Player Detail):** Glass stat bars with colored fills, hexagonal OVR badge, angular training buttons, premium section headers with accent lines
- [x] **Premium UI Redesign — Screen 06 (Pre-Match Strategy):** Match Day header with season badge, hexagonal VS divider, SVG section icons (star/clock), glass pitch info with green accent, strategy opts with gold accent bar, pulsing fix banner, angular gradient Start Match CTA
- [x] **Premium UI Redesign — Screen 07 (Match Simulation):** Angular VS/status badges (clip-path), 56px score with text-shadow, glass match phases with glow, glass momentum bar with spring transitions, angular moment icons, glass tactics with enhanced pulse, hook panels with type-specific inset glow, glass streak milestones + daily challenges, weather banners with glass blur, DRS/Impact glow, dramatic match result overlay (20px blur, glass rewards panel, glowing value text), POTM with gold glow + shadow, corruption report with red inset, glass bowler picker with angular avatars, field setting with color-keyed glow

## Phase 4 — COMPLETE (2026-07-07/08)

- [x] F33: Full team/player name customisation (was already built — tracker corrected c5173d3)
- [x] F34: Season/battle pass — Syndicate Contract, 10 tiers free+premium (819d5b5)
- [x] F35: IAP stubs — The Vault, test-mode payments (77ef349)
- [x] F36: Rewarded ads — Sponsor Break: purse boost, free pack, post-match coin doubler, daily caps 1/1/3
- [x] F37: PWA — manifest, service worker, install prompt, icons (8318376)
- [x] F38: Knockout bracket tournament (was already built — tracker corrected c5173d3)

## Known Issues

- F09, F25, F27, F29, F32: Implemented but lack automated E2E tests
- F28 (gestures): Only testable on touch devices, no Playwright coverage
- Some systems (DRS, weather, injuries) have no automated verification

## Decisions Log

- **Single-file architecture**: All game code in one `index.html` — keeps deployment trivial, avoids build tooling. Will split when file exceeds ~10K lines.
- **Playwright over unit tests**: E2E tests against real browser cover interface mismatches that unit tests miss. Worth the slower run time.
- **50-card pool before economy**: Content depth before monetisation — players need enough cards to feel collection variety.
- **Indianized names**: All player/team/sponsor names are Indian — legal compliance (no real player names) + audience fit.

## Next Session Checklist

1. Read this file — start at **📋 FINALIZED ROADMAP** (top of file), Phase 0.2 (0.1 done)
2. Read `feature_list.json` for system-level status
3. Run `npx playwright test` to verify repo is green
4. Work the roadmap top-to-bottom; WIP=1: finish and verify one item before starting next
5. Commit each item; pushes update PR #1 automatically
