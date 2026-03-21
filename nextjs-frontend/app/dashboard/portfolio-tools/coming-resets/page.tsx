"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "ticker", header: "Ticker" },
  { key: "company_name", header: "Company" },
  { key: "reset_date", header: "Reset Date" },
  { key: "days_until", header: "Days Until", align: "right" as const },
  { key: "notional", header: "Notional", align: "right" as const },
];

const mockData = [
  { id: 1, ticker: "9984.T CB", company_name: "SoftBank Group", reset_date: "2026-04-15", days_until: "25", notional: "$5,500,000" },
  { id: 2, ticker: "ABC.T CB", company_name: "ABC Corp", reset_date: "2026-04-30", days_until: "40", notional: "$3,200,000" },
];

export default function ComingResetsPage() {
  return <DataTable columns={columns} data={mockData} />;
}
