import { registerRegister } from "@/app/clientService";

import { registerSchema } from "@/lib/definitions";
import { getApiError, getErrorMessage } from "@/lib/utils";

export async function register(prevState: unknown, formData: FormData) {
  const validatedFields = registerSchema.safeParse({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  const input = {
    body: {
      email,
      password,
    },
  };
  try {
    const response = await registerRegister(input);
    const error = getApiError(response);

    if (error) {
      return { server_validation_error: getErrorMessage(error) };
    }
  } catch (err) {
    console.error("Registration error:", err);
    return {
      server_error: "An unexpected error occurred. Please try again later.",
    };
  }
  return { redirectTo: "/login" };
}
