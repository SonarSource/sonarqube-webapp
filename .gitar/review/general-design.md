# General Design Guidelines

## Duplication (DRY)

- Same 3+ lines of logic appearing in 3 or more files? Flag it. Duplication between just 2 files is often coincidental — don't extract unrelated code into shared helpers just because it looks similar.
- Two components or hooks structurally identical (same props, same state, same render logic)?
- A constant defined in one place but hardcoded as a string/literal elsewhere?
- Same feature-flag check written independently in multiple components?

## Missing or better abstractions

- A `switch` / `if` chain on the same value repeated across multiple files? Consider a lookup map, config object, or composition pattern instead of branching.
- Multiple hooks or helpers all keyed on the same discriminator? They may collapse into a single hook with a config parameter.
- Trace "what files need to change to add the next variant". More than two is a signal to redesign.

## SOLID

- **S**: A component or hook mixing unrelated concerns (data fetching, presentation, routing logic)?
- **O**: How many files need to change to add the next variant? Hardcoded conditionals = violation. Extensible patterns (maps, config objects, composition) = satisfied.
- **D**: Tightly coupled to specific implementations instead of using hooks, props, or the adapter layer for indirection?

## Consistency between similar implementations

- Two implementations of the same adapter or hook using different approaches to get their inputs?
- Similar components with different null handling, loading state, or error patterns?

## Correctness / subtle bugs

- Hardcoded limits interacting with configurable values in a way that could silently produce wrong results?
- String-based mappings (splitting, prefix matching) that break silently if a value changes?
- Extra HTTP/DB calls firing on every request when the data is already in scope?
