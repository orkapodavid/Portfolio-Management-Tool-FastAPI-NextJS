"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasAuthToken } from "@/lib/auth/token-storage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(
      hasAuthToken() ? "/dashboard/market-data/market-data" : "/login",
    );
  }, [router]);

  return null;
}
