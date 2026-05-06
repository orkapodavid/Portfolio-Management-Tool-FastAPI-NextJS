"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { positionsGetTradeSummary } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { DateRangeFilterBar } from "@/components/grid/filter-bar";
import {
  dateColumn,
  numberColumn,
  textColumn,
} from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type TradeSummaryRow = {
  id: number;
  ticker: string;
  deal_num: string;
  detail_id: string;
  underlying: string;
  account_id: string;
  company_name: string;
  sec_id: string;
  sec_type: string;
  subtype: string;
  currency: string;
  closing_date: string;
  divisor: string;
};

const columns = [
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  textColumn({ field: "deal_num", header: "Deal Num", minWidth: 90 }),
  textColumn({ field: "detail_id", header: "Detail ID", minWidth: 90 }),
  textColumn({ field: "underlying", header: "Underlying", minWidth: 100 }),
  textColumn({ field: "account_id", header: "Account ID", minWidth: 100 }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  textColumn({ field: "sec_id", header: "SecID", minWidth: 90 }),
  textColumn({ field: "sec_type", header: "Sec Type", minWidth: 90 }),
  textColumn({ field: "subtype", header: "Subtype", minWidth: 90 }),
  textColumn({ field: "currency", header: "Currency", minWidth: 90 }),
  dateColumn({ field: "closing_date", header: "Closing Date", minWidth: 100 }),
  numberColumn({ field: "divisor", header: "Divisor", minWidth: 80, decimals: 2 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

type DateRange = { start: string; end: string };
const EMPTY_RANGE: DateRange = { start: "", end: "" };

export default function TradeSummaryPage() {
  const router = useRouter();
  const [rows, setRows] = useState<TradeSummaryRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [draftRange, setDraftRange] = useState<DateRange>(EMPTY_RANGE);
  const [appliedRange, setAppliedRange] = useState<DateRange>(EMPTY_RANGE);

  const load = useCallback(
    async (range: DateRange) => {
      setIsLoading(true);
      const token = getAuthToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      const query: { start_date?: string; end_date?: string } = {};
      if (range.start) query.start_date = range.start;
      if (range.end) query.end_date = range.end;
      const response = await positionsGetTradeSummary({
        headers: { Authorization: `Bearer ${token}` },
        query: Object.keys(query).length > 0 ? query : undefined,
      });
      const error = getApiError(response);
      if (error) {
        const status = getStatus(error);
        if (status === 401 || status === 403) {
          router.replace("/login");
          return;
        }
        setErrorMessage("Failed to load trade summary.");
        setIsLoading(false);
        return;
      }
      setRows((getApiData(response) as TradeSummaryRow[]) ?? []);
      setErrorMessage(null);
      setIsLoading(false);
    },
    [router]
  );

  useEffect(() => {
    void load(EMPTY_RANGE);
  }, [load]);

  const onApply = () => {
    setAppliedRange(draftRange);
    void load(draftRange);
  };

  const onClear = () => {
    setDraftRange(EMPTY_RANGE);
    setAppliedRange(EMPTY_RANGE);
    void load(EMPTY_RANGE);
  };

  const hasActive = Boolean(appliedRange.start || appliedRange.end);

  return (
    <DataGrid<TradeSummaryRow>
      gridId="trade_summary_grid"
      showCompactToggle
      showAutoRefresh
      showRowNumbers
      enableMultiSelect
      enableCellFlash
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={() => load(appliedRange)}
      emptyMessage="No trade summary entries available."
      searchPlaceholder="Search trade summary…"
      filterBar={
        <DateRangeFilterBar
          fromValue={draftRange.start}
          toValue={draftRange.end}
          onFromChange={(start) => setDraftRange((prev) => ({ ...prev, start }))}
          onToChange={(end) => setDraftRange((prev) => ({ ...prev, end }))}
          onApply={onApply}
          onClear={onClear}
          hasActiveFilters={hasActive}
        />
      }
    />
  );
}
