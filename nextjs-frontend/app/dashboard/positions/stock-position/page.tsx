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
  { id: 1, ticker: "7203.T", company_name: "Toyota Motor", currency: "JPY", position: "50,000", market_value: "$12,345,678", notional: "$12,500,000", account_id: "ACC001" },
  { id: 2, ticker: "6758.T", company_name: "Sony Group", currency: "JPY", position: "30,000", market_value: "$8,765,432", notional: "$9,000,000", account_id: "ACC001" },
  { id: 3, ticker: "AAPL", company_name: "Apple Inc.", currency: "USD", position: "25,000", market_value: "$4,562,500", notional: "$4,600,000", account_id: "ACC001" },
  { id: 4, ticker: "NVDA", company_name: "NVIDIA Corp.", currency: "USD", position: "15,000", market_value: "$13,131,000", notional: "$13,200,000", account_id: "ACC001" },
];

export default function StockPositionPage() {
  return <DataTable columns={columns} data={mockData} />;
}
