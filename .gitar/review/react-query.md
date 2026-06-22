# React Query / TanStack Query Patterns

**Core Principle**: Always reuse existing queries/mutations and return standard TanStack Query results.

## Queries

- **NEVER** create custom interfaces when reusing existing queries: `return { data: transformedData, isLoading, customField: 'value' }`.
- **ALWAYS** return exactly what the base query returns when reusing: `return baseQuery` or `return baseQuery({ select })`.
- Use `createQueryHook` for base queries to enable `select`, `enabled`, and other options override support.
- Call base queries with `select` parameter for data transformation: `useBaseQuery(params, { select: (data) => transformedData })`.
- New query hooks that duplicate existing queries instead of calling them with a `select` parameter for data transformation.

## Mutations

- **NEVER** wrap mutations when reusing existing ones: `return { isPending: mutation.isPending, mutate: customMutate }`.
- **ALWAYS** use `useMutation({ mutationFn: async (input) => existingMutation.mutateAsync(transformedInput) })` if you need to reuse existing mutations.
