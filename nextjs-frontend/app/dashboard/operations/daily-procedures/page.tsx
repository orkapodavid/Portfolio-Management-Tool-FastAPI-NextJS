"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "time", header: "Time" },
  { key: "procedure", header: "Procedure" },
  { key: "owner", header: "Owner" },
  { key: "status", header: "Status", align: "center" as const },
  { key: "notes", header: "Notes" },
];

const mockData = [
  { id: 1, time: "07:00", procedure: "Pre-market data load", owner: "Operations", status: "Completed", notes: "" },
  { id: 2, time: "07:30", procedure: "Position reconciliation", owner: "Operations", status: "Completed", notes: "" },
  { id: 3, time: "08:00", procedure: "Risk limits check", owner: "Risk", status: "Completed", notes: "" },
  { id: 4, time: "08:30", procedure: "Compliance screening", owner: "Compliance", status: "In Progress", notes: "Reviewing new additions" },
  { id: 5, time: "09:00", procedure: "Market open preparation", owner: "Trading", status: "Pending", notes: "" },
  { id: 6, time: "16:30", procedure: "End of day PnL", owner: "Operations", status: "Pending", notes: "" },
  { id: 7, time: "17:00", procedure: "NAV calculation", owner: "Operations", status: "Pending", notes: "" },
];

export default function DailyProceduresPage() {
  return <DataTable columns={columns} data={mockData} />;
}
