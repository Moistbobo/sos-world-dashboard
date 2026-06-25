---
name: create-merge-pr
description: Create a GitHub pull request that merges one branch into another and automatically fills the PR description with the list of commits/changes between the source and target branches. Use when asked to merge a branch like main into testnet or production and include a change list.
---

# create-merge-pr

Create a GitHub pull request that merges one branch into another, then fill the PR description with the list of commits/changes between the two branches.

## When to use

Use this skill when asked to create a PR to merge a source branch into a target branch and to include a change list in the PR description.

Examples of matching requests:
- "Create a PR to merge `main` into `testnet`"
- "Open a PR from `develop` to `production` and list the changes"
- "Make a PR to merge staging into release and fill the description"

## Required context

Before using this skill, you should know:
- The repository owner/name (e.g. `Moistbobo/sos-world-dashboard`).
- The source branch (the branch being merged, e.g. `main`).
- The target branch (the branch to merge into, e.g. `testnet` or `production`).

If the user omits the repository, source, or target, ask for clarification or infer from the current repo and branch list.

## Steps

1. **Verify GitHub CLI is available and authenticated.**
   - Run `gh --version`.
   - If `gh` is missing or not authenticated, stop and ask the user to install/log in.

2. **Identify repository and branches.**
   - Determine the repository from `git remote -v` or from the user's request.
   - List branches with `git branch -a` and confirm both source and target exist locally or on the remote.

3. **Check for existing open PRs.**
   - Run:
     ```bash
     gh pr list --base <target> --head <source> --state open --repo <owner/repo>
     ```
   - If an open PR already exists, offer to update its description instead of creating a new one.

4. **Collect the change list.**
   - Get commits between target and source:
     ```bash
     git log origin/<target>..<source> --oneline --no-merges
     ```
   - If local branches are behind, run `git fetch origin` first.
   - (Optional) Group commits by conventional-commit prefix or include PR titles only.

5. **Create the PR.**
   - Use a clear title such as `Merge <source> into <target>`.
   - Use `gh pr create`:
     ```bash
     gh pr create \
       --base <target> \
       --head <source> \
       --title "Merge <source> into <target>" \
       --body "<summary>" \
       --repo <owner/repo>
     ```
   - Capture the PR URL/number from the output.

6. **Fill/update the PR description.**
   - Format:
     ```markdown
     Merge the latest changes from `<source>` into `<target>`.

     ## Changes included
     - <commit summary> (#<pr-number>)
     - <commit summary> (#<pr-number>)
     - ...
     ```
   - Update the created PR with:
     ```bash
     gh pr edit <pr-number> --body "<description>" --repo <owner/repo>
     ```

7. **Report the result.**
   - Return the PR number and URL to the user.
   - Mention any merge conflicts or missing branches encountered.

## Example usage

```bash
gh pr create \
  --base testnet \
  --head main \
  --title "Merge main into testnet" \
  --body "Merge the latest changes from \`main\` into \`testnet\`." \
  --repo Moistbobo/sos-world-dashboard

gh pr edit 55 --body "Merge the latest changes from \`main\` into \`testnet\`.\n\n## Changes included\n- chore(ui-ux): detail modal backdrop, VRChat button style, and share toast copy (#54)\n- refactor(components): organize components into feature subfolders with barrel exports (#53)\n- refactor(pages): organize pages into feature subfolders with barrel exports (#51)\n- chore: remove superpowers generated docs from repo and ignore them (#52)\n- feat(WorldDetailPage): reuse world list data to reduce detail page loading (#48)\n- feat(FilterBar): remove search or add platform text input from filters tab (#49)\n- [DOCS]: require change list in main-to-release PR descriptions (#44)" \
  --repo Moistbobo/sos-world-dashboard
```

## Notes

- Assumes the working directory is a git checkout with the source branch checked out or available.
- Assumes `gh` (GitHub CLI) is installed and authenticated.
- Uses `git log <target>..<source>`; replace `origin/<target>` with the actual remote ref if needed.
- For cross-repository merges, adjust `--repo` and `--head` accordingly.
