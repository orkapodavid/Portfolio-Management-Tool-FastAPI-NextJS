export type RuntimeConfig = {
  apiBaseUrl: string;
  desktopTarget: boolean;
};

declare global {
  interface Window {
    __PMT_RUNTIME_CONFIG__?: RuntimeConfig;
  }
}

const desktopTarget = process.env.NEXT_PUBLIC_DESKTOP_TARGET === "1";
const webApiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const desktopFallbackApiBaseUrl =
  process.env.NEXT_PUBLIC_DESKTOP_API_BASE_URL ?? "http://127.0.0.1:18475";

let runtimeConfigPromise: Promise<RuntimeConfig> | null = null;

const getStaticRuntimeConfig = (): RuntimeConfig => ({
  apiBaseUrl: desktopTarget ? desktopFallbackApiBaseUrl : webApiBaseUrl,
  desktopTarget,
});

async function loadDesktopRuntimeConfig(): Promise<RuntimeConfig> {
  if (typeof window === "undefined") {
    return getStaticRuntimeConfig();
  }

  if (window.__PMT_RUNTIME_CONFIG__) {
    return window.__PMT_RUNTIME_CONFIG__;
  }

  try {
    const tauriCore = await import("@tauri-apps/api/core");
    const runtimeConfig =
      await tauriCore.invoke<RuntimeConfig>("get_runtime_config");
    window.__PMT_RUNTIME_CONFIG__ = runtimeConfig;
    return runtimeConfig;
  } catch (error) {
    console.warn(
      "Falling back to desktop API base URL because Tauri runtime config is unavailable.",
      error,
    );
    return getStaticRuntimeConfig();
  }
}

export function isDesktopTarget() {
  return desktopTarget;
}

export async function getRuntimeConfig(): Promise<RuntimeConfig> {
  if (!desktopTarget) {
    return getStaticRuntimeConfig();
  }

  if (!runtimeConfigPromise) {
    runtimeConfigPromise = loadDesktopRuntimeConfig();
  }

  return runtimeConfigPromise;
}

export function resetRuntimeConfigForTests() {
  runtimeConfigPromise = null;
}
