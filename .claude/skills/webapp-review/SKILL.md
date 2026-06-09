---
description: Webapp review — analyse your current branch or an existing PR for DRY violations, missing abstractions, SOLID issues, module boundary violations, and extensibility gaps in this NX monorepo.
---

Run webapp review: $ARGUMENTS

Parse arguments:

- `--pr <number or URL>` — review a specific PR's diff instead of current branch; accepts a bare number (`5855`) or a full GitHub URL (`https://github.com/…/pull/5855`) — extract the number from the URL path before proceeding; `--base` is ignored when this is set since `gh pr diff` always diffs against the PR's own base branch
- `--base <branch>` — override the base branch when diffing the current branch (default: auto-detected main or master); has no effect when `--pr` is provided

---

## Step 1: Get the diff

The two modes — `--pr` and current-branch — use **different data sources**. Do not mix them.

### Mode A: `--pr`

The PR already exists on GitHub. All file content must come from the PR's head ref, **not** the local working tree.

```bash
# Fetch the PR ref (works for both same-repo and fork PRs)
git fetch origin pull/{pr}/head:pr-{pr}

# Get the diff (changed file list and full diff)
gh pr diff {pr} --name-only
gh pr diff {pr}
```

For each changed file that looks architecturally significant (query hooks, adapters, route definitions, React contexts, page templates, API services, page-level components), read its full content **from the fetched PR ref**, not from disk:

```bash
git show pr-{pr}:<file_path>
```

### Mode B: Current branch (no `--pr`)

Review everything on the current branch that diverges from the base — including uncommitted work.

```bash
git rev-parse --abbrev-ref HEAD
```

Determine the merge-base. If `--base` was provided, use it directly; otherwise auto-detect:

```bash
MERGE_BASE=$(git merge-base HEAD {base})
# or when auto-detecting:
MERGE_BASE=$(git merge-base HEAD origin/main 2>/dev/null || git merge-base HEAD origin/master)
```

Get the diff from the merge-base to the **working tree** (this includes committed, staged, and unstaged changes):

```bash
git diff $MERGE_BASE --name-only
git diff $MERGE_BASE
```

For each changed file that looks architecturally significant (query hooks, adapters, route definitions, React contexts, page templates, API services, page-level components), read the full file from disk to understand context beyond what changed.

---

## Step 2: Analyse for general design issues

For each finding note: file path, approximate line, and whether it's a **must fix** (correctness risk) or **worth addressing** (design smell that will compound).

### Duplication (DRY)

- Same 3+ lines of logic appearing in 3 or more files? Flag it. Duplication between just 2 files is often coincidental — don't extract unrelated code into shared helpers just because it looks similar.
- Two components or hooks structurally identical (same props, same state, same render logic)?
- A constant defined in one place but hardcoded as a string/literal elsewhere?
- Same feature-flag check written independently in multiple components?

### Missing or better abstractions

- A `switch` / `if` chain on the same value repeated across multiple files? Consider a lookup map, config object, or composition pattern instead of branching.
- Multiple hooks or helpers all keyed on the same discriminator? They may collapse into a single hook with a config parameter.
- Trace "what files need to change to add the next variant". More than two is a signal to redesign.

### SOLID

- **S**: A component or hook mixing unrelated concerns (data fetching, presentation, routing logic)?
- **O**: How many files need to change to add the next variant? Hardcoded conditionals = violation. Extensible patterns (maps, config objects, composition) = satisfied.
- **D**: Tightly coupled to specific implementations instead of using hooks, props, or the adapter layer for indirection?

### Consistency between similar implementations

- Two implementations of the same adapter or hook using different approaches to get their inputs?
- Similar components with different null handling, loading state, or error patterns?

### Correctness / subtle bugs

- Hardcoded limits interacting with configurable values in a way that could silently produce wrong results?
- String-based mappings (splitting, prefix matching) that break silently if a value changes?
- Extra HTTP/DB calls firing on every request when the data is already in scope?

---

## Step 3: Analyse for monorepo-specific issues

This is an NX monorepo with SonarQube Server (SQS) and SonarQube Cloud (SQC) products sharing code. Load the `webapp-code-sharing` skill if you need a deeper understanding of the module structure.

### Module boundary violations

- Code in `libs/shared` importing directly from `private/` — shared code must never depend on private code.
- Code in `libs/shared` importing from `apps/sq-server*` or `apps/sq-cloud*` — shared code must not depend on app-level code.
- Code in `apps/sq-server` importing directly from `private/` — it must go through the `libs/sq-server-addons` bridge.
- Code in `sq-cloud` importing from `sq-server*` — cloud must not depend on server code.
- A new feature in `private/libs/feature-*` not wired through `libs/sq-server-addons` — SQS won't be able to load it.
- Public code that would break if the `private/` folder were removed entirely.

### Adapter alignment

- A new or modified adapter in `sq-server-adapters` without a corresponding update in `sq-cloud-adapters` (or vice versa) — the type signatures must stay compatible.
- Adapters diverging in approach: one adapter fetching data inline while the other uses a query hook, or different null-handling strategies for the same interface.
- New shared code using the `~adapters` alias — verify that both adapter implementations actually exist and export the expected symbols.

### Code placement

- New code landing in `apps/sq-server/src` or `private/apps/sq-cloud/src` that is generic enough to belong in `libs/shared` or a `libs/feature-*` module.
- Utility functions or types duplicated between the two apps instead of being extracted to `libs/shared`.
- A new feature module created inside `apps/` instead of `libs/feature-*` — features should be shareable by default.
- Changes touching similarly-named files in both `apps/sq-server` and `private/apps/sq-cloud` — consider moving the shared logic to `libs/shared` instead of duplicating changes across both apps.

### Echoes and design system migration

- New code using the old theming system (`themeColor` helper) — should use Echoes design tokens instead.
- New code importing from the legacy `design-system` package — should use `@sonarsource/echoes-react` components.
- Raw hex colours or hardcoded font sizes instead of Echoes CSS variables via `cssVar`.
- Custom Tailwind classes used for styling that could be replaced by semantic Echoes component props (`isSubtle`, `size`, `colorOverride`).

### React Query patterns

- Custom wrapper hooks that return hand-built objects instead of the standard TanStack Query result shape.
- Mutations wrapped with custom `isPending`/`mutate` fields instead of using `useMutation({ mutationFn })` with `mutateAsync`.
- New query hooks that duplicate existing queries instead of calling them with a `select` parameter for data transformation.

### Codebase conventions

- New code using the legacy `translate` or `translateWithParameter` helpers — should use `formatMessage` or `<FormattedMessage>` instead.
- Prefer testing-library assertions over snapshot tests when the behavior is easily assertable.
- Private feature tests in public test files must be wrapped in `// BEGIN-PRIVATE-FEATURE-TESTS` / `// END-PRIVATE-FEATURE-TESTS` markers.
- Flag no-value stylistic changes like adding blank lines, reordering imports, or reformatting untouched code — these add noise to the diff without improving the code.
- New dependencies added to `package.json` without a corresponding entry in `package.json.md`.

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
