import { AuthJwtLoginError, RegisterRegisterError } from "@/app/clientService";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(
  error: RegisterRegisterError | AuthJwtLoginError | { detail?: unknown },
): string {
  let errorMessage = "An unknown error occurred";

  if (typeof error.detail === "string") {
    // If detail is a string, use it directly
    errorMessage = error.detail;
  } else if (
    typeof error.detail === "object" &&
    error.detail !== null &&
    "reason" in error.detail
  ) {
    // If detail is an object with a 'reason' key, use that
    const reason = error.detail["reason"];
    errorMessage = typeof reason === "string" ? reason : JSON.stringify(reason);
  }

  return errorMessage;
}

export function getApiError<TError>(result: unknown): TError | undefined {
  if (typeof result !== "object" || result === null || !("error" in result)) {
    return undefined;
  }

  return result.error as TError | undefined;
}

export function getApiData<TData>(result: unknown): TData | undefined {
  if (typeof result !== "object" || result === null || !("data" in result)) {
    return undefined;
  }

  return result.data as TData | undefined;
}
