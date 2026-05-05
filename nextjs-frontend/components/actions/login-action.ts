import { authJwtLogin } from "@/app/clientService";
import { loginSchema } from "@/lib/definitions";
import { getApiData, getApiError, getErrorMessage } from "@/lib/utils";
import { setAuthToken } from "@/lib/auth/token-storage";

export async function login(prevState: unknown, formData: FormData) {
  const validatedFields = loginSchema.safeParse({
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { username, password } = validatedFields.data;

  const input = {
    body: {
      username,
      password,
    },
  };

  try {
    const response = await authJwtLogin(input);
    const error = getApiError(response);

    if (error) {
      return { server_validation_error: getErrorMessage(error) };
    }

    const data = getApiData<{ access_token: string }>(response);

    if (!data?.access_token) {
      return {
        server_error: "Login succeeded without an access token response.",
      };
    }

    setAuthToken(data.access_token);
  } catch (err) {
    console.error("Login error:", err);
    return {
      server_error: "An unexpected error occurred. Please try again later.",
    };
  }
  return { redirectTo: "/dashboard" };
}
