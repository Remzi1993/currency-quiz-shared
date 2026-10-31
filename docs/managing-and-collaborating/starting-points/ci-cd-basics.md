# CI/CD Basics

The shared workflow defines automated contract checks for pushes, pull requests and manual runs. Shared produces models for the applications rather than deploying an application itself.

| Topic              | What I configured                                                                                                                                                                                   | Evidence                                                                                                                                |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| Workflow structure | One `checks` job runs named steps on Ubuntu. `uses` selects setup actions; `run` executes commands. Node 26 and Java 25 provide the generator toolchain.                                            | [ci.yml](../../../.github/workflows/ci.yml)                                                                                             |
| Stage order        | Install locked dependencies → lint the contract → regenerate temporarily and verify freshness → type-check consumer examples and contract guarantees. Later checks stop when an earlier step fails. | [ci.yml](../../../.github/workflows/ci.yml), [package.json](../../../package.json)                                                      |
| Reading output     | Named steps locate the failing gate. Lint reports contract problems; freshness reports outdated declarations; TypeScript reports invalid model usage. A nonzero exit code fails the job.            | [generate-typescript.mjs](../../../scripts/generate-typescript.mjs), [typescript-contract.ts](../../../examples/typescript-contract.ts) |
| Recovery procedure | For outdated declarations, regenerate locally, review the diff and rerun the checks before committing. This is the documented fix procedure, not a recorded failed GitHub run.                      | [README.md](../../../README.md)                                                                                                         |

From the shared root, run `npm ci` and `npm run check` (PowerShell 7+ and Bash). If declarations are stale, run `npm run generate`, review the changes, then run `npm run check` again.

The workflow separates the same gates as `npm run check` so their logs are easy to find. Type checks are static checks, not runtime unit tests. There is no deployment stage or publishing step in this repository. Remote execution and a demonstrated failed-run/fix remain unrecorded.

In [GitHub workflow YAML](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflows), `on` selects triggers, `jobs` groups work, and `steps` defines the order. `uses` calls an action; `run` executes a command.
