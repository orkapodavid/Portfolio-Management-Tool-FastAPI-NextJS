"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "ticker", header: "Ticker" },
  { key: "company_name", header: "Company" },
  { key: "sec_type", header: "Type" },
  { key: "currency", header: "CCY" },
  { key: "position", header: "Position", align: "right" as const },
  { key: "market_value", header: "Mkt Value", align: "right" as const },
  { key: "notional", header: "Notional", align: "right" as const },
  { key: "account_id", header: "Account" },
  { key: "pos_loc", header: "Location" },
];

const mockData = [
  { id: 1, ticker: "7203.T", company_name: "Toyota Motor", sec_type: "Equity", currency: "JPY", position: "50,000", market_value: "$12,345,678", notional: "$12,500,000", account_id: "ACC001", pos_loc: "TKY" },
  { id: 2, ticker: "6758.T", company_name: "Sony Group", sec_type: "Equity", currency: "JPY", position: "30,000", market_value: "$8,765,432", notional: "$9,000,000", account_id: "ACC001", pos_loc: "TKY" },
  { id: 3, ticker: "9984.T", company_name: "SoftBank Group", sec_type: "Warrant", currency: "JPY", position: "100,000", market_value: "$5,432,100", notional: "$5,500,000", account_id: "ACC002", pos_loc: "TKY" },
  { id: 4, ticker: "AAPL", company_name: "Apple Inc.", sec_type: "Equity", currency: "USD", position: "25,000", market_value: "$4,562,500", notional: "$4,600,000", account_id: "ACC001", pos_loc: "NYC" },
  { id: 5, ticker: "HSBA.L", company_name: "HSBC Holdings", sec_type: "Bond", currency: "GBP", position: "10,000", market_value: "$7,456,000", notional: "$7,500,000", account_id: "ACC003", pos_loc: "LDN" },
  { id: 6, ticker: "NVDA", company_name: "NVIDIA Corp.", sec_type: "Equity", currency: "USD", position: "15,000", market_value: "$13,131,000", notional: "$13,200,000", account_id: "ACC001", pos_loc: "NYC" },
];

export default function PositionsPage() {
  return <DataTable columns={columns} data={mockData} />;
}
