"use client";

import { useState } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { passwordResetConfirm } from "@/components/actions/password-reset-action";
import { Suspense } from "react";
import { ResetPasswordConfirmPageView } from "./reset-password-confirm-page-view";
import type { ResetPasswordConfirmState } from "./reset-password-confirm-page-view";

function ResetPasswordForm() {
  const router = useRouter();
  const [state, setState] = useState<ResetPasswordConfirmState>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    notFound();
    return null;
  }

  const handleSubmit = async (formData: FormData) => {
    const nextState = await passwordResetConfirm(undefined, formData);
    setState(nextState);

    if (nextState?.redirectTo) {
      router.replace(nextState.redirectTo);
    }
  };

  return (
    <ResetPasswordConfirmPageView
      action={handleSubmit}
      state={state}
      token={token}
    />
  );
}

export default function Page() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Suspense fallback={<div>Loading reset form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
