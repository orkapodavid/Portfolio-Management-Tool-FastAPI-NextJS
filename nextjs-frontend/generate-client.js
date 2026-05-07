/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const { config } = require("dotenv");

config({ path: ".env.local" });

async function main() {
  const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:8000";
  const openapiOutputFile = process.env.OPENAPI_OUTPUT_FILE ?? "openapi.json";
  const openapiUrl = new URL("/openapi.json", apiBaseUrl).toString();
  const outputPath = path.resolve(openapiOutputFile);

  try {
    const response = await fetch(openapiUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch live OpenAPI schema from ${openapiUrl}: ${response.status} ${response.statusText}`,
      );
    }

    const schema = await response.json();
    fs.writeFileSync(
      outputPath,
      JSON.stringify(schema, null, 2) + "\n",
      "utf8",
    );

    const pathCount = Object.keys(schema.paths ?? {}).length;
    console.log(
      `Fetched live schema from ${openapiUrl} and wrote ${pathCount} paths to ${outputPath}`,
    );
  } catch (err) {
    if (!fs.existsSync(outputPath)) {
      throw err;
    }
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(
      `Could not fetch ${openapiUrl} (${reason}); regenerating client from cached ${outputPath}.`,
    );
  }

  const result = spawnSync(
    process.platform === "win32" ? "pnpm.cmd" : "pnpm",
    ["exec", "openapi-ts", "--file", "openapi-ts.config.ts"],
    { stdio: "inherit" },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
