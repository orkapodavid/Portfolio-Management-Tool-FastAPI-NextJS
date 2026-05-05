"use client";

import { passwordReset } from "@/components/actions/password-reset-action";
import { useState } from "react";
import { PasswordRecoveryPageView } from "./password-recovery-page-view";
import type { PasswordRecoveryState } from "./password-recovery-page-view";

export default function Page() {
  const [state, setState] = useState<PasswordRecoveryState>();

  const handleSubmit = async (formData: FormData) => {
    const nextState = await passwordReset(undefined, formData);
    setState(nextState);
  };

  return <PasswordRecoveryPageView action={handleSubmit} state={state} />;
}
