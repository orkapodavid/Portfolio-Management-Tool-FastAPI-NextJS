"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { marketDataGetTradingCalendar } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type CalendarRow = {
  id: number;
  trade_date: string;
  day_of_week: string;
  usa: string;
  hkg: string;
  jpn: string;
  aus: string;
  nzl: string;
  kor: string;
  chn: string;
  twn: string;
  ind: string;
};

const columns = [
  dateColumn({ field: "trade_date", header: "Trade Date", pinned: "left", minWidth: 110 }),
  textColumn({ field: "day_of_week", header: "Day of Week", minWidth: 110 }),
  textColumn({ field: "usa", header: "USA", minWidth: 80, align: "center" }),
  textColumn({ field: "hkg", header: "HKG", minWidth: 80, align: "center" }),
  textColumn({ field: "jpn", header: "JPN", minWidth: 80, align: "center" }),
  textColumn({ field: "aus", header: "AUS", minWidth: 80, align: "center" }),
  textColumn({ field: "nzl", header: "NZL", minWidth: 80, align: "center" }),
  textColumn({ field: "kor", header: "KOR", minWidth: 80, align: "center" }),
  textColumn({ field: "chn", header: "CHN", minWidth: 80, align: "center" }),
  textColumn({ field: "twn", header: "TWN", minWidth: 80, align: "center" }),
  textColumn({ field: "ind", header: "IND", minWidth: 80, align: "center" }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function TradingCalendarPage() {
  const router = useRouter();
  const [rows, setRows] = useState<CalendarRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await marketDataGetTradingCalendar({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load trading calendar.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as CalendarRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<CalendarRow>
      gridId="trading_calendar_grid"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      emptyMessage="No trading calendar entries available."
      searchPlaceholder="Search dates…"
    />
  );
}
