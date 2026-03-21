"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "ticker", header: "Ticker" },
  { key: "company_name", header: "Company" },
  { key: "currency", header: "CCY" },
  { key: "position", header: "Position", align: "right" as const },
  { key: "market_value", header: "Mkt Value", align: "right" as const },
  { key: "notional", header: "Notional", align: "right" as const },
  { key: "account_id", header: "Account" },
];

const mockData = [
  { id: 1, ticker: "9984.T WRT", company_name: "SoftBank Group", currency: "JPY", position: "100,000", market_value: "$5,432,100", notional: "$5,500,000", account_id: "ACC002" },
  { id: 2, ticker: "7974.T WRT", company_name: "Nintendo", currency: "JPY", position: "50,000", market_value: "$3,210,000", notional: "$3,300,000", account_id: "ACC002" },
];

export default function WarrantPositionPage() {
  return <DataTable columns={columns} data={mockData} />;
}
