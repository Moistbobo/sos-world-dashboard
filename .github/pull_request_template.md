<!--
  Instructions for agents and contributors:
  - Keep the sections below filled in; do not delete them.
  - Remove any checklist items or subsection comments that are genuinely not applicable, but state why in the PR description.
  - Non-visual PRs (e.g. dependency bumps, config changes, refactors with no UI/UX impact) may skip screenshots/video, but must still explain why in the E2E Evidence section.
  - For PRs targeting `testnet` or `production`, use the release template instead:
    `.github/PULL_REQUEST_TEMPLATE/release.md`
-->

## Summary

<!-- What does this PR do and why? Keep it concise (2-4 bullets) and link any related issues. -->

- 

## RISK RATING

> **Review effort guide for humans. Agents must fill in the impact badge and rationale before requesting review.**

### Overall risk

Pick **one** badge and delete the others:

- ![low](https://img.shields.io/badge/risk-low-green) — isolated change, limited files, no auth/security surface, no schema/env changes, well-covered by tests.
- ![medium](https://img.shields.io/badge/risk-medium-orange) — touches shared components/pages, adds a dependency, changes data fetching shape, or involves user input/auth but follows existing patterns.
- ![high](https://img.shields.io/badge/risk-high-red) — broad refactor, security-sensitive code, auth/token handling, schema migration, feature flag wiring, or changes that could break core user flows across the app.

### Rationale

<!-- Bulleted explanations, ideally with links to relevant GitHub diff lines. Use paths or `https://github.com/.../pull/NN/files#diff-...` style links. -->

- **Scope**: 
- **Blast radius**: 
- **Data/schema changes**: 
- **Auth/security concerns**: 
- **Dependencies / external services**: 

### Security concerns

<!-- Call out anything a reviewer should scrutinize: new fetch endpoints, token handling, XSS/CSRF exposure, env-var requirements, package supply-chain risks, etc. Delete this subsection only if genuinely none apply. -->

- None

## E2E Evidence

> **Agents must provide proof that the implementation works in a real browser for user-facing/UI changes. Attach screenshots, screen recordings, GIFs, or a link to a short Loom/Cloudinary clip below. Contributors may use the same section.**

### Is this PR user-facing?

- [ ] Yes — UI/UX was added or changed (screenshots/video required below).
- [ ] No — only non-visual code/config/test changes (explain why media is skipped).

### How to capture evidence

1. Run the app: `pnpm dev` (or `pnpm build && pnpm preview` for a production-like build).
2. Exercise the feature/flow in a browser at the relevant routes.
3. Capture:
   - **Screenshots** of the new/changed UI (at least one before/after or happy-path state).
   - **Screen recording** (preferred for flows >1 step, e.g. rating a world, posting a comment, navigating with filters). Use QuickTime, Loom, or `ffmpeg`/`asciinema` for CLI demos.
4. Attach media **directly to the PR body** by dragging the files into the GitHub text area.
5. For terminal-only workflows, use the [`gh-image`](https://github.com/drogers0/gh-image) extension to upload media from `pr-assets/<branch-name>/` to GitHub's CDN and embed the returned markdown:
   ```bash
   gh extension install drogers0/gh-image --pin v1.1.0
   gh image pr-assets/<branch-name>/*.png pr-assets/<branch-name>/*.webm
   ```
   Ensure you are logged into GitHub in a browser so `gh image` can extract a session token. If direct upload is not possible, save files under `pr-assets/<branch-name>/` and link to them; never commit screenshots or videos to the repo.
   - **Never run `gh image extract-token` inside an agent session** or log its output. `user_session` cookies grant full GitHub account access.
   - **Never pass `--token` on the command line.** Prefer browser-cookie extraction or set `GH_SESSION_TOKEN` via the environment.
   - **Use a dedicated bot account for CI/shared environments.** Do not use a maintainer's personal session in CI or long-lived env files.
   - **Only upload files under `pr-assets/<branch-name>/`.** Do not upload `.env` files, logs, build artifacts, or screenshots containing secrets/PII.
   - **Revoke the session immediately** if a token value is ever exposed.

### Attachments

<!-- Replace the placeholders with real embedded media. For images use: `<img src="https://github.com/user-attachments/assets/..." alt="..." width="100%" />`. For videos use: `<video src="https://github.com/user-attachments/assets/..." width="100%" controls></video>`. For side-by-side light/dark comparisons, use a markdown table. -->

- [ ] Screenshot(s) attached
- [ ] Screen recording / video / GIF attached (preferred for flows)
- [ ] If the change is invisible, explain why no media is needed and what was verified instead.

#### Example side-by-side layout

| Light | Dark |
|---|---|
| `<img src="LIGHT_URL" alt="..." width="100%" />` | `<img src="DARK_URL" alt="..." width="100%" />` |

### Verification checklist

- [ ] `pnpm test` passes.
- [ ] `pnpm build` succeeds.
- [ ] `pnpm lint` is clean.
- [ ] Feature manually exercised in the browser (or automated E2E test ran, if applicable).
- [ ] No new console errors or broken network requests introduced.
- [ ] Dark mode and mobile widths checked when UI changed.
- [ ] Feature flag behavior verified if the PR touches a flagged feature.

## Test Plan

<!-- What did you test, and how? Include command snippets if useful. -->

- 

## Deployment / Release Notes

<!-- Optional. Mention any required env vars, migrations, feature flags, or post-deploy checks. -->

- 
