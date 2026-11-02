# Changelog

## 1.2.0

- Add opaque HttpOnly browser admin sessions at `POST`, `GET`, and `DELETE /api/v1/auth/session`, with session metadata and a session-bound CSRF token. The authentication cookie is never exposed in JSON.
- Allow question mutations using either the existing admin bearer JWT or a browser session cookie with its CSRF header and an explicitly trusted browser origin. Document `403` for rejected origin or CSRF checks.
- Keep `POST /api/v1/auth/login` and bearer authentication available for scripts and other non-browser clients.
- Add single-use rotating HttpOnly refresh cookies, reuse detection and family revocation; add `/api/v1/auth/session/refresh` and `/api/v1/auth/session/activity`.
- Cap access tokens at five minutes, idle browser sessions at fifteen minutes and absolute browser sessions at thirty minutes. Reading/refreshing does not extend deadlines. Add remaining access and absolute lifetimes to browser metadata. Existing `JWT_TOKEN_TTL_SECONDS=3600` configurations must be reduced before deployment.

## 1.1.0

- Replace `openapi-typescript` with pinned OpenAPI Generator model generation and TypeScript 7 declaration output. Generation and freshness checks now require Java 11 or newer.
- Export named model types from `generated/typescript/schema.d.ts` instead of `paths`, `operations` and `components`. Consumers must update their imports and replace integrations that depend on the old endpoint types; the package remains type-only.

## 1.0.0

- Extract the existing v1 Currency quiz API into one shared OpenAPI contract.
- Generate TypeScript paths and schemas; configure Kotlin serialization model generation.
- Keep questions separate from admin responses and document nullable PATCH fields.
