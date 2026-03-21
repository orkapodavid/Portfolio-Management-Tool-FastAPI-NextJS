"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "ticker", header: "Ticker" },
  { key: "company_name", header: "Company" },
  { key: "undertaking_type", header: "Type" },
  { key: "account", header: "Account" },
  { key: "undertaking_expiry", header: "Expiry" },
  { key: "undertaking_details", header: "Details" },
];

const mockData = [
  { id: 1, ticker: "ABC.T", company_name: "ABC Corp", undertaking_type: "Lockup", account: "ACC001", undertaking_expiry: "2026-06-30", undertaking_details: "90-day lockup period" },
  { id: 2, ticker: "GHI.HK", company_name: "GHI Ltd", undertaking_type: "Standstill", account: "ACC002", undertaking_expiry: "2026-12-31", undertaking_details: "Standstill agreement" },
];

export default function UndertakingsPage() {
  return <DataTable columns={columns} data={mockData} />;
}
