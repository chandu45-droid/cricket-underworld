---
name: design-review
description: Run a game design through the full agent panel — game designer, economy architect, cricket consultant, player experience, and balance tester. Use when a design doc, feature spec, or mechanic needs multi-perspective review before committing.
---

# Design Review Skill

Run the target design through all 5 review agents in parallel, then synthesize.

## Steps

1. **Identify the target.** The user provides a design doc path, a feature name, or describes the mechanic inline. Read it.

2. **Fan out to 5 agents in parallel:**
   - **game-designer** — Does this mechanic create meaningful decisions? Is it spec'd precisely enough to implement? Progression impact?
   - **economy-architect** — How does this affect currency flows? Monetization opportunity or risk? Economy balance impact?
   - **cricket-consultant** — Does this feel cricket-authentic? Would a fan nod or cringe? Any missed cricket parallels?
   - **player-experience** — How does this feel for each persona (Rohit/Priya/Arjun)? Onboarding impact? Session flow?
   - **balance-tester** — Can this be exploited? Does it create dominant strategies? Pay-to-win risk?

3. **Synthesize.** Collect all agent feedback and produce a single verdict:
   - **GO** — Design is solid, minor polish notes only.
   - **REVISE** — Good concept, specific changes needed (list them).
   - **RETHINK** — Fundamental issues, needs redesign before implementation.

4. **Output** the consolidated review with each agent's top finding and the overall verdict.
