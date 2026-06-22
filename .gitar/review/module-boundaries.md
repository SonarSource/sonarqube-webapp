# Module Boundaries and Code Placement

## Module boundary violations

- Code in `libs/shared` importing directly from `private/` — shared code must never depend on private code.
- Code in `libs/shared` importing from `apps/sq-server*` or `apps/sq-cloud*` — shared code must not depend on app-level code.
- Code in `apps/sq-server` importing directly from `private/` — it must go through the `libs/sq-server-addons` bridge.
- Code in `sq-cloud` importing from `sq-server*` — cloud must not depend on server code.
- A new feature in `private/libs/feature-*` not wired through `libs/sq-server-addons` — SQS won't be able to load it.
- Public code that would break if the `private/` folder were removed entirely.

## LaunchDarkly feature flags

- Shared code must use the custom `useFlags` implementation, not the standard `useFlags` from `launchdarkly-react-client-sdk` directly — the custom one uses real LD on SQC but reads a static array on SQS, so using the wrong one silently breaks SQS. This is ESLint-enforced.

## Code placement

- New code landing in `apps/sq-server/src` or `private/apps/sq-cloud/src` that is generic enough to belong in `libs/shared` or a `libs/feature-*` module.
- Utility functions or types duplicated between the two apps instead of being extracted to `libs/shared`.
- A new feature module created inside `apps/` instead of `libs/feature-*` — features should be shareable by default.
- Changes touching similarly-named files in both `apps/sq-server` and `private/apps/sq-cloud` — consider moving the shared logic to `libs/shared` instead of duplicating changes across both apps.
- If the same logic applies to both SQS and SQC, place it in `libs/shared` or a `libs/feature-*` module — don't duplicate across both apps.
- New features should be shared as much as possible and belong in `libs/feature-*`, not inside `apps/`.
