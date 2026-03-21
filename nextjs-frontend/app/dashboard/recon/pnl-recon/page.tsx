"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "underlying", header: "Underlying" },
  { key: "system_pnl", header: "System P&L", align: "right" as const },
  { key: "external_pnl", header: "External P&L", align: "right" as const },
  { key: "difference", header: "Diff", align: "right" as const },
  { key: "status", header: "Status", align: "center" as const },
];

const mockData = [
  { id: 1, underlying: "Toyota Motor", system_pnl: "+$12,345", external_pnl: "+$12,345", difference: "$0", status: "Matched" },
  { id: 2, underlying: "Sony Group", system_pnl: "-$8,765", external_pnl: "-$8,800", difference: "$35", status: "Partial" },
  { id: 3, underlying: "Nintendo", system_pnl: "+$34,567", external_pnl: "+$34,567", difference: "$0", status: "Matched" },
];

export default function PnLReconPage() {
  return <DataTable columns={columns} data={mockData} />;
}
