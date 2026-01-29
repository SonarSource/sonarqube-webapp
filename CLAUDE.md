- Read @README.md every time you start.
- Read @package.json every time you start.
- Read @nx.json every time you start.

# About this project

This project is a monorepo that contains many packages to build a SaaS Cloud and On-prem Server version of the SonarQube Frontend.

**Note:** Check for a `CLAUDE-personal.md` file in the workspace root for personal preferences that complement these instructions.

# Testing, Linting, and running Tools

There are many configuration files for tools like linting and testing. If needed, check and read the relevent config files before deciding on what to do.

Tests can be run and targeted to a particular directory or file like so:

- `yarn nx run sq-server:test /path/to/tests`
- `yarn nx run sq-cloud:test /path/to/tests`

When running tests, pick the most relevent platform (cloud or server) and narrowly scope the test run to the files you've modified as tests take time to run.

- ALWAYS use `await selector.find()` instead of `waitfor()` when looking for a possibly not-yet-rendered selector.

# Writing Code

- Try not to write duplicate code, and reorganize if necessary to keep things DRY.
- Never attempt to fix linting issues until you believe the implementation is correct.
- Always fix typescript errors
- For components, always prefer `export { ComponentName }` intead of `export default ComponentName()` (it prevents renaming of components at import)
- **MANDATORY**: ALWAYS run `yarn prettier --write <file>` immediately after editing any file to ensure proper formatting.

## Tailwind and CSS

- `sw-*` is our custom tailwind prefix.
- Prefer tailwind helper classes over custom CSS (using emotion) when possible.

## Echoes Component Styling

- **ALWAYS** prefer semantic Echoes component properties over low-level Tailwind styling classes
- **ALWAYS** prefer echoes components over legacy `design-system` components for new code.
- Use component-specific props for visual styling (colors, fonts, sizes, emphasis) rather than manual CSS classes
- Reserve custom Tailwind only for layout concerns (spacing, positioning, dimensions)
- Examples: `isSubtle` instead of `sw-text-gray-600`, `size="small"` instead of `sw-text-sm`, `colorOverride="danger"` instead of `sw-text-red-600`

## React Components and JSX

- Use functional components and TypeScript interfaces.
- Use declarative JSX.
- Use function, not const, for components.
- **MANDATORY**: All newly created components MUST be functional components. No class components allowed.

## Localization

- If you make a new localization key, say so when you summarize your changes!
- Do not try to update the localization file (messages.json or default.ts)
- Do not use default messages in code. Only use a key.

## React Query / TanStack Query Best Practices

**Core Principle**: Always reuse existing queries/mutations and return standard TanStack Query results.

### Queries

- **NEVER** create custom interfaces when reusing existing queries: `return { data: transformedData, isLoading, customField: 'value' }`
- **ALWAYS** return exactly what the base query returns when reusing: `return baseQuery` or `return baseQuery({ select })`
- Use `createQueryHook` for base to enable `select`, `enabled` and other options override support
- Call base queries with `select` parameter for data transformation: `useBaseQuery(params, { select: (data) => transformedData })`

### Mutations

- **NEVER** wrap mutations when reusing existing ones: `return { isPending: mutation.isPending, mutate: customMutate }`
- **ALWAYS** use `useMutation({ mutationFn: async (input) => existingMutation.mutateAsync(transformedInput) })` if you need to reuse existing mutations.
