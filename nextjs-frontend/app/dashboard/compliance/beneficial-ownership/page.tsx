"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "ticker", header: "Ticker" },
  { key: "company_name", header: "Company" },
  { key: "ownership_pct", header: "Ownership %", align: "right" as const },
  { key: "threshold", header: "Threshold", align: "right" as const },
  { key: "status", header: "Status", align: "center" as const },
];

const mockData = [
  { id: 1, ticker: "7203.T", company_name: "Toyota Motor", ownership_pct: "2.5%", threshold: "5.0%", status: "Below" },
  { id: 2, ticker: "ABC.T", company_name: "ABC Corp", ownership_pct: "4.8%", threshold: "5.0%", status: "Near Threshold" },
  { id: 3, ticker: "XYZ.HK", company_name: "XYZ Holdings", ownership_pct: "1.2%", threshold: "5.0%", status: "Below" },
];

export default function BeneficialOwnershipPage() {
  return <DataTable columns={columns} data={mockData} />;
}
