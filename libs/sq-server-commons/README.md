# sq-server-commons

This library was generated with [Nx](https://nx.dev).

## Description

Contains all the utilities, components, types, helpers and other small building blocks that are SPECIFIC to SQ-Server and are not shared with SQ-Cloud.
All these commons were initially part of the SQ-Server app codebase, but have been moved to this library to allow for private SQ-Server features like Branches to access them without having cyclic dependencies with the SQ-Server app module.

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

- `yarn nx test sq-server libs/sq-server-commons`
- `yarn nx test sq-cloud libs/sq-server-commons`

### Linting

The library can be linted in isolation with:

- `yarn nx lint sq-server-commons`

### Typechecking

The library can only be typechecked as part of the SQ-Server or SQ-cloud typechecking process. It doesn't have its own typechecking process.

Use either:

- `yarn nx ts-check sq-server`
- `yarn nx ts-check sq-cloud`

### Formatting

The library can be formatted in isolation with either:

- `yarn nx format-check sq-server-commons`
- `yarn nx format-check sq-server-commons --write`
