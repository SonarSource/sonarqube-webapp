- Read @README.md every time you start.
- Read @package.json every time you start.
- Read @nx.json every time you start.

# About this project

This project is a monorepo that contains many packages to build a SaaS Cloud and On-prem Server version of the SonarQube Frontend.

# Testing, Linting, and running Tools

There are many configuration files for tools like linting and testing. If needed, check and read the relevent config files before deciding on what to do.

Tests can be run and targeted to a particular directory or file like so:

- `yarn nx run sq-server:test /path/to/tests`
- `yarn nx run sq-cloud:test /path/to/tests`

When running tests, pick the most relevent platform (cloud or server) and narrowly scope the test run to the files you've modified as tests take time to run.

# Writing Code

Try not to write duplicate code, and reorganize if necessary to keep things DRY.
Never attempt to fix linting issues until you believe the implementation is correct.
Always fix typescript errors

## Tailwind and CSS

- `sw-*` is our custom tailwind prefix.
- Prefer tailwind helper classes over custom CSS (using emotion) when possible.

## React Components and JSX

- Use functional components and TypeScript interfaces.
- Use declarative JSX.
- Use function, not const, for components.

## Localization

- If you make a new localization key, say so when you summarize your changes!
- Do not try to update the localization file (messages.json or default.ts)
- Do not use default messages in code. Only use a key.
