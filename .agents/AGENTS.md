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

## Rule 3: Strict Survey Submission Immunity (CRITICAL)
- **NEVER revert or alter the fail-safe survey submission logic in `encuesta.js`**:
  - Both `handleAuthenticatedSubmit` and `handleAnonymousSubmit` in `encuesta.js` MUST remain non-blocking and fail-safe.
  - Database persistence (`survey_responses`) and GoHighLevel webhooks (`sendToGHL`) MUST always run inside isolated `try/catch` blocks.
  - The UI MUST ALWAYS transition seamlessly to `showThankYou()` (the Thank You screen) without ever raising blocking error `alert()` dialogs or interrupting the user journey on network or API edge cases.

## Rule 4: Mandatory LATAM Time Zones in Broadcast & Email Copies
- **ALWAYS include the full LATAM time zone list in every marketing message draft**:
  - 🇲🇽 México (CDMX): 6:00 PM
  - 🇨🇴 Colombia / Perú / Ecuador: 7:00 PM
  - 🇺🇸 Miami / 🇻🇪 Venezuela / 🇩🇴 Rep. Dominicana: 8:00 PM
  - 🇦🇷 Argentina / Chile / Uruguay: 9:00 PM

