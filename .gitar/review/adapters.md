# Adapter Alignment

- A new or modified adapter in `sq-server-adapters` without a corresponding update in `sq-cloud-adapters` (or vice versa) — the type signatures must stay compatible.
- Adapters diverging in approach: one adapter fetching data inline while the other uses a query hook, or different null-handling strategies for the same interface.
- New shared code using the `~adapters` alias — verify that both adapter implementations actually exist and export the expected symbols.
