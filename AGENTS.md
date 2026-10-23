- Read @README.md every time you start.
- Read @package.json every time you start.
- Read @nx.json every time you start.

# About this project

This project is a monorepo that contains many packages to build a SaaS Cloud and On-prem Server version of the SonarQube Frontend.

# Important skills

- `webapp-review` — review changes on the current branch or a PR for DRY violations, SOLID issues, module boundary violations, and architectural gaps. Run before opening a PR.
- `echoes-components` for working with Echoes design system `@sonarsource/echoes-react`.
- `webapp-code-sharing` for understanding the complex project organization of this NX repo.
- `webapp-testing` for understanding how to write good tests.

Load these skills only when the task actually requires them — do not load them at startup.

# NX Projects

These are the NX projects in the monorepo. You can use `webapp-code-sharing` to understand how they fit together.

```txt
feature-architecture
feature-dashboards
sq-server-features
private-sq-server-addons
sq-cloud-e2e-tests
feature-jira
feature-sca
sq-server-commons
sq-cloud
sq-server-addons
nx-automation
private-shared
feature-rules
sq-server
shared
sonarqube-webapp
```

# Testing, Linting, and running Tools

There are many configuration files for tools like linting and testing. If needed, check and read the relevent config files before deciding on what to do.

Tests can be run and targeted to a particular directory or file like so:

- `yarn nx run sq-server:test /path/to/tests`
- `yarn nx run sq-cloud:test /path/to/tests`

Other types of validation follow the pattern:

- `yarn nx run <project-name>:<script-name> <optional-args>`
- Use the `project.json` to figure out what scripts are available for which projects.

When running tests, pick the most relevent platform (cloud or server) and narrowly scope the test run to the files you've modified as tests take time to run.

**WARNING**: `yarn nx run sq-cloud:test` can run the entire test suite, spawning dozens of parallel worker processes that can exhaust system memory. To target a single test file safely, invoke jest directly:

```bash
node node_modules/.bin/jest -c private/apps/sq-cloud/config/jest/jest.config.js --testPathPatterns="<filename-or-pattern>"
```

This also applies when passing extra jest flags like `--updateSnapshot`. Never use `yarn nx run sq-cloud:test <path> -- --updateSnapshot` — use the direct jest invocation instead.

When you need to write tests (and are NOT running `/browse-and-verify`), use the `webapp-testing` skill.

## ESLint validation

Before committing or declaring a task done, run the owning project's NX `lint-files` target on only the ESLint-supported files you added or modified during the task. Run from the repository root:

```bash
yarn nx run <project-name>:lint-files -- "src/path/to/modified-file.ts" "src/path/to/another-modified-file.tsx"
```

- File paths are relative to the owning project root, where the target runs. Group files by project and run once per project; use explicit, quoted paths instead of `src` or broad globs.
- Keep NX caching enabled and use a consistent file order when rerunning the command. NX includes command-line arguments in the task hash, so different file lists have separate cache entries.
- **Never use `--quiet` for this validation.** Both `yarn lint` and the default NX `lint` command include `--quiet`, which hides warning-level issues. Use `lint-files`, which shows warnings and fails on them with `--max-warnings 0`.
- With no file arguments, `lint-files` checks unstaged tracked files and untracked files supported by ESLint in that project. Staged-only changes and deleted files are excluded. Use this shortcut only when it covers your task's changes and does not include unrelated user changes; otherwise pass an explicit file list. With no matching files, it exits without scanning anything.
- Fix errors and warnings in the changed code, then rerun the same targeted command. If using `--fix`, rerun without `--fix` to verify the result. Do not suppress rules or lower their severity to make validation pass.
- Include new, staged, and unstaged files you changed; exclude deleted files and unrelated user changes. Do not lint the entire repository or project for this check.
- If no changed files are supported by ESLint, skip this check and say why. Report any remaining warnings or validation blockers explicitly.

# Commit and PR titles

Use `<JIRA-ID> <description>` with a single space and no colon—for example, `SC-60136 Exclude development flag tooling from production startup`. This overrides the default format in the `commit-and-pr` skill.

# Writing Code

- Never attempt to fix linting issues until you believe the implementation is correct.
- Always fix typescript errors
- **MANDATORY**: Run `yarn prettier --write <file>` immediately after editing a file supported by Prettier (such as JavaScript, TypeScript, CSS, JSON, or Markdown). For Python files, use the Python package's Black formatter instead.
- **MANDATORY**: Before committing or declaring a task done, ALWAYS run `yarn nx run sq-cloud:ts-check` (or `sq-server` as appropriate). The IDE diagnostics tool is not sufficient — it misses real TypeScript errors that `tsc --noEmit` catches in CI.

When you need to use echoes components, always use the `echoes-components` skill!

@.gitar/review/general-design.md

@.gitar/review/module-boundaries.md

@.gitar/review/adapters.md

@.gitar/review/design-system.md

@.gitar/review/react-query.md

@.gitar/review/conventions.md
