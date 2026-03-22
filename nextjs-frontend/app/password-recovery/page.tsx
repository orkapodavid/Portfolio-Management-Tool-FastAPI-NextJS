"use client";

import { passwordReset } from "@/components/actions/password-reset-action";
import { useActionState } from "react";
import { PasswordRecoveryPageView } from "./password-recovery-page-view";

export default function Page() {
  const [state, dispatch] = useActionState(passwordReset, undefined);

  return <PasswordRecoveryPageView action={dispatch} state={state} />;
}
