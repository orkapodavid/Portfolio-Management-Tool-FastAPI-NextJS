"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { positionsGetStockPositions } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { SingleDateFilterBar } from "@/components/grid/filter-bar";
import {
  currencyColumn,
  dateColumn,
  textColumn,
} from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { stockPositionSimulator } from "@/lib/grid-simulators/positions";
import { getApiData, getApiError } from "@/lib/utils";

type StockPositionRow = {
  id: number;
  ticker: string;
  trade_date: string;
  deal_num: string;
  detail_id: string;
  company_name: string;
  sec_id: string;
  sec_type: string;
  currency: string;
  account_id: string;
  pos_loc: string;
  notional: string;
};

const columns = [
  textColumn({
    field: "ticker",
    header: "Ticker",
    pinned: "left",
    minWidth: 100,
  }),
  dateColumn({ field: "trade_date", header: "Trade Date", minWidth: 100 }),
  textColumn({ field: "deal_num", header: "Deal Num", minWidth: 90 }),
  textColumn({ field: "detail_id", header: "Detail ID", minWidth: 90 }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  textColumn({ field: "sec_id", header: "SecID", minWidth: 90 }),
  textColumn({ field: "sec_type", header: "Sec Type", minWidth: 90 }),
  textColumn({ field: "currency", header: "Currency", minWidth: 90 }),
  textColumn({ field: "account_id", header: "Account ID", minWidth: 100 }),
  textColumn({ field: "pos_loc", header: "Pos Loc", minWidth: 130 }),
  currencyColumn({ field: "notional", header: "Notional", minWidth: 100 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e))
    return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function StockPositionPage() {
  const router = useRouter();
  const [rows, setRows] = useState<StockPositionRow[]>([]);
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
      const response = await positionsGetStockPositions({
        headers: { Authorization: `Bearer ${token}` },
        query: date ? { position_date: date } : undefined,
      });
      const error = getApiError(response);
      if (error) {
        const status = getStatus(error);
        if (status === 401 || status === 403) {
          router.replace("/login");
          return;
        }
        setErrorMessage("Failed to load stock positions.");
        setIsLoading(false);
        return;
      }
      setRows((getApiData(response) as StockPositionRow[]) ?? []);
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
    <DataGrid<StockPositionRow>
      gridId="stock_position_grid"
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
      simulateUpdate={stockPositionSimulator}
      emptyMessage="No stock positions available."
      searchPlaceholder="Search stock positions…"
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
