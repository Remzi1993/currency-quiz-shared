# Currency quiz shared contract

The source of truth is [openapi/currency-quiz.v1.yaml](openapi/currency-quiz.v1.yaml). It describes the REST endpoints, JSON schemas, status codes and admin authentication. Kotlin and TypeScript consume generated models from this language-neutral file.

This repository contains no application logic or credentials.

| Consumer                | How it uses the contract                                                                                                                         |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| Ktor backend            | OpenAPI Generator creates Kotlin models with kotlinx.serialization during the Gradle build. The same YAML is bundled for Swagger.                |
| Vue/TypeScript frontend | Imports the committed declarations in `generated/typescript/schema.d.ts`. `openapi-fetch` can use the generated `paths` type for typed requests. |

Generated TypeScript types provide compile-time checks. They do not validate an HTTP response at runtime. Authentication, input validation and persistence belong in the backend.

## Start development

Install Git, Node.js **22.12.0 or newer**, and npm **10 or newer**. All commands below work in **PowerShell 7+ and Linux/Bash**. Run them from the project folder specified in each section.

For a new checkout:

```sh
git clone https://github.com/Remzi1993/currency-quiz-shared.git
cd currency-quiz-shared
npm ci
```

If you already have a checkout, open its root folder and run the dependency installation command above. `npm ci` installs the versions recorded in `package-lock.json`.

Development in this repository means editing the API contract, validating it and generating types. Start the backend and frontend applications from their own repositories.

## Maintain the contract

Edit [openapi/currency-quiz.v1.yaml](openapi/currency-quiz.v1.yaml), then run these commands from the shared repository root:

```sh
npm run lint
npm run generate
npm run check
```

| Script | What it does | Output |
|--------|--------------|--------|
| `lint` | Uses Redocly CLI to validate the OpenAPI structure, references and configured authoring rules. | Reports errors and warnings. |
| `generate` | Uses openapi-typescript to generate TypeScript paths, requests and response types from the contract. | Writes `generated/typescript/schema.d.ts`. |
| `check` | Runs linting, verifies that generated declarations match the contract, and type-checks [the consumer example](examples/typescript-client.ts). | Reports failures without rewriting generated declarations or emitting JavaScript. |

The scripts are defined in [package.json](package.json). If `check` reports outdated declarations, regenerate them and rerun the check. Commit the YAML and generated declarations together; make changes in the YAML rather than editing generated types.

### Redocly configuration

[redocly.yaml](redocly.yaml) configures the OpenAPI checks. Redocly CLI automatically finds it in the project root when linting. openapi-typescript also loads it during generation, including the freshness check used by `check`.

- `extends: recommended` enables Redocly's recommended validation rules.
- `info-license: off` suppresses the warning about missing `info.license` metadata in this contract. The other recommended checks remain enabled.

## Add a consumer

The backend already includes this repository at `shared/`. To add it to a new consumer, run this from that consumer's root:

```sh
git submodule add https://github.com/Remzi1993/currency-quiz-shared.git shared
```

After cloning an existing consumer, or pulling a changed submodule pin, initialize the selected revision from the consumer's root:

```sh
git submodule update --init --recursive
```

### Vue/TypeScript

From the Vue application's root, install the typed HTTP client:

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

### Kotlin backend

Use JDK 25 and initialize the backend's `shared/` submodule first. From the **backend repository root**, explicitly validate the contract and generate Kotlin models with:

```sh
./gradlew openApiValidate openApiGenerate
```

The generator reads [generators/kotlin.json](generators/kotlin.json) and writes serializable DTOs under the backend's `build/generated/openapi` directory. The backend pins the OpenAPI Generator version in its Gradle version catalog.

For normal backend development:

```sh
./gradlew test
./gradlew build
```

These tasks include contract validation and Kotlin model generation as needed. `test` runs the backend regression and contract tests; `build` also packages the application. See the backend README for environment configuration and server startup.

## Version and update policy

- `/api/v1` is the HTTP API major version. `info.version` and the package version follow semantic versioning.
- Removing fields, making optional inputs required, or changing types or meaning is a breaking change. Coordinate both consumers; use `/api/v2` when existing clients must keep working.
- Optional input additions can be compatible with existing callers. Response schemas are closed against extra fields, so adding a response field requires coordinated consumer contract updates. Use a new major API version if older consumers must keep their existing contract. Record changes in [CHANGELOG.md](CHANGELOG.md).
- Commit contract changes in this repository first. Fetch and check out that exact commit inside each consumer's `shared/`, then commit the submodule pointer with its application changes. Do not automatically follow the newest branch commit during a build.
- Run shared checks and the backend's contract/regression tests before updating consumers. Frontend integration and consumer-driven Pact testing remain separate work.
