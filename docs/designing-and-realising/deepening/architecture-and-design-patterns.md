# Architecture and Design Patterns

Shared defines the messages exchanged by the Kotlin backend and TypeScript frontend. It supports the full-stack architecture through contract tooling; it does not run an application service.

## ADR-001: Share an OpenAPI contract and generated models

**Status:** Implemented; recorded retrospectively on 31 October 2026. Stakeholder review of this record is not documented.

**Context:** Kotlin/JVM DTOs cannot be imported directly by the Vue/TypeScript application. Maintaining separate definitions makes accidental differences possible.

**Decision:** Keep one language-neutral OpenAPI specification, separate generation settings for each language, and a types-only TypeScript package. Consumers pin the shared revision through Git submodules. Business logic and runtime access checks stay in the applications.

**Alternatives:** Copying models would remove generator setup but require manual synchronization. A Kotlin-only library would not serve this TypeScript client. A complete generated SDK could provide endpoint typing, but introduces runtime client code beyond the current model-sharing scope.

**Consequences:** Both languages derive message shapes from the same contract. Pinning makes updates deliberate, but incompatible changes still require consumer coordination. Generation requires Java and maintained templates; declarations do not validate incoming JSON or type HTTP paths.

The record follows the context, decision and consequences structure of [Nygard's ADR approach](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions).

## Implementation evidence

| Choice | Why it helps | Evidence |
|--------|--------------|----------|
| Contract boundary | Endpoints, JSON shapes and admin access requirements are described independently of either implementation language. | [currency-quiz.v1.yaml](../../../openapi/currency-quiz.v1.yaml) |
| Separate generation concerns | Kotlin and TypeScript settings describe their own output without moving application logic into shared. | [kotlin.json](../../../generators/kotlin.json), [typescript.json](../../../generators/typescript.json) |
| Models-only TypeScript package | Consumers import declarations; HTTP calls, validation and state remain explicit application responsibilities. | [package.json](../../../package.json), [generate-typescript.mjs](../../../scripts/generate-typescript.mjs) |
| Checks and update policy | Type assertions and freshness checks catch some contract drift; the README explains coordinated consumer updates. | [typescript-contract.ts](../../../examples/typescript-contract.ts), [README.md](../../../README.md) |

## Change evidence and limits

Commit `37d514a` replaced the earlier TypeScript generator and endpoint-type exports with OpenAPI Generator and named models. Inspect it with `git show 37d514a -- CHANGELOG.md package.json examples/typescript-client.ts` (PowerShell 7+ and Bash).

The [changelog](../../../CHANGELOG.md) records that migration. It changed tooling and consumer imports; it is not evidence of refactoring a tightly coupled runtime application into layers. The Java requirement and custom templates also add maintenance, so fewer packages alone do not prove a simpler design.

Run `npm run check` from the shared root (PowerShell 7+ and Bash). These checks support the consumers' tests; they do not validate a running end-to-end application. There is no runtime design pattern implementation to claim in this contract repository.

For a non-technical reader: both applications work from one agreed description of the messages they exchange. Stakeholder discussion and feedback remain missing evidence. Separate services, CQRS or an outbox would not solve the model-sharing problem this repository addresses.
