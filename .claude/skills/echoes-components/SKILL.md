---
name: echoes-components
description: Use whenever it is necessary to work with the echoes shared component library or design tokens from @sonarsource/echoes-react
---

# Instructions

When working with Echoes components from `@sonarsource/echoes-react` is it always necessary to know the correct usage of the components you're working with. Typically, you'll want to identify the set of components you care about, find them in the typescript reference tree, and look at their interfaces. The interfaces often contain usage documentation as well.

`components/index.d.ts` is a good place to begin.

Full props and example docs are available in the compiled type definitions in `./reference/components/`

## Finding the right file

You should check `./reference/components/<componentFolderName>/index.d.ts` first if looking for a component. The documentation you want may be in there rather than the component-named-file. If you don't see it there, move on to checking other places, but ALWAYS look in the index.

## Examples

- Button is described by `./reference/components/buttons/Button.d.ts`
- Table is described by `./reference/components/table/index.d.ts` and not `./reference/components/table/Table.d.ts`
- Banner is described by `./reference/components/layout/index.d.ts`

## Namespace components

Some components are "namespaced". `Table` has `Table.Body`, `Table.Row`, etc.

## Design tokens

CSS design tokens are defined in `./reference/generated/design-tokens-base.json.d.ts` and `./reference/generated/design-tokens-themed.json.d.ts`

You can infer the mapping between the value in that file and the CSS variable name `--echoes-*`

When using color tokens always prioritize accessing the design token with the `cssVar` function defined in `./reference/utils/design-tokens.d.ts`
