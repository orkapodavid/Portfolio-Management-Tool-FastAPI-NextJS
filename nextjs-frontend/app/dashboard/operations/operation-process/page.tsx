"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "process_name", header: "Process" },
  { key: "category", header: "Category" },
  { key: "frequency", header: "Frequency" },
  { key: "last_run", header: "Last Run" },
  { key: "next_run", header: "Next Run" },
  { key: "status", header: "Status", align: "center" as const },
];

const mockData = [
  { id: 1, process_name: "Position Data Load", category: "Data", frequency: "Daily", last_run: "2026-03-21 07:00", next_run: "2026-03-22 07:00", status: "Active" },
  { id: 2, process_name: "FX Rate Update", category: "Market Data", frequency: "Hourly", last_run: "2026-03-21 14:00", next_run: "2026-03-21 15:00", status: "Active" },
  { id: 3, process_name: "NAV Calculation", category: "Operations", frequency: "Daily", last_run: "2026-03-20 17:00", next_run: "2026-03-21 17:00", status: "Scheduled" },
  { id: 4, process_name: "Risk Report Generation", category: "Risk", frequency: "Daily", last_run: "2026-03-20 18:00", next_run: "2026-03-21 18:00", status: "Scheduled" },
];

export default function OperationProcessPage() {
  return <DataTable columns={columns} data={mockData} />;
}
