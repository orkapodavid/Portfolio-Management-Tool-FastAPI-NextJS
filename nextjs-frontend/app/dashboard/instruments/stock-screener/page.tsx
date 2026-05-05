"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { instrumentsGetStockScreener } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type ScreenerRow = {
  id: number;
  ticker: string;
  dtl10: string;
  company: string;
  country: string;
  industry: string;
  last_price: string;
  mkt_cap_loc: string;
  mkt_cap_usd: string;
  adv_3m: string;
  adv_3m_usd: string;
  locate_qty_mm: string;
  locate_f: string;
};

const columns = [
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  textColumn({ field: "dtl10", header: "DTL10", minWidth: 80, align: "right" }),
  textColumn({ field: "company", header: "Company", minWidth: 150 }),
  textColumn({ field: "country", header: "Country", minWidth: 90 }),
  textColumn({ field: "industry", header: "Industry", minWidth: 100 }),
  textColumn({ field: "last_price", header: "Last Price", minWidth: 100, align: "right" }),
  textColumn({ field: "mkt_cap_loc", header: "Market Cap (MM LOC)", minWidth: 150, align: "right" }),
  textColumn({ field: "mkt_cap_usd", header: "Market Cap (MM USD)", minWidth: 150, align: "right" }),
  textColumn({ field: "adv_3m", header: "ADV 3M", minWidth: 90, align: "right" }),
  textColumn({ field: "adv_3m_usd", header: "$ADV 3M", minWidth: 110, align: "right" }),
  textColumn({ field: "locate_qty_mm", header: "Locate Qty (MM)", minWidth: 120, align: "right" }),
  textColumn({ field: "locate_f", header: "Locate F", minWidth: 90 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function StockScreenerPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ScreenerRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await instrumentsGetStockScreener({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load stock screener.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as ScreenerRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<ScreenerRow>
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      rowIdKey="ticker"
      emptyMessage="No stock screener entries available."
      searchPlaceholder="Search screener…"
    />
  );
}
