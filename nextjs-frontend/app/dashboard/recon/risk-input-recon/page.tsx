"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "underlying", header: "Underlying" },
  { key: "field", header: "Field" },
  { key: "system_value", header: "System", align: "right" as const },
  { key: "external_value", header: "External", align: "right" as const },
  { key: "status", header: "Status", align: "center" as const },
];

const mockData = [
  { id: 1, underlying: "Toyota Motor", field: "Spot Price", system_value: "2,876.50", external_value: "2,876.50", status: "Matched" },
  { id: 2, underlying: "Toyota Motor", field: "FX Rate", system_value: "149.8500", external_value: "149.8500", status: "Matched" },
  { id: 3, underlying: "SoftBank WRT", field: "Implied Vol", system_value: "32.5%", external_value: "33.0%", status: "Unmatched" },
];

export default function RiskInputReconPage() {
  return <DataTable columns={columns} data={mockData} />;
}
