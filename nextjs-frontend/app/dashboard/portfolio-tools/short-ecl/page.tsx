"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { portfolioToolsGetShortEcl } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type ShortEclRow = {
  id: number;
  trade_date: string;
  ticker: string;
  company_name: string;
  pos_loc: string;
  account: string;
  short_position: string;
  nosh: string;
  short_ownership: string;
  last_volume: string;
  short_pos_truncated: string;
};

const columns = [
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  dateColumn({ field: "trade_date", header: "Trade Date", minWidth: 100 }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  textColumn({ field: "pos_loc", header: "Pos Loc", minWidth: 80 }),
  textColumn({ field: "account", header: "Account", minWidth: 100 }),
  textColumn({ field: "short_position", header: "Short Position", minWidth: 120, align: "right" }),
  textColumn({ field: "nosh", header: "NOSH", minWidth: 80, align: "right" }),
  textColumn({ field: "short_ownership", header: "Short Ownership", minWidth: 130, align: "right" }),
  textColumn({ field: "last_volume", header: "Last Volume", minWidth: 110, align: "right" }),
  textColumn({ field: "short_pos_truncated", header: "ShortPos/Volume", minWidth: 150, align: "right" }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function ShortEclPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ShortEclRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await portfolioToolsGetShortEcl({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load short ECL.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as ShortEclRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<ShortEclRow>
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      emptyMessage="No short ECL entries available."
      searchPlaceholder="Search short ECL…"
    />
  );
}
