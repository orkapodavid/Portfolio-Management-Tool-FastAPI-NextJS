"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { reconciliationGetPpsRecon } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type PpsReconRow = {
  id: number;
  ticker: string;
  value_date: string;
  trade_date: string;
  underlying: string;
  code: string;
  company_name: string;
  sec_type: string;
  pos_loc: string;
  account: string;
};

const columns = [
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  dateColumn({ field: "value_date", header: "Value Date", minWidth: 100 }),
  dateColumn({ field: "trade_date", header: "Trade Date", minWidth: 100 }),
  textColumn({ field: "underlying", header: "Underlying", minWidth: 100 }),
  textColumn({ field: "code", header: "Code", minWidth: 80 }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  textColumn({ field: "sec_type", header: "Sec Type", minWidth: 90 }),
  textColumn({ field: "pos_loc", header: "Pos Loc", minWidth: 80 }),
  textColumn({ field: "account", header: "Account", minWidth: 100 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function PpsReconPage() {
  const router = useRouter();
  const [rows, setRows] = useState<PpsReconRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await reconciliationGetPpsRecon({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load PPS reconciliation.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as PpsReconRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<PpsReconRow>
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      emptyMessage="No PPS reconciliation entries available."
      searchPlaceholder="Search PPS recon…"
    />
  );
}
