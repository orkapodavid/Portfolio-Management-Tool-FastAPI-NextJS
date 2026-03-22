"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submitButton";
import { FormError } from "@/components/ui/FormError";

export type PasswordRecoveryState = {
  message?: string;
  server_validation_error?: string;
  server_error?: string;
};

type PasswordRecoveryPageViewProps = {
  action: (formData: FormData) => void | Promise<void>;
  state?: PasswordRecoveryState;
};

export function PasswordRecoveryPageView({
  action,
  state,
}: PasswordRecoveryPageViewProps) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <form action={action}>
        <Card className="w-full max-w-sm rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">
              Password Recovery
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              Enter your email to receive instructions to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 p-6">
            <div className="grid gap-3">
              <Label
                htmlFor="email"
                className="text-gray-700 dark:text-gray-300"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="m@example.com"
                required
                className="border-gray-300 dark:border-gray-600"
              />
            </div>
            <SubmitButton text="Send" />
            <FormError state={state} />
            <div className="mt-2 text-center text-sm text-blue-500">
              {state?.message && <p>{state.message}</p>}
            </div>
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              <Link
                href="/login"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
              >
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
