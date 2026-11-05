# These are comments to the package.json file

## dependencies

### @aws-sdk/client-cloudwatch-logs

AWS SDK v3 CloudWatch Logs client — used by `sq-cloud-metrics` to push metrics to CloudWatch Logs for long-term trend tracking.

### @gitbook/embed

Embeds the SonarSource documentation Assistant in sq-cloud and registers the POC's browser-side read-only tools.

The `@gitbook/embed` patch passes the iframe origin and window to `bidc`. The `bidc` patch
accepts a connection only from that window and origin, and sends messages to that origin.
These patches keep unrelated pages from opening a tool channel in the signed-in browser tab.

### @xyflow/react

React-based interactive graph visualization library used by `feature-architecture` to render nodes, edges, handles, and controls for the architecture diagram, and to manage pan/zoom/selection interactions.

### cron-parser

Parses scheduled Remediation Agent recurrence rules to calculate the next run with timezone and daylight-saving support.

### @launchdarkly/react-sdk

LaunchDarkly SDK for React used by sq-cloud to manage feature flags.

### mixpanel-browser

Mixpanel browser SDK used by sq-cloud to send auto-capture events and replays to Mixpanel.

Cloud imports the documented `mixpanel-browser/src/loaders/loader-module-with-async-modules` entry
so optional recorder and targeting scripts load on demand. Vite URL imports emit both standalone
scripts from the pinned npm package as content-hashed build assets, keeping their bytes tied to
our deployment and the core SDK version. Only analytics API requests use the `/mp-api` proxy.
The SDK owns loading, sampling, and targeting. A shared declaration re-exports the package's public
types to supply the default export omitted by this entry's declaration in 2.84.0. The base Jest
configuration transforms the SDK's ESM source. No package patch or internal API integration is used.
Known upstream limitation: recording can start after consent is withdrawn during a module download.

### react-dnd

React drag and drop library used by the editable-multigrid component for drag-and-drop functionality in dashboard layouts.

### react-dnd-html5-backend

HTML5 backend for react-dnd, providing native HTML5 drag and drop support for the editable-multigrid component.

### react-markdown

Library to parse markdown into react components

### rehype-raw

Plugin to parse raw html string, into html tree. Used by react markdown

### remark-gfm

Plugin to support GitHub Flavoured Markdown. Used by react markdown

### valibot

Schema validation library used by sq-cloud to validate dashboard and widget configuration (e.g. project dashboard layout and widget props) with TypeScript enum support and proper type inference.

## devDependencies

### @aws-sdk/client-cloudwatch

Used by `.github/scripts/report-bundle-metrics/send-bundle-metrics.js` to send metrics to CloudWatch.

### @eslint/js

Required explicit dependency in ESLint v10 — provides `eslint:recommended` and other built-in rule configs. Was previously bundled inside the `eslint` package in v9 but is now a standalone package that must be declared explicitly.

### @hey-api/openapi-ts

Generates the checked-in SonarQube Cloud TypeScript types and Axios SDK from the merged OpenAPI contract, and the SonarQube Server types and Axios SDK from the Community OpenAPI specification.

The `@hey-api/json-schema-ref-parser/js-yaml` resolution keeps its exact transitive dependency on the nearest complete vulnerability fix.

### eslint-plugin-jest-dom (patched)

`eslint-plugin-jest-dom@5.5.0` uses the deprecated `context.getSourceCode()` API that was removed in ESLint v10, causing a hard crash at lint time. We apply a yarn patch (`config/patches/eslint-plugin-jest-dom-npm-5.5.0-2554d97d16.patch`) that replaces all `context.getSourceCode()` / `(0, _context.getSourceCode)(context)` calls with the ESLint 10-compatible `context.sourceCode` across every rule file. No upstream fix has been released yet.

### @cyclonedx/cdxgen

Library used to generate CycloneDX SBOM.

### @rolldown/plugin-babel

Runs the shared Babel configuration (Emotion and QA component attributes) alongside `@vitejs/plugin-react` v6, which no longer provides Babel transforms.

### @types/babel__core

Provides the Babel option types required by `@rolldown/plugin-babel` in the TypeScript Vite configuration.

### rolldown

Required peer dependency of `@rolldown/plugin-babel`, aligned with the Rolldown version used by Vite.

### @sprig-technologies/sprig-browser

Used by sq-cloud to show feedback forms created on the Sprig platform to our users.

### @swc-contrib/mut-cjs-exports

SWC plugin that makes CJS exports mutable (`configurable: true`) so that `jest.spyOn` can override re-exported bindings. Without it, SWC's strict `Object.defineProperty` descriptors prevent Jest from redefining module namespace properties.

### @swc/jest

Jest transformer that uses SWC instead of Babel for transpilation. Used by sq-server and sq-cloud tests for faster TypeScript and JSX compilation.

### @swc/plugin-emotion

SWC plugin that replicates the Emotion Babel plugin — adds auto-labels and source maps to `css`/`styled` calls so that snapshot serialization via `@emotion/jest/serializer` produces deterministic class names under SWC (note: generated hashes differ from the Babel plugin's, so existing snapshots referencing component selectors must be regenerated).

### @tanstack/react-query-devtools

Used in development mode to facilitate the debugging Tanstack Query's cache and state.

### @tony.ganchev/eslint-plugin-header

Replaces eslint-plugin-header, which has been abandoned.

### @typescript-eslint/rule-tester

Used to test our custom eslint rules in `./eslint-local-rules`.

### vite-tsconfig-paths

Vite plugin used to resolve TypeScript path aliases from tsconfig files.

### agentation

Tool to do UI annotations that are used by LLM do generate code changes.
See https://www.agentation.com/ for more details.
Add agentation-mcp config with `yarn dlx agentation-mcp init`. Start it with `yarn dlx agentation-mcp server`.

### cheerio

Used by sq-cloud-e2e-tests to load SAML files.

### env-cmd

Used by sq-cloud-e2e-tests to easily provide environment variables when running e2e tests.

### glob

Finds files matching patterns in validation scripts, Jest configuration, and Cloud test-metrics reporting. The direct dependency is pinned to 14.0.2, which includes the fix for CVE-2026-118773.

### http-proxy-middleware

Used by sq-cloud to proxy websockets correctly.

### jest-launchdarkly-mock

Used by tests as the stable import surface for LaunchDarkly mocks.

The upstream package still mocks `launchdarkly-react-client-sdk` directly, so the workspace Jest
config remaps the `jest-launchdarkly-mock` module name to a shared setup shim that targets
`@launchdarkly/react-sdk` instead.

### jest-watch-typeahead

Used in jest config files to improve the jest watch mode.

### knip

Finds unused files, dependencies, and exports across the monorepo. Configured in `knip.json` with plugins for Nx, Vite, Jest, ESLint, Playwright, Tailwind, Babel, and MSW. Run via `yarn knip` for the full graph or `yarn knip:production` for production-only analysis. Production patterns end in `!`; test and mock-only files are explicitly excluded there, while Knip ignores `@internal` exports in production and preserves `@public` exports as API surface. Production runs also ignore exports used within their declaring file, since their implementation is live production code even when the export exists only for tests. Knip treats re-exports as internally referenced under this option as well, so unused re-exports in intermediate barrel files are a known production-report blind spot; the full-graph run continues to report unnecessary exports that have no external consumers. Install the recommended [Knip VS Code extension](https://marketplace.visualstudio.com/items?itemName=webpro.vscode-knip) (`webpro.vscode-knip`) for inline diagnostics while editing. Validate jobs run `yarn knip:report`, which writes a shared Sonar report at `build/reports/knip/external-issues.json` for import via `sonar.externalIssuesReportPaths` (each product scan imports only issues on files in its own `sonar.sources`). Run `yarn test-knip-report` for reporter unit tests.

The Knip scripts prefix the command with `NX_DAEMON=false`. Knip loads tool configs (e.g. `jest.config.ts` via the Jest plugin), which can invoke Nx APIs and trip the background Nx daemon — often surfacing as `Daemon process terminated and closed the connection`. Disabling the daemon for read-only Knip runs is the [documented workaround](https://knip.dev/reference/known-issues#nx-daemon); it does not affect normal `yarn nx` usage.

### openapi-merge-cli

Combines the Enterprises and Organizations OpenAPI contracts, applying their gateway paths and stable conflict prefixes before client generation.

### msw

Used to mock API requests in tests and dev mode.

### otpauth

Used by sq-cloud-e2e-tests to generate TOTP codes when logging in github or bitbucket.

## resolutions

### @typescript-eslint/utils

`@nx/eslint-plugin@22.x` bundles its own nested `@typescript-eslint/utils@8.19.0`, which still imports `FlatESLint` from `eslint/use-at-your-own-risk` — an export removed in ESLint v10. The root-level `@typescript-eslint/utils@8.61.1` has the fix (nullish-coalescing fallback to `eslint.ESLint`). This resolution forces the fixed version everywhere, preventing the nested stale copy from being installed.

### @sentry/browser

This package is needed for any worker.ts functions outside of react and reports to sentry from the browser

### @sentry/vite-plugin

A Vite plugin that provides source map and release management support for Sentry.

### @tailwindcss/vite

Tailwind CSS v4 Vite plugin used by the SQS and SQC Vite builds to compile Tailwind CSS.

### @types/d3-selection

d3-zoom expects @types/d3-selection@3.0.x, so it may install a different version that breaks type resolution.
We force it to use the explicit version we declare (3.0.11)

### adm-zip

`sonarqube-scanner@4.3.8` still depends on `adm-zip@0.5.17`, which is reported as vulnerable on the SonarQube dependency-risks page. We keep the scanner on 4.3.8 because the repository imports it programmatically in the sq-cloud e2e helpers, and force `adm-zip@0.6.1` across transitive deps instead of taking a scanner major bump just to clear that archive dependency.

### axios

`sonarqube-scanner@4.3.8` pins axios to `1.17.0`, which is reported as vulnerable. The bare resolution forces all transitive dependents to use a more recent version that is not vulnerable.

### browserslist

Several build-time dependencies (`autoprefixer`, `core-js-compat`, `webpack`, and the direct root dependency) can otherwise resolve different `browserslist` patch versions, including versions reported as vulnerable on the SonarQube dependency-risks page. We pin `browserslist@4.28.8` everywhere so the browser-targeting toolchain stays aligned on the same fixed version.

### debug

We have many transitive dependencies that depend on debug and versions before ^4.3.0 have a vulnerability reported by Mend. It's to hard to track down all the dependencies that would need to be updated to ensure it's at the right version without a resolution.

### glob

The `glob` resolution defaults all consumers to 14.0.2, matching our direct dependency. The preceding `glob@npm:^7.1.4` exception keeps consumers of the older API on 7.2.3. Order matters: Yarn uses the first matching resolution, so keep the exception before the general `glob` entry. These transitive dependencies come from Jest, coverage tooling, cdxgen, Sentry build tooling, CTRF, and native-build/cache tooling.

[CVE-2026-118773](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) affects glob versions from 9.0.0 through 14.0.1: canceled asynchronous walks can continue traversing directories after an abort or timeout. Version 14.0.2 fixes this behavior. The exception preserves the existing glob 7 consumers, which are outside this advisory's affected range and require its older API.

These overrides cross major versions, so changes require checking test discovery, coverage file selection, and affected build/cache consumers. Remove the general override when parent dependencies accept a fixed version without it, and remove the glob 7 exception when no consumers require that API. New glob 7 dependency descriptors need their own exception before the general entry.

### jsdom

We patch jsdom to allow to mock the window.location objects in tests following the recommendations from jest team here: https://jestjs.io/blog#known-issues

### nwsapi

This is a dependency of jsdom and is a CSS selectors Engine, it can have a big impact on test performance.
Its versioning is closely tied to jsdom, to update it we should instead update jsdom or jest-environment-jsdom.

This is necessary, because more recent patch versions are broken.
(For instance: [2.2.14](https://github.com/dperini/nwsapi/issues/135))

### protobuf & protobufjs-cli

These packages are used to maintain contract validation between the frontend and analyzer in the architecture feature. the cli package is specifically used for the generation of the validation code and associated types.

### semver

We force all direct and transitive consumers to use semver v7 because older major versions have had Mend vulnerability findings. Keep this resolution even when a consumer declares a v6 range; removing it would reintroduce v6 into the dependency graph.

### yaml

We have multiple transitive dependencies on yaml and some before 2.0.0 have Mend vulnerabilities.
