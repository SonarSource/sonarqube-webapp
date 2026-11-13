# SonarQube Server E2E tests

Apply these rules to `private/sq-server-e2e-tests/**` and changes to shared
fixtures or provisioning used by that package. These are Playwright conventions;
the Jest/RTL-specific testing conventions do not apply to these browser tests.
Also apply the shared [E2E coverage and lifecycle policy](e2e-tests.md).

## Coverage and assertions

- Exercise observable SonarQube behavior against a real server. Follow the shared
  policy when selecting new coverage. Backend-only database, SQL and scanner
  contracts belong in backend tests.
- Use concise English test/describe titles naming the behavior and distinguishing
  actor or condition, including parameterized cases.
- Use APIs for prerequisites and cleanup, and browser actions for the behavior
  under test. Keep feature data and notice dismissal scenario-specific; do not
  globally seed feature data or dismiss onboarding. Preserve real initial consent,
  password and mode state when the scenario observes it.
- Preserve negative assertions, hidden-versus-absent distinctions and native/ARIA
  checked semantics. Wait for the intended target and observable final state.
  Fixed sleeps, inflated timeouts or weaker assertions must not mask races; apply
  the shared policy's narrow retry criterion.
- Validate harness, page-object, lifecycle and scanner changes through affected
  product scenarios; do not create tests of test infrastructure.

## Boundaries and reuse

- Reuse or extend page objects in `src/fixtures` before adding another. They own
  locators, browser actions, readiness waits and UI assertions. Specs own actors,
  API prerequisites/assertions, scan/service order and cleanup. Page-object
  classes use a `Page` suffix and instances descriptive names such as `rulesPage`.
  Avoid base-page hierarchies or global page fixtures without a concrete need.
- Keep business endpoints and transport inside typed `src/api` domains. Specs,
  scenario helpers and factories use `SqsApiClient` domain methods. Extend existing
  domains before adding another helper. Factories compose resource graphs; scenario
  helpers retain actor choices, services and scan sequences. Use the shared `runScan`.
- Share product-agnostic browser helpers and samples with Cloud through
  `private/e2e-shared-fixtures` and `~e2e-shared/*`. Keep Server API, login, scanner
  and lifecycle code local.
- Reuse the smallest suitable package-owned sample under `test-data`, resolved by
  `resolveTestData`. Copy samples before scanning or mutation. Keep meaningful
  paths, measures and metadata; exclude generated scanner output and secrets.
  Do not read or download sample data from a backend checkout.
  `SONAR_ENTERPRISE_DIR` supplies distributions, plugins and binary tooling only.
- Preserve context paths in navigation, API/scanner URLs and callbacks through
  existing URL helpers; `enterprise-quality` exercises a non-root context path.

## Suite and server ownership

- For a new test case or file, first find suites with a compatible edition and
  configuration: plugins, startup properties, services and state/lifecycle needs.
  When several suites are compatible, prefer the lighter suite to balance the
  workload. Use recent CI durations where available, with test counts and expected
  cost (such as scans or server starts) as a fallback. Aim for comparable suite
  runtimes so one suite does not take several times longer than its peers.
  Compatibility and lifecycle constraints take precedence over balancing.
- Keep compatible cases on an existing shared suite server. Add a suite only with
  its first runnable case. Register its config, one edition and all plugins in
  `suites.config.json`; registry helpers supply edition/plugin paths to setup.
  Keep configs, provisioning and README aligned instead of duplicating plugin lists.
- Shared-server specs import `test`/`expect` from `~src/fixtures/test-extended`.
  Its worker-scoped `api` supports suite hooks; its test-scoped `factories` cannot
  be used in `beforeAll` or `afterAll`. Global setup owns the server handle and
  returns cleanup calling `server.stop(true)`; avoid serialized handle handoffs.
- Use `community-fresh-server` and `~src/fixtures/test-fresh-server` when shared-state
  restoration would lose startup coverage or configuration is incompatible.
  Declare `serverOptions` and any `pluginPackaging` through `test.use()`.
  API and factories are test-scoped; factory cleanup precedes shutdown.
  Do not start servers inline in specs, disable `baseURL`, or seed consent to
  bypass startup behavior. Document why a shared server cannot cover the case.
- Keep one worker and sequential local suite execution: the embedded database
  uses a fixed port. Parallel CI uses isolated suite jobs.

## Cleanup and validation

- Register ownership before resource creation, renaming or other UI mutations to
  cover partial setup failures. The supplied `factories` fixture cleans up
  automatically; manually constructed `FactoriesClient` instances need explicit
  cleanup. Capture prior settings/defaults and restore references before deleting
  temporary resources. Do not reset unrelated server state.
- Close additional browser contexts, services and temporary directories explicitly;
  stopping the server does not release them. Attempt all owned cleanup even when
  one action fails, using existing aggregate cleanup patterns where appropriate.
  After changing credentials, use a client with the new credentials for cleanup.
- Run affected real-product scenarios, including callers of shared helpers and
  suite peers when state changes could leak. Confirm teardown and diagnostic logs.
  Test discovery alone does not validate product behavior. Report blocked or
  pending checks separately from successful executions; evidence from an earlier
  revision does not establish success on the latest head.
