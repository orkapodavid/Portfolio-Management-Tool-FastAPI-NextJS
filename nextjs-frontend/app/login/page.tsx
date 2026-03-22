"use client";

import { login } from "@/components/actions/login-action";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginPageView } from "./login-page-view";

export default function Page() {
  const router = useRouter();
  const [state, dispatch] = useActionState(login, undefined);

  useEffect(() => {
    if (state?.redirectTo) {
      router.replace(state.redirectTo);
    }
  }, [router, state?.redirectTo]);

  return <LoginPageView action={dispatch} state={state} />;
}
