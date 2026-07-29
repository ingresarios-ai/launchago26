# AGENTS.md - Rule Guidelines for Autonomous Behavior

## Rule 1: Efficient & Direct Execution (No Unnecessary Browser Subagent Loops)

- **Do NOT launch browser subagents for trivial UI additions or code edits**:
  - For simple code changes (e.g., adding a button, updating text, fixing a link, tweaking CSS), do NOT launch complex subagents to inspect browser tabs, view source code in-browser, or execute DevTools loops.
  - Rely on local source code verification tools and clean git commits.

- **Strict Limits on Browser Verification**:
  - When browser verification is explicitly requested or strictly required, limit the subagent to taking 1 quick visual screenshot.
  - Subagents must NEVER open `view-source:`, open DevTools, or attempt to read JavaScript/HTML source files inside browser tabs when local codebase inspection tools are available.
  - Keep all visual verifications fast, direct, and zero-overhead.
