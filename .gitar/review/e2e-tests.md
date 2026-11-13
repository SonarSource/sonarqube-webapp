# E2E coverage and lifecycle policy

Apply to new or updated Playwright scenarios in `private/sq-cloud-e2e-tests/**`,
`private/sq-server-e2e-tests/**`, and their shared fixtures and CI integration.
Based on the team's [E2E Tests (Playwright) guidelines](https://xtranet-sonarsource.atlassian.net/wiki/spaces/Platform/pages/5590581322/E2E+Tests+Playwright+-+Guidelines).

## What kind of feature should you test?

Keep as few E2E scenarios as possible: they are costly to write and maintain.
Cover crucial user journeys whose correctness is sensitive to UI/backend
synchronization. The team's coverage categories include DOP integrations (GitHub,
Bitbucket and Okta/SAML) and app smoke tests (login, navigation and no errors).
Use these as coverage categories, rather than treating every feature as needing E2E.

## What to test in your feature?

For new scenarios, cover the core happy path rather than every path through a
feature. Put complex combinations, error handling and edge cases in unit or
frontend integration tests with mocked APIs. Define a user journey that validates
the service through the UI: what actions does the user take, and what information
do they expect? Keep that visible outcome as the scenario's purpose.

## Ownership

Place feature tests in their domain's directory within the relevant E2E module
(`private/sq-cloud-e2e-tests/tests/<domain>` or
`private/sq-server-e2e-tests/tests/<domain>`). Add new domain directories to
`.github/CODEOWNERS` with the responsible team or squad; check ownership when
moving tests too. Existing E2E domains do not all have explicit entries yet. When
changing such a domain, identify its responsible team from the feature ownership
and add the missing mapping for that domain; do not assume an absent entry proves
ownership or assign every domain to one team.

## How to test?

- Setup is not the behavior under test: use the API client for speed and
  reliability. Require the expected clean starting state; fail with a clear
  diagnostic if it is unexpectedly dirty. Do not repair an unknown or messy
  environment by deleting unrelated state. Explicitly declared persistent fixtures
  still need their expected state checked.
- Teardown is not the behavior under test either: use the API. Clean up only the
  run's owned resources and restore settings the run changed. Include resources
  left by partial setup or by a failed UI step, such as an intended deletion that
  never happened. Ignore owned resources that have already disappeared and keep
  attempting independent cleanup when another action fails.
- Configure retries only when a scenario can normally recover on its own, which
  is unusual. Do not use retries to hide deterministic failures or dirty state.
- Wait for sequential events explicitly; timeouts do not replace those waits.
  Customize the test timeout for genuinely slow operations when necessary.

## When to run the tests?

The team's Cloud policy distinguishes two scopes:

- Core tests run on PRs on demand through the DevX-associated label, and on the
  main branch as a deployment gate.
- Additional tests also run on the main branch as a deployment gate. On PRs they
  run on demand when all tests are explicitly selected through the DevX label.
  This scope includes scenarios interacting with third-party UIs, such as GitHub.

Use the [Cloud registry and label-selection documentation](../../private/sq-cloud-e2e-tests/README.md#selecting-suites-from-pull-request-labels)
for the actual suite keys, labels and caller wiring. Preserve deployment gates
when changing selection. For Server, follow its
[registered suites and dispatcher](../../private/sq-server-e2e-tests/README.md#add-or-update-a-suite);
the Cloud core/additional labels do not establish a Server deployment gate.
