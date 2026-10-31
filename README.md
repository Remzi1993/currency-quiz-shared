# Currency quiz shared contract

The source of truth is [openapi/currency-quiz.v1.yaml](openapi/currency-quiz.v1.yaml). It describes the REST endpoints, JSON schemas, status codes and admin authentication. Kotlin and TypeScript consume generated models from this language-neutral file.

This repository contains no application logic or credentials.

| Consumer                | How it uses the contract                                                                                                                         |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| Ktor backend            | OpenAPI Generator creates Kotlin models with kotlinx.serialization during the Gradle build. The same YAML is bundled for Swagger.                |
| Vue/TypeScript frontend | Imports named model types from the committed declarations in `generated/typescript/schema.d.ts`. |

Generated TypeScript types provide compile-time checks. They do not validate an HTTP response at runtime. Authentication, input validation and persistence belong in the backend.

## Start development

Install Git, Node.js **26 or newer**, npm **11 or newer**, and Java **11 or newer** with `java` on `PATH`. Java is required for TypeScript generation and checks, including in CI; the backend's JDK 25 also satisfies this requirement. All commands below work in **PowerShell 7+ and Linux/Bash**. Run them from the project folder specified in each section.

For a new checkout:

```sh
git clone https://github.com/Remzi1993/currency-quiz-shared.git
cd currency-quiz-shared
npm ci
```

If you already have a checkout, open its root folder and run the dependency installation command above. `npm ci` installs the versions recorded in `package-lock.json`.

The first generation or freshness check downloads the pinned OpenAPI Generator JAR into `node_modules` and needs network access. No global generator installation is required. Consumers that only import committed declarations do not need Java or the generator.

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
| `generate` | Uses OpenAPI Generator to generate models, then TypeScript to emit their declarations. | Writes `generated/typescript/schema.d.ts`; emits no API client or JavaScript runtime. |
| `check` | Runs linting, verifies that generated declarations match the contract, and type-checks [the consumer example](examples/typescript-client.ts) and [contract guarantees](examples/typescript-contract.ts). | Reports failures without rewriting generated declarations or emitting JavaScript. |

The scripts are defined in [package.json](package.json). If `check` reports outdated declarations, regenerate them and rerun the check. Commit the YAML and generated declarations together; make changes in the YAML rather than editing generated types.

### TypeScript generation

[openapitools.json](openapitools.json) pins OpenAPI Generator to **7.26.0**. [generators/typescript.json](generators/typescript.json) configures its `typescript-fetch` target for models only: original JSON property names, string dates, and arrays for unique collections so the declarations describe JSON rather than JavaScript `Set` values. It disables generated API implementations and runtime checks.

The two templates in [generators/typescript](generators/typescript) keep inline and named enums as literal union types, so the declarations do not advertise runtime enum objects that this type-only package does not provide. They preserve the upstream model properties and nullability; review them against the upstream templates when upgrading the pinned generator.

[scripts/generate-typescript.mjs](scripts/generate-typescript.mjs) runs that generator and the pinned **TypeScript 7.0.2** CLI, then writes declaration-only output. It avoids the legacy TypeScript compiler API used by `openapi-typescript`. To verify freshness directly, run:

```sh
npm run generate -- --check
```

The freshness check regenerates in a temporary directory and compares the result with the committed declaration. It reports differences without rewriting that file. `npm run check` includes this check, Redocly linting, and TypeScript checks of the consumer example and contract guarantees (public/admin field separation, JSON arrays, nullable PATCH fields, required fields, and token type literals).

### Redocly configuration

[redocly.yaml](redocly.yaml) configures the OpenAPI checks. Redocly CLI automatically finds it in the project root when linting. Run `npm run check` to apply these rules alongside the generation and TypeScript checks.

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

Import the generated model types and use your application's HTTP client. For example, in `src/api/client.ts`:

```ts
import type { PublicQuestion } from "../../shared/generated/typescript/schema";

export async function listQuestions(): Promise<PublicQuestion[]> {
  const url = new URL("/api/v1/questions", import.meta.env.VITE_API_BASE_URL);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return (await response.json()) as PublicQuestion[];
}
```

Configure `VITE_API_BASE_URL` with the backend origin, such as `http://localhost:8080`. The response assertion supplies a compile-time type; it does not validate incoming JSON. These declarations describe models only, without endpoint, status-code or request-path typing. Never put admin credentials or a JWT signing secret in a frontend environment file.

The type-only npm package `@currency-quiz/contract` is also available through `npm install --save-dev ./shared`; use `import type { PublicQuestion } from "@currency-quiz/contract"`. It has no JavaScript runtime export.

When migrating from the previous declarations, replace `components["schemas"]["PublicQuestion"]` with the named `PublicQuestion` import, and do the same for other models such as `UpdateQuestionRequest`. The former `paths`, `operations` and `components` exports are removed, so existing `openapi-fetch` integration must use another source of endpoint types or move to your application's HTTP client.

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
