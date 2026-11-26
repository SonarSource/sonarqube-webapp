# Design System and Styling

## Echoes component usage

- **ALWAYS** prefer semantic Echoes component properties over low-level Tailwind styling classes — e.g. `isSubtle` instead of `sw:text-gray-600`, `size="small"` instead of `sw:text-sm`, `colorOverride="danger"` instead of `sw:text-red-600`.
- **ALWAYS** prefer echoes components over legacy `design-system` components for new code.
- Use component-specific props for visual styling (colors, fonts, sizes, emphasis) rather than manual CSS classes.
- Reserve custom Tailwind only for layout concerns (spacing, positioning, dimensions).
- New code importing from the legacy `design-system` package — should use `@sonarsource/echoes-react` components.

## Echoes design tokens

- New code using the old theming system (`themeColor` helper) — should use Echoes design tokens instead.
- Raw hex colours or hardcoded font sizes instead of Echoes CSS variables via `cssVar`.

## Tailwind and CSS

- `sw:*` is the custom tailwind prefix — use it consistently.
- Prefer Tailwind utility classes for small, local styling adjustments.
- Prefer named Emotion styled components for substantial styling, such as responsive layouts with container queries or descendant selectors, when they make the rules more cohesive and easier to read than long utility class lists.
- Choose based on readability and maintainability. The fact that Tailwind can express the same CSS is not, by itself, a reason to replace styled components with utility classes or named className string constants.
- Small utility classes may coexist with styled components for simple, independent adjustments; mixing the two is not, by itself, a reason to rewrite the styling.
