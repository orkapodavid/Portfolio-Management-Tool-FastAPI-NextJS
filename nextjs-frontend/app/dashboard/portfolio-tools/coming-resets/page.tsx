"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { portfolioToolsGetComingResets } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type ComingResetRow = {
  id: number;
  deal_num: string;
  detail_id: string;
  ticker: string;
  account: string;
  company_name: string;
  announce_date: string;
  closing_date: string;
  cal_days: string;
  biz_days: string;
};

const columns = [
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  textColumn({ field: "deal_num", header: "Deal Num", minWidth: 90 }),
  textColumn({ field: "detail_id", header: "Detail ID", minWidth: 90 }),
  textColumn({ field: "account", header: "Account", minWidth: 120 }),
  textColumn({ field: "company_name", header: "Company Name", minWidth: 150 }),
  dateColumn({ field: "announce_date", header: "Announce Date", minWidth: 110 }),
  dateColumn({ field: "closing_date", header: "Closing Date", minWidth: 110 }),
  textColumn({ field: "cal_days", header: "Cal Days", minWidth: 90, align: "right" }),
  textColumn({ field: "biz_days", header: "Biz Days", minWidth: 90, align: "right" }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function ComingResetsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ComingResetRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await portfolioToolsGetComingResets({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load coming resets.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as ComingResetRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<ComingResetRow>
      gridId="coming_resets_grid"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      emptyMessage="No coming resets available."
      searchPlaceholder="Search coming resets…"
    />
  );
}
