"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { pnlGetPnlByCurrency } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { SingleDateFilterBar } from "@/components/grid/filter-bar";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { pnlCurrencySimulator } from "@/lib/grid-simulators/pnl";
import { getApiData, getApiError } from "@/lib/utils";

type PnlCurrencyRow = {
  trade_date: string;
  currency: string;
  fx_rate: string;
  fx_rate_t_1: string;
  fx_rate_change: string;
  ccy_exposure: string;
  usd_exposure: string;
  pos_ccy_expo: string;
  ccy_hedged_pnl: string;
  pos_ccy_pnl: string;
  net_ccy: string;
  pos_c_truncated: string;
};

const columns = [
  dateColumn({ field: "trade_date", header: "Trade Date", minWidth: 100 }),
  textColumn({ field: "currency", header: "Currency", pinned: "left", minWidth: 90 }),
  textColumn({ field: "fx_rate", header: "FX Rate", minWidth: 90, align: "right" }),
  textColumn({ field: "fx_rate_t_1", header: "FX Rate (T-1)", minWidth: 110, align: "right" }),
  textColumn({ field: "fx_rate_change", header: "FX Rate Change", minWidth: 120, align: "right" }),
  textColumn({ field: "ccy_exposure", header: "CCY Exposure", minWidth: 110, align: "right" }),
  textColumn({ field: "usd_exposure", header: "USD Exposure", minWidth: 110, align: "right" }),
  textColumn({ field: "pos_ccy_expo", header: "POS CCY Expo", minWidth: 110, align: "right" }),
  textColumn({ field: "ccy_hedged_pnl", header: "CCY Hedged PnL", minWidth: 120, align: "right" }),
  textColumn({ field: "pos_ccy_pnl", header: "POS CCY PnL", minWidth: 110, align: "right" }),
  textColumn({ field: "net_ccy", header: "Net CC", minWidth: 90, align: "right" }),
  textColumn({ field: "pos_c_truncated", header: "POS C (truncated)", minWidth: 130, align: "right" }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function PnlCurrencyPage() {
  const router = useRouter();
  const [rows, setRows] = useState<PnlCurrencyRow[]>([]);
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
      const response = await pnlGetPnlByCurrency({
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
        setErrorMessage("Failed to load P&L by currency.");
        setIsLoading(false);
        return;
      }
      setRows((getApiData(response) as PnlCurrencyRow[]) ?? []);
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
    <DataGrid<PnlCurrencyRow>
      gridId="pnl_currency_grid"
      rowIdKey="currency"
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
      simulateUpdate={pnlCurrencySimulator}
      emptyMessage="No currency P&L entries available."
      searchPlaceholder="Search P&L by currency…"
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
