# Translation catalogs

Translations are maintained directly in source catalogs per product:

- Cloud: `private/apps/sq-cloud/src/l10n/messages/<group>.json`.
- Server: `libs/sq-server-commons/src/l10n/default/<group>.ts`.

| Group          | Contents                                                                     |
| -------------- | ---------------------------------------------------------------------------- |
| administration | Organizations, enterprises, settings, users, permissions, and administration |
| dictionary     | Common words and generic labels                                              |
| billing        | Billing and licenses                                                         |
| onboarding     | Onboarding, onboarding dashboard, and tutorials                              |
| projects       | Projects, branches, analysis, source viewer, activity, and project settings  |
| quality        | Rules, profiles, gates, issues, hotspots, and Clean Code Taxonomy            |
| security       | Dependencies, architecture, agents, AI capabilities, and security reports    |
| measures       | Metrics, measures, overview, dashboards, and summaries                       |
| portfolios     | Portfolios, portfolio dashboards, and views                                  |
| shared         | Common messages and namespaces outside the feature groups                    |

Edit the relevant source catalog and put each key in exactly one file per product.
When introducing a namespace, choose its feature catalog or shared. Keep related
messages together. No build-time classifier moves keys between files.

Cloud's `l10n/messages.ts` and Server's `l10n/default.ts` merge the catalogs eagerly.
Existing translation lookup APIs, dynamic message IDs, and Server backend/plugin
translation precedence remain unchanged. The same source modules are used in
production, development, and localization tooling. Cloud tests continue using an
empty catalog by default, with an explicit alias for tests needing real values.

Server's aggregate uses explicit `.ts` imports so Node can load it directly for
localization validation and `.properties` export. TypeScript's
`rewriteRelativeImportExtensions` option allows those imports and rewrites them to
JavaScript extensions when emitting code.

Run `yarn nx run private-config:validate-l10n` to check the configured shared keys
for missing entries or value differences between Cloud and Server. Both product
CI workflows and `yarn validate` include this target. Its cache tracks the
validator and both products' aggregate modules and feature catalogs.

## Chunk configuration

`translation-catalogs.js` contains ordinary chunk configuration, not a Vite plugin.
It assigns each source file its own `messages-<group>-<hash>.js` chunk. It neither
transforms source nor generates catalogs. Cloud emits these files at its output
root; Server places them under `js/`.

A translation edit changes its data chunk. Without chunk import maps, the changed
filename still propagates through importing application chunks. That separate
application-wide caching work does not require changing translation loading.
