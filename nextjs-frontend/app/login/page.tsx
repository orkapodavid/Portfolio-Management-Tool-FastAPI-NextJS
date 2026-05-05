"use client";

import { login } from "@/components/actions/login-action";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginPageView } from "./login-page-view";
import { hasAuthToken } from "@/lib/auth/token-storage";
import type { LoginPageState } from "./login-page-view";

export default function Page() {
  const router = useRouter();
  const [state, setState] = useState<LoginPageState>();

  useEffect(() => {
    if (hasAuthToken()) {
      router.replace("/dashboard/market-data/market-data");
    }
  }, [router]);

  const handleSubmit = async (formData: FormData) => {
    const nextState = await login(undefined, formData);
    setState(nextState);

    if (nextState?.redirectTo) {
      router.replace(nextState.redirectTo);
    }
  };

  return <LoginPageView action={handleSubmit} state={state} />;
}
