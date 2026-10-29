# Currency Quiz shared contract

The source of truth is [openapi/currency-quiz.v1.yaml](openapi/currency-quiz.v1.yaml). It describes the REST endpoints, JSON schemas, status codes and admin authentication. Kotlin and TypeScript consume generated models from this language-neutral file.

This repository contains no application logic or credentials.

| Consumer | How it uses the contract |
|----------|--------------------------|
| Ktor backend | OpenAPI Generator creates Kotlin models with kotlinx.serialization during the Gradle build. The same YAML is bundled for Swagger. |
| Vue/TypeScript frontend | Imports the committed declarations in `generated/typescript/schema.d.ts`. `openapi-fetch` can use the generated `paths` type for typed requests. |

Generated TypeScript types provide compile-time checks. They do not validate an HTTP response at runtime. Authentication, input validation and persistence belong in the backend.

## Maintain the contract

These commands work in PowerShell 7+ and Bash:

```sh
npm ci
npm run generate
npm run check
```

Edit the YAML first, regenerate TypeScript, and commit both together. `check` validates OpenAPI, rejects outdated generated declarations and type-checks [a consumer example](examples/typescript-client.ts). Kotlin model generation uses [generators/kotlin.json](generators/kotlin.json); the backend pins the generator version in its Gradle version catalog.

## Add a consumer

The backend already includes this repository at `shared/`. The frontend has not been created yet.

After creating the Vue app, install `openapi-fetch`. This command works in PowerShell 7+ and Bash:

```sh
npm install openapi-fetch
```

For example, in `src/api/client.ts`:

```ts
import createClient from "openapi-fetch";
import type { paths, components } from "../../shared/generated/typescript/schema";

export type Question = components["schemas"]["PublicQuestion"];
export const api = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
});

const { data, error } = await api.GET("/api/v1/questions");
```

Configure `VITE_API_BASE_URL` with the backend origin, such as `http://localhost:8080`. Never put admin credentials or a JWT signing secret in a frontend environment file. The type-only npm package `@currency-quiz/contract` is also available through `npm install --save-dev ./shared`; it has no JavaScript runtime export.

## Version and update policy

- `/api/v1` is the HTTP API major version. `info.version` and the package version follow semantic versioning.
- Removing fields, making optional inputs required, or changing types or meaning is a breaking change. Coordinate both consumers; use `/api/v2` when existing clients must keep working.
- Optional input additions can be compatible with existing callers. Response schemas are closed against extra fields, so adding a response field requires coordinated consumer contract updates. Use a new major API version if older consumers must keep their existing contract. Record changes in [CHANGELOG.md](CHANGELOG.md).
- Commit contract changes in this repository first. Fetch and check out that exact commit inside each consumer's `shared/`, then commit the submodule pointer with its application changes. Do not automatically follow the newest branch commit during a build.
- Run shared checks and the backend's contract/regression tests before updating consumers. Frontend integration and consumer-driven Pact testing remain separate work.
