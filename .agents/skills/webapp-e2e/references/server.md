# Server workflow

Read the package [AGENTS.md](../../../../private/sq-server-e2e-tests/AGENTS.md),
[README.md](../../../../private/sq-server-e2e-tests/README.md) and
[review rules](../../../../.gitar/review/server-e2e-tests.md).
Paths below are relative to `private/sq-server-e2e-tests`.

- Inspect `suites.config.json`, the relevant config/setup and a comparable spec.
  Choose an existing suite with a compatible edition, plugins, startup settings,
  services and lifecycle. If several qualify, prefer the lighter suite using recent
  CI runtime, or test counts and expected cost when timings are unavailable.
  Balance compatible suites so one does not become several times slower than its
  peers; compatibility takes priority. See the review rules for suite ownership.
- Shared-server specs import `~src/fixtures/test-extended`. Its `api` is
  worker-scoped; `factories` is test-scoped with automatic owned-resource cleanup.
  Factories cannot be used in `beforeAll`/`afterAll`. Manually constructed
  `FactoriesClient` instances require explicit cleanup.
- Untouched startup or incompatible configuration uses `community-fresh-server`
  and `~src/fixtures/test-fresh-server`, with options declared through `test.use()`.
  Its API/factories are test-scoped and cleanup runs before shutdown.
- Reuse page objects in `src/fixtures`, typed API domains in `src/api`, factories
  in `src/factories`, package-owned `test-data` and the shared `runScan` helper.
- Suite registry entries select one edition, plugin names and optional runner or
  license instrumentation. Setup resolves requirements through registry helpers.
  Check provisioning and README agreement when changing them. Keep context paths
  intact, including the non-root path exercised by `enterprise-quality`.
- Follow README prerequisites for distributions, test plugins, services and agents.
  Local suite commands support Playwright `--grep`; keep one worker and run suites
  sequentially because the embedded database uses a fixed port.

## Validation loop

1. Follow the README's [build and suite prerequisites](../../../../private/sq-server-e2e-tests/README.md#build-the-projects)
   using the `sonar-enterprise` checkout selected by `SONAR_ENTERPRISE_DIR` or the
   sibling checkout. Build the webapp and pass its output through `WEBAPP_BUILD_PATH`
   when building the distribution, then prepare the selected suite's plugins/services.
   Adapt the documented paths to the actual checkouts. Test-only edits can reuse
   compatible built artifacts.
2. Run the affected scenarios with their registered suite and `--grep`. The suite
   owns server startup/teardown. Keep local suites sequential with one worker.
3. Inspect the Playwright report/trace and server/service logs, fix the cause and
   rerun affected scenarios. Include other callers when changing shared helpers,
   and suite peers when setup/settings could leak between cases. Check cleanup.
4. After targeted scenarios and static checks pass, use parallel CI for broader
   regression when available. A full local regression is not required when CI
   provides it. Follow failures on the current PR head and repeat the affected
   checks after fixes. Use the Server dispatcher, not Cloud suite labels.

If local binaries or services are unavailable, report that blocker and use an
available CI run to validate the scenarios rather than claiming a local pass.
