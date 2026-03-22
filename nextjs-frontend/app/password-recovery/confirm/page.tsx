"use client";

import { useActionState, useEffect } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { passwordResetConfirm } from "@/components/actions/password-reset-action";
import { Suspense } from "react";
import { ResetPasswordConfirmPageView } from "./reset-password-confirm-page-view";

function ResetPasswordForm() {
  const router = useRouter();
  const [state, dispatch] = useActionState(passwordResetConfirm, undefined);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    notFound();
    return null;
  }

  useEffect(() => {
    if (state?.redirectTo) {
      router.replace(state.redirectTo);
    }
  }, [router, state?.redirectTo]);

  return (
    <ResetPasswordConfirmPageView
      action={dispatch}
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
