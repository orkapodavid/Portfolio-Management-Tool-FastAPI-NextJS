"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usersCurrentUser } from "@/app/clientService";
import {
  clearAuthToken,
  getAuthToken,
  isAuthDisabled,
} from "@/lib/auth/token-storage";
import { getApiError } from "@/lib/utils";

type DashboardAuthGateProps = {
  children: React.ReactNode;
};

export function DashboardAuthGate({ children }: DashboardAuthGateProps) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isAuthDisabled()) {
      setIsReady(true);
      return;
    }

    let cancelled = false;

    const validateSession = async () => {
      const token = getAuthToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await usersCurrentUser({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const error = getApiError(response);

      if (cancelled) {
        return;
      }

      if (error) {
        clearAuthToken();
        router.replace("/login");
        return;
      }

      setIsReady(true);
    };

    void validateSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#11111b] text-sm text-[#a6adc8]">
        Checking your session...
      </div>
    );
  }

  return <>{children}</>;
}
