"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { positionsGetWarrantPositions } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type WarrantPositionRow = {
  id: number;
  ticker: string;
  trade_date: string;
  deal_num: string;
  detail_id: string;
  underlying: string;
  company_name: string;
  sec_id: string;
  sec_type: string;
  subtype: string;
  currency: string;
  account_id: string;
};

const columns = [
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  dateColumn({ field: "trade_date", header: "Trade Date", minWidth: 100 }),
  textColumn({ field: "deal_num", header: "Deal Num", minWidth: 90 }),
  textColumn({ field: "detail_id", header: "Detail ID", minWidth: 90 }),
  textColumn({ field: "underlying", header: "Underlying", minWidth: 100 }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  textColumn({ field: "sec_id", header: "SecID", minWidth: 90 }),
  textColumn({ field: "sec_type", header: "Sec Type", minWidth: 90 }),
  textColumn({ field: "subtype", header: "Subtype", minWidth: 90 }),
  textColumn({ field: "currency", header: "Currency", minWidth: 90 }),
  textColumn({ field: "account_id", header: "Account ID", minWidth: 100 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function WarrantPositionPage() {
  const router = useRouter();
  const [rows, setRows] = useState<WarrantPositionRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await positionsGetWarrantPositions({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load warrant positions.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as WarrantPositionRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<WarrantPositionRow>
      gridId="warrant_position_grid"
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
      emptyMessage="No warrant positions available."
      searchPlaceholder="Search warrants…"
    />
  );
}
