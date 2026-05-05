import { authJwtLogout } from "@/app/clientService";
import { clearAuthToken, getAuthToken } from "@/lib/auth/token-storage";
import { getApiError, getErrorMessage } from "@/lib/utils";

export async function logout() {
  const token = getAuthToken();

  if (!token) {
    return { message: "No access token found" };
  }

  const response = await authJwtLogout({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const error = getApiError(response);

  if (error) {
    return { message: getErrorMessage({ detail: error }) };
  }

  clearAuthToken();
  return { redirectTo: "/login" };
}
