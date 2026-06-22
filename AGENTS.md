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
- For example `yarn nx run sq-server-features:lint`
- Use the `project.json` to figure out what scripts are available for which projects.

When running tests, pick the most relevent platform (cloud or server) and narrowly scope the test run to the files you've modified as tests take time to run.

When you need to write tests (and are NOT running `/browse-and-verify`), use the `webapp-testing` skill.

# Writing Code

- Never attempt to fix linting issues until you believe the implementation is correct.
- Always fix typescript errors
- **MANDATORY**: ALWAYS run `yarn prettier --write <file>` immediately after editing any file to ensure proper formatting.
- **MANDATORY**: Before committing or declaring a task done, ALWAYS run `yarn nx run sq-cloud:ts-check` (or `sq-server` as appropriate). The IDE diagnostics tool is not sufficient — it misses real TypeScript errors that `tsc --noEmit` catches in CI.

When you need to use echoes components, always use the `echoes-components` skill!

@.gitar/review/general-design.md

@.gitar/review/module-boundaries.md

@.gitar/review/adapters.md

@.gitar/review/design-system.md

@.gitar/review/react-query.md

@.gitar/review/conventions.md
