"use client";

import { register } from "@/components/actions/register-action";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RegisterPageView } from "./register-page-view";

export default function Page() {
  const router = useRouter();
  const [state, dispatch] = useActionState(register, undefined);

  useEffect(() => {
    if (state?.redirectTo) {
      router.replace(state.redirectTo);
    }
  }, [router, state?.redirectTo]);

  return <RegisterPageView action={dispatch} state={state} />;
}
