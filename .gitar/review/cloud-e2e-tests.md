# SonarQube Cloud E2E tests

Apply to `private/sq-cloud-e2e-tests/**` and shared fixtures or dispatch changes
used by that package. Follow the shared [E2E policy](e2e-tests.md); Jest/RTL
conventions do not apply to Playwright browser tests.

## Fixtures, APIs and browser setup

- Reuse `utils/test-extended`, `fixtures/`, `utils/api/domains/`, provider clients
  in `utils/api/3rd-party/` and `utils/factories/`. Keep business transport out of
  specs and reusable UI interactions in page objects.
- `api`, `factories` and `urlNav` are test-scoped. Use `createSuiteApi` for suite
  hooks and close its browser context even after cleanup failures. Cloud factories
  do not automatically track/delete resources; explicit teardown is required.
- Use the supplied `page` fixture by default, with `test.use()` options for a
  different initial authentication state or `launchDarklyFlagOverrides`. Create
  extra pages/contexts only for scenarios requiring simultaneous sessions. For
  those pages, call `setupE2ePage` with the scenario's overrides before navigation
  and explicitly close the owned contexts. Keep interception in the shared helper.
- Use existing scanner helpers and analysis completion waits, preserving the
  selected environment's UI/API endpoints and isolated scanner caches.
- Reuse shared browser scenarios, page objects and samples through
  `~e2e-shared/*` when both products use them. Keep Cloud auth/API/lifecycle local.
  Shared code imports only Playwright and Node built-ins.

## State, ownership and concurrency

- Prefer unique per-run resources via `generateUniqueId()`. Respect each suite's
  documented persistent state, particularly App smoke's organization/project;
  teardown removes owned temporary resources rather than durable fixtures.
- Shared provider accounts and organizations are not disposable run-owned data.
  Use the existing account/session helpers. Isolate account-level or integration
  mutations with a dedicated account when other suites rely on that state.
  Never commit `.env`, credentials, browser auth state or generated analysis output.
- Judge `allowConcurrency` for setup, specs and teardown against the same
  environment. Read-only shared state or unique resources can be safe; destructive
  mutation of a shared account/provider resource is not. Default to false if unsure.

## Registration and CI

- Register only leaf projects in `suites.config.json`; dependencies/teardown belong
  in the Playwright project graph. One project belongs to one suite. Combine
  existing suite keys at dispatch rather than duplicating project ownership.
- Declare the GitHub/Bitbucket accounts used by the suite so session refresh is
  accurate. Update the README suite/state table when lifecycle or registry changes.
- Preserve setup/teardown when targeting tests: do not use `--no-deps`.
  Browser variants are executions of one logical suite, not extra CI suites.
- Resolve the deployed environment from the user's instructions, the PR deployment
  label or local configuration. Ask the user before running tests when the target
  is missing, ambiguous or conflicting; do not silently default to an environment.
  Preserve existing deployment gates when adding on-demand label selection; keep
  labels and registry synchronized.
  Follow the package README/AGENTS for cross-repository tokens and caller permissions.
- Keep the enterprise-login project graph dormant unless its dedicated reactivation
  work includes deployed-E2E validation.
