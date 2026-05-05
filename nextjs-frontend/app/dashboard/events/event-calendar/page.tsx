"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { eventsGetEventCalendar } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type EventCalendarRow = {
  id: number;
  underlying: string;
  ticker: string;
  company: string;
  event_date: string;
  day_of_week: string;
  event_type: string;
  time: string;
};

const columns = [
  textColumn({ field: "ticker", header: "Ticker", pinned: "left", minWidth: 100 }),
  textColumn({ field: "underlying", header: "Underlying", minWidth: 100 }),
  textColumn({ field: "company", header: "Company", minWidth: 150 }),
  dateColumn({ field: "event_date", header: "Event Date", minWidth: 110 }),
  textColumn({ field: "day_of_week", header: "Day", minWidth: 80 }),
  textColumn({ field: "event_type", header: "Event Type", minWidth: 110 }),
  textColumn({ field: "time", header: "Time", minWidth: 90 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function EventCalendarPage() {
  const router = useRouter();
  const [rows, setRows] = useState<EventCalendarRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await eventsGetEventCalendar({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load event calendar.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as EventCalendarRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<EventCalendarRow>
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      emptyMessage="No event calendar entries available."
      searchPlaceholder="Search events…"
    />
  );
}
