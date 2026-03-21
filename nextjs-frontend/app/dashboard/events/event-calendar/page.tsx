"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "date", header: "Date" },
  { key: "ticker", header: "Ticker" },
  { key: "company_name", header: "Company" },
  { key: "event_type", header: "Event" },
  { key: "details", header: "Details" },
];

const mockData = [
  { id: 1, date: "2026-03-25", ticker: "AAPL", company_name: "Apple Inc.", event_type: "Earnings", details: "Q1 2026 Results" },
  { id: 2, date: "2026-03-28", ticker: "MSFT", company_name: "Microsoft Corp.", event_type: "Earnings", details: "Q3 FY2026 Results" },
  { id: 3, date: "2026-04-01", ticker: "7203.T", company_name: "Toyota Motor", event_type: "Dividend", details: "Ex-dividend date" },
  { id: 4, date: "2026-04-15", ticker: "9984.T", company_name: "SoftBank Group", event_type: "AGM", details: "Annual General Meeting" },
];

export default function EventCalendarPage() {
  return <DataTable columns={columns} data={mockData} />;
}
