---
name: efficient-agent-workflow
description: Enforces professional implementation quality, robust first-time code correctness, and smart contextual browser verification without unnecessary overhead.
---

# Efficient & High-Quality Agent Workflow Skill

## Primary Directives

1. **Professional & Robust First-Time Implementation**:
   - Write clean, robust, production-ready code on the first pass.
   - Always double-check element IDs, class names, function signatures, and state mutations using local inspection tools (`view_file`, `grep_search`) before applying edits.

2. **Smart & Contextual Browser Verification**:
   - **Use Browser Verification When**:
     - Explicitly asked by the user.
     - Testing complex multi-step UI flows, visual layout alignments, or diagnosing real runtime errors.
   - **Execution Standard**:
     - Keep browser actions fast, targeted, and low-overhead (e.g., taking quick screenshots or checking logs).
     - Never inspect source files inside browser tabs when local workspace tools are available.

