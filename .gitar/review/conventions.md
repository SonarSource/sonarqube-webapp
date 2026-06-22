# Codebase Conventions

## Naming and style

- Use meaningful names for constants, functions, and components.

## Localization

- New code using the legacy `translate` or `translateWithParameters` helpers — should use `formatMessage` or `<FormattedMessage>` instead.
- Do not use default messages in code. Only use a key.
- Localization updates go into: `private/apps/sq-cloud/src/l10n/messages.json` for SQC or `libs/sq-server-commons/src/l10n/default.ts` for SQS.
- If a new localization key is added, call it out in the summary.
- Inside functional components: `const { formatMessage } = useIntl()` — always destructure, never store the `intl` object and call `.formatMessage()` on it.
- Outside functional components (helpers, utils): use `const intl = getIntl()` instead.
- Prefer rich translations over fragmented ones — pass a render function instead of a nested translate call:

```tsx
// Avoid — fragmented
<FormattedMessage
  id="foo.description"
  values={{
    link: (
      <DocumentationLink to={DocLink.Foo}>
        {translate('foo.description.link')}
      </DocumentationLink>
    ),
  }}
/>

// Prefer — rich translation
<FormattedMessage
  id="foo.description"
  values={{
    link: (text) => (
      <DocumentationLink to={DocLink.Foo}>{text}</DocumentationLink>
    ),
  }}
/>
```

## React components

- Use functional components and TypeScript interfaces — no class components.
- Use declarative JSX.
- Use function declarations, not `const`, for components.
- Always prefer `export { ComponentName }` over `export default ComponentName` — prevents renaming at import.

## Testing

- Prefer testing-library assertions over snapshot tests when the behavior is easily assertable.
- Private feature tests in public test files must be wrapped in `// BEGIN-PRIVATE-FEATURE-TESTS` / `// END-PRIVATE-FEATURE-TESTS` markers.
- ALWAYS use `await selector.find()` instead of `waitFor()` when looking for a possibly not-yet-rendered selector.

## Dependencies

- New dependencies added to `package.json` without a corresponding entry in `package.json.md`.

## Diff hygiene

- Flag no-value stylistic changes like adding blank lines, reordering imports, or reformatting untouched code — these add noise to the diff without improving the code.
