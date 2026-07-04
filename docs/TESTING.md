# Testing

## Defaults

- Prefer testing pure/shared logic before page-level UI.
- Favor deterministic assertions over snapshots.
- Extract logic out of large components before mocking half the app to test it.
- Keep one behavior family per `describe` block.

## Data-Driven Cases

When a behavior can be described as inputs and outputs, define tests as a keyed object and let the test block generate cases programmatically. Adding coverage should usually mean adding one more key, not writing another bespoke `test(...)` body.

Use [test/support/defineCases.js](/Users/kendall/dev/confessional-christianity-node/test/support/defineCases.js) for this pattern.

```js
const cases = {
  'whole confession search resolves to the first chapter': {
    input: 'WCF',
    expected: ['parent:WCoF-1'],
  },
  'chapter and article search resolves to a single entry id': {
    input: 'WCF.1.2',
    expected: ['id:WCoF-1-2'],
  },
};

defineCases(cases, ({ input, expected }) => {
  expect(parseFacets(input)).toEqual(expected);
});
```

## When To Use This Pattern

- Parsing and normalization helpers
- Route generation and route parsing
- Static props/path derivation
- Lookup tables and metadata maps
- Progress and calculation helpers

## When Not To Force It

- Stateful UI interactions
- Complex async flows with multiple phases
- Assertions where a small custom setup is clearer than a generic table

## Repo-Specific Guidance

- Prefer real normalized content fixtures over synthetic mock payloads when testing confession routes.
- If a regex is reused across calls, do not rely on mutable global regex state in assertions or implementation.
- For new helper behavior, add a new keyed case to an existing family before creating a new ad hoc test file.
