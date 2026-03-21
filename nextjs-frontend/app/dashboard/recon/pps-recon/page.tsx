"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "ticker", header: "Ticker" },
  { key: "company_name", header: "Company" },
  { key: "system_value", header: "System", align: "right" as const },
  { key: "external_value", header: "External", align: "right" as const },
  { key: "difference", header: "Difference", align: "right" as const },
  { key: "status", header: "Status", align: "center" as const },
];

const mockData = [
  { id: 1, ticker: "7203.T", company_name: "Toyota Motor", system_value: "50,000", external_value: "50,000", difference: "0", status: "Matched" },
  { id: 2, ticker: "6758.T", company_name: "Sony Group", system_value: "30,000", external_value: "30,000", difference: "0", status: "Matched" },
  { id: 3, ticker: "9984.T", company_name: "SoftBank Group", system_value: "100,000", external_value: "99,500", difference: "500", status: "Unmatched" },
  { id: 4, ticker: "AAPL", company_name: "Apple Inc.", system_value: "25,000", external_value: "25,000", difference: "0", status: "Matched" },
];

export default function PPSReconPage() {
  return <DataTable columns={columns} data={mockData} />;
}
