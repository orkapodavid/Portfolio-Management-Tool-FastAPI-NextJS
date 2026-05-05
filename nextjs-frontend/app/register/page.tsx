"use client";

import { register } from "@/components/actions/register-action";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RegisterPageView } from "./register-page-view";
import type { RegisterPageState } from "./register-page-view";
import { hasAuthToken } from "@/lib/auth/token-storage";

export default function Page() {
  const router = useRouter();
  const [state, setState] = useState<RegisterPageState>();

  useEffect(() => {
    if (hasAuthToken()) {
      router.replace("/dashboard/market-data/market-data");
    }
  }, [router]);

  const handleSubmit = async (formData: FormData) => {
    const nextState = await register(undefined, formData);
    setState(nextState);

    if (nextState?.redirectTo) {
      router.replace(nextState.redirectTo);
    }
  };

  return <RegisterPageView action={handleSubmit} state={state} />;
}
