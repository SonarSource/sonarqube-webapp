---
name: webapp-private-feature
description: 'Use when creating or restructuring a routed private/libs/feature-* library shared between SQ Cloud and SQ Server, whether routes are shared or platform-specific: scaffolding, layout, mounting, API/queries, l10n, tests, and gating.'
allowed-tools: Read, Grep, Glob, Bash
---

# Writing a private shared feature lib

This skill covers routed features with shared pages, whether route definitions live in the feature or in each platform's app. It does not cover embedded feature libraries without routes. Read `webapp-code-sharing` for the broader sharing model.

A `private/libs/feature-*` lib owns **everything platform-agnostic**: pages, components, API calls, queries, types, mocks, tests, and routes when those are shared. It does **not** own nav items, feature-flag/entitlement gating, or route mounting. Those live in each app.

- `feature-dast` is a relatively small, well scoped example. Cloud-only today, so no SQS wiring.
- `feature-sca` and `feature-architecture` are large, sophisticated features which expand upon this pattern.

## Scaffolding

Run `yarn nx g shared-library` (pick `type:feature` + `visibility:private`). It creates `project.json`, `tsconfig.json`, and adds the `~feature-name/*` alias to:

- `tsconfig.base.json`
- `apps/sq-server/tsconfig.json` and `private/apps/sq-cloud/tsconfig.json`
- `config/jest/jest.config.base.js`

After the generator has run, do these additional manual steps:

- Add `"validate-tailwind-prefixes": {}` to `project.json` targets.
- Delete the placeholder `src/index.ts`; do not add a barrel file. Consumers import deep paths (`~feature-name/routes` or `~feature-name/components/PageName/PageNameApp`). Barrels pull the whole lib into whatever imports them, defeating route lazy-loading and inviting circular imports.
- Fill in the generated `README.md` with feature-specific context if useful, or delete it. Don't leave the template TODO.
- Use the **private** copyright header (`All rights reserved`) for new source files; the generated placeholder has an LGPL header.

Tags: `["type:feature", "visibility:private", "scope:shared"]`. Features cannot depend on each other. If code needs sharing between features, extract it into a `type:util` library, typically `private/libs/shared` (`private-shared`).

## Directory Structure

Here is a sample directory structure for a hypothetical `private/libs/feature-name`

```
 feature-name
├──  project.json
├── 󱧼 src
│   ├── 󰒍 api
│   │   ├──  api-name.ts
│   │   └──  mocks
│   │       └──  ApiNameServiceMock.ts
│   ├──  components
│   │   ├──  PageName
│   │   │   ├──  __tests__
│   │   │   │   └──  PageName-it.tsx
│   │   │   ├──  PageNameApp.tsx
│   │   │   └──  PageNameSubComponent.tsx
│   │   ├──  AnotherPageName
│   │   │   ├──  AnotherPageApp.tsx
│   │   │   └──  AnotherPageSubComponent.tsx
│   │   └──  common
│   │       ├──  __tests__
│   │       │   └──  CommonComponent-test.tsx
│   │       ├──  CommonComponentOne.tsx
│   │       └──  CommonComponentTwo.tsx
│   ├──  constants.ts
│   ├──  helpers
│   │   ├──  mocks.ts
│   │   └──  urls.ts
│   ├──  hooks
│   │   └──  whateverOtherHook.ts
│   ├──  routes.tsx (only when routes are shared)
│   ├──  queries
│   │   └──  api-name.ts
│   └──  types.ts
└──  tsconfig.json
```

- One folder per page. Page entry component is `*App.tsx` (`ReleaseListApp`, `DastEnvironmentsListApp`).
- `api/x.ts` and `queries/x.ts` share a file name, one per backend resource.
- `helpers/mocks.ts` holds `mockThing(overrides)` data factories used by service mocks and tests.
- `helpers/urls.ts` holds route name constants and URL builder functions. Apps import these for nav links.
- Use `helpers/`, not `utils/`, for new feature helpers. `feature-sca` has both; don't copy that.

## Routes

When routes are shared, put all route groups in `src/routes.tsx`. Export `<Route>` fragments, not a router. Each page is lazy-loaded:

```tsx
const PageNameApp = lazyLoadComponent(() =>
  import('./components/PageName/PageNameApp').then(({ PageNameApp }) => ({ default: PageNameApp })),
);

export const featureNameRoutes = (
  <Route path={FEATURE_NAME_ROUTE}>
    <Route element={<PageNameApp />} index />
    <Route element={<DetailsApp />} path=":thingId" />
  </Route>
);
```

- Export separate fragments from `src/routes.tsx` per mount point when pages live under different parents (organization, project, license).
- Route paths are relative. The app decides the parent (`/organizations/:organizationKey/...`, project, etc).
- If route definitions differ between products, define them in each app instead. Import page entry components through deep paths; keep pages and other shared behavior in the feature. Do not force product-specific paths or containers into the shared lib.

## Mounting on each platform

**SQC**: import shared routes (or shared page components for app-specific routes) directly in `private/apps/sq-cloud/src/app/WebApp.tsx` and wrap in an app-owned container route:

```tsx
<Route element={<DastContainer />}>{dastRoutes}</Route>
```

The container (in `private/apps/sq-cloud/src/apps/<feature>/`) does gating (flag, entitlement, membership) and renders `<NotFound />` or `<Outlet />`.

**SQS**: goes through `sq-server-features` + the addons bridge (see `webapp-code-sharing`). Specifics:

- `private/libs/sq-server-features/src/feature-name/index.ts` is a thin re-export (`export * from '~feature-name/routes'`) when routes are shared. When routes differ, define the Server routes here using shared page components.
- Register in `private/libs/sq-server-addons/src/index.ts` under `AddonKeys` + `optionalAddons`.
- In `apps/sq-server`, always optional-chain `addons.featureName?.routes`; the addon is absent in the public build.

Skip SQS wiring if the feature is not shipped on SQS yet.

## Platform differences

`webapp-code-sharing` covers props injection vs `~adapters`. For a routed feature, "props injection" can use **outlet context**: the app container passes platform values (`organizationId`, `isAdmin`, urls) via `<Outlet context={...} />`. Export the context type from a shared module (`src/routes.tsx` when routes are shared) and read it with `useOutletContext<ContextType>()`. Prefer this over a new adapter for small, page-level data.

Never import `~sq-cloud/*`, `~sq-server-commons/*`, or `~sq-cloud-openapi/*` from the feature.

## API and Queries

- Shared features must necessarily consume an API surface that is consistent across Cloud and Server.
- Prefix v2 endpoints with `API_V2_BASE_URL` from `~adapters/helpers/urls` (`''` on SQC, `/api/v2` on SQS). Write the rest of the path literally at the call site: `` `${API_V2_BASE_URL}/detection-agent/dast-agent/environments` ``.
- Use `axiosClient` (global error toast) or `axiosToCatch` (caller handles errors) from `~shared/helpers/axios-clients`.
- Queries: `createQueryHook` / `createInfiniteQueryHook` + `queryOptions` from `~shared/queries/common`, with a `StaleTime` value. Mutations invalidate by query key prefix in `onSuccess`.
- Feature flags (`useFlags`, see `webapp-code-sharing`): a flag is falsy on SQS unless added to `defaultFlags` in `libs/sq-server-commons/src/sq-server-adapters/helpers/feature-flags.ts`.

## Localization

- `useIntl().formatMessage` / `<FormattedMessage>` with keys only, no default messages.
- Every key goes in **both** product catalogs when shipped on both platforms: Cloud `private/apps/sq-cloud/src/l10n/messages/` and Server `libs/sq-server-commons/src/l10n/default/` (or their legacy flat files if no catalog exists). Namespace keys by feature (`sca.*`, `dast.*`).

## Testing

Integration tests are preferred to unit tests. A component behavior that is well covered by an integration test should not be doubly covered by another unit test. Every component does NOT need a unit test. Unit tests are for additional coverage not practical to achieve via integration tests.

- Follow all guidance in `webapp-testing` skill.
- Service mocks should use MSW: extend `AbstractServiceMock<Data>` from `~shared/api/mocks/AbstractServiceMock`, define `handlers` with `http.get(...)`, and prefix URLs with `API_V2_MOCKS_PREFIX` from `~adapters/helpers/urls`. Register with `registerServiceMocks(mock)` in `beforeEach`, `mock.reset()` between tests. See `feature-sca/src/api/mocks/SettingsServiceMock.ts`.
- Older `feature-sca` HTTP mocks (`ReleaseServiceMock`) use `jest.mock('../releases')`. Don't copy that for HTTP; `jest.mock` is still appropriate for non-HTTP platform dependencies.
- `-it.tsx` tests render the **real exported route fragment** when routes are shared, or the app-owned route when they are platform-specific, with `renderWithRoutes` from `~shared/helpers/test-utils` and a real URL via `initialEntries`. This covers routing, lazy loading, and the page together.
- Mock `~adapters/*` hooks with `jest.mock` when the test needs a specific platform state (membership, plan).

## Feature flagging and enablement

Shared features can be flagged or enabled in different ways that vary by platform. Feature flagging is typically handled outside the private feature scope on each platform, such as in the conditional addition of a navigation item in the main sidebar or global nav.

- SQC: LaunchDarkly flag and/or entitlement check in the app container route (`DastContainer`, `ScaContainer`) **and** on the nav item. Gating only the nav leaves the URL reachable.
- SQS: gate the route in `startReactApp.tsx` with `availableFeatures.includes(Feature.X) && addons.featureName?.routes`, and gate the nav item with `useAvailableFeatures().hasFeature(Feature.X)`.
- If the enablement check is itself shared logic (e.g. `useScaEnabledQuery` in `feature-sca/src/queries/enablement.ts`), put the hook in the feature and let the app containers call it.
