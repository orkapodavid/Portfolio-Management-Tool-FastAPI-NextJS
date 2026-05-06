"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { marketDataGetMarketHours } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type MarketHoursRow = {
  id: number;
  market: string;
  ticker: string;
  session: string;
  local_time: string;
  session_period: string;
  is_open: string;
  timezone: string;
};

const columns = [
  textColumn({ field: "market", header: "Market", pinned: "left", minWidth: 100 }),
  textColumn({ field: "ticker", header: "Ticker", minWidth: 100 }),
  textColumn({ field: "session", header: "Session", minWidth: 100 }),
  textColumn({ field: "local_time", header: "Local Time", minWidth: 110 }),
  textColumn({ field: "session_period", header: "Session Period", minWidth: 120 }),
  textColumn({ field: "is_open", header: "Is Open?", minWidth: 100 }),
  textColumn({ field: "timezone", header: "Timezone", minWidth: 100 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function MarketHoursPage() {
  const router = useRouter();
  const [rows, setRows] = useState<MarketHoursRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await marketDataGetMarketHours({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load market hours.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as MarketHoursRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<MarketHoursRow>
      gridId="market_hours_grid"
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
      emptyMessage="No market hours data available."
      searchPlaceholder="Search markets…"
    />
  );
}
