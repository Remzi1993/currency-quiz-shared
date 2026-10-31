# Changelog

## 1.1.0

- Replace `openapi-typescript` with pinned OpenAPI Generator model generation and TypeScript 7 declaration output. Generation and freshness checks now require Java 11 or newer.
- Export named model types from `generated/typescript/schema.d.ts` instead of `paths`, `operations` and `components`. Consumers must update their imports and replace integrations that depend on the old endpoint types; the package remains type-only.

## 1.0.0

- Extract the existing v1 Currency quiz API into one shared OpenAPI contract.
- Generate TypeScript paths and schemas; configure Kotlin serialization model generation.
- Keep questions separate from admin responses and document nullable PATCH fields.
