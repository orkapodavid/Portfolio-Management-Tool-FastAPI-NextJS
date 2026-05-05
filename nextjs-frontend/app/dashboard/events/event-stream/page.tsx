"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { eventsGetEventStream } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

type EventStreamRow = {
  id: number;
  symbol: string;
  record_date: string;
  event_date: string;
  day_of_week: string;
  event_type: string;
  subject: string;
  notes: string;
  alerted: string;
  recur: string;
  created_by: string;
  created_time: string;
  updated_by: string;
  updated_time: string;
};

const columns = [
  textColumn({ field: "symbol", header: "Symbol", pinned: "left", minWidth: 100 }),
  dateColumn({ field: "record_date", header: "Record Date", minWidth: 110 }),
  dateColumn({ field: "event_date", header: "Event Date", minWidth: 110 }),
  textColumn({ field: "day_of_week", header: "Day", minWidth: 80 }),
  textColumn({ field: "event_type", header: "Event Type", minWidth: 110 }),
  textColumn({ field: "subject", header: "Subject", minWidth: 150 }),
  textColumn({ field: "notes", header: "Notes", minWidth: 150 }),
  textColumn({ field: "alerted", header: "Alerted", minWidth: 90 }),
  textColumn({ field: "recur", header: "Recur", minWidth: 90 }),
  textColumn({ field: "created_by", header: "Created By", minWidth: 100 }),
  textColumn({ field: "created_time", header: "Created Time", minWidth: 130 }),
  textColumn({ field: "updated_by", header: "Updated By", minWidth: 100 }),
  textColumn({ field: "updated_time", header: "Updated Time", minWidth: 130 }),
];

const getStatus = (e: unknown): number | undefined => {
  if (typeof e !== "object" || e === null || !("response" in e)) return undefined;
  return (e as { response?: { status?: number } }).response?.status;
};

export default function EventStreamPage() {
  const router = useRouter();
  const [rows, setRows] = useState<EventStreamRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await eventsGetEventStream({
      headers: { Authorization: `Bearer ${token}` },
    });
    const error = getApiError(response);
    if (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403) {
        router.replace("/login");
        return;
      }
      setErrorMessage("Failed to load event stream.");
      setIsLoading(false);
      return;
    }
    setRows((getApiData(response) as EventStreamRow[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataGrid<EventStreamRow>
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      emptyMessage="No event stream entries available."
      searchPlaceholder="Search event stream…"
    />
  );
}
