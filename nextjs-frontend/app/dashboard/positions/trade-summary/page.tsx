"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "deal_num", header: "Deal #" },
  { key: "ticker", header: "Ticker" },
  { key: "company_name", header: "Company" },
  { key: "sec_type", header: "Type" },
  { key: "subtype", header: "Subtype" },
  { key: "currency", header: "CCY" },
  { key: "account_id", header: "Account" },
  { key: "closing_date", header: "Close Date" },
];

const mockData = [
  { id: 1, deal_num: "TDEAL001", ticker: "TRD1", company_name: "Trade Co 1", sec_type: "Equity", subtype: "Common", currency: "USD", account_id: "ACC001", closing_date: "2026-01-31" },
  { id: 2, deal_num: "TDEAL002", ticker: "TRD2", company_name: "Trade Co 2", sec_type: "Warrant", subtype: "Call", currency: "USD", account_id: "ACC002", closing_date: "2026-01-31" },
  { id: 3, deal_num: "TDEAL003", ticker: "TRD3", company_name: "Trade Co 3", sec_type: "Bond", subtype: "Corporate", currency: "USD", account_id: "ACC001", closing_date: "2026-01-31" },
];

export default function TradeSummaryPage() {
  return <DataTable columns={columns} data={mockData} />;
}
