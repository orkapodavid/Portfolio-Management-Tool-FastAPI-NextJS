"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { portfolioToolsGetResetDates } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { resetDatesSimulator } from "@/lib/grid-simulators/portfolio-tools";
import { getApiData, getApiError } from "@/lib/utils";

type ResetDateRow = {
  id: number;
  underlying: string;
  ticker: string;
  company_name: string;
  sec_type: string;
  currency: string;
  trade_date: string;
  first_reset: string;
  expiry: string;
  latest_reset: string;
  reset_date: string;
  reset_up_down: string;
  market_price: string;
};

const columns = [
  textColumn({ field: "underlying", header: "Underlying", minWidth: 100 }),
  textColumn({
    field: "ticker",
    header: "Ticker",
    pinned: "left",
    minWidth: 130,
  }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  textColumn({ field: "sec_type", header: "Sec Type", minWidth: 90 }),
  textColumn({ field: "currency", header: "Currency", minWidth: 90 }),
  dateColumn({ field: "trade_date", header: "Trade Date", minWidth: 100 }),
  dateColumn({ field: "first_reset", header: "First Reset", minWidth: 110 }),
  dateColumn({ field: "expiry", header: "Expiry", minWidth: 100 }),
  dateColumn({ field: "latest_reset", header: "Latest Reset", minWidth: 110 }),
  dateColumn({ field: "reset_date", header: "Reset Date", minWidth: 100 }),
  textColumn({ field: "reset_up_down", header: "Up / Down", minWidth: 100 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e))
    return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function ResetDatesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ResetDateRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await portfolioToolsGetResetDates({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load reset dates.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as ResetDateRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<ResetDateRow>
      gridId="reset_dates_grid"
      showCompactToggle
      showAutoRefresh
      showRowNumbers
      enableMultiSelect
      enableCellFlash
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      simulateUpdate={resetDatesSimulator}
      emptyMessage="No reset dates available."
      searchPlaceholder="Search reset dates…"
    />
  );
}
