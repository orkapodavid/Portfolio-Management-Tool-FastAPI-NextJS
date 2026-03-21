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
  { id: 1, ticker: "HSBA.L CB", company_name: "HSBC Holdings", currency: "GBP", position: "10,000", market_value: "$7,456,000", notional: "$7,500,000", account_id: "ACC003" },
  { id: 2, ticker: "9984.T CB", company_name: "SoftBank Group", currency: "JPY", position: "20,000", market_value: "$4,567,890", notional: "$4,600,000", account_id: "ACC002" },
];

export default function BondPositionsPage() {
  return <DataTable columns={columns} data={mockData} />;
}
