# shared

This library was generated with [Nx](https://nx.dev).

## Description

Contains all the shared utilities, components, types, helpers and other small building blocks that are used in both SQ-Server and SQ-Cloud.

## How to use it?

### Building

The library is built as part of either the SQ-Server or SQ-Cloud build process. It doesn't have its own build process.

Use either:

- `yarn nx build sq-server`
- `yarn nx build sq-cloud`

### Running tests

The library's tests are run as part of SQ-Server and SQ-Cloud tests. They don't have their own test process.

Use either:

- `yarn nx test sq-server`
- `yarn nx test sq-cloud`

or optionally run only the tests of this library with:

- `yarn nx test sq-server libs/shared`
- `yarn nx test sq-cloud libs/shared`

### Linting

The library can be linted in isolation with:

- `yarn nx lint shared`

### Typechecking

The library can only be typechecked as part of the SQ-Server or SQ-cloud typechecking process. It doesn't have its own typechecking process.

Use either:

- `yarn nx ts-check sq-server`
- `yarn nx ts-check sq-cloud`

### Formatting

The library can be formatted in isolation with either:

- `yarn nx format-check shared`
- `yarn nx format-check shared --write`
