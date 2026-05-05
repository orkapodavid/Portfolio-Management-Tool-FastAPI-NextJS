"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { positionsGetPositions } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import {
  currencyColumn,
  dateColumn,
  textColumn,
} from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type PositionRow = {
  id: number;
  trade_date: string;
  deal_num: string;
  detail_id: string;
  underlying: string;
  ticker: string;
  company_name: string;
  sec_id: string;
  sec_type: string;
  subtype: string | null;
  currency: string;
  account_id: string;
  pos_loc: string;
  notional: string;
  position: string;
  market_value: string;
};

const columns = [
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  dateColumn({ field: "trade_date", header: "Trade Date", minWidth: 100 }),
  textColumn({ field: "deal_num", header: "Deal Num", minWidth: 90 }),
  textColumn({ field: "detail_id", header: "Detail ID", minWidth: 90 }),
  textColumn({ field: "underlying", header: "Underlying", minWidth: 100 }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  textColumn({ field: "account_id", header: "Account ID", minWidth: 100 }),
  textColumn({ field: "pos_loc", header: "Pos Loc", minWidth: 80 }),
  currencyColumn({ field: "notional", header: "Notional", minWidth: 120 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function PositionsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<PositionRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await positionsGetPositions({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load positions.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as PositionRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<PositionRow>
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      emptyMessage="No positions available."
      searchPlaceholder="Search positions…"
    />
  );
}
