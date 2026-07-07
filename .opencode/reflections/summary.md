# Reflection Summary

This file is loaded into every session. Keep it strictly assistant-facing: every item should read as a
direct instruction to future-me.

## Active directives

- When a request is ambiguous, ask one clarifying question before proposing implementation details.
- Before changing code, confirm the project's conventions in `AGENTS.md`.
- After implementing, verify with the relevant project command (`pnpm lint`, `pnpm test`, or
  `pnpm build`) rather than relying only on inspection.
- After any completed coding task, run `/reflect` proactively and include concrete file names and
  verification outcomes.
- When a reflection reveals a model limitation, note the model in the takeaway and avoid assuming
  the same capability next time.
- Keep reflection summaries compact; prefer one strong directive over five weak ones.
- Write reflection files with hard-wrapped lines at ~100 characters for easier human readability.
