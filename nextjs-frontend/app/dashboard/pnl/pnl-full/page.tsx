"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { pnlGetPnlFull } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { SingleDateFilterBar } from "@/components/grid/filter-bar";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { pnlFullSimulator } from "@/lib/grid-simulators/pnl";
import { getApiData, getApiError } from "@/lib/utils";

type PnlFullRow = {
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

export default function PnlFullPage() {
  const router = useRouter();
  const [rows, setRows] = useState<PnlFullRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [draftDate, setDraftDate] = useState("");
  const [appliedDate, setAppliedDate] = useState("");

  const load = useCallback(
    async (date: string) => {
      setIsLoading(true);
      const token = getAuthToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      const response = await pnlGetPnlFull({
        headers: { Authorization: `Bearer ${token}` },
        query: date ? { trade_date: date } : undefined,
      });
      const error = getApiError(response);
      if (error) {
        const status = getStatus(error);
        if (status === 401 || status === 403) {
          router.replace("/login");
          return;
        }
        setErrorMessage("Failed to load full P&L.");
        setIsLoading(false);
        return;
      }
      setRows((getApiData(response) as PnlFullRow[]) ?? []);
      setErrorMessage(null);
      setIsLoading(false);
    },
    [router]
  );

  useEffect(() => {
    void load("");
  }, [load]);

  const onApply = () => {
    setAppliedDate(draftDate);
    void load(draftDate);
  };

  const onClear = () => {
    setDraftDate("");
    setAppliedDate("");
    void load("");
  };

  return (
    <DataGrid<PnlFullRow>
      gridId="pnl_full_grid"
      rowIdKey="ticker"
      showCompactToggle
      showAutoRefresh
      showRowNumbers
      enableMultiSelect
      enableCellFlash
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={() => load(appliedDate)}
      simulateUpdate={pnlFullSimulator}
      emptyMessage="No P&L data available."
      searchPlaceholder="Search P&L…"
      filterBar={
        <SingleDateFilterBar
          label="Position Date"
          value={draftDate}
          onChange={setDraftDate}
          onApply={onApply}
          onClear={onClear}
          hasActiveFilters={Boolean(appliedDate)}
        />
      }
    />
  );
}
