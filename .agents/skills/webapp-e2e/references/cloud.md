# Cloud workflow

Read the package [AGENTS.md](../../../../private/sq-cloud-e2e-tests/AGENTS.md),
[README.md](../../../../private/sq-cloud-e2e-tests/README.md), the affected domain's
README when present, and [review rules](../../../../.gitar/review/cloud-e2e-tests.md).
Paths below are relative to `private/sq-cloud-e2e-tests`.

## Environment, authentication and resource lifetime

Cloud runs against a deployed environment selected by `ACCEPTANCE_TESTS_URL`.
Use `.env` from `env.list.example` locally and select the CI environment explicitly.
Authentication state lives under `playwright/.auth`; never commit it or credentials.
Reuse existing authentication through the GitHub passkey/session helpers or
Bitbucket TOTP setup. Request user help when interactive sign-in is actually needed.

Use `test` from `utils/test-extended`: `api`, `factories` and `urlNav` are
**test-scoped**. Unlike Server, the Cloud `factories` fixture does **not** track
or automatically clean up resources. Implement teardown explicitly. For suite
hooks, use `createSuiteApi(browser, storageState)` from `utils/suiteApi`, clean
up owned resources and close its context even if cleanup fails.

Use the supplied `page` fixture by default: it installs interceptors and
LaunchDarkly overrides and provides automatic page/context teardown. Change its
options with `test.use()` when a scenario needs different authentication or flags.
Additional pages/contexts are an exception for simultaneous sessions; follow the
[page setup and ownership rules](../../../../.gitar/review/cloud-e2e-tests.md#fixtures-apis-and-browser-setup).

Prefer unique per-run names with `generateUniqueId()`. Inspect each suite's
state/lifecycle documentation: App smoke deliberately retains its organization
and analyzed project, while other suites own temporary organizations, tokens,
projects or provider installations. Preserve declared persistent fixtures. Shared
provider accounts are dependencies, not resources to delete indiscriminately.

## Existing implementation paths

- Browser interactions: `fixtures/`; business API domains: `utils/api/domains/`;
  provider API clients: `utils/api/3rd-party/`; resource composition:
  `utils/factories/`. Reuse them instead of inline transport or repeated UI setup.
- Reuse `runLocalAnalysis`/`runBranchAnalysis` from `utils/helpers` and existing
  analysis-processing waits. They select environment-specific UI/API endpoints
  and isolate scanner caches; do not substitute Server scanner/lifecycle helpers.
- Quality Gates and AICA illustrate unique per-run resources and suite API contexts.
  App architecture smoke illustrates a shared browser scenario with persistent
  Cloud setup. Inspect each example's actual cleanup before copying it.

## Project graph, registry and execution

Cloud uses named Playwright projects and a CI-facing suite registry. Follow the
package README's [suite registration and concurrency contract](../../../../private/sq-cloud-e2e-tests/README.md#adding-or-changing-a-suite)
and [CI caller/dispatch instructions](../../../../private/sq-cloud-e2e-tests/README.md#run-in-ci).
The [Cloud review rules](../../../../.gitar/review/cloud-e2e-tests.md#registration-and-ci)
cover review checks; package AGENTS.md retains cross-repository migration details.

For a targeted local run, use the README's [single-test lifecycle selection](../../../../private/sq-cloud-e2e-tests/README.md#run-one-test-with-its-lifecycle).
For agent execution, use its [non-interactive run command](../../../../private/sq-cloud-e2e-tests/README.md#non-interactive-runs);
`yarn e2e` opens interactive UI mode. Keep dependency and teardown projects enabled. Consult the
[dormant SSO documentation](../../../../private/sq-cloud-e2e-tests/README.md#dormant-enterprise-sso-suite)
before considering its project graph.

## Validation loop

1. Resolve the deployed dev environment from the user's instructions, the PR's
   deployment label or local configuration (`ACCEPTANCE_TESTS_URL` / `.env`). If
   the target is missing, ambiguous or conflicting, ask the user which environment
   to use before running tests; do not silently choose a default. Set or pass the
   resolved target through `ACCEPTANCE_TESTS_URL` locally or the CI dispatch
   environment. Confirm the environment has the frontend/backend
   versions and feature configuration needed for the scenario. Test-only edits can
   use an existing compatible deployment; product edits need a deployment that
   contains those changes before the browser result can validate them.
2. Run the selected Playwright project against that environment, locally or through
   the Cloud dispatcher. Keep its dependency and teardown projects enabled. Use
   the declared test account and respect the registry's concurrency setting.
3. Inspect the report/trace and verify cleanup. Fix test/setup failures and rerun
   against the same compatible deployment. Report product failures outside the
   requested work. When product fixes are in scope, validate against a deployment
   containing the fix before claiming success. Include other affected callers and
   respect persistent shared state during iteration.
4. Run the requested broader CI suites against the intended deployment. Distinguish
   the test-code revision from the deployed application revision in the results;
   checking out new test code does not deploy the application. Preserve deployment
   gates and on-demand selection described in the shared policy and package README.

If no suitable deployed environment or authentication is available, report the
blocker. Local browser execution does not replace a deployed Cloud environment.
