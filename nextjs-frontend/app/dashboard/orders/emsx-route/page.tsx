"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "sequence", header: "Seq#" },
  { key: "ticker", header: "Ticker" },
  { key: "broker", header: "Broker" },
  { key: "route_amount", header: "Route Amt", align: "right" as const },
  { key: "filled_amount", header: "Filled", align: "right" as const },
  { key: "working_amount", header: "Working", align: "right" as const },
  { key: "status", header: "Status", align: "center" as const },
  { key: "last_update", header: "Last Update" },
];

const mockData = [
  { id: 1, sequence: "001-R1", ticker: "7203.T", broker: "MS-DMA", route_amount: "5,000", filled_amount: "5,000", working_amount: "0", status: "Filled", last_update: "14:23:45" },
  { id: 2, sequence: "001-R2", ticker: "7203.T", broker: "MS-ALGO", route_amount: "5,000", filled_amount: "0", working_amount: "5,000", status: "Working", last_update: "14:25:12" },
  { id: 3, sequence: "003-R1", ticker: "NVDA", broker: "JPM-DMA", route_amount: "1,500", filled_amount: "1,500", working_amount: "0", status: "Filled", last_update: "13:45:30" },
  { id: 4, sequence: "003-R2", ticker: "NVDA", broker: "JPM-ALGO", route_amount: "1,500", filled_amount: "0", working_amount: "1,500", status: "Working", last_update: "14:10:00" },
];

export default function EMSXRoutePage() {
  return <DataTable columns={columns} data={mockData} />;
}
