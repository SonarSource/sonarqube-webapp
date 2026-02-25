---
name: webapp-testing
description: "Use this skill when you need to write or understand testing best practices in webapp"
allowed-tools: Read, Grep, Glob, Bash
---

# Writing tests in Sonarqube webapp

## Test Configuration

- **SQ-Server:** `apps/sq-server/jest.config.js`
- **SQ-Cloud:** `private/apps/sq-cloud/config/jest/`

-------

## Testing Approach and Philosophy

Tests must bring additional trust in the code. We must not test implementation details, but use cases and functional aspects. They must provide meaningful coverage.

## Naming conventions

We define the following naming strategy:

- Integration tests use the *-it.ts* file naming pattern (e.g., Facet-it.tsx).
- Unit tests use the *-test.ts* file naming pattern (e.g., utils-test.ts).

## There are 3 layers of testing

Integration Tests
Unit Tests
Snapshots

### Integration tests

These are frontend-only, and thus we must mock API calls.

- ITs are scoped to app pages, or sufficiently complex component clusters (e.g. the activity graph, or the code viewer)
- ITs validate happy paths and common use cases, not edge cases.
- ITs use smart mocks that help play out user scenarios

### Unit Tests

Unit tests are used for common and re-used code and for edge cases that are too hard to test with ITs.

We distinguish two types of unit tests:

- For components, a UT renders them (with potential sub-components) directly in isolation to validate all the logic and edge cases.
  - It’s fine to test sub-components in isolation if testing their edge cases from the parent is too complex
- For helpers and other shared code, a UT runs the code in isolation to test all its logic and edge cases

### Snapshots

Snapshot testing saves the result of a function, typically the DOM rendered by a component, and ensures that that result does not change between runs.  **We are moving away from snapshots**

- Do Not snapshot test: styling, logic, DOM layout
- Do snapshot test: Code samples, like in the Tutorials. Their exact contents are the feature!

-------

## Smart Mock Best Practices

Smart mocks are stateful mocks that partially mimic the BE’s behavior, without re-implementing its logic. This allows to test the result of the API calls, rather than the calls themselves.

Mocks should always be initialized explicitly with their starting data in the tests using them. This aims to keep the running context close and to avoid side effects on other tests by relying too much on default data

Mocks should not strive to fully mimic the BE, but be just “smart” enough to test the behaviors the ITs are interested in. Typically, they implement the direct consequences of CRUD operations, but without any potential side effect on other resources

The current recommended way to mock an API is with a class that looks like this:

```ts
import { http } from 'msw';
import { AbstractServiceMock } from '../AbstractServiceMock';

interface MyServiceData {
  // Whatever data you want.   
  foo: string;
}

export class MyServiceMock extends AbstractServiceMock<MyServiceData> {
  handlers = [
    http.get('/api/whatever/foo', ({ request }) => {
      const params = this.getQueryParams(request);
      const key = params.get('key');

      if (!key) {
        return this.errors('Key, from and to are required');
      }

      return this.ok({ data: this.foo });
    }),
  ];
}

export const MyServiceDefaultDataset: MyServiceData = {
  foo: 'bar'
};
```

## Using Mocks in tests

From a jest test

```ts
const myHander = new MyServiceMock(MyServiceDefaultDataset);

beforeEach(() => {
  registerServiceMocks(myHandler);
});
```

-------

## Critical Testing Rule

### ⚠️ ALWAYS use `await selector.find()` instead of `waitFor()` for async elements

```tsx
// ❌ Bad
await waitFor(() => {
  expect(screen.getByText("Loading complete")).toBeInTheDocument();
});

// ✅ Good
const loadingText = await screen.findByText("Loading complete");
expect(loadingText).toBeInTheDocument();
```

### Prefer toBeInTheDocument over toBeVisible

### Do not use Math.random() to generate IDs in tests

### Use of the testSelector lib instead of screen selectors

RTL provides a list of ways by which elements of components undergoing tests can be selected. The standard way is to use the screen.(getBy|findBy|queryBy) helpers.

We also have a set of helpers defined in helpers/testSelector.ts to achieve the same. The idea is to define UI selector elements as constants outside of the tests.

This is helpful in big test files where you need to access multiple elements of the component across multiple test cases. This generally improves the readability of the tests and makes them more concise.

```ts
const ui = {
  descriptionInput: byRole('textbox', {
    name: 'description',
  }),
  urlInput: byRole('textbox', {
    name: 'onboarding.create_organization.url',
  }),
  nameInput: byRole('textbox', {
    name: /organization.name/,
  }),
  submitButton: byRole('button', {
    name: 'save',
  }),
};
```

## Other Guidelines

Some good principles to keep in mind when writing RTL unit tests include:

avoid usage of data-testid as much as possible, we want to improve our accessibility, and writing RTL tests without relying on this is one way of doing it

use the naming convention setup... for the test setup function that we have in each test file, and keep the name render... for render functions that take JSX as parameters and are usually defined inside the src/helpers/testUtils.tsx file

use the user object returned by our render functions to trigger user events

use our custom render functions from ~helpers/testUtils.tsx, never the one coming from RTL directly

when waiting for something to happen on the screen

.findBy should be used in most cases instead of .waitFor: .findBy is basically a combination of .waitFor and .getBy, so use it as soon as you need to wait for some elements to appear on screen

.waitFor should be used when waiting for some async callback to happen, or when the whole assertion has to be retried multiple times until true (it can usually be avoided by thinking about other content changes on the page)

.waitForElementToBeRemoved should be used instead of .findBy when waiting for something to disappear from the screen

don't forget to await when using waitFor, findBy or user events, otherwise the assertion won't be done (ESLint should remind you of that)

when using RTL query functions, avoid using regexes unless necessary: it makes the test less readable with no real benefit

The Testing Playground extension or screen.logTestingPlaygroundURL() makes it easier to select elements on the screen

Use jest.mocked instead of (myFn as jest.Mock) when mocking an imported function. This will make sure the types of the function are forwarded to the mock function (ESLint should remind you of that too)

Use helpers/mocks data and functions to mock some app assets (projects, issues, quality gates, ..)

Note: we also have an src/helpers/testMocks.ts file which contains mock functions - this is a legacy file that became way too big and we are slowly splitting into files in the src/helpers/mocks folder
