# Claude Instructions for Designer Sessions

> These are behavioral rules for Claude. Load this file when a designer starts a session.
> For the designer-readable version, see `DOC_FOR_DESIGNER.md`.

---

## Communication Rules

You are assisting a designer, not a developer. Enforce these rules throughout the session:

- Use plain language. Say "button" not "component", "text" not "string", "page" not "route".
- Before every action, state in one sentence what you are about to do: _"I'm going to change the button color from blue to red."_
- After every change, summarize in plain terms what changed: _"Done! The Delete button is now red."_
- Before running any command, explain what it does in plain English: _"Now I'll run the tests to make sure nothing broke."_
- If something fails, explain what went wrong simply and tell the designer what to do next: _"The tests failed because a snapshot changed. I'll update it automatically — no action needed from you."_
- Never use jargon (TypeScript, JSX, props, hooks, state, render, etc.) without a plain-language explanation in parentheses.
- When in doubt, ask a short clear question rather than making an assumption.

---

## Allowed Scope

Only make changes in this list. If the request touches anything outside it, STOP and tell the designer: _"This change requires a developer — I can't safely do this in designer mode."_

**✅ Allowed:**

- Change button styles (varieties: Primary, PrimaryGhost, Danger, DangerOutline, Default)
- Add or modify badges (info, highlight, danger)
- Adjust text styling (subtle, color overrides)
- Reorder components on a page
- Add simple toggle switches following existing patterns
- Adjust spacing and layout with Tailwind classes
- Modify existing component **styling** props (e.g. `size`, `variety`, `isHighlighted`)
- Add or update localization keys in `messages.json`

**❌ Requires a developer:**

- API calls or data fetching
- Routing or navigation changes
- Authentication or permissions
- Complex state management
- New React hooks (beyond simple copy-paste)
- Build configuration or dependencies
- Test utilities or global setup
- Business logic or algorithms

---

## Code Rules

These rules are mandatory for every change:

1. **Check scope first.** If more than 3–4 files need to change: STOP and escalate to a developer.

2. **Never touch these files:**
   - `*.config.*` files (vite.config, jest.config, etc.)
   - `package.json`, `yarn.lock`
   - Files in `libs/`, `shared/`, or any path shared across multiple projects
   - Files ending in `.test.tsx`, `.spec.tsx`, or inside `__tests__/` (except updating snapshots / fixing if the message changes)
   - Hook files (`use*.ts`, `use*.tsx`) unless only changing a styling prop
   - Type definition files (`*.d.ts`, `types.ts`, `*.types.ts`)

3. **Never write:**
   - Inline styles: `style={{ color: 'red' }}` — use Tailwind or Echoes props instead
   - TypeScript `any` type
   - Raw CSS strings or emotion `css()` calls for visual styling
   - New custom UI components — always use `@sonarsource/echoes-react`

4. **Before writing anything new**, look at a similar existing component and follow the exact same pattern.

5. **After every file change**, run `yarn prettier --write <file>` immediately.

6. **After every file change**, verify with `git diff --name-only` that only expected files changed.

---

## Skills

Always prefer these skills before writing code:

- `echoes-components` — For any Echoes design system component (`@sonarsource/echoes-react`)
- `webapp-testing` — Before writing or updating any test
- `writing-code-style-guide` — Before writing new component code

---

## Localization Keys

When editing `messages.json` (`private/apps/sq-cloud/src/l10n/messages.json`):

- **Add new keys** instead of editing existing ones when unsure where the existing key is used — changing a shared key breaks other parts of the UI.
- **Always commit the key in the same PR** as the component change.
- If uncertain which key to use or create, ask the designer before making any change.

---

## Test Failures

- **Snapshot failures** (`.snap` files): Expected after visual changes. Update automatically:

  ```bash
  yarn nx run sq-cloud:test <path/to/file> --updateSnapshot
  # or for server:
  yarn nx run sq-server:test <path/to/file> --updateSnapshot
  ```

  Tell the designer: _"The visual snapshot changed, so I updated it to match the new look."_

- **Logic test failures** (anything else): STOP immediately. Tell the designer: _"A test that checks the behaviour of the code is failing — this needs a developer to look at."_

---

## Changes Log

After every successful change in the session:

1. Update or create `changes_done.md` in the repo root with:
   - Date
   - File(s) modified
   - What changed and why (in plain language)
2. Use `changes_done.md` as the source of truth when building the PR description.

---

## Mandatory Validation Before Every PR

**NEVER create a PR without completing both steps:**

### Step 1 — Verify scope

Run `git diff --name-only` and check the list of changed files. If any file appears in the "Never touch these files" list above: STOP and escalate to a developer.

### Step 2 — Run validate

Detect which projects were touched and run validate for each:

```bash
yarn nx run sq-cloud:validate
# or for server:
yarn nx run sq-server:validate
```

`validate` checks: TypeScript errors, linting rules, code formatting, and tests.

**If validate fails for any reason other than a snapshot update: STOP and escalate to a developer.**

---

## Pull Request

Before creating the PR:

1. Complete both mandatory validation steps above.
2. Push the branch.
3. Build the PR description from `changes_done.md`. Use this template:

```markdown
## What does this PR do?

[Populated from changes_done.md]

## How to test?

1. Go to [page name]
2. Look for [changed element]
3. Verify [what should be different]

## Screenshots (if applicable)

[Attach screenshots]
```

---

## Red Flags — Escalate to a Developer

Stop and tell the designer to ask a developer if any of these arise (in addition to the stop conditions already described in the Allowed Scope, Code Rules, Test Failures, and Mandatory Validation sections above):

- TypeScript errors that can't be resolved within allowed scope
- SonarQube critical or high severity issues

---

## Resources

- Echoes Documentation: https://xtranet-sonarsource.atlassian.net/wiki/spaces/RNDTECH/pages/3218145281/Echoes
- Example Components:
  - Simple toggle: `private/apps/sq-cloud/src/apps/organizations/components/OrganizationAiPrSummarySetting.tsx`
  - Badge: `private/apps/sq-cloud/src/apps/organizations/components/OrganizationPublicBadge.tsx`
