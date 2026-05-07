import { isDesktopTarget } from "@/lib/runtime-config";

const ACCESS_TOKEN_KEY = "accessToken";
const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60;
const NOAUTH_PLACEHOLDER_TOKEN = "no-auth";

export function isAuthDisabled(): boolean {
  const configuredValue = process.env.NEXT_PUBLIC_AUTH_DISABLED;

  if (configuredValue === undefined) {
    return true;
  }

  return !["0", "false", "no", "off"].includes(
    configuredValue.trim().toLowerCase(),
  );
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.split("=")[1] ?? "");
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") {
    return;
  }

  const cookieParts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${ACCESS_TOKEN_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
  ];

  if (window.location.protocol === "https:") {
    cookieParts.push("Secure");
  }

  document.cookie = cookieParts.join("; ");
}

function removeCookie(name: string) {
  if (typeof document === "undefined") {
    return;
  }

  const cookieParts = [`${name}=`, "Path=/", "Max-Age=0", "SameSite=Lax"];

  if (window.location.protocol === "https:") {
    cookieParts.push("Secure");
  }

  document.cookie = cookieParts.join("; ");
}

export function getAuthToken(): string | null {
  if (isAuthDisabled()) {
    return NOAUTH_PLACEHOLDER_TOKEN;
  }

  if (typeof window === "undefined") {
    return null;
  }

  if (isDesktopTarget()) {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  return readCookie(ACCESS_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  if (isDesktopTarget()) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return;
  }

  writeCookie(ACCESS_TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  removeCookie(ACCESS_TOKEN_KEY);
}

export function hasAuthToken() {
  return Boolean(getAuthToken());
}
