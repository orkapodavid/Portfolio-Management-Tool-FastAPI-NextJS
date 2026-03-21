"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "ticker", header: "Ticker" },
  { key: "trade_date", header: "Trade Date" },
  { key: "settlement_date", header: "Settle Date" },
  { key: "amount", header: "Amount", align: "right" as const },
  { key: "reason", header: "Reason" },
  { key: "status", header: "Status", align: "center" as const },
];

const mockData = [
  { id: 1, ticker: "9984.T", trade_date: "2026-03-19", settlement_date: "2026-03-21", amount: "$5,432,100", reason: "Insufficient shares", status: "Failed" },
  { id: 2, ticker: "HSBA.L", trade_date: "2026-03-18", settlement_date: "2026-03-20", amount: "$7,456,000", reason: "Counterparty mismatch", status: "Pending" },
];

export default function FailedTradesPage() {
  return <DataTable columns={columns} data={mockData} />;
}
