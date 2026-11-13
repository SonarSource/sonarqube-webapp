---
name: webapp-e2e
description: Create, update or debug Playwright E2E tests for SonarQube Cloud and Server, including shared scenarios, page objects, API setup, samples and CI suite configuration.
---

# Webapp E2E testing

Read the shared [coverage and lifecycle policy](../../../.gitar/review/e2e-tests.md).
Choose a crucial core happy path sensitive to UI/backend synchronization; check
existing frontend coverage first. Check `.github/CODEOWNERS` for the domain and
follow the shared policy for missing ownership entries.
Use unit/frontend integration tests for complex combinations and error cases.

## Choose the platform

Read only the relevant platform guidance, plus both when changing shared code:

- **Server** (`private/sq-server-e2e-tests`): [Server workflow](references/server.md).
  Tests own local server distributions; suites select edition and plugins.
- **Cloud** (`private/sq-cloud-e2e-tests`): [Cloud workflow](references/cloud.md).
  Tests target a deployed environment, with saved authentication, dependency
  projects and persistent or per-run resources. Do not apply Server's automatic
  factory cleanup or server-startup assumptions to Cloud.

Find a comparable spec and its page objects before adding capabilities. Keep
runtime commands in the package README, implementation rules in the path-scoped
Gitar review guidelines, and use this skill to choose and validate the workflow.

## Share scenarios between Cloud and Server

Use [`private/e2e-shared-fixtures`](../../../private/e2e-shared-fixtures/README.md)
when the same browser behavior is actually used by both products. Import through
`~e2e-shared/*` from either E2E package:

- `fixtures/` contains product-agnostic page objects.
- `scenarios/` contains reusable scenario bodies accepting a ready Playwright
  `Page` and explicit data such as a project key. Each platform's spec invokes
  the same body after its own setup.
- `utils/` contains browser helpers; `resources/` contains shared sample projects.

The [architecture scenario](../../../private/e2e-shared-fixtures/scenarios/architecture-scenarios.ts)
and its [Cloud spec](../../../private/sq-cloud-e2e-tests/tests/app/app-architecture-smoke.spec.ts)
and [Server spec](../../../private/sq-server-e2e-tests/tests/architecture/architecture-smoke.spec.ts)
show this split. Keep API clients, authentication, test fixtures, scanner/server
lifecycle and product-specific selectors in the owning package. Shared code may
import only `@playwright/test` and Node built-ins. Move code only when a second
product actually uses it; do not force divergent journeys into one scenario.

## Check the code

Format edited files immediately and run targeted `lint-files` for changed
JavaScript/TypeScript. Run the affected E2E package's `ts-check` and its app's
`sq-server:ts-check` or `sq-cloud:ts-check`. Shared code also needs
`e2e-shared-fixtures:ts-check` and both E2E package checks.
These are static checks; they do not run the browser scenario.

## Run and fix the scenario

Use the platform's own loop:

- [Server loop](references/server.md#validation-loop): build/start a local Server,
  run the affected scenarios, fix failures and rerun. Parallel CI can handle the
  broader suite regression.
- [Cloud loop](references/cloud.md#validation-loop): select a deployed dev
  environment, ensure it contains the product changes under test, then run
  Playwright against it and iterate on test failures. When product fixes are in
  scope, validate against a deployment containing them. Running Playwright locally
  does not start a local Cloud backend.

For shared scenarios, run their callers on both products using these respective
loops. Use reports/traces to diagnose failures and confirm cleanup. `--list` only
checks discovery. Report what actually ran, which code/environment it exercised,
and any blockers. When asked to monitor a PR, keep following its latest head's
CI and review feedback after fixes.
