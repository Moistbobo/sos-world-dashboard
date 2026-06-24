# Contributing

## Pull Request Descriptions

When opening a pull request that merges `main` into a release branch (`testnet` or `production`), include a list of the changes being merged in the PR description.

```markdown
Merges latest `main` into `testnet`.

### Changes included

- #39 — chore(github): enforce merge methods per branch
- #38 — [FEAT]: Map raw platform values to readable display labels
- #37 — [FEAT]: display app version on settings page and sidebar
```

## Pull Request Title Convention

Use a **single major tag** at the start of the PR title in square brackets, followed by a colon and a short description of the change.

```
[FEAT]: add user profile page
[FIX]: correct pagination offset when filtering
[DOCS]: update API authentication instructions
[CHORE]: upgrade Vitest to v5
[REFACTOR]: simplify world card layout
[TEST]: add integration tests for login flow
```

### Rules

- Use **one** major tag only. Do not add scopes inside the tag.
  - ✅ `[FEAT]: add platform label mapping`
  - ❌ `[FEAT](platform): add platform label mapping`
- Keep the description concise and focused on what the PR introduces.
- Commit messages inside the PR may continue to use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`).
