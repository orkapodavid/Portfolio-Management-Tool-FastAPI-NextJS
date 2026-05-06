import { client } from "@/app/openapi-client/client.gen";
import { getRuntimeConfig, isDesktopTarget } from "@/lib/runtime-config";

let configuredBaseUrl: string | null = null;
let configurePromise: Promise<string> | null = null;

// Bootstrap the OpenAPI client's baseURL at module-load time so that pages
// importing raw generated functions (positionsGetPositions, etc.) reach the
// backend on first call without first awaiting ensureClientConfigured().
// Desktop (Tauri) still needs the async path because the sidecar URL comes
// from a Rust IPC call.
const bootstrapBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
if (!isDesktopTarget()) {
  client.setConfig({ baseURL: bootstrapBaseUrl });
  configuredBaseUrl = bootstrapBaseUrl;
}

async function configureClient() {
  const { apiBaseUrl } = await getRuntimeConfig();

  if (configuredBaseUrl === apiBaseUrl) {
    return apiBaseUrl;
  }

  client.setConfig({
    baseURL: apiBaseUrl,
  });

  configuredBaseUrl = apiBaseUrl;
  return apiBaseUrl;
}

export async function ensureClientConfigured() {
  if (!configurePromise) {
    configurePromise = configureClient().finally(() => {
      configurePromise = null;
    });
  }

  return configurePromise;
}

export function resetClientConfigForTests() {
  configuredBaseUrl = null;
  configurePromise = null;
}
