"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "ticker", header: "Ticker" },
  { key: "company_name", header: "Company" },
  { key: "reset_date", header: "Reset Date" },
  { key: "reset_type", header: "Type" },
  { key: "notional", header: "Notional", align: "right" as const },
];

const mockData = [
  { id: 1, ticker: "9984.T CB", company_name: "SoftBank Group", reset_date: "2026-04-15", reset_type: "Quarterly", notional: "$5,500,000" },
  { id: 2, ticker: "HSBA.L CB", company_name: "HSBC Holdings", reset_date: "2026-07-01", reset_type: "Semi-Annual", notional: "$7,500,000" },
];

export default function ResetDatesPage() {
  return <DataTable columns={columns} data={mockData} />;
}
