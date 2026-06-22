# Design System and Styling

## Echoes component usage

- **ALWAYS** prefer semantic Echoes component properties over low-level Tailwind styling classes — e.g. `isSubtle` instead of `sw-text-gray-600`, `size="small"` instead of `sw-text-sm`, `colorOverride="danger"` instead of `sw-text-red-600`.
- **ALWAYS** prefer echoes components over legacy `design-system` components for new code.
- Use component-specific props for visual styling (colors, fonts, sizes, emphasis) rather than manual CSS classes.
- Reserve custom Tailwind only for layout concerns (spacing, positioning, dimensions).
- New code importing from the legacy `design-system` package — should use `@sonarsource/echoes-react` components.

## Echoes design tokens

- New code using the old theming system (`themeColor` helper) — should use Echoes design tokens instead.
- Raw hex colours or hardcoded font sizes instead of Echoes CSS variables via `cssVar`.

## Tailwind and CSS

- `sw-*` is the custom tailwind prefix — use it consistently.
- Prefer Tailwind helper classes over custom CSS (using emotion) when possible.
