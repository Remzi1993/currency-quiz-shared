import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = join(root, "generated/typescript/schema.d.ts");
const args = process.argv.slice(2);

if (args.some((arg) => arg !== "--check") || args.length > 1) {
  console.error("Usage: npm run generate [-- --check]");
  process.exitCode = 1;
} else {
  try {
    await generate(args.includes("--check"));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

function run(script, args) {
  // Run JS entry points directly so Windows does not need a shell for .cmd files.
  const result = spawnSync(process.execPath, [join(root, script), ...args], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${script} failed${result.signal ? ` (${result.signal})` : ""}.\n${result.stdout ?? ""}${result.stderr ?? ""}`,
    );
  }
}

async function generate(check) {
  const tempParent = await realpath(tmpdir());
  const stage = await mkdtemp(join(tempParent, "currency-quiz-typescript-"));
  try {
    run("node_modules/@openapitools/openapi-generator-cli/main.js", [
      "generate",
      "-g", "typescript-fetch",
      "-i", "openapi/currency-quiz.v1.yaml",
      "-c", "generators/typescript.json",
      "-o", join(stage, "generated"),
    ]);

    // Compile the model interfaces only; the generated root barrel imports an SDK.
    run("node_modules/typescript/bin/tsc", [
      "--ignoreConfig",
      "--declaration",
      "--emitDeclarationOnly",
      "--strict",
      "--noUncheckedIndexedAccess",
      "--target", "ES2022",
      "--module", "ESNext",
      "--moduleResolution", "Bundler",
      "--outDir", join(stage, "declarations"),
      join(stage, "generated/models/index.ts"),
    ]);

    const header = "/**\n * Generated from openapi/currency-quiz.v1.yaml using OpenAPI Generator.\n * Do not edit directly; run npm run generate.\n */\n\n";
    const declaration = await readFile(join(stage, "declarations/index.d.ts"), "utf8");
    const expected = header + declaration.replace(/\r\n/g, "\n");
    if (check) {
      const existing = await readFile(output, "utf8").catch((error) => {
        if (error.code === "ENOENT") return "";
        throw error;
      });
      if (existing.replace(/\r\n/g, "\n") !== expected) {
        throw new Error("Generated TypeScript schema is missing or outdated. Run npm run generate.");
      }
      console.log("Generated TypeScript schema is up to date.");
    } else {
      await mkdir(dirname(output), { recursive: true });
      await writeFile(output, expected);
      console.log("Generated TypeScript schema: generated/typescript/schema.d.ts");
    }
  } finally {
    // Only remove the unique staging directory created under the resolved temp root.
    if (dirname(stage) === tempParent) await rm(stage, { recursive: true, force: true });
  }
}
