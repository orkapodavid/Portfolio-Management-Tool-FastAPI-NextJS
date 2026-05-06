"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { eventsGetEventCalendar } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { DateRangeFilterBar } from "@/components/grid/filter-bar";
import { dateColumn, textColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { eventCalendarSimulator } from "@/lib/grid-simulators/events";
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

type DateRange = { start: string; end: string };
const EMPTY_RANGE: DateRange = { start: "", end: "" };

export default function EventCalendarPage() {
  const router = useRouter();
  const [rows, setRows] = useState<EventCalendarRow[]>([]);
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
      const response = await eventsGetEventCalendar({
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
        setErrorMessage("Failed to load event calendar.");
        setIsLoading(false);
        return;
      }
      setRows((getApiData(response) as EventCalendarRow[]) ?? []);
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
    <DataGrid<EventCalendarRow>
      gridId="event_calendar_grid"
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
      simulateUpdate={eventCalendarSimulator}
      emptyMessage="No event calendar entries available."
      searchPlaceholder="Search events…"
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
