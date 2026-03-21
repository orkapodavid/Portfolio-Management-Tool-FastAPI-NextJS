"use client";

import { DataTable } from "@/components/layout/data-table";

const columns = [
  { key: "trade_date", header: "Date" },
  { key: "ticker", header: "Ticker" },
  { key: "last_price", header: "Close", align: "right" as const },
  { key: "vwap_price", header: "VWAP", align: "right" as const },
  { key: "last_volume", header: "Volume", align: "right" as const },
  { key: "chg_1d_pct", header: "Chg%", align: "right" as const },
];

const mockData = [
  { id: 1, trade_date: "2026-03-21", ticker: "AAPL", last_price: "182.50", vwap_price: "182.25", last_volume: "54,200,000", chg_1d_pct: "+0.50%" },
  { id: 2, trade_date: "2026-03-20", ticker: "AAPL", last_price: "181.59", vwap_price: "181.30", last_volume: "48,100,000", chg_1d_pct: "+0.32%" },
  { id: 3, trade_date: "2026-03-19", ticker: "AAPL", last_price: "181.01", vwap_price: "180.80", last_volume: "52,300,000", chg_1d_pct: "-0.15%" },
  { id: 4, trade_date: "2026-03-21", ticker: "MSFT", last_price: "415.30", vwap_price: "415.10", last_volume: "32,100,000", chg_1d_pct: "+1.20%" },
  { id: 5, trade_date: "2026-03-20", ticker: "MSFT", last_price: "410.38", vwap_price: "410.20", last_volume: "29,800,000", chg_1d_pct: "+0.85%" },
];

export default function HistoricalDataPage() {
  return <DataTable columns={columns} data={mockData} />;
}
