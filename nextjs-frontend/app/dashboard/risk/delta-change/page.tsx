"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { riskGetDeltaChange } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { SingleDateFilterBar } from "@/components/grid/filter-bar";
import { textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { deltaChangeSimulator } from "@/lib/grid-simulators/risk";
import { getApiData, getApiError } from "@/lib/utils";

type DeltaChangeRow = {
  id: number;
  ticker: string;
  company_name: string;
  sec_type: string;
  currency: string;
  fx_rate: string;
  spot_price: string;
  valuation_price: string;
  pos_delta: string | null;
  pos_gamma: string | null;
};

const columns = [
  textColumn({
    field: "ticker",
    header: "Ticker",
    pinned: "left",
    minWidth: 100,
  }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  textColumn({ field: "sec_type", header: "Structure", minWidth: 100 }),
  textColumn({ field: "currency", header: "Currency", minWidth: 90 }),
  textColumn({
    field: "fx_rate",
    header: "FX Rate",
    minWidth: 90,
    align: "right",
  }),
  textColumn({
    field: "spot_price",
    header: "Current Price",
    minWidth: 110,
    align: "right",
  }),
  textColumn({
    field: "valuation_price",
    header: "Valuation Price",
    minWidth: 120,
    align: "right",
  }),
  textColumn({
    field: "pos_delta",
    header: "POS DELTA",
    minWidth: 100,
    align: "right",
  }),
  textColumn({
    field: "pos_gamma",
    header: "Pos Gamma",
    minWidth: 100,
    align: "right",
  }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e))
    return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function DeltaChangePage() {
  const router = useRouter();
  const [rows, setRows] = useState<DeltaChangeRow[]>([]);
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
      const response = await riskGetDeltaChange({
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
        setErrorMessage("Failed to load delta change.");
        setIsLoading(false);
        return;
      }
      setRows((getApiData(response) as DeltaChangeRow[]) ?? []);
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
    <DataGrid<DeltaChangeRow>
      gridId="delta_change_grid"
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
      simulateUpdate={deltaChangeSimulator}
      emptyMessage="No delta change data available."
      searchPlaceholder="Search delta change…"
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
