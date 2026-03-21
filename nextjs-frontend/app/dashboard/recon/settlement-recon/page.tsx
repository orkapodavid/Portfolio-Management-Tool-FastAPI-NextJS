"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "ticker", header: "Ticker" },
  { key: "settlement_date", header: "Settle Date" },
  { key: "amount", header: "Amount", align: "right" as const },
  { key: "currency", header: "CCY" },
  { key: "status", header: "Status", align: "center" as const },
];

const mockData = [
  { id: 1, ticker: "7203.T", settlement_date: "2026-03-23", amount: "$12,345,678", currency: "JPY", status: "Pending" },
  { id: 2, ticker: "AAPL", settlement_date: "2026-03-23", amount: "$4,562,500", currency: "USD", status: "Matched" },
  { id: 3, ticker: "NVDA", settlement_date: "2026-03-22", amount: "$13,131,000", currency: "USD", status: "Matched" },
];

export default function SettlementReconPage() {
  return <DataTable columns={columns} data={mockData} />;
}
