"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "market", header: "Market" },
  { key: "session", header: "Session" },
  { key: "local_time", header: "Local Time" },
  { key: "timezone", header: "TZ" },
  { key: "is_open", header: "Open", align: "center" as const },
];

const mockData = [
  { id: 1, market: "NYSE", session: "Regular", local_time: "09:30-16:00", timezone: "EST", is_open: "Yes" },
  { id: 2, market: "NASDAQ", session: "Regular", local_time: "09:30-16:00", timezone: "EST", is_open: "Yes" },
  { id: 3, market: "TSE", session: "Morning", local_time: "09:00-11:30", timezone: "JST", is_open: "Closed" },
  { id: 4, market: "TSE", session: "Afternoon", local_time: "12:30-15:00", timezone: "JST", is_open: "Closed" },
  { id: 5, market: "HKEX", session: "Morning", local_time: "09:30-12:00", timezone: "HKT", is_open: "Closed" },
  { id: 6, market: "HKEX", session: "Afternoon", local_time: "13:00-16:00", timezone: "HKT", is_open: "Closed" },
  { id: 7, market: "LSE", session: "Regular", local_time: "08:00-16:30", timezone: "GMT", is_open: "Yes" },
];

export default function MarketHoursPage() {
  return <DataTable columns={columns} data={mockData} />;
}
