---
name: git-cleanup
description: Clean up stale git state in this repo. Use when the user asks to remove/delete/prune worktrees or local branches, or "clean up git" / "tidy up branches and worktrees". Preserves only the protected branches (main, production, testnet) and the main checkout.
---

# Git Cleanup

Remove all open worktrees and all local branches except the protected ones:
`main`, `production`, `testnet`.

## Steps

1. List current state:

   ```bash
   git worktree list
   git branch --list
   ```

2. Remove every worktree except the main checkout. `git worktree remove` accepts
   only ONE path per invocation, so run it once per worktree:

   ```bash
   git worktree remove --force <worktree-path>
   ```

   The `--force` flag is required: stale feature worktrees are often dirty or
   locked. If a path no longer exists on disk, `git worktree remove` may fail —
   fall back to `git worktree remove <path>` and if that fails too, prune:

   ```bash
   git worktree prune
   ```

3. Delete every local branch except `main`, `production`, and `testnet`:

   ```bash
   git branch -D <branch-name>
   ```

   Always use `-D` (force): feature branches may hold commits not merged into
   the protected branches.

4. Verify the end state — the worktree list should contain only the main
   checkout, and `git branch --list` should show only the three protected
   branches:

   ```bash
   git worktree list
   git branch --list
   ```

## Safety Rules

- NEVER touch `main`, `production`, or `testnet` — neither their worktrees nor
  the branches themselves.
- NEVER delete the current checkout worktree.
- Deleting branches is destructive and irreversible (branch deletions are not
  recoverable from git reflog once pruned). Before deleting, list what will be
  removed so the user can see it.
- If any branch or worktree looks like it might be actively used (recently
  checked out, a PR open against it), flag it to the user before deleting
  rather than silently removing it.
