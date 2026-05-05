"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { complianceGetUndertakings } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type UndertakingRow = {
  id: number;
  ticker: string;
  company_name: string;
  account: string | null;
  undertaking_expiry: string | null;
  undertaking_type: string | null;
  undertaking_details: string | null;
  deal_num?: string | null;
};

const columns = [
  textColumn({ field: "deal_num", header: "Deal Num", minWidth: 90 }),
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  textColumn({ field: "account", header: "Account", minWidth: 100 }),
  textColumn({ field: "undertaking_expiry", header: "Undertaking Expiry", minWidth: 130 }),
  textColumn({ field: "undertaking_type", header: "Undertaking Type", minWidth: 120 }),
  textColumn({ field: "undertaking_details", header: "Undertaking Details", minWidth: 150 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function UndertakingsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<UndertakingRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await complianceGetUndertakings({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load undertakings.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as UndertakingRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<UndertakingRow>
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      emptyMessage="No undertakings available."
      searchPlaceholder="Search undertakings…"
    />
  );
}
