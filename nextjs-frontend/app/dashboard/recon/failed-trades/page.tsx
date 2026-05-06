"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { reconciliationGetFailedTrades } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type FailedTradeRow = {
  id: number;
  ticker: string;
  report_date: string;
  trade_date: string;
  value_date: string;
  settlement_date: string;
  portfolio_code: string;
  instrument_ref: string;
  instrument_name: string;
  company_name: string;
  isin: string;
  sedol: string;
  broker: string;
  glass_reference: string;
  trade_reference: string;
  deal_type: string;
  q: string;
};

const columns = [
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  dateColumn({ field: "report_date", header: "Report Date", minWidth: 100 }),
  dateColumn({ field: "trade_date", header: "Trade Date", minWidth: 100 }),
  dateColumn({ field: "value_date", header: "Value Date", minWidth: 100 }),
  dateColumn({ field: "settlement_date", header: "Settlement Date", minWidth: 110 }),
  textColumn({ field: "portfolio_code", header: "Portfolio Code", minWidth: 110 }),
  textColumn({ field: "instrument_ref", header: "Instrument Ref", minWidth: 110 }),
  textColumn({ field: "instrument_name", header: "Instrument Name", minWidth: 130 }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  textColumn({ field: "isin", header: "ISIN", minWidth: 110 }),
  textColumn({ field: "sedol", header: "SEDOL", minWidth: 90 }),
  textColumn({ field: "broker", header: "Broker", minWidth: 100 }),
  textColumn({ field: "glass_reference", header: "Glass Reference", minWidth: 120 }),
  textColumn({ field: "trade_reference", header: "Trade Reference", minWidth: 120 }),
  textColumn({ field: "deal_type", header: "Deal Type", minWidth: 90 }),
  textColumn({ field: "q", header: "Q", minWidth: 60, align: "right" }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function FailedTradesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<FailedTradeRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await reconciliationGetFailedTrades({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load failed trades.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as FailedTradeRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<FailedTradeRow>
      gridId="failed_trades_grid"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      emptyMessage="No failed trades available."
      searchPlaceholder="Search failed trades…"
    />
  );
}
