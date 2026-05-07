"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { pnlGetPnlSummary } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { SingleDateFilterBar } from "@/components/grid/filter-bar";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { pnlSummarySimulator } from "@/lib/grid-simulators/pnl";
import { getApiData, getApiError } from "@/lib/utils";

type PnlSummaryRow = {
  trade_date: string;
  underlying: string;
  currency: string;
  price: string;
  price_t_1: string;
  price_change: string;
  fx_rate: string;
  fx_rate_t_1: string;
  fx_rate_change: string;
  dtl: string;
  last_volume: string;
  adv_3m: string;
};

const columns = [
  dateColumn({
    field: "trade_date",
    header: "Trade Date",
    minWidth: 100,
    enableRowGroup: true,
  }),
  textColumn({
    field: "underlying",
    header: "Underlying",
    pinned: "left",
    minWidth: 100,
    enableRowGroup: true,
  }),
  textColumn({
    field: "currency",
    header: "Currency",
    minWidth: 90,
    enableRowGroup: true,
  }),
  textColumn({ field: "price", header: "Price", minWidth: 90, align: "right" }),
  textColumn({
    field: "price_t_1",
    header: "Price (T-1)",
    minWidth: 100,
    align: "right",
  }),
  textColumn({
    field: "price_change",
    header: "Price Change",
    minWidth: 110,
    align: "right",
  }),
  textColumn({
    field: "fx_rate",
    header: "FX Rate",
    minWidth: 90,
    align: "right",
  }),
  textColumn({
    field: "fx_rate_t_1",
    header: "FX Rate (T-1)",
    minWidth: 110,
    align: "right",
  }),
  textColumn({
    field: "fx_rate_change",
    header: "FX Rate Change",
    minWidth: 120,
    align: "right",
  }),
  textColumn({ field: "dtl", header: "DTL", minWidth: 80 }),
  textColumn({
    field: "last_volume",
    header: "Last Volume",
    minWidth: 100,
    align: "right",
    enableRowGroup: true,
    aggFunc: "sum",
  }),
  textColumn({
    field: "adv_3m",
    header: "ADV 3M",
    minWidth: 90,
    align: "right",
    enableRowGroup: true,
    aggFunc: "avg",
  }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e))
    return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function PnlSummaryPage() {
  const router = useRouter();
  const [rows, setRows] = useState<PnlSummaryRow[]>([]);
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
      const response = await pnlGetPnlSummary({
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
        setErrorMessage("Failed to load P&L summary.");
        setIsLoading(false);
        return;
      }
      setRows((getApiData(response) as PnlSummaryRow[]) ?? []);
      setErrorMessage(null);
      setIsLoading(false);
    },
    [router],
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
    <DataGrid<PnlSummaryRow>
      gridId="pnl_summary_grid"
      rowIdKey="underlying"
      showCompactToggle
      showAutoRefresh
      showRowGroupPanel
      groupDefaultExpanded={-1}
      showRowNumbers
      enableMultiSelect
      enableCellFlash
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={() => load(appliedDate)}
      simulateUpdate={pnlSummarySimulator}
      emptyMessage="No P&L summary entries available."
      searchPlaceholder="Search P&L summary…"
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
