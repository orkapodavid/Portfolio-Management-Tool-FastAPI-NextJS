"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { portfolioToolsGetStockBorrow } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { stockBorrowSimulator } from "@/lib/grid-simulators/portfolio-tools";
import { getApiData, getApiError } from "@/lib/utils";

type StockBorrowRow = {
  id: number;
  trade_date: string;
  ticker: string;
  company_name: string;
  jpm_req: string;
  jpm_firm: string;
  borrow_rate: string;
  bofa_req: string;
  bofa_firm: string;
};

const columns = [
  textColumn({
    field: "ticker",
    header: "Ticker",
    pinned: "left",
    minWidth: 100,
  }),
  dateColumn({ field: "trade_date", header: "Trade Date", minWidth: 100 }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  textColumn({
    field: "jpm_req",
    header: "JPM Request Locate",
    minWidth: 140,
    align: "right",
  }),
  textColumn({ field: "jpm_firm", header: "JPM Firm", minWidth: 100 }),
  textColumn({
    field: "borrow_rate",
    header: "Borrow Rate",
    minWidth: 110,
    align: "right",
  }),
  textColumn({
    field: "bofa_req",
    header: "BofA Request Locate",
    minWidth: 150,
    align: "right",
  }),
  textColumn({ field: "bofa_firm", header: "BofA Firm", minWidth: 100 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e))
    return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function StockBorrowPage() {
  const router = useRouter();
  const [rows, setRows] = useState<StockBorrowRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await portfolioToolsGetStockBorrow({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load stock borrow.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as StockBorrowRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<StockBorrowRow>
      gridId="stock_borrow_grid"
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
      simulateUpdate={stockBorrowSimulator}
      emptyMessage="No stock borrow entries available."
      searchPlaceholder="Search stock borrow…"
    />
  );
}
