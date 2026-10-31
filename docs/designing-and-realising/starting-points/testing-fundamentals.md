# Testing Fundamentals

This repository checks the contract and generated types at build time. It provides partial evidence: application behaviour is tested in the backend and frontend consumers.

| Topic | Current evidence | Files |
|-------|------------------|-------|
| Positive and negative checks | `satisfies` checks accepted shapes. `@ts-expect-error` requires errors for invalid types, missing fields and exposing the correct answer publicly. These are compile-time checks, not runtime unit tests. | [typescript-contract.ts](../../../examples/typescript-contract.ts) |
| Consumer compatibility | A small client example must type-check against the generated models. Its Fetch calls and error paths are not executed by these checks. | [typescript-client.ts](../../../examples/typescript-client.ts), [tsconfig.json](../../../tsconfig.json) |
| Generated output | The freshness check regenerates declarations in a temporary directory and compares them with the committed file. Missing or outdated output fails the check. | [generate-typescript.mjs](../../../scripts/generate-typescript.mjs) |
| Local checks and results | `npm run check` runs OpenAPI linting, generation freshness and TypeScript checks. Success means valid lint results, matching declarations and no compiler errors; failures return a nonzero exit code. | [package.json](../../../package.json) |
| Coverage and limits | No runtime unit-test suite or coverage report is configured here. Type checks cannot show which application paths execute or whether its HTTP behaviour is correct. | [package.json](../../../package.json) |

Run `npm run check` from the shared root (PowerShell 7+ and Bash). If declarations are outdated, run `npm run generate`, review the diff and rerun the check. Setup is documented in the [README](../../../README.md).

Unit tests isolate behaviour, integration tests exercise collaborating components, and end-to-end tests follow a complete user flow. These shared checks support those layers but do not replace them. Runtime arrange–act–assert tests, test-first development and coverage-report interpretation remain missing evidence in this repository.
