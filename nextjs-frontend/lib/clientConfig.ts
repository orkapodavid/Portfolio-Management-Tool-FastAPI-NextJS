import { client } from "@/app/openapi-client/client.gen";
import { getRuntimeConfig } from "@/lib/runtime-config";

let configuredBaseUrl: string | null = null;
let configurePromise: Promise<string> | null = null;

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
