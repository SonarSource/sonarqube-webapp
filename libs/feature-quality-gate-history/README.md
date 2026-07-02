# feature-quality-gate-history

This library was generated with [Nx](https://nx.dev) using our internal `shared-library` generator.

## Description

Shared (SonarQube Server + Cloud) project-level **Quality Gate History** page, under the
**Reporting** navigation group. It visualizes the quality gate adherence of the project's
**main-branch releases** so engineering managers can spot "risky" releases (code promoted with a
failing gate) — see MMF-5537 "Monitor guardrails adherence".

Each main-branch analysis carrying a `VERSION` event is treated as a release, and is marked:

- **safe** — the quality gate (`alert_status`) was passing (`OK`/`WARN`) at release time, or
- **risky** — the quality gate was failing (`ERROR`) at release time.

The page shows the safe/risky ratio and a horizontal timeline of releases over switchable periods
(All time / 30 days / 6 months / 1 year), and handles its own states:

- **Not compatible** — the project's main-branch New Code Definition is not "Previous version".
- **No releases yet** — no `VERSION` events (e.g. `sonar.projectVersion` is never set).
- **No releases in the selected period**.
- **Chart** — otherwise.

It is **main-branch only** (Phase 1); PR/branch-level history is out of scope.

### Data & adapters

The page is UI-only — all data already exists in the backend. It reads through `~adapters`:

- `useVersionAnalysesQuery` — `api/project_analyses/search?category=VERSION` (fetch-all).
- `useAlertStatusHistoryQuery` — `alert_status` measure history (reuses the shared
  measures-history query).
- `useProjectNewCodeDefinitionQuery` — the project's main-branch New Code Definition, normalized
  to the shared `NewCodeDefinitionType`.

### Where it's surfaced

- A **Reporting** nav item ("Quality Gate History", main branch only).
- An icon link next to the quality gate status on the project Summary (Cloud) / Overview (Server),
  via the `QualityGateHistoryLink` component.

> `IconPulse` is a **temporary** local icon (Echoes has no pulse icon yet). Replace its three
> usages with the Echoes icon once available, then delete `components/IconPulse.tsx`.

## How to use it?

### Building

The library is built as part of either the SQ-Server or SQ-Cloud build process. It doesn't have its own build process.

Use either:

- `yarn nx build sq-server`
- `yarn nx build sq-cloud`

### Running tests

The library's tests are run as part of SQ-Server and SQ-Cloud tests. They don't have their own test process.

Use either:

- `yarn nx test sq-server`
- `yarn nx test sq-cloud`

or optionally run only the tests of this library with:

- `yarn nx test sq-server libs/feature-quality-gate-history`
- `yarn nx test sq-cloud libs/feature-quality-gate-history`

### Linting

The library can be linted in isolation with:

- `yarn nx lint feature-quality-gate-history`

### Typechecking

The library can only be typechecked as part of the SQ-Server or SQ-cloud typechecking process. It doesn't have its own typechecking process.

Use either:

- `yarn nx ts-check sq-server`
- `yarn nx ts-check sq-cloud`

### Formatting

The library can be formatted in isolation with either:

- `yarn nx format-check feature-quality-gate-history`
- `yarn nx format-check feature-quality-gate-history --write`
