# AGENTS.md - Rule Guidelines for Autonomous Behavior

## Rule 1: Professional & Correct Implementation
- **Production-Grade Precision**: Every implementation must be written cleanly, professionally, and robustly on the first attempt to prevent wasting time on preventable errors or regressions.
- **Thorough Code Hygiene**: Ensure all selectors, event listeners, variables, and imported assets are verified against authoritative source files before committing changes.

## Rule 2: Smart & Contextual Browser Verification
- **When Browser Verification IS Appropriate**:
  - When explicitly requested by the user.
  - When debugging complex runtime behavior, verifying intricate visual layouts, or testing multi-step interaction flows that strictly require browser feedback.
- **Direct & Fast Verification**:
  - Keep browser interactions fast, direct, and zero-overhead (taking quick visual screenshots or checking specific console errors when justified).
  - Do NOT run redundant loops or inspect source files inside browser tabs when local codebase inspection tools (`view_file`, `grep_search`) are available.

