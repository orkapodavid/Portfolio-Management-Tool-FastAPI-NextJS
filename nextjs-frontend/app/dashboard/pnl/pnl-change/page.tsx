"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { pnlGetPnlChanges } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type PnlChangeRow = {
  id: number;
  trade_date: string;
  underlying: string;
  ticker: string;
  pnl_ytd: string;
  pnl_chg_1d: string;
  pnl_chg_1w: string;
  pnl_chg_1m: string;
  pnl_chg_pct_1d: string;
  pnl_chg_pct_1w: string;
  pnl_chg_pct_1m: string;
};

const columns = [
  dateColumn({ field: "trade_date", header: "Trade Date", minWidth: 100 }),
  textColumn({ field: "underlying", header: "Underlying", minWidth: 100 }),
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  textColumn({ field: "pnl_ytd", header: "PnL YTD", minWidth: 100, align: "right" }),
  textColumn({ field: "pnl_chg_1d", header: "PnL Chg 1D", minWidth: 100, align: "right" }),
  textColumn({ field: "pnl_chg_1w", header: "PnL Chg 1W", minWidth: 100, align: "right" }),
  textColumn({ field: "pnl_chg_1m", header: "PnL Chg 1M", minWidth: 100, align: "right" }),
  textColumn({ field: "pnl_chg_pct_1d", header: "PnL Chg% 1D", minWidth: 100, align: "right" }),
  textColumn({ field: "pnl_chg_pct_1w", header: "PnL Chg% 1W", minWidth: 100, align: "right" }),
  textColumn({ field: "pnl_chg_pct_1m", header: "PnL Chg% 1M", minWidth: 100, align: "right" }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function PnlChangePage() {
  const router = useRouter();
  const [rows, setRows] = useState<PnlChangeRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await pnlGetPnlChanges({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load P&L changes.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as PnlChangeRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<PnlChangeRow>
      gridId="pnl_change_grid"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      emptyMessage="No P&L change data available."
      searchPlaceholder="Search P&L changes…"
    />
  );
}
