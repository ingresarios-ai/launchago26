---
name: efficient-agent-workflow
description: Enforces direct, low-overhead code execution. Prevents launching browser subagents for simple code/UI edits and forbids opening browser DevTools or reading source code inside browser tabs.
---

# Efficient Agent Workflow Skill

## Primary Directives

1. **Direct Execution First**:
   - For routine UI modifications, adding buttons, fixing links, or CSS tweaks, edit the workspace code directly and report completion immediately.
   - Do NOT delegate basic code modifications or verification to autonomous browser subagents.

2. **No In-Browser Code Inspection**:
   - Never open `view-source:` or inspect `.js`/`.html` files inside browser tabs when local codebase tools (`view_file`, `grep_search`) exist.
   - If visual capture is required, take a single screenshot and return immediately.
