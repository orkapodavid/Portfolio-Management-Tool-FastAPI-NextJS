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
import { FieldError, FormError } from "@/components/ui/FormError";

export type LoginPageState = {
  redirectTo?: string;
  errors?: Record<string, string | string[]>;
  server_validation_error?: string;
  server_error?: string;
};

type LoginPageViewProps = {
  action: (formData: FormData) => void | Promise<void>;
  state?: LoginPageState;
};

export function LoginPageView({ action, state }: LoginPageViewProps) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <form action={action}>
        <Card className="w-full max-w-sm rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">
              Login
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              Enter your email below to log in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 p-6">
            <div className="grid gap-3">
              <Label
                htmlFor="username"
                className="text-gray-700 dark:text-gray-300"
              >
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="email"
                autoComplete="email"
                placeholder="m@example.com"
                required
                className="border-gray-300 dark:border-gray-600"
              />
              <FieldError state={state} field="username" />
            </div>
            <div className="grid gap-3">
              <Label
                htmlFor="password"
                className="text-gray-700 dark:text-gray-300"
              >
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="border-gray-300 dark:border-gray-600"
              />
              <FieldError state={state} field="password" />
              <Link
                href="/password-recovery"
                className="ml-auto inline-block text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>
            <SubmitButton text="Sign In" />
            <FormError state={state} />
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
