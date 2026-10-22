# SonarQube Server Community OpenAPI Client

This public Nx library generates endpoint functions and types with Hey API from the checked-in SonarQube Server Community OpenAPI specification. The Community specification is the subset of API v2 that every SonarQube Server edition serves. The client is exposed to `apps/sq-server` and Server-only libraries through the `~sq-server-openapi-community` alias. Its `scope:server` Nx tag and the module boundary rules prohibit imports from Cloud and shared libraries. Shared features that need product-specific API behavior must use the adapters. The specification lives in `specs/`; generated code lives in `src/generated/`. Do not edit generated files manually.

## Refresh and regenerate

Use the [generate-openapi-clients skill](../../.agents/skills/generate-openapi-clients/SKILL.md) to refresh the specification from an immutable upstream revision. Fetching requires `gh` or an equivalent authenticated GitHub client. Regeneration uses the checked-in specification and installed, pinned development dependencies:

```sh
yarn nx run sq-server-openapi-community:generate
```

Run the library's `format-check`, `lint`, and `ts-check` targets and `yarn nx run sq-server:ts-check`.

The specification declares its paths relative to the `/api/v2` server. The generator moves that prefix into each path so generated URLs read `/api/v2/...` and the Axios base URL remains the deployment context path. Function names come from the upstream operation IDs; fix unclear names in the backend controllers, not here.

## Consume endpoints

Import functions and types from the public entry point:

```ts
import { search, type SearchData } from '~sq-server-openapi-community';

export async function searchUsers(query: SearchData['query']) {
  const response = await search({ query });
  return response.data;
}
```

The generated SDK returns a response containing `data`; it does not return the body directly like the legacy Axios clients. Errors reject by default and show the existing error toast. Keep handwritten TanStack Query hooks and call the generated functions from them.

The runtime reuses the SonarQube Server Axios adapter configuration, including the base URL, CSRF handling, and merge-patch headers. It preserves full Axios responses for Hey API and serializes array query parameters as repeated keys. Runtime setup and generated client internals are not public import paths.
