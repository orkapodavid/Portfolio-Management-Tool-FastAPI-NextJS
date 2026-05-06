"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { marketDataGetFxData } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { numberColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type FxRow = {
  id: number;
  ticker: string;
  last_price: string;
  bid: string;
  ask: string;
  created_by: string;
  created_time: string;
  updated_by: string;
  update: string;
};

const columns = [
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  numberColumn({ field: "last_price", header: "Last Price", minWidth: 100, decimals: 4 }),
  numberColumn({ field: "bid", header: "Bid", minWidth: 80, decimals: 4 }),
  numberColumn({ field: "ask", header: "Ask", minWidth: 80, decimals: 4 }),
  textColumn({ field: "created_by", header: "Created by", minWidth: 100 }),
  textColumn({ field: "created_time", header: "Created Time", minWidth: 120 }),
  textColumn({ field: "updated_by", header: "Updated by", minWidth: 100 }),
  textColumn({ field: "update", header: "Update", minWidth: 120 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function FxDataPage() {
  const router = useRouter();
  const [rows, setRows] = useState<FxRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await marketDataGetFxData({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load FX data.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as FxRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<FxRow>
      gridId="fx_data_grid"
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
      autoRefreshIntervalMs={2_000}
      rowIdKey="ticker"
      emptyMessage="No FX rates available."
      searchPlaceholder="Search FX pairs…"
    />
  );
}
