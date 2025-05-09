# nx-automation

This library provides a set of utilities for automating tasks in our NX workspace.

## Generators

### shared-library

The shared-library generator creates a new shared library in the NX workspace following our internal setup.
It creates the library in the `libs` or `private/libs` directory, depending on the specified visibility.
It also updates our tsconfigs and jest configurations to include the new library alias.

Use the `shared-library` generator in the vscode nx console.
Or run one of the following command in a terminal:

- `yarn nx g shared-library <name>`
- `yarn new-shared-lib <name>`

Replace `<name>` with the name of the library you want to create. The name will then be processed to be kebab-case, it will also be prefixed with `feature-` if needed, or possibly `private-` if the library is private and its name is already taken by a public library.

The generator will then prompt your for the visibility of the library and its type (feature or utils).
