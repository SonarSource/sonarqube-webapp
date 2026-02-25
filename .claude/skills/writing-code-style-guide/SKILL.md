---
name: writing-code-style-guide
description: "This skill contains in-depth code style guidance and best practices.  You should read it before writing application code."
allowed-tools: Read, Grep, Glob
---

# Writing Code Style Guide

## Avoid default exports

Default exports can lead to confusion as they can be imported with a different name, sometimes unwittingly.

- AVOID default exports  `export default <const, function, etc>`
- PREFER named exports `export { }` or `export <const, function, etc>`

## JS Style guide

- use meaningful names for constants, functions, components
- don’t hesitate to use blank lines to separate distinct successive elements

We use functional components instead of class components. There are still some class components, we should migrate away from these as appropriate.

## Using @emotion.js

We mostly prefer Tailwind helper classes for styling, but Emotion.js can also be used to build components.

## Localization (L10N)

For now, any text that is to appear in the UI must be declared in English:

- in `libs/sq-server-commons/src/l10n/default.ts` for SQS
- in `private/apps/sq-cloud/src/l10n/messages.json` for SQC

Text should always be plain text, and no markup is allowed.

- AVOID `translate()` and `translateWithParameters()`
- PREFER `<FormattedMessage id="msg_id" />` or `intl.formatMessage({ id: 'msg_id' })`

### Accessing the `intl` object

- `const intl = useIntl();` can be used inside functional components
- `const intl = getIntl();` can be used everywhere else.

### Injecting additional markup

The `<FormattedMessage>` component from React Intl also allows to inject additional markup. For instance:

```jsx
<FormattedMessage
  id="billing.price_from_x"
  values={{
    price: <span className="big">{formatPrice(startingPrice)}</span>
  }}
/>
```

### Avoiding fragmented translations

Currently, most of the code uses fragmented translations to style elements or add interactive embedded elements. e.g.:

```tsx
// Do not do this:
<FormattedMessage
  id="portfolio_overview.desciption"
  values={{
    link: (
      <DocumentationLink to={DocLink.ManagingPortfolios}>
        {translate('portfolio_overview.desciption.link')}
      </DocumentationLink>
    ),
  }}
/>
// Translation looks like:
// portfolio_overview.desciption=A summary of information from the project branches that was chosen for this portfolio. To learn more about how portfolio ratings are calculated, see {link}.
// portfolio_overview.desciption.link=managing portfolios documentation
```

This makes the translation more challenging. We can minimize the transition load by using rich translations. The above example would be rewritten:

```tsx
// Do this instead:
<FormattedMessage
  id="portfolio_overview.desciption"
  values={{
    link: (text) => (
      <DocumentationLink to={DocLink.ManagingPortfolios}>
        {text}
      </DocumentationLink>
    ),
  }}
/>
// Translation looks like:
// portfolio_overview.desciption=A summary of information from the project branches that was chosen for this portfolio. To learn more about how portfolio ratings are calculated, see <link>managing portfolios documentation</link>.
```
