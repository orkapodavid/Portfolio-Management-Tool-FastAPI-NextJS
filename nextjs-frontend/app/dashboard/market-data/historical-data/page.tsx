"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { marketDataGetHistoricalData } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import {
  HistoricalDataFilterBar,
  buildHistoricalDataQuery,
  createEmptyHistoricalDataFilters,
  getHistoricalTickerOptions,
  hasHistoricalDataFilters,
  type HistoricalDataFilterState,
} from "@/components/grid/historical-data-filter-bar";
import {
  dateColumn,
  numberColumn,
  percentColumn,
  textColumn,
} from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { historicalDataSimulator } from "@/lib/grid-simulators/market-data-historical";
import { getApiData, getApiError } from "@/lib/utils";

type HistoricalRow = {
  id: number;
  trade_date: string;
  ticker: string;
  vwap_price: string;
  last_price: string;
  last_volume: string;
  chg_1d_pct: string;
  created_by: string;
  created_time: string;
  updated_by: string;
  update: string;
};

const columns = [
  dateColumn({
    field: "trade_date",
    header: "Trade Date",
    pinned: "left",
    minWidth: 110,
  }),
  textColumn({ field: "ticker", header: "Ticker", minWidth: 100 }),
  numberColumn({ field: "vwap_price", header: "vWAP Price", minWidth: 100 }),
  numberColumn({ field: "last_price", header: "Last Price", minWidth: 100 }),
  numberColumn({ field: "last_volume", header: "Last Volume", minWidth: 110 }),
  percentColumn({ field: "chg_1d_pct", header: "1D Change %", minWidth: 110 }),
  textColumn({ field: "created_by", header: "Created By", minWidth: 100 }),
  textColumn({ field: "created_time", header: "Created Time", minWidth: 120 }),
  textColumn({ field: "updated_by", header: "Updated By", minWidth: 100 }),
  textColumn({ field: "update", header: "Update", minWidth: 120 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e))
    return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function HistoricalDataPage() {
  const router = useRouter();
  const [rows, setRows] = useState<HistoricalRow[]>([]);
  const [availableTickers, setAvailableTickers] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [draftFilters, setDraftFilters] = useState<HistoricalDataFilterState>(
    createEmptyHistoricalDataFilters,
  );
  const [appliedFilters, setAppliedFilters] =
    useState<HistoricalDataFilterState>(createEmptyHistoricalDataFilters);

  const load = useCallback(
    async (filters: HistoricalDataFilterState) => {
      setIsLoading(true);
      const token = getAuthToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      const response = await marketDataGetHistoricalData({
        headers: { Authorization: `Bearer ${token}` },
        query: buildHistoricalDataQuery(filters),
      });
      const error = getApiError(response);
      if (error) {
        const status = getStatus(error);
        if (status === 401 || status === 403) {
          router.replace("/login");
          return;
        }
        setErrorMessage("Failed to load historical data.");
        setIsLoading(false);
        return;
      }
      const nextRows = (getApiData(response) as HistoricalRow[]) ?? [];
      setRows(nextRows);
      setAvailableTickers((current) =>
        current.length === 0 || !hasHistoricalDataFilters(filters)
          ? getHistoricalTickerOptions(nextRows)
          : current,
      );
      setErrorMessage(null);
      setIsLoading(false);
    },
    [router],
  );

  useEffect(() => {
    void load(createEmptyHistoricalDataFilters());
  }, [load]);

  const onApply = () => {
    setAppliedFilters(draftFilters);
    void load(draftFilters);
  };

  const onClear = () => {
    const emptyFilters = createEmptyHistoricalDataFilters();
    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    void load(emptyFilters);
  };

  const hasActive = hasHistoricalDataFilters(appliedFilters);

  return (
    <DataGrid<HistoricalRow>
      gridId="historical_data_grid"
      showCompactToggle
      showAutoRefresh
      showRowNumbers
      enableMultiSelect
      enableCellFlash
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={() => load(appliedFilters)}
      simulateUpdate={historicalDataSimulator}
      simulateUpdateIntervalMs={5_000}
      emptyMessage="No historical data available."
      searchPlaceholder="Search history…"
      filterBar={
        <HistoricalDataFilterBar
          value={draftFilters}
          availableTickers={availableTickers}
          hasActiveFilters={hasActive}
          onChange={setDraftFilters}
          onApply={onApply}
          onClear={onClear}
        />
      }
    />
  );
}
