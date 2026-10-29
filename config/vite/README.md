# Translation catalogs

Cloud translations live in feature catalogs under
`private/apps/sq-cloud/src/l10n/messages/`. When adding or editing a translation,
choose the matching catalog below. Keep related messages together and put each
key in exactly one catalog.

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

`private/apps/sq-cloud/src/l10n/messages.ts` imports and merges all Cloud catalogs.
When adding a catalog, also add its import and spread to this entry point. Keep
translation values in the catalogs themselves.

Server translations still live in `libs/sq-server-commons/src/l10n/default.ts`.

## Chunk configuration

`translation-catalogs.js` assigns each Cloud catalog its own
`messages-<group>-<hash>.js` chunk at the output root. A translation edit changes
only its catalog's data chunk. Changes to chunk filenames can still propagate to
importing application chunks; chunk import maps handle that separately.

Server keeps its single `messages` chunk under `js/`.
