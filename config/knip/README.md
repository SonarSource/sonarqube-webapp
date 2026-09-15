# Knip production analysis

The production report is intentionally conservative: avoiding false-positive Sonar issues takes
priority over finding every instance of dead code during the initial rollout.

Production scripts load `knip-production.config.ts`, which enables `ignoreExportsUsedInFile`. A
symbol referenced inside its declaring file is live production code, even if its export exists only
for a test, so it is omitted from the production report. Knip also treats re-exports such as
`export { value } from './module'` as internally referenced under this option, so unused re-exports
in intermediate barrel files are a known blind spot of the production report. The default
`yarn knip` run still uses `knip.json` directly and reports unnecessary exports using the full graph,
including tests.

## Cloud adapters

The broad `src/sq-cloud-adapters/**/*.{ts,tsx}!` entry pattern in `knip.json` is intentional. Shared
libraries import product-specific implementations through `~adapters`, which resolves to different
directories in the Server and Cloud TypeScript builds. Knip builds one repository graph and resolves
those shared imports to the Server adapters; it does not evaluate the same shared importer a second
time with the Cloud alias mapping.

Without the broad Cloud adapter entry pattern, implementations that are used only through a shared
`~adapters` import appear unreachable. Making the files entries prevents those false-positive unused
file findings. Since Knip does not report unused exports from entry files by default
(`includeEntryExports` is off), unused Cloud adapter exports, types, exported enum members,
namespace exports, namespace types, and namespace members are currently a known blind spot.
Duplicate exports are still reported.

Do not replace the broad entry pattern with only the workspace-scoped `paths` mapping. That mapping
resolves imports originating in the Cloud workspace but cannot reinterpret imports originating in a
shared workspace. Recovering reliable dead-code coverage for Cloud adapters requires a separate
Cloud-specific Knip analysis that evaluates shared code using the Cloud TypeScript alias context.
