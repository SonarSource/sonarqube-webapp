---
name: webapp-review
description: Webapp review — analyse your current branch or an existing PR for DRY violations, missing abstractions, SOLID issues, module boundary violations, and extensibility gaps in this NX monorepo.
---

Run webapp review: $ARGUMENTS

Parse arguments:

- `--pr <number or URL>` — review a specific PR's diff instead of current branch; accepts a bare number (`5855`) or a full GitHub URL (`https://github.com/…/pull/5855`) — extract the number from the URL path before proceeding; `--base` is ignored when this is set since `gh pr diff` always diffs against the PR's own base branch
- `--base <branch>` — override the base branch when diffing the current branch (default: auto-detected main or master); has no effect when `--pr` is provided

---

## Step 1: Load review guidelines

Read all files under `.gitar/review/` — they contain the authoritative rules for this review:

@.gitar/review/general-design.md
@.gitar/review/module-boundaries.md
@.gitar/review/adapters.md
@.gitar/review/design-system.md
@.gitar/review/react-query.md
@.gitar/review/conventions.md

---

## Step 2: Get the diff

The two modes — `--pr` and current-branch — use **different data sources**. Do not mix them.

### Mode A: `--pr`

The PR already exists on GitHub. All file content must come from the PR's head ref, **not** the local working tree.

Run all three commands in a **single** Bash call so they require only one permission grant (`gh pr diff --name-only` requires gh ≥ 2.10; fall back to `gh pr diff {pr} | grep '^diff --git' | sed 's|diff --git a/.* b/||'` if your gh is older):

```bash
git fetch origin pull/{pr}/head:pr-{pr} && gh pr diff {pr} --name-only && echo "==FULL_DIFF==" && gh pr diff {pr}
```

For each changed file that looks architecturally significant (query hooks, adapters, route definitions, React contexts, page templates, API services, page-level components), read its full content **from the fetched PR ref** in a **single** Bash call:

```bash
for f in file1 file2 file3; do echo "=== $f ==="; git show pr-{pr}:$f; done
```

### Mode B: Current branch (no `--pr`)

Review everything on the current branch that diverges from the base — including uncommitted work.

Run branch detection, merge-base resolution, file list, and full diff in a **single** Bash call:

```bash
git rev-parse --abbrev-ref HEAD && MERGE_BASE=$(git merge-base HEAD origin/main 2>/dev/null || git merge-base HEAD origin/master) && echo "Merge base: $MERGE_BASE" && git diff $MERGE_BASE --name-only && echo "==FULL_DIFF==" && git diff $MERGE_BASE
```

For each changed file that looks architecturally significant (query hooks, adapters, route definitions, React contexts, page templates, API services, page-level components), read the full file from disk to understand context beyond what changed.

---

## Step 3: Analyse

Apply every rule from the loaded `.gitar/review/` files to the diff. For each finding note: file path, approximate line, and whether it's a **must fix** (correctness risk) or **worth addressing** (design smell that will compound).

Load the `webapp-code-sharing` skill if you need a deeper understanding of the NX module structure.

---

## Step 4: For each finding, assess the tradeoff

Before reporting, ask: what does acting on this actually cost?

- **Scope**: one-liner fix, single-class refactor, or multi-module change?
- **Complexity trade**: does the fix remove complexity in one place but add it somewhere else?
- **Timing**: incremental, or requires a bigger bang?
- **Risk**: does it touch a hot path or a tested boundary?

Include the tradeoff in every finding. A finding without a tradeoff is just a complaint.

---

## Step 5: Report findings

---

**Must fix:**

- `{file}:{line}` — {what breaks and why} → fix: {concrete suggestion} | cost: {tradeoff}

**Worth addressing (will compound if left):**

- `{file}:{line}` — {the smell} → suggestion: {cleaner approach} | cost: {tradeoff}

**Looks good:**

- {something specific that was done well}

---

Keep each finding to 2-3 sentences. If no must-fix items, say so clearly.

### Closing prompt

**If `--pr` was used** (reviewing an existing PR):

Ask: "Want me to address any of these, or post these findings as a comment on the PR?"

If the answer is to post: use `gh pr comment {pr} --body "{findings}"`. Do **not** offer to create a new PR — one already exists.

**If reviewing the current branch** (no `--pr`):

Ask: "Want to address any of these before opening the PR, or shall I go ahead and create it?"

If the answer is to create it: `gh pr create --title "{title}" --body "{body}"`. Mention any deferred items briefly in the PR body so reviewers are aware.
