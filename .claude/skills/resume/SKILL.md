---
name: resume
description: Load all progress and memory files at session start. Reads PROGRESS.md, memory files, feature_list.json, and runs a test health check. Type /resume at the start of any new session.
---

# Resume Session Skill

Recall all project state so the session can continue where the last one left off.

## Steps

1. **Read progress files in parallel:**
   - `PROGRESS.md` — current state, completed work, next steps
   - `feature_list.json` — system-level feature status
   - Memory file at `C:\Users\Chandu\.claude\projects\C--Users-Chandu-Chandu---Personal\memory\game-design-project.md` — active task state, screen tracking, resume instructions

2. **Read the memory index** at `C:\Users\Chandu\.claude\projects\C--Users-Chandu-Chandu---Personal\memory\MEMORY.md` for any cross-project context.

3. **Run a quick test health check:**
   - Run `npx playwright test` to verify the repo is green
   - Report pass/fail count

4. **Output a status brief** (keep it short):
   - Screens done vs remaining (with next screen named)
   - Tests status
   - Last commit
   - Any pending non-redesign tasks
   - Clear "ready to continue" statement with what to work on next
