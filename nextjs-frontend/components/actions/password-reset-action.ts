import { resetForgotPassword, resetResetPassword } from "@/app/clientService";
import { passwordResetConfirmSchema } from "@/lib/definitions";
import { getApiError, getErrorMessage } from "@/lib/utils";

export async function passwordReset(prevState: unknown, formData: FormData) {
  const input = {
    body: {
      email: formData.get("email") as string,
    },
  };

  try {
    const response = await resetForgotPassword(input);
    const error = getApiError(response);

    if (error) {
      return { server_validation_error: getErrorMessage(error) };
    }
    return { message: "Password reset instructions sent to your email." };
  } catch (err) {
    console.error("Password reset error:", err);
    return {
      server_error: "An unexpected error occurred. Please try again later.",
    };
  }
}

export async function passwordResetConfirm(
  prevState: unknown,
  formData: FormData,
) {
  const validatedFields = passwordResetConfirmSchema.safeParse({
    token: formData.get("resetToken") as string,
    password: formData.get("password") as string,
    passwordConfirm: formData.get("passwordConfirm") as string,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { token, password } = validatedFields.data;
  const input = {
    body: {
      token,
      password,
    },
  };
  try {
    const response = await resetResetPassword(input);
    const error = getApiError(response);

    if (error) {
      return { server_validation_error: getErrorMessage(error) };
    }
    return { redirectTo: "/login" };
  } catch (err) {
    console.error("Password reset confirmation error:", err);
    return {
      server_error: "An unexpected error occurred. Please try again later.",
    };
  }
}
