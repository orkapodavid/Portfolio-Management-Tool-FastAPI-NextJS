"use client";

import { SubmitButton } from "@/components/ui/submitButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldError, FormError } from "@/components/ui/FormError";

export type ResetPasswordConfirmState = {
  redirectTo?: string;
  errors?: Record<string, string | string[]>;
  server_validation_error?: string;
  server_error?: string;
};

type ResetPasswordConfirmPageViewProps = {
  action: (formData: FormData) => void | Promise<void>;
  state?: ResetPasswordConfirmState;
  token: string;
};

export function ResetPasswordConfirmPageView({
  action,
  state,
  token,
}: ResetPasswordConfirmPageViewProps) {
  return (
    <form action={action}>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Reset your Password</CardTitle>
          <CardDescription>
            Enter the new password and confirm it.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
          <FieldError state={state} field="password" />
          <div className="grid gap-2">
            <Label htmlFor="passwordConfirm">Password Confirm</Label>
            <Input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
          <FieldError state={state} field="passwordConfirm" />
          <input
            type="hidden"
            id="resetToken"
            name="resetToken"
            value={token}
            readOnly
          />
          <SubmitButton text="Send" />
          <FormError state={state} />
        </CardContent>
      </Card>
    </form>
  );
}
